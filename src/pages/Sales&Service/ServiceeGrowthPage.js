import React from "react";
import GrowthChartPage from "./GrowthChartPage ";

const ServiceeGrowthPage = () => (
  <GrowthChartPage
    title="SERVICE GROWTH % (YEAR VS BRANCH)"
    apiEndpoint="/api/servicee/servicee_branch_summary"
    metricKey="serviceLoadd"
    yearsStart={2019}
    branches={["Balmatta", "Uppinangady", "Surathkal", "Sullia", "Adyar", "Sujith Bagh Lane", "Naravi", "Bantwal", "Nexa Service", "Kadaba", "Vittla", "Yeyyadi BR"]}
    branchColors={{
      Balmatta: "#1f77b4", Uppinangady: "#ff7f0e", Surathkal: "#2ca02c",
      Sullia: "#d62728", Adyar: "#17becf", "Sujith Bagh Lane": "#bcbd22",
      Naravi: "#ff9896", Bantwal: "#9467bd", "Nexa Service": "#8c564b",
      Kadaba: "#e377c2", Vittla: "#7f7f7f", "Yeyyadi BR": "#98df8a"
    }}
    serviceCodes={["PMS20", "PMS30", "PMS40", "PMS50", "MORE THAN PMS50"]}
    navigateUrls={[
      { path: "/DashboardHome/servicee", label: "Line Chart" },
      { path: "/DashboardHome/servicee-bar-chart", label: "Bar Chart" },
      { path: "/DashboardHome/servicee_table", label: "Table" }
    ]}
  />
);

export default ServiceeGrowthPage;
