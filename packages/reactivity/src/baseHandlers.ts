import { extend, isObject } from '@mini-vue/shared';
import { track, trigger } from './effect';
import { ReactiveFlags, reactive, readonly } from './reactive';

type ProxyKey = string | symbol;

const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter({ isReadonly: true });
const shallowReadonlyGet = createGetter({ shallow: true, isReadonly: true });

function createGetter({ isReadonly = false, shallow = false } = {}) {
  return function get(target: any, key: ProxyKey) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly;
    } else if (key === ReactiveFlags.IS_READONLY) {
      return isReadonly;
    }
    const res = Reflect.get(target, key);

    if (shallow) {
      return res;
    }

    // 多层对象需要继续包裹实现响应性
    if (isObject(res)) {
      return isReadonly ? readonly(res) : reactive(res);
    }

    if (!isReadonly) {
      track(target, key);
    }
    return res;
  };
}

function createSetter() {
  return function set(target: any, key: ProxyKey, value: any) {
    const res = Reflect.set(target, key, value);
    trigger(target, key);
    return res;
  };
}

export const mutableHandlers = {
  get,
  set,
};

export const readonlyHandlers = {
  get: readonlyGet,
  set(target: any, key: ProxyKey) {
    console.warn(
      `key: ${String(key)} 设置失败，readonly类型的属性是只读的`,
      target
    );
    return true;
  },
};

export const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
  get: shallowReadonlyGet,
});
