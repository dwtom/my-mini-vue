import { render } from './renderer';
import { createVNode } from './vnode';

export function createApp(rootComponent) {
  return {
    mount(rootContainer) {
      // 根组件 -> 虚拟节点
      const vnode = createVNode(rootComponent);
      render(vnode, rootContainer);
    },
  };
}
