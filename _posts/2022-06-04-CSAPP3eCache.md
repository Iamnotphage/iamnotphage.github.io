---
layout: post
title: CS:APP3e Cache Lab
date: 2022-06-04 11:59:00-0400
description: Personal Crack on CS:APP3e Cache Lab
tags: c csapp cache LRU
categories: CSAPP 项目
giscus_comments: true
related_posts: false
toc:
  sidebar: left
---

在开始之前，先确保阅读CS:APPe3的第六章(尤其是`6.2`, `6.3`, `6.4`)

(关于SRAM和DRAM部分的文字和我看过的国内教材神似，很难不怀疑是不是抄袭CSAPP的)

然后就对高速缓存的结构有了新认识: (S, E, B, m)元组表示

先阅读一下`writeup`发现有个内存调试工具`valgrind`

在docker运行的容器里面安装一下必要的内容(根据你的情况决定)

```bash
yum install valgrind
yum install python2  # 后续./driver.py时是python2
```

# Part A

在`writeup`中给出了例子:

```bash
[root@5fd2dc6af315 cache]# ./csim-ref -v -s 4 -E 1 -b 4 -t traces/yi.trace
L 10,1 miss
M 20,1 miss hit
L 22,1 hit
S 18,1 hit
L 110,1 miss eviction
L 210,1 miss eviction
M 12,1 miss eviction hit
hits:4 misses:5 evictions:3
```

我们的程序`csim.c`就是要模拟cache的机制，统计上述的输出信息。

首先来剖析一下这个输入输出

输入参数给定了(S, E, B, m) = (16, 1, 16, 64)

(m = 64bit 假设是64位机器)

所以地址分段应该是这样:

| t   | s   | b   |
| --- | --- | --- |
| 56  | 4   | 4   |

所以这个cache有16组，每组1行，一行的数据块有16个。

第一个操作`L 10,1 miss`因为cache为空，加载地址`0x10`时，第1组第0块没内容，所以miss

miss之后，将内存`0x10`开始的内容加载到cache中

接下来就是`M 20,1 miss hit`此时第二组仍然是空，所以miss，加载地址`0x20`开始的内容到cache中

之后修改，所以hit

后续同理......

---

对于编写`csim.c`有以下要求:

- 开头注释标明姓名和ID
- 不能有任何警告
- 对于任意参数s,E,b都能正确工作
- 忽略`trace`中的所有取指信息(`I`开头的)
- 最后必须调用`printSummary()`统计信息
- 在本实验中，您应假设内存访问已正确对齐，因此单次内存访问绝不会跨越块边界。有了这个假设，你就可以忽略 valgrind 跟踪中的请求大小。

而且eviction要满足LRU

这不就是leetcode的LRU题么

输入来自`valgrind`的trace信息，以及s, E, b参数，模拟cache行为并统计信息

在Part A开始之前，`writeup`有几个建议:

- 可以先在小的trace文件进行debug
- 推荐实现`-v`选项，毕竟方便debug
- 推荐使用`getopt.h`来解析参数(一般shell程序用这个来解析args)
- 每次数据加载 (L) 或存储 (S) 操作最多只能导致一次cache miss。数据修改操作 (M) 被视为加载然后存储到同一地址的操作。因此，一个 M 操作可能会导致两次缓存hits，或一次miss和一次hit加上一次可能的eviction。

解析参数参考一下`getopt()`函数很容易写出

这里重点考虑构造cache的数据结构。

首先是`cacheRow`的数据结构，包含一个`valid bit`和一个`tag` 由于不关注`block`的内容本身，所以`block`可以省略。

```c
int hits = 0;
int misses = 0;
int evictions = 0;

/**
 * @brief This is a cache line, which line has a valid bit, tags and blocks.
 */
struct cacheRow {
    int valid;  /** valid bit */
    int tag;    /** tags */
};

/**
 * @brief The cache.
 */
struct cacheRow* cache = NULL;
```

