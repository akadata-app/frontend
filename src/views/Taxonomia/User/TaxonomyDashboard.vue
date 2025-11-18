<template>
  <div class="report-container">
    <div v-if="report" class="report-header">
      <div>
        <div class="report-badge">
          <span class="badge-icon">📊</span>
          <h6>REPORTE DE TAXONOMÍA</h6>
        </div>
        <h1>{{ report.formName || report.formTitle || '' }}</h1>
      </div>
      <button @click="downloadPdf" class="download-btn" :disabled="downloading">
        <span v-if="downloading">Generando PDF...</span>
        <span v-else>
          <span class="btn-icon">📥</span>
          Descargar reporte
        </span>
      </button>
    </div>
    
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Cargando el reporte…</p>
    </div>
    
    <div v-else-if="error" class="error-state">
      <span class="error-icon">⚠️</span>
      <p>{{ error }}</p>
      <button class="btn-secondary" @click="$router.push({ name: 'FormsList' })">
        Volver a la lista
      </button>
    </div>
    
    <div v-else-if="report">
      <!-- Tarjetas de métricas con iconos -->
      <div class="metrics-cards">
        <div class="metric-card metric-card-layers">
          <div class="metric-icon-wrapper">
            <span class="metric-icon">📚</span>
          </div>
          <div class="metric-info">
            <h3>{{ totalLayers }}</h3>
            <p>Capas</p>
          </div>
        </div>
        <div class="metric-card metric-card-dimensions">
          <div class="metric-icon-wrapper">
            <span class="metric-icon">📊</span>
          </div>
          <div class="metric-info">
            <h3>{{ selectedDimensions }}/{{ totalDimensions }}</h3>
            <p>Dimensiones</p>
          </div>
        </div>
        <div class="metric-card metric-card-features">
          <div class="metric-icon-wrapper">
            <span class="metric-icon">✨</span>
          </div>
          <div class="metric-info">
            <h3>{{ selectedFeatures }}/{{ totalFeatures }}</h3>
            <p>Características</p>
          </div>
        </div>
      </div>

      <!-- Progreso General -->
      <div class="progress-section">
        <h2 class="section-title">
          <span class="section-icon">📈</span>
          Progreso General
        </h2>
        <div class="progress-bars">
          <div class="progress-item">
            <div class="progress-label">
              <span class="progress-icon">📊</span>
              <span>Dimensiones</span>
            </div>
            <div class="progress-bar-container">
              <div class="progress-bar-fill" :style="{ width: dimensionPercentage + '%' }" style="background: #6d8e5a;"></div>
            </div>
            <span class="progress-value">{{ dimensionPercentage }}%</span>
          </div>
          <div class="progress-item">
            <div class="progress-label">
              <span class="progress-icon">✨</span>
              <span>Características</span>
            </div>
            <div class="progress-bar-container">
              <div class="progress-bar-fill" :style="{ width: featurePercentage + '%' }" style="background: #ffc700;"></div>
            </div>
            <span class="progress-value">{{ featurePercentage }}%</span>
          </div>
        </div>
      </div>

      <!-- Detalle por capas -->
      <div class="layers-section">
        <h2 class="section-title">
          <span class="section-icon">📋</span>
          Detalle por Capas
        </h2>
        <div class="layers-grid">
          <div v-for="(layer, layerIndex) in report.layers" :key="layer.layerId || layerIndex" class="layer-card">
            <div class="layer-header">
              <div class="layer-number-badge">
                <span>{{ layerIndex + 1 }}</span>
              </div>
              <div class="layer-title-section">
                <h3>{{ layer.layerName }}</h3>
                <div class="layer-stats">
                  <span class="layer-stat-badge">
                    <span class="stat-icon">📊</span>
                    {{ getSelectedDimensionsCount(layer) }}/{{ layer.dimensions?.length || 0 }} dimensiones
                  </span>
                  <span class="layer-stat-badge">
                    <span class="stat-icon">✨</span>
                    {{ getSelectedFeaturesCount(layer) }}/{{ getTotalFeaturesCount(layer) }} características
                  </span>
                </div>
              </div>
            </div>
            
            <!-- Tabla de dimensiones -->
            <div class="dimensions-table">
              <table>
                <thead>
                  <tr>
                    <th>Dimensión</th>
                    <th class="center">Estado</th>
                    <th class="center">Características</th>
                    <th>Seleccionadas</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="dimension in layer.dimensions" :key="dimension.dimensionId" 
                      :class="{ 'dimension-active': dimension.isSelected === 1, 'dimension-inactive': dimension.isSelected === 0 }">
                    <td class="dimension-name">
                      <span class="dimension-icon">{{ dimension.isSelected === 1 ? '✓' : '✗' }}</span>
                      {{ dimension.dimensionName }}
                    </td>
                    <td class="center">
                      <span :class="['status-badge', dimension.isSelected === 1 ? 'status-active' : 'status-inactive']">
                        {{ dimension.isSelected === 1 ? 'Activa' : 'Inactiva' }}
                      </span>
                    </td>
                    <td class="center">
                      <span class="count-badge">
                        {{ getDimensionSelectedFeaturesCount(dimension) }}/{{ dimension.features?.length || 0 }}
                      </span>
                    </td>
                    <td class="features-list">
                      <div v-if="dimension.isSelected === 1 && getDimensionSelectedFeaturesCount(dimension) > 0" class="features-tags">
                        <span v-for="feature in getSelectedFeatures(dimension)" :key="feature.id" class="feature-tag">
                          {{ feature.name }}
                        </span>
                      </div>
                      <span v-else class="no-features">Ninguna</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import pdfMake from "pdfmake/build/pdfmake"
