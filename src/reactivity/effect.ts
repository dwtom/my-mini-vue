import { extend } from '../utils';

let activeEffect;
let shouldTrack; // 是否应该收集依赖调用stop后不应收集
class ReactiveEffect {
  private _fn: Function;
  deps = []; // 反向收集effect实例
  isStopped = false; // 是否已清空响应式收集(调用过stop方法)
  onStop?: () => void;
  // scheduler 可以从外部直接获取到
  constructor(fn: Function, public scheduler?) {
    this._fn = fn;
    this.scheduler = scheduler;
  }

  run() {
    if (this.isStopped) {
      return this._fn();
    }
    // 不是stop状态时
    shouldTrack = true;
    activeEffect = this;
    const result = this._fn();
    // 执行完之后重置状态
    shouldTrack = false;
    return result;
  }
  stop() {
    if (!this.isStopped) {
      cleanUpEffect(this);
      if (this.onStop) {
        this.onStop();
      }
      this.isStopped = true;
    }
  }
}

// 收集依赖
const targetMap = new Map();
export function track(target: object, key: string | symbol) {
  if (!needTrack()) {
    return;
  }
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
  trackEffects(dep);
}

export function trackEffects(dep) {
  if (dep.has(activeEffect)) {
    return;
  }
  dep.add(activeEffect);
  activeEffect.deps.push(dep);
}

// 是否需要track
export function needTrack() {
  return activeEffect !== undefined && shouldTrack;
}

// 触发依赖
export function trigger(target: object, key: string | symbol) {
  const depsMap = targetMap.get(target);
  const dep = depsMap.get(key);
  triggerEffects(dep);
}

export function triggerEffects(dep) {
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
  // 返回run方法，并将effect实例作为this绑定
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
  effect.deps.length = 0;
}
