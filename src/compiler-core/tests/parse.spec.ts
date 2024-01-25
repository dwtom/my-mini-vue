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
      const ast = baseParse('<input />');

      expect(ast.children[0]).toStrictEqual({
        type: NodeTypes.ELEMENT,
        tag: 'input',
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
});
