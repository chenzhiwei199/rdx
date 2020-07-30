import { addParameters } from '@storybook/react';

addParameters({
  options: {
    storySort: (a, b) => {
      // Sort function to sort stories based on a config file
      // Can handle sorting up to one level deep
      // Any stories that aren't expliciply listed will appear at the end
      // Based off https://github.com/storybookjs/storybook/issues/6327#issuecomment-613122487
   
      // The order in which we want stories to appear
      const config = [
        {
          category: '介绍',
          order: ['基本信息', '动机', '核心概念'],
        },
        {
          category: '基本示例',
          order: ['Introduction'],
        },
        {
          category: '场景示例',
          order: ['组件的状态'],
        },
        
        {
          category: 'ReactJS',
          order: ['Introduction', 'Quickstart', 'Examples'],
        },
        {
          category: 'Components',
        },
      ];

      // assuming storybook uses / to separate everything
      // e.g. Component/Alert
      const story1 = a[1].kind.split('|');
      const story2 = b[1].kind.split('|');

      // util function for getting number
      // given array haystack, returns index for given needle
      // or 9999 so it goes at the end of the list
      function getOrderNumber(needle, haystack) {
        let order = 9999;
        if (Array.isArray(haystack)) {
          order = haystack.findIndex(
            (h) => h.toLowerCase() === needle.toLowerCase()
          );
          if (order === -1) order = 9999;
        }
        return order;
      }

      // generate array of top-level categories from config array
      const topLevelOrderArray = config.map((h) => h.category);

      const topLevelOrder1 = getOrderNumber(story1[0], topLevelOrderArray);
      const topLevelOrder2 = getOrderNumber(story2[0], topLevelOrderArray);
      // if top-level category is different
      // order based on config array
      // e.g. have Overview|Introduction come before Module|Header
      if (story1[0] !== story2[0]) {
        return topLevelOrder1 - topLevelOrder2;
      }

      // sorting one level deep now
      // if second-level category is different
      // e.g. have ReactJS|Introduction come before ReactJS|Examples
      if (story1[1] !== story2[1]) {
        return (
          getOrderNumber(
            story1[1],
            config[topLevelOrder1] && config[topLevelOrder1].order
          ) -
          getOrderNumber(
            story2[1],
            config[topLevelOrder2] && config[topLevelOrder2].order
          )
        );
      }

      return 0;
    },
  },
});
