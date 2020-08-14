const a = {
  externalFormData: {
    alerts: [
      {
        column: '1d400b64484f1ef713370cd226bdcb7f',
        op: '<',
        dynamicValue: 'fixed',
        fixed: 0.97,
        index: 0,
      },
      {
        column: '67691ba394c0bd690c02871322299cba',
        op: '>',
        dynamicValue: 'fixed',
        fixed: 0.005,
        index: 1,
      },
      {
        column: '41c1df8dc103fa4f25d3bd697b7ca19d',
        op: '<',
        dynamicValue: 'fixed',
        fixed: 0.5,
        index: 2,
      },
    ],
    sorts:[
      {
        column: 'predict_order_cnt',
        desc: true,
      },
    ],
    refreshType: 'refreshByTime',
    refreshTime: 180,
  },
  dimensions: [
    {
      code: 'subsidiary_name',
      aggregationType: 'SUM',
      label: '子公司名称',
      type: 'dimension',
      index: 13,
    },
  ],
  indicators: [
    {
      code: 'alert_shop_cnt',
      aggregationType: 'SUM',
      label: '预警门店数',
      type: 'indicator',
      index: 0,
    },
    {
      name: '完美履约率',
      code: 'perfect_ffl_rate',
      aggregationType: 'SUM',
      label: '完美履约率',
      type: 'indicator',

      exprIndicators: [
        'user_cancel_count',
        'user_reject_count',
        'batched_order_count',
        'overtime_cnt',
        'stockout_order_count',
      ],
      index: 1,
      dataFormatter: {
        type: 'percent',
        number: {},
        percent: {
          decimalDigits: 2,
        },
      },
      editType: 0,
    },
    {
      name: '缺货出率',
      code: 'saleout_rate',
      aggregationType: 'SUM',
      label: '缺货出率',
      type: 'indicator',

      exprIndicators: ['batched_order_count', 'stockout_order_count'],
      index: 2,
      dataFormatter: {
        type: 'percent',
        number: {},
        percent: {
          decimalDigits: 2,
        },
      },
      editType: 0,
    },
    {
      code: 'right30min_rate',
      aggregationType: 'SUM',
      label: '即时达30分钟送达率',
      type: 'indicator',

      exprIndicators: ['jishida_order_cnt', 'in30min_jishida_order_cnt'],
      index: 3,
      dataFormatter: {
        type: 'percent',
        number: {
          decimalDigits: 0,
          thousandthSeparated: true,
        },
        percent: {
          decimalDigits: 2,
        },
      },
    },
    {
      name: '仓12分钟出库率',
      code: 'whse_12min_rate',
      aggregationType: 'SUM',
      label: '仓12分钟出库率',
      type: 'indicator',

      exprIndicators: [
        'batched_order_count',
        'warehouse_12min_finish_order_count',
      ],
      index: 4,
      dataFormatter: {
        type: 'percent',
        number: {},
        percent: {
          decimalDigits: 2,
        },
      },
      editType: 0,
    },
    {
      code: 'unbatched_cnt',
      aggregationType: 'SUM',
      label: '未批次订单量',
      type: 'indicator',
      index: 5,
      dataFormatter: {
        type: 'number',
        number: {
          decimalDigits: 0,
          thousandthSeparated: true,
        },
        percent: {
          decimalDigits: 2,
        },
      },
    },
    {
      code: 'wait_pack_cnt',
      aggregationType: 'SUM',
      label: '待拣货订单总量',
      type: 'indicator',
      index: 6,
      dataFormatter: {
        type: 'number',
        number: {
          decimalDigits: 0,
          thousandthSeparated: true,
        },
        percent: {
          decimalDigits: 2,
        },
      },
    },
    {
      code: 'wait_ship_cnt',
      aggregationType: 'SUM',
      label: '待揽收订单数',
      type: 'indicator',
      index: 7,
      dataFormatter: {
        type: 'number',
        number: {
          decimalDigits: 0,
          thousandthSeparated: true,
        },
        percent: {
          decimalDigits: 2,
        },
      },
    },
    {
      code: 'on_ship_cnt',
      aggregationType: 'SUM',
      label: '配送中订单量',
      type: 'indicator',
      index: 8,
      dataFormatter: {
        type: 'number',
        number: {
          decimalDigits: 0,
          thousandthSeparated: true,
        },
        percent: {
          decimalDigits: 2,
        },
      },
    },
    {
      code: 'overtime_cnt',
      aggregationType: 'SUM',
      label: '超时订单',
      type: 'indicator',
      index: 9,
    },
    {
      name: '即时达订单占比',
      code: 'rightnow1h_rate',
      aggregationType: 'SUM',
      label: '即时达订单占比',
      type: 'indicator',

      exprIndicators: ['user_order_count', 'jishida_order_cnt'],
      index: 10,
      dataFormatter: {
        type: 'percent',
        number: {},
        percent: {
          decimalDigits: 2,
        },
      },
      editType: 0,
    },
    {
      name: '一体化订单占比',
      code: 'integration_rate',
      aggregationType: 'SUM',
      label: '一体化订单占比',
      type: 'indicator',

      exprIndicators: ['batched_order_count', 'pick_package_order_count'],
      index: 11,
      dataFormatter: {
        type: 'percent',
        number: {},
        percent: {
          decimalDigits: 2,
        },
      },
      editType: 0,
    },
    {
      code: 'predict_order_rate',
      aggregationType: 'SUM',
      label: '目标达成率',
      type: 'indicator',

      exprIndicators: ['user_order_count', 'predict_order_cnt'],
      index: 12,
      dataFormatter: {
        type: 'percent',
        number: {},
        percent: {
          decimalDigits: 2,
        },
      },
      labelFormatter: {
        type: false,
        alias: '预测单量达成率',
      },
    },
    {
      auxiliaryData: {
        commons: [],
      },
      dataFormatter: {
        type: 'number',
        isCeil: true,
        number: {
          decimalDigits: 2,
          thousandthSeparated: true,
        },
        percent: {
          decimalDigits: 2,
        },
      },
      dataRequest: {},
      extra: {
        invisible: false,
      },
      labelAdvanced: {
        type: 'none',
        drillType: 'out',
        dialog: {
          width: 800,
          height: 400,
        },
      },
      labelFormatter: {
        type: false,
      },
      code: 'avg_dist_pack_rate',
      label: '单均仓配交接时长',
      type: 'indicator',
    },
    {
      auxiliaryData: {
        commons: [],
      },
      dataFormatter: {
        type: 'number',
        isCeil: true,
        number: {
          decimalDigits: 2,
          thousandthSeparated: true,
        },
        percent: {
          decimalDigits: 2,
        },
      },
      dataRequest: {},
      extra: {
        invisible: false,
      },
      labelAdvanced: {
        type: 'none',
        drillType: 'out',
        dialog: {
          width: 800,
          height: 400,
        },
      },
      labelFormatter: {
        type: false,
      },
      code: 'avg_ship_dist_rate',
      label: '单均配送揽收时长',
      type: 'indicator',
    },
    {
      name: '截止当前时段单量达成率',
      auxiliaryData: {
        commons: [],
      },
      dataFormatter: {
        type: 'percent',
        isCeil: true,
        number: {
          decimalDigits: 2,
          thousandthSeparated: true,
        },
        percent: {
          decimalDigits: 2,
        },
      },
      dataRequest: {},
      extra: {
        invisible: false,
      },
      labelAdvanced: {
        type: 'none',
        drillType: 'out',
        dialog: {
          width: 800,
          height: 400,
        },
      },
      labelFormatter: {
        type: false,
      },
      id: 4047,
      code: 'predict_now_rate',

      exprIndicators: ['predict_now_order_cnt', 'now_user_order_count'],
      editType: 0,
      tags: null,
      label: '截止当前时段单量达成率',
      type: 'indicator',
    },
    {
      auxiliaryData: {
        commons: [],
      },
      dataFormatter: {
        type: 'percent',
        isCeil: true,
        number: {
          decimalDigits: 2,
          thousandthSeparated: true,
        },
        percent: {
          decimalDigits: 2,
        },
      },
      dataRequest: {},
      extra: {
        invisible: false,
      },
      labelAdvanced: {
        type: 'none',
        drillType: 'out',
        dialog: {
          width: 800,
          height: 400,
        },
      },
      labelFormatter: {
        type: false,
      },
      id: 4048,
      name: 'SLA内仓及时率',
      code: 'sla_warehouse_ontime_rate',

      exprIndicators: [
        'user_cancel_count',
        'batched_order_count',
        'sla_over_ffl_order_cnt',
      ],
      editType: 0,
      tags: null,
      label: 'SLA内仓及时率',
      type: 'indicator',
    },
    {
      auxiliaryData: {
        commons: [],
      },
      dataFormatter: {
        type: 'percent',
        isCeil: true,
        number: {
          decimalDigits: 2,
          thousandthSeparated: true,
        },
        percent: {
          decimalDigits: 2,
        },
      },
      dataRequest: {},
      extra: {
        invisible: false,
      },
      labelAdvanced: {
        type: 'none',
        drillType: 'out',
        dialog: {
          width: 800,
          height: 400,
        },
      },
      labelFormatter: {
        type: false,
      },
      id: 4049,
      name: 'SLA配送及时率',
      code: 'sla_delivery_ontime_rate',

      exprIndicators: [
        'user_cancel_count',
        'batched_order_count',
        'sla_dlv_over_ffl_order_cnt',
      ],
      editType: 0,
      tags: null,
      label: 'SLA配送及时率',
      type: 'indicator',
    },
  ],
  chartFormData: {
    isDownLoad: false,
    downLoadType: 'downLoadExcel',
    downLoadFront: {
      downloadName: 'default',
    },
    isChartImgDownLoad: false,
    chartDonwloadName: 'default',
    isPaging: false,
    drillConfig: {
      isDrill: false,
      drillKey: 'id',
      drillType: 'base',
      isAlignRight: false,
      drillParentKey: 'parentId',
      drillLevel: 0,
    },
    tableGroup: [
      {
        name: '核心KPI',
        color: '',
        groups: ['perfect_ffl_rate', 'saleout_rate', 'right30min_rate'],
      },
      {
        name: '物流KPI',
        color: '',
        groups: ['whse_12min_rate'],
      },
      {
        name: '单量现状',
        color: '',
        groups: ['predict_order_rate'],
      },
      {
        name: '生产数据',
        color: '',
        groups: [
          'unbatched_cnt',
          'wait_pack_cnt',
          'wait_ship_cnt',
          'on_ship_cnt',
        ],
      },
      {
        name: '异常',
        color: '',
        groups: ['overtime_cnt'],
      },
      {
        name: '辅助判断',
        color: '',
        groups: [
          'rightnow1h_rate',
          'integration_rate',
          'avg_dist_pack_rate',
          'avg_ship_dist_rate',
        ],
      },
    ],
    width: 120,
    isOprationStick: true,
    isDownload: true,
    orders: [],
    colFixed: [
      {
        column: 'subsidiary_name',
        position: 'left',
      },
    ],
  },
};
