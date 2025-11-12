// src/utils/growthSelection.js

const STORAGE_KEY = "selectedGrowthType";
const MODULE_KEY = "lastGrowthModule";

/**
 * Get selected growth only if user is still in the same module.
 * @param {string} moduleName - e.g., "loadd", "labour"
 */
export const getSelectedGrowth = (moduleName) => {
  const lastModule = localStorage.getItem(MODULE_KEY);
  if (lastModule !== moduleName) {
    // Different module → clear the saved growth to prevent cross-page sharing
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
  return localStorage.getItem(STORAGE_KEY) || null;
};

/**
 * Save selected growth and remember which module it belongs to.
 * @param {string} growthType - The selected growth option.
 * @param {string} moduleName - Module identifier ("loadd", "labour", etc.)
 */
export const setSelectedGrowth = (growthType, moduleName) => {
  if (growthType) {
    localStorage.setItem(STORAGE_KEY, growthType);
    localStorage.setItem(MODULE_KEY, moduleName);
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
};
