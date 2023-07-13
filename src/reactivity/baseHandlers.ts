/*
 * @Description: reactive公共处理
 * @Author: Dong Wei
 * @Date: 2023-06-26 22:16:35
 * @LastEditors: Dong Wei
 * @LastEditTime: 2023-07-13 17:06:26
 * @FilePath: \my-mini-vue\src\reactivity\baseHandlers.ts
 */
import { isObject, extend } from '../utils';
import { track, trigger } from './effect';
import { ReactiveFlags, reactive, readonly } from './reactive';

function createGetter(isReadonly = false, shallow = false) {
  return function get(target, key) {
    const res = Reflect.get(target, key);
    if (key === ReactiveFlags.IS_REACTIVE) {
      // 触发isReactive方法
      return !isReadonly;
    } else if (key === ReactiveFlags.IS_READONLY) {
      // 触发isReadonly方法
      return isReadonly;
    }
    // 如果是shallow则直接返回
    if (shallow) {
      return res;
    }
    // 如果是嵌套对象则继续包装
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
  return function set(target, key, value) {
    const res = Reflect.set(target, key, value);
    trigger(target, key);
    return res;
  };
}

const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);

export const mutableHandlers = {
  get,
  set,
};

export const readonlyHandlers = {
  get: readonlyGet,
  set(target, key, value) {
    console.warn(`${String(key)}不可被修改,因为${target}是readonly`);
    return true;
  },
};

export const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
  get: shallowReadonlyGet,
});
