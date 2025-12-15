<template>
  <div class="report-page">
    <!-- Loading -->
    <div v-if="loading" class="state-container">
      <div class="spinner"></div>
      <p>Cargando reporte...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="state-container">
      <div class="state-icon">!</div>
      <p>{{ error }}</p>
      <button class="btn-outline" @click="$router.push({ name: 'FormsList' })">Volver</button>
    </div>

    <!-- Report -->
    <template v-else-if="report">
      <!-- Header -->
      <header class="report-header">
        <div class="header-left">
          <span class="header-label">Reporte de Taxonomia</span>
          <h1>{{ report.formName || report.formTitle || 'Sin titulo' }}</h1>
        </div>
        <button class="btn-primary" @click="downloadPdf" :disabled="downloading">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
          </svg>
          {{ downloading ? 'Generando...' : 'Descargar PDF' }}
        </button>
      </header>

      <!-- Stats Grid -->
      <section class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">{{ totalLayers }}</div>
          <div class="stat-label">Capas</div>
          <div class="stat-bar" style="--color: #56005b"></div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ selectedDimensions }}<span class="stat-total">/{{ totalDimensions }}</span></div>
          <div class="stat-label">Dimensiones activas</div>
          <div class="stat-bar" style="--color: #22c55e"></div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ selectedFeatures }}<span class="stat-total">/{{ totalFeatures }}</span></div>
          <div class="stat-label">Caracteristicas</div>
          <div class="stat-bar" style="--color: #3b82f6"></div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ featurePercentage }}<span class="stat-percent">%</span></div>
          <div class="stat-label">Completado</div>
          <div class="stat-bar" style="--color: #f59e0b"></div>
        </div>
      </section>

      <!-- Charts Row -->
      <section class="charts-row">
        <!-- Left: Bar Chart -->
        <div class="chart-card chart-main">
          <h3>Progreso por capa</h3>
          <div class="chart-wrapper">
            <canvas ref="barChartRef"></canvas>
          </div>
        </div>

        <!-- Right: Donut + Stats -->
        <div class="chart-sidebar">
          <div class="chart-card">
            <h3>Dimensiones</h3>
            <div class="donut-wrapper">
              <canvas ref="donutChartRef"></canvas>
              <div class="donut-center">
                <span class="donut-value">{{ dimensionPercentage }}%</span>
              </div>
            </div>
            <div class="donut-legend">
              <div class="legend-row">
                <span class="dot green"></span>
                <span>Activas</span>
                <span class="legend-num">{{ selectedDimensions }}</span>
              </div>
              <div class="legend-row">
                <span class="dot gray"></span>
                <span>Inactivas</span>
                <span class="legend-num">{{ totalDimensions - selectedDimensions }}</span>
              </div>
            </div>
          </div>

          <div class="mini-stats">
            <div class="mini-stat">
              <span class="mini-value">{{ avgFeaturesPerDimension }}</span>
              <span class="mini-label">Caract./Dim</span>
            </div>
            <div class="mini-stat">
              <span class="mini-value">{{ avgDimensionsPerLayer }}</span>
              <span class="mini-label">Dim./Capa</span>
            </div>
            <div class="mini-stat">
              <span class="mini-value">{{ mostActiveLayers }}</span>
              <span class="mini-label">Capas 100%</span>
            </div>
            <div class="mini-stat highlight">
              <span class="mini-value">{{ coverageScore }}%</span>
              <span class="mini-label">Cobertura</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Layers -->
      <section class="layers-section">
        <h2 class="section-title">Detalle por capas</h2>
        
        <div class="layers-list">
          <article
            v-for="(layer, layerIndex) in report.layers"
            :key="layer.layerId || layerIndex"
            class="layer-card"
          >
            <div class="layer-header">
              <span class="layer-num">{{ layerIndex + 1 }}</span>
              <div class="layer-info">
                <h3>{{ layer.layerName }}</h3>
                <div class="layer-meta">
                  <span>{{ getSelectedDimensionsCount(layer) }}/{{ layer.dimensions?.length || 0 }} dim.</span>
                  <span>{{ getSelectedFeaturesCount(layer) }}/{{ getTotalFeaturesCount(layer) }} car.</span>
                </div>
              </div>
            </div>

            <div class="dimensions-grid">
              <div
                v-for="dimension in layer.dimensions"
                :key="dimension.dimensionId"
                class="dimension-item"
                :class="{ active: dimension.isSelected === 1 }"
              >
                <div class="dimension-header">
                  <span class="dimension-status">
                    <svg v-if="dimension.isSelected === 1" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </span>
                  <span class="dimension-name">{{ dimension.dimensionName }}</span>
                  <span class="dimension-count">{{ getDimensionSelectedFeaturesCount(dimension) }}/{{ dimension.features?.length || 0 }}</span>
                </div>
                <div v-if="dimension.isSelected === 1 && getDimensionSelectedFeaturesCount(dimension) > 0" class="features-list">
                  <span
                    v-for="feature in getSelectedFeatures(dimension)"
                    :key="feature.id"
                    class="feature-tag"
                  >{{ feature.name }}</span>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>

      <!-- Footer -->
      <footer class="report-footer">
        <span>Generado el {{ formattedDate }}</span>
      </footer>
    </template>
  </div>
