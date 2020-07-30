import React from 'react';
import { Button, Dialog, Loading } from '@alifd/next';
import ReactJsonView from '../JsonViewField';
import AceEditor from '../AceEditor';
import { debounce } from '@czwcode/rdx-form';
import { IEditorWithInAndOut } from './types';

export default class EditorWithInAndOut extends React.Component<
  IEditorWithInAndOut,
  {
    value: string;
    visible: boolean;
  }
> {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
      visible: false,
    };
    this.updateCode = debounce(this.updateCode, 300);
  }

  getStateFromProps(props) {
    return {
      value: props.value,
    };
  }

  componentDidMount() {
    this.setState(this.getStateFromProps(this.props));
  }

  execute = () => {
    const { execute } = this.props;
    const data = this.getData();
    let res = { message: 'nothing' };
    if (execute) {
      res = execute(data, this.state.value);
    } else {
      try {
        const func = new Function('data', this.state.value);
        res = func(data);
      } catch (error) {
        res = {
          message: error.toString(),
        };
      }
    }
    return res;
  };

  onChange = () => {
    const { onChange } = this.props;
    this.setState({ visible: false });
    onChange && onChange(this.state.value);
  };
  getData = () => {
    const { src, srcFormatter = (value) => value } = this.props;
    return srcFormatter(src, this.state.value);
  };

  updateCode = (code) => {
    this.setState({
      value: code,
    });
  };
  renderEditor() {
    const { placeholder } = this.props;
    return (
      <AceEditor
        placeholder={placeholder}
        mode='javascript'
        value={this.state.value}
        onChange={this.updateCode}
      />
    );
  }
  renderPreview() {
    const { src } = this.props;
    return (
      <div style={{ display: 'flex', height: 100, marginTop: 12 }}>
        <div style={{ flex: 1, maxWidth: 300 }}>
          <strong style={{ paddingRight: 12 }}>原始数据: </strong>
          {typeof src !== 'string' && (
            <ReactJsonView value={JSON.stringify(this.getData())} />
          )}
        </div>
        <div style={{ flex: 1, marginLeft: 10, maxWidth: 300 }}>
          <strong style={{ paddingRight: 12 }}>结果预览: </strong>
          {<ReactJsonView value={JSON.stringify(this.execute() || {})} />}
        </div>
      </div>
    );
  }
  renderDialog() {
    let { title, onCancel, trigger } = this.props;
    const { visible } = this.state;
    return (
      <>
        <span
          onClick={() => {
            this.setState({ visible: true });
          }}
        >
          {trigger}
        </span>
        <Dialog
          visible={visible}
          title={title}
          onOk={this.onChange}
          onCancel={this.onCancel}
          onClose={this.onCancel}
        >
          <div style={{ minHeight: 450 }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>{title}</div>
            <div style={{ display: 'flex' }}>{this.renderEditor()}</div>
            {this.renderPreview()}
          </div>
        </Dialog>
      </>
    );
  }

  renderBase() {
    let { title, onChange = () => {} } = this.props;

    return (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: 460,
          flexDirection: 'column',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>{title}</div>
        <div style={{ display: 'flex' }}>
          {this.renderEditor()}
          <div style={{ marginLeft: 20 }}>
            <Button
              type='primary'
              onClick={() => {
                onChange(this.state.value);
              }}
            >
              确定
            </Button>
          </div>
        </div>
        {this.renderPreview()}
      </div>
    );
  }
  onCancel = () => {
    this.setState({
      visible: false,
    });
  };
  render() {
    const { loading, isDialog } = this.props;
    return isDialog ? this.renderDialog() : this.renderBase();
  }
}

export function Empty(props: { children: React.ReactNode }) {
  return <>{props.children}</>;
}
