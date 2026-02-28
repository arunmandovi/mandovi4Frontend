import React from "react";
import GrowthChartPage from "./GrowthChartPage ";

const SalesGrowthPage = () => (
  <GrowthChartPage
    title="SALES GROWTH % (YEAR VS BRANCH)"
    apiEndpoint="/api/sales/sales_branch_summary"
    metricKey="count"
    yearsStart={2005}
    branches={["Balmatta", "Uppinangady", "Surathkal", "Sullia", "Bantwal", "Nexa", "Kadaba", "Vittla"]}
    branchColors={{
      Balmatta: "#1f77b4", Uppinangady: "#ff7f0e", Surathkal: "#2ca02c",
      Sullia: "#d62728", Bantwal: "#9467bd", Nexa: "#8c564b",
      Kadaba: "#e377c2", Vittla: "#7f7f7f"
    }}
    navigateUrls={[
      { path: "/DashboardHome/sales", label: "Line Chart" },
      { path: "/DashboardHome/sales-bar-chart", label: "Bar Chart" },
      { path: "/DashboardHome/sales_table", label: "Table" }
    ]}
  />
);

export default SalesGrowthPage;
