# reactivity 概述

核心：proxy和effect函数

一个响应式对象内部是通过proxy包裹的，在触发getter的时候会收集依赖(track)，在触发setter的时候会触发依赖(执行trigger)。

而一个响应式对象的依赖关系(一个function)会放在effect函数中(effect方法的参数为这个function)，effect方法首先会把传入的函数执行一遍，则会触发track

所有的依赖关系通过一个全局的Map来收集（track中实现）,当响应式的值发生改变，则触发trigger，从Map中取出依赖并执行，从而达到依赖响应式的值也会更新的目的。

例如：更新DOM，DOM元素中有响应式的值，如果响应式的值发生了改变，则DOM也会跟着改变（整个DOM更新的方法被传入到effect中执行）

收集/触发依赖的流程

```
targetMap--全局的Map对象
depsMap--中间层Map对象
target，key--响应式对象和其属性 proxy.get
effects-- effect收集的依赖(ReactiveEffect的实例),为确保不重复，使用Set结构

targetMap: [[target, depsMap]]
depsMap: [[key, effects]]

触发依赖时就是从targetMap中找到更新了响应式对象的属性，取出对应的依赖关系(方法)并执行

本质就是从target找到key再找到effect中的方法并执行

```