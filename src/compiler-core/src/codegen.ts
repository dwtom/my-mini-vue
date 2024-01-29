import { NodeTypes } from './ast';
import { TO_DISPLAY_STRING, helperMapName } from './runtimeHelpers';

// https://template-explorer.vuejs.org/#eyJzcmMiOiJoaSIsInNzciI6ZmFsc2UsIm9wdGlvbnMiOnsiaG9pc3RTdGF0aWMiOnRydWV9fQ==

// 读取数据,生成render函数
export function generate(ast) {
  const context = createCodegenContext();
  const { push } = context;

  genFunctionPreamble(ast, context);

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

// 生成前导符
function genFunctionPreamble(ast, context) {
  const { push } = context;
  const _Vue = 'Vue';
  const aliasHelper = s => `${helperMapName[s]}: _${helperMapName[s]}`;
  if (ast.helpers.length) {
    push(`const { ${ast.helpers.map(aliasHelper).join(', ')} } = ${_Vue}`);
  }
  push('\n');
  push('return ');
}

// 生成全局上下文对象
function createCodegenContext(): any {
  const context = {
    code: '',
    // 封装字符串拼接
    push(source: string) {
      context.code += source;
    },
    helper(key) {
      return `_${helperMapName[key]}`;
    },
  };
  return context;
}

function genNode(node: any, context: any) {
  switch (node.type) {
    case NodeTypes.TEXT:
      genText(node, context);
      break;
    case NodeTypes.INTERPOLATION:
      genInterpolation(node, context);
      break;
    case NodeTypes.SIMPLE_EXPRESSION:
      genExpression(node, context);
      break;
    default:
      break;
  }
}

function genText(node, context) {
  const { push } = context;
  push(`'${node.content}'`);
}

function genInterpolation(node, context) {
  const { push, helper } = context;
  push(`${helper(TO_DISPLAY_STRING)}(`);
  genNode(node.content, context);
  push(')');
}
function genExpression(node: any, context: any) {
  const { push } = context;
  push(`${node.content}`);
}
