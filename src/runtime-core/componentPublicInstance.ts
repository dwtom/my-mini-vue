// 将其它值绑定到this
const publicPropertiesMap = {
  $el: i => i.vnode.el,
};

export const PublicInstanceProxyHandlers = {
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
