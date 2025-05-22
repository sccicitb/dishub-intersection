import axiosInstance from "./apiClient";

// generic func to fetch data
export const apiRequest = async (method, url, data = null) => {
  try {
    const config = { method, url }
    if (data) config.data = data
    const response = await axiosInstance(config)
    return response
  }
  catch (error) {
    console.error("Failed to fetch data:", error);
    throw error
  }
}

export const getRequest = (url) => apiRequest('get', url)
export const deleteRequest = (url) => apiRequest('delete', url)
export const updateRequest = (url, data) => apiRequest('put', url, data)
export const createRequest = (url, data) => apiRequest('post', url, data)

export const calendar = {
  getAll: (page, limit) => getRequest(`/holidays?page=${page}&limit=${limit}`),
  // Upload Excel FormData
  uploadFile: (file, mode = 'append') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mode', mode);

    return axiosInstance.post('/holidays/import', formData);
  },
  createData: (data) => createRequest(`/holidays`, data),
  updateById: (id, data) => updateRequest(`/holidays/${id}`, data),
  deleteById: (id) => deleteRequest(`/holidays/${id}`)
};