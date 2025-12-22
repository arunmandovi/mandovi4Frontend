import { fetchData, uploadFile } from "../api/uploadService";
import { deleteData } from "../api/deleteService";

/* ============================================================
   🔹 Fetch All Records
============================================================ */
export async function fetchAllRecords(apiUrl) {
  try {
    const data = await fetchData(apiUrl);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("Fetch All Error:", err);
    return [];
  }
}

/* ============================================================
   🔹 Filter by Multiple Months / Types / Years
============================================================ */
export async function filterByMonthYear(apiUrl, months,years, types ) {
  try {
    const params = new URLSearchParams();

    if (Array.isArray(months)) months.forEach((m) => params.append("months", m));
    if (Array.isArray(years)) years.forEach((y) => params.append("years", y));
    if (Array.isArray(types)) types.forEach((t) => params.append("types", t));

    const url = `${apiUrl}?${params.toString()}`;
    const data = await fetchData(url);

    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("Filter Error:", err);
    return [];
  }
}

// uploadPageService.js
export async function filterByTypes(apiUrl, types) {
  try {
    const params = new URLSearchParams();

    if (Array.isArray(types)) {
      types.forEach((t) => params.append("types", t)); // ✅ plural
    }

    const url = `${apiUrl}?${params.toString()}`;
    const data = await fetchData(url);

    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("Filter Error:", err);
    return [];
  }
}


/* ============================================================
   🔹 Upload File
============================================================ */
export async function uploadExcelFile(apiUrl, file) {
  if (!file) throw new Error("Please select a file");

  try {
    const res = await uploadFile(apiUrl, file);
    return res;
  } catch (err) {
    console.error("Upload Error:", err);
    throw err;
  }
}

/* ============================================================
   🔹 Delete All Records
============================================================ */
export async function deleteAllRecords(apiUrl) {
  try {
    const res = await deleteData(apiUrl);
    return res;
  } catch (err) {
    console.error("Delete All Error:", err);
    throw err;
  }
}
