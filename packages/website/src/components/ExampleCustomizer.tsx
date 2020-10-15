import React, { ComponentType } from 'react';
import { useCallback } from 'react';
import { Box, Code, Database } from 'react-feather';
import { getParameters } from 'codesandbox/lib/api/define';

const LinkToCodeSandBox = ({ code} :{code: string}) => {
  const params = getParameters({
    files: {
      'App.tsx': {
        content: code,
        isBinary: false,
      },
      'index.tsx': {
        content: `import * as React from "react";
import { render } from "react-dom";

import App from "./App";

const rootElement = document.getElementById("root");
render(<App />, rootElement);`,
        isBinary: false,
      },
      'index.html': {
        content: `
<!DOCTYPE html>
<html>
  <head>
    <meta content="text/html; charset=utf-8" http-equiv="Content-type" />
    <title>React Code Snippet Demo</title>
  </head>
  <body>
    <div id="root" style="margin:20px"></div>
  </body>
</html>
        `,
        isBinary: false,
      },

      'package.json': {
        content: `
        {
          "name": "rdx-sample",
          "version": "1.0.0",
          "description": "React and TypeScript example starter project",
          "keywords": [
            "typescript",
            "react",
            "starter"
          ],
          "main": "src/index.tsx",
          "dependencies": {
            "@czwcode/rdx": "*",
            "react": "^16.12.0",
            "react-dom": "^16.12.0",
            "react-color": "^2.17.0",
            "react-scripts": "3.3.0"
          },
          "devDependencies": {
            "@types/react": "16.9.19",
            "@types/react-dom": "16.9.5",
            
            "typescript": "^4.1.0-beta"
          },
          "scripts": {
            "start": "react-scripts start",
            "build": "react-scripts build",
            "test": "react-scripts test --env=jsdom",
            "eject": "react-scripts eject"
          },
          "browserslist": [
            ">0.2%",
            "not dead",
            "not ie <= 11",
            "not op_mini all"
          ]
        }`,
        isBinary: false,
      },
    },
  });
  return <a href={`https://codesandbox.io/api/v1/sandboxes/define?parameters=${params}`}>点击跳转</a>
};
import { CodeSection } from './CodeSection';
import { TogglerHeader } from './Toggler';

const toggles = [
  { icon: <Box />, name: 'Example', tooltipText: 'Show example' },
  { icon: <Code />, name: 'Code', tooltipText: 'Show source code' },
];

export type ExampleCustomizerProps = {
  code: string;
  Example: ComponentType;
};

export default function ExampleCustomizer(props: ExampleCustomizerProps) {
  const { code, Example } = props;

  const View = useCallback(function View({ name }) {
    switch (name) {
      case 'Code':
        return (
          <CodeSection
            language='js'
            replace={{ "'[^']*?/universal'": `'uniforms-${1}'` }}
            source={code}
          />
        );
      case 'Example':
        return (
          <>
            {Array.from(Object.keys(Example))
              .filter((item) => item !== 'default')
              .map((key) => {
                const NewExample = Example[key];
                return (
                  <div
                    style={{
                      boxShadow: 'rgba(0, 0, 0, 0.1) 0px 1px 2px 0px',
                      borderRadius: '4px',
                      padding: 12,
                      marginBottom: 12,
                    }}
                  >
                    <h3>{key}</h3>
                    <NewExample />
                  </div>
                );
              })}
          </>
        );

      default:
        return null;
    }
  }, []);
  const [acticv, setActive] = React.useState(0);
  return (
    <div>
      <TogglerHeader
        activeToggle={acticv}
        onClick={(v) => {
          setActive(v);
        }}
        items={toggles}
      />
      <LinkToCodeSandBox code={code}></LinkToCodeSandBox>
      <View name={toggles[acticv].name} />
    </div>
  );
}
