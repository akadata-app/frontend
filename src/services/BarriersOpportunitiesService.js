// src/services/BarriersOpportunitiesService.js
// Importar authService para asegurar que los interceptores de axios estén configurados
import '@/services/authService.js';
import axios from 'axios';

const API_ROOT = (import.meta?.env?.VITE_API_URL || 'http://localhost:8080').replace(/\/+$/, '');
const BASE_URL = `${API_ROOT}/api/barriers-opportunities-forms`;

export default {
  /* ---------------------------------------
   * FORMULARIOS (BarriersOpportunitiesForm)
   * ------------------------------------- */

  // Lista (para menú izquierdo)
  getFormsList() {
    return axios.get(`${BASE_URL}/list-forms`);
  },

  // Detalle de un formulario con sus items
  getFormById(id) {
    return axios.get(`${BASE_URL}/${id}`);
  },

  // Creación de un formulario
  createForm(payload) {
    return axios.post(`${BASE_URL}`, payload);
  },

  // Actualización completa de un formulario
  updateForm(id, payload) {
    return axios.put(`${BASE_URL}/${id}`, payload);
  },

  // Eliminación de un formulario
  deleteForm(id) {
    return axios.delete(`${BASE_URL}/${id}`);
  },

  /* ---------------------------------------
   * ITEMS (BarrierOpportunity)
   * ------------------------------------- */

  // Agregar un item a un formulario
  createItem(formId, payload) {
    return axios.post(`${BASE_URL}/${formId}/items`, payload);
  },

  // Modificar un item
  updateItem(itemId, payload) {
    return axios.put(`${BASE_URL}/items/${itemId}`, payload);
  },

  // Eliminar un item
  deleteItem(itemId) {
    return axios.delete(`${BASE_URL}/items/${itemId}`);
  },

  /* ---------------------------------------
   * CATEGORÍAS (Categories)
   * ------------------------------------- */

  // Agregar una categoría a un formulario
  createCategory(formId, payload) {
    return axios.post(`${BASE_URL}/${formId}/categories`, payload);
  },

  // Modificar una categoría
  updateCategory(categoryId, payload) {
    return axios.put(`${BASE_URL}/categories/${categoryId}`, payload);
  },

  // Eliminar una categoría
  deleteCategory(categoryId) {
    return axios.delete(`${BASE_URL}/categories/${categoryId}`);
  },

  /* ---------------------------------------
   * PREGUNTAS (Questions) - Dentro de categorías
   * ------------------------------------- */

  // Agregar una pregunta a una categoría
  createQuestion(categoryId, payload) {
    return axios.post(`${BASE_URL}/categories/${categoryId}/questions`, payload);
  },

  // Modificar una pregunta
  updateQuestion(questionId, payload) {
    return axios.put(`${BASE_URL}/questions/${questionId}`, payload);
  },

  // Eliminar una pregunta
  deleteQuestion(questionId) {
    return axios.delete(`${BASE_URL}/questions/${questionId}`);
  },

  /* ---------------------------------------
   * OPCIONES (QuestionOptions) - Valores 1-5
   * ------------------------------------- */

  // Modificar una opción (las opciones se crean automáticamente del 1 al 5)
  updateOption(optionId, payload) {
    return axios.put(`${BASE_URL}/options/${optionId}`, payload);
  },

  // Eliminar una opción
  deleteOption(optionId) {
    return axios.delete(`${BASE_URL}/options/${optionId}`);
  },

  /* ---------------------------------------
   * RESPUESTAS (Form Responses)
   * ------------------------------------- */

  // Guardar respuestas del formulario
  saveFormResponse(formId, payload) {
    return axios.post(`${BASE_URL}/${formId}/responses`, payload);
  },

  // Obtener respuesta por ID (para el reporte)
  getResponseById(responseId) {
    return axios.get(`${BASE_URL}/responses/${responseId}`);
  },

  // Obtener mi respuesta más reciente para un formulario
  getMyResponse(formId) {
    return axios.get(`${BASE_URL}/${formId}/my-response`);
  }
};

