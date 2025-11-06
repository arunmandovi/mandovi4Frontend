import React from "react";
import { Box, Button, Typography } from "@mui/material";

const SlicerFilters = ({
  monthOptions = [],
  yearOptions = [],
  channelOptions = [],
  qtrWiseOptions = [],
  halfYearOptions = [],
  cityOptions = [],
  months = [],
  setMonths = () => {},
  years = [],
  setYears = () => {},
  channels = [],
  setChannels = () => {},
  qtrWise = [],
  setQtrWise = () => {},
  halfYear = [],
  setHalfYear = () => {},
  cities = [],
  setCities = () => {},
}) => {
  const quarterMapping = {
    Qtr1: ["Apr", "May", "Jun"],
    Qtr2: ["Jul", "Aug", "Sep"],
    Qtr3: ["Oct", "Nov", "Dec"],
    Qtr4: ["Jan", "Feb", "Mar"],
  };

  const halfMapping = {
    H1: {
      months: [...quarterMapping.Qtr1, ...quarterMapping.Qtr2],
      quarters: ["Qtr1", "Qtr2"],
    },
    H2: {
      months: [...quarterMapping.Qtr3, ...quarterMapping.Qtr4],
      quarters: ["Qtr3", "Qtr4"],
    },
  };

  const handleHalfYearClick = (h) => {
    const selected = halfYear.includes(h);
    const { months: autoMonths, quarters: autoQuarters } = halfMapping[h];

    let updatedHalf = selected
      ? halfYear.filter((x) => x !== h)
      : [...halfYear, h];

    setHalfYear(updatedHalf);

    let updatedMonths = [...months];
    let updatedQuarters = [...qtrWise];

    if (!selected) {
      autoMonths.forEach((m) => !updatedMonths.includes(m) && updatedMonths.push(m));
      autoQuarters.forEach((q) => !updatedQuarters.includes(q) && updatedQuarters.push(q));
    } else {
      updatedMonths = updatedMonths.filter((m) => !autoMonths.includes(m));
      updatedQuarters = updatedQuarters.filter((q) => !autoQuarters.includes(q));
    }

    setMonths(updatedMonths);
    setQtrWise(updatedQuarters);
  };

  const handleQuarterClick = (q) => {
    const selected = qtrWise.includes(q);
    const relatedMonths = quarterMapping[q];

    let updatedQuarters = selected
      ? qtrWise.filter((x) => x !== q)
      : [...qtrWise, q];

    setQtrWise(updatedQuarters);

    let updatedMonths = [...months];

    if (!selected) {
      relatedMonths.forEach((m) => !updatedMonths.includes(m) && updatedMonths.push(m));
    } else {
      updatedMonths = updatedMonths.filter((m) => !relatedMonths.includes(m));
    }

    setMonths(updatedMonths);
  };

  const selectedGradient =
    "linear-gradient(90deg, rgba(144,238,144,1) 0%, rgba(102,205,170,1) 100%)";

  const commonButtonStyles = (selected) => ({
    borderRadius: "20px",
    px: 2,
    py: 0.5,
    textTransform: "none",
    fontWeight: 600,
    transition: "all 0.3s ease",
    background: selected ? selectedGradient : "white",
    border: selected ? "1.5px solid #388e3c" : "1px solid #bdbdbd",
    boxShadow: selected ? "0 3px 10px rgba(0,0,0,0.15)" : "none",
    "&:hover": {
      transform: "scale(1.05)",
      background: selected ? selectedGradient : "rgba(0, 0, 0, 0.04)",
    },
  });

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mb: 3 }}>

      {/* ✅ Top Row → Months + Years + Cities */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
        
        {/* ✅ Months */}
        {monthOptions.length > 0 && (
          <Box>
            <Typography sx={{ fontWeight: 600, mb: 1 }}>
              Select Month(s)
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.2 }}>
              {monthOptions.map((m) => {
                const selected = months.includes(m);
                return (
                  <Button
                    key={m}
                    sx={commonButtonStyles(selected)}
                    size="small"
                    onClick={() =>
                      selected
                        ? setMonths(months.filter((x) => x !== m))
                        : setMonths([...months, m])
                    }
                  >
                    {m}
                  </Button>
                );
              })}
            </Box>
          </Box>
        )}

        {/* ✅ Years */}
        {yearOptions.length > 0 && (
          <Box>
            <Typography sx={{ fontWeight: 600, mb: 1 }}>
              Select Year(s)
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.2 }}>
              {yearOptions.map((y) => {
                const selected = years.includes(y);
                return (
                  <Button
                    key={y}
                    sx={commonButtonStyles(selected)}
                    size="small"
                    onClick={() =>
                      selected
                        ? setYears(years.filter((x) => x !== y))
                        : setYears([...years, y])
                    }
                  >
                    {y}
                  </Button>
                );
              })}
            </Box>
          </Box>
        )}

        {/* ✅ Cities */}
        {cityOptions.length > 0 && (
          <Box>
            <Typography sx={{ fontWeight: 600, mb: 1 }}>
              Select City(s)
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.2 }}>
              {cityOptions.map((c) => {
                const selected = cities.includes(c);
                return (
                  <Button
                    key={c}
                    sx={commonButtonStyles(selected)}
                    size="small"
                    onClick={() =>
                      selected
                        ? setCities(cities.filter((x) => x !== c))
                        : setCities([...cities, c])
                    }
                  >
                    {c}
                  </Button>
                );
              })}
            </Box>
          </Box>
        )}
      </Box>

      {/* ✅ Bottom Row → Channels + Quarter + Half Year */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
        
        {/* ✅ Channels */}
        {channelOptions.length > 0 && (
          <Box>
            <Typography sx={{ fontWeight: 600, mb: 1 }}>
              Select Channel(s)
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.2 }}>
              {channelOptions.map((ch) => {
                const selected = channels.includes(ch);
                return (
                  <Button
                    key={ch}
                    sx={commonButtonStyles(selected)}
                    size="small"
                    onClick={() =>
                      selected
                        ? setChannels(channels.filter((x) => x !== ch))
                        : setChannels([...channels, ch])
                    }
                  >
                    {ch}
                  </Button>
                );
              })}
            </Box>
          </Box>
        )}

        {/* ✅ Quarters */}
        {qtrWiseOptions.length > 0 && (
          <Box>
            <Typography sx={{ fontWeight: 600, mb: 1 }}>
              Select Quarter(s)
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.2 }}>
              {qtrWiseOptions.map((q) => {
                const selected = qtrWise.includes(q);
                return (
                  <Button
                    key={q}
                    sx={commonButtonStyles(selected)}
                    size="small"
                    onClick={() => handleQuarterClick(q)}
                  >
                    {q}
                  </Button>
                );
              })}
            </Box>
          </Box>
        )}

        {/* ✅ Half Years */}
        {halfYearOptions.length > 0 && (
          <Box>
            <Typography sx={{ fontWeight: 600, mb: 1 }}>
              Select Half Year(s)
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.2 }}>
              {halfYearOptions.map((h) => {
                const selected = halfYear.includes(h);
                return (
                  <Button
                    key={h}
                    sx={commonButtonStyles(selected)}
                    size="small"
                    onClick={() => handleHalfYearClick(h)}
                  >
                    {h}
                  </Button>
                );
              })}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default SlicerFilters;
