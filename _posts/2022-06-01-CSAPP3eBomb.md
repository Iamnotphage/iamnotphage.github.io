---
layout: post
title: CS:APP3e Bomb Lab
date: 2022-06-01 11:59:00-0400
description: Personal Crack on CS:APP3e Bomb Lab
tags: c assembly csapp gdb
categories: CSAPP 项目
giscus_comments: true
related_posts: false
toc:
  sidebar: left
---

Macbook使用的M系列芯片是无法使用gdb的，在docker中就算拉取了CentOS(x86)的也不行。

历经千辛万苦，还是只能ssh我本人的windows设备了，然后在windows上用WSL (什么鬼操作，gdb什么时候才会支持ARM架构😨)

以下文本默认你会使用基本的gdb命令.

# Phase 1

首先查看第一阶段的bomb

主要是`callq 401338`这里

调用了`strings_not_equal`函数，如其名，可以猜测，如果传入的两个参数不一样，则返回1，如果一样则返回0.(实际进入分析也是如此)

```nasm
0000000000400ee0 <phase_1>:
  400ee0:	48 83 ec 08          	sub    $0x8,%rsp
  400ee4:	be 00 24 40 00       	mov    $0x402400,%esi
  400ee9:	e8 4a 04 00 00       	callq  401338 <strings_not_equal>
  400eee:	85 c0                	test   %eax,%eax
  400ef0:	74 05                	je     400ef7 <phase_1+0x17>
  400ef2:	e8 43 05 00 00       	callq  40143a <explode_bomb>
  400ef7:	48 83 c4 08          	add    $0x8,%rsp
  400efb:	c3                   	retq
```

那么进一步地分析发现，第2个参数就是这里的`mov $0x402400, %esi`

合理猜测第一个参数`%rdi`是在前面`read_line`读取

`test %eax, %eax`会进行按位与的操作，如果结果是0，将ZF标志位设置1(表示结果**是**0)。而`%eax`寄存器是存储函数的结果(strings_not_equal)所以，当string不一样时，`%eax`返回1，`test`之后ZF=0，je则不跳转，于是爆炸。当string一样时，返回0，ZF=1，je跳转到`0x400ef7`则避免爆炸。

所以`phase_1`的答案就是`%esi`这里存放的地址所指向的内存区域。

```bash
(gdb) b *0x400eee
(gdb) ...随便输入第一个参数，反正断点在爆炸前
(gdb) x/s 0x402400
(gdb) q
```

得到：

```text
Border relations with Canada have never been better.
```

# Phase 2

在phase2中，注意到这一部分调用了`read_six_numbers`:

```nasm
0000000000400efc <phase_2>:
  400efc:	55                   	push   %rbp
  400efd:	53                   	push   %rbx
  400efe:	48 83 ec 28          	sub    $0x28,%rsp
  400f02:	48 89 e6             	mov    %rsp,%rsi
  400f05:	e8 52 05 00 00       	callq  40145c <read_six_numbers>
  400f0a:	83 3c 24 01          	cmpl   $0x1,(%rsp)
  400f0e:	74 20                	je     400f30 <phase_2+0x34>
  400f10:	e8 25 05 00 00       	callq  40143a <explode_bomb>
```

读取完6个数字后，进行了`cmpl`和`je`的组合拳

也就是`%rsp`寄存器里面的地址，指向的内存的内容，和1比较，如果`(%rsp)`是1那么`cmpl`做减法的结果是0，那么ZF = 1，于是`je`将跳转，避免爆炸。

那么`%rsp`的值在哪里变化呢？

进入到`read_six_numbers`分析:

