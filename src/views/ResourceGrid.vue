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

      <!-- Botón para agregar recurso (solo administradores) -->
      <button v-if="isAdmin" @click="showAddModal = true" class="add-resource-btn">
        <span class="btn-icon">➕</span>
        Agregar recurso
      </button>
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
        :key="resource.id || index"
        :resource="resource"
        :is-admin="isAdmin"
        @edit="handleEditResource"
        @delete="handleDeleteResource"
      />
    </div>

    <!-- Modal para editar recurso -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="closeEditModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Editar recurso</h2>
          <button @click="closeEditModal" class="close-btn">×</button>
        </div>

        <form @submit.prevent="handleSubmit" class="modal-form">
          <div v-if="successMsg" class="success-message">
            <span class="success-icon">✓</span>
            {{ successMsg }}
          </div>
          
          <div v-if="errorMsg" class="error-message">
            <span class="error-icon">⚠</span>
            {{ errorMsg }}
          </div>

          <div class="form-group">
            <label>Título <span class="required">*</span></label>
            <input 
              v-model="newResource.title" 
              type="text" 
              class="form-input" 
              required 
              placeholder="Título del recurso"
            />
          </div>

          <div class="form-group">
            <label>Descripción</label>
            <textarea 
              v-model="newResource.description" 
              class="form-input form-textarea" 
              rows="3"
              placeholder="Descripción del recurso"
            ></textarea>
          </div>

          <div class="form-group">
            <label>Enlace <span class="required">*</span></label>
            <input 
              v-model="newResource.link" 
              type="url" 
              class="form-input" 
              required 
              placeholder="https://..."
            />
          </div>

          <div class="form-group">
            <label>Formatos <span class="hint">(Opcional)</span></label>
            <div class="format-checkboxes">
              <label 
                v-for="format in formats" 
                :key="format.id || format.name" 
                class="checkbox-label"
              >
                <input 
                  type="checkbox" 
                  :value="format.id ? Number(format.id) : null" 
                  :checked="isFormatSelected(format.id)"
                  class="checkbox-input"
                  :disabled="!format.id || isNaN(Number(format.id)) || Number(format.id) <= 0"
                  @change="handleFormatChange($event)"
                  :data-format-id="format.id"
                />
                <span>{{ format.name }}</span>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label>Imagen (opcional)</label>
            <div v-if="editingResource && editingResource.image" class="current-image-preview">
              <p class="file-hint" style="color: #059669; margin-bottom: 0.5rem;">
                ✓ Imagen actual:
              </p>
              <img 
                :src="editingResource.image?.startsWith('data:image') ? editingResource.image : `data:image/png;base64,${editingResource.image}`" 
                alt="Imagen actual" 
                class="preview-image"
              />
              <p class="file-hint" style="margin-top: 0.5rem;">
                Selecciona una nueva imagen para reemplazar la actual
              </p>
            </div>
            <input 
              type="file" 
              accept="image/*" 
              @change="handleImageChange" 
              class="form-input form-file"
            />
            <div v-if="newResource.imagePreview" class="new-image-preview">
              <p class="file-hint" style="color: #059669; margin-bottom: 0.5rem;">
                ✓ Nueva imagen seleccionada:
              </p>
              <img :src="newResource.imagePreview" alt="Nueva imagen" class="preview-image" />
            </div>
            <p v-if="!editingResource && !newResource.imagePreview" class="file-hint">
              Selecciona una imagen para el recurso
            </p>
          </div>

          <div class="modal-actions">
            <button type="button" @click="closeEditModal" class="btn-cancel">
              Cancelar
            </button>
            <button type="submit" class="btn-submit" :disabled="loading">
              {{ loading ? 'Guardando...' : 'Guardar cambios' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal de confirmación para eliminar -->
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="closeDeleteModal">
      <div class="modal-content modal-delete">
        <div class="modal-header">
          <h2>Eliminar recurso</h2>
          <button @click="closeDeleteModal" class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <p>¿Estás seguro de que deseas eliminar el recurso <strong>"{{ deletingResource?.title }}"</strong>?</p>
          <p class="warning-text">Esta acción no se puede deshacer.</p>
        </div>
        <div class="modal-actions">
          <button type="button" @click="closeDeleteModal" class="btn-cancel">
            Cancelar
          </button>
          <button type="button" @click="confirmDelete" class="btn-delete" :disabled="loading">
            {{ loading ? 'Eliminando...' : 'Eliminar' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal para agregar recurso -->
    <div v-if="showAddModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Agregar nuevo recurso</h2>
          <button @click="closeModal" class="close-btn">×</button>
        </div>

        <form @submit.prevent="handleSubmit" class="modal-form">
          <div v-if="successMsg" class="success-message">
            <span class="success-icon">✓</span>
            {{ successMsg }}
          </div>
          
          <div v-if="errorMsg" class="error-message">
            <span class="error-icon">⚠</span>
            {{ errorMsg }}
          </div>

          <div class="form-group">
            <label>Título <span class="required">*</span></label>
            <input 
              v-model="newResource.title" 
              type="text" 
              class="form-input" 
              required 
              placeholder="Título del recurso"
            />
          </div>

          <div class="form-group">
            <label>Descripción</label>
            <textarea 
              v-model="newResource.description" 
              class="form-input form-textarea" 
              rows="3"
              placeholder="Descripción del recurso"
            ></textarea>
          </div>

          <div class="form-group">
            <label>Enlace <span class="required">*</span></label>
            <input 
              v-model="newResource.link" 
              type="url" 
              class="form-input" 
              required 
              placeholder="https://..."
            />
          </div>

          <div class="form-group">
            <label>Formatos <span class="hint">(Opcional)</span></label>
            <div class="format-checkboxes">
              <label 
                v-for="format in formats" 
                :key="format.id || format.name" 
                class="checkbox-label"
              >
                <input 
                  type="checkbox" 
                  :value="format.id ? Number(format.id) : null" 
                  :checked="isFormatSelected(format.id)"
                  class="checkbox-input"
                  :disabled="!format.id || isNaN(Number(format.id)) || Number(format.id) <= 0"
                  @change="handleFormatChange($event)"
                  :data-format-id="format.id"
                />
                <span>{{ format.name }}</span>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label>Imagen (opcional)</label>
            <input 
              type="file" 
              accept="image/*" 
              @change="handleImageChange" 
              class="form-input form-file"
            />
            <div v-if="newResource.imagePreview" class="new-image-preview">
              <p class="file-hint" style="color: #059669; margin-bottom: 0.5rem;">
                ✓ Imagen seleccionada:
              </p>
              <img :src="newResource.imagePreview" alt="Nueva imagen" class="preview-image" />
            </div>
            <p v-if="!newResource.imagePreview" class="file-hint">
              Selecciona una imagen para el recurso
            </p>
          </div>

          <div class="modal-actions">
            <button type="button" @click="closeModal" class="btn-cancel">
              Cancelar
            </button>
            <button type="submit" class="btn-submit" :disabled="loading">
              {{ loading ? 'Guardando...' : 'Agregar recurso' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import ResourceCard from '../components/ResourceCard.vue'
import OpenRessourceService from '@/services/openRessourceService'
import formatService from '@/services/formatService'
import { getUserRole } from '@/services/authService'

const filter = ref('Todos')
const search = ref('')
const resources = ref([])
const formats = ref([])
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const isAdmin = computed(() => getUserRole() === 'ADMIN' || getUserRole() === 'ADMINISTRATOR')

const newResource = ref({
  title: '',
  description: '',
  link: '',
  formatIds: [],
  image: null,
  imagePreview: null
})

const editingResource = ref(null)
const deletingResource = ref(null)
const successMsg = ref('')
const errorMsg = ref('')
const loading = ref(false)

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
    console.log('Respuesta completa de formatos:', resFormats)
    console.log('Datos de formatos:', resFormats.data)
    
    // Cargar todos los formatos directamente sin filtrar
    formats.value = resFormats.data || []
    console.log('Formatos cargados:', formats.value)
    console.log('Total de formatos:', formats.value.length)
    
    // Log detallado de cada formato
    formats.value.forEach((format, index) => {
      console.log(`Formato ${index + 1}:`, {
        id: format.id,
        name: format.name,
        idType: typeof format.id,
        idNumber: format.id ? Number(format.id) : null
      })
    })
  } catch (error) {
    console.error('Error al cargar formatos:', error)
    formats.value = []
  }
}

onMounted(fetchData)

const filteredResources = computed(() => {
  // IDs específicos que queremos mostrar
  const allowedIds = [7, 8, 9]
  
  return resources.value.filter((resource) => {
    // Solo mostrar recursos con IDs permitidos
    if (!resource || !resource.id || !allowedIds.includes(resource.id)) {
      return false
    }
    
    if (!resource.title) return false

    const matchFormat =
      filter.value === 'Todos' ||
      (resource.formatNames || []).includes(filter.value)

    const matchSearch = resource.title
      .toLowerCase()
      .includes(search.value.toLowerCase())

    return matchFormat && matchSearch
  })
})

const handleImageChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      // Guardar preview para mostrar
      newResource.value.imagePreview = e.target.result
      
      // Convertir la imagen a base64 y luego a bytes
      const base64 = e.target.result.split(',')[1]
      // Convertir base64 a byte array
      const binaryString = atob(base64)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }
      newResource.value.image = Array.from(bytes)
    }
    reader.readAsDataURL(file)
  } else {
    newResource.value.imagePreview = null
    newResource.value.image = null
  }
}