其次是需要考虑`LRU`算法，如果`E` > 1的话，就要考虑组内eviction

如何手搓`LRU`也是有各种各样的解法，这里采用双向链表:

越靠近`dummyHead`的结点表示越常用，当需要eviction时，一般替换靠近`dummyTail`的结点。(详见leetcode的LRU缓存)

```c
/**
 * @brief A node for constructing a deque.
 */
typedef struct node{
    int offset;
    struct node* prev;
    struct node* next;
}node;

/**
 * @brief A deque, consist of a dummy head and a dummy tail.
 */
typedef struct deque{
    int size;
    int capacity;
    struct node* head;
    struct node* tail;
}deque;

/**
 * @brief For each SET, we have a deque (2^s deques)
 */
deque* deques;

/**
 * @brief Add the node to head of a deque.
 *
 * @param[in] dq deque
 * @param[in] node node
 */
void addToHead(deque* dq, node* node) {
    struct node* head = dq -> head;
    node -> prev = head;
    node -> next = head -> next;
    head -> next -> prev = node;
    head -> next = node;
}

/**
 * @brief Remove a node from its deque.
 *
 * @param[in] node node
 */
void removeNode(node* node) {
    node -> prev -> next = node -> next;
    node -> next -> prev = node -> prev;
}

/**
 * @brief Move a node to its deque's head.
 *
 * @param[in] dq deque
 * @param[in] node node
 */
void moveToHead(deque* dq, node* node) {
    removeNode(node);
    addToHead(dq, node);
}

/**
 * @brief Remove a tail from a deque.
 *
 * @param[in] dq deque
 *
 * @return the tail node
 */
node* removeTail(deque* dq) {
    node* res = dq -> tail -> prev;
    removeNode(res);
    return res;
}
```

顺便实现几个API方便后续LRU调用

那么接下来就考虑`cache`的初始化，需要初始化各个组的deque:

```c
/**
 * @brief Initialize cache
 *
 * @param[in] s set bits
 * @param[in] E lines per line
 */
void initCache(int s, int E) {
    int sets = 1 << s;

    struct cacheRow* cacheLines = (struct cacheRow*)malloc(sizeof(struct cacheRow) * sets * E); // 2^s * E lines of cache

    cache = cacheLines;

    deques = (deque*)malloc(sizeof(deque) * sets);

    for (int i = 0; i < sets; i++) {
        node* dummyHead = (struct node*)malloc(sizeof(node));
        node* dummyTail = (struct node*)malloc(sizeof(node));
        dummyHead -> offset = -1;
        dummyTail -> offset = -1;

        dummyHead->next = dummyTail;
        dummyTail->prev = dummyHead;

        deques[i].head = dummyHead;
        deques[i].tail = dummyTail;
        deques[i].size = 0;
        deques[i].capacity = E;
    }
}
```

对参数的提取就不多说了，利用`getopt`即可。

然后是对`trace`每一行提取关键的信息，比如操作符`op`和`address`(hex format):

```c
/**
 * @brief The vital info about trace: operation and address.
 */
struct traceLine {
    char op;
    int address;
    // int block;
};

/**
 * @brief Parse the trace line to get op and address.
 *
 * @param[in] line a line of trace info
 *
 * @return operation and address
 */
struct traceLine* parseTraces(char* line) {
    if (line[0] != ' ')return NULL;
    char op = line[1]; // 'L' for load, 'M' for modify, 'S' for store
    int address = 0;

    char hexAddr[17];  // 存储十六进制地址，假设地址最多16位
    int i = 3, j = 0;

    // 提取逗号之前的十六进制字符串
    while (line[i] != ',' && line[i] != '\0') {
        hexAddr[j++] = line[i++];
    }
    hexAddr[j] = '\0'; // 确保字符串以 '\0' 结尾

    // 使用 strtol 将十六进制字符串转换为整数
    char* endptr;
    address = (int)strtol(hexAddr, &endptr, 16);

    struct traceLine* res = (struct traceLine*)malloc(sizeof(struct traceLine));
    res -> op = op;
    res -> address = address;
    return res;
}
```

