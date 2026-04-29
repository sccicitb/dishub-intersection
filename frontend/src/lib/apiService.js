import axiosInstance from "./apiClient";

// generic func to fetch data
export const apiRequest = async (method, url, data = null, requestConfig = {}) => {
  try {
    const config = { method, url, ...requestConfig }
    if (data) config.data = data
    // console.log('API Request Config:', config);
    const response = await axiosInstance(config)
    // console.log('API Response:', response.data);
    return response
  }
  catch (error) {
    if (error?.response?.status !== 401) {
      console.error("Failed to fetch data:", error);
    } throw error
  }
}

export const getRequest = (url, requestConfig = {}) => apiRequest('get', url, null, requestConfig)
export const deleteRequest = (url, requestConfig = {}) => apiRequest('delete', url, null, requestConfig)
export const updateRequest = (url, data, requestConfig = {}) => apiRequest('put', url, data, requestConfig)
export const createRequest = (url, data, requestConfig = {}) => apiRequest('post', url, data, requestConfig)

export const authApi = {
  // (All Role)
  updateProfile: () => updateRequest(`/auth/profile/`),
  login: (data) => {
    // console.log('Login data being sent:', data); // Debug log
    return createRequest(`/auth/login/`, data);
  },
  logout: () => createRequest(`/auth/logout/`),

  // User Management Endpoints (Admin Only)
  getAllUser: () => getRequest(`/users`),
  createNewUser: (data) => createRequest(`/users`, data),
  updateUser: (id, data) => updateRequest(`/users/${id}`, data),
  getByIdUser: () => getRequest(`/users`),
  deleteByIdUser: (id) => deleteRequest(`/users/${id}`),

  // Assign role to user
  addUserRole: (id, data) => createRequest(`/users/${id}/role`, data),
  deleteUserRole: (id, role_id) => deleteRequest(`/users/${id}/role/${role_id}`, { role_id: role_id }),

  // Change password
  changePassword: (id, data) => updateRequest(`/users/${id}/change-password`, data),
}

export const maps = {
  getAll: () => getRequest(`/maps/buildings`),
  getAllFull: () => getRequest(`/maps/buildings-full`),
  getById: (id) => {
    if (id === 'semua') {
      // Return a resolved promise with empty data to avoid 404
      return Promise.resolve({ data: {} });
    }
    return getRequest(`/simpang/${id}`);
  },
  getAllSimpang: () => getRequest(`/simpang`),
  updateById: (id, data) => updateRequest(`/simpang/${id}`, data),
  createData: (data) => createRequest(`/simpang`, data),
  deleteById: (id) => deleteRequest(`/simpang/${id}`)
}

export const cameras = {
  getAll: () => getRequest(`/cameras/`),
  updateById: (id, data) => updateRequest(`/cameras/${id}`, data),
  createData: (data) => createRequest(`/cameras`, data),
  deleteById: (id) => deleteRequest(`/cameras/${id}`),
  getStatusLog: (camera_id, date) => getRequest(`/cameras/status-log-idcamera?camera_id=${camera_id}&date=${date}`),
}

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

export const logCamera = {
  getBySimpang: (simpang_id, date = null) => {
    let url = `/cameras/status-log?simpang_id=${simpang_id}`;
    if (date) {
      url += `&date=${date}`;
    }
    return getRequest(url);
  },
  getByCameraId: (camera_id, date = null) => {
    let url = `/cameras/status-log-idcamera?camera_id=${camera_id}`;
    if (date) {
      url += `&date=${date}`;
    }
    return getRequest(url);
  }
}

