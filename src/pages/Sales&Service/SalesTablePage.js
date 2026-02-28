import GenericBranchTable from "./GenericBranchTable"; // adjust path

const SalesTablePage = () => {
  const config = {
    startYear: 2005,
    branches: ["Balmatta", "Uppinangady", "Surathkal", "Sullia", "Bantwal", "Nexa", "Kadaba", "Vittla"],
    extraFilters: null // no extra filters for sales
  };

  const navigationRoutes = [
    { label: "Line Chart", path: "/DashboardHome/sales" },
    { label: "Bar Chart", path: "/DashboardHome/sales-bar-chart" },
    { label: "Table", path: "" },
    { label: "Growth", path: "/DashboardHome/sales_growth" }
  ];

  return (
    <GenericBranchTable
      title="SALES – BRANCH SUMMARY"
      apiEndpoint="/api/sales/sales_branch_summary"
      config={config}
      navigationRoutes={navigationRoutes}
      valueField="count"
    />
  );
};

export default SalesTablePage;
