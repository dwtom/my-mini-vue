import { hasChanged, isObject } from '../utils';
import { trackEffects, triggerEffects, needTrack } from './effect';
import { reactive } from './reactive';

// ref类
// 通过类的get与set对简单数据类型进行依赖收集与触发更新
class RefImpl {
  private _value: any;
  public dep; // 对应唯一的属性-value
  private _rawValue: any;
  constructor(value) {
    this._rawValue = value; // 保存原始值
    // 如果是对象则用reactive包裹，简单数据类型直接保存
    this._value = convert(value);
    this.dep = new Set();
  }

  get value() {
    trackRefValue(this);
    return this._value;
  }

  set value(newValue) {
    // 新值只能和原始值作比较，保存后的值是proxy
    if (hasChanged(newValue, this._rawValue)) {
      this._rawValue = newValue; // 更新原始值
      this._value = isObject(newValue) ? reactive(newValue) : newValue;
      this._value = convert(newValue);
      triggerEffects(this.dep);
    }
  }
}

// 代码抽取-收集响应式依赖
function trackRefValue(ref) {
  if (needTrack()) {
    trackEffects(ref.dep);
  }
}

// 代码抽取-value判断赋值
function convert(value) {
  return isObject(value) ? reactive(value) : value;
}

export function ref(value) {
  return new RefImpl(value);
}
