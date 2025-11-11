<template>
  <div class="page-container">
    <div class="card-container">
      <div class="page-header">
        <h1 class="title">Taxonomías</h1>
        <p class="subtitle">Selecciona un formulario de taxonomía para comenzar</p>
      </div>

      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Cargando formularios...</p>
      </div>
      
      <div v-if="error" class="error-state">
        <span class="error-icon">⚠</span>
        <p>{{ error }}</p>
      </div>

      <div v-if="!loading && !error && forms.length === 0" class="empty-state">
        <span class="empty-icon">📋</span>
        <p>No hay formularios disponibles en este momento</p>
      </div>

      <div v-if="!loading && !error && forms.length > 0" class="forms-list">
        <div
          v-for="form in forms"
          :key="form.id"
          class="form-item"
          @click="goToForm(form.id)"
        >
          <div class="form-icon">📊</div>
          <div class="form-content">
            <h2>{{ form.title }}</h2>
            <p class="description">
              {{ form.description || 'Formulario de taxonomía para evaluación de gobernanza de datos' }}
            </p>
          </div>
          <div class="form-arrow">→</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import taxonomyFormService from '@/services/TaxonomyFormService';

export default {
  name: 'FormsList',
  data() {
    return {
      forms: [],
      loading: true,
      error: null
    };
  },
  methods: {
    async fetchForms() {
      try {
        const response = await taxonomyFormService.getFormsList();
        this.forms = response.data;
        console.log('Formularios cargados:', this.forms);
      } catch {
        this.error = "No se pudo cargar los formularios.";
      } finally {
        this.loading = false;
      }
    },
    goToForm(id) {
      this.$router.push(`/herramientas-evaluacion/taxonomy/forms/${id}`);
    }
  },
  mounted() {
    this.fetchForms();
  }
};
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
