import { ShapeFlags } from '../shared/shapeFlags';

// 创建虚拟节点，如果是一个组件，那么type是一个对象，没有后两个参数
// 如果是进入到h函数的返回值，那么传入的可以说是一个dom,type是html标签名
export function createVNode(type, props?, children?) {
  const vnode = {
    type,
    props,
    children,
    el: null,
    shapeFlag: getShapeFlag(type),
  };

  if (typeof children === 'string') {
    vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN;
  } else {
    vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN;
  }

  return vnode;
}

// 为patch方法初筛节点类型
function getShapeFlag(type) {
  return typeof type === 'string'
    ? ShapeFlags.ELEMENT
    : ShapeFlags.STATEFUL_COMPONENT;
}
