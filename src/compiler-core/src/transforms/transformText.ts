import { NodeTypes } from '../ast';
import { isText } from '../utils';

// 转换复合节点（文本+插值）
export function transformText(node) {
  if (node.type === NodeTypes.ELEMENT) {
    return () => {
      const { children } = node;
      let currentContainer;
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (isText(child)) {
          // 如果遍历到复合节点的子集类型，则继续遍历后续节点找出完整的复合类型
          for (let j = i + 1; j < children.length; j++) {
            const next = children[j];
            if (isText(next)) {
              if (!currentContainer) {
                // 找到完整复合类型，则使用复合类型替换掉原本的第一个节点(使用复合类型替换复合类型内的第一个节点原本占的位置)
                currentContainer = children[i] = {
                  type: NodeTypes.COMPOUND_EXPRESSION,
                  children: [child],
                };
              }
              currentContainer.children.push(' + ', next);
              children.splice(j, 1); // 删除原本的后续节点
              j--; // 指针回到正确的位置
            } else {
              currentContainer = undefined; // 没有找到完整复合类型，则重置currentContainer
              break;
            }
          }
        }
      }
    };
  }
}
