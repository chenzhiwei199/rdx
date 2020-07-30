import React, { useContext } from 'react';
import { PathContextInstance } from '../../hooks/pathContext';

export interface IObjectItem {
  name: string;
  paths?: string[];
  children: React.ReactNode;
}

const ObjectField = (props: IObjectItem) => {
  const { children, paths = [], name } = props;
  const { paths: parentPaths = [], isArray = false} = useContext(PathContextInstance)
  return (
    <PathContextInstance.Provider value={{ paths: isArray ? [...parentPaths, ...paths]: [...parentPaths, ...paths, name] }}>
      {children}
    </PathContextInstance.Provider>
  );
};

export default ObjectField;
