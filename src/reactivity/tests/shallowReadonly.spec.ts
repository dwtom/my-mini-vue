/*
 * @Description: 外层对象是readonly，内层对象不是
 * @Author: Dong Wei
 * @Date: 2023-07-13 16:52:34
 * @LastEditors: Dong Wei
 * @LastEditTime: 2023-07-13 17:04:37
 * @FilePath: \my-mini-vue\src\reactivity\tests\shallowReadonly.spec.ts
 */
import { isReadonly, shallowReadonly } from '../reactive';

describe('shallowReadonly', () => {
  test('should make non-reactive properties in reactive object', () => {
    const props = shallowReadonly({ n: { foo: 1 } });
    expect(isReadonly(props)).toBe(true);
    expect(isReadonly(props.n)).toBe(false);
  });
  it('warn when call set', () => {
    console.warn = jest.fn();
    const foo = shallowReadonly({
      a: 1,
    });
    foo.a++;
    expect(console.warn).toBeCalled();
  });
});
