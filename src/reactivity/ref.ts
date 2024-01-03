// 使基础数据类型具有响应性
// 使用对象（类）包裹，通过get和set value属性进行依赖收集和触发更新
// 如果传入了一个对象，则用reactive(proxy)来处理

import { hasChanged, isObject } from '../shared';
import { trackEffects, triggerEffects, isTracking } from './effect';
import { reactive } from './reactive';

class RefImpl {
  private _value: any;
  public dep: any; // 收集effect
  private _rawValue: any; // 原始value(用于对象类型传入后比较)
  constructor(value) {
    this._value = convert(value);
    this._rawValue = value;
    this.dep = new Set();
  }

  get value() {
    trackRefValue(this);
    return this._value;
  }

  set value(newValue) {
    // 如果值没有变化则不可以触发set逻辑
    if (hasChanged(newValue, this._rawValue)) {
      this._value = convert(newValue);
      this._rawValue = newValue;
      triggerEffects(this.dep);
    }
  }
}

function trackRefValue(ref) {
  if (isTracking()) {
    trackEffects(ref.dep);
  }
}

function convert(value) {
  return isObject(value) ? reactive(value) : value;
}

export function ref(value) {
  return new RefImpl(value);
}
