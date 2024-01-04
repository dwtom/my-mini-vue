import { h } from '../lib/my-mini-vue.esm.js';

export const App = {
  render() {
    // ui
    // return h('div', { id: 'root' }, 'hi, mini-vue');
    return h('div', { id: 'root' }, [
      h('p', { class: 'red' }, 'hi'),
      h('p', { class: 'blue' }, ' my-vue'),
    ]);
  },

  setup() {
    return {
      msg: 'mini-vue',
    };
  },
};
