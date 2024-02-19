# runtime-core (运行时) 概述
运行时——生成虚拟节点，基于不同虚拟节点类型进行递归处理(由runtime-dom传入对应方法实际生成dom, vue默认使用runtime-dom处理运行时)

- ### 初始化流程

    基于根组件创建虚拟节点，调用render渲染虚拟节点vnode。render内部根据vnode类型不同 调用patch处理虚拟节点，处理完当前节点后如果还有子节点则递归调用patch处理子节点。最终将处理好的vnode插入目标根元素

    

    #### 组件初始化

    1. 创建组件实例，并将props，slots，emit，setupState等挂载到组件实例上。之后初始化组件的props，slots，调用setup，并将组件实例代理到组件上(this)，最后设置render函数。


    2. 调用组件的render函数获取组件的子节点并递归调用patch初始化组件内部的子组件或者element

    

    #### element初始化

    1. 生成element（抽象方法，默认通过runtime-dom传入方法生成dom元素）

    2. 处理children，如果是文本类型也是调用抽象方法生成文本，如果是数组类型则继续循环调用patch

    3. 后续调用相关方法设置元素的props，最终调用抽象的insert方法将处理好的虚拟节点插入到目标根元素