```nasm
000000000040145c <read_six_numbers>:
  40145c:	48 83 ec 18          	sub    $0x18,%rsp
  401460:	48 89 f2             	mov    %rsi,%rdx
  401463:	48 8d 4e 04          	lea    0x4(%rsi),%rcx
  401467:	48 8d 46 14          	lea    0x14(%rsi),%rax
  40146b:	48 89 44 24 08       	mov    %rax,0x8(%rsp)
  401470:	48 8d 46 10          	lea    0x10(%rsi),%rax
  401474:	48 89 04 24          	mov    %rax,(%rsp)
  401478:	4c 8d 4e 0c          	lea    0xc(%rsi),%r9
  40147c:	4c 8d 46 08          	lea    0x8(%rsi),%r8
  401480:	be c3 25 40 00       	mov    $0x4025c3,%esi
  401485:	b8 00 00 00 00       	mov    $0x0,%eax
  40148a:	e8 61 f7 ff ff       	callq  400bf0 <__isoc99_sscanf@plt>
  40148f:	83 f8 05             	cmp    $0x5,%eax
  401492:	7f 05                	jg     401499 <read_six_numbers+0x3d>
  401494:	e8 a1 ff ff ff       	callq  40143a <explode_bomb>
  401499:	48 83 c4 18          	add    $0x18,%rsp
  40149d:	c3                   	retq
```

其他行没看懂，但是似乎不影响，直接看`explode_bomb`附近的内容，很明显在调用`__isoc99_sscanf@plt`之后的结果`%eax`需要和5做比较，如果大于的话就跳过爆炸阶段，明显是对初步输入参数个数的判断，再加上望文生义，很明显答案是6个数字。

可以进一步gdb测试，在`0x40148f`处断点，测试输入不同数目的参数，`%eax`的变化。

```bash
(gdb) b *0x40148f
(gdb) r
(gdb) ...这里输入phase1的答案和phase2的随机数字
(gdb) i r eax
```

经过上述测试，确实是需要输入6个数字(不能输入字符，否则`%eax`并不记录)。

_如果你发现eax此处小于6，那就不要`si`或者`s`等步进操作了，会爆炸的_

那么后续输入过程中一定要谨慎输入参数，避免爆炸。

进一步分析是具体哪6个数字，以及输入的6个数字分别存储在哪？

在`0x400f0a`断点，检查一下寄存器，看看是否有线索

```bash
(gdb) b *0x400f0a
(gdb) r
(gdb) i r
```

谨小慎微的`si`步进(不是`s`，一定要汇编级别的步进，否则可能步进多了会爆炸)

然后`x/d`发现其实输入的6个数是在`%rsp, 4(%rsp), 8(%rsp), ..., 20(%rsp)`所指向的内存里。可以输入`97 98 99 100 101 102`来测试(ASCII的abcdef)

然后一直`si`对照汇编源码，时不时查看寄存器信息，然后查看对应内存的内容`x/d`(或者直接 `print $reg`之类的操作)，很容易发现答案:

```text
1 2 4 8 16 32
```

事实上，在步进调试过程中，能够明显感知到这是一个`for-loop`:

一开始先对输入数字的数目判断，小于6个直接爆炸；

```nasm
  40148a:	e8 61 f7 ff ff       	callq  400bf0 <__isoc99_sscanf@plt>
  40148f:	83 f8 05             	cmp    $0x5,%eax
  401492:	7f 05                	jg     401499 <read_six_numbers+0x3d>
  401494:	e8 a1 ff ff ff       	callq  40143a <explode_bomb>
```

接下来遍历每个参数，第一个参数必须是1，否则直接爆炸；

```nasm
  400f05:	e8 52 05 00 00       	callq  40145c <read_six_numbers>
  400f0a:	83 3c 24 01          	cmpl   $0x1,(%rsp)
  400f0e:	74 20                	je     400f30 <phase_2+0x34>
  400f10:	e8 25 05 00 00       	callq  40143a <explode_bomb>
```

最后就是对每个参数检查(每次增加`%rbx`直到达到`%rbp`)，每次都是上一个数的两倍，否则直接爆炸；这里`%rbp`已经设定为`%rsp + 0x18`为上界了，也就是最多遍历6个数。(0x18 = 24 => 24/4B = 6个数)

