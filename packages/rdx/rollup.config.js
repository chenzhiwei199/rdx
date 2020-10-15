// node-resolve will resolve all the node dependencies
import resolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import postcss from 'rollup-plugin-postcss';
import commonjs from 'rollup-plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
const packages = require('./package.json');
console.log('packages: ', packages, Object.keys(packages.dependencies));
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
      '@czwcode/graph-core',
      '@czwcode/task-queue',
      'eventemitter3',
      'react',
      'react-dom',
    ],
    onwarn: function (warning) {
      if (warning.code === 'THIS_IS_UNDEFINED') {
        return;
      }
      // console.error(warning.message)
    },
    plugins: [
      
      resolve({
        browser: true,
        preferBuiltins: true,
      }),
      typescript({
        tsconfig: 'tsconfig.build.json',
      }),
      commonjs({ extensions: ['.js', '.ts', 'tsx'] }),
      postcss({
        minimize: isProductionEnv,
      }),
      isProductionEnv && terser(),
    ].filter(Boolean),
  };
};
