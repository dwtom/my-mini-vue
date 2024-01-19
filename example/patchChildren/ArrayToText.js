// 老的是 array
// 新的是 text

import { ref, h } from '../../lib/my-mini-vue.esm.js';
const nextChildren = 'newChildren';
const prevChildren = [h('div', {}, 'A'), h('div', {}, 'B')];

export default {
  name: 'ArrayToText',
  setup() {
    const isChange = ref(false);
    window.isChange = isChange;

    return {
      isChange,
    };
  },
  render() {
    const self = this;

    const btn = h(
      'button',
      {
        onClick: () => {
          window.isChange.value = true;
        },
      },
      '更新'
    );

    return self.isChange === true
      ? h('div', {}, nextChildren)
      : h('div', {}, prevChildren);

    // return h('div', {}, [
    //   btn,
    //   self.isChange === true
    //     ? h('div', {}, nextChildren)
    //     : h('div', {}, prevChildren),
    // ]);
  },
};
