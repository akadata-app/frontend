<template>
  <div class="form-page">
    <!-- Loading -->
    <div v-if="loading" class="state-container">
      <div class="spinner"></div>
      <p>Cargando formulario...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="state-container">
      <div class="state-icon error">!</div>
      <p>{{ error }}</p>
      <button class="btn-outline" @click="goBack">Volver a la lista</button>
    </div>

    <!-- Empty -->
    <div v-else-if="!form || !form.layers || form.layers.length === 0" class="state-container">
      <div class="state-icon">?</div>
      <h2>Formulario vacio</h2>
      <p>Este formulario no tiene capas configuradas.</p>
      <button class="btn-outline" @click="goBack">Volver a la lista</button>
    </div>

    <!-- Form -->
    <template v-else>
      <!-- Header -->
      <header class="form-header">
        <button class="btn-back" @click="goBack">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <div class="header-content">
          <h1>{{ form.title || 'Formulario de Taxonomia' }}</h1>
          <p v-if="form.description">{{ form.description }}</p>
        </div>
      </header>

      <!-- Progress -->
      <div class="progress-section">
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
        </div>
        <span class="progress-text">{{ completedLayers }} de {{ form.layers.length }} capas completadas</span>
      </div>

      <!-- Layers -->
      <main class="layers-container">
        <section
          v-for="(layer, layerIndex) in form.layers"
          :key="layer.id"
          class="layer"
        >
          <!-- Layer Header -->
          <div
            class="layer-header"
            @click="toggleLayer(layer.id)"
          >
            <div class="layer-num">{{ layerIndex + 1 }}</div>
            <div class="layer-info">
              <h2>{{ layer.name }}</h2>
              <p v-if="layer.description">{{ layer.description }}</p>
            </div>
            <div class="layer-status" :class="{ completed: isLayerCompleted(layer.id) }">
              {{ isLayerCompleted(layer.id) ? 'Completado' : 'Pendiente' }}
            </div>
            <button class="toggle-btn">
              <svg :class="{ rotated: openLayers[layer.id] }" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
          </div>

          <!-- Layer Content -->
          <div class="layer-content" v-show="openLayers[layer.id]">
            <!-- Dimensions -->
            <div
              v-for="(dimension, dimIndex) in layer.dimensions"
              :key="dimension.id"
              class="dimension"
              :class="{ active: isDimensionSelected(layer.id, dimension.id) }"
            >
              <div class="dimension-header">
                <button
                  class="dimension-toggle"
                  @click="toggleDimensionSelection(layer.id, dimension.id)"
                >
                  <span class="toggle-track" :class="{ on: isDimensionSelected(layer.id, dimension.id) }">
                    <span class="toggle-thumb"></span>
                  </span>
                </button>
                <div class="dimension-info">
                  <h3>{{ dimension.name }}</h3>
                  <p v-if="dimension.description">{{ dimension.description }}</p>
                </div>
                <span class="dimension-count">
                  {{ getSelectedFeaturesCount(layer.id, dimension.id) }} / {{ dimension.features?.length || 0 }}
                </span>
              </div>

              <!-- Features - se muestra cuando la dimension esta activa -->
              <div class="dimension-content" v-if="isDimensionSelected(layer.id, dimension.id)">
                <div class="features-grid">
                  <button
                    v-for="feature in dimension.features"
                    :key="feature.id"
                    class="feature-btn"
                    :class="{ selected: isFeatureSelected(layer.id, dimension.id, feature.id) }"
                    @click="toggleFeature(layer.id, dimension.id, feature.id)"
                  >
                    <span class="feature-check">
                      <svg v-if="isFeatureSelected(layer.id, dimension.id, feature.id)" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </span>
                    <span class="feature-name">{{ feature.name }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <!-- Actions -->
      <footer class="form-footer">
        <button class="btn-outline" @click="goBack">Volver</button>
        <button class="btn-primary" @click="showConfirmModal = true" :disabled="!isFormComplete">
          Finalizar formulario
        </button>
      </footer>
    </template>

    <!-- Modal -->
    <div v-if="showConfirmModal" class="modal-overlay" @click.self="showConfirmModal = false">
      <div class="modal-card">
        <h2>Confirmar envio</h2>
        <p>Una vez enviado, no podras modificar los datos. Deseas continuar?</p>
        <div class="modal-actions">
          <button class="btn-outline" @click="showConfirmModal = false">Cancelar</button>
          <button class="btn-primary" @click="submitForm">Enviar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import taxonomyFormService from '@/services/TaxonomyFormService';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.vfs;

export default {
  name: 'TaxonomyForm',
  data() {
    return {
      form: { title: "", description: "", layers: [] },
      userChoices: {},
      openLayers: {},
      openDimensions: {},
      showConfirmModal: false,
      loading: true,
      error: null
    };
  },
  computed: {
    completedLayers() {
      if (!this.form?.layers) return 0;
      return this.form.layers.filter(layer => {
        const layerChoices = this.userChoices[layer.id] || {};
        return layer.dimensions?.some(dim => {
          const dimChoice = layerChoices[dim.id];
          return dimChoice?.isSelected === 1;
        });
      }).length;
    },
    progressPercentage() {
      if (!this.form?.layers?.length) return 0;
      return (this.completedLayers / this.form.layers.length) * 100;
    },
    isFormComplete() {
      return this.completedLayers > 0;
    }
  },
  async mounted() {
    this.loading = true;
    try {
      const formId = this.$route.params.id;
      if (!formId) throw new Error('ID no proporcionado');
      const response = await taxonomyFormService.getFormById(formId);
      const formData = response.data || {};
      if (!formData.id) throw new Error('Formulario no encontrado.');
      
      this.form = {
        id: formData.id,
        title: formData.title || 'Formulario sin titulo',
        description: formData.description || '',
        layers: Array.isArray(formData.layers) ? formData.layers : []
      };
      
      this.form.layers.forEach(layer => {
        if (!layer?.id) return;
        this.userChoices[layer.id] = {};
        this.openLayers[layer.id] = true;
        if (!layer.dimensions) layer.dimensions = [];
        layer.dimensions.forEach(dim => {
          if (!dim?.id) return;
          if (!dim.features) dim.features = [];
          this.userChoices[layer.id][dim.id] = {
            dimensionId: dim.id,
            isSelected: 0,
            features: dim.features.map(f => ({ id: f.id, selected: 0 }))
          };
          this.openDimensions[dim.id] = false;
        });
      });
    } catch (err) {
      this.error = err.response?.data?.message || err.message || 'Error al cargar.';
    } finally {
      this.loading = false;
    }
  },
  methods: {
    toggleLayer(layerId) {
      this.openLayers = { ...this.openLayers, [layerId]: !this.openLayers[layerId] };
    },
    toggleDimension(dimId) {
      this.openDimensions = { ...this.openDimensions, [dimId]: !this.openDimensions[dimId] };
    },
    isDimensionSelected(layerId, dimId) {
      return this.userChoices[layerId]?.[dimId]?.isSelected === 1;
    },
    isFeatureSelected(layerId, dimId, featureId) {
      const choice = this.userChoices[layerId]?.[dimId];
      if (!choice || choice.isSelected !== 1) return false;
      return choice.features?.find(f => f.id === featureId)?.selected === 1;
    },
    toggleDimensionSelection(layerId, dimId) {
      const choice = this.userChoices[layerId]?.[dimId];
      if (!choice) return;
      choice.isSelected = choice.isSelected === 1 ? 0 : 1;
      if (choice.isSelected === 0) choice.features.forEach(f => f.selected = 0);
    },
    toggleFeature(layerId, dimId, featureId) {
      const choice = this.userChoices[layerId]?.[dimId];
      if (!choice || choice.isSelected !== 1) return;
      const feature = choice.features.find(f => f.id === featureId);
      if (feature) feature.selected = feature.selected === 1 ? 0 : 1;
    },
    getSelectedFeaturesCount(layerId, dimId) {
      const choice = this.userChoices[layerId]?.[dimId];
      if (!choice || choice.isSelected !== 1) return 0;
      return choice.features.filter(f => f.selected === 1).length;
    },
    isLayerCompleted(layerId) {
      const layerChoices = this.userChoices[layerId] || {};
      const layer = this.form.layers?.find(l => l.id === layerId);
      return layer?.dimensions?.some(dim => layerChoices[dim.id]?.isSelected === 1);
    },
    goBack() {
      this.$router.push({ name: 'FormsList' });
    },
    submitForm() {
      this.showConfirmModal = false;
      const responseObj = {
        formId: this.form.id,
        formName: this.form.title,
        layers: this.form.layers.map(layer => {
          const userChoicesForLayer = this.userChoices[layer.id] || {};
          return {
            layerId: layer.id,
            layerName: layer.name,
            dimensions: layer.dimensions.map(dim => {
              const userDimChoice = userChoicesForLayer[dim.id] || {};
              return {
                dimensionId: dim.id,
                dimensionName: dim.name,
                isSelected: userDimChoice.isSelected || 0,
                features: dim.features.map(feature => {
                  const userFeatureChoice = userDimChoice.features?.find(f => f.id === feature.id);
                  return { id: feature.id, name: feature.name, selected: userFeatureChoice?.selected || 0 };
                })
              };
            })
          };
        })
      };
      taxonomyFormService.addResponseForm(1, this.form.id, responseObj).then(() => {
        localStorage.setItem(`taxonomyReport_${this.form.id}`, JSON.stringify({
          formId: this.form.id,
          formName: this.form.title,
          layers: responseObj.layers
        }));
        generatePDF(responseObj);
        setTimeout(() => {
          this.$router.push({ name: 'TaxonomyDashboard', params: { formId: this.form.id } });
        }, 1000);
      }).catch(err => {
        alert('Error al enviar el formulario.');
      });
    }
  }
};

function generatePDF(jsonData) {
  const content = [];
  content.push({ text: jsonData.formName || 'Reporte de Taxonomia', style: 'title', margin: [0, 0, 0, 20] });
  
  let totalDims = 0, selectedDims = 0, totalFeats = 0, selectedFeats = 0;
  jsonData.layers.forEach(layer => {
    layer.dimensions.forEach(dim => {
      totalDims++;
      if (dim.isSelected === 1) selectedDims++;
      dim.features.forEach(f => {
        totalFeats++;
        if (f.selected === 1) selectedFeats++;
      });
    });
  });
  
  content.push({
    columns: [
      { text: `Capas: ${jsonData.layers.length}`, style: 'stat' },
      { text: `Dimensiones: ${selectedDims}/${totalDims}`, style: 'stat' },
      { text: `Caracteristicas: ${selectedFeats}/${totalFeats}`, style: 'stat' }
    ],
    margin: [0, 0, 0, 30]
  });
  
  jsonData.layers.forEach((layer, i) => {
    content.push({ text: `${i + 1}. ${layer.layerName}`, style: 'layerTitle', margin: [0, 10, 0, 10] });
    layer.dimensions.forEach(dim => {
      if (dim.isSelected === 1) {
        const feats = dim.features.filter(f => f.selected === 1).map(f => f.name).join(', ') || 'Ninguna';
        content.push({ text: `  ${dim.dimensionName}: ${feats}`, style: 'dimText', margin: [10, 5, 0, 5] });
      }
    });
  });
  
  const docDef = {
    content,
    styles: {
      title: { fontSize: 18, bold: true, color: '#56005b' },
      stat: { fontSize: 11, color: '#666' },
      layerTitle: { fontSize: 13, bold: true, color: '#333' },
      dimText: { fontSize: 10, color: '#555' }
    },
    pageMargins: [40, 40, 40, 40]
  };
  
  const fileName = (jsonData.formName || 'reporte').toLowerCase().replace(/\s+/g, '_').replace(/[^\w]/g, '');
  pdfMake.createPdf(docDef).download(`${fileName}_reporte.pdf`);
}
</script>

<style scoped>
.form-page {
  max-width: 960px;
  margin: 0 auto;
  padding: 2rem;
  min-height: 100vh;
  background: #fafafa;
}

/* States */
.state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 4rem 2rem;
  text-align: center;
  background: white;
  border-radius: 12px;
  border: 1px solid #eee;
}
.state-container p { color: #666; margin: 0; }
.state-container h2 { color: #333; margin: 0; font-weight: 500; }
.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #eee;
  border-top-color: #56005b;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.state-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 50%;
  font-size: 1.5rem;
  font-weight: 600;
  color: #999;
}
.state-icon.error { background: #fef2f2; color: #dc2626; }

/* Header */
.form-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  border: 1px solid #eee;
}
.btn-back {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: #f5f5f5;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  color: #666;
  transition: all 0.2s;
  flex-shrink: 0;
}
.btn-back:hover { background: #eee; color: #333; }
.header-content h1 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 0.5rem;
}
.header-content p {
  font-size: 0.9rem;
  color: #666;
  margin: 0;
  line-height: 1.5;
}

/* Progress */
.progress-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem 1.5rem;
  background: white;
  border-radius: 12px;
  border: 1px solid #eee;
}
.progress-track {
  flex: 1;
  height: 4px;
  background: #eee;
  border-radius: 2px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: #56005b;
  transition: width 0.3s ease;
}
.progress-text {
  font-size: 0.8rem;
  color: #666;
  white-space: nowrap;
}

