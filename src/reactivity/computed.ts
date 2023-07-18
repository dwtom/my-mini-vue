import { ReactiveEffect } from './effect';

export class ComputedRefImpl {
  // private _getter: any;
  private _dirty: any = true; // 值为false表示已经缓存，下次调用时不会重新计算值
  private _value: any; // 保存缓存值
  private _effect: ReactiveEffect;
  constructor(getter) {
    // this._getter = getter;
    // 通过effect收集依赖的响应式对象的更新，并且通过scheduler处理保持缓存
    this._effect = new ReactiveEffect(getter, () => {
      if (!this._dirty) {
        this._dirty = true;
      }
    });
  }

  get value() {
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
