import { camelize, toHandleKey } from '@mini-vue/shared';

// 组件触发事件
// rawArgs用户传入的其它参数
export function emit(instance: any, event: string, ...rawArgs: any[]): void {
  const { props } = instance;

  const handlerName = toHandleKey(camelize(event));

  const handler = props[handlerName];
  handler && handler(...rawArgs);
}
