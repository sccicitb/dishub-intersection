import axiosInstance from "./apiClient";

// generic func to fetch data
export const apiRequest = async (method, url, data = null) => {
  try{
    const config = {method, url}
    if(data) config.data = data
    const response = await axiosInstance(config)
    return response
  }
  catch(error){
    console.error("Failed to fetch data:", error);
    throw error
  }
}

export const getRequest = (url) => apiRequest('get', url) 

export const deleteRequest = (url) => apiRequest('delete', url)

export const updateRequest = (url, data) => apiRequest('put', url, data) 

export const createRequest = (url, data) => apiRequest('post', url, data)
