/*
 * @Description: 公共方法
 * @Author: Dong Wei
 * @Date: 2024-01-02 14:30:34
 * @LastEditors: Dong Wei
 * @LastEditTime: 2024-01-03 11:20:19
 * @FilePath: \my-mini-vue\src\shared\index.ts
 */
export const EMPTY_OBJ = {};

export const extend = Object.assign;

export const isObject = (val: any) => {
  return val !== null && typeof val === 'object';
};

export const isString = value => typeof value === 'string';

// 两个值对比是否有变化
export const hasChanged = (value: any, oldValue: any) => {
  return !Object.is(value, oldValue);
};

// 判断对象是否包含某个属性
export const hasOwn = (obj: any, key: string) => {
  return Object.hasOwn(obj, key);
};

// 将 kebab-case格式的名称转为首字母大写的驼峰
export const camelize = (str: string) => {
  return str.replace(/-(\w)/g, (_, c) => (c ? c.toUpperCase() : ''));
};

// 事件名首字母转为大写
const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};
// 事件名拼接上 on
export const toHandleKey = (str: string) => {
  return str ? 'on' + capitalize(str) : '';
};
