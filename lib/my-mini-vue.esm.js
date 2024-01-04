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

// 生成组件实例
function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
    };
    return component;
}
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
    instance.proxy = new Proxy({}, {
        get(target, key) {
            // 将setup返回的值绑定到this
            const { setupState } = instance;
            // key是setup中定义的值
            if (Object.hasOwn(setupState, key)) {
                return setupState[key];
            }
            return Reflect.get(target, key);
        },
    });
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
    if (typeof vnode.type === 'string') {
        // 处理dom元素
        processElement(vnode, container);
    }
    else if (isObject(vnode.type)) {
        // 处理component
        processComponent(vnode, container);
    }
}
function processElement(vnode, container) {
    mountElement(vnode, container);
}
function mountElement(vnode, container) {
    var _a;
    // vnode对象包含type,props,children 详见createVnode
    const el = document.createElement(vnode.type);
    // 处理props
    for (const [key, val] of Object.entries((_a = vnode.props) !== null && _a !== void 0 ? _a : {})) {
        el.setAttribute(key, val);
    }
    // 处理children
    mountChildren(vnode, el);
    container.append(el);
}
// 生成元素的子元素
function mountChildren(vnode, container) {
    const { children } = vnode;
    if (typeof children === 'string') {
        // 文本节点
        container.textContent = children;
    }
    else if (Array.isArray(children)) {
        // 包含多个子节点
        children.forEach(child => {
            patch(child, container);
        });
    }
}
function processComponent(vnode, container) {
    mountComponent(vnode, container);
}
function mountComponent(vnode, container) {
    // 创建组件实例
    const instance = createComponentInstance(vnode);
    setupComponent(instance);
    setupRenderEffect(instance, container);
}
function setupRenderEffect(instance, container) {
    const { proxy } = instance;
    // 虚拟节点树，这里的render是组件的render函数 返回的内容是h函数返回的内容
    // 绑定代理对象this 到组件内
    const subTree = instance.render.call(proxy);
    patch(subTree, container);
}

// 创建虚拟节点，如果是一个组件，那么type是一个对象，没有后两个参数
function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
    };
    return vnode;
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
