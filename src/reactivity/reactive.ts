import {
  mutableHandlers,
  readonlyHandlers,
  shallowReadonlyHandlers,
} from './baseHandlers';

function createActiveObj(obj: any, handlers) {
  return new Proxy(obj, handlers);
}

export const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive',
  IS_READONLY = '__v_isReadonly',
}

export const reactive = (obj) => {
  return createActiveObj(obj, mutableHandlers);
};

// 使包装过的值不被更改
export const readonly = (obj) => {
  return createActiveObj(obj, readonlyHandlers);
}

export const shallowReadonly = (obj) => {
  return createActiveObj(obj, shallowReadonlyHandlers);
}

export const isReactive = (value) => {
  // 是reactive对象时触发get
  // 不是reactive对象时返回undefined
  return Boolean(value[ReactiveFlags.IS_REACTIVE]);
}

export const isReadonly = (value) => {
  return Boolean(value[ReactiveFlags.IS_READONLY]);
}