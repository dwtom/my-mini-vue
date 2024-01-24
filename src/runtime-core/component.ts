import { proxyRefs } from '../reactivity';
import { shallowReadonly } from '../reactivity/reactive';
import { isObject } from '../shared';
import { emit } from './componentEmit';
import { initProps } from './componentProps';
import { PublicInstanceProxyHandlers } from './componentPublicInstance';
import { initSlots } from './componentSlots';

let currentInstance = null;

// 生成组件实例
export function createComponentInstance(vnode, parent) {
  const instance = {
    vnode,
    type: vnode.type,
    next: null, // 指向下一次要更新的虚拟节点
    setupState: {},
    props: {},
    slots: {},
    provides: parent ? parent.provides : {}, // provide/inject需要
    parent, // 父节点
    isMounted: false, // 节点是否已经初始化
    subTree: {},
    emit: () => {},
  };
  // 组件实例作为内部参数传入到emit方法，用户只传事件名称和业务参数
  instance.emit = emit.bind(null, instance) as any;
  return instance;
}

// 为组件实例赋予状态
export function setupComponent(instance) {
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

function handleSetupResult(instance, setupResult: any) {
  // setup返回结果 函数或者对象
  if (isObject(setupResult)) {
    // setup的结果在template中调用无需.value
    instance.setupState = proxyRefs(setupResult);
  }

  finishComponentSetup(instance);
}

function finishComponentSetup(instance: any) {
  const Component = instance.type;
  if (Component.render) {
    instance.render = Component.render;
  }
}

export function getCurrentInstance() {
  return currentInstance;
}

function setCurrentInstance(instance: any) {
  currentInstance = instance;
}
