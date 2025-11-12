import axios from "./axiosConfig";

/**
 * Generic delete handler for any delete endpoint
 * Supports both DELETE and GET methods
 */
export const deleteData = async (deletePath) => {
  try {
    // Try DELETE first (preferred REST way)
    const response = await axios.delete(deletePath);
    return response.data;
  } catch (err) {
    // Fallback to GET if backend doesn't support DELETE method
    if (err.response && err.response.status === 405) {
      const response = await axios.get(deletePath);
      return response.data;
    }
    // Throw properly formatted error
    throw err;
  }
};
