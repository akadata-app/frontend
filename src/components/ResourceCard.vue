<template>
  <div
    class="resource-card"
    @click="openInNewTab"
  >
    <div class="resource-image-wrapper">
      <img :src="imageSrc" :alt="resource.title" class="resource-img" />
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
  }
})

const imageSrc = computed(() =>
  props.resource.image?.startsWith('data:image')
    ? props.resource.image
    : `data:image/png;base64,${props.resource.image}`
)

const openInNewTab = () => {
  if (props.resource.link) {
    window.open(props.resource.link, '_blank', 'noopener,noreferrer')
  }
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
