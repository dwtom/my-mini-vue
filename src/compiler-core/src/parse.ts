import { NodeTypes } from './ast';

enum TagType {
  Start,
  End,
}

export function baseParse(content: string) {
  const context = createParserContext(content);
  return createRoot(parseChildren(context));
}

// 生成各个子节点
function parseChildren(context) {
  const nodes: any[] = [];
  let node;
  const s = context.source;
  if (s.startsWith('{{')) {
    // 解析插值
    node = parseInterpolation(context);
  } else if (s[0] === '<') {
    // 解析element
    if (/[a-z]/i.test(s[1])) {
      node = parseElement(context);
    }
  }
  nodes.push(node);
  return nodes;
}

// 解析element类型
function parseElement(context) {
  // 解析正常的tag 如<div></div>
  const element = parseTag(context, TagType.Start);

  parseTag(context, TagType.End); // 解析尾标签并删除
  return element;
}

// 解析tag
function parseTag(context, type: TagType) {
  // 以'<'开头，第一位是字母或者/，忽略大小写
  const match: any = /^<\/?([a-z]*)/i.exec(context.source);
  const tag = match?.[1] ?? '';

  if (match && match.length) {
    // 删除<xxx>或</xxx>
    advanceBy(context, match[0].length);
    advanceBy(context, 1);
  } else {
    // 此处只做了一个特例，实际还有没有考虑到的情况
    advanceBy(context, 2); // 删除自闭合标签 />
  }

  if (type === TagType.End) {
    return;
  }
  return {
    type: NodeTypes.ELEMENT,
    tag,
  };
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

// 推进解析流程
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
