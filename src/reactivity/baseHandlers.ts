import { track, trigger } from './effect';

type ProxyKey = string | symbol;

const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);

function createGetter(isReadonly = false) {
  return function get(target: any, key: ProxyKey) {
    const res = Reflect.get(target, key);
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