export const survey = {
  //daillyRange, dailyMonth, monthly, yearly
  getAll: (camera_id, date, interval, approach, classification, reportType, direction, month, year, startDate, endDate) => {
    // let params = [`camera_id=${camera_id}`, `date=${date}`];
    let params = [`simpang_id=${camera_id}`, `date=${date}`];

    if (interval) params.push(`interval=${interval}`);
    if (approach) params.push(`approach=${approach}`);
    if (direction) params.push(`direction=${direction}`);
    if (classification) params.push(`classification=${classification}`);
    if (reportType) params.push(`reportType=${reportType}`);
    if (reportType === 'dailyRange' && startDate && endDate) {
      params.push(`startDate=${startDate}`);
      params.push(`endDate=${endDate}`);
    }
    if (reportType === 'dailyMonth' && month && year) {
      params.push(`month=${month}`);
      params.push(`year=${year}`);
    }
    if (reportType === 'monthly' && year) {
      params.push(`year=${year}`);
    }
    if (reportType === 'yearly' && startDate) {
      params.push(`startDate=${startDate}`);
    }

    return getRequest(`/surveys/data-summary?${params.join('&')}`);
  },
  getTrafficMatrix: (simpang_id, startDate, endDate, filter = 'customrange') => {
    let params = [`simpang_id=${simpang_id}`, `filter=${filter}`];
    
    // Add date range for customrange filter
    if (filter === 'customrange' && startDate && endDate) {
      params.push(`start-date=${startDate}`, `end-date=${endDate}`);
    }
    
    return getRequest(`/vehicles/traffic-matrix?${params.join('&')}`);
  },
  getAllKM: (simpang_id, date, interval, approach) => {
    // let params = [`simpang_id=${simpang_id}`, `date=${date}`];
    let params = [`simpang_id=${simpang_id}`, `date=${date}`];

    if (interval) params.push(`interval=${interval}`);
    if (approach) params.push(`approach=${approach}`);

    return getRequest(`/surveys/km-tabel?${params.join('&')}`);
  },
  getMatrixWithApproachFilter: (simpang_id, date, approach) => {
    let params = [`simpang_id=${simpang_id}`, `date=${date}`];
    if (approach && approach !== 'semua') {
      params.push(`approach=${approach}`);
    }
    return getRequest(`/surveys/traffic-matrix?${params.join('&')}`);
  },
  getProporsi: (simpang_id, type, date) => getRequest(`/survey-proporsi?ID_Simpang=${simpang_id}${type ? '&type=' + type + '' : ''}&date=${date}`)
}

export const vehicleSummary = {
  getMasukKeluarBySimpang: (simpangId, startDate, endDate) => {
    const params = [
      `simpang_id=${encodeURIComponent(simpangId)}`,
      `start_date=${encodeURIComponent(startDate)}`,
      `end_date=${encodeURIComponent(endDate)}`,
    ];

    return getRequest(`/vehicles/masuk-keluar?${params.join('&')}`, {
      timeout: 300000,
    });
  },
};

export const apiCoreSurvey = {
  getAllSurvey: () => getRequest(`/sa-surveys/header`),
  getByIdSurvey: (id) => getRequest(`/sa-surveys/header/${id}`),
  createSurvey: (data) => createRequest(`/sa-surveys/header`, data),
  updateByIdSurvey: (id, data) => updateRequest(`/sa-surveys/header/${id}`, data),
  deleteByIdSurvey: (id) => deleteRequest(`/sa-surveys/header/${id}`),
}

export const apiSAIForm = {
  getByIdSAI: (id) => getRequest(`/sa-surveys/sa-i/${id}`),
  createSAI: (data) => createRequest(`/sa-surveys/sa-i`, data),
  updateByIdSAI: (id, data) => updateRequest(`/sa-surveys/sa-i/${id}`, data),
}

export const apiSAIIForm = {
  getByIdSAII: (id) => getRequest(`/sa-surveys/sa-ii/${id}`),
  createSAII: (data) => createRequest(`/sa-surveys/sa-ii`, data),
  updateByIdSAII: (id, data) => updateRequest(`/sa-surveys/sa-ii/${id}`, data),
  getAllEMP: () => getRequest(`/sa-surveys/sa-ii/emp-configurations`),
  getByIdArus: (id) => getRequest(`/sa-surveys/sa-ii/${id}/arus-kendaraan`),
  checkDirection: (simpangId) => getRequest(`/sa-surveys/sa-ii/checkDirection/${simpangId}`),
}

export const apiSAIIIForm = {
  getByIdSAIII: (id) => getRequest(`/sa-surveys/sa-iii/${id}`),
  createSAIII: (data) => createRequest(`/sa-surveys/sa-iii`, data),
  updateByIdSAIII: (id, data) => updateRequest(`/sa-surveys/sa-iii/${id}`, data),
}

export const apiSAIVForm = {
  getByIdSAIV: (id) => getRequest(`/sa-surveys/sa-iv/${id}`),
  createSAIV: (data) => createRequest(`/sa-surveys/sa-iv`, data),
  getByIdCalculation: (id, data) => createRequest(`/sa-surveys/sa-iv/config/${id}`, data),
  updateByIdSAIV: (id, data) => updateRequest(`/sa-surveys/sa-iv/${id}`, data),
}

export const apiSAVForm = {
  getByIdSAV: (id) => getRequest(`/sa-surveys/sa-v/${id}`),
  createSAV: (data) => createRequest(`/sa-surveys/sa-v`, data),
  updateByIdSAV: (id, data) => updateRequest(`/sa-surveys/sa-v/${id}`, data),
}
