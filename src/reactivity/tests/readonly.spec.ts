import { isReadonly, readonly } from '../reactive';

describe('readonly', () => {
  // readonly只复制
  it('happy path', () => {
    const original = { foo: 1, bar: { baz: 2 } };
    const wrapped = readonly(original);
    expect(wrapped).not.toBe(original);
    expect(wrapped.foo).toBe(1);
    // isReadonly
    expect(isReadonly(wrapped)).toBe(true);
    expect(isReadonly(original)).toBe(false);
  });

  it('warn when call set', () => {
    console.warn = jest.fn();
    const foo = readonly({
      a: 1,
    });
    foo.a++;
    expect(console.warn).toBeCalled();
  });
});
