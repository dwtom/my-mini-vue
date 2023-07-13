import { isReactive, reactive } from '../reactive';

describe('reactive', () => {
  it('happy path', () => {
    const original = { num: 1 };
    const observed = reactive(original);
    expect(observed).not.toBe(original);
    expect(observed.num).toBe(1);
    // isReactive
    expect(isReactive(observed)).toBe(true);
    expect(isReactive(original)).toBe(false);
  });
  // 嵌套对象响应式处理
  test('nested reactive', () => {
    const original = {
      nested: {
        foo: 1,
      },
      arr: [{ bar: 2 }],
    };
    const observed = reactive(original);
    expect(isReactive(observed.nested)).toBe(true);
    expect(isReactive(observed.arr)).toBe(true);
    expect(isReactive(observed.arr[0])).toBe(true);
  });
});
