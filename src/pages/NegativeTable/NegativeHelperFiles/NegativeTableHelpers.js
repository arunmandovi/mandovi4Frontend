import { red } from "@mui/material/colors";

export const tableContainerSx = {
  borderRadius: 3,
  boxShadow: 4,
  border: "2px solid #455a64",
  maxHeight: 600,
};

export const tableSx = {
  "& th, & td": {
    border: "1px solid #9e9e9e",
    fontSize: "0.8rem",
    padding: "4px 6px",
  },
};

export const tableHeadRowSx = {
  background: "#718390ff",
  "& th": {
    color: "#fff",
    fontWeight: 800,
    fontSize: "0.85rem",
  },
};

export const toggleGroupSx = {
  p: 0.5,
  borderRadius: "999px",
  backgroundColor: "#f8fafc",
  border: "1px solid #d6dbe3",
  boxShadow: "0 2px 8px rgba(15, 23, 42, 0.08)",
  "& .MuiToggleButtonGroup-grouped": {
    margin: "0 4px",
    border: "1px solid #d6dbe3 !important",
    borderRadius: "999px !important",
    textTransform: "none",
    fontSize: "0.82rem",
    fontWeight: 600,
    padding: "6px 14px",
    color: "#334155",
    backgroundColor: "#fff",
    minWidth: 92,
    transition: "all 0.2s ease",
    "&:not(:first-of-type)": {
      borderLeft: "1px solid #d6dbe3 !important",
    },
    "&:hover": {
      backgroundColor: "#eef4ff",
      borderColor: "#94a3b8",
      transform: "translateY(-1px)",
    },
    "&.Mui-selected": {
      background: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)",
      color: "#fff",
      borderColor: "#2563eb !important",
      boxShadow: "0 4px 10px rgba(37, 99, 235, 0.25)",
    },
    "&.Mui-selected:hover": {
      background: "linear-gradient(135deg, #1e40af 0%, #1d4ed8 100%)",
    },
  },
};

export const getNegativeCellSx = (value) => {
  if (value === "--" || value === null) return {};
  const num = parseFloat(String(value).replace("%", ""));
  if (isNaN(num) || num >= 0) return {};
  return {
    backgroundColor: red[100],
    color: red[800],
    fontWeight: 900,
  };
};

export const handleCityChangeExternal = ({
  e,
  setSelectedCities,
  setSelectedBranches,
  ALL_BRANCHES,
  CITY_ORDER,
  BRANCH_CITY_MAP,
}) => {
  const newSelectedCities = e.target.value;
  setSelectedCities(newSelectedCities);

  if (newSelectedCities.length > 0) {
    const branchesForCities = CITY_ORDER
      .filter((city) => newSelectedCities.includes(city))
      .flatMap((city) =>
        Object.entries(BRANCH_CITY_MAP)
          .filter(([_, c]) => c === city)
          .map(([br]) => br)
      );
    setSelectedBranches(branchesForCities);
  } else {
    setSelectedBranches(ALL_BRANCHES);
  }
};

export const buildTableData = ({
  summary,
  selectedBranches,
  selectedCities,
  valueFilter,
  growthKeyMap,
  growthFormatConfig,
  readBranchName,
  readCityName,
  readGrowthValue,
  decimalPlaces = 1,
  showPercent = true,
}) => {
  if (!selectedBranches.length) return [];

  const branchMap = new Map();

  summary.forEach((row) => {
    const br = readBranchName(row);
    const city = readCityName(row);

    if (selectedCities.length > 0 && !selectedCities.includes(city)) return;
    if (!selectedBranches.includes(br)) return;

    if (!branchMap.has(br)) {
      branchMap.set(br, {
        branch: br,
        city,
        growthValues: {},
      });
    }

    const item = branchMap.get(br);

    for (const key of Object.values(growthKeyMap)) {
      const rawVal = readGrowthValue(row, key);
      if (rawVal !== null) {
        if (!item.growthValues[key]) {
          item.growthValues[key] = { sum: 0, count: 0 };
        }
        item.growthValues[key].sum += rawVal;
        item.growthValues[key].count += 1;
      }
    }
  });

  const result = Array.from(branchMap.values()).map((item) => {
    const row = {
      branch: item.branch,
      city: item.city,
    };

    let allPositive = true;
    let hasNegative = false;
    let hasPositive = false;

    for (const [label, key] of Object.entries(growthKeyMap)) {
      if (item.growthValues[key]) {
        const avg = item.growthValues[key].sum / item.growthValues[key].count;

        const format = growthFormatConfig?.[key] || {
          decimalPlaces: 0,
          showPercent: false,
        };
        
        const formatted = Number(avg).toFixed(format.decimalPlaces);
        
        row[label] = format.showPercent ? `${formatted} %` : formatted;

        if (avg < 0) {
          hasNegative = true;
          allPositive = false;
        }
        if (avg > 0) {
          hasPositive = true;
        }
      } else {
        row[label] = "--";
      }
    }

    row._allPositive = allPositive;
    row._hasNegative = hasNegative;
    row._hasPositive = hasPositive;

    return row;
  });

  if (valueFilter.includes("positive") && valueFilter.includes("negative")) {
    return result;
  } else if (valueFilter.includes("positive")) {
    return result.filter((row) => row._allPositive);
  } else if (valueFilter.includes("negative")) {
    return result.filter((row) => row._hasNegative);
  }

  return result;
};