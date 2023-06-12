let activeEffect;
class ReactiveEffect {
  private _fn: Function;
  // scheduler 可以直接获取到
  constructor(fn: Function, public scheduler?) {
    this._fn = fn;
  }

  run() {
    activeEffect = this;
    return this._fn();
  }
}

// 收集依赖
const targetMap = new Map();
export function track(target: object, key: string | symbol) {
  // targetMap存放target与depsMap(中间变量)对应关系
  // depsMap存放key与dep对应关系
  // dep收集effect实例对象-即对象属性变化的方法
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
export function trigger(target: object, key: string | symbol) {
  const depsMap = targetMap.get(target);
  const dep = depsMap.get(key);
  for (const effectItem of dep) {
    if (effectItem.scheduler) {
      effectItem.scheduler();
    } else {
      effectItem.run();
    }
  }
}

export function effect(fn: Function, options: any = {}) {
  const effectItem = new ReactiveEffect(fn, options.scheduler);
  effectItem.run();
  return effectItem.run.bind(effectItem);
}
