import {
  readonlyHandlers,
  mutableHandlers,
  shallowReadonlyHandlers,
} from './baseHandlers';

export const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive',
  IS_READONLY = '__v_isReadonly',
}

export function reactive(target) {
  return createReactiveObject(target, mutableHandlers);
}

export function readonly(target) {
  return createReactiveObject(target, readonlyHandlers);
}

// 只有对象最外层的属性是readonly,内层不是
export function shallowReadonly(target) {
  return createReactiveObject(target, shallowReadonlyHandlers);
}

export function isReactive(target) {
  return !!target[ReactiveFlags.IS_REACTIVE];
}

export function isReadonly(target) {
  return !!target[ReactiveFlags.IS_READONLY];
}

export function isProxy(target) {
  return isReactive(target) || isReadonly(target);
}

function createReactiveObject(target, baseHandlers) {
  return new Proxy(target, baseHandlers);
}
