import React from "react";
import GenericBarChartPage from "./GenericBarChartPage"; // Single line import

const BRANCHES = [
  "Balmatta","Uppinangady","Surathkal","Sullia","Adyar","Sujith Bagh Lane", 
  "Naravi","Bantwal","Nexa Service","Kadaba","Vittla", "Yeyyadi BR"
];

const SERVICECODES = ["PMS20", "PMS30", "PMS40", "PMS50", "MORE THAN PMS50"];

const ServiceeBarChartPage = () => (
  <GenericBarChartPage
    title="SERVICE"
    apiEndpoint="/api/servicee/servicee_branch_summary"
    dataKey="serviceLoadd"
    yearsStart={2019}
    branches={BRANCHES}
    extraFilters={{
      queryKey: "serviceCodes",
      options: SERVICECODES
    }}
    lineChartPath="/DashboardHome/servicee"
    tablePath="/DashboardHome/servicee_table"
    growthPath="/DashboardHome/servicee_growth"
  />
);

export default ServiceeBarChartPage;
