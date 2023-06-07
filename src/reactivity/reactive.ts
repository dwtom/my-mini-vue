import { track, trigger } from "./effect";

export const reactive = (obj: any) => {
  return new Proxy(obj, {
    get(target, key) {
      const res = Reflect.get(target, key);
      track(target, key);
      return res;
    },

    set(target, key, value) {
      const res = Reflect.set(target, key, value);
      trigger(target, key);
      return res;
    },
  });
};