import pdfFonts from "pdfmake/build/vfs_fonts"

pdfMake.vfs = pdfFonts.vfs

const API_ROOT = (import.meta?.env?.VITE_API_URL || 'http://localhost:8080').replace(/\/+$/, '')
const route = useRoute()
const router = useRouter()
const formId = Number(route.params.formId)
const report = ref(null)
const loading = ref(true)
const error = ref(null)
const downloading = ref(false)

// Computed properties
const totalLayers = computed(() => {
  return report.value?.layers?.length || 0
})

const totalDimensions = computed(() => {
  if (!report.value?.layers) return 0
  return report.value.layers.reduce((sum, layer) => sum + (layer.dimensions?.length || 0), 0)
})

const selectedDimensions = computed(() => {
  if (!report.value?.layers) return 0
  return report.value.layers.reduce((sum, layer) => {
    return sum + (layer.dimensions?.filter(d => d.isSelected === 1).length || 0)
  }, 0)
})

const totalFeatures = computed(() => {
  if (!report.value?.layers) return 0
  return report.value.layers.reduce((sum, layer) => {
    return sum + (layer.dimensions?.reduce((dimSum, dim) => dimSum + (dim.features?.length || 0), 0) || 0)
  }, 0)
})

const selectedFeatures = computed(() => {
  if (!report.value?.layers) return 0
  return report.value.layers.reduce((sum, layer) => {
    return sum + (layer.dimensions?.reduce((dimSum, dim) => {
      return dimSum + (dim.features?.filter(f => f.selected === 1).length || 0)
    }, 0) || 0)
  }, 0)
})

const dimensionPercentage = computed(() => {
  return totalDimensions.value > 0 ? Math.round((selectedDimensions.value / totalDimensions.value) * 100) : 0
})

const featurePercentage = computed(() => {
  return totalFeatures.value > 0 ? Math.round((selectedFeatures.value / totalFeatures.value) * 100) : 0
})

// Funciones auxiliares
function getSelectedDimensionsCount(layer) {
  return layer.dimensions?.filter(d => d.isSelected === 1).length || 0
}

function getTotalFeaturesCount(layer) {
  return layer.dimensions?.reduce((sum, dim) => sum + (dim.features?.length || 0), 0) || 0
}

function getSelectedFeaturesCount(layer) {
  return layer.dimensions?.reduce((sum, dim) => {
    return sum + (dim.features?.filter(f => f.selected === 1).length || 0)
  }, 0) || 0
}

function getDimensionSelectedFeaturesCount(dimension) {
  return dimension.features?.filter(f => f.selected === 1).length || 0
}

