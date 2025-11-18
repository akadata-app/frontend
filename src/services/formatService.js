// Importar axios después de que authService.js haya configurado los interceptores
import axios from 'axios';

const API_ROOT = (import.meta?.env?.VITE_API_URL || '').replace(/\/+$/, '');
const API_URL = API_ROOT ? `${API_ROOT}/api` : '/api';
const BASE_URL = `${API_URL}/formats`;

export default {
  // GET /api/formats
  getAll() {
    return axios.get(BASE_URL);
  },

  // GET /api/formats/{id}
  getById(id) {
    return axios.get(`${BASE_URL}/${id}`);
  },

  // POST /api/formats
  create(dto) {
    return axios.post(BASE_URL, dto);
  },

  // PUT /api/formats/{id}
  update(id, dto) {
    return axios.put(`${BASE_URL}/${id}`, dto);
  },

  // DELETE /api/formats/{id}
  delete(id) {
    return axios.delete(`${BASE_URL}/${id}`);
  }
};
