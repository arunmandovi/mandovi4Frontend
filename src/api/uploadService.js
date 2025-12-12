import axios from './axiosConfig';

// ---------------------------
// Upload File Function
// ---------------------------
export const uploadFile = (uploadPath, file, onUploadProgress) => {
  const formData = new FormData();
  formData.append('file', file);

  return axios.post(uploadPath, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  });
};

// ---------------------------
// GET Data Function
// ---------------------------
export const fetchData = (getPath) =>
  axios.get(getPath).then((res) => res.data);

// ---------------------------
// POST Data Function (✔ FIX FOR YOUR HOLIDAY CALENDAR)
// ---------------------------
export const postData = (postPath, body) => {
  return axios
    .post(postPath, body, {
      headers: { "Content-Type": "application/json" },
    })
    .then((res) => res.data)
    .catch((err) => {
      console.error("postData error:", err);
      throw err;
    });
};

// Export all
export default {
  uploadFile,
  fetchData,
  postData,
};