function getSelectedFeatures(dimension) {
  return dimension.features?.filter(f => f.selected === 1) || []
}

// Cargar datos del reporte
onMounted(async () => {
  loading.value = true
  error.value = null
  
  try {
    // Primero intentar obtener desde localStorage (datos guardados al enviar el formulario)
    const savedReport = localStorage.getItem(`taxonomyReport_${formId}`)
    if (savedReport) {
      try {
        report.value = JSON.parse(savedReport)
        loading.value = false
        return
      } catch (e) {
        console.warn('Error parsing saved report:', e)
      }
    }
    
    // Si no hay datos guardados, intentar obtener desde el backend
    const response = await axios.get(`${API_ROOT}/api/taxonomy-forms/form-response/${formId}`)
      .catch(async () => {
        // Si no existe endpoint, intentar obtener el formulario y construir reporte básico
        try {
          const formResponse = await axios.get(`${API_ROOT}/api/taxonomy-forms/${formId}`)
          return { data: { formId: formId, formName: formResponse.data.title, layers: [] } }
        } catch (e) {
          throw new Error('No se pudo cargar el reporte')
        }
      })
    
    report.value = response.data
    
    // Guardar en localStorage para futuras visitas
    if (report.value) {
      localStorage.setItem(`taxonomyReport_${formId}`, JSON.stringify(report.value))
    }
  } catch (err) {
    console.error('Error loading report:', err)
    error.value = err.message || 'No se pudo cargar el reporte. Por favor, intente nuevamente.'
  } finally {
    loading.value = false
  }
})

// Función para descargar PDF (usando la misma función mejorada del formulario)
async function downloadPdf() {
  if (downloading.value || !report.value) return
  
  downloading.value = true
  
  try {
    // Usar la función generatePDF mejorada
    const jsonData = {
      formId: formId,
      formName: report.value.formName || report.value.formTitle,
      layers: report.value.layers || []
    }
    
    generatePDF(jsonData)
  } catch (err) {
    console.error('Error generating PDF:', err)
    alert('Error al generar el PDF. Por favor, intente nuevamente.')
  } finally {
    downloading.value = false
  }
}

