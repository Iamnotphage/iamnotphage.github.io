---
layout: post
title: CS:APP3e Data Lab
date: 2022-05-31 11:59:00-0400
description: Personal Crack on CS:APP3e Data Lab
tags: c csapp bit IEEE float
categories: CSAPP 项目
giscus_comments: true
related_posts: false
toc:
  sidebar: left
---

环境安装好后的第一个lab

位运算实现一些基础函数，加深补码和IEEE浮点数的理解。

确保gcc和make成功安装就行

# Implementation

太简单就不放详细说明了。具体看注释。

```c
/*
 * CS:APP Data Lab
 *
 * <Please put your name and userid here>
 *
 * bits.c - Source file with your solutions to the Lab.
 *          This is the file you will hand in to your instructor.
 *
 * WARNING: Do not include the <stdio.h> header; it confuses the dlc
 * compiler. You can still use printf for debugging without including
 * <stdio.h>, although you might get a compiler warning. In general,
 * it's not good practice to ignore compiler warnings, but in this
 * case it's OK.
 */

#if 0
/*
 * Instructions to Students:
 *
 * STEP 1: Read the following instructions carefully.
 */

You will provide your solution to the Data Lab by
editing the collection of functions in this source file.

INTEGER CODING RULES:

  Replace the "return" statement in each function with one
  or more lines of C code that implements the function. Your code
  must conform to the following style:

  int Funct(arg1, arg2, ...) {
      /* brief description of how your implementation works */
      int var1 = Expr1;
      ...
      int varM = ExprM;

      varJ = ExprJ;
      ...
      varN = ExprN;
      return ExprR;
  }

  Each "Expr" is an expression using ONLY the following:
  1. Integer constants 0 through 255 (0xFF), inclusive. You are
      not allowed to use big constants such as 0xffffffff.
  2. Function arguments and local variables (no global variables).
  3. Unary integer operations ! ~
  4. Binary integer operations & ^ | + << >>

  Some of the problems restrict the set of allowed operators even further.
  Each "Expr" may consist of multiple operators. You are not restricted to
  one operator per line.

  You are expressly forbidden to:
  1. Use any control constructs such as if, do, while, for, switch, etc.
  2. Define or use any macros.
  3. Define any additional functions in this file.
  4. Call any functions.
  5. Use any other operations, such as &&, ||, -, or ?:
  6. Use any form of casting.
  7. Use any data type other than int.  This implies that you
     cannot use arrays, structs, or unions.


  You may assume that your machine:
  1. Uses 2s complement, 32-bit representations of integers.
  2. Performs right shifts arithmetically.
  3. Has unpredictable behavior when shifting if the shift amount
     is less than 0 or greater than 31.


EXAMPLES OF ACCEPTABLE CODING STYLE:
  /*
   * pow2plus1 - returns 2^x + 1, where 0 <= x <= 31
   */
  int pow2plus1(int x) {
     /* exploit ability of shifts to compute powers of 2 */
     return (1 << x) + 1;
  }

  /*
   * pow2plus4 - returns 2^x + 4, where 0 <= x <= 31
   */
  int pow2plus4(int x) {
     /* exploit ability of shifts to compute powers of 2 */
     int result = (1 << x);
     result += 4;
     return result;
  }

FLOATING POINT CODING RULES

For the problems that require you to implement floating-point operations,
the coding rules are less strict.  You are allowed to use looping and
conditional control.  You are allowed to use both ints and unsigneds.
You can use arbitrary integer and unsigned constants. You can use any arithmetic,
logical, or comparison operations on int or unsigned data.

You are expressly forbidden to:
  1. Define or use any macros.
  2. Define any additional functions in this file.
  3. Call any functions.
  4. Use any form of casting.
  5. Use any data type other than int or unsigned.  This means that you
     cannot use arrays, structs, or unions.
  6. Use any floating point data types, operations, or constants.


NOTES:
  1. Use the dlc (data lab checker) compiler (described in the handout) to
     check the legality of your solutions.
  2. Each function has a maximum number of operations (integer, logical,
     or comparison) that you are allowed to use for your implementation
     of the function.  The max operator count is checked by dlc.
     Note that assignment ('=') is not counted; you may use as many of
     these as you want without penalty.
  3. Use the btest test harness to check your functions for correctness.
  4. Use the BDD checker to formally verify your functions
  5. The maximum number of ops for each function is given in the
     header comment for each function. If there are any inconsistencies
     between the maximum ops in the writeup and in this file, consider
     this file the authoritative source.

/*
 * STEP 2: Modify the following functions according the coding rules.
 *
 *   IMPORTANT. TO AVOID GRADING SURPRISES:
 *   1. Use the dlc compiler to check that your solutions conform
 *      to the coding rules.
 *   2. Use the BDD checker to formally verify that your solutions produce
 *      the correct answers.
 */


#endif
//1
/*
 * bitXor - x^y using only ~ and &
 *   Example: bitXor(4, 5) = 1
 *   Legal ops: ~ &
 *   Max ops: 14
 *   Rating: 1
 */
int bitXor(int x, int y) {
  // bitXor：画出真值表，可以由两个与的结果进行或，而或可以利用德摩根律转换
  return ~(x & y) & ~(~x & ~y);
}
/*
 * tmin - return minimum two's complement integer
 *   Legal ops: ! ~ & ^ | + << >>
 *   Max ops: 4
 *   Rating: 1
 */
int tmin(void) {
  // tmin: 1000 0000 0000 0000 0000 0000 0000 0000
  return 0x80 << 24;
}
//2
/*
 * isTmax - returns 1 if x is the maximum, two's complement number,
 *     and 0 otherwise
 *   Legal ops: ! ~ & ^ | +
 *   Max ops: 10
 *   Rating: 1
 */
int isTmax(int x) {
  // isTmax: x如果是tmax, ~x就是tmin, tmin的相反数(~tmin + 1 == tmin)等于本身
  // 所以 判断equals(~(~x) + 1, ~x), 同时排除 x == -1 的情况即可
  // equals可以用同或，同或可以用 !(A ^ B) 来实现
  return !!(~x) & !((~x) ^ (~(~x) + 1));
}
/*
 * allOddBits - return 1 if all odd-numbered bits in word set to 1
 *   where bits are numbered from 0 (least significant) to 31 (most significant)
 *   Examples allOddBits(0xFFFFFFFD) = 0, allOddBits(0xAAAAAAAA) = 1
 *   Legal ops: ! ~ & ^ | + << >>
 *   Max ops: 12
 *   Rating: 2
 */
int allOddBits(int x) {
  // 利用 0xAA 对x的每个8位判断，按位与的结果仍然是0xaa
  // 最后与起来，与0xAA比较是否相等(!(A ^ B))同或
  return !(((0xaa & x) &
         (0xaa & x >> 8) &
         (0xaa & x >> 16) &
         (0xaa & x >> 24)) ^ 0xaa);
}
/*
 * negate - return -x
 *   Example: negate(1) = -1.
 *   Legal ops: ! ~ & ^ | + << >>
 *   Max ops: 5
 *   Rating: 2
 */
int negate(int x) {
  return ~x + 1;
}
//3
/*
 * isAsciiDigit - return 1 if 0x30 <= x <= 0x39 (ASCII codes for characters '0' to '9')
 *   Example: isAsciiDigit(0x35) = 1.
 *            isAsciiDigit(0x3a) = 0.
 *            isAsciiDigit(0x05) = 0.
 *   Legal ops: ! ~ & ^ | + << >>
 *   Max ops: 15
 *   Rating: 3
 */
int isAsciiDigit(int x) {
  // 0x30 <= x <= 0x39 : 也就是x等于 0x0011 0??? 或者 0x0011 100?
  // ?表示0或1，所以只需要截取前面的来判断即可
  // equals(x >> 3, 0x06) | equals(x >> 1, 0x1C)
  return !((x >> 3) ^ 0x06) | !((x >> 1) ^ 0x1c);
}
/*
 * conditional - same as x ? y : z
 *   Example: conditional(2,4,5) = 4
 *   Legal ops: ! ~ & ^ | + << >>
 *   Max ops: 16
 *   Rating: 3
 */
int conditional(int x, int y, int z) {
  // 先将非0的x统一转为1，也就是 !!x 即可
  // !!x是1时，应该构造出 y | 0
  // !!x是0时，应该构造出 0 | z
  // 可以用 A = (!!x - 1) = (!!x + (-1)) = (!!x + (~1 + 1))
  // !!x是1的时候，A = 0，!!x是0的时候，A = -1 = 0xFFFF FFFF
  int condition = !!x + (~1 + 1);
  return (~condition & y) | (condition & z);
}
/*
 * isLessOrEqual - if x <= y  then return 1, else return 0
 *   Example: isLessOrEqual(4,5) = 1.
 *   Legal ops: ! ~ & ^ | + << >>
 *   Max ops: 24
 *   Rating: 3
 */
int isLessOrEqual(int x, int y) {
  // 判断 x <= y, 可以考虑 y - x >= 0
  // 但同时，需要考虑 y + (~x + 1) 的溢出情况
  // 补码加法判断溢出，两种情况：signX = 0 && signY = 1 && signSum = 0
  // 或者 signX = 1 && signY = 0 && signSum = 1 即可
  // (补码加法中，同号相加 获得 异号的和就是溢出了)
  // 其余没有溢出的情况，直接判断 y - x 的符号位就行
  // 最后借助上面的 conditional(x, y, z) 返回答案
  int negativeX = ~x + 1;
  int sum = y + negativeX;
  int signX = x >> 31;
  int signY = y >> 31;
  int signS = sum >> 31;
  int isOverflow = (!(signX ^ signS)) & (signY ^ signS);
  return (isOverflow & signS) | (~isOverflow & !signS);
}
//4
/*
 * logicalNeg - implement the ! operator, using all of
 *              the legal operators except !
 *   Examples: logicalNeg(3) = 0, logicalNeg(0) = 1
 *   Legal ops: ~ & ^ | + << >>
 *   Max ops: 12
 *   Rating: 4
 */
int logicalNeg(int x) {
  // 相当于只有全0才输出1，其余输出0
  // 可以取反后，全1输出1，其余输出0
  // 判断全1，可以利用0xff进行与以及移位操作
  // 如果全1，最后得到的仍然是0xff
  // 最后的res一定是[0, 255]的8bit数，所以0xff + 1 一定"溢出"一位
  // 而 res < 0xff 的情况，res + 1的第8bit一定是0
  int reverseX = ~x;
  int res = (reverseX & 0xff) &
            (reverseX >> 8) &
            (reverseX >> 16) &
            (reverseX >> 24);
  return (res + 1) >> 8;
}
/* howManyBits - return the minimum number of bits required to represent x in
 *             two's complement
 *  Examples: howManyBits(12) = 5
 *            howManyBits(298) = 10
 *            howManyBits(-5) = 4
 *            howManyBits(0)  = 1
 *            howManyBits(-1) = 1
 *            howManyBits(0x80000000) = 32
 *  Legal ops: ! ~ & ^ | + << >>
 *  Max ops: 90
 *  Rating: 4
 */
int howManyBits(int x) {
  // 先对输入的int x判断正负，比如-14 = 0b10010 => 5bit (~x) = 0b01101
  // 而+14 = 0b01110 => 5bit 可以发现负数可以先按位取反转正数判断
  // 对于任意正数，比如298 = 0x0000012a 首个1出现的位置是后面0x12a = 0b 1 0010 1010
  // 需要 9 + 1 = 10bit 所以需要找出首个1的位置，最后答案是该长度加一
  // 32bit二分查找，先查高16位，如果1在其中，再进一步查这16位的高8位......
  // 判断是否存在1很容易,只需要利用 ! 运算 !!x <=> existsOne(x)
  // 如果高16位存在1，说明至少长度是16位，可以先加上16，同时低16位不需要考虑，以此类推
  int sign = x >> 31;
  int absx = (~sign & x) | (sign & ~x);
  int b16, b8, b4, b2, b1, b0;

  // 高16位如果存在1，那么取x的高16位继续判断，否则x不截取
  b16 = !!(absx >> 16) << 4;
  absx = absx >> b16;

  // 高8位如果存在1，那么取x的高8位继续判断，否则x不截取
  b8 = !!(absx >> 8) << 3;
  absx = absx >> b8;

  // 高4位如果存在1，那么取x的高4位继续判断，否则x不截取
  b4 = !!(absx >> 4) << 2;
  absx = absx >> b4;

  // 高2位如果存在1，那么取x的高2位继续判断，否则x不截取
  b2 = !!(absx >> 2) << 1;
  absx = absx >> b2;

  // 此时，应该只剩两位有效位，并且有至少有一位是1
  b1 = !!(absx >> 1);
  absx = absx >> b1;

  b0 = absx;

  return b16 + b8 + b4 + b2 + b1 + b0 + 1;
}
//float
/*
 * floatScale2 - Return bit-level equivalent of expression 2*f for
 *   floating point argument f.
 *   Both the argument and result are passed as unsigned int's, but
 *   they are to be interpreted as the bit-level representation of
 *   single-precision floating point values.
 *   When argument is NaN, return argument
 *   Legal ops: Any integer/unsigned operations incl. ||, &&. also if, while
 *   Max ops: 30
 *   Rating: 4
 */
unsigned floatScale2(unsigned uf) {
  // float: 32bit表示 => sign exp frac => V = (-1)^s * 2^E * M
  // sign 1bit; exp 8bit; frac 23bit;
  // 如果是规格化的数，那么 E = exp - bias, M = 1 + f; 那么乘2相当于 exp + 1 即可
  // 如果是非规格化的数，那么 E = 1 - bias, M = f; 那么乘2相当于 [exp frac] 左移1位
  // 如果是NaN或者infinity, 那么exp == 255则直接返回 uf 即可
  int sign = uf >> 31;
  int exp = (uf & 0x7f800000) >> 23;
  if (!!exp && !!(exp ^ 0xff)) { // Normalized
    exp = exp + 1;
    uf = (uf & 0x807fffff) | (exp << 23);
  } else if (!exp) { // Denormalized
    uf = (uf << 1) | (sign << 31);
  }
  return uf;
}
/*
 * floatFloat2Int - Return bit-level equivalent of expression (int) f
 *   for floating point argument f.
 *   Argument is passed as unsigned int, but
 *   it is to be interpreted as the bit-level representation of a
 *   single-precision floating point value.
 *   Anything out of range (including NaN and infinity) should return
 *   0x80000000u.
 *   Legal ops: Any integer/unsigned operations incl. ||, &&. also if, while
 *   Max ops: 30
 *   Rating: 4
 */
int floatFloat2Int(unsigned uf) {
  // NaN和infinity最容易排除，直接判断exp是否等于0xff即可
  // 其次是规格化的数，exp 属于 (0, 255)
  // V = (-1)^s * M * 2^E
  // E = exp - bias 可以根据E的大小来判断是否out of range
  // E < 0 则截断即可，直接返回0
  // E 属于 [0, 31]则根据符号位返回就行
  // E >= 32 一定是溢出int的范围的，所以直接返回0x80000000u
  // 对于非规格化的数，一定是 E = 1 - bias < 0 所以直接返回0
  int sign = uf >> 31;
  int exp = (uf & 0x7f800000) >> 23;
  int bias = 127;
  if (!(exp ^ 0xff)) return 0x80000000u;

  if (!!exp & !!(exp ^ 0xff)) { // Normalized
    int E = exp - bias;
    if (E < 0) {
      return 0;
    } else if (E >= 0 && E < 32){
      int absRes = 1 << E;
      if (sign) {
        return ~absRes + 1;
      } else {
        return absRes;
      }
    } else {
      return 0x80000000u;
    }
  }

  return 0; // Denormalized
}
/*
 * floatPower2 - Return bit-level equivalent of the expression 2.0^x
 *   (2.0 raised to the power x) for any 32-bit integer x.
 *
 *   The unsigned value that is returned should have the identical bit
 *   representation as the single-precision floating-point number 2.0^x.
 *   If the result is too small to be represented as a denorm, return
 *   0. If too large, return +INF.
 *
 *   Legal ops: Any integer/unsigned operations incl. ||, &&. Also if, while
 *   Max ops: 30
 *   Rating: 4
 */
unsigned floatPower2(int x) {
  int exp;
  if (x >= -126 && x <= 127) {
    exp = x + 127;
    return exp << 23;
  } else if (x < -126) {
    return 0;
  } else {
    return 0x7f800000;
  }
}

```
