import { effect } from '../effect';
import { ref } from '../ref';

describe('ref', () => {
  // ref基本结构
  it('happy path', () => {
    const a = ref(1);
    expect(a.value).toBe(1);
  });
  // 初步实现响应式基本数据类型
  it('should be reactive', () => {
    const a = ref(1);
    let dummy;
    let calls = 0;
    effect(() => {
      calls++;
      dummy = a.value;
    });
    expect(calls).toBe(1);
    expect(dummy).toBe(1);
    a.value = 2;
    expect(calls).toBe(2);
    expect(dummy).toBe(2);
    // 赋相同的值不可重复触发
    a.value = 2;
    expect(calls).toBe(2);
    expect(dummy).toBe(2);
  });

  // 实现响应式对象
  it('should make nested props reactive', () => {
    const a = ref({
      count: 1,
    });
    let dummy;
    effect(() => {
      dummy = a.value.count;
    });
    expect(dummy).toBe(1);
    a.value.count = 2;
    expect(dummy).toBe(2);
  });
});
