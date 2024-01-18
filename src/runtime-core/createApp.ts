import { createVNode } from './vnode';

export function createAppAPI(render) {
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
