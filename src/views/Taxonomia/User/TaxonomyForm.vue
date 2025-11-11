<template>
  <div class="taxonomy-form">
    <div class="form-header">
      <h1 class="form-title">{{ form.title }}</h1>
      <p v-if="form.description" class="form-description">{{ form.description }}</p>
    </div>

    <!-- Progress indicator -->
    <div class="progress-section">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
      </div>
      <p class="progress-text">{{ completedLayers }} de {{ form.layers?.length || 0 }} capas completadas</p>
    </div>

    <!-- Layers con acordeones -->
    <div class="layers-container" v-if="form.layers && form.layers.length">
      <div
        v-for="(layer, layerIndex) in form.layers"
        :key="layer.id"
        class="layer-accordion"
        :class="{ 'is-open': openLayers[layer.id] }"
      >
        <!-- Header del acordeón Layer -->
        <div
          class="layer-accordion-header"
          @click="toggleLayer(layer.id)"
        >
          <div class="layer-header-content">
            <div class="layer-number">{{ layerIndex + 1 }}</div>
            <div class="layer-header-text">
              <h2 class="layer-name">{{ layer.name }}</h2>
              <p v-if="layer.description" class="layer-desc">{{ layer.description }}</p>
            </div>
            <div class="layer-status">
              <span v-if="isLayerCompleted(layer.id)" class="status-badge completed">✓ Completado</span>
              <span v-else class="status-badge incomplete">Pendiente</span>
            </div>
          </div>
          <div class="accordion-icon">
            <span class="icon">{{ openLayers[layer.id] ? '−' : '+' }}</span>
          </div>
        </div>

        <!-- Contenido del acordeón Layer -->
        <div
          class="layer-accordion-content"
          v-show="openLayers[layer.id]"
        >
          <!-- Dimensions con acordeones anidados -->
          <div
            v-for="(dimension, dimIndex) in layer.dimensions"
            :key="dimension.id"
            class="dimension-accordion"
            :class="{ 'is-open': openDimensions[dimension.id], 'is-selected': isDimensionSelected(layer.id, dimension.id) }"
          >
            <!-- Header del acordeón Dimension -->
            <div
              class="dimension-accordion-header"
              @click="toggleDimension(dimension.id)"
            >
              <div class="dimension-header-content">
                <div class="dimension-toggle" @click.stop="toggleDimensionSelection(layer.id, dimension.id)">
                  <div class="toggle-switch" :class="{ 'active': isDimensionSelected(layer.id, dimension.id) }">
                    <span class="toggle-slider"></span>
                  </div>
                </div>
                <div class="dimension-header-text">
                  <h3 class="dimension-name">{{ dimension.name }}</h3>
                  <p v-if="dimension.description" class="dimension-desc">{{ dimension.description }}</p>
                </div>
                <div class="dimension-features-count">
                  <span class="count-badge">
                    {{ getSelectedFeaturesCount(layer.id, dimension.id) }} / {{ dimension.features?.length || 0 }}
                  </span>
                </div>
              </div>
              <div class="accordion-icon">
                <span class="icon">{{ openDimensions[dimension.id] ? '−' : '+' }}</span>
              </div>
            </div>

            <!-- Contenido del acordeón Dimension -->
            <div
              class="dimension-accordion-content"
              v-show="openDimensions[dimension.id]"
            >
              <div v-if="!isDimensionSelected(layer.id, dimension.id)" class="dimension-disabled-message">
                <p>Activa esta dimensión para seleccionar características</p>
              </div>
              <div 
                v-else 
                class="features-grid"
                :class="{ 'has-selections': hasSelectedFeatures(layer.id, dimension.id) }"
              >
                <div
                  v-for="(feature, featIndex) in paddedFeatures(dimension.features)"
                  :key="feature ? feature.id : `empty-${featIndex}`"
                  class="feature-card"
                  :class="{ 
                    'selected': feature && isFeatureSelected(layer.id, dimension.id, feature.id),
                    'empty': !feature
                  }"
                  @click="feature && toggleFeature(layer.id, dimension.id, feature.id)"
                >
                  <div class="feature-checkbox">
                    <span v-if="feature && isFeatureSelected(layer.id, dimension.id, feature.id)" class="check-icon">✓</span>
                  </div>
                  <div class="feature-name">{{ feature ? feature.name : '' }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Botones de acción -->
    <div class="form-actions">
      <button class="btn-secondary" @click="goBack">
        <span class="btn-icon">←</span>
        Volver
      </button>
      <button class="btn-primary" @click="showConfirmModal = true" :disabled="!isFormComplete">
        <span>Finalizar formulario</span>
        <span class="btn-icon">→</span>
      </button>
    </div>

    <!-- Modal de confirmación -->
    <div v-if="showConfirmModal" class="modal-overlay" @click.self="showConfirmModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Finalizar formulario</h2>
        </div>
        <div class="modal-body">
          <p>Una vez enviado, no podrás modificar los datos.</p>
          <p class="modal-warning">¿Deseas continuar?</p>
        </div>
        <div class="modal-actions">
          <button class="modal-btn modal-btn-cancel" @click="showConfirmModal = false">
            Regresar
          </button>
          <button class="modal-btn modal-btn-submit" @click="submitForm">
            Enviar formulario
          </button>
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
      showConfirmModal: false
    };
  },
  computed: {
    completedLayers() {
      if (!this.form.layers) return 0;
      return this.form.layers.filter(layer => {
        const layerChoices = this.userChoices[layer.id] || {};
        return layer.dimensions.some(dim => {
          const dimChoice = layerChoices[dim.id];
          return dimChoice && dimChoice.isSelected === 1;
        });
      }).length;
    },
    progressPercentage() {
      if (!this.form.layers || this.form.layers.length === 0) return 0;
      return (this.completedLayers / this.form.layers.length) * 100;
    },
    isFormComplete() {
      return this.completedLayers > 0;
    }
  },
  async mounted() {
    this.form = (await taxonomyFormService.getFormById(this.$route.params.id)).data;
    
    // Inicializar userChoices
    this.form.layers.forEach(layer => {
      this.userChoices[layer.id] = {};
      this.openLayers[layer.id] = true; // Abrir todas las capas por defecto
      
      layer.dimensions.forEach(dim => {
        this.userChoices[layer.id][dim.id] = {
          dimensionId: dim.id,
          isSelected: 0, // Por defecto desactivado
          features: dim.features.map(f => ({
            id: f.id,
            selected: 0
          }))
        };
        this.openDimensions[dim.id] = true; // Abrir todas las dimensiones por defecto
      });
    });
    
    console.log('Formulaire chargé:', this.form);
  },
  methods: {
    toggleLayer(layerId) {
      this.openLayers = { ...this.openLayers, [layerId]: !this.openLayers[layerId] };
    },
    toggleDimension(dimensionId) {
      this.openDimensions = { ...this.openDimensions, [dimensionId]: !this.openDimensions[dimensionId] };
    },
    isDimensionSelected(layerId, dimensionId) {
      const choice = this.userChoices[layerId]?.[dimensionId];
      return choice && choice.isSelected === 1;
    },
    isFeatureSelected(layerId, dimensionId, featureId) {
      const choice = this.userChoices[layerId]?.[dimensionId];
      if (!choice || choice.isSelected !== 1) return false;
      const feature = choice.features?.find(f => f.id === featureId);
      return feature && feature.selected === 1;
    },
    toggleDimensionSelection(layerId, dimensionId) {
      const choice = this.userChoices[layerId]?.[dimensionId];
      if (!choice) return;
      
      choice.isSelected = choice.isSelected === 1 ? 0 : 1;
      
      // Si se deselecciona, deseleccionar todas las features
      if (choice.isSelected === 0) {
        choice.features.forEach(f => f.selected = 0);
      }
      
      this.emitChoice(layerId);
    },
    toggleFeature(layerId, dimensionId, featureId) {
      const choice = this.userChoices[layerId]?.[dimensionId];
      if (!choice || choice.isSelected !== 1) return;
      
      const feature = choice.features.find(f => f.id === featureId);
      if (feature) {
        feature.selected = feature.selected === 1 ? 0 : 1;
        this.emitChoice(layerId);
      }
    },
    getSelectedFeaturesCount(layerId, dimensionId) {
      const choice = this.userChoices[layerId]?.[dimensionId];
      if (!choice || choice.isSelected !== 1) return 0;
      return choice.features.filter(f => f.selected === 1).length;
    },
    hasSelectedFeatures(layerId, dimensionId) {
      return this.getSelectedFeaturesCount(layerId, dimensionId) > 0;
    },
    paddedFeatures(features) {
      // Asegurar que siempre haya 6 elementos (3x2)
      const padded = [...(features || [])];
      while (padded.length < 6) {
        padded.push(null);
      }
      return padded.slice(0, 6);
    },
    isLayerCompleted(layerId) {
      const layerChoices = this.userChoices[layer.id] || {};
      const layer = this.form.layers.find(l => l.id === layerId);
      if (!layer) return false;
      
      return layer.dimensions.some(dim => {
        const dimChoice = layerChoices[dim.id];
        return dimChoice && dimChoice.isSelected === 1;
      });
    },
    emitChoice(layerId) {
      const layer = this.form.layers.find(l => l.id === layerId);
      if (!layer) return;
      
      const dimensionsOnly = {};
      Object.keys(this.userChoices[layerId] || {}).forEach(key => {
        dimensionsOnly[key] = this.userChoices[layerId][key];
      });
      
      const fullObj = {
        formId: this.form.id,
        formName: this.form.title,
        layers: this.form.layers.map(l => ({
          layerId: l.id,
          layerName: l.name,
          ...(this.userChoices[l.id] || {})
        }))
      };
      
      console.log('État complet du formulaire:', JSON.parse(JSON.stringify(fullObj)));
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
            dimensions: layer.dimensions.map(dimension => {
              const userDimensionChoice = userChoicesForLayer[dimension.id] || {};
              
              return {
                dimensionId: dimension.id,
                dimensionName: dimension.name,
                isSelected: userDimensionChoice.isSelected || 0,
                features: dimension.features.map(feature => {
                  const userFeatureChoice = userDimensionChoice.features?.find(f => f.id === feature.id);
                  return {
                    id: feature.id,
                    name: feature.name,
                    selected: userFeatureChoice?.selected || 0
                  };
                })
              };
            })
          };
        })
      };
      
      taxonomyFormService.addResponseForm(
        1,
        this.form.id,
        responseObj
      ).then(() => {
        this.$router.push({ name: 'FormsList' });
      }).catch(error => {
        console.error("Erreur lors de l'envoi du formulaire:", error);
      });
      
      console.log("ENREGISTREMENT DES CHOIX");
      console.log(responseObj);
      
      generatePDF(responseObj);
    }
  }
};

