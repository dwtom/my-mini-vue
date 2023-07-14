import { hasChanged, isObject } from '../utils';
import { trackEffects, triggerEffects, needTrack } from './effect';
import { reactive } from './reactive';

// ref类
// 通过类的get与set对简单数据类型进行依赖收集与触发更新
class RefImpl {
  private _value: any;
  public dep; // 对应唯一的属性-value
  private _rawValue: any;
  public __v_isRef = true;
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

export function isRef(ref: any) {
  // 如果是ref则有内部属性，不是ref则原本应该是undefined
  return Boolean(ref.__v_isRef);
}

export function unRef(ref: any) {
  // 是ref-返回其value
  // 不是ref-直接返回
  return isRef(ref) ? ref.value : ref;
}

export function proxyRefs(objWithRefs) {
  return new Proxy(objWithRefs, {
    get(target, key) {
      // is ref-> ref.value
      // not ref -> original value
      return unRef(Reflect.get(target, key));
    },
    set(target, key, value) {
      // 普通类型的值会同时改变原本ref的值
      if (isRef(target[key]) && !isRef(value)) {
        return (target[key].value = value);
      } else {
        return Reflect.set(target, key, value);
      }
    },
  });
}
