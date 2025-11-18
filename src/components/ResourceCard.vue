<template>
  <div
    class="resource-card"
    @click="handleCardClick"
  >
    <div class="resource-image-wrapper">
      <img :src="imageSrc" :alt="resource.title" class="resource-img" />
      
      <!-- Botones de acción (solo para administradores y recursos no destacados) -->
      <div v-if="isAdmin && !resource.isFeatured" class="resource-actions" @click.stop>
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
      
      <div v-if="hasValidLink" class="resource-link-hint">
        <span class="link-icon">🔗</span>
        <span class="link-text">Haz clic para abrir el recurso</span>
      </div>
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

const imageSrc = computed(() => {
  if (!props.resource.image) {
    // Imagen placeholder atractiva para recursos sin imagen (especialmente videos)
    // SVG con fondo degradado y icono de play
    const svg = `
      <svg width="320" height="180" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#56005b;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#7a007f;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="320" height="180" fill="url(#grad)"/>
        <circle cx="160" cy="90" r="35" fill="rgba(255,255,255,0.9)"/>
        <path d="M150 75 L150 105 L175 90 Z" fill="#56005b"/>
      </svg>
    `.trim().replace(/\s+/g, ' ')
    return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)))
  }
  return props.resource.image?.startsWith('data:image')
    ? props.resource.image
    : `data:image/png;base64,${props.resource.image}`
})

const hasValidLink = computed(() => {
  const link = props.resource.link
  return link && link.trim() && link !== 'null' && link !== 'undefined'
})

const handleCardClick = (event) => {
  // No hacer nada si el click fue en los botones de acción o en sus contenedores
  if (event.target.closest('.resource-actions') || 
      event.target.closest('.action-btn')) {
    return
  }
  
  // Abrir el enlace en una nueva pestaña si existe
  const link = props.resource.link
  if (link && link.trim() && link !== 'null' && link !== 'undefined') {
    // Asegurar que el enlace tenga protocolo
    let url = link.trim()
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url
    }
    window.open(url, '_blank', 'noopener,noreferrer')
  }
  // Si no hay enlace, simplemente no hacer nada (no mostrar error)
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
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.resource-card:hover {
  border-color: #56005b;
  box-shadow: 0 4px 12px rgba(86, 0, 91, 0.15);
  transform: translateY(-2px);
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

.resource-link-hint {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  padding-top: 0.75rem;
  border-top: 1px dashed #e5e7eb;
  font-size: 0.75rem;
  color: #56005b;
  font-weight: 500;
}

.link-icon {
  font-size: 0.875rem;
}

.link-text {
  opacity: 0.8;
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
