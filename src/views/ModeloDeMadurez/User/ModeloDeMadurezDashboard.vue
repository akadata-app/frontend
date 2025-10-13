<template>
  <div class="report-container">
    <div v-if="report" class="report-header">
      <div>
        <h6>Reporte del Modelo de Madurez</h6>
        <h1>{{ report.formTitle || '' }}</h1>
      </div>
      <button @click="downloadPdf" class="download-btn">
        Descargar reporte
      </button>
    </div>
  <p v-if="!report">Cargando el reporte…</p>
    <div v-else>
      <!-- Tarjetas de métricas -->
      <div class="metrics-cards">
        <div class="metric-card">
          <div class="metric-info">
            <h3>{{ report.domains.length }}</h3>
            <p>Dominios</p>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-info">
            <h3>{{ totalKdas }}</h3>
            <p>KDA en total</p>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-info">
            <h3>{{ totalResponses }}</h3>
            <p>Respuestas</p>
          </div>
        </div>
      </div>

      <!-- Gráficos del dashboard -->
      <div class="dashboard-grid">
        <div v-for="domain in report.domains" :key="domain.domainId" class="domain-card">
          <div class="domain-header">
            <h2>{{ domain.domainName }}</h2>
            <div class="domain-stats">
              <span class="stat-item">{{ domain.kdas.length }} KDA</span>
              <span class="stat-item">Nivel actual: {{ getAverageActual(domain).toFixed(0) }}</span>
              <span class="stat-item">Nivel deseado: {{ getAverageDesired(domain).toFixed(0) }}</span>
            </div>
          </div>
          <div class="canvas-container">
            <canvas 
              :ref="el => { if (el) canvasRefs[`dashboard-${domain.domainId}`] = el }"
              width="500" 
              height="500"
            ></canvas>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, nextTick, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import Chart from 'chart.js/auto'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

const API_ROOT = (import.meta?.env?.VITE_API_URL || 'http://localhost:8080').replace(/\/+$/, '')
const route = useRoute()
const formId = Number(route.params.formId)
const report = ref(null)
const charts = []
const canvasRefs = ref({})

// Computed properties para las métricas
const totalKdas = computed(() => {
  if (!report.value?.domains) return 0
  return report.value.domains.reduce((sum, domain) => sum + domain.kdas.length, 0)
})

const totalResponses = computed(() => {
  if (!report.value?.totalResponses) return '0'
  return report.value.totalResponses
})

// Funciones para calcular promedios por dominio
function getAverageActual(domain) {
  if (!domain.kdas.length) return 0
  const sum = domain.kdas.reduce((acc, kda) => acc + kda.avgActual, 0)
  return sum / domain.kdas.length
}

function getAverageDesired(domain) {
  if (!domain.kdas.length) return 0
  const sum = domain.kdas.reduce((acc, kda) => acc + kda.avgDesired, 0)
  return sum / domain.kdas.length
}

