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
    // 插槽
    ShapeFlags[ShapeFlags["SLOT_CHILDREN"] = 16] = "SLOT_CHILDREN";
})(ShapeFlags || (ShapeFlags = {}));
// 0-false; 1-true
// 写入 按位或
// ELEMENT | TEXT_CHILDREN => 0001 | 0100 => 0101
// 0010 | 1000 -> 1010
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
const extend = Object.assign;
const isObject = (val) => {
    return val !== null && typeof val === 'object';
};
// 判断对象是否包含某个属性
const hasOwn = (obj, key) => {
    return Object.hasOwn(obj, key);
};
// 将 kebab-case格式的名称转为首字母大写的驼峰
const camelize = (str) => {
    return str.replace(/-(\w)/g, (_, c) => (c ? c.toUpperCase() : ''));
};
// 事件名首字母转为大写
const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};
// 事件名拼接上 on
const toHandleKey = (str) => {
    return str ? 'on' + capitalize(str) : '';
};

const targetMap = new Map(); // 存储依赖的最外层的map
// 触发依赖
function trigger(target, key) {
    const depsMap = targetMap.get(target);
    let dep = depsMap.get(key);
    triggerEffects(dep);
}
function triggerEffects(dep) {
    for (const effect of dep) {
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect.run();
        }
    }
}

const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter({ isReadonly: true });
const shallowReadonlyGet = createGetter({ shallow: true, isReadonly: true });
function createGetter({ isReadonly = false, shallow = false } = {}) {
    return function get(target, key) {
        if (key === "__v_isReactive" /* ReactiveFlags.IS_REACTIVE */) {
            return !isReadonly;
        }
        else if (key === "__v_isReadonly" /* ReactiveFlags.IS_READONLY */) {
            return isReadonly;
        }
        const res = Reflect.get(target, key);
        if (shallow) {
            return res;
        }
        // 多层对象需要继续包裹实现响应性
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res);
        }
        return res;
    };
}
function createSetter() {
    return function set(target, key, value) {
        const res = Reflect.set(target, key, value);
        trigger(target, key);
        return res;
    };
}
const mutableHandlers = {
    get,
    set,
};
const readonlyHandlers = {
    get: readonlyGet,
    set(target, key) {
        console.warn(`key: ${String(key)} 设置失败，readonly类型的属性是只读的`, target);
        return true;
    },
};
const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
    get: shallowReadonlyGet,
});

function reactive(target) {
    return createReactiveObject(target, mutableHandlers);
}
function readonly(target) {
    return createReactiveObject(target, readonlyHandlers);
}
// 只有对象最外层的属性是readonly,内层不是
function shallowReadonly(target) {
    return createReactiveObject(target, shallowReadonlyHandlers);
}
function createReactiveObject(target, baseHandlers) {
    if (!isObject(target)) {
        console.warn(`target ${target} 必须是一个对象`);
        return target;
    }
    return new Proxy(target, baseHandlers);
}

// 组件触发事件
// rawArgs用户传入的其它参数
function emit(instance, event, ...rawArgs) {
    const { props } = instance;
    const handlerName = toHandleKey(camelize(event));
    const handler = props[handlerName];
    handler && handler(...rawArgs);
}

// props功能
// 1. setup接收props
// 2. 代理对象this可以获取到props内的值
// 3. props是shallowReadonly
function initProps(instance, rawProps) {
    // 将props绑定到组件实例上
    instance.props = rawProps !== null && rawProps !== void 0 ? rawProps : {};
}

// 将其它值绑定到this
const publicPropertiesMap = {
    $el: i => i.vnode.el,
    $slots: i => i.slots, // 插槽
};
// 组件代理的handler
const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        // 将setup返回的值绑定到this
        const { setupState, props } = instance;
        // key是setup中定义的值或setup接收到的props
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
        }
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    },
};

