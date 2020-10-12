module.exports = {
  preset: 'ts-jest',
  transform: {
    '^.+\\.jsx?$': require.resolve('babel-jest'),
    '^.+\\.tsx?$': 'ts-jest',
  },
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.json',
    },
  },
  moduleNameMapper: {
    '^@czwcode/(.*)$': '<rootDir>/../$1/src',
  }
  // testEnvironment: 'node',
};
