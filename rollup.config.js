import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import copy from 'rollup-plugin-copy';
import pkg from './package.json';

export default [
  {
    input: 'src/index.js',
    plugins: [
      resolve(),
      commonjs(),
      terser(),
      copy({
        targets: [{ src: 'src/img/**', dest: 'dist/img' }],
      }),
    ],
    output: {
      file: pkg.main,
      format: 'umd',
      exports: 'named',
      name: 'ScaleRotateMode',
      sourcemap: process.env.NODE_ENV !== 'production',
    },
  },
];
