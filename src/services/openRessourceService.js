// Importar axios después de que authService.js haya configurado los interceptores
// Esto asegura que el token JWT se agregue automáticamente a todas las peticiones
import axios from 'axios';

const API_ROOT = (import.meta?.env?.VITE_API_URL || '').replace(/\/+$/, '');
const API_URL = API_ROOT ? `${API_ROOT}/api` : '/api';
const BASE_URL = `${API_URL}/open-ressources`;

export default {
  // GET /api/open-ressources
  getAll() {
    return axios.get(BASE_URL);
  },

  // GET /api/open-ressources/{id}
  getById(id) {
    return axios.get(`${BASE_URL}/${id}`);
  },

  // POST /api/open-ressources
  create(dto) {
    return axios.post(BASE_URL, dto, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  },

  // PUT /api/open-ressources/{id}
  update(id, dto) {
    return axios.put(`${BASE_URL}/${id}`, dto, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  },

  // DELETE /api/open-ressources/{id}
  delete(id) {
    return axios.delete(`${BASE_URL}/${id}`);
  }
};
