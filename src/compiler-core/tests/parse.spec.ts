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
});