function createCharts() {
  if (!report.value?.domains) return
  
  console.log('Creating charts with canvas refs...')
  console.log('Available canvas refs:', Object.keys(canvasRefs.value))
  
  report.value.domains.forEach((d) => {
  const refName = `dashboard-${d.domainId}`
    const canvas = canvasRefs.value[refName]
    
    if (!canvas) {
      console.error(`Canvas not found for domain ${d.domainId}`)
      return
    }
    
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      console.error(`Cannot get 2D context for domain ${d.domainId}`)
      return
    }
    
    const labels = d.kdas.map(k => k.kdaName)
    const actual = d.kdas.map(k => k.avgActual)
    const desired = d.kdas.map(k => k.avgDesired)
    
    console.log(`Creating chart for domain ${d.domainName}:`, { labels, actual, desired })
    
    try {
      const chart = new Chart(ctx, {
        type: 'radar',
        data: {
          labels,
          datasets: [
            {
              label: 'Actual',
              data: actual,
              backgroundColor: 'rgba(50, 98, 28, 0.2)',
              borderColor: 'rgba(50, 98, 28, 1)',
              pointBackgroundColor: 'rgba(50, 98, 28, 1)',
              pointBorderColor: 'rgba(50, 98, 28, 1)',
              pointRadius: 4
            },
            {
              label: 'Deseado',
              data: desired,
              backgroundColor: 'rgba(198, 59, 30, 0.2)',
              borderColor: 'rgba(198, 59, 30, 1)',
              pointBackgroundColor: 'rgba(198, 59, 30, 1)',
              pointBorderColor: 'rgba(198, 59, 30, 1)',
              pointRadius: 4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          layout: {
            padding: {
              top: 30,
              right: 30,
              bottom: 30,
              left: 30
            }
          },
          scales: {
            r: { 
              suggestedMin: 0, 
              suggestedMax: 5, 
              ticks: { 
                stepSize: 1,
                font: { size: 12 },
                color: '#666'
              },
              grid: { 
                display: true,
                color: 'rgba(0, 0, 0, 0.1)'
              },
              angleLines: { 
                display: true,
                color: 'rgba(0, 0, 0, 0.1)'
              },
              pointLabels: {
                font: { size: 11, weight: 'bold' },
                color: '#333',
                padding: 15,
                callback: function(value, index) {
                  // Dividir texto largo en múltiples líneas
                  const maxLength = 15;
                  if (value.length <= maxLength) {
                    return value;
                  }
                  
                  const words = value.split(' ');
                  const lines = [];
                  let currentLine = '';
                  
                  words.forEach(word => {
                    if ((currentLine + word).length <= maxLength) {
                      currentLine += (currentLine ? ' ' : '') + word;
                    } else {
                      if (currentLine) lines.push(currentLine);
                      currentLine = word;
                    }
                  });
                  
                  if (currentLine) lines.push(currentLine);
                  return lines;
                }
              }
            }
          },
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                padding: 20,
                font: { size: 12 },
                usePointStyle: true
              }
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleFont: { size: 13 },
              bodyFont: { size: 12 },
              callbacks: {
                label: function(context) {
                  return `${context.dataset.label}: ${context.parsed.r.toFixed(1)}/5`
                }
              }
            }
          }
        }
      })
      charts.push(chart)
      console.log(`Chart created successfully for domain ${d.domainName}`)
    } catch (chartError) {
      console.error(`Error creating chart for domain ${d.domainName}:`, chartError)
    }
  })
}

onMounted(async () => {
  try {
    const { data } = await axios.get(`${API_ROOT}/api/maturity-models/report/${formId}/dashboard`)
    console.log('Dashboard data received:', data)
    report.value = data
  } catch (error) {
    console.error('Error loading dashboard data:', error)
  }
})

// Watcher para crear los gráficos cuando tanto los datos como las refs estén disponibles
watch([report, canvasRefs], async () => {
  if (report.value && Object.keys(canvasRefs.value).length > 0) {
    await nextTick()
    setTimeout(createCharts, 100)
  }
}, { deep: true })

