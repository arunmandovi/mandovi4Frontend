import GenericChartPage from './GenericChartPage';

const SalesPage = () => (
  <GenericChartPage
    title="SALES"
    apiPrefix="sales"
    yearsStart={2005}
    branches={["Balmatta","Uppinangady","Surathkal","Sullia","Bantwal","Nexa","Kadaba","Vittla"]}
    branchColors={{
      Balmatta: "#1f77b4", Uppinangady: "#ff7f0e", Surathkal: "#2ca02c",
      Sullia: "#d62728", Bantwal: "#9467bd", Nexa: "#8c564b",
      Kadaba: "#e377c2", Vittla: "#7f7f7f"
    }}
    dataValueKey="count"
    barChartPath="sales-bar-chart"
    tablePath="sales_table"
    growthPath="sales_growth"
  />
);
export default SalesPage;