// Función para generar PDF
function generatePDF(jsonData) {
  console.log("Datos para PDF:", JSON.stringify(jsonData, null, 2));
  
  let tableBody = [
    [
      { text: "Layer", style: "tableHeader" },
      { text: "Dimension", style: "tableHeader" },
      { text: "Features", style: "tableHeader", colSpan: 4, alignment: "center" },
      {}, {}, {}
    ]
  ];

  jsonData.layers.forEach(layer => {
    const layerRowSpan = layer.dimensions.length;

    layer.dimensions.forEach((dimension, dimIndex) => {
      const row = [];

      if (dimIndex === 0) {
        row.push({
          text: layer.layerName,
          rowSpan: layerRowSpan,
          fillColor: "#ffffff"
        });
      } else {
        row.push({});
      }

      row.push({
        text: dimension.dimensionName || `Dimension ${dimension.dimensionId}`,
        fillColor: dimension.isSelected ? "#c8e6c9" : "#ffcdd2"
      });

      const features = (dimension.features || []);

      for (let i = 0; i < 4; i++) {
        let feature = features[i];
        let cellColor = "#ffffff";

        if (dimension.isSelected === 0) {
          cellColor = "#ffcdd2";
        } else if (dimension.isSelected === 1) {
          if (feature && feature.selected === 1) {
            cellColor = "#c8e6c9";
          }
        }

        row.push({
          text: feature ? (feature.name || `Feature ${feature.id}`) : "",
          fillColor: cellColor
        });
      }

      tableBody.push(row);
    });
  });

  const docDefinition = {
    content: [
      { text: jsonData.formName, style: "header" },
      {
        table: {
          headerRows: 1,
          widths: ["20%", "20%", "15%", "15%", "15%", "15%"],
          body: tableBody
        }
      }
    ],
    styles: {
      header: {
        fontSize: 18,
        bold: true,
        margin: [0, 0, 0, 10]
      },
      tableHeader: {
        bold: true,
        fontSize: 13,
        color: "black",
        fillColor: "#eeeeee"
      }
    }
  };

  const titleFile = jsonData.formName
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^\w]/g, "");

  pdfMake.createPdf(docDefinition).download(`${titleFile}.pdf`);
}
</script>

