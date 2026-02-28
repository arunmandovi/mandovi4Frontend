import GenericConversionLineChart from './GenericConversionLineChart';

const CCConversionPage = () => (
  <GenericConversionLineChart
    type="cc"
    title="CC CONVERSION"
    xAxisDataKey="cce"
    nameField="cce"
    apiPrefix="api/cc"
    tableRoute="/DashboardHome/cc_conversion_table"
    barChartRoute="/DashboardHome/cc_conversion-bar-chart"
  />
);

export default CCConversionPage;