/* Layers */
.layers-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.layer {
  background: white;
  border-radius: 12px;
  border: 1px solid #eee;
  overflow: hidden;
}

.layer-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  cursor: pointer;
  transition: background 0.2s;
}
.layer-header:hover { background: #fafafa; }

.layer-num {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #56005b;
  color: white;
  font-size: 0.9rem;
  font-weight: 600;
  border-radius: 10px;
  flex-shrink: 0;
}

.layer-info {
  flex: 1;
  min-width: 0;
}
.layer-info h2 {
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 0.25rem;
}
.layer-info p {
  font-size: 0.8rem;
  color: #666;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.layer-status {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.375rem 0.75rem;
  background: #f5f5f5;
  color: #999;
  border-radius: 100px;
}
.layer-status.completed {
  background: #f0fdf4;
  color: #16a34a;
}

.toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  color: #999;
  cursor: pointer;
}
.toggle-btn svg { transition: transform 0.2s; }
.toggle-btn svg.rotated { transform: rotate(180deg); }

.layer-content {
  padding: 0 1.5rem 1.5rem;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

/* Dimension */
.dimension {
  border: 1px solid #eee;
  border-radius: 10px;
  overflow: hidden;
  transition: all 0.2s;
}
.dimension.active {
  border-color: #22c55e;
  background: #f0fdf4;
}

.dimension-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
}

