---
layout: post
title: SSH连接远程服务器终极教程
date: 2024-12-05
description: 本文描述了ssh相关知识，ssh远程连接服务器步骤，以及所有坑的解决方案
tags: ssh tutorial
categories: 杂项
giscus_comments: true
related_posts: false
toc:
  sidebar: left
---

记录一下配置和使用ssh遇到的所有坑！

本人测试设备:

- Macbook (Apple Silicon)
- Windows11 笔记本

阅读并理解本文需要的前置知识或技能:

- Linux基础命令(`|`, `grep`等)
- 科学上网
- 清楚知道自己主机登陆账户和密码(Windows上不是PIN码，而是登陆密码!)

# SSH 科普

安全外壳协议（Secure Shell Protocol，简称SSH）是一种加密的网络传输协议，可在不安全的网络中为网络服务提供安全的传输环境。SSH通过在网络中建立安全隧道来实现SSH客户端与服务器之间的连接。SSH最常见的用途是远程登录系统，人们通常利用SSH来传输命令行界面和远程执行命令。

比如你有一台不方便移动的主机，但是算力资源很好，你需要远程操控，那么就可以试试SSH

事实上，很多企业以及实验室都是这么操作的，以及很多云服务器。

因为大部分时候，作为开发者，并不需要太多图形化界面，只需要一个终端。

# SSH教程

下面的教程步骤将基于**Mac SSH Windows**的需求来写。

## Windows SSH Server安装

一般都是用`OpenSSH-Server`

在Windows上安装`OpenSSH-Server`:

安装方式还是挺多的，一个是打开`设置-系统-可选功能`然后查看是否有`OpenSSH`字样。

一般都会有一个`OpenSSH Client`，但是这里Windows是作为服务器

点击`添加功能`，搜索`OpenSSH Server`安装

然后在`服务`中(运行`services.msc`)找到`OpenSSH 服务器`启动选项设置为`自动`

即可。

接下来采用命令行安装，如果前面没问题这里可以跳过。

管理员身份打开`PowerShell`:

```bash
Get-WindowsCapability -Online | Where-Object Name -like 'OpenSSH*'
```

如果返回

```text
 Name  : OpenSSH.Client~~~~0.0.1.0
 State : Installed

 Name  : OpenSSH.Server~~~~0.0.1.0
 State : Installed
```

那就是都安装好了，如果`Server`显示`Not Present`就是没安装`OpenSSH Server`

用下面的命令安装:

```bash
Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0
# 如果客户端也没安装，上面的Server改成Client
```

接下来命令行启动ssh服务并设置相关启动选项和防火墙设置

```bash
# 启动sshd服务
Start-Service sshd

# 设置启动选项
Set-Service -Name sshd -StartupType 'Automatic'

# 防火墙设置
if (!(Get-NetFirewallRule -Name "OpenSSH-Server-In-TCP" -ErrorAction SilentlyContinue | Select-Object Name, Enabled)) {
    Write-Output "Firewall Rule 'OpenSSH-Server-In-TCP' does not exist, creating it..."
    New-NetFirewallRule -Name 'OpenSSH-Server-In-TCP' -DisplayName 'OpenSSH Server (sshd)' -Enabled True -Direction Inbound -Protocol TCP -Action Allow -LocalPort 22
} else {
    Write-Output "Firewall rule 'OpenSSH-Server-In-TCP' has been created and exists."
}
```

---

手动安装的方法略。

## Linux SSH Server安装

```bash
systemctl status sshd # 查看sshd是否安装
apt install openssh-server # 没有的话就apt安装 或者你所常用的包管理工具
systemctl enable sshd --now
systemctl status sshd # 确保安装
```

## SSH Server端配置

接下来配置服务器和客户端。

安装好并启动之后，需要知道几个前置的内容。

在服务器上，有两组文件夹需要注意:

| 特性     | C:\Users\[name]\.ssh\           | C:\ProgramData\ssh          |
| -------- | ------------------------------- | --------------------------- |
| 级别     | 用户级别                        | 系统级别                    |
| 作用范围 | 当前用户的 SSH 配置和密钥管理   | 全局 SSH 服务与主机密钥管理 |
| 配置文件 | config用户自定义 SSH 客户端配置 | sshd_config 服务端配置      |
| 密钥     | 用户的私钥、公钥（如 id_rsa）   | 服务端主机密钥              |
| 使用场景 | 用户发起 SSH 连接时             | SSH 服务端运行和全局配置    |