那么最核心的就是模拟`cache`的行为了:

1. 通过`address`的`s`字段获取组号
2. 对该组的每一行检查是否直接`hit` (`valid`且`tag`相同)
3. 如果直接`hit`那么直接返回，如果没有，那么继续
4. 找出空的`cache`行，如果该组内无空行，根据`deque`和LRU算法筛选出一行
5. 对选中的这行进行初始化`valid`和`tag`（加载到`cache`）并将对应的结点加入到`deque`
6. 检查加入到`deque`后是否超出容量(`E`)并修正
7. 需要注意的是如果操作符是`M`则表示`L` + `S`只需要在最后的时候多一次`hit`即可

```c
/**
 * @brief Simulate cache
 *
 * @param[in] line trace info
 * @param[in] s set bits
 * @param[in] E lines per set
 * @param[in] b block bits
 * @param[in] verbose verbose option
 */
void processCache(struct traceLine* line, int s, int E, int b, int verbose) {
    int address = line->address;
    char op = line->op;
    int index = whichSet(address, s, b);
    int tag = address >> (s + b);
    deque* dq = &deques[index];

    struct cacheRow* setStart = cache + index * E;
    struct cacheRow* victimLine = NULL;
    node* victimNode = NULL;

    // Traverse the deque to find if cache hits
    for (node* n = dq->head->next; n != dq->tail; n = n->next) {
        struct cacheRow* cacheLine = setStart + n->offset;
        if (cacheLine->valid && cacheLine->tag == tag) {
            // Cache hit
            if (op == 'L' || op == 'S') {
                hits++;
                if (verbose) printf("hit\n");
            } else if (op == 'M') {
                hits += 2;
                if (verbose) printf("hit hit\n");
            }
            moveToHead(dq, n);
            return;
        }
    }

    // Cache miss: all the nodes in deque miss
    misses++;
    if (verbose && (op == 'L' || op == 'S')) printf("miss ");
    if (verbose && op == 'M') printf("miss hit");

    // Find an empty line or prepare for eviction
    for (int i = 0; i < E; i++) {
        struct cacheRow* cacheLine = setStart + i;
        if (!cacheLine->valid) {
            victimLine = cacheLine;
            victimNode = NULL;
            break;
        }
    }

    // All lines are valid, so evict the LRU line
    if (!victimLine) {
        evictions++;
        if (verbose) printf("eviction");
        victimNode = removeTail(dq);
        victimLine = setStart + victimNode->offset;
        free(victimNode);
    }

    // Update the victim line with new data
    victimLine->valid = 1;
    victimLine->tag = tag;

    // Add new node to head of deque
    node* newNode = (node*)malloc(sizeof(node));
    newNode->offset = victimLine - setStart;
    addToHead(dq, newNode);

    if (dq->size > dq->capacity) {
        removeTail(dq);
        --dq->size;
    }

    // If operation is 'M', the second store operation is a hit
    if (op == 'M') {
        hits++;
    }
    printf("\n");
}
```

最终运行`./test-csim`来检查结果即可:

```text
                        Your simulator     Reference simulator
Points (s,E,b)    Hits  Misses  Evicts    Hits  Misses  Evicts
     3 (1,1,1)       9       8       6       9       8       6  traces/yi2.trace
     3 (4,2,4)       4       5       2       4       5       2  traces/yi.trace
     3 (2,1,4)       2       3       1       2       3       1  traces/dave.trace
     3 (2,1,3)     167      71      67     167      71      67  traces/trans.trace
     3 (2,2,3)     201      37      29     201      37      29  traces/trans.trace
     3 (2,4,3)     212      26      10     212      26      10  traces/trans.trace
     3 (5,1,5)     231       7       0     231       7       0  traces/trans.trace
     6 (5,1,5)  265189   21775   21743  265189   21775   21743  traces/long.trace
    27
```

