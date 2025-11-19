// ---------------------------------------------------------
// Reusable: Sort branches by City → Branch Alphabetically
// ---------------------------------------------------------

// 1) Order in which cities must appear
export const CITY_ORDER = ["Bangalore", "Mysore", "Mangalore"];

// 2) Branch-to-City mapping (single source of truth)
export const BRANCH_CITY_MAP = {
  // ------------------ Bangalore ------------------
  "NS Palya": "Bangalore",
  "Sarjapura": "Bangalore",
  "Basaveshwarnagar": "Bangalore",
  "Kolar Nexa": "Bangalore",
  "Basavangudi": "Bangalore",
  "Gowribidanur": "Bangalore",
  "Hennur": "Bangalore",
  "JP Nagar": "Bangalore",
  "Kolar": "Bangalore",
  "Basavanagudi-SOW": "Bangalore",
  "Malur SOW": "Bangalore",
  "Maluru WS": "Bangalore",
  "Uttarahali Kengeri": "Bangalore",
  "Vidyarannapura": "Bangalore",
  "Vijayanagar": "Bangalore",
  "Wilson Garden": "Bangalore",
  "Yelahanka": "Bangalore",
  "Yeshwanthpur WS": "Bangalore",

  // ------------------ Mysore ------------------
  "Bannur": "Mysore",
  "ChamrajNagar": "Mysore",
  "Hunsur Road": "Mysore",
  "Maddur": "Mysore",
  "Gonikoppa": "Mysore",
  "Mandya": "Mysore",
  "KRS Road": "Mysore",
  "Kushalnagar": "Mysore",
  "Krishnarajapet": "Mysore",
  "Mysore Nexa": "Mysore",
  "Somvarpet": "Mysore",
  "Narasipura": "Mysore",
  "Kollegal": "Mysore",

  // ------------------ Mangalore ------------------
  "Balmatta": "Mangalore",
  "Bantwal": "Mangalore",
  "Vittla": "Mangalore",
  "Kadaba": "Mangalore",
  "Uppinangady": "Mangalore",
  "Surathkal": "Mangalore",
  "Sullia": "Mangalore",
  "Adyar": "Mangalore",
  "Yeyyadi BR": "Mangalore",
  "Nexa Service": "Mangalore",
  "Sujith Bagh Lane": "Mangalore",
  "Naravi": "Mangalore",
};

// Normalize helper
const normalize = (s) =>
  String(s || "").trim().replace(/\s+/g, " ").toLowerCase();

// Lookup table for normalized → original name
export const NORMALIZED_BRANCH_MAP = Object.keys(BRANCH_CITY_MAP).reduce(
  (acc, br) => {
    acc[normalize(br)] = br;
    return acc;
  },
  {}
);

// Safely get city name
export const getCityOfBranch = (branch) => {
  const original = NORMALIZED_BRANCH_MAP[normalize(branch)];
  return BRANCH_CITY_MAP[original] || "Others";
};

// Main sorting function
export const sortByCityAndBranch = (a, b) => {
  const cityA = getCityOfBranch(a);
  const cityB = getCityOfBranch(b);

  const indexA = CITY_ORDER.indexOf(cityA);
  const indexB = CITY_ORDER.indexOf(cityB);

  // 1) Sort by city order
  if (indexA !== indexB) return indexA - indexB;

  // 2) Sort alphabetically
  return a.localeCompare(b);
};
