import { useRef, useEffect, useState } from "react";

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


