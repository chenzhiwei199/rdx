// node-resolve will resolve all the node dependencies
import resolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import visualizer from 'rollup-plugin-visualizer';
import progress from 'rollup-plugin-progress';
import commonjs from 'rollup-plugin-commonjs';
import tsConfigPaths from 'rollup-plugin-ts-paths';
import { terser } from 'rollup-plugin-terser';
const packages = require('./package.json');
const isProductionEnv = process.env.NODE_ENV === 'production';
export default (commandLineArgs) => {
  return {
    input: `src/index.tsx`,
    output: [
      {
        file: packages.main,
        format: 'cjs',
      },
      {
        file: packages.module,
        format: 'esm',
      },
    ],
    external: [
      'react',
      'react-dom',
      'immer',
      '@alifd/next',
      'styled-components',
      'react-is',
    ],
    onwarn: function(warning) {
      if (warning.code === 'THIS_IS_UNDEFINED') {
        return;
      }
      console.error(warning.message);
    },
    plugins: [
      progress({ clearLine: false }),
      typescript({
        include: ['../../packages/*/src/**/*.ts+(|x)'],
        exclude: ['node_modules'],
        tsconfig: 'tsconfig.json',
      }),
      tsConfigPaths({}),
      resolve({
        browser: true,
        preferBuiltins: true,
      }),
      commonjs({ sourceMap: false, extensions: ['.js', '.ts', 'tsx'] }),
      isProductionEnv &&
        visualizer({
          filename: `analysis/${key}.html`,
        }),
      isProductionEnv && terser(),
    ].filter(Boolean),
  };
};