.dimension-toggle {
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  flex-shrink: 0;
}
.toggle-track {
  display: block;
  width: 36px;
  height: 20px;
  background: #ddd;
  border-radius: 10px;
  position: relative;
  transition: background 0.2s;
}
.toggle-track.on { background: #22c55e; }
.toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  background: white;
  border-radius: 50%;
  transition: transform 0.2s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}
.toggle-track.on .toggle-thumb { transform: translateX(16px); }

.dimension-info {
  flex: 1;
  min-width: 0;
}
.dimension-info h3 {
  font-size: 0.85rem;
  font-weight: 600;
  color: #333;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dimension-info p {
  font-size: 0.7rem;
  color: #888;
  margin: 0.125rem 0 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dimension-count {
  font-size: 0.7rem;
  font-weight: 500;
  padding: 0.2rem 0.5rem;
  background: #f0f0f0;
  color: #888;
  border-radius: 4px;
  flex-shrink: 0;
}
.dimension.active .dimension-count {
  background: #dcfce7;
  color: #16a34a;
}

.dimension-content {
  padding: 0.75rem 1rem 1rem;
  border-top: 1px solid #eee;
  animation: slideDown 0.2s ease;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Features Grid */
.features-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.feature-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s;
  font-size: 0;
}
.feature-btn:hover {
  border-color: #22c55e;
  background: #fafafa;
}
.feature-btn.selected {
  border-color: #22c55e;
  background: white;
}

.feature-check {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid #ccc;
  border-radius: 3px;
  flex-shrink: 0;
  transition: all 0.15s;
}
.feature-btn:hover .feature-check {
  border-color: #22c55e;
}
.feature-btn.selected .feature-check {
  background: #22c55e;
  border-color: #22c55e;
  color: white;
}

.feature-name {
  font-size: 0.8rem;
  color: #444;
}
.feature-btn.selected .feature-name {
  color: #16a34a;
  font-weight: 500;
}

/* Footer */
.form-footer {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1.5rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  border: 1px solid #eee;
}

.btn-outline {
  padding: 0.75rem 1.5rem;
  background: transparent;
  color: #666;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-outline:hover { border-color: #999; color: #333; }

.btn-primary {
  padding: 0.75rem 1.5rem;
  background: #56005b;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-primary:hover:not(:disabled) { background: #6d0070; }
.btn-primary:disabled { background: #ccc; cursor: not-allowed; }

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}
.modal-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  max-width: 400px;
  width: 100%;
  text-align: center;
}
.modal-card h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 0.5rem;
}
.modal-card p {
  font-size: 0.9rem;
  color: #666;
  margin: 0 0 1.5rem;
  line-height: 1.5;
}
.modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
}

/* Responsive */
@media (max-width: 900px) {
  .layer-content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .form-page { padding: 1rem; }
  .layer-header { flex-wrap: wrap; }
  .layer-status { order: 5; margin-top: 0.5rem; }
  .form-footer { flex-direction: column; }
  .form-footer .btn-outline,
  .form-footer .btn-primary { width: 100%; text-align: center; }
}
</style>
