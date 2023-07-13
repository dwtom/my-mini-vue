/*
 * @Description: 工具函数
 * @Author: Dong Wei
 * @Date: 2023-06-20 22:44:23
 * @LastEditors: Dong Wei
 * @LastEditTime: 2023-07-13 22:46:42
 * @FilePath: \my-mini-vue\src\utils\index.ts
 */
// 为对象添加属性
export const extend = Object.assign;

// 判断是否是对象
export const isObject = (obj: any) => {
  return obj !== null && typeof obj === 'object';
};

// 判断对象的属性是否有改变
export const hasChanged = (newVal, oldVal) => {
  return !Object.is(newVal, oldVal);
};
