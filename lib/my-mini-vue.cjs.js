'use strict';

/*
 * @Description: 公共方法
 * @Author: Dong Wei
 * @Date: 2024-01-02 14:30:34
 * @LastEditors: Dong Wei
 * @LastEditTime: 2024-01-03 11:20:19
 * @FilePath: \my-mini-vue\src\shared\index.ts
 */
const EMPTY_OBJ = {};
const extend = Object.assign;
const isObject = (val) => {
    return val !== null && typeof val === 'object';
};
// 两个值对比是否有变化
const hasChanged = (value, oldValue) => {
    return !Object.is(value, oldValue);
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

let activeEffect; // effect实例
let shouldTrack = false; // 是否进行依赖收集
const targetMap = new Map(); // 存储依赖的最外层的map
class ReactiveEffect {
    constructor(fn, scheduler) {
        this.deps = []; // 收集所有的effect实例
        this.active = true; // 是否未调用stop方法
        this._fn = fn;
        this.scheduler = scheduler;
    }
    run() {
        if (!this.active) {
            this.active = true; // 避免再次调用stop方法失效
            return this._fn();
        }
        shouldTrack = true;
        activeEffect = this;
        const result = this._fn();
        shouldTrack = false;
        return result;
    }
    stop() {
        if (this.active) {
            cleanupDeps(this);
            if (this.onStop) {
                this.onStop();
            }
            this.active = false;
        }
    }
}
function cleanupDeps(effect) {
    effect.deps.forEach((dep) => dep.delete(effect)); // 仅删除Set内的值
    effect.deps.length = 0; // 清空保存Set数组的deps
}
function effect(fn, options = {}) {
    const _effect = new ReactiveEffect(fn, options.scheduler);
    // 将options中的内容挂载到effect实例上
    extend(_effect, options);
    _effect.run();
    const runner = _effect.run.bind(_effect);
    // 将effect实例挂载到runner上，便于后续调用stop方法
    runner.effect = _effect;
    return runner;
}
// 是否收集依赖
function isTracking() {
    return shouldTrack && activeEffect !== undefined;
}
// 收集依赖
function track(target, key) {
    // 只有调用了run方法才能收集依赖
    if (!isTracking()) {
        return;
    }
    // 触发依赖是触发fn事件，所以收集依赖其实是收集effect和fn，然后和传入的target对象的key绑定
    // target->key->effect.fn
    // targetMap:[[target, 中间层Map]]
    // 中间层Map: [[key, effects]]
    // 最终效果是从targetMap中取出effects
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        depsMap = new Map();
        targetMap.set(target, depsMap);
    }
    let dep = depsMap.get(key);
    if (!dep) {
        dep = new Set();
        depsMap.set(key, dep);
    }
    trackEffects(dep);
}
function trackEffects(dep) {
    // 如果已经收集过则不再重复收集
    if (dep.has(activeEffect)) {
        return;
    }
    dep.add(activeEffect);
    activeEffect.deps.push(dep);
}
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
        if (!isReadonly) {
            track(target, key);
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

// 使基础数据类型具有响应性
// 使用对象（类）包裹，通过get和set value属性进行依赖收集和触发更新
// 如果传入了一个对象，则用reactive(proxy)来处理
class RefImpl {
    constructor(value) {
        this.__v_isRef = true;
        this._value = convert(value);
        this._rawValue = value;
        this.dep = new Set();
    }
    get value() {
        trackRefValue(this);
        return this._value;
    }
    set value(newValue) {
        // 如果值没有变化则不可以触发set逻辑
        if (hasChanged(newValue, this._rawValue)) {
            this._value = convert(newValue);
            this._rawValue = newValue;
            triggerEffects(this.dep);
        }
    }
}
function trackRefValue(ref) {
    if (isTracking()) {
        trackEffects(ref.dep);
    }
}
function convert(value) {
    return isObject(value) ? reactive(value) : value;
}
function ref(value) {
    return new RefImpl(value);
}
function isRef(ref) {
    return !!ref.__v_isRef;
}
function unRef(ref) {
    return isRef(ref) ? ref.value : ref;
}
// 使用ref时省略.value 用于template
// 可传入ref对象或者普通的值
// 因为proxyRefs引用了源对象，所以新对象的属性值改变会引起源对象的属性值改变
function proxyRefs(objectWithRefs) {
    return new Proxy(objectWithRefs, {
        // ref返回.value内的值或者普通对象直接返回属性值
        get(target, key) {
            return unRef(Reflect.get(target, key));
        },
        set(target, key, value) {
            if (isRef(target[key]) && !isRef(value)) {
                return (target[key].value = value);
            }
            else {
                return Reflect.set(target, key, value);
            }
        },
    });
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
    // 正常非具名插槽应该生成一个名称为default,此项目暂只考虑核心逻辑
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
        if (typeof value === 'function') {
            slots[key] = props => normalizeSlotValue(value(props));
        }
    }
}
function normalizeSlotValue(value) {
    return Array.isArray(value) ? value : [value];
}

