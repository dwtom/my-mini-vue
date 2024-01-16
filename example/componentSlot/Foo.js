import { h, renderSlots } from '../../lib/my-mini-vue.esm.js';

export const Foo = {
  setup() {
    return {};
  },
  render() {
    const foo = h('p', {}, 'foo');
    const age = 18;
    // console.log(this.$slots);

    // 渲染一个默认的slots,slots可以是多个节点
    return h('div', {}, [foo, renderSlots(this.$slots)]);

    // 具名插槽
    // return h('div', {}, [
    //   renderSlots(this.$slots, 'header'),
    //   foo,
    //   renderSlots(this.$slots, 'footer'),
    // ]);

    // 作用域插槽
    // return h('div', {}, [
    //   renderSlots(this.$slots, 'header', { age }),
    //   foo,
    //   renderSlots(this.$slots, 'footer'),
    // ]);
  },
};
