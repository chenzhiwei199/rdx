// import React, { useState, useEffect } from 'react';
// import '@alifd/next/dist/next.css';
// import { Select } from '@alifd/next';
// export default {
//   title: '场景示例/联动/普通版本',
//   parameters: {
//     info: { inline: true },
//   },
// };
// import { province, city, area } from 'province-city-china/data';
// import { useRef } from 'react';
// interface IBaseSelect {
//   title: string;
//   value: string;
//   onChange: (v: string) => void;
//   depsValues: string[];
//   fetchDataSource: { label: string; value: string }[];
// }
// const pause = (t: number) => new Promise((resolve) => setTimeout(resolve, t));
// const BaseSelect = (props: IBaseSelect) => {
//   const { fetchDataSource, depsValues, title, value, onChange } = props;
//   const [state, setState] = useState({
//     loading: false,
//     dataSource: [] as { label: string; value: string }[],
//   });
//   const countRef = useRef(0);
//   useEffect(() => {
//     console.log('title', title, depsValues);
//     setState({
//       ...state,
//       loading: true,
//     });
//     // countRef.current++;
//     let recordCount = countRef.current;
//     async function anyNameFunction() {
//       title === '城市' ? await pause(5000) : await pause(Math.random() * 2000);
//       fetchDataSource[0] && onChange(fetchDataSource[0].value);
//       setState({
//         loading: false,
//         dataSource: fetchDataSource,
//       });
//     }
//     anyNameFunction();
//   }, depsValues);
//   return (
//     <div>
//       <strong>{title}</strong>
//       <Select
//         state={state.loading ? 'loading' : undefined}
//         dataSource={state.dataSource}
//         value={value}
//         onChange={onChange}
//       />
//     </div>
//   );
// };
// const data = [
//   {
//     label: '国家',
//     id: 'province',
//     dataSource: province,
//     formatter: (data) => {
//       return data.map((item) => ({ label: item.name, value: item.province }));
//     },
//     filter: (relyValues) => {
//       return true;
//     },
//   },
//   {
//     label: '城市',
//     dataSource: city,
//     id: 'city',
//     filter: (v, depsValues) => {
//       const [province] = depsValues;
//       return v.province === province;
//     },
//     formatter: (data) => {
//       return data.map((item) => ({ label: item.name, value: item.city }));
//     },
//   },
//   {
//     label: '区域',
//     dataSource: area,
//     id: 'area',
//     filter: (v, depsValues) => {
//       const [province, city] = depsValues;
//       return city
//         ? v.province === province && v.city === city
//         : v.province === province;
//     },
//     formatter: (data) => {
//       return data.map((item) => ({ label: item.name, value: item.area }));
//     },
//   },
// ];
// export const 异步联动 = () => {
//   const [state, setState] = useState({
//     province: '',
//     city: '',
//     area: '',
//   });
//   return (
//     <div>
//       {data.map((row, index) => {
//         const depsValues = data.slice(0, index).map((item) => state[item.id]);
//         const newData = row.dataSource.filter((value) => {
//           const bool = row.filter(value, depsValues);
//           return bool;
//         });
//         const newDataSource = row.formatter(newData);
//         return (
//           <BaseSelect
//             value={state[row.id]}
//             depsValues={depsValues}
//             onChange={(v) => {
//               setState({
//                 ...state,
//                 [row.id]: v,
//               });
//             }}
//             fetchDataSource={newDataSource}
//             title={row.label}
//           />
//         );
//       })}
//     </div>
//   );
// };
