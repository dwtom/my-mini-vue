import { isProxy, isReadonly, readonly } from '../src/reactive';
import { vi } from 'vitest';

describe('readonly', () => {
  it('nested values should also readonly', () => {
    const original = { foo: 1, bar: { baz: 2 } };
    const warpped = readonly(original);
    expect(warpped).not.toBe(original);
    expect(warpped.foo).toBe(1);
    expect(isReadonly(warpped)).toBe(true);
    expect(isReadonly(original)).toBe(false);

    expect(isReadonly(warpped.bar)).toBe(true);
    expect(isReadonly(original.bar)).toBe(false);

    // readonly包裹的对象是proxy
    expect(isProxy(warpped)).toBe(true);
  });

  it('should call console.warn when set', () => {
    console.warn = vi.fn();
    const user = readonly({
      age: 10,
    });

    user.age = 11;

    expect(console.warn).toHaveBeenCalled();
  });
});