async function downloadPdf() {
  const pdf = new jsPDF('p', 'mm', 'a4')
  let y = 10
  
  // Agregar títulos
  const reportHeader = document.querySelector('.report-header > div')
  if (reportHeader) {
    const headerCanvas = await html2canvas(reportHeader, { scale: 2 })
    const headerImgData = headerCanvas.toDataURL('image/png')
    const headerImgProps = pdf.getImageProperties(headerImgData)
    const headerPdfWidth = pdf.internal.pageSize.getWidth() - 20
    const headerPdfHeight = (headerImgProps.height * headerPdfWidth) / headerImgProps.width
    
    pdf.addImage(headerImgData, 'PNG', 10, y, headerPdfWidth, headerPdfHeight)
    y += headerPdfHeight + 20
  }
  
  // Agregar tarjetas
  const metricCards = document.querySelectorAll('.metric-card')
  for (let i = 0; i < metricCards.length; i++) {
    const metricCanvas = await html2canvas(metricCards[i], { scale: 2 })
    const metricImgData = metricCanvas.toDataURL('image/png')
    const metricImgProps = pdf.getImageProperties(metricImgData)
    const metricPdfWidth = pdf.internal.pageSize.getWidth() - 20
    const metricPdfHeight = (metricImgProps.height * metricPdfWidth) / metricImgProps.width
    
    if (y + metricPdfHeight > pdf.internal.pageSize.getHeight() - 10) {
      pdf.addPage()
      y = 10
    }
    
    pdf.addImage(metricImgData, 'PNG', 10, y, metricPdfWidth, metricPdfHeight)
    y += metricPdfHeight + 10
  }
  
  // Agregar dominios
  const domainCards = document.querySelectorAll('.domain-card')
  for (let i = 0; i < domainCards.length; i++) {
    const domainCanvas = await html2canvas(domainCards[i], { scale: 2 })
    const domainImgData = domainCanvas.toDataURL('image/png')
    const domainImgProps = pdf.getImageProperties(domainImgData)
    const domainPdfWidth = pdf.internal.pageSize.getWidth() - 20
    const domainPdfHeight = (domainImgProps.height * domainPdfWidth) / domainImgProps.width
    
    if (y + domainPdfHeight > pdf.internal.pageSize.getHeight() - 10) {
      pdf.addPage()
      y = 10
    }
    
    pdf.addImage(domainImgData, 'PNG', 10, y, domainPdfWidth, domainPdfHeight)
    y += domainPdfHeight + 20
  }
  
  let cleanTitle = (report.value?.formTitle || '').replace(/[^a-zA-Z0-9-_ ]/g, '').replace(/\s+/g, '_')
  pdf.save(`Reporte-MM${formId}-${cleanTitle}.pdf`)
}
</script>

<style scoped>
.report-container { 
  max-width: 1200px; 
  margin: 2rem auto; 
  padding: 1rem;
}

.report-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  margin-bottom: 2rem;
}

.report-header h1 {
  margin-top: 0;
  font-size: 2rem;
  font-weight: 700;
}

.report-header h6 {
  color: #888888;
  font-size: 1.5rem;
  font-weight: 400;
  margin: 0px;
}

/* Tarjetas de métricas */
.metrics-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-top: 3rem;
  margin-bottom: 3rem;
}

.metric-card {
  background: #fff;
  border-radius: 16px 16px 4px 4px;
  color: #32621c;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  border: 1px solid rgba(0,0,0,0.05);
  border-bottom: 4px solid #32621c;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0,0,0,0.12);
}

.metric-info h3 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  line-height: 1;
}

.metric-info p {
  font-size: 1rem;
  margin: 0.25rem 0 0 0;
  opacity: 0.9;
  font-weight: 500;
}

/* Grid del dashboard */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.domain-card { 
  background: #fff; 
  border-radius: 16px; 
  padding: 1.5rem; 
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  border: 1px solid rgba(0,0,0,0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.domain-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0,0,0,0.12);
}

.domain-header {
  text-align: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
}

.domain-header h2 {
  color: #32621c;
  margin: 0 0 0.75rem 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.domain-stats {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.stat-item {
  background: #f8f9fa;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #555;
  border: 1px solid #e9ecef;
}

.canvas-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 450px;
}

.domain-card canvas {
  max-width: 100%;
  display: block;
}

.download-btn { 
  background: #32621c;
  color: #fff;
  border: none;
  padding: 0.8rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.download-btn:hover {
  background: #2a5318;
  transform: translateY(-2px);
}

/* Responsive */
@media (max-width: 768px) {
  .report-container {
    padding: 0.5rem;
  }
  
  .metrics-cards {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .dashboard-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .domain-stats {
    flex-direction: column;
    gap: 0.5rem;
    align-items: center;
  }
  
  .domain-card {
    padding: 1rem;
  }
  
  .canvas-container {
    min-height: 300px;
  }
}

@media (max-width: 480px) {
  .metric-card {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }
  
  .metric-icon {
    font-size: 2rem;
  }
  
  .metric-info h3 {
    font-size: 1.5rem;
  }
}
</style>
