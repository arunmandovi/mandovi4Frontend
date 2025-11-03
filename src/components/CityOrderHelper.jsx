export const preferredCityOrder = ["Bangalore", "Mysore", "Mangalore"];

export const sortCities = (cityList) => {
  if (!Array.isArray(cityList)) return [];

  // ✅ Remove duplicates and keep original casing
  const uniqueCities = [...new Map(cityList.map(c => [c?.toLowerCase(), c])).values()];

  // ✅ Create lowercase version for checking order match
  const lowerCaseMap = Object.fromEntries(uniqueCities.map(c => [c.toLowerCase(), c]));

  const preferred = preferredCityOrder
    .map(pc => lowerCaseMap[pc.toLowerCase()])
    .filter(Boolean); // Only include if exists

  const others = uniqueCities
    .filter(c =>
      !preferredCityOrder.some(p => p.toLowerCase() === c.toLowerCase())
    )
    .sort((a, b) => a.localeCompare(b)); // alphabetical for remaining

  return [...preferred, ...others];
};
