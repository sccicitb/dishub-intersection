import {getRequest, updateRequest, createRequest, deleteRequest} from "./apiService";

export const authAPI = {
  login: (data) => createRequest("/auth/login", data),
  getUserById: (id) => getRequest(`/auth/user/${id}`),
  uploadUserProfile: (id) => updateRequest(`/auth/user/${id}`),
}

export const vehicles = {
  getAll: (filter = 'day', simpang_id = 'semua', startDate = null, endDate = null) => {
    let url = `/vehicles/getChartMasukKeluar?filter=${encodeURIComponent(filter)}&simpang=${encodeURIComponent(simpang_id)}`;
    if (startDate && endDate) {
      url += `&start-date=${encodeURIComponent(startDate)}&end-date=${encodeURIComponent(endDate)}`;
    }
    return getRequest(url);
  },
  getByArah: (filter = 'day', simpang_id = 'semua', startDate = null, endDate = null) => {
    let url = `/vehicles/getMasukKeluarByArah?filter=${encodeURIComponent(filter)}&simpang=${encodeURIComponent(simpang_id)}`;
    if (startDate && endDate) {
      url += `&start-date=${encodeURIComponent(startDate)}&end-date=${encodeURIComponent(endDate)}`;
    }
    return getRequest(url);
  },
  getByJam: (filter = 'day', simpang_id = 'semua', startDate = null, endDate = null) => {
    let url = `/vehicles/getRataPerJam?filter=${filter}&simpang=${simpang_id}`;
    if (startDate && endDate) {
      url += `&start-date=${startDate}&end-date=${endDate}`;
    }
    return getRequest(url);
  },
  getByMinute: (filter = 'day', simpang_id = 'semua', startDate = null, endDate = null) => {
    let url = `/vehicles/getRataPer15Menit?filter=${encodeURIComponent(filter)}&simpang=${encodeURIComponent(simpang_id)}`;
    if (startDate && endDate) {
      url += `&start-date=${encodeURIComponent(startDate)}&end-date=${encodeURIComponent(endDate)}`;
    }
    return getRequest(url);
  },
  getByTipe: (filter = 'day', simpang_id = 'semua', startDate = null, endDate = null) => {
    let url = `/vehicles/getGroupTipeKendaraan?filter=${encodeURIComponent(filter)}&simpang=${encodeURIComponent(simpang_id)}`;
    if (startDate && endDate) {
      url += `&start-date=${encodeURIComponent(startDate)}&end-date=${encodeURIComponent(endDate)}`;
    }
    return getRequest(url);
  },
  getRawData: (filter = 'day', simpang_id = 'semua', startDate = null, endDate = null, page = 1, limit = 100) => {
    let url = `/vehicles/raw-data?filter=${filter}&page=${page}&limit=${limit}`;
    
    // Add simpang parameter (uses 'simpang' for 'semua', 'simpang_id' for specific IDs)
    if (simpang_id === 'semua' || simpang_id === 'all') {
      url += `&simpang=semua`;
    } else {
      url += `&simpang_id=${simpang_id}`;
    }
    
    // Add date range for customrange filter
    if (filter === 'customrange' && startDate && endDate) {
      url += `&start-date=${startDate}&end-date=${endDate}`;
    }
    
    return getRequest(url);
  },
  getTrafficMatrix: (filter = 'day', simpang_id = 'semua', startDate = null, endDate = null) => {
    let url = `/vehicles/traffic-matrix?simpang_id=${simpang_id}&filter=${filter}`;
    
    // Add date range for customrange filter
    if (filter === 'customrange' && startDate && endDate) {
      url += `&start-date=${startDate}&end-date=${endDate}`;
    }
    return getRequest(url);
  },
  getTrafficMatrixByCategory: (filter = 'day', simpang_id = 'semua', startDate = null, endDate = null) => {
    let url = `/vehicles/traffic-matrix-by-category?simpang_id=${simpang_id}&filter=${filter}`;
    if (filter === 'customrange' && startDate && endDate) {
      url += `&start_date=${startDate}&end_date=${endDate}`;
    }
    return getRequest(url);
  },
  getTrafficMatrixByHours: (simpang_id, date_time) => {
    let url = `/vehicles/traffic-matrix-by-hours?simpang_id=${simpang_id}&date=${date_time}`;
    return getRequest(url);
  },
  getTrafficMatrixByFilter: (simpang_id, date_time, interval = '1hour') => {
    let url = `/traffic-matrix/by-filter?simpang_id=${simpang_id}&date=${date_time}&interval=${interval}`;
    return getRequest(url);
  },
  getVehicleDetailByHour: (simpang_id, startDate, endDate) => {
    let url = `/vehicles/detail-summary-by-30min?simpang_id=${simpang_id}&start_date=${startDate}&end_date=${endDate}`;
    return getRequest(url);
  }
}

export const intersection = {
  getFlowByDirection: (simpangId, filter = 'day', startDate = null, endDate = null) => {
    let url = `/intersection/flow?simpang_id=${simpangId}&filter=${filter}`;
    if (filter === 'customrange' && startDate && endDate) {
      url += `&start-date=${startDate}&end-date=${endDate}`;
    }
    return getRequest(url);
  },
  getTotalFlow: (simpangId, startDate = null, endDate = null) => {
    let url = `/intersection/total-flow?simpang_id=${simpangId}`;
    if (startDate && endDate) {
      url += `&start_date=${startDate}&end_date=${endDate}`;
    }
    return getRequest(url);
  },
  getFlowByClassification: (simpangId, startDate = null, endDate = null) => {
    let url = `/intersection/classification?simpang_id=${simpangId}`;
    if (startDate && endDate) {
      url += `&start_date=${startDate}&end_date=${endDate}`;
    }
    return getRequest(url);
  }
}

export const maps = {
  getAll: () => getRequest("/maps/buildings")
}

export const calendar = {
  getAll: (page, limit) => getRequest(`/holidays?page=${page}&limit=${limit}`)
}