</template>

<script setup>
import { onMounted, ref, computed, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import Chart from 'chart.js/auto'
import pdfMake from "pdfmake/build/pdfmake"
import pdfFonts from "pdfmake/build/vfs_fonts"
pdfMake.vfs = pdfFonts.vfs

const API_ROOT = (import.meta?.env?.VITE_API_URL || 'http://localhost:8080').replace(/\/+$/, '')
const route = useRoute()
const formId = Number(route.params.formId)
const report = ref(null)
const loading = ref(true)
const error = ref(null)
const downloading = ref(false)

// Chart refs
const barChartRef = ref(null)
const donutChartRef = ref(null)
let barChart = null
let donutChart = null

const totalLayers = computed(() => report.value?.layers?.length || 0)

const totalDimensions = computed(() => {
  if (!report.value?.layers) return 0
  return report.value.layers.reduce((s, l) => s + (l.dimensions?.length || 0), 0)
})

const selectedDimensions = computed(() => {
  if (!report.value?.layers) return 0
  return report.value.layers.reduce((s, l) => s + (l.dimensions?.filter(d => d.isSelected === 1).length || 0), 0)
})

const totalFeatures = computed(() => {
  if (!report.value?.layers) return 0
  return report.value.layers.reduce((s, l) => s + (l.dimensions?.reduce((ds, d) => ds + (d.features?.length || 0), 0) || 0), 0)
})

const selectedFeatures = computed(() => {
  if (!report.value?.layers) return 0
  return report.value.layers.reduce((s, l) => s + (l.dimensions?.reduce((ds, d) => ds + (d.features?.filter(f => f.selected === 1).length || 0), 0) || 0), 0)
})

const dimensionPercentage = computed(() => totalDimensions.value > 0 ? Math.round((selectedDimensions.value / totalDimensions.value) * 100) : 0)
const featurePercentage = computed(() => totalFeatures.value > 0 ? Math.round((selectedFeatures.value / totalFeatures.value) * 100) : 0)

// Extra statistics
const avgFeaturesPerDimension = computed(() => {
  if (selectedDimensions.value === 0) return '0'
  return (selectedFeatures.value / selectedDimensions.value).toFixed(1)
})

const avgDimensionsPerLayer = computed(() => {
  if (totalLayers.value === 0) return '0'
  return (totalDimensions.value / totalLayers.value).toFixed(1)
})

const mostActiveLayers = computed(() => {
  if (!report.value?.layers) return 0
  return report.value.layers.filter(l => {
    const total = l.dimensions?.length || 0
    const active = l.dimensions?.filter(d => d.isSelected === 1).length || 0
    return total > 0 && active === total
  }).length
})

const coverageScore = computed(() => {
  // Weighted average of dimension and feature coverage
  const dimWeight = 0.4
  const featWeight = 0.6
  return Math.round(dimensionPercentage.value * dimWeight + featurePercentage.value * featWeight)
})

// Layer-level stats for charts
const layerStats = computed(() => {
  if (!report.value?.layers) return []
  return report.value.layers.map(l => {
    const totalDims = l.dimensions?.length || 0
    const activeDims = l.dimensions?.filter(d => d.isSelected === 1).length || 0
    const totalFeats = l.dimensions?.reduce((s, d) => s + (d.features?.length || 0), 0) || 0
    const activeFeats = l.dimensions?.reduce((s, d) => s + (d.features?.filter(f => f.selected === 1).length || 0), 0) || 0
    return {
      name: l.layerName?.substring(0, 15) + (l.layerName?.length > 15 ? '...' : ''),
      dimPercentage: totalDims > 0 ? Math.round((activeDims / totalDims) * 100) : 0,
      featPercentage: totalFeats > 0 ? Math.round((activeFeats / totalFeats) * 100) : 0
    }
  })
})

const formattedDate = computed(() => {
  return new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
})

function getSelectedDimensionsCount(layer) {
  return layer.dimensions?.filter(d => d.isSelected === 1).length || 0
}

function getTotalFeaturesCount(layer) {
  return layer.dimensions?.reduce((s, d) => s + (d.features?.length || 0), 0) || 0
}

function getSelectedFeaturesCount(layer) {
  return layer.dimensions?.reduce((s, d) => s + (d.features?.filter(f => f.selected === 1).length || 0), 0) || 0
}

function getDimensionSelectedFeaturesCount(dimension) {
  return dimension.features?.filter(f => f.selected === 1).length || 0
}

function getSelectedFeatures(dimension) {
  return dimension.features?.filter(f => f.selected === 1) || []
}

// Initialize charts
function initCharts() {
  if (!report.value?.layers?.length) return

  // Bar Chart - Progress by layer
  if (barChartRef.value) {
    if (barChart) barChart.destroy()
    barChart = new Chart(barChartRef.value, {
      type: 'bar',
      data: {
        labels: layerStats.value.map(l => l.name),
        datasets: [
          {
            label: 'Dimensiones',
            data: layerStats.value.map(l => l.dimPercentage),
            backgroundColor: '#22c55e',
            borderRadius: 4,
            barPercentage: 0.7,
            categoryPercentage: 0.8
          },
          {
            label: 'Caracteristicas',
            data: layerStats.value.map(l => l.featPercentage),
            backgroundColor: '#3b82f6',
            borderRadius: 4,
            barPercentage: 0.7,
            categoryPercentage: 0.8
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { 
              boxWidth: 12, 
              padding: 20, 
              font: { size: 11, family: 'system-ui' },
              usePointStyle: true,
              pointStyle: 'rectRounded'
            }
          },
          tooltip: {
            callbacks: {
              label: ctx => `${ctx.dataset.label}: ${ctx.raw}%`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: { 
              callback: v => v + '%', 
              font: { size: 10 },
              stepSize: 25
            },
            grid: { color: '#f5f5f5' }
          },
          x: {
            ticks: { font: { size: 10 } },
            grid: { display: false }
          }
        }
      }
    })
  }

  // Donut Chart - Dimensions
  if (donutChartRef.value) {
    if (donutChart) donutChart.destroy()
    donutChart = new Chart(donutChartRef.value, {
      type: 'doughnut',
      data: {
        labels: ['Activas', 'Inactivas'],
        datasets: [{
          data: [selectedDimensions.value, totalDimensions.value - selectedDimensions.value],
          backgroundColor: ['#22c55e', '#e0e0e0'],
          borderWidth: 0,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '75%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => `${ctx.label}: ${ctx.raw}`
            }
          }
        }
      }
    })
  }
}

onMounted(async () => {
  loading.value = true
  try {
    const saved = localStorage.getItem(`taxonomyReport_${formId}`)
    if (saved) {
      report.value = JSON.parse(saved)
      loading.value = false
      await nextTick()
      initCharts()
      return
    }
    const response = await axios.get(`${API_ROOT}/api/taxonomy-forms/form-response/${formId}`).catch(async () => {
      const formRes = await axios.get(`${API_ROOT}/api/taxonomy-forms/${formId}`)
      return { data: { formId, formName: formRes.data.title, layers: [] } }
    })
    report.value = response.data
    if (report.value) localStorage.setItem(`taxonomyReport_${formId}`, JSON.stringify(report.value))
    await nextTick()
    initCharts()
  } catch (err) {
    error.value = err.message || 'Error al cargar el reporte.'
  } finally {
    loading.value = false
  }
})

async function downloadPdf() {
  if (downloading.value || !report.value) return
  downloading.value = true
  try {
    generatePDF({
      formId,
      formName: report.value.formName || report.value.formTitle,
      layers: report.value.layers || []
    })
  } catch (err) {
    alert('Error al generar el PDF.')
  } finally {
    downloading.value = false
  }
}

function generatePDF(data) {
  let totalDims = 0, selDims = 0, totalFeats = 0, selFeats = 0
  data.layers.forEach(l => {
    l.dimensions.forEach(d => {
      totalDims++
      if (d.isSelected === 1) selDims++
      d.features.forEach(f => {
        totalFeats++
        if (f.selected === 1) selFeats++
      })
    })
  })
  const dimPct = totalDims > 0 ? Math.round((selDims / totalDims) * 100) : 0
  const featPct = totalFeats > 0 ? Math.round((selFeats / totalFeats) * 100) : 0

  const content = []

  // Header
  content.push({ text: 'REPORTE DE TAXONOMIA', style: 'label', margin: [0, 0, 0, 4] })
  content.push({ text: data.formName || 'Formulario', style: 'title', margin: [0, 0, 0, 24] })

  // Stats
  content.push({
    columns: [
      { stack: [{ text: data.layers.length, style: 'statNum' }, { text: 'Capas', style: 'statLabel' }], width: '*' },
      { stack: [{ text: `${selDims}/${totalDims}`, style: 'statNum' }, { text: 'Dimensiones', style: 'statLabel' }], width: '*' },
      { stack: [{ text: `${selFeats}/${totalFeats}`, style: 'statNum' }, { text: 'Caracteristicas', style: 'statLabel' }], width: '*' },
      { stack: [{ text: `${featPct}%`, style: 'statNum' }, { text: 'Completado', style: 'statLabel' }], width: '*' }
    ],
    margin: [0, 0, 0, 24]
  })

  // Progress bars
  content.push({
    table: {
      widths: ['20%', '*', '10%'],
      body: [
        [
          { text: 'Dimensiones', style: 'progressLabel', border: [false, false, false, false] },
          { stack: [{ table: { widths: [`${dimPct}%`, `${100-dimPct}%`], body: [[{ text: '', fillColor: '#22c55e', border: [false,false,false,false] }, { text: '', fillColor: '#e5e7eb', border: [false,false,false,false] }]] }, layout: 'noBorders' }], border: [false, false, false, false] },
          { text: `${dimPct}%`, style: 'progressValue', border: [false, false, false, false], alignment: 'right' }
        ],
        [
          { text: 'Caracteristicas', style: 'progressLabel', border: [false, false, false, false] },
          { stack: [{ table: { widths: [`${featPct}%`, `${100-featPct}%`], body: [[{ text: '', fillColor: '#3b82f6', border: [false,false,false,false] }, { text: '', fillColor: '#e5e7eb', border: [false,false,false,false] }]] }, layout: 'noBorders' }], border: [false, false, false, false] },
          { text: `${featPct}%`, style: 'progressValue', border: [false, false, false, false], alignment: 'right' }
        ]
      ]
    },
    layout: 'noBorders',
    margin: [0, 0, 0, 32]
  })

  // Layers
  content.push({ text: 'DETALLE POR CAPAS', style: 'sectionTitle', margin: [0, 0, 0, 16] })

  data.layers.forEach((layer, i) => {
    const lSelDims = layer.dimensions.filter(d => d.isSelected === 1).length
    const lTotalDims = layer.dimensions.length
    const lSelFeats = layer.dimensions.reduce((s, d) => s + d.features.filter(f => f.selected === 1).length, 0)
    const lTotalFeats = layer.dimensions.reduce((s, d) => s + d.features.length, 0)

    content.push({
      columns: [
        { text: String(i + 1), style: 'layerNum', width: 28 },
        {
          stack: [
            { text: layer.layerName, style: 'layerName' },
            { text: `${lSelDims}/${lTotalDims} dimensiones  |  ${lSelFeats}/${lTotalFeats} caracteristicas`, style: 'layerMeta' }
          ],
          width: '*'
        }
      ],
      margin: [0, i > 0 ? 16 : 0, 0, 8]
    })

    const tableBody = [[
      { text: 'Dimension', style: 'tableHeader', fillColor: '#f5f5f5' },
      { text: 'Estado', style: 'tableHeader', fillColor: '#f5f5f5', alignment: 'center' },
      { text: 'Seleccionadas', style: 'tableHeader', fillColor: '#f5f5f5' }
    ]]

    layer.dimensions.forEach(dim => {
      const active = dim.isSelected === 1
      const featNames = dim.features.filter(f => f.selected === 1).map(f => f.name).join(', ') || '-'
      tableBody.push([
        { text: dim.dimensionName, style: 'tableCell' },
        { text: active ? 'Activa' : 'Inactiva', style: active ? 'statusActive' : 'statusInactive', alignment: 'center' },
        { text: featNames, style: 'tableCell', fontSize: 8 }
      ])
    })

    content.push({
      table: { headerRows: 1, widths: ['30%', '15%', '*'], body: tableBody },
      layout: { hLineWidth: () => 0.5, vLineWidth: () => 0, hLineColor: () => '#e5e7eb' },
      margin: [0, 0, 0, 16]
    })
  })

  // Footer
  const dateStr = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
  content.push({ text: `Generado el ${dateStr}`, style: 'footer', margin: [0, 24, 0, 0], alignment: 'center' })

  const docDef = {
    content,
    styles: {
      label: { fontSize: 10, color: '#888', bold: true, letterSpacing: 1 },
      title: { fontSize: 20, bold: true, color: '#1a1a1a' },
      statNum: { fontSize: 24, bold: true, color: '#1a1a1a', alignment: 'center' },
      statLabel: { fontSize: 10, color: '#666', alignment: 'center' },
      progressLabel: { fontSize: 10, color: '#666' },
      progressValue: { fontSize: 10, bold: true, color: '#333' },
      sectionTitle: { fontSize: 11, bold: true, color: '#56005b', letterSpacing: 0.5 },
      layerNum: { fontSize: 14, bold: true, color: '#56005b' },
      layerName: { fontSize: 12, bold: true, color: '#1a1a1a' },
      layerMeta: { fontSize: 9, color: '#888' },
      tableHeader: { fontSize: 9, bold: true, color: '#666' },
      tableCell: { fontSize: 9, color: '#333' },
      statusActive: { fontSize: 9, bold: true, color: '#16a34a' },
      statusInactive: { fontSize: 9, color: '#999' },
      footer: { fontSize: 9, color: '#999', italics: true }
    },
    pageMargins: [40, 40, 40, 40],
    pageSize: 'A4'
  }

  const fileName = (data.formName || 'reporte').toLowerCase().replace(/\s+/g, '_').replace(/[^\w]/g, '')
  pdfMake.createPdf(docDef).download(`${fileName}_reporte.pdf`)
}
</script>

<style scoped>
.report-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 1.5rem;
  min-height: 100vh;
  background: #fafafa;
  box-sizing: border-box;
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
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fef2f2;
  border-radius: 50%;
  font-size: 1.25rem;
  font-weight: 600;
  color: #dc2626;
}

