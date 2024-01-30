import { NodeTypes, createVNodeCall } from '../ast';

export function transformElement(node: any, context: any) {
  if (node.type === NodeTypes.ELEMENT) {
    return () => {
      const children = node.children;
      const vnodeTag = `'${node.tag}'`;
      let vnodeProps;
      const vnodeChildren = children[0]; // 只考虑最基础的情况

      node.codegenNode = createVNodeCall(
        context,
        vnodeTag,
        vnodeProps,
        vnodeChildren
      );
    };
  }
}
