import { hasOwn, isObject } from '@mini-vue/shared';
import { ShapeFlags } from '@mini-vue/shared';

export function initSlots(instance, children) {
  const { vnode } = instance;
  // 这里只是简单判断是具名插槽还是普通插槽
  // 正常非具名插槽应该生成一个名称为default,此项目暂只考虑核心逻辑
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