```nasm
  400f17:	8b 43 fc             	mov    -0x4(%rbx),%eax
  400f1a:	01 c0                	add    %eax,%eax
  400f1c:	39 03                	cmp    %eax,(%rbx)
  400f1e:	74 05                	je     400f25 <phase_2+0x29>
  400f20:	e8 15 05 00 00       	callq  40143a <explode_bomb>
  400f25:	48 83 c3 04          	add    $0x4,%rbx
  400f29:	48 39 eb             	cmp    %rbp,%rbx
  400f2c:	75 e9                	jne    400f17 <phase_2+0x1b>
  400f2e:	eb 0c                	jmp    400f3c <phase_2+0x40>
  400f30:	48 8d 5c 24 04       	lea    0x4(%rsp),%rbx
  400f35:	48 8d 6c 24 18       	lea    0x18(%rsp),%rbp
  400f3a:	eb db                	jmp    400f17 <phase_2+0x1b>
```

# Phase 3

感觉phase3不如phase2， Dr.Evil老糊涂了。

首先先对所有`explode_bomb`的地方断点:

```bash
(gdb) b *0x400f65
(gdb) b *0x400fad
(gdb) b *0x400fc4
```

然后阅读到这个部分，根据phase2的经验，这里明显需要输入两个数字(`cmp`和`jg`)

```nasm
  400f5b:	e8 90 fc ff ff       	callq  400bf0 <__isoc99_sscanf@plt>
  400f60:	83 f8 01             	cmp    $0x1,%eax
  400f63:	7f 05                	jg     400f6a <phase_3+0x27>
  400f65:	e8 d0 04 00 00       	callq  40143a <explode_bomb>
```

必须要`greater than 0x1`才会跳过爆炸阶段，所以必须是输入两个数字。

然后这里是对第一个数字(`0x8(%rsp)`)与7比较。

```nasm
  400f6a:	83 7c 24 08 07       	cmpl   $0x7,0x8(%rsp)
  400f6f:	77 3c                	ja     400fad <phase_3+0x6a>
  400f71:	8b 44 24 08          	mov    0x8(%rsp),%eax
  400f75:	ff 24 c5 70 24 40 00 	jmpq   *0x402470(,%rax,8)
```

如果`above than 7`直接跳过去`0x400fad`然后爆炸

所以第一个数字一定是小于等于7的。

通过mov指令将第一个数字传给`%eax`后，跳转到 `*(0x402470 + %rax * 8)`的位置，这里`*`同C语言表示取值运算。

那么内存中`(0x402470 + %rax * 8)`的值到底是多少呢？

```bash
(gdb) x/x 0x402470          # %rax = 0
0x402470:       0x00400f7c
(gdb) x/x 0x402478          # %rax = 1 *special one
0x402478:       0x00400fb9
(gdb) x/x 0x402480          # %rax = 2
0x402480:       0x00400f83
(gdb) x/x 0x402488          # %rax = 3
0x402488:       0x00400f8a
(gdb) x/x 0x402490          # %rax = 4
0x402490:       0x00400f91
(gdb) x/x 0x402498          # %rax = 5
0x402498:       0x00400f98
(gdb) x/x 0x4024a0          # %rax = 6
0x4024a0:       0x00400f9f
(gdb) x/x 0x4024a8          # %rax = 7
0x4024a8:       0x00400fa6
```

也就是对应下面代码，不同的 `mov $value, %eax`

