/*
 * @Description: 公共方法
 * @Author: Dong Wei
 * @Date: 2024-01-02 14:30:34
 * @LastEditors: Dong Wei
 * @LastEditTime: 2024-01-03 09:53:05
 * @FilePath: \my-mini-vue\src\shared\index.ts
 */
export const extend = Object.assign;

export const isObject = (val: any) => {
  return val !== null && typeof val === 'object';
};
