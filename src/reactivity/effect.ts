import { extend } from '../utils';

let activeEffect; // effect实例
const targetMap = new Map(); // 存储依赖的最外层的map
class ReactiveEffect {
  private _fn: any;
  deps: Set<any>[] = []; // 收集所有的effect实例
  active = true;
  public scheduler: Function | undefined;
  onStop?: () => void;
  constructor(fn, scheduler?) {
    this._fn = fn;
    this.scheduler = scheduler;
  }
  run() {
    activeEffect = this;
    this.active = true; // 避免再次调用stop方法失效
    return this._fn();
  }
  stop() {
    if (this.active) {
      cleanupDeps(this);
      if (this.onStop) {
        this.onStop();
      }
      this.active = false;
    }
  }
}

function cleanupDeps(effect) {
  effect.deps.forEach((dep: any) => dep.delete(effect));
}

export function effect(fn, options: any = {}) {
  const _effect = new ReactiveEffect(fn, options.scheduler);
  // 将options中的内容挂载到effect实例上
  extend(_effect, options);
  _effect.run();
  const runner: any = _effect.run.bind(_effect);
  // 将effect实例挂载到runner上，便于后续调用stop方法
  runner.effect = _effect;
  return runner;
}

export function stop(runner) {
  runner.effect.stop();
}

// 收集依赖
export function track(target, key) {
  // 触发依赖是触发fn事件，所以收集依赖其实是收集effect和fn，然后和传入的target对象的key绑定
  // target->key->effect.fn
  // targetMap:[[target, 中间层Map]]
  // 中间层Map: [[key, effects]]
  // 最终效果是从targetMap中取出effects
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
export function trigger(target, key) {
  const depsMap = targetMap.get(target);
  let dep = depsMap.get(key);
  for (const effect of dep) {
    if (effect.scheduler) {
      effect.scheduler();
    } else {
      effect.run();
    }
  }
}
