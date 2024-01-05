// 创建虚拟节点，如果是一个组件，那么type是一个对象，没有后两个参数
// 如果是进入到h函数的返回值，那么传入的可以说是一个dom
export function createVNode(type, props?, children?) {
  const vnode = {
    type,
    props,
    children,
    el: null,
  };
  return vnode;
}
