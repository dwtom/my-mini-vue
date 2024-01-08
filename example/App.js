import { h } from '../lib/my-mini-vue.esm.js';
import { Foo } from './Foo.js';

window.self = null;
export const App = {
  render() {
    window.self = this;
    // ui
    // return h('div', { id: 'root' }, `hi,${this.msg}`);
    return h(
      'div',
      {
        id: 'root',
        onClick() {
          console.log('clicked');
        },
      },
      [
        h('p', { class: 'red' }, 'hi'),
        h('p', { class: 'blue' }, ' my-vue'),
        h(Foo, { count: 1 }),
      ]
    );
  },

  setup() {
    return {
      msg: 'mini-vue-233',
    };
  },
};