// Función mejorada para generar PDF (copiada y adaptada de TaxonomyForm.vue)
function generatePDF(jsonData) {
  const totalLayers = jsonData.layers.length
  let totalDimensions = 0
  let selectedDimensions = 0
  let totalFeatures = 0
  let selectedFeatures = 0
  
  jsonData.layers.forEach(layer => {
    layer.dimensions.forEach(dimension => {
      totalDimensions++
      if (dimension.isSelected === 1) {
        selectedDimensions++
      }
      dimension.features.forEach(feature => {
        totalFeatures++
        if (feature.selected === 1) {
          selectedFeatures++
        }
      })
    })
  })
  
  const dimensionPercentage = totalDimensions > 0 ? Math.round((selectedDimensions / totalDimensions) * 100) : 0
  const featurePercentage = totalFeatures > 0 ? Math.round((selectedFeatures / totalFeatures) * 100) : 0
  
  const content = []
  
  // Encabezado
  content.push({
    stack: [
      {
        text: '📊 REPORTE DE TAXONOMÍA',
        style: 'superHeader',
        margin: [0, 0, 0, 10]
      },
      {
        text: jsonData.formName || 'Formulario de Taxonomía',
        style: 'mainTitle',
        margin: [0, 0, 0, 20]
      }
    ],
    margin: [0, 0, 0, 30]
  })
  
  // Tarjetas de estadísticas
  content.push({
    columns: [
      {
        stack: [
          { text: '📚', style: 'statIcon', alignment: 'center' },
          { text: totalLayers, style: 'statNumber' },
          { text: 'Capas', style: 'statLabel' }
        ],
        fillColor: '#56005b',
        color: 'white',
        margin: [0, 0, 5, 0],
        borderRadius: 8
      },
      {
        stack: [
          { text: '📊', style: 'statIcon', alignment: 'center' },
          { text: `${selectedDimensions}/${totalDimensions}`, style: 'statNumber' },
          { text: 'Dimensiones', style: 'statLabel' }
        ],
        fillColor: '#6d8e5a',
        color: 'white',
        margin: [5, 0, 5, 0],
        borderRadius: 8
      },
      {
        stack: [
          { text: '✨', style: 'statIcon', alignment: 'center' },
          { text: `${selectedFeatures}/${totalFeatures}`, style: 'statNumber' },
          { text: 'Características', style: 'statLabel' }
        ],
        fillColor: '#ffc700',
        color: '#1c1c1c',
        margin: [5, 0, 0, 0],
        borderRadius: 8
      }
    ],
    margin: [0, 0, 0, 30],
    columnGap: 10
  })
  
  // Barras de progreso con iconos
  content.push({
    stack: [
      {
        text: [
          { text: '📈 ', fontSize: 16 },
          { text: 'Progreso General', style: 'sectionTitleText' }
        ],
        style: 'sectionTitle',
        margin: [0, 0, 0, 15]
      },
      {
        table: {
          widths: ['25%', '*', '15%'],
          body: [
            [
              { 
                text: [
                  { text: '📊 ', fontSize: 12 },
                  { text: 'Dimensiones', style: 'progressLabel' }
                ],
                border: [false, false, false, false] 
              },
              {
                stack: [{
                  table: {
                    widths: [dimensionPercentage + '%', (100 - dimensionPercentage) + '%'],
                    body: [[
                      { text: '', fillColor: '#6d8e5a', border: [false, false, false, false], margin: [0, 3, 0, 3] },
                      { text: '', fillColor: '#e5e7eb', border: [false, false, false, false], margin: [0, 3, 0, 3] }
                    ]]
                  },
                  layout: 'noBorders'
                }],
                border: [false, false, false, false],
                margin: [5, 5, 5, 5]
              },
              { text: `${dimensionPercentage}%`, style: 'progressValue', alignment: 'right', border: [false, false, false, false] }
            ],
            [
              { 
                text: [
                  { text: '✨ ', fontSize: 12 },
                  { text: 'Características', style: 'progressLabel' }
                ],
                border: [false, false, false, false] 
              },
              {
                stack: [{
                  table: {
                    widths: [featurePercentage + '%', (100 - featurePercentage) + '%'],
                    body: [[
                      { text: '', fillColor: '#ffc700', border: [false, false, false, false], margin: [0, 3, 0, 3] },
                      { text: '', fillColor: '#e5e7eb', border: [false, false, false, false], margin: [0, 3, 0, 3] }
                    ]]
                  },
                  layout: 'noBorders'
                }],
                border: [false, false, false, false],
                margin: [5, 5, 5, 5]
              },
              { text: `${featurePercentage}%`, style: 'progressValue', alignment: 'right', border: [false, false, false, false] }
            ]
          ]
        },
        layout: 'noBorders',
        margin: [0, 0, 0, 0]
      }
    ],
    margin: [0, 0, 0, 30]
  })
  
  // Detalle por capas
  jsonData.layers.forEach((layer, layerIndex) => {
    const layerDimensions = layer.dimensions.length
    const selectedLayerDimensions = layer.dimensions.filter(d => d.isSelected === 1).length
    const layerFeatures = layer.dimensions.reduce((sum, d) => sum + d.features.length, 0)
    const selectedLayerFeatures = layer.dimensions.reduce((sum, d) => 
      sum + d.features.filter(f => f.selected === 1).length, 0)
    
    content.push({
      stack: [
        {
          columns: [
            {
              width: 50,
              stack: [{
                table: {
                  widths: [50],
                  body: [[
                    {
                      text: [
                        { text: '📋 ', fontSize: 14 },
                        { text: String(layerIndex + 1), fontSize: 18, bold: true }
                      ],
                      style: 'layerNumber',
                      fillColor: '#56005b',
                      color: 'white',
                      alignment: 'center',
                      margin: [8, 8, 8, 8]
                    }
                  ]]
                },
                layout: 'noBorders'
              }]
            },
            {
              width: '*',
              stack: [
                {
                  text: layer.layerName,
                  style: 'layerTitle'
                },
                {
                  text: [
                    { text: '📊 ', fontSize: 9 },
                    { text: `${selectedLayerDimensions}/${layerDimensions} dimensiones`, fontSize: 10 },
                    { text: ' • ', fontSize: 10 },
                    { text: '✨ ', fontSize: 9 },
                    { text: `${selectedLayerFeatures}/${layerFeatures} características`, fontSize: 10 }
                  ],
                  style: 'layerSubtitle',
                  margin: [0, 5, 0, 0]
                }
              ],
              margin: [10, 0, 0, 0]
            }
          ],
          margin: [0, 0, 0, 15]
        }
      ],
      margin: layerIndex > 0 ? [0, 20, 0, 0] : [0, 0, 0, 0]
    })
    
    const dimensionTableBody = [
      [
        { text: [{ text: '📐 ', fontSize: 11 }, { text: 'Dimensión', fontSize: 11, bold: true }], style: 'dimTableHeader', fillColor: '#56005b', color: 'white' },
        { text: [{ text: '⚡ ', fontSize: 11 }, { text: 'Estado', fontSize: 11, bold: true }], style: 'dimTableHeader', fillColor: '#56005b', color: 'white', alignment: 'center' },
        { text: [{ text: '✨ ', fontSize: 11 }, { text: 'Características Seleccionadas', fontSize: 11, bold: true }], style: 'dimTableHeader', fillColor: '#56005b', color: 'white', colSpan: 2, alignment: 'center' },
        {}
      ]
    ]
    
    layer.dimensions.forEach(dimension => {
      const selectedCount = dimension.features.filter(f => f.selected === 1).length
      const totalCount = dimension.features.length
      const isSelected = dimension.isSelected === 1
      
      const featuresList = dimension.features
        .filter(f => f.selected === 1)
        .map(f => f.name)
        .join(', ') || 'Ninguna'
      
      dimensionTableBody.push([
        {
          text: [
            { text: isSelected ? '✓ ' : '✗ ', fontSize: 10, bold: true, color: isSelected ? '#065f46' : '#991b1b' },
            { text: dimension.dimensionName, fontSize: 10, bold: true, color: '#1f2937' }
          ],
          fillColor: isSelected ? '#f0f7ed' : '#fff5f5'
        },
        {
          stack: [{
            text: [
              { text: isSelected ? '✓ ' : '✗ ', fontSize: 9, bold: true },
              { text: isSelected ? 'Activa' : 'Inactiva', fontSize: 9, bold: true }
            ],
            style: isSelected ? 'statusActive' : 'statusInactive',
            alignment: 'center'
          }],
          fillColor: isSelected ? '#f0f7ed' : '#fff5f5'
        },
        {
          text: [
            { text: '✨ ', fontSize: 9 },
            { text: `${selectedCount}/${totalCount}`, fontSize: 10, bold: true, color: '#1f2937' }
          ],
          fillColor: isSelected ? '#f0f7ed' : '#fff5f5',
          alignment: 'center'
        },
        {
          text: featuresList ? [
            { text: '• ', fontSize: 7 },
            { text: featuresList, fontSize: 8, color: '#4b5563' }
          ] : 'Ninguna',
          style: 'featureList',
          fillColor: isSelected ? '#f0f7ed' : '#fff5f5',
          fontSize: 8
        }
      ])
    })
    
    content.push({
      table: {
        headerRows: 1,
        widths: ['30%', '15%', '15%', '40%'],
        body: dimensionTableBody
      },
      layout: {
        fillColor: function (rowIndex, node, columnIndex) {
          return (rowIndex % 2 === 0) ? '#fafbfc' : '#ffffff'
        }
      },
      margin: [0, 0, 0, 20]
    })
  })
  
  const now = new Date()
  const dateStr = now.toLocaleDateString('es-ES', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
  
  content.push({
    text: [
      { text: '📅 ', fontSize: 9 },
      { text: `Generado el ${dateStr}`, fontSize: 9, italics: true, color: '#9ca3af' }
    ],
    style: 'footer',
    margin: [0, 30, 0, 0],
    alignment: 'center'
  })
  
  const docDefinition = {
    content: content,
    styles: {
      superHeader: {
        fontSize: 14,
        bold: true,
        color: '#56005b',
        alignment: 'center'
      },
      mainTitle: {
        fontSize: 24,
        bold: true,
        color: '#1f2937',
        alignment: 'center'
      },
      statIcon: {
        fontSize: 24,
        margin: [0, 0, 0, 5]
      },
      statNumber: {
        fontSize: 28,
        bold: true,
        alignment: 'center',
        margin: [0, 5, 0, 0]
      },
      statLabel: {
        fontSize: 12,
        alignment: 'center',
        margin: [0, 5, 0, 0]
      },
      sectionTitle: {
        fontSize: 16,
        bold: true,
        color: '#1f2937',
        margin: [0, 0, 0, 10]
      },
      sectionTitleText: {
        fontSize: 16,
        bold: true,
        color: '#1f2937'
      },
      progressLabel: {
        fontSize: 11,
        color: '#4b5563'
      },
      progressValue: {
        fontSize: 11,
        bold: true,
        color: '#1f2937'
      },
      layerNumber: {
        fontSize: 18,
        bold: true,
        width: 40,
        height: 40,
        alignment: 'center',
        margin: [0, 0, 0, 0]
      },
      layerTitle: {
        fontSize: 18,
        bold: true,
        color: '#56005b'
      },
      layerSubtitle: {
        fontSize: 10,
        color: '#6b7280',
        italics: true
      },
      dimTableHeader: {
        fontSize: 11,
        bold: true
      },
      dimName: {
        fontSize: 10,
        bold: true,
        color: '#1f2937'
      },
      statusActive: {
        fontSize: 9,
        color: '#065f46',
        bold: true
      },
      statusInactive: {
        fontSize: 9,
        color: '#991b1b',
        bold: true
      },
      featureCount: {
        fontSize: 10,
        bold: true,
        color: '#1f2937'
      },
      featureList: {
        fontSize: 8,
        color: '#4b5563'
      },
      footer: {
        fontSize: 9,
        color: '#9ca3af',
        italics: true
      }
    },
    defaultStyle: {
      font: 'Roboto',
      // Asegurar que los emojis se rendericen correctamente
      unicode: true
    },
    pageMargins: [40, 60, 40, 60],
    pageSize: 'A4',
    info: {
      title: jsonData.formName || 'Reporte de Taxonomía',
      author: 'AKADATA',
      subject: 'Reporte de evaluación de taxonomía'
    }
  }

  const titleFile = jsonData.formName
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^\w]/g, "")

  pdfMake.createPdf(docDefinition).download(`${titleFile}_reporte.pdf`)
}
</script>

