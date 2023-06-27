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
});
