import { createVNode } from './vnode';

// h函数返回的是一个虚拟节点
export function h(type, props?, children?) {
  return createVNode(type, props, children);
}