```nasm
  400f75:	ff 24 c5 70 24 40 00 	jmpq   *0x402470(,%rax,8)
  400f7c:	b8 cf 00 00 00       	mov    $0xcf,%eax
  400f81:	eb 3b                	jmp    400fbe <phase_3+0x7b>
  400f83:	b8 c3 02 00 00       	mov    $0x2c3,%eax
  400f88:	eb 34                	jmp    400fbe <phase_3+0x7b>
  400f8a:	b8 00 01 00 00       	mov    $0x100,%eax
  400f8f:	eb 2d                	jmp    400fbe <phase_3+0x7b>
  400f91:	b8 85 01 00 00       	mov    $0x185,%eax
  400f96:	eb 26                	jmp    400fbe <phase_3+0x7b>
  400f98:	b8 ce 00 00 00       	mov    $0xce,%eax
  400f9d:	eb 1f                	jmp    400fbe <phase_3+0x7b>
  400f9f:	b8 aa 02 00 00       	mov    $0x2aa,%eax
  400fa4:	eb 18                	jmp    400fbe <phase_3+0x7b>
  400fa6:	b8 47 01 00 00       	mov    $0x147,%eax
  400fab:	eb 11                	jmp    400fbe <phase_3+0x7b>
  400fad:	e8 88 04 00 00       	callq  40143a <explode_bomb>
  400fb2:	b8 00 00 00 00       	mov    $0x0,%eax
  400fb7:	eb 05                	jmp    400fbe <phase_3+0x7b>
  400fb9:	b8 37 01 00 00       	mov    $0x137,%eax
  400fbe:	3b 44 24 0c          	cmp    0xc(%rsp),%eax
  400fc2:	74 05                	je     400fc9 <phase_3+0x86>
  400fc4:	e8 71 04 00 00       	callq  40143a <explode_bomb>
  400fc9:	48 83 c4 18          	add    $0x18,%rsp
  400fcd:	c3                   	retq
```

最后殊途同归在`0x400fbe`检查第二个数(`0xc(%rsp)`)

所以不同的第一个数对应不同的第二个数，答案有多个:

```text
0 207
1 311
2 707
3 256
4 389
5 206
6 682
7 327
```

任选一个即可。

# Phase 4

首先仍然直接断点所有爆炸的行:

```bash
(gdb) b *0x401035
(gdb) b *0x401058
```

Phase4调用了`func4()`，并且在调用之前初始化了三个参数:`edi`,`esi`,`edx`

`edi`: 第一个参数，用户输入的第一个数字，根据`jbe`指令分析容易知道必须小于等于14

`esi`: 第二个参数，为0

`edx`: 第三个参数，为14

```nasm
  40103a:	ba 0e 00 00 00       	mov    $0xe,%edx
  40103f:	be 00 00 00 00       	mov    $0x0,%esi
  401044:	8b 7c 24 08          	mov    0x8(%rsp),%edi
  401048:	e8 81 ff ff ff       	callq  400fce <func4>
  40104d:	85 c0                	test   %eax,%eax
  40104f:	75 07                	jne    401058 <phase_4+0x4c>
  401051:	83 7c 24 0c 00       	cmpl   $0x0,0xc(%rsp)
  401056:	74 05                	je     40105d <phase_4+0x51>
  401058:	e8 dd 03 00 00       	callq  40143a <explode_bomb>
  40105d:	48 83 c4 18          	add    $0x18,%rsp
  401061:	c3                   	retq
```

调用结束后，检查返回值`%eax`，如果返回值为非0的话将会爆炸。所以`func4`的返回值要为0(JNE跳转，当且仅当ZF = 0时，所以TEST的结果要为0，才会将ZF = 1)

那么只能进一步查看`func4`的实现了：

```nasm
0000000000400fce <func4>:
  400fce:	48 83 ec 08          	sub    $0x8,%rsp
  400fd2:	89 d0                	mov    %edx,%eax
  400fd4:	29 f0                	sub    %esi,%eax
  400fd6:	89 c1                	mov    %eax,%ecx
  400fd8:	c1 e9 1f             	shr    $0x1f,%ecx
  400fdb:	01 c8                	add    %ecx,%eax
  400fdd:	d1 f8                	sar    %eax
  400fdf:	8d 0c 30             	lea    (%rax,%rsi,1),%ecx
  400fe2:	39 f9                	cmp    %edi,%ecx
  400fe4:	7e 0c                	jle    400ff2 <func4+0x24>
  400fe6:	8d 51 ff             	lea    -0x1(%rcx),%edx
  400fe9:	e8 e0 ff ff ff       	callq  400fce <func4>
  400fee:	01 c0                	add    %eax,%eax
  400ff0:	eb 15                	jmp    401007 <func4+0x39>
  400ff2:	b8 00 00 00 00       	mov    $0x0,%eax
  400ff7:	39 f9                	cmp    %edi,%ecx
  400ff9:	7d 0c                	jge    401007 <func4+0x39>
  400ffb:	8d 71 01             	lea    0x1(%rcx),%esi
  400ffe:	e8 cb ff ff ff       	callq  400fce <func4>
  401003:	8d 44 00 01          	lea    0x1(%rax,%rax,1),%eax
  401007:	48 83 c4 08          	add    $0x8,%rsp
  40100b:	c3                   	retq
```

