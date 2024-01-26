// 通过外部传入的options实现节点信息修改,提高灵活性与可测试性
export function transform(root, options) {
  const context = createTransformContext(root, options);
  traversNode(root, context);
}

// 保存上下文对象
function createTransformContext(root, options) {
  const context = {
    root,
    nodeTransforms: options.nodeTransforms || [],
  };
  return context;
}

function traversNode(node: any, context: any) {
  const nodeTransforms = context.nodeTransforms;
  for (let i = 0; i < nodeTransforms.length; i++) {
    // 获取到nodeTransforms传入的方法并直接调用
    const nodeTransform = nodeTransforms[i];
    nodeTransform(node);
  }

  traverseChildren(node, context);
}

// 深度优先遍历节点
function traverseChildren(node: any, context: any) {
  const children = node.children;
  if (children) {
    for (let i = 0; i < children.length; i++) {
      const node = children[i];
      traversNode(node, context); // 递归遍历子节点
    }
  }
}
