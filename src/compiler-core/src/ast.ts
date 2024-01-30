import { CREATE_ELEMENT_VNODE } from './runtimeHelpers';

export enum NodeTypes {
  INTERPOLATION, // 插值
  SIMPLE_EXPRESSION, // 插值内的表达式
  ELEMENT, // element
  TEXT, // 文本
  ROOT, // 根节点
  COMPOUND_EXPRESSION, // 复合类型（既有文本又有插值）
}

// 复合类型使用
export function createVNodeCall(context, tag, props, children) {
  context.helper(CREATE_ELEMENT_VNODE);

  return {
    type: NodeTypes.ELEMENT,
    tag,
    props,
    children,
  };
}
