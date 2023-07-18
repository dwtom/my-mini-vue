import { computed } from '../computed';
import { reactive } from '../reactive';

describe('computed', () => {
  it('happy path', () => {
    const user = reactive({
      age: 1,
    });
    // 实现computed连接至响应式属性，通过value读取其值
    const age = computed(() => {
      return user.age;
    });
    expect(age.value).toBe(1);
  });

  it('should compute lazily', () => {
    const value = reactive({
      foo: 1,
    });
    const getter = jest.fn(() => {
      return value.foo;
    });
    const cValue = computed(getter);

    // lazy
    // 只有调用计算属性的值才会触发getter
    expect(getter).not.toHaveBeenCalled();

    expect(cValue.value).toBe(1);
    expect(getter).toHaveBeenCalledTimes(1);

    // 触发get，但是computed会有缓存
    cValue.value;
    expect(getter).toHaveBeenCalledTimes(1);

    // 触发computed之后才会被调用
    // 响应式对象trigger -> 通过effect收集并更新 -> 触发get
    value.foo = 2
    expect(getter).toHaveBeenCalledTimes(1);

    expect(cValue.value).toBe(2);
    expect(getter).toHaveBeenCalledTimes(2);

    // 值未改变则不会重复触发计算
    cValue.value
    expect(getter).toHaveBeenCalledTimes(2);
  });
});
