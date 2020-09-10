// import {
//   ReactionContext,
//   DataContext,
//   Status,
//   RdxContext,
//   RdxView,
// } from '@czwcode/rdx';
// import { Menu, Grid } from '@alifd/next';
// import axios from 'axios';
// import React from 'react';
// export default {
//   title: '简单例子/RdxView',
//   parameters: {
//     info: { inline: true },
//   },
// };

// const { Row, Col } = Grid;
// interface TreeNode {
//   label: string;
//   value: string;
//   children: TreeNode[];
// }
// interface TaskValue {
//   chooseValue: string;
//   dataSource: TreeNode[];
// }
// enum AdministrativeRegions {
//   // 省
//   Province = 'province',
//   // 市
//   City = 'city',
//   // 区
//   Area = 'area',
// }
// export const 同步联动 = () => {
//   const otherDefines = [
//     {
//       key: AdministrativeRegions.City,
//       relyTaskKey: AdministrativeRegions.Province,
//     },
//     {
//       key: AdministrativeRegions.Area,
//       relyTaskKey: AdministrativeRegions.City,
//     },
//   ];

//   return (
//     <RdxContext onChange={() => {}}>
//       <Row>
//         <Col>
//           <RdxView<TaskValue, any>
//             id={AdministrativeRegions.Province}
//             defaultValue={{ dataSource: [], chooseValue: '' }}
//             reaction={async (context: ReactionContext<TaskValue, any>) => {
//               const { value, updateState: udpateState } = context;
//               const res = await axios.get(
//                 'https://os.alipayobjects.com/rmsportal/ODDwqcDFTLAguOvWEolX.json'
//               );
//               udpateState({
//                 ...value,
//                 dataSource: res.data,
//               });
//             }}
//             render={(context: DataContext<TaskValue, any>) => {
//               const { id, next, value, status } = context;
//               console.log('value: ', value, status);

//               if (status === Status.FirstRender) {
//                 return '空白状态';
//               }
//               if (status === Status.Waiting) {
//                 return '加载状态';
//               }
//               if (status === Status.Error) {
//                 return '错误状态';
//               }
//               const { dataSource, chooseValue } = value;
//               console.log('dataSource: ', dataSource);

//               return (
//                 <Menu
//                   onItemClick={(key) => {
//                     next({
//                       ...value,
//                       chooseValue: key,
//                     });
//                   }}
//                   selectMode={'single'}
//                   selectedKeys={chooseValue}
//                   style={{ width: 100 }}
//                 >
//                   {dataSource.map((item) => (
//                     <Menu.Item key={item.value}>{item.label}</Menu.Item>
//                   ))}
//                 </Menu>
//               );
//             }}
//           ></RdxView>
//         </Col>
//         {otherDefines.map((item) => (
//           <Col>
//             <RdxView<TaskValue, any>
//               id={item.key}
//               deps={[item.relyTaskKey]}
//               defaultValue={{ dataSource: [], chooseValue: '' }}
//               reaction={async (context: ReactionContext<TaskValue, any>) => {
//                 const { updateState: udpateState, value, depsValues } = context;
//                 const [preLevelValue = {}] = depsValues;
//                 const { dataSource = [], chooseValue } = preLevelValue;
//                 udpateState({
//                   ...value,
//                   dataSource: dataSource.find(
//                     (item) => item.value === chooseValue
//                   )?.children,
//                 });
//               }}
//               render={(context: DataContext<TaskValue, any>) => {
//                 const { next, value, status } = context;
//                 if (status === Status.FirstRender) {
//                   return '空白状态';
//                 }
//                 if (status === Status.Waiting) {
//                   return '加载状态';
//                 }
//                 if (status === Status.Error) {
//                   return '错误状态';
//                 }
//                 const { dataSource, chooseValue } = value;
//                 if (!dataSource) {
//                   return '';
//                 }
//                 return (
//                   <Menu
//                     onItemClick={(key) => {
//                       next({
//                         ...value,
//                         chooseValue: key,
//                       });
//                     }}
//                     selectMode={'single'}
//                     selectedKeys={chooseValue}
//                     style={{ width: 100 }}
//                   >
//                     {dataSource.map((item) => (
//                       <Menu.Item key={item.value}>{item.label}</Menu.Item>
//                     ))}
//                   </Menu>
//                 );
//               }}
//             ></RdxView>
//           </Col>
//         ))}
//       </Row>
//     </RdxContext>
//   );
// };
