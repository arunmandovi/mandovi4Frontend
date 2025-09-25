import axios from './axiosConfig';


export const uploadFile = (uploadPath, file, onUploadProgress) => {
const formData = new FormData();
formData.append('file', file);
return axios.post(uploadPath, formData, {
headers: { 'Content-Type': 'multipart/form-data' },
onUploadProgress,
});
};


export const fetchData = (getPath) => axios.get(getPath).then((res) => res.data);