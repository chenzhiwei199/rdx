import React from 'react';
export const PathContextInstance = React.createContext<{
  paths: string[];
}>({
  paths: [],
});