<style scoped>
.taxonomy-form {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  background: linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%);
  min-height: calc(100vh - 200px);
  font-family: 'Roboto', sans-serif;
}

.form-header {
  text-align: center;
  margin-bottom: 2rem;
}

.form-title {
  font-size: 2.2rem;
  font-weight: 700;
  color: #56005b;
  margin-bottom: 0.5rem;
  letter-spacing: -0.02em;
}

.form-description {
  font-size: 1.1rem;
  color: #4a5568;
  line-height: 1.6;
  max-width: 800px;
  margin: 0 auto;
}

/* Progress section */
.progress-section {
  margin-bottom: 2.5rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.progress-bar {
  width: 100%;
  height: 12px;
  background: #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #56005b, #7a007f);
  border-radius: 10px;
  transition: width 0.3s ease;
}

.progress-text {
  text-align: center;
  font-size: 0.9rem;
  color: #6b7280;
  font-weight: 500;
}

/* Layers container */
.layers-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 3rem;
}

/* Layer accordion */
.layer-accordion {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 2px solid #e5e7eb;
  transition: all 0.3s ease;
  overflow: hidden;
  margin-bottom: 1rem;
}

.layer-accordion.is-open {
  border-color: #56005b;
  box-shadow: 0 4px 16px rgba(86, 0, 91, 0.15);
}