function initSlots(instance, children) {
    const { vnode } = instance;
    // 这里只是简单判断是具名插槽还是普通插槽
    // 正常非具名插槽应该生成一个名称为default
    if (children && isObject(children) && !hasOwn(children, 'children')) {
        if (vnode.shapeFlag & ShapeFlags.SLOT_CHILDREN) {
            normalizeObjectSlots(children, instance.slots);
        }
    }
    else {
        instance.slots = normalizeSlotValue(children);
    }
}
function normalizeObjectSlots(children, slots) {
    for (const [key, value] of Object.entries(children)) {
        // if (key === 'header') {
        // }
        if (typeof value === 'function') {
            slots[key] = props => normalizeSlotValue(value(props));
        }
    }
}
function normalizeSlotValue(value) {
    return Array.isArray(value) ? value : [value];
}

// 生成组件实例
function createComponentInstance(vnode) {
    const instance = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        slots: {},
        emit: () => { },
    };
    // 组件实例作为内部参数传入到emit方法，用户只传事件名称和业务参数
    instance.emit = emit.bind(null, instance);
    return instance;
}
// 为组件实例赋予状态
function setupComponent(instance) {
    // 初始化props和slots
    initProps(instance, instance.vnode.props);
    initSlots(instance, instance.vnode.children);
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
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit,
        });
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

const Fragment = Symbol('Fragment');
const Text = Symbol('Text');
// 创建虚拟节点
// 如果type是对象，则代表节点是一个组件，props代表组件接收的props
// 如果type是字符串，那么就代表该节点是一个dom元素
function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        el: null,
        shapeFlag: getShapeFlag(type),
    };
    // 单个元素/多个元素
    if (typeof children === 'string') {
        vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN;
    }
    // 组件-插槽(children是object)
    if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        if (isObject(children)) {
            vnode.shapeFlag |= ShapeFlags.SLOT_CHILDREN;
        }
    }
    return vnode;
}
// 文本节点
function createTextVNode(text) {
    return createVNode(Text, {}, text);
}
// 为patch方法初筛节点类型
function getShapeFlag(type) {
    return typeof type === 'string'
        ? ShapeFlags.ELEMENT
        : ShapeFlags.STATEFUL_COMPONENT;
}

function render(vnode, container) {
    patch(vnode, container);
}
// 方便递归处理
function patch(vnode, container) {
    const { type, shapeFlag } = vnode;
    switch (type) {
        case Fragment: // 只渲染children
            processFragment(vnode, container);
            break;
        case Text: // 渲染文本
            processText(vnode, container);
            break;
        default:
            if (shapeFlag & ShapeFlags.ELEMENT) {
                // 处理dom元素
                processElement(vnode, container);
            }
            else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                // 处理component
                processComponent(vnode, container);
            }
            break;
    }
}
function processText(vnode, container) {
    const { children } = vnode;
    const textNode = (vnode.el = document.createTextNode(children));
    container.append(textNode);
}
function processFragment(vnode, container) {
    mountChildren(vnode, container);
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
    const { children, shapeFlag } = vnode;
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
        // 文本节点
        el.textContent = children;
    }
    else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 包含多个子节点
        mountChildren(vnode, el);
    }
    container.append(el);
}
// 处理children
function mountChildren(vnode, container) {
    vnode.children.forEach(child => {
        patch(child, container);
    });
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

function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            // 根组件 -> 虚拟节点
            const vnode = createVNode(rootComponent);
            render(vnode, rootContainer);
        },
    };
}

// h函数返回的是一个虚拟节点
function h(type, props, children) {
    return createVNode(type, props, children);
}

// 渲染插槽内容(支持一个或多个节点)
function renderSlots(slots, slotName, props) {
    const slot = slots[slotName];
    if (slot && typeof slot === 'function') {
        return createVNode(Fragment, {}, slot(props));
    }
    else {
        return createVNode(Fragment, {}, slots);
    }
}

export { createApp, createTextVNode, h, renderSlots };