const closeModal = () => {
  showAddModal.value = false
  newResource.value = {
    title: '',
    description: '',
    link: '',
    formatIds: [],
    image: null,
    imagePreview: null
  }
  successMsg.value = ''
  errorMsg.value = ''
}

const handleEditResource = (resource) => {
  editingResource.value = resource
  
  // Obtener los IDs de los formatos del recurso (solo números válidos)
  const resourceFormatIds = []
  if (resource.formatNames && formats.value.length > 0) {
    resource.formatNames.forEach(formatName => {
      const format = formats.value.find(f => f.name === formatName)
      if (format && format.id) {
        const numId = Number(format.id)
        if (!isNaN(numId) && numId > 0) {
          resourceFormatIds.push(numId)
        }
      }
    })
  }
  
  newResource.value = {
    title: resource.title || '',
    description: resource.description || '',
    link: (resource.link && resource.link !== 'null' && resource.link !== 'undefined') ? resource.link : '',
    formatIds: resourceFormatIds,
    image: null // No precargamos la imagen, solo permitimos reemplazarla
  }
  
  showEditModal.value = true
  successMsg.value = ''
  errorMsg.value = ''
}

const closeEditModal = () => {
  showEditModal.value = false
  editingResource.value = null
  newResource.value = {
    title: '',
    description: '',
    link: '',
    formatIds: [],
    image: null,
    imagePreview: null
  }
  successMsg.value = ''
  errorMsg.value = ''
}

