import { useRef, useEffect, useState } from "react";
import { ShareContextClass } from "../RdxContext/shareContext";
import { StateUpdateType } from "../global";

export function useMount() {
  const mount = useRef(false);
  useEffect(() => {
    mount.current = true;
  }, []);
  return mount;
}

export const useForceUpdate = () => {
  const [state, setState] = useState(1);
  return () => {
    setState((state) => state + 1);
  };
};


export function createStore(): [() => any, (v: any) => void] {
  const storeRef = useRef(null);
  return [
    () => storeRef.current,
    (v) => {
      storeRef.current = v;
    },
  ];
}


export function useStateUpdate<IModel, IRelyModel>(
  id: string,
  context: ShareContextClass<IModel, IRelyModel>,
  type: StateUpdateType
) {
  const forceUpdate = useForceUpdate();
  useEffect(() => {
    const eventKey = id + '----' + type;
    context.eventEmitter.on(eventKey, () => {
      forceUpdate();
    });
    return () => {
      context.eventEmitter.off(eventKey);
    };
  }, []);
}