import { effect } from '../effect';
import { reactive } from '../reactive';
import { isRef, proxyRefs, ref, unRef } from '../ref';

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

  // 实现isRef和unRef
  it('isRef', () => {
    const a = ref(1);
    const user = reactive({
      age: 10,
    });
    expect(isRef(a)).toBe(true);
    expect(isRef(1)).toBe(false);
    expect(isRef(user)).toBe(false);
  });

  it('unRef', () => {
    const a = ref(1);
    expect(unRef(a)).toBe(1);
    expect(unRef(1)).toBe(1);
  });

  // 实现proxyRefs
  // proxyRefs包裹的ref可以在使用时省略.value
  it('proxyRefs', () => {
    const user = {
      age: ref(10),
      name: 'zhangsan',
    };
    const proxyUser = proxyRefs(user);
    // proxyRefs的get
    expect(user.age.value).toBe(10);
    expect(proxyUser.age).toBe(10);
    // proxyRefs对象内的普通属性直接返回
    expect(proxyUser.name).toBe('zhangsan');

    // set
    // proxyRefs是引用类型，set会改变原本的ref
    proxyUser.age = 20;
    expect(proxyUser.age).toBe(20);
    expect(user.age.value).toBe(20);

    // 如果赋值是ref类型则直接替换
    proxyUser.age = ref(10);
    expect(proxyUser.age).toBe(10);
    expect(user.age.value).toBe(10);
  });
});
