import {getRequest, updateRequest, createRequest, deleteRequest} from "./apiService";

export const authAPI = {
  login: (data) => createRequest("/auth/login", data),
  getUserById: (id) => getRequest(`/auth/user/${id}`),
  uploadUserProfile: (id) => updateRequest(`/auth/user/${id}`),
}

export const vehicles = {
  getAll: () => getRequest("/vehicles/getChartMasukKeluar"),
  getByArah: () => getRequest("/vehicles/getMasukKeluarByArah"),
  getByJam: () => getRequest("/vehicles/getRataPerJam"),
  getByMinute: () => getRequest("/vehicles/getRataPer15Menit"),
  getByTipe: () => getRequest("/vehicles/getGroupTipeKendaraan"),
}