import * as React from 'react';

interface ITab {
  dataSource: { label: string; children?: any[]; value: string }[];
  active?: string;
  defaultActive?: string;
  onChange?: () => void;
  children?: (
    v: string,
    row: { label: string; value: string; children?: any[] }
  ) => React.ReactNode;
}
const baseTabItemStyle = {
  background: '#eee',
  border: 'none',
  cursor: 'pointer',
  padding: '14px 16px',
  fontSize: 17,
  color: 'rgb(170,170,170)',
};
const activeStyle = {
  background: 'rgb(33, 150, 243)',
  color: 'white',
};
const Tab = (props: ITab) => {
  const { onChange, defaultActive, dataSource, children } = props;
  const [realActive, setRealActive] = React.useState(defaultActive);
  const findItem = dataSource.find((item) => item.value === realActive);
  return (
    <div style={{ width: '100%', overflowX: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        {dataSource.map((row) => {
          const isActive = row.value === realActive;
          return (
            <button
              style={{
                ...baseTabItemStyle,
                ...(isActive ? activeStyle : {}),
              }}
              onClick={() => {
                onChange && onChange();
                setRealActive(row.value);
              }}
            >
              {row.label}
            </button>
          );
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        {findItem && children(findItem.value, findItem)}
      </div>
    </div>
  );
};

export default Tab;
