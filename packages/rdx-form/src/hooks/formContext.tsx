import React from 'react';
export const FormContextInstance = React.createContext<{
  name?: string;
  parentIsArray?: boolean
  virtual?: boolean
}>({});
