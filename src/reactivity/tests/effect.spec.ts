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
