import { effect } from '../effect';
import { reactive } from '../reactive';

describe('effect', () => {
  it('happy path', () => {
    const obj = reactive({
      num: 1,
    });
    let next;
    effect(() => {
      next = obj.num + 1;
    });
    expect(next).toBe(2);

    obj.num++;
    expect(next).toBe(3);
  });
});
