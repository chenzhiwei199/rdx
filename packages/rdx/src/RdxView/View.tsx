// import React, { useImperativeHandle, useContext } from 'react';
// import { IRdxView, IMutators } from '../global';
// import {
//   ShareContextClass,
//   ShareContextInstance,
// } from '../RdxContext/shareContext';
// import { createMutators } from '../utils';

// export type BaseModuleProps<IModel, IRelyModel> = IRdxView<
//   IModel,
//   IRelyModel
// > & { context: ShareContextClass<IModel, IRelyModel> };

// // 使用React.forwardRef,兼容typescript 类型定义
// const _WithForwardView: any = React.forwardRef(
//   <IModel, IRelyModel>(
//     props: IRdxView<IModel, IRelyModel>,
//     ref: React.Ref<IMutators<any>>
//   ) => {
//     const context = useContext<ShareContextClass<IModel, IRelyModel>>(
//       ShareContextInstance
//     );
//     useImperativeHandle(ref, () => createMutators(props.id, context));
//     return <AtomComponent {...props} context={context} />;
//   }
// );

// // forward类型转换，增强易用性
// type WithForwardRefProps<IModel, IRelyModel> = {
//   // ref wouldn't be a valid prop name
//   forwardedRef?: React.Ref<IMutators<GModel>>;
// } & IRdxView<IModel, IRelyModel>;

// export const WithForwardRef = <IModel, IRelyModel>({
//   forwardedRef,
//   ...rest
// }: WithForwardRefProps<IModel, IRelyModel>) => (
//   <_WithForwardView {...rest} ref={forwardedRef} />
// );

// export default WithForwardRef;

// /**
//  *
//  * @param props 原子组件，除非id改变，否则只能接受内部控制渲染
//  */
// function AtomComponent<IModel, IRelyModel>(
//   props: BaseModuleProps<IModel, IRelyModel>
// ): React.ReactElement {
//   const { id, context } = props;
//   const taskInfo = context.tasksMap.get(id);
//   const { render, component } = taskInfo ? taskInfo : props;
//   // 移入context中，这里只是发个消息，否则用来执行的不一定是最终状态
//   const data = useRdxContext<IModel, IRelyModel>(props);
//   const Component = component;
//   if (component) {
//     return <Component {...data} />;
//   }
//   return <>{render ? (render(data) as React.ReactNode) : null}</>;
// }
