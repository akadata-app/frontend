<template>
  <div
    class="resource-card"
    @click="handleCardClick"
  >
    <div class="resource-image-wrapper">
      <img :src="imageSrc" :alt="resource.title" class="resource-img" />
      
      <!-- Botones de acción (solo para administradores) -->
      <div v-if="isAdmin" class="resource-actions" @click.stop>
        <button 
          @click="handleEdit" 
          class="action-btn edit-btn" 
          title="Editar recurso"
        >
          ✏️
        </button>
        <button 
          @click="handleDelete" 
          class="action-btn delete-btn" 
          title="Eliminar recurso"
        >
          🗑️
        </button>
      </div>
    </div>

    <div class="resource-content">
      <h3 class="resource-title">{{ resource.title }}</h3>

      <p class="resource-formats" v-if="resource.formatNames?.length">
        <span class="format-tag" v-for="(format, index) in resource.formatNames" :key="index">
          {{ format }}
        </span>
      </p>

      <p class="resource-description" v-if="resource.description">
        {{ resource.description }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  resource: {
    type: Object,
    required: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['edit', 'delete'])

const imageSrc = computed(() =>
  props.resource.image?.startsWith('data:image')
    ? props.resource.image
    : `data:image/png;base64,${props.resource.image}`
)

const handleCardClick = (event) => {
  // Solo abrir el enlace si no se hizo click en los botones de acción
  if (!event.target.closest('.resource-actions')) {
    openInNewTab(event)
  }
}

const openInNewTab = (event) => {
  // Prevenir la propagación del evento si se hace click en elementos interactivos
  if (event) {
    event.stopPropagation()
  }
  
  if (props.resource.link) {
    window.open(props.resource.link, '_blank', 'noopener,noreferrer')
  } else {
    console.warn('El recurso no tiene un enlace configurado')
  }
}

const handleEdit = (event) => {
  event.stopPropagation()
  emit('edit', props.resource)
}

const handleDelete = (event) => {
  event.stopPropagation()
  emit('delete', props.resource)
}
</script>

<style scoped>
.resource-card {
  display: flex;
  flex-direction: column;
  cursor: pointer;
  background: #ffffff;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  font-family: 'Roboto', sans-serif;
  transition: border-color 0.2s ease;
}

.resource-card:hover {
  border-color: #56005b;
}

.resource-image-wrapper {
  width: 100%;
  height: 180px;
  overflow: hidden;
  background: #f3f4f6;
  position: relative;
}

.resource-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.resource-content {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.resource-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  color: #56005b;
  line-height: 1.4;
}

.resource-formats {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0;
}

.format-tag {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background: #f3f4f6;
  color: #56005b;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.resource-description {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.resource-actions {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  display: flex;
  gap: 0.5rem;
  z-index: 10;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  transition: all 0.2s ease;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.action-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.edit-btn:hover {
  background: #eff6ff;
}

.delete-btn:hover {
  background: #fef2f2;
}

/* Responsive */
@media (max-width: 768px) {
  .resource-card {
    max-width: 100%;
  }
  
  .resource-image-wrapper {
    height: 160px;
  }
}
</style>
