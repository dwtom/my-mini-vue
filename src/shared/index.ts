/*
 * @Description: 公共方法
 * @Author: Dong Wei
 * @Date: 2024-01-02 14:30:34
 * @LastEditors: Dong Wei
 * @LastEditTime: 2024-01-03 11:20:19
 * @FilePath: \my-mini-vue\src\shared\index.ts
 */
export const extend = Object.assign;

export const isObject = (val: any) => {
  return val !== null && typeof val === 'object';
};

// 两个值对比是否有变化
export const hasChanged = (value: any, oldValue: any) => {
  return !Object.is(value, oldValue);
};

// 判断对象是否包含某个属性
export const hasOwn = (obj: any, key: string) => {
  return Object.hasOwn(obj, key);
};
