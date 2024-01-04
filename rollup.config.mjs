import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';

export default {
  input: './src/index.ts',
  output: [
    {
      // esm
      format: 'es',
      file: 'lib/my-mini-vue.esm.js',
    },
    {
      // commonjs
      format: 'cjs',
      file: 'lib/my-mini-vue.cjs.js',
    },
  ],
  plugins: [
    typescript(),
    // terser()
  ],
};