.layer-accordion-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  cursor: pointer;
  background: linear-gradient(135deg, #56005b 0%, #7a007f 100%);
  color: white;
  transition: all 0.3s ease;
}

.layer-accordion-header:hover {
  background: linear-gradient(135deg, #7a007f 0%, #56005b 100%);
}

.layer-header-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex: 1;
}

.layer-number {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.layer-header-text {
  flex: 1;
}

.layer-name {
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0 0 0.25rem 0;
}

.layer-desc {
  font-size: 0.95rem;
  margin: 0;
  opacity: 0.9;
  line-height: 1.5;
}

.layer-status {
  flex-shrink: 0;
}

.status-badge {
  display: inline-block;
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.status-badge.completed {
  background: rgba(255, 255, 255, 0.25);
  color: white;
}

.status-badge.incomplete {
  background: rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.8);
}

.accordion-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  flex-shrink: 0;
  transition: transform 0.3s ease;
}

.layer-accordion.is-open .accordion-icon {
  transform: rotate(180deg);
}

.accordion-icon .icon {
  font-size: 1.5rem;
  font-weight: 300;
  line-height: 1;
}

.layer-accordion-content {
  padding: 1.5rem;
  background: #fafbfc;
}

/* Dimension accordion */
.dimension-accordion {
  background: #ffffff;
  border-radius: 12px;
  border: 2px solid #e5e7eb;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
  overflow: hidden;
}

.dimension-accordion.is-selected {
  border-color: #6d8e5a;
  background: #f0f7ed;
}

.dimension-accordion.is-open {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.dimension-accordion-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem;
  cursor: pointer;
  background: #ffffff;
  transition: all 0.2s ease;
}

.dimension-accordion-header:hover {
  background: #f9fafb;
}

.dimension-header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.dimension-toggle {
  flex-shrink: 0;
}

.toggle-switch {
  width: 50px;
  height: 28px;
  background: #cbd5e1;
  border-radius: 14px;
  position: relative;
  cursor: pointer;
  transition: background 0.3s ease;
}

.toggle-switch.active {
  background: #6d8e5a;
}

.toggle-slider {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 22px;
  height: 22px;
  background: white;
  border-radius: 50%;
  transition: transform 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle-switch.active .toggle-slider {
  transform: translateX(22px);
}

.dimension-header-text {
  flex: 1;
}

.dimension-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
}

.dimension-desc {
  font-size: 0.9rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
}

.dimension-features-count {
  flex-shrink: 0;
}

.count-badge {
  display: inline-block;
  padding: 0.35rem 0.75rem;
  background: #e5e7eb;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #4b5563;
}

.dimension-accordion.is-selected .count-badge {
  background: #6d8e5a;
  color: white;
}

.dimension-accordion-content {
  padding: 1.25rem;
  background: #ffffff;
  border-top: 1px solid #e5e7eb;
}

.dimension-disabled-message {
  text-align: center;
  padding: 2rem;
  color: #9ca3af;
  font-style: italic;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 1rem;
  padding: 0.5rem;
  transition: all 0.3s ease;
}

.features-grid.has-selections {
  background: #f0f7ed;
  border-radius: 12px;
  padding: 1rem;
  border: 2px solid #c8e6c9;
}

.feature-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1.25rem 1rem;
  background: #fafbfc;
  border: 2px solid #e8eaed;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 120px;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(109, 142, 90, 0.05) 0%, rgba(109, 142, 90, 0.02) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.feature-card:hover:not(.empty) {
  background: #f5f7fa;
  border-color: #d1d5db;
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.feature-card:hover:not(.empty)::before {
  opacity: 1;
}

