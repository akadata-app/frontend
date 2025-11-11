<template>
  <div class="resource-page">
    <div class="page-header">
      <h1 class="page-title">Recursos abiertos</h1>
      <p class="page-subtitle">Explora documentos, videos y herramientas para la alfabetización digital institucional</p>
    </div>

    <!-- Barra de filtro y búsqueda -->
    <div class="filter-bar">
      <div class="search-wrapper">
        <input
          id="search"
          type="text"
          v-model="search"
          placeholder="Buscar recursos..."
          class="search-input"
        />
      </div>

      <div class="filter-wrapper">
        <select id="filter-select" v-model="filter" class="filter-select">
          <option v-for="option in formatOptions" :key="option" :value="option">
            {{ option }}
          </option>
        </select>
      </div>
    </div>

    <div v-if="resources.length === 0" class="loading-state">
      <p>Cargando recursos...</p>
    </div>
    
    <div v-else-if="filteredResources.length === 0" class="empty-state">
      <p class="empty-text">No se encontraron recursos con los filtros seleccionados</p>
    </div>
    
    <div v-else class="resource-grid">
      <ResourceCard
        v-for="(resource, index) in filteredResources"
        :key="index"
        :resource="resource"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import ResourceCard from '../components/ResourceCard.vue'
import OpenRessourceService from '@/services/openRessourceService'
import formatService from '@/services/formatService'

const filter = ref('Todos')
const search = ref('')
const resources = ref([])
const formats = ref([])

const formatOptions = computed(() => {
  return ['Todos', ...formats.value.map(f => f.name)]
})

const fetchData = async () => {
  try {
    const resResources = await OpenRessourceService.getAll()
    resources.value = resResources.data
  } catch (error) {
    console.error('Error al cargar recursos:', error)
  }
  try {
    const resFormats = await formatService.getAll()
    formats.value = resFormats.data
  } catch (error) {
    console.error('Error al cargar formatos:', error)
  }
}

onMounted(fetchData)

const filteredResources = computed(() => {
  return resources.value.filter((resource) => {
    if (!resource || !resource.title) return false

    const matchFormat =
      filter.value === 'Todos' ||
      (resource.formatNames || []).includes(filter.value)

    const matchSearch = resource.title
      .toLowerCase()
      .includes(search.value.toLowerCase())

    return matchFormat && matchSearch
  })
})
</script>

<style scoped>
.resource-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background: #ffffff;
  min-height: calc(100vh - 200px);
  font-family: 'Roboto', sans-serif;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 600;
  color: #56005b;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  font-size: 0.95rem;
  color: #6b7280;
  max-width: 600px;
  margin: 0 auto;
}

.filter-bar {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.search-wrapper {
  flex: 1;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  background-color: #ffffff;
  color: #1f2937;
  font-family: 'Roboto', sans-serif;
}

.search-input:focus {
  outline: none;
  border-color: #56005b;
}

.search-input::placeholder {
  color: #9ca3af;
}

.filter-wrapper {
  min-width: 180px;
}

.filter-select {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  background-color: #ffffff;
  color: #1f2937;
  font-family: 'Roboto', sans-serif;
  cursor: pointer;
}

.filter-select:focus {
  outline: none;
  border-color: #56005b;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 3rem 2rem;
  color: #6b7280;
}

.empty-text {
  font-size: 1rem;
}

.resource-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

/* Responsive */
@media (max-width: 768px) {
  .resource-page {
    padding: 1.5rem 1rem;
  }
  
  .page-title {
    font-size: 1.75rem;
  }
  
  .filter-bar {
    flex-direction: column;
  }
  
  .resource-grid {
    grid-template-columns: 1fr;
  }
}
</style>