const handleDeleteResource = (resource) => {
  deletingResource.value = resource
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  deletingResource.value = null
}

const confirmDelete = async () => {
  if (!deletingResource.value) return
  
  loading.value = true
  errorMsg.value = ''
  
  try {
    await OpenRessourceService.delete(deletingResource.value.id)
    successMsg.value = 'Recurso eliminado correctamente.'
    
    // Recargar la lista de recursos
    await fetchData()
    
    // Cerrar el modal después de 1 segundo
    setTimeout(() => {
      closeDeleteModal()
      successMsg.value = ''
    }, 1000)
  } catch (error) {
    console.error('Error al eliminar recurso:', error)
    errorMsg.value = error.response?.data?.message || error.response?.data || error.message || 'Error al eliminar el recurso.'
  } finally {
    loading.value = false
  }
}

const isFormatSelected = (formatId) => {
  if (!formatId || formatId === null || formatId === undefined) {
    return false
  }
  
  if (!Array.isArray(newResource.value.formatIds)) {
    return false
  }
  
  const numId = Number(formatId)
  if (isNaN(numId) || numId <= 0) {
    return false
  }
  
  const isSelected = newResource.value.formatIds.some(id => Number(id) === numId)
  return isSelected
}

const handleFormatChange = (event) => {
  // Prevenir propagación del evento para evitar que se active múltiples veces
  event.stopPropagation()
  
  // Obtener el ID del formato desde el atributo data-format-id o del value del checkbox
  let formatId = event.target.getAttribute('data-format-id') || event.target.value
  
  console.log('handleFormatChange llamado:', { 
    formatId, 
    value: event.target.value,
    dataFormatId: event.target.getAttribute('data-format-id'),
    checked: event.target.checked 
  })
  
  // Si aún no hay formatId, intentar obtenerlo del formato correspondiente
  if (!formatId || formatId === 'null' || formatId === 'undefined') {
    // Buscar el formato por el valor del checkbox
    const checkboxValue = event.target.value
    const format = formats.value.find(f => f.id && Number(f.id) === Number(checkboxValue))
    if (format && format.id) {
      formatId = format.id
    } else {
      console.error('No se pudo encontrar el ID del formato:', {
        checkboxValue,
        formats: formats.value,
        target: event.target
      })
      return
    }
  }
  
  // Validar que formatId exista y sea válido antes de procesarlo
  if (formatId == null || formatId === undefined || formatId === 'null' || formatId === 'undefined') {
    console.error('ID de formato es undefined o null:', formatId)
    return
  }
  
  const formatIdNum = Number(formatId)
  
  // Validar que el ID sea un número válido
  if (isNaN(formatIdNum) || formatIdNum <= 0) {
    console.error('ID de formato inválido:', formatId, 'convertido a:', formatIdNum)
    return
  }
  
  const checked = event.target.checked
  
  // Asegurar que formatIds sea un array y crear una copia para reactividad
  if (!Array.isArray(newResource.value.formatIds)) {
    newResource.value.formatIds = []
  }
  
  // Filtrar valores inválidos y crear una nueva copia del array
  const currentIds = [...newResource.value.formatIds]
    .map(id => Number(id))
    .filter(id => !isNaN(id) && id > 0)
  
  if (checked) {
    // Agregar el formato solo si no está ya en la lista
    if (!currentIds.includes(formatIdNum)) {
      currentIds.push(formatIdNum)
      console.log('Formato agregado:', formatIdNum, 'Lista actual:', currentIds)
    }
  } else {
    // Remover el formato de la lista
    const index = currentIds.indexOf(formatIdNum)
    if (index > -1) {
      currentIds.splice(index, 1)
      console.log('Formato removido:', formatIdNum, 'Lista actual:', currentIds)
    }
  }
  
  // Actualizar el array con la nueva copia (solo números válidos)
  newResource.value.formatIds = currentIds
  
  console.log('formatIds actualizado:', newResource.value.formatIds)
}

