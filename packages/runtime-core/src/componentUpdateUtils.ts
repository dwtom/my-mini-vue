// 判断组件是否需要执行更新
export function shouldUpdateComponent(prevVNode, nextVNode) {
  const { props: prevProps } = prevVNode;
  const { props: nextProps } = nextVNode;

  for (const [key, val] of Object.entries(nextProps)) {
    if (val !== prevProps[key]) {
      return true;
    }
  }
  return false;
}
