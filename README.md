### issue

1. 为什么根目录不装 jest，packages 里面 jest 会报红

## 创建 monerepo 工程

1.  npm install --global lerna
2.  git init monorepo-example cd monorepo-example
3.  lerna init

## ts 配置

1. 创建 tsconfig.json 文件
2. https://www.tslang.cn/docs/handbook/tsconfig-json.html 参照链接进行配置

## test 模块 jest

1. jest --init
2. add babel
   `yarn add --dev babel-jest @babel/core @babel/preset-env`
3. create babel.config.js


    ```js
    // babel.config.js
    module.exports = {
      presets: [
        [
          '@babel/preset-env',
          {
            targets: {
              node: 'current',
            },
          },
        ],
      ],
    };
    ```

4. 支持 ts `yarn add --dev @babel/preset-typescript`
5. yarn install --dev @types/jest

## prettier

1. yarn global add tslint typescript
2. tslint --init
3. tslint file


    ```json
    {
      "extends": ["tslint-plugin-prettier", "tslint-config-prettier"],
      "rules": {
        "prettier": true
      }
    }
    ```

4. vscode install Prettier - Code formatter
5. yarn global add prettier
6. yarn add --dev tslint-plugin-prettier prettier

### 发布命令

lerna version patch --message "feat: 当前运行状态信息透出" --force-publish  -y && tnpm run publish