const handleSubmit = async () => {
  errorMsg.value = ''
  successMsg.value = ''
  
  // Validar campos requeridos
  if (!newResource.value.title || !newResource.value.title.trim()) {
    errorMsg.value = 'El título es obligatorio.'
    return
  }
  
  // El enlace es opcional, pero si se proporciona debe ser válido
  if (newResource.value.link && newResource.value.link.trim()) {
    const link = newResource.value.link.trim()
    // Validar formato básico de URL
    if (!link.startsWith('http://') && !link.startsWith('https://') && !link.startsWith('www.')) {
      // Si no tiene protocolo, agregarlo automáticamente
      newResource.value.link = 'https://' + link
    }
  }
  
  loading.value = true

  try {
    // Verificar que el usuario tenga el rol de administrador
    const userRole = getUserRole()
    const token = localStorage.getItem('jwtToken')
    
    console.log('Verificación de permisos:', {
      userRole,
      isAdmin: isAdmin.value,
      hasToken: !!token
    })
    
    if (!isAdmin.value) {
      errorMsg.value = 'Solo los administradores pueden agregar o modificar recursos. Tu rol actual es: ' + (userRole || 'No definido')
      loading.value = false
      return
    }
    
    if (!token) {
      errorMsg.value = 'No hay sesión activa. Por favor, inicia sesión nuevamente.'
      loading.value = false
      return
    }
    
           // Preparar el payload según el DTO del backend
           // Asegurar que formatIds sea un array de números válidos (filtrar NaN y valores inválidos)
           let formatIds = []
           if (Array.isArray(newResource.value.formatIds) && newResource.value.formatIds.length > 0) {
             formatIds = newResource.value.formatIds
               .map(id => {
                 const numId = Number(id)
                 return isNaN(numId) ? null : numId
               })
               .filter(id => id !== null && id > 0) // Filtrar null, NaN y valores <= 0
           }
           
           const payload = {
             title: newResource.value.title.trim(),
             description: newResource.value.description?.trim() || null,
             formatIds: formatIds.length > 0 ? formatIds : []
           }
    
    // Guardar el enlace si existe, de lo contrario enviar null
    if (newResource.value.link && newResource.value.link.trim()) {
      let linkValue = newResource.value.link.trim()
      // Asegurar que tenga protocolo si no lo tiene
      if (!linkValue.startsWith('http://') && !linkValue.startsWith('https://')) {
        linkValue = 'https://' + linkValue
      }
      payload.link = linkValue
    } else {
      // Si no hay enlace, enviar null (el enlace es opcional)
      payload.link = null
    }
    
    // Solo incluir imagen si se seleccionó una nueva
    // Si estamos editando y no hay nueva imagen, no incluimos el campo para mantener la existente
    if (newResource.value.image) {
      payload.image = newResource.value.image
    } else if (!editingResource.value) {
      // Si es creación y no hay imagen, enviar null
      payload.image = null
    }
    // Si es edición y no hay nueva imagen, no incluimos el campo (el backend mantendrá la existente)

    console.log('Enviando payload:', { ...payload, image: payload.image ? `[${payload.image.length} bytes]` : null })

    if (editingResource.value) {
      // Actualizar recurso existente
      await OpenRessourceService.update(editingResource.value.id, payload)
      successMsg.value = 'Recurso actualizado correctamente.'
      
      // Recargar la lista de recursos
      await fetchData()
      
      // Cerrar el modal después de 1.5 segundos
      setTimeout(() => {
        closeEditModal()
      }, 1500)
    } else {
      // Crear nuevo recurso
      await OpenRessourceService.create(payload)
      successMsg.value = 'Recurso agregado correctamente.'
      
      // Recargar la lista de recursos
      await fetchData()
      
      // Cerrar el modal después de 1.5 segundos
      setTimeout(() => {
        closeModal()
      }, 1500)
    }
  } catch (error) {
    console.error('Error al agregar recurso:', error)
    console.error('Detalles del error:', {
      message: error.message,
      response: error.response,
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers
    })
    
    if (error.response?.status === 403) {
      const errorMessage = error.response?.data || 'No tienes permisos para realizar esta acción.'
      errorMsg.value = `Error 403: ${errorMessage}. Verifica que: 1) Tu rol sea ADMIN, 2) Tu sesión esté activa, 3) Tu token sea válido.`
    } else if (error.response?.status === 401) {
      errorMsg.value = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'
    } else {
      errorMsg.value = error.response?.data?.message || error.response?.data || error.message || 'Error al agregar el recurso.'
    }
  } finally {
    loading.value = false
  }
}
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

