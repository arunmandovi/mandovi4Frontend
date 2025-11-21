// src/utils/buildPivotTable.js

// Helper: extract city name safely
const readCityName = (row) =>
  row?.city || row?.City || row?.cityName || row?.CityName || row?.name || row?.Name || "";

// Helper: extract numeric growth/values
const readGrowthValue = (row, apiKey) => {
  const raw = row?.[apiKey];
  if (raw == null) return 0;
  const cleaned = String(raw).replace("%", "").trim();
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Build reusable table data for pivot summary
 *
 * @summary      = API result (array of {month, data[]})
 * @keys         = keys for the selected growth (from LoaddPage)
 * @citiesToShow = ["Bangalore", "Mysore", ...]
 * 
 * returns: { tableData, chartMonths }
 */
export const buildPivotTable = (summary, keys, citiesToShow = []) => {
  if (!keys || keys.length === 0) return { tableData: [], chartMonths: [] };

  // Only months that appear on chart
  const chartMonths = summary
    .filter((s) => s.data && s.data.length > 0)
    .map((s) => s.month);

  const rows = [];

  citiesToShow.forEach((city) => {
    const row = { city };

    chartMonths.forEach((m) => {
      const summaryEntry = summary.find((x) => x.month === m);
      const cityRow = summaryEntry?.data?.find((it) => readCityName(it) === city);

      keys.forEach((k) => {
        row[`${m}_${k}`] = cityRow ? readGrowthValue(cityRow, k) : 0;
      });
    });

    rows.push(row);
  });

  return { tableData: rows, chartMonths };
};
