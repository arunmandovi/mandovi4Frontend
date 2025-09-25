// central place for API endpoints. Edit here to add/remove modules
export const apiModules = [
{ name: 'Battery & Tyre', 
  upload: '/api/battery_tyre/upload', 
  get: '/api/battery_tyre/getallbattery_tyre',
  getBatteryTyreByMonthYear: '/api/battery_tyre/getbattery_tyre/{month}/{year}'
},
{ name: 'BR Conversion', 
  upload: '/api/br_conversion/upload', 
  get: '/api/br_conversion/getallbr_conversion',
  getBRConversionByMonthYear :'/api/br_conversion/getbr_conversion/{month}/{year}'
},
{ name: 'Labour', 
  upload: '/api/labour/upload', 
  get: '/api/labour/getalllabour',
  getLabourByMonthYear :'/api/labour/getlabour/{month}/{year}'
},
{ name: 'Loadd', 
  upload: '/api/loadd/upload', 
  get: '/api/loadd/getallloadd',
  getLoaddByMonthYear: '/api/loadd/getloadd/{month}/{year}' 
},
{ name: 'MCP', 
  upload: '/api/mcp/upload', 
  get: '/api/mcp/getallmcp',
  getMCPByMonthYear : '/api/mcp/getmcp/{month}/{year}'
},
{ name: 'MGA', 
  upload: '/api/mga/upload',
  get: '/api/mga/getallmga',
  getMgaByMGADate : '/api/mga/getmga/{mgaDate}'
},
{ name: 'MSGP', 
  upload: '/api/msgp/upload', 
  get: '/api/msgp/getallmsgp',
  getMSGPByMonthYear: '/api/msgp/getmsgp/{month}/{year}'
},
{ name: 'MSGP Profit', 
  upload: '/api/msgp_profit/upload', 
  get: '/api/msgp_profit/getallmsgp_profit',
  getMSGPProfitByMonthYear: '/api/msgp_profit/getmsgp_profit/{month}/{year}'
},
{ name: 'Oil', 
  upload: '/api/oil/upload', 
  get: '/api/oil/getalloil',
  getOilByMonthYear: '/api/oil/getoil/{month}/{year}'
},
{ name: 'PMS Parts',
   upload: '/api/pms_parts/upload',
    get: '/api/pms_parts/getallpms_parts',
    getPMSPartsByPMSDate: '/api/pms_parts/getpms_parts/{pmsDate}' 
},

{ name: 'Profit & Loss', upload: '/api/profit_loss/upload', get: '/api/profit_loss/getallprofit_loss' },

{ name: 'Referencee',
  upload: '/api/referencee/upload',
  get: '/api/referencee/getallreferencee',
  getReferenceeByMonthDate: '/api/referencee/getreferencee/{month}/{year}'
},
{ name: 'Revenue',
  upload: '/api/revenue/upload',
  get: '/api/revenue/getallrevenue',
  getRevenueByMonthYear: '/api/revenue/getrevenue/{month}/{year}'
},
{ name: 'Spares',
  upload: '/api/spares/upload',
  get: '/api/spares/getallspares',
  getSparesByMonthYear: '/api/spares/getspares/{month}/{year}'
},
{ name: 'TAT',
  upload: '/api/tat/upload',
  get: '/api/tat/getalltat',
  getTATByMonthYear: '/api/tat/gettat/{month}/{year}'
},
{ name: 'VAS',
  upload: '/api/vas/upload',
  get: '/api/vas/getallvas',
  getVASByMonthYear: '/api/vas/getvas/{month}/{year}'
},
];