发现这是一个递归的函数。

做个草稿简化说明：

| 寄存器 | 变量 |
| ------ | ---- |
| %edi   | x1   |
| %esi   | x2   |
| %edx   | x3   |
| %ecx   | x4   |
| %eax   | t    |

```cpp
int func4(int x1, int x2, int x3) {
    int t = x3 - x2;
    int x4 = t;
    x4 = x4 >> 31;
    t = t + x4;
    t = t >> 1; // arithmetical shift
    x4 = t + x2;

    if (x4 <= x1) {
        t = 0;
        if (x4 >= x1) {
            return 0;
        }
        x2 = x4 + 1;
        func4(x1, x2, x3);
        t = 2 * t + 1;
        return t;
    } else {
        x3 = x4 - 1;
        func4(x1, x2, x3);
        t = 2 * t;
        return t;
    }
}

int main() {
    func4(x1, 0, 14); // 要求返回值非0
}
```

这个分支结构很简单，若想要返回0，最简单的就是只需要`x1 == x4`即可。

首次调用`func4()`的时候，可以通过断点直接查看`x4`(`%ecx`)的值为7.

所以`x1 == 7`就是答案。

那么第二个数也是异常容易推理。

```nasm
  401051:	83 7c 24 0c 00       	cmpl   $0x0,0xc(%rsp)
  401056:	74 05                	je     40105d <phase_4+0x51>
  401058:	e8 dd 03 00 00       	callq  40143a <explode_bomb>
  40105d:	48 83 c4 18          	add    $0x18,%rsp
  401061:	c3                   	retq
```

这里的`cmpl`就是在对比第二个输入和0的关系，很显然第二个答案是0

所以答案是:

```text
7 0
```

# Phase 5

这个阶段，有点类似对输入字符串进行加密。

先对爆炸的地方进行断点，避免误操作爆炸。

同样地，根据下面这个片段，很容易找出输入的格式：6个字符。

```nasm
  40107a:	e8 9c 02 00 00       	callq  40131b <string_length>
  40107f:	83 f8 06             	cmp    $0x6,%eax
  401082:	74 4e                	je     4010d2 <phase_5+0x70>
  401084:	e8 b1 03 00 00       	callq  40143a <explode_bomb>
```

问题就在于是哪六个字符呢？

输入6个字符将会跳转到`0x4010d2`这里对`%eax`清0后再次跳转到这里:

```nasm
  40108b:	0f b6 0c 03          	movzbl (%rbx,%rax,1),%ecx
  40108f:	88 0c 24             	mov    %cl,(%rsp)
  401092:	48 8b 14 24          	mov    (%rsp),%rdx
  401096:	83 e2 0f             	and    $0xf,%edx
  401099:	0f b6 92 b0 24 40 00 	movzbl 0x4024b0(%rdx),%edx
  4010a0:	88 54 04 10          	mov    %dl,0x10(%rsp,%rax,1)
  4010a4:	48 83 c0 01          	add    $0x1,%rax
  4010a8:	48 83 f8 06          	cmp    $0x6,%rax
  4010ac:	75 dd                	jne    40108b <phase_5+0x29>
  4010ae:	c6 44 24 16 00       	movb   $0x0,0x16(%rsp)
  4010b3:	be 5e 24 40 00       	mov    $0x40245e,%esi
  4010b8:	48 8d 7c 24 10       	lea    0x10(%rsp),%rdi
  4010bd:	e8 76 02 00 00       	callq  401338 <strings_not_equal>
  4010c2:	85 c0                	test   %eax,%eax
  4010c4:	74 13                	je     4010d9 <phase_5+0x77>
  4010c6:	e8 6f 03 00 00       	callq  40143a <explode_bomb>
```

通过一步步调试，发现这里其实是一个for-loop

