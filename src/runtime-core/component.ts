import { shallowReadonly } from '../reactivity/reactive';
import { isObject } from '../shared';
import { initProps } from './componentProps';
import { PublicInstanceProxyHandlers } from './componentPublicInstance';

// 生成组件实例
export function createComponentInstance(vnode) {
  const component = {
    vnode,
    type: vnode.type,
    setupState: {},
    props: {},
  };
  return component;
}

// 为组件实例赋予状态
export function setupComponent(instance) {
  // 初始化props和slots
  initProps(instance, instance.vnode.props);
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
    const setupResult = setup(shallowReadonly(instance.props));
    handleSetupResult(instance, setupResult);
  }
}

function handleSetupResult(instance, setupResult: any) {
  // setup返回结果 函数或者对象
  if (isObject(setupResult)) {
    instance.setupState = setupResult;
  }

  finishComponentSetup(instance);
}

function finishComponentSetup(instance: any) {
  const Component = instance.type;
  if (Component.render) {
    instance.render = Component.render;
  }
}
