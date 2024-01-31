// 使基础数据类型具有响应性
// 使用对象（类）包裹，通过get和set value属性进行依赖收集和触发更新
// 如果传入了一个对象，则用reactive(proxy)来处理

import { hasChanged, isObject } from '@mini-vue/shared';
import { trackEffects, triggerEffects, isTracking } from './effect';
import { reactive } from './reactive';

class RefImpl {
  private _value: any;
  public dep: any; // 收集effect
  private _rawValue: any; // 原始value(用于对象类型传入后比较)
  __v_isRef = true;
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

export function isRef(ref) {
  return !!ref.__v_isRef;
}

export function unRef(ref) {
  return isRef(ref) ? ref.value : ref;
}

// 使用ref时省略.value 用于template
// 可传入ref对象或者普通的值
// 因为proxyRefs引用了源对象，所以新对象的属性值改变会引起源对象的属性值改变
export function proxyRefs(objectWithRefs) {
  return new Proxy(objectWithRefs, {
    // ref返回.value内的值或者普通对象直接返回属性值
    get(target, key) {
      return unRef(Reflect.get(target, key));
    },
    set(target, key, value) {
      if (isRef(target[key]) && !isRef(value)) {
        return (target[key].value = value);
      } else {
        return Reflect.set(target, key, value);
      }
    },
  });
}
