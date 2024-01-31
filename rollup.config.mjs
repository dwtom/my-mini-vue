import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';

export default {
  input: './packages/vue/src/index.ts',
  output: [
    {
      // esm
      format: 'es',
      file: 'packages/vue/dist/my-mini-vue.esm.js',
    },
    {
      // commonjs
      format: 'cjs',
      file: 'packages/vue/dist/my-mini-vue.cjs.js',
    },
  ],
  plugins: [
    typescript(),
    // terser()
  ],
};
