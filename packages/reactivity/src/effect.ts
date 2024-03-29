import { extend } from '@mini-vue/shared';

let activeEffect; // effect实例
let shouldTrack = false; // 是否进行依赖收集
const targetMap = new Map(); // 存储依赖的最外层的map
export class ReactiveEffect {
  private _fn: any;
  deps: Set<any>[] = []; // 收集所有的effect实例
  active = true; // 是否未调用stop方法
  public scheduler: Function | undefined;
  onStop?: () => void;
  constructor(fn, scheduler?) {
    this._fn = fn;
    this.scheduler = scheduler;
  }
  // 执行传入的fn
  run() {
    if (!this.active) {
      this.active = true; // 避免再次调用stop方法失效
      return this._fn();
    }
    shouldTrack = true;
    activeEffect = this;
    const result = this._fn();
    shouldTrack = false;
    return result;
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
  effect.deps.forEach((dep: any) => dep.delete(effect)); // 仅删除Set内的值
  effect.deps.length = 0; // 清空保存Set数组的deps
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

// 是否收集依赖
export function isTracking() {
  return shouldTrack && activeEffect !== undefined;
}

// 收集依赖
export function track(target, key) {
  // 只有调用了run方法才能收集依赖
  if (!isTracking()) {
    return;
  }
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
  trackEffects(dep);
}

export function trackEffects(dep) {
  // 如果已经收集过则不再重复收集
  if (dep.has(activeEffect)) {
    return;
  }
  dep.add(activeEffect);
  activeEffect.deps.push(dep);
}

// 触发依赖
export function trigger(target, key) {
  const depsMap = targetMap.get(target);
  let dep = depsMap.get(key);
  triggerEffects(dep);
}

export function triggerEffects(dep) {
  for (const effect of dep) {
    if (effect.scheduler) {
      effect.scheduler();
    } else {
      effect.run();
    }
  }
}