/* Header */
.report-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  border: 1px solid #eee;
}
.header-label {
  display: block;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #56005b;
  margin-bottom: 0.25rem;
}
.header-left h1 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: #56005b;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-primary:hover:not(:disabled) { background: #6d0070; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-outline {
  padding: 0.75rem 1.5rem;
  background: transparent;
  color: #666;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-outline:hover { border-color: #999; color: #333; }

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
  margin-bottom: 1rem;
}
.stat-card {
  background: white;
  border-radius: 10px;
  border: 1px solid #eee;
  padding: 1.25rem 1rem;
  text-align: center;
  position: relative;
  overflow: hidden;
}
.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1;
}
.stat-total {
  font-size: 0.9rem;
  font-weight: 400;
  color: #999;
}
.stat-percent {
  font-size: 1rem;
  font-weight: 500;
}
.stat-label {
  font-size: 0.75rem;
  color: #888;
  margin-top: 0.375rem;
}
.stat-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--color);
}

/* Charts Row */
.charts-row {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.chart-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #eee;
  padding: 1.25rem;
}
.chart-card h3 {
  font-size: 0.7rem;
  font-weight: 600;
  color: #999;
  margin: 0 0 1rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.chart-main {
  min-height: 300px;
}
.chart-wrapper {
  height: 250px;
  position: relative;
}

.chart-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Donut */
.donut-wrapper {
  position: relative;
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.donut-wrapper canvas {
  max-height: 140px;
}
.donut-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}
.donut-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #22c55e;
}
.donut-legend {
  margin-top: 0.75rem;
}
.legend-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0;
  font-size: 0.8rem;
  color: #666;
}
.legend-row .dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}
.legend-row span:nth-child(2) {
  flex: 1;
}
.legend-num {
  font-weight: 600;
  color: #333;
}
.dot.green { background: #22c55e; }
.dot.gray { background: #e0e0e0; }

/* Mini Stats */
.mini-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}
.mini-stat {
  background: white;
  border-radius: 10px;
  border: 1px solid #eee;
  padding: 0.875rem;
  text-align: center;
}
.mini-stat.highlight {
  background: #56005b;
  border-color: #56005b;
}
.mini-stat.highlight .mini-value,
.mini-stat.highlight .mini-label {
  color: white;
}
.mini-value {
  display: block;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1;
}
.mini-label {
  display: block;
  font-size: 0.65rem;
  color: #888;
  margin-top: 0.25rem;
}

/* Layers Section */
.layers-section {
  margin-bottom: 2rem;
}
.section-title {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #56005b;
  margin: 0 0 1rem;
}

.layers-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.layer-card {
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
  border-bottom: 1px solid #eee;
}
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
  border-radius: 8px;
  flex-shrink: 0;
}
.layer-info h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 0.25rem;
}
.layer-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
  color: #888;
}

