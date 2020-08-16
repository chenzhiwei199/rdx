const createCompiler = require('@storybook/addon-docs/mdx-compiler-plugin');

const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
module.exports = {
  stories: ['../stories/**/*.stories.tsx', '../stories/**/*.stories.mdx'],
  addons: [
    '@storybook/addon-actions',
    '@storybook/addon-links',
    '@storybook/addon-docs',
    '@storybook/addon-storysource',
  ],
  webpackFinal: async (config) => {
    // config.devtool = false
    config.resolve.plugins = [
      new TsconfigPathsPlugin({
        configFile: './tsconfig.json',
        silent: true,
      }),
    ];
    config.module.rules.push({
      test: /\.(ts|tsx)$/,
      use: [
        {
          loader: require.resolve('ts-loader'),
        },
        // Optional
        // {
        //   loader: require.resolve('react-docgen-typescript-loader'),
        // },
      ],
    });
    config.module.rules.push({
      test: /\.(stories|story)\.[tj]sx?$/,
      loader: require.resolve('@storybook/source-loader'),
      exclude: [/node_modules/],
      enforce: 'pre',
    });
    // config.module.rules.push({
    //   // 2a. Load `.stories.mdx` / `.story.mdx` files as CSF and generate
    //   //     the docs page from the markdown
    //   test: /\.(stories|story)\.mdx$/,
    //   use: [
    //     {
    //       loader: 'babel-loader',
    //       // may or may not need this line depending on your app's setup
    //       options: {
    //         plugins: ['@babel/plugin-transform-react-jsx'],
    //       },
    //     },
    //     {
    //       loader: '@mdx-js/loader',
    //       options: {
    //         compilers: [createCompiler({})],
    //       },
    //     },
    //   ],
    // });
    config.resolve.extensions.push('.ts', '.tsx');
    return config;
  },
};
