import { NodeTypes } from '../src/ast';
import { baseParse } from '../src/parse';

describe('Parse', () => {
  // 插值
  describe('interpolation', () => {
    test('simple interpolation', () => {
      // ast根节点
      const ast = baseParse('{{ message }}');

      expect(ast.children[0]).toStrictEqual({
        type: NodeTypes.INTERPOLATION,
        content: {
          type: NodeTypes.SIMPLE_EXPRESSION,
          content: 'message', // 获取到插值最内层的值
        },
      });
    });
  });

  describe('element', () => {
    it('simple element div', () => {
      const ast = baseParse('<div></div>');

      expect(ast.children[0]).toStrictEqual({
        type: NodeTypes.ELEMENT,
        tag: 'div',
        children: [],
      });
    });
  });

  // 解析字符串
  describe('text', () => {
    it('simple text', () => {
      const ast = baseParse('some text');

      expect(ast.children[0]).toStrictEqual({
        type: NodeTypes.TEXT,
        content: 'some text',
      });
    });
  });

  test('hello world', () => {
    const ast = baseParse('<div>hi,{{message}}</div>');

    expect(ast.children[0]).toStrictEqual({
      type: NodeTypes.ELEMENT,
      tag: 'div',
      children: [
        {
          type: NodeTypes.TEXT,
          content: 'hi,',
        },
        {
          type: NodeTypes.INTERPOLATION,
          content: {
            type: NodeTypes.SIMPLE_EXPRESSION,
            content: 'message',
          },
        },
      ],
    });
  });

  // 标签嵌标签
  test('Nested element ', () => {
    const ast = baseParse('<div><p>hi</p>{{message}}</div>');

    expect(ast.children[0]).toStrictEqual({
      type: NodeTypes.ELEMENT,
      tag: 'div',
      children: [
        {
          type: NodeTypes.ELEMENT,
          tag: 'p',
          children: [
            {
              type: NodeTypes.TEXT,
              content: 'hi',
            },
          ],
        },
        {
          type: NodeTypes.INTERPOLATION,
          content: {
            type: NodeTypes.SIMPLE_EXPRESSION,
            content: 'message',
          },
        },
      ],
    });
  });

  test('should throw error when lack end tag', () => {
    expect(() => {
      baseParse('<div><span></div>');
    }).toThrow(`缺少结束标签:span`);
  });
});
