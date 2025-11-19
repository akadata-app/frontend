// src/services/organizationService.js
import axios from 'axios'

const API_ROOT = (import.meta?.env?.VITE_API_URL || 'http://localhost:8080').replace(/\/+$/, '')
const BASE_URL = `${API_ROOT}/api/organizations`

export default {
  getAll() {
    return axios.get(BASE_URL)
  },

  getById(id) {
    return axios.get(`${BASE_URL}/${id}`)
  },

  create(organization) {
    return axios.post(BASE_URL, organization)
  },

  update(id, organization) {
    return axios.put(`${BASE_URL}/${id}`, organization)
  },

  delete(id) {
    return axios.delete(`${BASE_URL}/${id}`)
  }
}
