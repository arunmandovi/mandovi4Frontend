import GenericBranchTable from "./GenericBranchTable"; // adjust path

const ServiceeTablePage = () => {
  const config = {
    startYear: 2019,
    branches: ["Balmatta", "Uppinangady", "Surathkal", "Sullia", "Adyar", "Sujith Bagh Lane", 
               "Naravi", "Bantwal", "Nexa Service", "Kadaba", "Vittla", "Yeyyadi BR"],
    extraFilters: {
      name: "serviceCodes",
      items: ["PMS20", "PMS30", "PMS40", "PMS50", "MORE THAN PMS50"]
    }
  };

  const navigationRoutes = [
    { label: "Line Chart", path: "/DashboardHome/servicee" },
    { label: "Bar Chart", path: "/DashboardHome/servicee-bar-chart" },
    { label: "Table", path: "" },
    { label: "Growth", path: "/DashboardHome/servicee_growth" }
  ];

  return (
    <GenericBranchTable
      title="SERVICE – BRANCH SUMMARY"
      apiEndpoint="/api/servicee/servicee_branch_summary"
      config={config}
      navigationRoutes={navigationRoutes}
      valueField="serviceLoadd"
    />
  );
};

export default ServiceeTablePage;
