// import React from 'react';
// import {
//   IDefaultSelector,
//   ChooseValueType,
//   LinkedValueChooseType,
//   LinkedValueChooseData,
//   defaultValueTypes,
//   BaseLinkedDefaultValueTypeEnum,
//   LinkedDataType,
//   DimensionDataDefaultValueTypeEnum,
//   MeasureDataDefaultValueTypeEnum,
//   OtherDefaultValueTypeEnum,
// } from './types';
// import {
//   RdxFormItem,
//   RdxFormContext,
//   FormLayout,
//   ReactionContext,
//   IModel,
//   IFromItemBase,
// } from '@czwcode/rdx-next-form';
// export const DefaultSelector = (props: IDefaultSelector) => {
//   const { chooseType, hasDataSource, linkedDataType, measures, fields } = props;
//   const showChooseType = chooseType !== ChooseValueType.OnlyChooseDefaultValue;
//   const showDefaultValue = chooseType !== ChooseValueType.OnlyChooseType;
//   const reactionInfo = {
//     deps: [{ id: 'valueType' }],
//     firstRender: false,
//     reaction: (context: ReactionContext<IModel<any>, IModel<any>[]>) => {
//       const { id, value, updateState, depsValues } = context;
//       const [valueType] = depsValues;

//       updateState({
//         ...value,
//         visible: valueType ? valueType.value === id : false,
//       });
//     },
//   };
//   const valueTypeReactionSource = [
//     {
//       parentId: MeasureDataDefaultValueTypeEnum.CustomIndicator,
//       name: 'indicatorChoose',
//       type: 'string',
//       title: '指标选择',
//       dataSource: measures,
//     },
//     {
//       parentId: BaseLinkedDefaultValueTypeEnum.SelectFirst,
//       name: 'code',
//       type: 'string',
//       title: '字段选择',
//       dataSource: fields,
//     },
//     {
//       parentId: BaseLinkedDefaultValueTypeEnum.SelectAll,
//       name: 'code',
//       type: 'string',
//       title: '字段选择',
//       dataSource: fields,
//     },
//     {
//       parentId: DimensionDataDefaultValueTypeEnum.Custom,
//       name: 'code',
//       type: 'string',
//       title: '自定义数值',
//       dataSource: fields,
//     },
//     {
//       parentId: OtherDefaultValueTypeEnum.LocalStorageInfo,
//       name: 'code',
//       type: 'string',
//       title: '取数路径',
//     },
//     {
//       parentId: OtherDefaultValueTypeEnum.UrlParams,
//       name: 'code',
//       type: 'string',
//       title: '取数路径',
//     },
//   ];
//   return (
//     <RdxFormContext onChange={(value) => {}}>
//       <FormLayout labelTextAlign={'left'}>
//         {showChooseType && (
//           <RdxFormItem
//             name='chooseType'
//             title='选择类型'
//             default={LinkedValueChooseType.Single}
//             dataSource={LinkedValueChooseData}
//             type='string'
//             xComponent={'radio'}
//           ></RdxFormItem>
//         )}
//         {showDefaultValue && (
//           <>
//             <RdxFormItem
//               name='valueType'
//               title='类型'
//               deps={[{ id: 'chooseType' }]}
//               get={(context) => {
//                 const {
//                   value,
//                   updateState,
//                   lastDepsValue,
//                   depsValues,
//                 } = context;
//                 const [type] = depsValues;
//                 const [preType] = lastDepsValue;
//                 const newDataSource = defaultValueTypes
//                   .filter((item: any) => {
//                     // 如果没有数据源则过滤掉全选和默认选择第一个
//                     const isBaseLinkedValueType = [
//                       BaseLinkedDefaultValueTypeEnum.SelectFirst,
//                       BaseLinkedDefaultValueTypeEnum.SelectAll,
//                     ].includes(item.value);
//                     // 有数据源, 且多选，
//                     if (isBaseLinkedValueType) {
//                       return (
//                         hasDataSource &&
//                         type.value === LinkedValueChooseType.Multiple
//                       );
//                     }
//                     return true;
//                   })
//                   .filter((item) => {
//                     if (
//                       linkedDataType === LinkedDataType.MeasureMember &&
//                       item.value === DimensionDataDefaultValueTypeEnum.Custom
//                     ) {
//                       return false;
//                     }
//                     if (
//                       linkedDataType === LinkedDataType.DimensionMember &&
//                       item.value ===
//                         MeasureDataDefaultValueTypeEnum.CustomIndicator
//                     ) {
//                       return false;
//                     }
//                     return true;
//                   });
//                 // 处理数据源
//                 updateState({
//                   ...value,
//                   value: type
//                     ? type.value === preType.value
//                       ? value.value
//                       : BaseLinkedDefaultValueTypeEnum.None
//                     : value.value,
//                   dataSource: newDataSource,
//                 });
//               }}
//               default={BaseLinkedDefaultValueTypeEnum.None}
//               dataSource={defaultValueTypes}
//               type='string'
//               xComponent={'radio'}
//             ></RdxFormItem>

//             {valueTypeReactionSource.map((item) => {
//               const { parentId, type, name, title, dataSource } = item;
//               return (
//                 <RdxFormItem type='object' {...reactionInfo} name={parentId}>
//                   <RdxFormItem
//                     name={name}
//                     type={type}
//                     title={title}
//                     dataSource={dataSource}
//                   />
//                 </RdxFormItem>
//               );
//             })}
//           </>
//         )}
//       </FormLayout>
//     </RdxFormContext>
//   );
// };