let currentInstance = null;
// 生成组件实例
function createComponentInstance(vnode, parent) {
    const instance = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        slots: {},
        provides: parent ? parent.provides : {},
        parent,
        isMounted: false,
        subTree: {},
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
        setCurrentInstance(instance);
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit,
        });
        setCurrentInstance(null);
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    // setup返回结果 函数或者对象
    if (isObject(setupResult)) {
        // setup的结果在template中调用无需.value
        instance.setupState = proxyRefs(setupResult);
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const Component = instance.type;
    if (Component.render) {
        instance.render = Component.render;
    }
}
function getCurrentInstance() {
    return currentInstance;
}
function setCurrentInstance(instance) {
    currentInstance = instance;
}

// 需在setup中才能调用
// 保存属性
function provide(key, value) {
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        let { provides } = currentInstance;
        const parentProvides = currentInstance.parent.provides;
        // 初始化时将当前组件的provides的原型指向父组件的provides,组成原型链
        if (provides === parentProvides) {
            provides = currentInstance.provides = Object.create(parentProvides);
        }
        provides[key] = value;
    }
}
// 取出
function inject(key, defaultValue) {
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        const parentProvides = currentInstance.parent.provides;
        if (key in parentProvides) {
            // 需要找到继承于更上一级的属性
            return parentProvides[key];
        }
        else if (defaultValue) {
            // 如果子组件使用时没有在父组件找到对应属性，则使用传入的值/函数返回值
            if (typeof defaultValue === 'function') {
                return defaultValue();
            }
            return defaultValue;
        }
    }
}

function createAppAPI(render) {
    // 由于render变成了渲染包装函数的内部函数，所以此处也需要封装一层
    return function createApp(rootComponent) {
        return {
            mount(rootContainer) {
                // 根组件 -> 虚拟节点
                const vnode = createVNode(rootComponent);
                render(vnode, rootContainer);
            },
        };
    };
}

