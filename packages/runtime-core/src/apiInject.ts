import { getCurrentInstance } from './component';

// 需在setup中才能调用
// 保存属性
export function provide(key, value) {
  const currentInstance: any = getCurrentInstance();

  if (currentInstance) {
    let { provides } = currentInstance;
    const parentProvides = currentInstance.parent.provides;
    // 初始化时将当前组件的provides的原型指向父组件的provides,组成原型链
    if (provides === parentProvides) {
      provides = currentInstance.provides = Object.create(parentProvides);
    }
    provides[key] = value;
  }
}

// 取出
export function inject(key, defaultValue?) {
  const currentInstance: any = getCurrentInstance();
  if (currentInstance) {
    const parentProvides = currentInstance.parent.provides;
    if (key in parentProvides) {
      // 需要找到继承于更上一级的属性
      return parentProvides[key];
    } else if (defaultValue) {
      // 如果子组件使用时没有在父组件找到对应属性，则使用传入的值/函数返回值
      if (typeof defaultValue === 'function') {
        return defaultValue();
      }
      return defaultValue;
    }
  }
}
