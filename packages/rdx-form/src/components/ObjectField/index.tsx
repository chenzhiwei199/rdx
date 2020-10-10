import React, { useContext } from 'react';
import { PathContextInstance } from '../../hooks/pathContext';
import { FormContextInstance } from '../../hooks/formContext';

export interface IObjectItem {
  children: React.ReactNode;
}

const ObjectField = (props: IObjectItem) => {
  const { children } = props;
  const { name } = useContext(FormContextInstance)
  const { paths = []} = useContext(PathContextInstance)
  return (
    <PathContextInstance.Provider value={{ paths: [...paths, name]  }}>
      {children}
    </PathContextInstance.Provider>
  );
};

export default ObjectField;
