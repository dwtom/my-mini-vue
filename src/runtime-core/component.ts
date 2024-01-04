import { isObject } from '../shared';

// 生成组件实例
export function createComponentInstance(vnode) {
  const component = {
    vnode,
    type: vnode.type,
    setupState: {},
  };
  return component;
}

export function setupComponent(instance) {
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
  instance.proxy = new Proxy(
    {},
    {
      get(target, key) {
        // 将setup返回的值绑定到this
        const { setupState } = instance;
        // key是setup中定义的值
        if (Object.hasOwn(setupState, key)) {
          return setupState[key];
        }
        return Reflect.get(target, key);
      },
    }
  );

  const { setup } = Component;
  if (setup) {
    const setupResult = setup();
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
