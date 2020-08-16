import * as React from 'react';
import { DataPersistenceHook } from '@czwcode/rdx-plugin-base';
import { Table, Balloon, Tab } from '@alifd/next';
import { PointWithWeight, union } from '@czwcode/rdx';
import ReactJson from 'react-json-view';
const { Column } = Table;
export default () => {
  const state = DataPersistenceHook();
  const { allSnapShots = [], realTimeState } = state;
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [filterParams, setFilterParams] = React.useState({});
  React.useEffect(() => {
    setActiveIndex(Math.max(allSnapShots.length - 1, 0));
  }, [allSnapShots.length]);
  const stateDataSource = activeIndex ? allSnapShots[activeIndex].states : [];
  const targetTypeDataSource = union(
    stateDataSource
      .map((item) => item.targetType)
      .map((item) => ({ label: item, value: item }))
  );

  return (
    <div
      style={{
        position: 'fixed',
        width: 400,
        height: '100%',
        top: 0,
        right: 0,
        overflow: 'auto',
      }}
    >
      <Tab>
        <Tab.Item title={'事件状态'}>
          <Table
            dataSource={allSnapShots}
            maxBodyHeight={300}
            onRowClick={(record, index) => {
              setActiveIndex(index);
            }}
          >
            <Column title='事件类型' dataIndex={'type'}></Column>
            <Column
              title='原来运行的点'
              dataIndex={'preRunningPoints'}
              cell={(value: PointWithWeight[] = []) => {
                return (
                  <div
                    style={{
                      maxWidth: 100,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {value.map((item) => item.key).join(',')}
                  </div>
                );
              }}
            ></Column>
            <Column
              title='当前运行的点'
              dataIndex={'currentRunningPoints'}
              cell={(value: PointWithWeight[] = []) => {
                return (
                  <div
                    title={value.map((item) => item.key).join(',')}
                    style={{
                      maxWidth: 100,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {value.map((item) => item.key).join(',')}
                  </div>
                );
              }}
            ></Column>
          </Table>
          <Table
            // @ts-ignore
            maxBodyHeight={500}
            isZebra={true}
            dataSource={filterDataSource(stateDataSource, filterParams)}
            onFilter={(filterParams) => {
              setFilterParams(filterParams);
            }}
          >
            <Column title='action类型' dataIndex={'actionType'}></Column>
            <Column title='目标id' dataIndex={'key'}></Column>
            <Column
              title='目标类型'
              dataIndex={'targetType'}
              filters={targetTypeDataSource}
            ></Column>
            <Column
              title='当前变化数据'
              dataIndex={'value'}
              cell={(value) => {
                return (
                  <Balloon
                    popupStyle={{
                      minWidth: 500,
                      height: 300,
                      overflow: 'auto',
                    }}
                    trigger={
                      <div
                        style={{
                          maxWidth: '200px',
                          maxHeight: '100px',
                          overflow: 'hidden',
                        }}
                      >
                        {JSON.stringify(value, getCircularReplacer())}
                      </div>
                    }
                    triggerType={'click'}
                  >
                    <div>{value}</div>
                    {/* <ReactJson style={{}} src={value}></ReactJson> */}
                  </Balloon>
                );
              }}
            ></Column>
          </Table>
        </Tab.Item>
        <Tab.Item title={'当前状态'}>
          <ReactJson
            style={{ height: 300, overflow: 'auto' }}
            src={realTimeState}
          ></ReactJson>
        </Tab.Item>
      </Tab>
    </div>
  );
};

function filterDataSource(ds, filterParams) {
  Object.keys(filterParams).forEach((key) => {
    const selectedKeys = filterParams[key].selectedKeys;
    if (selectedKeys.length) {
      ds = ds.filter((record) => {
        return selectedKeys.some((value) => {
          return record[key].indexOf(value) > -1;
        });
      });
    }
  });
  return ds;
}

const getCircularReplacer = () => {
  const seen = new WeakSet();
  return (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return;
      }
      seen.add(value);
    }
    return value;
  };
};
