import GenericChartPage from './GenericChartPage';

const ServiceePage = () => (
  <GenericChartPage
    title="SERVICE"
    apiPrefix="servicee"
    yearsStart={2019}
    branches={["Balmatta","Uppinangady","Surathkal","Sullia","Adyar","Sujith Bagh Lane","Naravi","Bantwal","Nexa Service","Kadaba","Vittla","Yeyyadi BR"]}
    branchColors={{
      Balmatta: "#1f77b4", Uppinangady: "#ff7f0e", Surathkal: "#2ca02c",
      Sullia: "#d62728", Adyar: "#17becf", "Sujith Bagh Lane": "#bcbd22",
      Naravi: "#ff9896", Bantwal: "#9467bd", "Nexa Service": "#8c564b",
      Kadaba: "#e377c2", Vittla: "#7f7f7f", "Yeyyadi BR": "#98df8a"
    }}
    extraFilterOptions={["PMS20", "PMS30", "PMS40", "PMS50", "MORE THAN PMS50"]}
    dataValueKey="serviceLoadd"
    barChartPath="servicee-bar-chart"
    tablePath="servicee_table"
    growthPath="servicee_growth"
  />
);
export default ServiceePage;
