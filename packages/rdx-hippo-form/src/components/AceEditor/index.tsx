import React from 'react';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-monokai';

export default props => {
  const { placeholder, value, onChange, mode = 'json' } = props;
  return (
    <AceEditor
      placeholder={placeholder}
      mode={mode}
      theme='monokai'
      name='blah2'
      onChange={onChange}
      fontSize={14}
      showPrintMargin
      showGutter
      highlightActiveLine
      value={value}
      style={{
        height: 200,
        borderRadius: 5
      }}
      setOptions={{
        // enableBasicAutocompletion: false,
        // enableLiveAutocompletion: false,
        // enableSnippets: false,
        showLineNumbers: true,
        tabSize: 2
      }}
    />
  );
};
