import { reactive } from '../reactive';
import { effect, stop } from '../effect';
describe('effect', () => {
  it('happy path', () => {
    const user = reactive({
      age: 10,
    });
    let nextAge;
    effect(() => {
      nextAge = user.age + 1;
    });
    expect(nextAge).toBe(11);
    // 触发更新
    user.age++;
    expect(nextAge).toBe(12);
  });

  // effect执行后需要返回一个函数，并返回effect传入函数的返回值
  it('should return runner when call effect', () => {
    let foo = 0;
    const runner = effect(() => {
      foo++;
      return foo;
    });
    expect(foo).toBe(1);
    const r = runner();
    expect(foo).toBe(2);
    expect(r).toBe(2);
  });

  // scheduler是一个function
  // 当effect第一次执行的时候，只执行effect内部的fn
  // 当响应式对象触发依赖set的时候不执行fn而执行scheduler
  // 当执行runner时会再次执行fn
  // 简单来说即scheduler只在触发依赖更新时代替原本的fn调用
  it('scheduler', () => {
    let dummy;
    let run: any;
    const scheduler = jest.fn(() => {
      run = runner;
    });
    const obj = reactive({ foo: 1 });
    const runner = effect(
      () => {
        dummy = obj.foo;
      },
      { scheduler }
    );
    // 第一次执行，应该触发get
    expect(scheduler).not.toHaveBeenCalled();
    expect(dummy).toBe(1);
    // 应该被trigger
    obj.foo++;
    // trigger之后执行scheduler而不执行effect的fn
    expect(scheduler).toHaveBeenCalledTimes(1);
    expect(dummy).toBe(1);
    run();
    expect(dummy).toBe(2);
  });

  // 调用stop方法后不再触发响应性，除非再次调用runner
  it('stop', () => {
    let dummy;
    const obj = reactive({ prop: 1 });
    const runner = effect(() => {
      dummy = obj.prop;
    });
    obj.prop = 2;
    expect(dummy).toBe(2);
    stop(runner);
    obj.prop = 3;
    expect(dummy).toBe(2);
    runner();
    expect(dummy).toBe(3);
    stop(runner);
    obj.prop = 4;
    expect(dummy).toBe(3); // 4
  });

  // 调用stop之后会执行onStop回调
  it('onStop', () => {
    const obj = reactive({ foo: 1 });
    const onStop = jest.fn();
    let dummy;
    const runner = effect(
      () => {
        dummy = obj.foo;
      },
      {
        onStop,
      }
    );
    stop(runner);
    expect(onStop).toBeCalledTimes(1);
  });
});
