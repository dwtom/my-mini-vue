import { h } from '../lib/my-mini-vue.esm.js';

window.self = null;
export const App = {
  render() {
    window.self = this;
    // ui
    return h('div', { id: 'root' }, `hi,${this.msg}`);
    // return h('div', { id: 'root' }, [
    //   h('p', { class: 'red' }, 'hi'),
    //   h('p', { class: 'blue' }, ' my-vue'),
    // ]);
  },

  setup() {
    return {
      msg: 'mini-vue-233',
    };
  },
};
