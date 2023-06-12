import { effect } from '../effect';
import { reactive } from '../reactive';

describe('effect', () => {
  // 实现effect基础功能-收集依赖、触发依赖
  it('happy path', () => {
    const obj = reactive({
      num: 1,
    });
    let next;
    effect(() => {
      next = obj.num * 2;
    });
    expect(next).toBe(2);

    obj.num++;
    // 此处应该理解为effect方法调用了第二次，而不是单纯去看next值
    expect(next).toBe(4);
  });

  // 实现调用effct时返回调用函数的返回值
  it('call effect return runnerFn result', () => {
    let foo = 1;
    const fn = effect(() => {
      foo++;
      return 'foo';
    });
    expect(foo).toBe(2);
    const res = fn();
    expect(foo).toBe(3);
    expect(res).toBe('foo');
  });
});

// 实现scheduler
// 1.通过effect的第二个参数传入，是一个函数
// 2.effect第一次执行时只执行第一个fn
// 3.响应式对象update时不执行fn而是执行scheduler
// 4.当执行runner时才会再次执行fn
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
  // 第一次赋值时scheduler未调用
  expect(scheduler).not.toHaveBeenCalled();
  expect(dummy).toBe(1);
  obj.foo++;
  // update时fn未被调用而是调用scheduler
  expect(dummy).toBe(1);
  expect(scheduler).toHaveBeenCalledTimes(1);
  run();
  expect(dummy).toBe(2);
});
