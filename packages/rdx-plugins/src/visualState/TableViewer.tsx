import * as React from 'react';
import { Table, Balloon, Tab } from '@alifd/next';
import { PointWithWeight, union } from '@czwcode/rdx';
import ReactJson from 'react-json-view';
import { DataPersistence } from '.';
import { GlobalDepsViewer } from './GraphViewer';
import { getDefaultSnapShot } from '../../../rdx-plugin-base/src/utils';
const { Column } = Table;

const EventStatusComponent = ({
  activeIndex,
  setActiveIndex,
  allSnapShots,
}) => {
  return (
    <Table
      dataSource={allSnapShots}
      maxBodyHeight={300}
      getCellProps={(rowIndex) => {
        return {
          style: { background: rowIndex === activeIndex && '#87befd88' },
        };
      }}
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
  );
};
const StateCompoonent = ({ stateDataSource }) => {
  const [filterParams, setFilterParams] = React.useState({});
  const targetTypeDataSource = union(
    stateDataSource
      .map((item) => item.targetType)
      .map((item) => ({ label: item, value: item }))
  );

  return (
    <Table
      // @ts-ignore
      maxBodyHeight={500}
      isZebra={true}
      dataSource={filterDataSource(stateDataSource, filterParams)}
      onFilter={(filterParams) => {
        setFilterParams(filterParams);
      }}
    >
      <Column title='action类型' width={100} dataIndex={'actionType'}></Column>
      <Column title='目标id' width={100} dataIndex={'key'}></Column>
      <Column
        title='目标类型'
        width={100}
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
  );
};

export default () => {
  const state = React.useContext(DataPersistence);
  const { allSnapShots = [], realTimeState } = state;
  const [activeIndex, setActiveIndex] = React.useState(0);

  const currentSnapShots = allSnapShots[activeIndex];
  if(!currentSnapShots) {
    return <div>none</div>
  }
  return (
    <div>
      <EventStatusComponent
        activeIndex={activeIndex}
        setActiveIndex={setActiveIndex}
        allSnapShots={allSnapShots}
      />
      <Tab>
        <Tab.Item title={'依赖关系实时预览'}>
          <GlobalDepsViewer snapShot={currentSnapShots}></GlobalDepsViewer>
        </Tab.Item>
        <Tab.Item title={'事件状态'}>
          <StateCompoonent stateDataSource={currentSnapShots.states || []} />
        </Tab.Item>
        <Tab.Item title={'当前状态'}>
          <ReactJson
            style={{ height: 300, overflow: 'auto' }}
            src={realTimeState}
          ></ReactJson>
        </Tab.Item>
        <Tab.Item title={'当前task信息'}>
          <ReactJson
            style={{ height: 300, overflow: 'auto' }}
            src={currentSnapShots.tasks}
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
