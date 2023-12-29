let activeEffect; // effect实例
const targetMap = new Map(); // 存储依赖的最外层的map
class ReactiveEffect {
  private _fn: any;
  constructor(fn) {
    this._fn = fn;
  }
  run() {
    activeEffect = this;
    this._fn();
  }
}

export function effect(fn) {
  const _effect = new ReactiveEffect(fn);
  _effect.run();
}

// 收集依赖
export function track(target, key) {
  // 触发依赖是触发fn事件，所以收集依赖其实是收集effect和fn，然后和传入的target对象的key绑定
  // target->key->effect.fn
  // targetMap:[[target, 中间层Map]]
  // 中间层Map: [[key, effects]]
  // 最终是从targetMap中取出effects
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }
  let dep = depsMap.get(key);
  if (!dep) {
    dep = new Set();
    depsMap.set(key, dep);
  }
  dep.add(activeEffect);
}

// 触发依赖
export function trigger(target, key) {
  const depsMap = targetMap.get(target);
  let dep = depsMap.get(key);
  for (const effect of dep) {
    effect.run();
  }
}
