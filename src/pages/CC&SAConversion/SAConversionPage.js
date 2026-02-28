import GenericConversionLineChart from './GenericConversionLineChart';

const SAConversionPage = () => (
  <GenericConversionLineChart
    type="sa"
    title="SA CONVERSION"
    xAxisDataKey="sa"
    nameField="sa"
    apiPrefix="api/sa"
    tableRoute="/DashboardHome/sa_conversion_table"
    barChartRoute="/DashboardHome/sa_conversion-bar-chart"
  />
);

export default SAConversionPage;