.add-resource-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #56005b;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 500;
  font-family: 'Roboto', sans-serif;
  cursor: pointer;
  transition: background-color 0.2s ease;
  white-space: nowrap;
}

.add-resource-btn:hover {
  background: #7a007f;
}

.btn-icon {
  font-size: 1.1rem;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-delete {
  max-width: 500px;
}

.modal-body {
  padding: 1.5rem;
  text-align: center;
}

.modal-body p {
  margin: 0.5rem 0;
  color: #374151;
  font-size: 1rem;
  line-height: 1.6;
}

.modal-body strong {
  color: #56005b;
  font-weight: 600;
}

.warning-text {
  color: #dc2626 !important;
  font-weight: 600;
  margin-top: 1rem !important;
}

.btn-delete {
  background: #dc2626;
  color: white;
}

.btn-delete:hover:not(:disabled) {
  background: #b91c1c;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #56005b;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  color: #6b7280;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.close-btn:hover {
  background: #f3f4f6;
}

.modal-form {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  font-size: 0.9rem;
  color: #374151;
}

.required {
  color: #dc2626;
}

.form-input {
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
  color: #1f2937;
  background: #ffffff;
  transition: border-color 0.2s ease;
  font-family: 'Roboto', sans-serif;
}

.form-input:focus {
  outline: none;
  border-color: #56005b;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.form-file {
  padding: 0.5rem;
  cursor: pointer;
}

.file-hint {
  font-size: 0.85rem;
  color: #6b7280;
  margin: 0.25rem 0 0 0;
}

.current-image-preview,
.new-image-preview {
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.preview-image {
  max-width: 100%;
  max-height: 200px;
  border-radius: 6px;
  object-fit: contain;
  display: block;
  margin: 0 auto;
}

.hint {
  font-size: 0.85rem;
  color: #6b7280;
  font-weight: 400;
  margin-left: 0.5rem;
}

.format-error {
  margin: 0.5rem 0 0 0;
  font-size: 0.85rem;
  color: #dc2626;
  font-weight: 500;
}

.format-checkboxes {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-weight: 400;
}

.checkbox-input {
  cursor: pointer;
}

.success-message,
.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
}

.success-message {
  color: #059669;
  background: #d1fae5;
  border: 1px solid #a7f3d0;
}

.error-message {
  color: #dc2626;
  background: #fef2f2;
  border: 1px solid #fecaca;
}

.success-icon,
.error-icon {
  font-size: 1.2rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
  margin-top: 0.5rem;
}

.btn-cancel,
.btn-submit {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  font-family: 'Roboto', sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel {
  background: #f3f4f6;
  color: #4b5563;
}

.btn-cancel:hover {
  background: #e5e7eb;
}

.btn-submit {
  background: #56005b;
  color: white;
}

.btn-submit:hover:not(:disabled) {
  background: #7a007f;
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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

  .add-resource-btn {
    width: 100%;
    justify-content: center;
  }
  
  .resource-grid {
    grid-template-columns: 1fr;
  }

  .modal-content {
    width: 95%;
    max-height: 95vh;
  }

  .format-checkboxes {
    flex-direction: column;
    gap: 0.75rem;
  }
}
</style>
