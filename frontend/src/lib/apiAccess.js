import {getRequest, updateRequest, createRequest, deleteRequest} from "./apiService";

export const authAPI = {
  login: (data) => createRequest("/auth/login", data),
  getUserById: (id) => getRequest(`/auth/user/${id}`),
  uploadUserProfile: (id) => updateRequest(`/auth/user/${id}`),
}

export const vehicles = {
  getAll: (filter = 'day', simpang_id = 'semua', startDate = null, endDate = null) => {
    let url = `/vehicles/getChartMasukKeluar?filter=${filter}&simpang=${simpang_id}`;
    if (filter === 'customrange' && startDate && endDate) {
      url += `&start-date=${startDate}&end-date=${endDate}`;
    }
    return getRequest(url);
  },
  getByArah: (filter = 'day', simpang_id = 'semua', startDate = null, endDate = null) => {
    let url = `/vehicles/getMasukKeluarByArah?filter=${filter}&simpang=${simpang_id}`;
    if (filter === 'customrange' && startDate && endDate) {
      url += `&start-date=${startDate}&end-date=${endDate}`;
    }
    return getRequest(url);
  },
  getByJam: (filter = 'day', simpang_id = 'semua', startDate = null, endDate = null) => {
    let url = `/vehicles/getRataPerJam?filter=${filter}&simpang=${simpang_id}`;
    if (filter === 'customrange' && startDate && endDate) {
      url += `&start-date=${startDate}&end-date=${endDate}`;
    }
    return getRequest(url);
  },
  getByMinute: (filter = 'day', simpang_id = 'semua', startDate = null, endDate = null) => {
    let url = `/vehicles/getRataPer15Menit?filter=${filter}&simpang=${simpang_id}`;
    if (filter === 'customrange' && startDate && endDate) {
      url += `&start-date=${startDate}&end-date=${endDate}`;
    }
    return getRequest(url);
  },
  getByTipe: (filter = 'day', simpang_id = 'semua', startDate = null, endDate = null) => {
    let url = `/vehicles/getGroupTipeKendaraan?filter=${filter}&simpang=${simpang_id}`;
    if (filter === 'customrange' && startDate && endDate) {
      url += `&start-date=${startDate}&end-date=${endDate}`;
    }
    return getRequest(url);
  },
}

export const maps = {
  getAll: () => getRequest("/maps/buildings")
}

export const calendar = {
  getAll: (page, limit) => getRequest(`/holidays?page=${page}&limit=${limit}`)
}