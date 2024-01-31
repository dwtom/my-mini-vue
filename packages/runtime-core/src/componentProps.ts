// props功能
// 1. setup接收props
// 2. 代理对象this可以获取到props内的值
// 3. props是shallowReadonly
export function initProps(instance, rawProps) {
  // 将props绑定到组件实例上
  instance.props = rawProps ?? {};
}
