import { extend } from "../utils";

let activeEffect;
class ReactiveEffect {
  private _fn: Function;
  deps = []; // 反向收集effect实例
  isClean = false; // 是否已经清空
  onStop?: () => void;
  // scheduler 可以从外部直接获取到
  constructor(fn: Function, public scheduler?) {
    this._fn = fn;
    this.scheduler = scheduler;
  }

  run() {
    activeEffect = this;
    return this._fn();
  }
  stop() {
    if (!this.isClean) {
      cleanUpEffect(this);
      if (this.onStop) {
        this.onStop()
      }
      this.isClean = true
    }
    
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
  if (!activeEffect) {
    return;
  }
  dep.add(activeEffect);
  activeEffect.deps.push(dep);
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
  extend(effectItem, options); // 把options的属性挂到effct实例上
  effectItem.run();
  const runner: any = effectItem.run.bind(effectItem);
  runner.effect = effectItem; // 挂载到runner上
  return runner;
}

export function stop(runner) {
  runner.effect.stop();
}

function cleanUpEffect(effect: ReactiveEffect) {
  effect.deps.forEach((dep: any) => {
    dep.delete(effect);
  });
}