/* Dimensions Grid */
.dimensions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1px;
  background: #eee;
}
.dimension-item {
  background: white;
  padding: 1rem 1.25rem;
}
.dimension-item.active {
  background: #f8fdf8;
}
.dimension-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.dimension-status {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  flex-shrink: 0;
}
.dimension-item.active .dimension-status {
  background: #dcfce7;
  color: #16a34a;
}
.dimension-item:not(.active) .dimension-status {
  background: #f5f5f5;
  color: #ccc;
}
.dimension-name {
  flex: 1;
  font-size: 0.85rem;
  font-weight: 500;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dimension-count {
  font-size: 0.75rem;
  font-weight: 500;
  color: #999;
  padding: 0.125rem 0.5rem;
  background: #f5f5f5;
  border-radius: 4px;
}
.dimension-item.active .dimension-count {
  background: #dcfce7;
  color: #16a34a;
}

.features-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin-top: 0.75rem;
  padding-left: 28px;
}
.feature-tag {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background: #f0f0f0;
  color: #555;
  font-size: 0.75rem;
  border-radius: 4px;
}

/* Footer */
.report-footer {
  text-align: center;
  padding: 1.5rem;
  color: #999;
  font-size: 0.8rem;
}

/* Responsive */
@media (max-width: 1000px) {
  .charts-row {
    grid-template-columns: 1fr;
  }
  .chart-sidebar {
    flex-direction: row;
  }
  .chart-sidebar .chart-card {
    flex: 1;
  }
  .mini-stats {
    flex: 1;
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 768px) {
  .report-page { padding: 1rem; }
  .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 0.5rem; }
  .chart-sidebar {
    flex-direction: column;
  }
  .dimensions-grid { grid-template-columns: 1fr; }
}

@media (max-width: 600px) {
  .report-header { 
    flex-direction: column; 
    align-items: stretch;
    gap: 1rem;
  }
  .btn-primary { width: 100%; justify-content: center; }
  .stat-card { padding: 0.875rem; }
  .stat-value { font-size: 1.5rem; }
  .chart-main { min-height: 250px; }
  .chart-wrapper { height: 200px; }
  .layer-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  .layer-num {
    width: 28px;
    height: 28px;
    font-size: 0.8rem;
  }
  .layer-info h3 { font-size: 0.9rem; }
  .layer-meta { font-size: 0.7rem; gap: 0.5rem; }
}

@media (max-width: 400px) {
  .stats-grid { grid-template-columns: 1fr 1fr; }
  .mini-stats { grid-template-columns: 1fr 1fr; }
}
</style>