不断增加`%rax`直到为6

那么在`0x4010a4`之前的操作，都是对字符串进行处理:

```nasm
  40108b:	0f b6 0c 03          	movzbl (%rbx,%rax,1),%ecx
  40108f:	88 0c 24             	mov    %cl,(%rsp)
  401092:	48 8b 14 24          	mov    (%rsp),%rdx
  401096:	83 e2 0f             	and    $0xf,%edx
  401099:	0f b6 92 b0 24 40 00 	movzbl 0x4024b0(%rdx),%edx
  4010a0:	88 54 04 10          	mov    %dl,0x10(%rsp,%rax,1)
```

其实也就上述几行代码而已，通过gdb对内存检测，可以推理出以下几个点：

1. 我们输入的字符串存储在 `(%rbx + %rax)`中，`%rax`作为数组索引
2. 内存中存在一片空间(`0x4024b0 + %rdx`，这里`%rdx`作为索引)包含16个字符

那么对上述代码转译，可以作出这样的伪代码草稿:

```python
%rbx + %rax -> %ecx         # 取出第 $rax 个输入的字符
%cl -> (%rsp)               # 将字符存储到 $rsp 指向的内存
(%rsp) -> %rdx              # 将这个字符存到 $rdx
%edx & 0xF -> %edx          # 取这个字符的低4位的bit存到 $edx
(0x4024b0 + %rdx) -> %edx   # 以这4bit作为索引，提取字符，存到 $edx
%dl -> (%rsp + 0x10 + %rax) # 将提取出的字符存到内存 $rsp + 0x10 + $rax中
```

现在很有眉目了，就是不断取输入的字符，然后截取后4位，作为索引，在它规定的内存中找到对应的字符就行。

```bash
(gdb) x/s 0x4024b0
0x4024b0 <array.3449>:  "maduiersnfotvbyl" # 16个字符
# 后面的被我截取了，因为4bit最多就是16个字符
```

也就是说假如我第一个输入的字符是`b`

也就是`0x62`那么截取后变成`0x2`作为索引，我将得到字符`d`

知道变换过程后，需要进一步知道答案，可以查看后续的汇编指令:

```nasm
  4010a4:	48 83 c0 01          	add    $0x1,%rax
  4010a8:	48 83 f8 06          	cmp    $0x6,%rax
  4010ac:	75 dd                	jne    40108b <phase_5+0x29>
  4010ae:	c6 44 24 16 00       	movb   $0x0,0x16(%rsp)
  4010b3:	be 5e 24 40 00       	mov    $0x40245e,%esi
  4010b8:	48 8d 7c 24 10       	lea    0x10(%rsp),%rdi
  4010bd:	e8 76 02 00 00       	callq  401338 <strings_not_equal>
  4010c2:	85 c0                	test   %eax,%eax
  4010c4:	74 13                	je     4010d9 <phase_5+0x77>  # 这里跳转到phase_5函数的末尾
  4010c6:	e8 6f 03 00 00       	callq  40143a <explode_bomb>
```

当for-loop结束时，(`%rsp + 0x10`往后的6个字节已经填充完变换后的字符)，对字符串末尾进行填0的操作(`movb`)

即将调用`strings_not_equal`，调用前初始化了参数`%rdi`和`%rsi`

第一个参数`%rdi`我们很清楚，就是变换后的字符串

根据后续的比较操作，第二个参数`%rsi`就是答案了

检查这部分内存内容就得到变换后的字符串是:

```bash
(gdb) x/s $rsi
0x40245e:       "flyers"
```

那么只需要让输入的字符串截取低4bit后是: 9 15 14 5 6 7即可

那么最容易想到的就是直接从ASCII码表里面选。

| 9   | F   | E   | 5   | 6   | 7   |
| --- | --- | --- | --- | --- | --- |
| i   | o   | n   | e   | f   | g   |
| y   | -   | -   | u   | v   | w   |

ASCII码表设计的问题，大小写均符合上表

于是我挑选

```text
yonefg
```

# Phase 6

最后一个phase确实复杂了一点，但是也不至于做不出来。

