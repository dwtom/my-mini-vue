import { hasOwn } from '../shared';

// 将其它值绑定到this
const publicPropertiesMap = {
  $el: i => i.vnode.el, // 根组件
  $slots: i => i.slots, // 插槽
};

// 组件代理的handler
export const PublicInstanceProxyHandlers = {
  get({ _: instance }, key) {
    // 将setup返回的值绑定到this
    const { setupState, props } = instance;
    // key是setup中定义的值或setup接收到的props
    if (hasOwn(setupState, key)) {
      return setupState[key];
    } else if (hasOwn(props, key)) {
      return props[key];
    }

    const publicGetter = publicPropertiesMap[key];
    if (publicGetter) {
      return publicGetter(instance);
    }
  },
};
