import { NodeTypes } from './ast';

enum TagType {
  Start,
  End,
}

export function baseParse(content: string) {
  const context = createParserContext(content);
  return createRoot(parseChildren(context, []));
}

// 生成各个子节点
function parseChildren(context, ancestors) {
  const nodes: any[] = [];
  while (!isEnd(context, ancestors)) {
    let node;
    const s = context.source;
    if (s.startsWith('{{')) {
      // 解析插值
      node = parseInterpolation(context);
    } else if (s[0] === '<') {
      // 解析element
      if (/[a-z]/i.test(s[1])) {
        node = parseElement(context, ancestors);
      }
    }

    // 如果没有命中插值和标签则认为是text类型
    if (!node) {
      node = parseText(context);
    }
    nodes.push(node);
  }

  return nodes;
}

// 停止循环解析children内部内容
function isEnd(context, ancestors) {
  const s = context.source;
  // 遇见结束标签
  if (s.startsWith('</')) {
    // 与历史值依次比较，避免有未填写结束标签的情况
    for (let i = ancestors.length - 1; i >= 0; i--) {
      const tag = ancestors[i].tag;
      if (startsWidthEndTagOpen(s, tag)) {
        return true;
      }
    }
  }
  // source没有值
  return !s;
}

// 解析text类型
function parseText(context) {
  // 遇到插值类型则停止解析
  let endIndex = context.source.length; // text类型的结束点
  let endTokens = ['{{', '<'];

  for (let i = 0; i < endTokens.length; i++) {
    let index = context.source.indexOf(endTokens[i]);
    // 指针停在text后离text最近的地方
    if (index !== -1 && endIndex > index) {
      endIndex = index;
    }
  }

  const content = parseTextData(context, endIndex);

  // console.log('----------', content);
  return {
    type: NodeTypes.TEXT,
    content,
  };
}

// 解析最内部的文本
function parseTextData(context, length) {
  const content = context.source.slice(0, length);

  advanceBy(context, length); // 解析流程向前推进
  return content;
}

// 解析element类型
function parseElement(context, ancestors) {
  // 解析正常的tag 如<div></div>
  const element: any = parseTag(context, TagType.Start);
  ancestors.push(element); // 收集解析过的element
  // 生成element内部的children 递归处理
  element.children = parseChildren(context, ancestors);

  ancestors.pop(); // 处理完后删除element

  if (startsWidthEndTagOpen(context.source, element.tag)) {
    parseTag(context, TagType.End); // 解析尾标签并删除
  } else {
    throw new Error(`缺少结束标签:${element.tag}`);
  }
  return element;
}

function startsWidthEndTagOpen(source, tag) {
  return (
    source.startsWith('</') &&
    source.slice(2, 2 + tag.length).toLowerCase() === tag
  );
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
    closeDelimiter,
    openDelimiter.length
  );

  advanceBy(context, openDelimiter.length); // 去掉前两个括号
  const rawContentLength = closeIndex - openDelimiter.length; // 获取插值内容的长度
  const rawContent = parseTextData(context, rawContentLength); // 获取插值内容，并推进解析
  const content = rawContent.trim(); // 去除空格

  advanceBy(context, closeDelimiter.length); // 删除}},解析下一个内容
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
