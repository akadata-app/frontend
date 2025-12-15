<template>
  <div class="page-container">
    <div class="card-container">
      <div class="page-header">
        <div class="header-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        </div>
        <h1 class="title">Barreras y Oportunidades</h1>
        <p class="subtitle">Selecciona un formulario para comenzar tu evaluacion</p>
      </div>

      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Cargando formularios...</p>
      </div>
      
      <div v-if="error" class="error-state">
        <div class="error-icon-wrapper">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <p>{{ error }}</p>
      </div>

      <div v-if="!loading && !error && forms.length === 0" class="empty-state">
        <div class="empty-icon-wrapper">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"></path>
            <rect x="9" y="3" width="6" height="4" rx="1"></rect>
          </svg>
        </div>
        <p>No hay formularios disponibles en este momento</p>
      </div>

      <div v-if="!loading && !error && forms.length > 0" class="forms-list">
        <div
          v-for="form in forms"
          :key="form.id"
          class="form-item"
          @click="goToForm(form.id)"
        >
          <div class="form-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
          </div>
          <div class="form-content">
            <h2>{{ form.nombre || form.title || 'Sin titulo' }}</h2>
            <p class="description">
              {{ form.description || 'Formulario de barreras y oportunidades para evaluacion' }}
            </p>
          </div>
          <div class="form-arrow">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Api from '@/services/BarriersOpportunitiesService';

const router = useRouter();
const forms = ref([]);
const loading = ref(true);
const error = ref(null);

async function fetchForms() {
  loading.value = true;
  error.value = null;
  try {
    const response = await Api.getFormsList();
    console.log('Respuesta completa:', response);
    
    // Manejar diferentes formatos de respuesta
    if (Array.isArray(response.data)) {
      forms.value = response.data.map(f => ({
        id: f.id,
        nombre: f.title || f.name || 'Sin título',
        description: f.description || ''
      }));
    } else if (response.data?.content && Array.isArray(response.data.content)) {
      forms.value = response.data.content.map(f => ({
        id: f.id,
        nombre: f.title || f.name || 'Sin título',
        description: f.description || ''
      }));
    } else {
      forms.value = [];
    }
    
    console.log('Formularios cargados:', forms.value);
  } catch (err) {
    console.error('Error al cargar formularios:', err);
    const errorMessage = err.response?.data?.message || err.message || "No se pudo cargar los formularios.";
    error.value = errorMessage;
    
    // Si es un error 401 o 403, podría ser un problema de autenticación
    if (err.response?.status === 401 || err.response?.status === 403) {
      error.value = "No tienes permisos para acceder a los formularios. Por favor, inicia sesión.";
    }
  } finally {
    loading.value = false;
  }
}

function goToForm(id) {
  router.push(`/barreras-oportunidades/forms/${id}`);
}

onMounted(() => {
  fetchForms();
});
</script>

<style scoped>
.page-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: calc(100vh - 200px);
  background: #ffffff;
  padding: 2rem;
  font-family: 'Roboto', sans-serif;
}

.card-container {
  background: #ffffff;
  padding: 2.5rem;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  max-width: 900px;
  width: 100%;
}

.page-header {
  text-align: center;
  margin-bottom: 2.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #e5e7eb;
}

.title {
  color: #56005b;
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #6b7280;
  font-size: 1rem;
  margin: 0;
}

.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  text-align: center;
  gap: 1rem;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e5e7eb;
  border-top-color: #56005b;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-state p {
  color: #6b7280;
  font-size: 1rem;
}

.error-state {
  color: #dc2626;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  padding: 1.5rem;
}

.error-icon {
  font-size: 2rem;
}

.error-state p {
  margin: 0;
  font-weight: 500;
}

.empty-state {
  color: #6b7280;
}

.empty-icon {
  font-size: 3rem;
}

.empty-state p {
  font-size: 1.1rem;
  margin: 0;
}

.forms-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-item {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  background: #ffffff;
  border-radius: 6px;
  padding: 1.5rem;
  cursor: pointer;
  transition: border-color 0.2s ease;
  border: 1px solid #e5e7eb;
}

.form-item:hover {
  border-color: #56005b;
}

.form-icon {
  font-size: 2rem;
  flex-shrink: 0;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border-radius: 6px;
}

.form-content {
  flex: 1;
}

.form-item h2 {
  font-size: 1.3rem;
  color: #56005b;
  margin: 0 0 0.5rem 0;
  font-weight: 600;
}

.description {
  font-size: 0.95rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.6;
}

.form-arrow {
  font-size: 1.25rem;
  color: #56005b;
  flex-shrink: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .page-container {
    padding: 1rem;
  }
  
  .card-container {
    padding: 2rem 1.5rem;
  }
  
  .title {
    font-size: 1.8rem;
  }
  
  .form-item {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .form-arrow {
    display: none;
  }
}
</style>

