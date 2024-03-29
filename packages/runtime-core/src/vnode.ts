import { isObject } from '@mini-vue/shared';
import { ShapeFlags } from '@mini-vue/shared';

export const Fragment = Symbol('Fragment');
export const Text = Symbol('Text');

export { createVNode as createElementVNode };

// 创建虚拟节点
// 如果type是对象，则代表节点是一个组件，props代表组件接收的props
// 如果type是字符串，那么就代表该节点是一个dom元素
export function createVNode(type, props?, children?) {
  const vnode = {
    type,
    props,
    children,
    component: null, // 组件
    key: props?.key,
    el: null,
    shapeFlag: getShapeFlag(type),
  };

  // 单个元素/多个元素
  if (typeof children === 'string') {
    vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN;
  } else if (Array.isArray(children)) {
    vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN;
  }

  // 组件-插槽(children是object)
  if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    if (isObject(children)) {
      vnode.shapeFlag |= ShapeFlags.SLOT_CHILDREN;
    }
  }

  return vnode;
}

// 文本节点
export function createTextVNode(text: string) {
  return createVNode(Text, {}, text);
}

// 为patch方法初筛节点类型
function getShapeFlag(type) {
  return typeof type === 'string'
    ? ShapeFlags.ELEMENT
    : ShapeFlags.STATEFUL_COMPONENT;
}
