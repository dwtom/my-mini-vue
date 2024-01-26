// 生成render函数
// https://template-explorer.vuejs.org/#eyJzcmMiOiJoaSIsInNzciI6ZmFsc2UsIm9wdGlvbnMiOnsiaG9pc3RTdGF0aWMiOnRydWV9fQ==
export function generate(ast) {
  const context = createCodegenContext();
  const { push } = context;

  push('return ');
  const functionName = 'render';
  const args = ['_ctx', '_cache'];
  const signature = args.join(', ');

  push(`function ${functionName}(${signature}){`);
  push('return ');

  genNode(ast.codegenNode, context);
  push('}');

  // console.log('-----------------', context.code);

  return {
    code: context.code,
  };
}

function createCodegenContext(): any {
  const context = {
    code: '',
    // 封装字符串拼接
    push(source: string) {
      context.code += source;
    },
  };
  return context;
}

function genNode(node: any, context: any) {
  const { push } = context;
  push(`'${node.content}'`);
}
