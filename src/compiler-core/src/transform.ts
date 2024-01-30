import { NodeTypes } from './ast';
import { TO_DISPLAY_STRING } from './runtimeHelpers';

// 处理数据转义

// 通过外部传入的options实现节点信息修改,提高灵活性与可测试性
export function transform(root, options = {}) {
  const context = createTransformContext(root, options);
  traversNode(root, context);
  createRootCodegen(root);

  root.helpers = [...context.helpers.keys()];
}

// 抽离代码转义逻辑
// 创建根节点codegen
function createRootCodegen(root: any) {
  const child = root.children[0];
  if (child.type === NodeTypes.ELEMENT) {
    root.codegenNode = child.codegenNode;
  } else {
    root.codegenNode = child;
  }
}

// 保存上下文对象
function createTransformContext(root, options) {
  const context = {
    root,
    nodeTransforms: options.nodeTransforms || [],
    helpers: new Map(),
    helper(key) {
      context.helpers.set(key, 1);
    },
  };
  return context;
}

function traversNode(node: any, context: any) {
  const nodeTransforms = context.nodeTransforms;
  const exitFns: any[] = [];
  for (let i = 0; i < nodeTransforms.length; i++) {
    // 获取到nodeTransforms传入的方法并直接调用
    const nodeTransform = nodeTransforms[i];
    const onExit = nodeTransform(node, context); // 没有返回值的相当于直接执行了节点的transform
    if (onExit) {
      exitFns.push(onExit);
    }
  }

  switch (node.type) {
    case NodeTypes.INTERPOLATION:
      context.helper(TO_DISPLAY_STRING);
      break;
    case NodeTypes.ELEMENT:
    case NodeTypes.ROOT:
      traverseChildren(node, context);

    default:
      break;
  }
  // 颠倒特殊节点的transform执行顺序
  let i = exitFns.length;
  while (i--) {
    exitFns[i]();
  }
}

// 深度优先遍历节点
function traverseChildren(node: any, context: any) {
  const children = node.children;
  for (let i = 0; i < children.length; i++) {
    const node = children[i];
    traversNode(node, context); // 递归遍历子节点
  }
}
