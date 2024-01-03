import { ReactiveEffect } from './effect';

class ComputedRefImpl {
  private _dirty = true;
  private _effect: ReactiveEffect;
  private _value: any;
  constructor(getter) {
    // 利用scheduler改变开关
    // 触发监听的值set -> trigger -> scheduler
    this._effect = new ReactiveEffect(getter, () => {
      if (!this._dirty) {
        this._dirty = true;
      }
    });
  }
  get value() {
    // 依赖不改变 -> 走缓存
    // 依赖改变 -> 重新执行
    if (this._dirty) {
      this._dirty = false;
      this._value = this._effect.run();
    }
    return this._value;
  }
}

export function computed(getter) {
  return new ComputedRefImpl(getter);
}
