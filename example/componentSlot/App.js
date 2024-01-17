import { h, createTextVNode } from '../../lib/my-mini-vue.esm.js';
import { Foo } from './Foo.js';

export const App = {
  name: 'App',
  render() {
    const app = h('div', {}, 'App');
    // 默认插槽
    // const foo = h(Foo, {}, h('p', {}, 'defaultSlot内容1'));
    // const foo = h(Foo, {}, [
    //   h('p', {}, 'defaultSlot内容1'),
    //   h('p', {}, 'defaultSlot内容2'),
    // ]);

    // 具名插槽
    const foo = h(
      Foo,
      {},
      {
        header: ({ age }) => [
          h('p', {}, `header, age: ${age}`),
          createTextVNode('纯文本'),
        ],
        footer: () => h('p', {}, 'footer'),
      }
    );

    return h('div', {}, [app, foo]);
  },

  setup() {
    return {};
  },
};