27分就是满分, 到这里`part A`结束。

要不是之前写过leetcode的LRU缓存，还真不好写这个part的LRU

不过写完之后对`cache`的LRU机制又加深了理解，刀刻般的。

完整代码查看`csim.c`

---

# Part B

首先阅读`writeup`对这个part的描述，需要我们转置矩阵。

这个part的cache是直接映射且总共1KB大小，一行有32Bytes数据块。

换言之,`s = 5, E = 1, b = 5`

可以想象cache应该是一个`32 * 32`的矩阵(如果忽略掉valid和tags的话)

也就是32组，每组一行，一行有32bytes(换言之8个int)

将会对三组尺寸的矩阵进行测试:

1. 32 \* 32
2. 64 \* 64
3. 61 \* 67

并且`writeup`给出了对于矩阵乘法的`blocking`思想，[详见这里](http://csapp.cs.cmu.edu/public/waside/waside-blocking.pdf)

那么很自然地，我们应该也要采用矩阵分块的思想。

比如第一个32*32尺寸的矩阵，由于cache的尺寸是32 * 8个`int`的大小

所以考虑对这个矩阵分为16块，即`4*4`的小块，每个小块表示`8*8`个int类型

每次转置以小块为单位，比如第一次转置，A矩阵的(0, 0)块，从第一行读取

首先造成一次miss，因为cache是空，然后将A的`A[0][0] ~ A[0][7]`加载到cache的一行中。

然后赋值给B矩阵，由于B按列赋值，加载`B[0][0]`，发现miss，因为cache没有加载B矩阵的这一行。

于是cache加载`B[0][0] ~ B[0][7]`到cache到某一行中，然后写回。

紧接着，继续读取`A[0][1]`在cache中，但是`B[1][0]`不在，于是又将`B[1][0] ~ B[1][7]`加载到cache

以此类推，当A矩阵的第一个块的第一行全部赋值给B时，cache中已经有了B整个第一小块(`B[0][0] ~ B[7][7]`)的内容了

此时，我们就要考虑利用cache中这些`B[x][1] ~ B[x][7]`，因为如果是暴力算法，后续的这些列都不会用到，造成浪费。

所以分成16个小块是能够一定程度上减轻misses的，具体是多少misses，就得看实际情况了:

```c
void transpose_submit(int M, int N, int A[N][M], int B[M][N])
{
    for (int i = 0; i < N; i += 8) {
        for (int j = 0; j < M; j += 8) {
            for (int k = i; k < i + 8; k++) {
                for (int s = j; s < j + 8; s++) {
                    B[s][k] = A[k][s];
                }
            }
        }
    }
}
```

然后运行`./test-trans -M 32 -N 32`结果发现misses仍然大于300.

```text
Function 0 (2 total)
Step 1: Validating and generating memory traces
Step 2: Evaluating performance (s=5, E=1, b=5)
func 0 (Transpose submission): hits:1710, misses:343, evictions:311
```

这并不能得到满分。But why?

理论上来说，转置一个一个小块的时候，对于A的一个小块，一行造成一次本行的miss，然后B对于列的8次miss，而后续A这个小块的第二行再一次造成miss，而B的列已经全部加载到cache中，所以一个小块一共造成16次miss，而一共有16个小块。

所以理论上最优的miss应该是`16 * 16 = 256`

但是实际情况是`343`多了`87`次

继续深入思考发现，上面的`256`是一个极端理想的情况，因为cache在这里的大小只有`32 * 8`个int大小

也就是cache的组号从0~31，可能会存在A的一行加载过后，B的组号与这一行冲突，然后后续要用到A的时候又冲突，如此反复。

比如: (方括号中表示二进制数)

- 假设矩阵A的起始地址是 [0 0100 0000 0000] set index字段为 00000
- 假设矩阵B的起始地址是 [1 0100 0000 0000] set index字段为 00000
- 假设仍然分16块，当A的第一个小块的第一行被加载到cache中时
- A[0][0] ~ A[0][7]均被加入到cache的第0行
- 接下来复制给B矩阵，当访问B矩阵的第一块的第一列时
- B[0][0] ~ B[0][7]均被加入到cache的第0行
- 此时发现set index相同但是tag不同，于是miss eviction!
- 然后A[0][1]赋值给B[1][0]找A[0][1]的时候又miss eviction!
- 并且就算是差别很大的两个地址，仍然会有冲突的时候，因为s字段每32个字节加1，也就是每8个int就会加1
- 而最小的尺寸就是32 \* 32，这意味着两个矩阵无论如何都会存在s字段相同的地址

那么很自然的我们可以先存到program stack中，也就是利用程序栈中的某些字段(变量)来存储

这样的话程序避免了在cache中查找这个8个int，如果有上述的冲突话，加载A[0][0]~A[0][7]的时候，已经在程序栈中保存了他们，如果后续B的列读取造成cache冲突的话，就算evict了刚刚加载的这一行，仍然能够进行复制。

```c
void transpose_submit(int M, int N, int A[N][M], int B[M][N])
{
    int a0, a1, a2, a3, a4, a5, a6, a7;
    for (int i = 0; i < N; i += 8) {
        for (int j = 0; j < M; j += 8) {
            for (int k = i; k < i + 8; k++) {
                a0 = A[k][j];
                a1 = A[k][j + 1];
                a2 = A[k][j + 2];
                a3 = A[k][j + 3];
                a4 = A[k][j + 4];
                a5 = A[k][j + 5];
                a6 = A[k][j + 6];
                a7 = A[k][j + 7];

                B[j][k] = a0;
                B[j + 1][k] = a1;
                B[j + 2][k] = a2;
                B[j + 3][k] = a3;
                B[j + 4][k] = a4;
                B[j + 5][k] = a5;
                B[j + 6][k] = a6;
                B[j + 7][k] = a7;
            }
        }
    }
}
```

`./test-trans -M 32 -N 32`发现misses变为287了，满分。

---

对于64 \* 64的尺寸，这里变得有点困难，按照前面的思路并且经过测试misses是绝对会超过阈值的。

如果继续以8 \* 8为小块分块，将会有64块小块。而且因为尺寸变大，这里小块的前四行就会把cache占满(1行A小块7行B列，共4组32行占满)。

难道真的回天乏术了吗？

说实话，卡在这里非常久，在`writeup`中注意到这句话:

> Your transpose function may not modify array A. You may, however, do whatever you want with the contents of array B.

也就是可能需要利用B矩阵在cache中的内容作为一个类似buffer的角色。

对于一个8 _ 8的小块，在内部继续划分成4个小块，一个小块是4 _ 4，记小小块的id为0，1，2，3

对于一个8 \* 8的小块，其转置过程如下:

1. A块0正常转置到B的块0
2. A块1转置暂存到B的块1（正常应该是B的块3）
3. 临时变量暂存B的块1
4. A块3正常转置到B的块1
5. 临时变量赋值给B的块3
6. 最后正常转置A的块3到B的块2

然后对于每个8 \* 8小块都执行上述操作。图片可以参考[这里](https://www.zixiangcode.top/article/csapp-cachelab#0aa5043cbefd40c29de6dcaf4eed542a)的笔记

```c
void transpose_64x64(int M, int N, int A[N][M], int B[M][N])
{
    int a0, a1, a2, a3, a4, a5, a6, a7;
    for (int i = 0; i < N; i += 8) {
        for (int j = 0; j < M; j += 8) {
            // 外两层循环遍历每个8 * 8块

            // step0: 对于每个8*8块，因为4行占满cache，每次读4行
            // step1: 对于小小块，取出0和1块赋值给B
            for (int k = i; k < i + 4; k++) {
                // 取 A 的0和1两块
                a0 = A[k][j + 0];
                a1 = A[k][j + 1];
                a2 = A[k][j + 2];
                a3 = A[k][j + 3];
                a4 = A[k][j + 4];
                a5 = A[k][j + 5];
                a6 = A[k][j + 6];
                a7 = A[k][j + 7];
                // 存到 B 的块0
                B[j + 0][k] = a0;
                B[j + 1][k] = a1;
                B[j + 2][k] = a2;
                B[j + 3][k] = a3;

                // 存到 B 的块1
                B[j + 0][k + 4] = a4;
                B[j + 1][k + 4] = a5;
                B[j + 2][k + 4] = a6;
                B[j + 3][k + 4] = a7;
            }

            // step2: 临时变量存储B的块1 同时A的块3转置到B的块1
            for (int k = j; k < j + 4; k++) {
                // 存下每块 B 中块1，作为本地 buffer
                a0 = B[k][i + 4];
                a1 = B[k][i + 5];
                a2 = B[k][i + 6];
                a3 = B[k][i + 7];
                // A 的块3
                a4 = A[i + 4][k];
                a5 = A[i + 5][k];
                a6 = A[i + 6][k];
                a7 = A[i + 7][k];
                // 正常转置
                B[k][i + 4] = a4;
                B[k][i + 5] = a5;
                B[k][i + 6] = a6;
                B[k][i + 7] = a7;
                // 临时变量转置到B的块2
                B[k + 4][i + 0] = a0;
                B[k + 4][i + 1] = a1;
                B[k + 4][i + 2] = a2;
                B[k + 4][i + 3] = a3;
            }

            // step3: 正常转置最后一个
            for (int k = i + 4; k < i + 8; k++) {
                a4 = A[k][j + 4];
                a5 = A[k][j + 5];
                a6 = A[k][j + 6];
                a7 = A[k][j + 7];
                B[j + 4][k] = a4;
                B[j + 5][k] = a5;
                B[j + 6][k] = a6;
                B[j + 7][k] = a7;
            }
        }
    }
}
```

运行`./test-trans -M 64 -N 64`

```text
Step 1: Validating and generating memory traces
Step 2: Evaluating performance (s=5, E=1, b=5)
func 2 (Transpose 64*64 for 64 blocks): hits:9018, misses:1227, evictions:1195
```

ok，misses < 1300

---

最后是 61 \* 67尺寸的矩阵转置

尝试几次不同的分块暴力转置就行了

对submission的函数搞个if-else来匹配一下就行

然后注册函数

最后运行`python2 ./dirver.py`: (命令取决于你机器的环境)

```text
Part A: Testing cache simulator
Running ./test-csim
                        Your simulator     Reference simulator
Points (s,E,b)    Hits  Misses  Evicts    Hits  Misses  Evicts
     3 (1,1,1)       9       8       6       9       8       6  traces/yi2.trace
     3 (4,2,4)       4       5       2       4       5       2  traces/yi.trace
     3 (2,1,4)       2       3       1       2       3       1  traces/dave.trace
     3 (2,1,3)     167      71      67     167      71      67  traces/trans.trace
     3 (2,2,3)     201      37      29     201      37      29  traces/trans.trace
     3 (2,4,3)     212      26      10     212      26      10  traces/trans.trace
     3 (5,1,5)     231       7       0     231       7       0  traces/trans.trace
     6 (5,1,5)  265189   21775   21743  265189   21775   21743  traces/long.trace
    27


Part B: Testing transpose function
Running ./test-trans -M 32 -N 32
Running ./test-trans -M 64 -N 64
Running ./test-trans -M 61 -N 67

Cache Lab summary:
                        Points   Max pts      Misses
Csim correctness          27.0        27
Trans perf 32x32           8.0         8         287
Trans perf 64x64           8.0         8        1227
Trans perf 61x67          10.0        10        1992
          Total points    53.0        53
```

# 最后

实现cache和LRU的时候比较爽，其次是32x32的时候，比较痛苦的时候是64x64的时候，已经麻木到随便尝试blocking的时候是61x67

总之，对cache复习了一下