如果是linux-like的系统，第一个文件夹是`/home/[name]/.ssh`（实际上都是`~/.ssh`）；第二个文件是`/etc/ssh`

这里windows为例子，接下来继续。

目前不太需要配置`sshd_config`文件，后续根据自己需求更改验证方式即可。

## SSH Clinet端配置

在我们的Mac上(也就是这里的客户端)，需要配置一些内容。

这里跳过`ssh-keygen`的过程，如果你有用过github的话，基本上都已经生成过密钥了。

(注意如果你之前在`ssh-keygen`过程中输入过密码的设置，后续你可能需要这个密码)

那么这里就是第一次连接我们的服务器(Windows):

## 局域网SSH

假设我windows的局域网ip是`192.168.0.194`

在mac上(or Linux)，打开终端。

```bash
cat ~/.ssh/id_rsa.pub
```

查看自己公钥，然后想办法保存到服务器的`~/.ssh/authorized_keys`中（没有就创建，注意没有后缀）

或者直接用`ssh-copy-id -i ~/.ssh/id_rsa.pub username@ip`(username@ip根据自己实际情况改变)

然后连接:

```bash
ssh username@192.168.0.194 # username根据自己情况
```

首次连接会有连接过程。输入yes继续。

不出意外的话可以连接上

但是每次都输入`username`和`ip`实在是太麻烦了

可以在客户端上配置`config`文件

在`/Users/[name]/.ssh`文件中

```bash
sudo vim config
```

我的如下，可以参考:

```text
Host LAN-WIN
	HostName 192.168.0.194
	User	iamnotphage@gmail.com
	Port	22
	IdentityFile ~/.ssh/id_rsa
```

根据自己情况更改就好。

后续只需要这样连接(局域网的话)

```bash
ssh LAN-WIN
```

这样就不需要手动输入user@ip或者是指定端口了（不指定默认22）

## 内网穿透

我想大部分情况都不是局域网吧，所以需要内网穿透。

_让我想起小时候用蛤蟆吃联机 缅怀Hamachi。_

这里不多详解了，我个人用的是`Sakura FRP`这个软件

FRP: Fast Reverse Proxy

在服务器上配置一下，绑定端口22（如果你没修改的话）

然后FRP的软件给你一个公网ip和端口。后续你就这么连接就行:

```bash
ssh -p [port] user@ip
```

当然也可以配置`config`文件，避免后续重复输入

```text
Host myWindows
	HostName 这里输入公网ip或域名
	User	iamnotphage@gmail.com
	Port	[port]
	IdentityFile ~/.ssh/id_rsa
```

后续就是`ssh myWindows`就行了

# 问题汇总&解决方案

## 修改配置文件后权限改变

在Windows上，找到`OpenSSH`的安装目录。

我这里是`D:\MyToolkit\OpenSSH-Win64`

然后在此目录下管理员权限打开`PowerShell`:

该目录下有两个修复权限的脚本文件(`.ps1`后缀)

```bash
./FixHostFilePermissions.ps1
./FixUserFilePermissions.ps1
```

如果是linux系统的话`chmod`就行

## 发生系统错误 5

孩子，管理员权限打开终端。

## 发生系统错误 1067

当在windows上试图重启sshd服务时，会出现

```bash
windows > net start sshd
OpenSSH SSH Server 服务无法启动。

系统出错。

发生系统错误 1067。

进程意外终止。
```

**解决方案**

1. 首先确保权限正确: 在`.\FixHostFilePermission.ps`
2. 如果1不行那就删除`C:/ProgramData/ssh`文件夹，重新运行指令。

## Permission Denied

一直没啥变化但是突然不行了

客户端确保公钥正确上传到服务器的`authorized_keys`

```bash
ssh-keygen -R [name] # 这里填写自己的域名
# 这里会清除 ~/.ssh/known_hosts的相关条目
```

是在不行就删除`C:/ProgramData/ssh`文件夹重启sshd服务。
