// render时区分虚拟节点类型
// 位运算效率高
var ShapeFlags;
(function (ShapeFlags) {
    // dom元素
    ShapeFlags[ShapeFlags["ELEMENT"] = 1] = "ELEMENT";
    // 组件
    ShapeFlags[ShapeFlags["STATEFUL_COMPONENT"] = 2] = "STATEFUL_COMPONENT";
    // 单文本节点
    ShapeFlags[ShapeFlags["TEXT_CHILDREN"] = 4] = "TEXT_CHILDREN";
    // 多个子节点
    ShapeFlags[ShapeFlags["ARRAY_CHILDREN"] = 8] = "ARRAY_CHILDREN";
})(ShapeFlags || (ShapeFlags = {}));
// 0-false; 1-true
// 写入 按位或
// ELEMENT | TEXT_CHILDREN => 0001 | 0100 => 0101
// 读取 按位与
// (ELEMENT |= TEXT_CHILDREN) & TEXT_CHILDREN => 0101 & 0100 => 0100

/*
 * @Description: 公共方法
 * @Author: Dong Wei
 * @Date: 2024-01-02 14:30:34
 * @LastEditors: Dong Wei
 * @LastEditTime: 2024-01-03 11:20:19
 * @FilePath: \my-mini-vue\src\shared\index.ts
 */
const isObject = (val) => {
    return val !== null && typeof val === 'object';
};

// 将其它值绑定到this
const publicPropertiesMap = {
    $el: i => i.vnode.el,
};
const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        // 将setup返回的值绑定到this
        const { setupState } = instance;
        // key是setup中定义的值
        if (Object.hasOwn(setupState, key)) {
            return setupState[key];
        }
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    },
};

// 生成组件实例
function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
    };
    return component;
}
// 为组件实例赋予状态
function setupComponent(instance) {
    // 初始化props和slots
    // initProps()
    // initSlots()
    // 初始化有状态的组件
    setupStatefulComponent(instance);
}
// 初始化有状态的组件
function setupStatefulComponent(instance) {
    const Component = instance.type;
    // 组件的代理对象(this)
    // 将instance传入handlers
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
    const { setup } = Component;
    if (setup) {
        const setupResult = setup();
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    // setup返回结果 函数或者对象
    if (isObject(setupResult)) {
        instance.setupState = setupResult;
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const Component = instance.type;
    if (Component.render) {
        instance.render = Component.render;
    }
}

function render(vnode, container) {
    patch(vnode, container);
}
// 方便递归处理
function patch(vnode, container) {
    const { shapeFlag } = vnode;
    if (shapeFlag & ShapeFlags.ELEMENT) {
        // 处理dom元素
        processElement(vnode, container);
    }
    else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        // 处理component
        processComponent(vnode, container);
    }
}
function processElement(vnode, container) {
    mountElement(vnode, container);
}
// 为dom元素绑定html属性，事件等，并将dom元素及子元素放入父节点中
function mountElement(vnode, container) {
    var _a;
    // vnode对象包含type,props,children 详见createVnode
    // 将根节点绑定到当前的虚拟节点上便于后续绑定到this上调用
    const el = (vnode.el = document.createElement(vnode.type));
    // 处理props
    for (const [key, val] of Object.entries((_a = vnode.props) !== null && _a !== void 0 ? _a : {})) {
        const isOn = (key) => /^on[A-Z]/.test(key);
        // 处理事件
        if (isOn(key)) {
            const eventName = key.slice(2).toLowerCase();
            el.addEventListener(eventName, val);
        }
        else {
            el.setAttribute(key, val);
        }
    }
    // 处理children
    mountChildren(vnode, el);
    container.append(el);
}
// 生成元素的子元素
function mountChildren(vnode, container) {
    const { children, shapeFlag } = vnode;
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
        // 文本节点
        container.textContent = children;
    }
    else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 包含多个子节点
        children.forEach(child => {
            patch(child, container);
        });
    }
}
function processComponent(vnode, container) {
    mountComponent(vnode, container);
}
function mountComponent(initialVNode, container) {
    // 创建组件实例
    const instance = createComponentInstance(initialVNode);
    setupComponent(instance);
    setupRenderEffect(instance, initialVNode, container);
}
function setupRenderEffect(instance, initialVNode, container) {
    const { proxy } = instance;
    // 从组件对象中剥离虚拟节点树
    // 这里的render是组件的render函数 返回的内容是h函数返回的内容
    // 使用call()绑定代理对象this 到组件内
    const subTree = instance.render.call(proxy);
    patch(subTree, container);
    // mountElement 将el绑定到了subTree
    // 再绑定到组件的el属性
    initialVNode.el = subTree.el;
}

// 创建虚拟节点，如果是一个组件，那么type是一个对象，没有后两个参数
// 如果是进入到h函数的返回值，那么传入的可以说是一个dom,type是html标签名
function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        el: null,
        shapeFlag: getShapeFlag(type),
    };
    if (typeof children === 'string') {
        vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN;
    }
    else {
        vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN;
    }
    return vnode;
}
// 为patch方法初筛节点类型
function getShapeFlag(type) {
    return typeof type === 'string'
        ? ShapeFlags.ELEMENT
        : ShapeFlags.STATEFUL_COMPONENT;
}

function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            // 组件 -> 虚拟节点
            const vnode = createVNode(rootComponent);
            render(vnode, rootContainer);
        },
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

export { createApp, h };