老样子先对所有爆炸的指令进行断点，避免误操作。

阅读前面几行汇编一眼扫出需要输入6个数字。

总体来说大致可以分为5个part

首先part1: 其实是个双层for-loop

```nasm
  401114:	4c 89 ed             	mov    %r13,%rbp
  401117:	41 8b 45 00          	mov    0x0(%r13),%eax
  40111b:	83 e8 01             	sub    $0x1,%eax
  40111e:	83 f8 05             	cmp    $0x5,%eax
  401121:	76 05                	jbe    401128 <phase_6+0x34>
  401123:	e8 12 03 00 00       	callq  40143a <explode_bomb>
  401128:	41 83 c4 01          	add    $0x1,%r12d
  40112c:	41 83 fc 06          	cmp    $0x6,%r12d
  401130:	74 21                	je     401153 <phase_6+0x5f>
  401132:	44 89 e3             	mov    %r12d,%ebx
  401135:	48 63 c3             	movslq %ebx,%rax
  401138:	8b 04 84             	mov    (%rsp,%rax,4),%eax
  40113b:	39 45 00             	cmp    %eax,0x0(%rbp)
  40113e:	75 05                	jne    401145 <phase_6+0x51>
  401140:	e8 f5 02 00 00       	callq  40143a <explode_bomb>
  401145:	83 c3 01             	add    $0x1,%ebx
  401148:	83 fb 05             	cmp    $0x5,%ebx
  40114b:	7e e8                	jle    401135 <phase_6+0x41>
  40114d:	49 83 c5 04          	add    $0x4,%r13
  401151:	eb c1                	jmp    401114 <phase_6+0x20>
```

前面到`0x401123`是对输入的数字进行检查，小于等于6就可以避免爆炸(减1意义不明)

并且后续将回到`0x401114`，通过递增`%ebx`实现外层for-loop，其实是对每个数字进行检查。所以输入数字首先要保证:`xi <= 6`

然后进一步，通过递增`%r12`来实现内层for-loop。每次都将`xi`和后续的数字比较，如果有相等的情况，也就是这里`0x401140`，直接爆炸。

所以输入数字的第二个要求是互不相等。

---

那么第一个part分析得出输入数字均小于等于6且互不相等。

继续往下分析part2:

```nasm
  401153:	48 8d 74 24 18       	lea    0x18(%rsp),%rsi
  401158:	4c 89 f0             	mov    %r14,%rax
  40115b:	b9 07 00 00 00       	mov    $0x7,%ecx
  401160:	89 ca                	mov    %ecx,%edx
  401162:	2b 10                	sub    (%rax),%edx
  401164:	89 10                	mov    %edx,(%rax)
  401166:	48 83 c0 04          	add    $0x4,%rax
  40116a:	48 39 f0             	cmp    %rsi,%rax
  40116d:	75 f1                	jne    401160 <phase_6+0x6c>
```

其实非常简单，就是对每个数字进行`7 - xi`的操作

---

接下来看看part3: 这里开始稍微复杂

```nasm
  401174:	eb 21                	jmp    401197 <phase_6+0xa3>
  401176:	48 8b 52 08          	mov    0x8(%rdx),%rdx
  40117a:	83 c0 01             	add    $0x1,%eax
  40117d:	39 c8                	cmp    %ecx,%eax
  40117f:	75 f5                	jne    401176 <phase_6+0x82>
  401181:	eb 05                	jmp    401188 <phase_6+0x94>
  401183:	ba d0 32 60 00       	mov    $0x6032d0,%edx
  401188:	48 89 54 74 20       	mov    %rdx,0x20(%rsp,%rsi,2)
  40118d:	48 83 c6 04          	add    $0x4,%rsi
  401191:	48 83 fe 18          	cmp    $0x18,%rsi
  401195:	74 14                	je     4011ab <phase_6+0xb7>
  401197:	8b 0c 34             	mov    (%rsp,%rsi,1),%ecx
  40119a:	83 f9 01             	cmp    $0x1,%ecx
  40119d:	7e e4                	jle    401183 <phase_6+0x8f>
  40119f:	b8 01 00 00 00       	mov    $0x1,%eax
  4011a4:	ba d0 32 60 00       	mov    $0x6032d0,%edx
  4011a9:	eb cb                	jmp    401176 <phase_6+0x82>
```

