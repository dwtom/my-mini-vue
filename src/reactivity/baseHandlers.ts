/*
 * @Description: reactive公共处理
 * @Author: Dong Wei
 * @Date: 2023-06-26 22:16:35
 * @LastEditors: Dong Wei
 * @LastEditTime: 2023-06-26 22:28:20
 * @FilePath: \my-mini-vue\src\reactivity\baseHandlers.ts
 */
import { track, trigger } from './effect';

function createGetter(isReadonly = false) {
  return function get(target, key) {
    const res = Reflect.get(target, key);
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
