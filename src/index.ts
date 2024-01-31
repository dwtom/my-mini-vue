import { registerRuntimeCompiler } from './runtime-dom';
import { baseCompiler } from './compiler-core/src';
import * as runtimeDom from './runtime-dom';

function compilerToFunction(template: string) {
  const { code } = baseCompiler(template);

  // https://github.com/vuejs/core/blob/main/.github/contributing.md#package-dependencies
  // compiler-core想引用runtime中的方法，必须通过vue中转

  // vue-参数; code-函数体; 传入runtime-dom指代vue
  const render = new Function('Vue', code)(runtimeDom);
  return render;
}

registerRuntimeCompiler(compilerToFunction);

// 实际生成的render函数 即为renderFn(Vue)
function renderFn(Vue) {
  const {
    toDisplayString: _toDisplayString,
    createElementVNode: _createElementVNode,
  } = Vue; // Vue -> runtime-dom -> runtime-core
  return function render(_ctx, _cache) {
    return _createElementVNode(
      'div',
      null,
      'hi,' + _toDisplayString(_ctx.message)
    );
  };
}

export * from './runtime-dom';
