import { NodeTypes } from './ast';

export function baseParse(content: string) {
  const context = createParserContext(content);
  return createRoot(parseChildren(context));
}

// 生成各个子节点
function parseChildren(context) {
  const nodes: any[] = [];
  let node;
  if (context.source.startsWith('{{')) {
    // 解析插值
    node = parseInterpolation(context);
  }
  nodes.push(node);
  return nodes;
}

// 解析插值
function parseInterpolation(context) {
  const openDelimiter = '{{';
  const closeDelimiter = '}}';

  // 找到插值结尾的括号的索引
  // 从第二位开始查找,前两个括号不需要
  const closeIndex = context.source.indexOf(
    openDelimiter,
    openDelimiter.length
  );

  advanceBy(context, openDelimiter.length); // 去掉前两个括号
  const rawContentLength = closeIndex - openDelimiter.length; // 获取插值内容的长度
  const rawContent = context.source.slice(0, rawContentLength); // 获取插值内容
  const content = rawContent.trim(); // 去除空格

  advanceBy(context, rawContentLength + closeDelimiter.length); // 删除当前插值内容,解析下一个内容
  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      type: NodeTypes.SIMPLE_EXPRESSION,
      content,
    },
  };
}

// 解析推进流程
function advanceBy(context, length) {
  context.source = context.source.slice(length);
}

// 创建根节点
function createRoot(children) {
  return {
    children,
  };
}

// 创建全局上下文对象
function createParserContext(content: string) {
  return {
    source: content,
  };
}
