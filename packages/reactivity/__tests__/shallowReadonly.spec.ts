import { vi } from 'vitest';
import { isReadonly, shallowReadonly } from '../src/reactive';

describe('shallowReadonly', () => {
  // 只有对象最外层的属性是readonly,内层不是
  test('should not make non-reactive properties reactive', () => {
    const props = shallowReadonly({ n: { foo: 1 } });
    expect(isReadonly(props)).toBe(true);
    expect(isReadonly(props.n)).toBe(false);
  });

  // 触发set会报错
  it('should call console.warn when set', () => {
    console.warn = vi.fn();
    const user = shallowReadonly({
      age: 10,
    });

    user.age = 11;
    expect(console.warn).toHaveBeenCalled();
  });
});