// 将渲染流程包装一层供不同平台自定义渲染
function createRenderer(options) {
    const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert, remove: hostRemove, setElementText: hostSetElementText, } = options;
    function render(vnode, container) {
        patch(null, vnode, container, null);
    }
    // 处理vnode 方便递归处理
    // n1 - 旧的节点,初始化为null
    // n2 - 新的节点
    function patch(n1, n2, container, parentComponent) {
        const { type, shapeFlag } = n2;
        switch (type) {
            case Fragment: // 只渲染children
                processFragment(n1, n2, container, parentComponent);
                break;
            case Text: // 渲染文本
                processText(n1, n2, container);
                break;
            default:
                if (shapeFlag & ShapeFlags.ELEMENT) {
                    // 处理dom元素
                    processElement(n1, n2, container, parentComponent);
                }
                else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                    // 处理component
                    processComponent(n1, n2, container, parentComponent);
                }
                break;
        }
    }
    function processText(n1, n2, container) {
        const { children } = n2;
        const textNode = (n2.el = document.createTextNode(children));
        container.append(textNode);
    }
    function processFragment(n1, n2, container, parentComponent) {
        mountChildren(n2.children, container, parentComponent);
    }
    function processElement(n1, n2, container, parentComponent) {
        if (!n1) {
            mountElement(n2, container, parentComponent);
        }
        else {
            patchElement(n1, n2, container, parentComponent);
        }
    }
    // 节点更新
    function patchElement(n1, n2, container, parentComponent) {
        // console.log('patchElement');
        const oldProps = n1.props || EMPTY_OBJ;
        const newProps = n2.props || EMPTY_OBJ;
        const el = (n2.el = n1.el);
        // 更新children
        patchChildren(n1, n2, el, parentComponent);
        // 处理节点的props更新
        patchProps(el, oldProps, newProps);
    }
    // 更新children
    function patchChildren(n1, n2, container, parentComponent) {
        const prevShapFlag = n1.shapeFlag;
        const { shapeFlag } = n2;
        const c1 = n1.children;
        const c2 = n2.children;
        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            // arraychildren->textchildren
            if (prevShapFlag & ShapeFlags.ARRAY_CHILDREN) {
                // 删除老的children
                unmountChildren(n1.children);
            }
            if (c1 !== c2) {
                // 渲染文本节点
                // text -> text 也走到这里
                hostSetElementText(container, c2);
            }
        }
        else {
            // 新节点是数组节点
            // text -> array
            if (prevShapFlag & ShapeFlags.TEXT_CHILDREN) {
                hostSetElementText(container, '');
                mountChildren(c2, container, parentComponent);
            }
        }
    }
    // 删除节点
    function unmountChildren(children) {
        for (let i = 0; i < children.length; i++) {
            const el = children[i].el;
            hostRemove(el);
        }
    }
    // 更新节点的props
    function patchProps(el, oldProps, newProps) {
        // https://github.com/vuejs/core/pull/5857
        // vue3会在编译阶段对静态props进行提升，最终此处比较的会是同一个对象的引用
        if (oldProps !== newProps) {
            for (const key in newProps) {
                const prevProp = oldProps[key];
                const nextProp = newProps[key];
                if (prevProp !== nextProp) {
                    hostPatchProp(el, key, prevProp, nextProp);
                }
            }
            if (oldProps !== EMPTY_OBJ) {
                for (const key in oldProps) {
                    // 处理属性被删除的情况
                    if (!(key in newProps)) {
                        hostPatchProp(el, key, oldProps[key], null);
                    }
                }
            }
        }
    }
    // 为dom元素绑定html属性，事件等，并将dom元素及子元素放入父节点中
    function mountElement(vnode, container, parentComponent) {
        var _a;
        // vnode对象包含type,props,children 详见createVnode
        // 将根节点绑定到当前的虚拟节点上便于后续绑定到this上调用
        const el = (vnode.el = hostCreateElement(vnode.type));
        // 处理props
        for (const [key, val] of Object.entries((_a = vnode.props) !== null && _a !== void 0 ? _a : {})) {
            hostPatchProp(el, key, null, val);
        }
        const { children, shapeFlag } = vnode;
        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            // 文本节点
            el.textContent = children;
        }
        else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            // 包含多个子节点
            mountChildren(vnode.children, el, parentComponent);
        }
        // container.append(el);
        hostInsert(el, container);
    }
    // 处理children
    function mountChildren(children, container, parentComponent) {
        children.forEach(child => {
            patch(null, child, container, parentComponent);
        });
    }
    function processComponent(n1, n2, container, parentComponent) {
        mountComponent(n2, container, parentComponent);
    }
    function mountComponent(initialVNode, container, parentComponent) {
        // 创建组件实例
        const instance = createComponentInstance(initialVNode, parentComponent);
        setupComponent(instance);
        setupRenderEffect(instance, initialVNode, container);
    }
    function setupRenderEffect(instance, initialVNode, container) {
        effect(() => {
            const { proxy } = instance;
            if (!instance.isMounted) {
                // 从组件对象中剥离虚拟节点树
                // 这里的render是组件的render函数 返回的内容是h函数返回的内容
                // 使用call()绑定代理对象this 到组件内
                // 将subtree保存起来便于更新节点时比较
                const subTree = (instance.subTree = instance.render.call(proxy));
                patch(null, subTree, container, instance);
                // mountElement 将el绑定到了subTree
                // 再绑定到组件的el属性
                initialVNode.el = subTree.el;
                instance.isMounted = true;
            }
            else {
                const subTree = instance.render.call(proxy);
                const prevSubTree = instance.subTree;
                // 节点更新subTree属性也要更新
                instance.subTree = subTree;
                patch(prevSubTree, subTree, container, instance);
            }
        });
    }
    return {
        createApp: createAppAPI(render),
    };
}

function createElement(type) {
    return document.createElement(type);
}
function patchProp(el, key, prevVal, nextVal) {
    const isOn = (key) => /^on[A-Z]/.test(key);
    // 处理事件
    if (isOn(key)) {
        const eventName = key.slice(2).toLowerCase();
        el.addEventListener(eventName, nextVal);
    }
    else if ([null, undefined].includes(nextVal)) {
        // 如果属性值不存在，那么从节点上删除该属性
        el.removeAttribute(key);
    }
    else {
        el.setAttribute(key, nextVal);
    }
}
function insert(el, parent) {
    parent.appendChild(el);
}
function remove(child) {
    const parent = child.parentNode;
    if (parent) {
        parent.removeChild(child);
    }
}
function setElementText(el, text) {
    el.textContent = text;
}
const renderer = createRenderer({
    createElement,
    patchProp,
    insert,
    remove,
    setElementText,
});
function createApp(...arg) {
    return renderer.createApp(...arg);
}

exports.createApp = createApp;
exports.createRenderer = createRenderer;
exports.createTextVNode = createTextVNode;
exports.getCurrentInstance = getCurrentInstance;
exports.h = h;
exports.inject = inject;
exports.provide = provide;
exports.proxyRefs = proxyRefs;
exports.ref = ref;
exports.renderSlots = renderSlots;
