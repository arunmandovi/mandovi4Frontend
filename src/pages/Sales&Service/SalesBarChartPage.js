import React from "react";
import GenericBarChartPage from "./GenericBarChartPage"; // Single line import

const BRANCHES = [
  "Balmatta","Uppinangady","Surathkal","Sullia",
  "Bantwal","Nexa","Kadaba","Vittla"
];

const SalesBarChartPage = () => (
  <GenericBarChartPage
    title="SALES"
    apiEndpoint="/api/sales/sales_branch_summary"
    dataKey="count"
    yearsStart={2005}
    branches={BRANCHES}
    lineChartPath="/DashboardHome/sales"
    tablePath="/DashboardHome/sales_table"
    growthPath="/DashboardHome/sales_growth"
  />
);

export default SalesBarChartPage;
