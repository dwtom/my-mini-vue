import { Fragment, createVNode } from '../vnode';

// 渲染插槽内容(支持一个或多个节点)
export function renderSlots(slots: any, slotName: string, props?: object) {
  const slot = slots[slotName];
  if (slot && typeof slot === 'function') {
    return createVNode(Fragment, {}, slot(props));
  } else {
    return createVNode(Fragment, {}, slots);
  }
}