通过gdb调试，可以找到对应内存区域中有一条链表:

| node  | address  | value |
| ----- | -------- | ----- |
| node1 | 0x6032d0 | 322   |
| node2 | 0x6032e0 | 168   |
| node3 | 0x6032f0 | 924   |
| node4 | 0x603300 | 691   |
| node5 | 0x603310 | 477   |
| node6 | 0x603320 | 443   |

而每个结点所在地址加上`0x8`就是`next`的值域

这里part3可以进一步细分，可以看到这个小部分：实际上是在查找第`7 - xi`个结点

```nasm
  401176:	48 8b 52 08          	mov    0x8(%rdx),%rdx
  40117a:	83 c0 01             	add    $0x1,%eax
  40117d:	39 c8                	cmp    %ecx,%eax
  40117f:	75 f5                	jne    401176 <phase_6+0x82>
```

然后将找到的结点存储在`$rsp + 2 * $rsi + 0x20` (`$rsi`每次递增0x4)

`mov    %rdx,0x20(%rsp,%rsi,2)`

也就是大概在`0x7fffffffdb40`开始的内存区域，存放了这些node的地址(按照第`7 -xi`的顺序存放)

---

那么看看part4是在做什么

其实也很简单，就是对`$rsp + 0x20`开始的内存，进行构造链表:

```nasm
  4011ab:	48 8b 5c 24 20       	mov    0x20(%rsp),%rbx
  4011b0:	48 8d 44 24 28       	lea    0x28(%rsp),%rax
  4011b5:	48 8d 74 24 50       	lea    0x50(%rsp),%rsi
  4011ba:	48 89 d9             	mov    %rbx,%rcx
  4011bd:	48 8b 10             	mov    (%rax),%rdx
  4011c0:	48 89 51 08          	mov    %rdx,0x8(%rcx)
  4011c4:	48 83 c0 08          	add    $0x8,%rax
  4011c8:	48 39 f0             	cmp    %rsi,%rax
  4011cb:	74 05                	je     4011d2 <phase_6+0xde>
  4011cd:	48 89 d1             	mov    %rdx,%rcx
  4011d0:	eb eb                	jmp    4011bd <phase_6+0xc9>
  4011d2:	48 c7 42 08 00 00 00 	movq   $0x0,0x8(%rdx)
  4011d9:	00
```

这里不断进行`$rdx -> ($rcx + 0x8)`也就是对next值域进行赋值。从而构造按照part3所排序的顺序成链(`7 - xi`的顺序)

---

最后part5就是对链表的顺序进行检测。

很容易发现，要求每个node的value都要大于后一个value的值。

换言之，链表是递减的。

```nasm
  4011da:	bd 05 00 00 00       	mov    $0x5,%ebp
  4011df:	48 8b 43 08          	mov    0x8(%rbx),%rax
  4011e3:	8b 00                	mov    (%rax),%eax
  4011e5:	39 03                	cmp    %eax,(%rbx)
  4011e7:	7d 05                	jge    4011ee <phase_6+0xfa>
  4011e9:	e8 4c 02 00 00       	callq  40143a <explode_bomb>
  4011ee:	48 8b 5b 08          	mov    0x8(%rbx),%rbx
  4011f2:	83 ed 01             	sub    $0x1,%ebp
  4011f5:	75 e8                	jne    4011df <phase_6+0xeb>
```

否则就会爆炸！

按照各个node的值，我们要求链表的顺序应该是这样的:

```text
node: node3 -> node4 -> node5 -> node6 -> node1 -> node2
value: 924 -> 691 -> 477 -> 443 -> 332 -> 168
```

所以`7 - xi`的值应该是:

```text
3 4 5 6 1 2
```

所以最终答案`xi`是:

```text
4 3 2 1 6 5
```

# Summary

gdb确实掌握了不少。

足够有趣，纯粹享受。
