import { ReactiveEffect } from '@mini-vue/reactivity';
import { queuePostFlushCb } from './scheduler';

// watcheffect默认在组件更新之前调用，所以与runtime是强相关的
export function watchEffect(source) {
  function job() {
    effect.run();
  }
  let cleanup;
  const onCleanup = (fn: () => void) => {
    cleanup = effect.onStop = () => {
      fn();
    };
  };
  function getter() {
    // 初始化时不调用，后续响应式值发生改变才会调用cleanup
    if (cleanup) {
      cleanup();
    }
    source(onCleanup);
  }
  const effect = new ReactiveEffect(getter, () => {
    queuePostFlushCb(job);
  });
  effect.run();

  return () => {
    effect.stop();
  };
}
