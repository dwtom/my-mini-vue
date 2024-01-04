// 创建虚拟节点，如果是一个组件，那么type是一个对象，没有后两个参数
export function createVNode(type, props?, children?) {
  const vnode = {
    type,
    props,
    children,
  };
  return vnode;
}
