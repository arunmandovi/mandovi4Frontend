// central place for API endpoints. Edit here to add/remove modules
export const apiModules = [
{ name: 'Battery & Tyre', 
  upload: '/api/battery_tyre/upload', 
  get: '/api/battery_tyre/getallbattery_tyre',
  getBatteryTyreByMonthYear: '/api/battery_tyre/getbattery_tyre'
},
{ name: 'BR Conversion', 
  upload: '/api/br_conversion/upload', 
  get: '/api/br_conversion/getallbr_conversion',
  getBRConversionByMonthYear :'/api/br_conversion/getbr_conversion'
},
{ name: 'Labour', 
  upload: '/api/labour/upload', 
  get: '/api/labour/getalllabour',
  getLabourByMonthYear :'/api/labour/getlabour'
},
{ name: 'Loadd', 
  upload: '/api/loadd/upload', 
  get: '/api/loadd/getallloadd',
  getLoaddByMonthYear: '/api/loadd/getloadd' 
},
{ name: 'MCP', 
  upload: '/api/mcp/upload', 
  get: '/api/mcp/getallmcp',
  getMCPByMonthYear : '/api/mcp/getmcp'
},
{ name: 'MGA', 
  upload: '/api/mga/upload',
  get: '/api/mga/getallmga',
  getMgaByMonthYear : '/api/mga/getmga'
},
{ name: 'MGA Profit', 
  upload: '/api/mga_profit/upload',
  get: '/api/mga_profit/getallmga_profit',
  getMgaProfitByMonthYear : '/api/mga_profit/getmga_profit'
},
{ name: 'MSGP', 
  upload: '/api/msgp/upload', 
  get: '/api/msgp/getallmsgp',
  getMSGPByMonthYear: '/api/msgp/getmsgp'
},
{ name: 'MSGP Profit', 
  upload: '/api/msgp_profit/upload', 
  get: '/api/msgp_profit/getallmsgp_profit',
  getMSGPProfitByMonthYear: '/api/msgp_profit/getmsgp_profit'
},
{ name: 'Oil', 
  upload: '/api/oil/upload', 
  get: '/api/oil/getalloil',
  getOilByMonthYear: '/api/oil/getoil'
},
{ name: 'PMS Parts',
   upload: '/api/pms_parts/upload',
    get: '/api/pms_parts/getallpms_parts',
    getPMSPartsByMonthYear: '/api/pms_parts/getpms_parts' 
},

{ name: 'Profit & Loss', upload: '/api/profit_loss/upload', get: '/api/profit_loss/getallprofit_loss' },

{ name: 'Referencee',
  upload: '/api/referencee/upload',
  get: '/api/referencee/getallreferencee',
  getReferenceeByMonthYear: '/api/referencee/getreferencee'
},
{ name: 'Revenue',
  upload: '/api/revenue/upload',
  get: '/api/revenue/getallrevenue',
  getRevenueByMonthYear: '/api/revenue/getrevenue'
},
{ name: 'Spares',
  upload: '/api/spares/upload',
  get: '/api/spares/getallspares',
  getSparesByMonthYear: '/api/spares/getspares'
},
{ name: 'TAT',
  upload: '/api/tat/upload',
  get: '/api/tat/getalltat',
  getTATByMonthYear: '/api/tat/gettat'
},
{ name: 'VAS',
  upload: '/api/vas/upload',
  get: '/api/vas/getallvas',
  getVASByMonthYear: '/api/vas/getvas'
},
];