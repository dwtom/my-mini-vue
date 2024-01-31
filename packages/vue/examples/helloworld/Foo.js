import { h } from '../../dist/my-mini-vue.esm.js';
export const Foo = {
  setup(props) {
    // console.log(props);
    // props.count++; // 尝试修改props的值
  },
  render() {
    return h('div', {}, `foo：${this.count}`);
  },
};
