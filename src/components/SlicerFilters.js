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
  setHalfYear = () => {}, // ✅ fixed naming
  cities = [],
  setCities = () => {},
}) => {
  // ✅ Gradient for selected buttons
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
    color: "inherit",
    border: selected ? "1.5px solid #388e3c" : "1px solid #bdbdbd",
    boxShadow: selected ? "0 3px 10px rgba(0,0,0,0.15)" : "none",
    "&:hover": {
      transform: "scale(1.05)",
      background: selected ? selectedGradient : "rgba(0, 0, 0, 0.04)",
    },
  });

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mb: 3 }}>
      {/* Month Slicer */}
      {monthOptions.length > 0 && (
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            Select Month(s)
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.2 }}>
            {monthOptions.map((m) => {
              const selected = months.includes(m);
              return (
                <Button
                  key={m}
                  variant="outlined"
                  size="small"
                  sx={commonButtonStyles(selected)}
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

      {/* Year Slicer */}
      {yearOptions.length > 0 && (
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            Select Year(s)
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.2 }}>
            {yearOptions.map((y) => {
              const selected = years.includes(y);
              return (
                <Button
                  key={y}
                  variant="outlined"
                  size="small"
                  sx={commonButtonStyles(selected)}
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

      {/* ✅ Channel + Quarter + Half-Year in a single row */}
      {(channelOptions.length > 0 ||
        qtrWiseOptions.length > 0 ||
        halfYearOptions.length > 0) && (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 4,
            alignItems: "flex-start",
          }}
        >
          {/* Channel Slicer */}
          {channelOptions.length > 0 && (
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Select Channel(s)
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.2 }}>
                {channelOptions.map((ch) => {
                  const selected = channels.includes(ch);
                  return (
                    <Button
                      key={ch}
                      variant="outlined"
                      size="small"
                      sx={commonButtonStyles(selected)}
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

          {/* Quarter Slicer */}
          {qtrWiseOptions.length > 0 && (
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Select Quarter(s)
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.2 }}>
                {qtrWiseOptions.map((q) => {
                  const selected = qtrWise.includes(q);
                  return (
                    <Button
                      key={q}
                      variant="outlined"
                      size="small"
                      sx={commonButtonStyles(selected)}
                      onClick={() =>
                        selected
                          ? setQtrWise(qtrWise.filter((x) => x !== q))
                          : setQtrWise([...qtrWise, q])
                      }
                    >
                      {q}
                    </Button>
                  );
                })}
              </Box>
            </Box>
          )}

          {/* Half Year Slicer */}
          {halfYearOptions.length > 0 && (
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Select Half Year(s)
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.2 }}>
                {halfYearOptions.map((h) => {
                  const selected = halfYear.includes(h);
                  return (
                    <Button
                      key={h}
                      variant="outlined"
                      size="small"
                      sx={commonButtonStyles(selected)}
                      onClick={() =>
                        selected
                          ? setHalfYear(halfYear.filter((x) => x !== h))
                          : setHalfYear([...halfYear, h])
                      }
                    >
                      {h}
                    </Button>
                  );
                })}
              </Box>
            </Box>
          )}
        </Box>
      )}

      {/* City Slicer */}
      {cityOptions.length > 0 && (
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            Select City(s)
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.2 }}>
            {cityOptions.map((c) => {
              const selected = cities.includes(c);
              return (
                <Button
                  key={c}
                  variant="outlined"
                  size="small"
                  sx={commonButtonStyles(selected)}
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
  );
};

export default SlicerFilters;