<style scoped>
.report-container { 
  max-width: 1400px; 
  margin: 2rem auto; 
  padding: 1rem;
  background: #f7f7fa;
  min-height: calc(100vh - 200px);
}

.report-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}

.report-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.badge-icon {
  font-size: 1.2rem;
}

.report-header h6 {
  color: #6d8e5a;
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin: 0;
}

.report-header h1 {
  margin-top: 0.5rem;
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0;
}

/* Tarjetas de métricas mejoradas */
.metrics-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.metric-card {
  background: #fff;
  border-radius: 16px;
  padding: 2rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  border: 1px solid rgba(0,0,0,0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border-bottom: 4px solid;
}

.metric-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0,0,0,0.12);
}

.metric-card-layers {
  border-bottom-color: #56005b;
}

.metric-card-dimensions {
  border-bottom-color: #6d8e5a;
}

.metric-card-features {
  border-bottom-color: #ffc700;
}

.metric-icon-wrapper {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  flex-shrink: 0;
}

.metric-card-layers .metric-icon-wrapper {
  background: linear-gradient(135deg, #56005b 0%, #7a007f 100%);
}

.metric-card-dimensions .metric-icon-wrapper {
  background: linear-gradient(135deg, #6d8e5a 0%, #5a7a4a 100%);
}

.metric-card-features .metric-icon-wrapper {
  background: linear-gradient(135deg, #ffc700 0%, #ffd700 100%);
}

.metric-info h3 {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  line-height: 1;
  color: #1f2937;
}

.metric-info p {
  font-size: 1rem;
  margin: 0.5rem 0 0 0;
  font-weight: 600;
  color: #6b7280;
}

/* Sección de progreso */
.progress-section {
  background: #fff;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 3rem;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 1.5rem 0;
}

.section-icon {
  font-size: 1.5rem;
}

.progress-bars {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.progress-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.progress-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #4b5563;
  min-width: 140px;
}

.progress-icon {
  font-size: 1.2rem;
}

.progress-bar-container {
  flex: 1;
  height: 24px;
  background: #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
}

.progress-bar-fill {
  height: 100%;
  border-radius: 12px;
  transition: width 0.5s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.progress-value {
  font-weight: 700;
  color: #1f2937;
  min-width: 50px;
  text-align: right;
}

/* Sección de capas */
.layers-section {
  margin-bottom: 3rem;
}

.layers-grid {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.layer-card {
  background: #fff;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  border: 1px solid rgba(0,0,0,0.05);
}

.layer-header {
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #e5e7eb;
}

.layer-number-badge {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #56005b 0%, #7a007f 100%);
  color: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  flex-shrink: 0;
}

.layer-title-section {
  flex: 1;
}

.layer-title-section h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #56005b;
  margin: 0 0 0.75rem 0;
}

.layer-stats {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.layer-stat-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #f8f9fa;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #4b5563;
}

.stat-icon {
  font-size: 1rem;
}

/* Tabla de dimensiones */
.dimensions-table {
  overflow-x: auto;
}

.dimensions-table table {
  width: 100%;
  border-collapse: collapse;
}

.dimensions-table thead {
  background: linear-gradient(135deg, #56005b 0%, #7a007f 100%);
  color: white;
}

.dimensions-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 700;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.dimensions-table th.center {
  text-align: center;
}

.dimensions-table tbody tr {
  border-bottom: 1px solid #e5e7eb;
  transition: background 0.2s ease;
}

.dimensions-table tbody tr:hover {
  background: #f9fafb;
}

.dimensions-table tbody tr.dimension-active {
  background: #f0f7ed;
}

.dimensions-table tbody tr.dimension-inactive {
  background: #fff5f5;
}

.dimensions-table td {
  padding: 1rem;
  font-size: 0.95rem;
}

.dimensions-table td.center {
  text-align: center;
}

.dimension-name {
  font-weight: 600;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.dimension-icon {
  font-size: 1.2rem;
  font-weight: 700;
}

.status-badge {
  display: inline-block;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.status-active {
  background: #d1fae5;
  color: #065f46;
}

.status-inactive {
  background: #fee2e2;
  color: #991b1b;
}

.count-badge {
  display: inline-block;
  padding: 0.4rem 0.8rem;
  background: #e5e7eb;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #4b5563;
}

.features-list {
  font-size: 0.85rem;
}

.features-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.feature-tag {
  display: inline-block;
  padding: 0.3rem 0.6rem;
  background: #d1fae5;
  color: #065f46;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.no-features {
  color: #9ca3af;
  font-style: italic;
}

.download-btn { 
  background: linear-gradient(135deg, #56005b 0%, #7a007f 100%);
  color: #fff;
  border: none;
  padding: 0.9rem 1.8rem;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(86, 0, 91, 0.3);
}

.download-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #7a007f 0%, #56005b 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(86, 0, 91, 0.4);
}

.download-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-icon {
  font-size: 1.2rem;
}

.btn-secondary {
  background: #f3f4f6;
  color: #4b5563;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  gap: 1.5rem;
  min-height: 400px;
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

.error-icon {
  font-size: 3rem;
}

.error-state p {
  margin: 0.5rem 0;
  font-weight: 500;
  font-size: 1.1rem;
  color: #dc2626;
}

/* Responsive */
@media (max-width: 768px) {
  .report-container {
    padding: 0.5rem;
  }
  
  .report-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .metrics-cards {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .progress-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .progress-label {
    min-width: auto;
  }
  
  .progress-bar-container {
    width: 100%;
  }
  
  .layer-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .dimensions-table {
    font-size: 0.85rem;
  }
  
  .dimensions-table th,
  .dimensions-table td {
    padding: 0.75rem 0.5rem;
  }
}
</style>

