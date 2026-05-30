---
layout: ../../layouts/MarkdownPostLayout.astro
title: 'Cocos游戏制作'
pubdate: 2026-5-23
category: '学习'
---
制作了技能cd预制体，效果还不错

打包期间遇到问题
```
In file included from C:/ProgramData/cocos/editors/Creator/3.8.8/resources/resources/3d/engine/native/cocos/network/SocketIO.cpp:40:
In file included from C:/ProgramData/cocos/editors/Creator/3.8.8/resources/resources/3d/engine/native/external/sources/json/document-wrapper.h:13:
C:/ProgramData/cocos/editors/Creator/3.8.8/resources/resources/3d/engine/native/external/sources/json/document.h:319:82: error: cannot assign to non-static data member 'length' with const-qualified type 'const SizeType' (aka 'const unsigned int')
  319 |     GenericStringRef& operator=(const GenericStringRef& rhs) { s = rhs.s; length = rhs.length; }
      |                                                                           ~~~~~~ ^
C:/ProgramData/cocos/editors/Creator/3.8.8/resources/resources/3d/engine/native/external/sources/json/document.h:325:20: note: non-static data member 'length' declared const here
  325 |     const SizeType length; //!< length of the string (excluding the trailing NULL terminator)
      |     ~~~~~~~~~~~~~~~^~~~~~
```

这是一个 C++ 编译错误，发生在 Cocos Creator 引擎自带的 RapidJSON 库中。错误的核心原因是：

代码尝试给一个 const 常量成员变量 length 赋值，这是不允许的。

🔍 错误原因分析
在 document.h 的第 319 行：
```
cpp
GenericStringRef& operator=(const GenericStringRef& rhs) { 
    s = rhs.s; 
    length = rhs.length;  // ❌ 错误：length 是 const，不能赋值
}
```
而 length 在第 325 行被声明为：
```
cpp
const SizeType length;  // const 常量，只能初始化，不能赋值
这是一个 RapidJSON 库本身的代码缺陷：赋值运算符试图修改 const 成员变量。
```

解决方案（按推荐程度排序）
方案一：修复 RapidJSON 源码（推荐，最干净）
直接修改 Cocos Creator 引擎自带的 RapidJSON 头文件，注释掉有问题的赋值运算符。

修改文件位置：
```
text
C:/ProgramData/cocos/editors/Creator/3.8.8/resources/resources/3d/engine/native/external/sources/json/document.h
```
找到第 319 行附近，修改为：
```
cpp
GenericStringRef& operator=(const GenericStringRef& rhs) { 
    s = rhs.s; 
    // length = rhs.length;  // 注释掉这行，因为 length 是 const
    return *this;
}
```
或者更安全的做法，直接删除整个赋值运算符（因为编译器会生成默认的，但默认的也会有问题）：
```
cpp
// 直接删除或注释掉整个 operator=
// GenericStringRef& operator=(const GenericStringRef& rhs) { 
//     s = rhs.s; 
//     length = rhs.length;
//     return *this;
// }
```

这个错误本质上是 RapidJSON 库的代码质量问题，不是你的项目代码的问题。在更严格的编译器（NDK r29+ 的 Clang）下暴露出来了。修改源码不会影响功能，因为 GenericStringRef 本来就不应该被赋值——它的设计意图是作为只读的字符串引用。

替换app图标，路径\native\engine\android\res，我的手机用的是xxhdpi

把图片制作成图集以节省空间https://www.flintbyte.com/texture/