.feature-card.selected {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  border-color: #6d8e5a;
  box-shadow: 0 4px 12px rgba(109, 142, 90, 0.25);
  transform: translateY(-2px);
}

.feature-card.selected::before {
  opacity: 1;
  background: linear-gradient(135deg, rgba(109, 142, 90, 0.1) 0%, rgba(109, 142, 90, 0.05) 100%);
}

.feature-card.empty {
  background: transparent;
  border: 2px dashed #e5e7eb;
  cursor: default;
  opacity: 0.3;
}

.feature-card.empty:hover {
  transform: none;
  box-shadow: none;
}

.features-grid.has-selections .feature-card:not(.selected):not(.empty) {
  background: #f0f4f0;
  border-color: #d1e5d1;
}

.features-grid.has-selections .feature-card:not(.selected):not(.empty):hover {
  background: #e8f0e8;
  border-color: #b8d4b8;
}

.feature-checkbox {
  width: 32px;
  height: 32px;
  border: 3px solid #d1d5db;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  flex-shrink: 0;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.feature-card:hover:not(.empty) .feature-checkbox {
  border-color: #9ca3af;
  transform: scale(1.1);
}

.feature-card.selected .feature-checkbox {
  background: linear-gradient(135deg, #6d8e5a 0%, #5a7a4a 100%);
  border-color: #5a7a4a;
  box-shadow: 0 4px 8px rgba(109, 142, 90, 0.3);
  transform: scale(1.05);
}

.check-icon {
  color: white;
  font-weight: bold;
  font-size: 1.1rem;
  animation: checkPop 0.3s ease;
}

@keyframes checkPop {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

.feature-name {
  font-size: 0.95rem;
  font-weight: 500;
  color: #4b5563;
  line-height: 1.4;
  word-wrap: break-word;
  max-width: 100%;
}

.feature-card.selected .feature-name {
  color: #065f46;
  font-weight: 600;
}

.feature-card.empty .feature-name {
  color: transparent;
}

/* Form actions */
.form-actions {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding-top: 2rem;
  border-top: 2px solid #e5e7eb;
}

.btn-secondary,
.btn-primary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  font-family: 'Roboto', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary {
  background: #f3f4f6;
  color: #4b5563;
}

.btn-secondary:hover {
  background: #e5e7eb;
  transform: translateY(-2px);
}

.btn-primary {
  background: linear-gradient(135deg, #ffc700 0%, #ffd700 100%);
  color: #1c1c1c;
  box-shadow: 0 4px 12px rgba(255, 199, 0, 0.3);
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #ffd700 0%, #ffc700 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(255, 199, 0, 0.4);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-icon {
  font-size: 1.2rem;
  line-height: 1;
}

/* Modal */
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
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 500px;
  width: 90%;
  overflow: hidden;
}

.modal-header {
  background: linear-gradient(135deg, #56005b 0%, #7a007f 100%);
  color: white;
  padding: 1.5rem;
  text-align: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.modal-body {
  padding: 2rem;
  text-align: center;
}

.modal-body p {
  margin: 0.5rem 0;
  color: #4b5563;
  font-size: 1rem;
  line-height: 1.6;
}

.modal-warning {
  font-weight: 600;
  color: #56005b;
  font-size: 1.1rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.modal-btn {
  flex: 1;
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  font-family: 'Roboto', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
}

.modal-btn-cancel {
  background: #f3f4f6;
  color: #4b5563;
}

.modal-btn-cancel:hover {
  background: #e5e7eb;
}

.modal-btn-submit {
  background: linear-gradient(135deg, #6d8e5a 0%, #5a7a4a 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(109, 142, 90, 0.3);
}

.modal-btn-submit:hover {
  background: linear-gradient(135deg, #5a7a4a 0%, #6d8e5a 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(109, 142, 90, 0.4);
}

/* Responsive */
@media (max-width: 768px) {
  .taxonomy-form {
    padding: 1rem;
  }
  
  .form-title {
    font-size: 1.6rem;
  }
  
  .layer-header-content {
    flex-wrap: wrap;
    gap: 1rem;
  }
  
  .features-grid {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(3, 1fr);
  }
  
  .feature-card {
    min-height: 100px;
    padding: 1rem 0.75rem;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .btn-secondary,
  .btn-primary {
    width: 100%;
    justify-content: center;
  }
}
</style>
