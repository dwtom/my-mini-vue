import { hasOwn, isObject } from '../shared';
import { ShapeFlags } from '../shared/shapeFlags';

export function initSlots(instance, children) {
  const { vnode } = instance;
  // 这里只是简单判断是具名插槽还是普通插槽
  // 正常非具名插槽应该生成一个名称为default
  if (children && isObject(children) && !hasOwn(children, 'children')) {
    if (vnode.shapeFlag & ShapeFlags.SLOT_CHILDREN) {
      normalizeObjectSlots(children, instance.slots);
    }
  } else {
    instance.slots = normalizeSlotValue(children);
  }
}

function normalizeObjectSlots(children: any, slots: any) {
  for (const [key, value] of Object.entries(children)) {
    if (typeof value === 'function') {
      slots[key] = props => normalizeSlotValue(value(props));
    }
  }
}

function normalizeSlotValue(value) {
  return Array.isArray(value) ? value : [value];
}
