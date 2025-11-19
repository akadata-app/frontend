<template>
  <div class="report-container">
    <div class="page-header">
      <div class="header-content">
        <div class="breadcrumb">Modelo de Madurez</div>
        <h1 class="page-title">{{ report?.formTitle || 'Cargando...' }}</h1>
        <p v-if="!isAdmin" class="user-info-badge">
          Mis respuestas
        </p>
      </div>
      <div class="header-actions">
        <button @click="downloadPdf" class="btn-download" :disabled="downloading">
          <span v-if="downloading">Descargando...</span>
          <span v-else>Descargar reporte</span>
        </button>
      </div>
    </div>

    <div v-if="isAdmin" class="filters-section">
      <div class="filters-container">
        <div class="filter-group">
          <label class="filter-label">Organización:</label>
          <select v-model="selectedOrganization" @change="onOrgChange" class="filter-select">
            <option value="">Todas las organizaciones</option>
            <option v-for="org in organizations" :key="org" :value="org">{{ org }}</option>
          </select>
        </div>
        <div class="filter-group">
          <label class="filter-checkbox">
            <input type="checkbox" v-model="perUserMode" @change="onOrgChange" />
            <span>Mostrar por usuario</span>
          </label>
        </div>
      </div>
    </div>
  <p v-if="!report">Cargando el reporte…</p>
    <div v-else>
      <div v-if="isAdmin && perUserMode">
        <h3>Respuestas por usuario</h3>
        <div class="user-list">
          <div v-for="u in userList" :key="u.userId" class="user-card">
            <div class="user-info">
              <strong>{{ u.userName || 'Sin nombre' }}</strong>
              <div class="muted">{{ u.organizationName || 'Sin organización' }}</div>
            </div>
            <div>
              <button @click="loadDashboard(u.userId)">Ver reporte</button>
            </div>
          </div>
        </div>
      </div>
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
import MaturityModelService from '@/services/MaturityModelService'
import { getUserRole } from '@/services/authService'
import Chart from 'chart.js/auto'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

const API_ROOT = (import.meta?.env?.VITE_API_URL || 'http://localhost:8080').replace(/\/+$/, '')
const route = useRoute()
const formId = Number(route.params.formId)
const report = ref(null)
const charts = []
const canvasRefs = ref({})
const downloading = ref(false)
const organizations = ref([])
const selectedOrganization = ref('')
const perUserMode = ref(false)
const userList = ref([])
const userRole = ref(getUserRole())
const isAdmin = computed(() => userRole.value === 'ADMIN')
const selectedUserName = ref(null)

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
    if (isAdmin.value) {
      // Admin: cargar dashboard general sin filtros
      const { data } = await MaturityModelService.getDashboard(formId)
      console.log('Dashboard data received:', data)
      report.value = data

      // Cargar organizaciones usando endpoint eficiente
      const { data: orgs } = await MaturityModelService.getOrganizations(formId)
      organizations.value = orgs

      // Cargar usuarios usando endpoint eficiente
      const { data: users } = await MaturityModelService.getUsers(formId)
      userList.value = users
    } else {
      // Usuario normal: cargar solo sus propias respuestas (el backend filtrará automáticamente por el usuario autenticado)
      const { data } = await MaturityModelService.getDashboard(formId, { userOnly: true })
      console.log('Dashboard data received (user only):', data)
      report.value = data
    }
  } catch (error) {
    console.error('Error loading dashboard data:', error)
  }
})

function onOrgChange() {
  // Limpiar el nombre de usuario seleccionado cuando cambian los filtros
  selectedUserName.value = null
  // Si estamos en modo por usuario, recargar listado filtrado, sino recargar dashboard
  if (perUserMode.value) {
    loadPerUserList()
  } else {
    loadDashboard()
  }
}

async function loadDashboard(userId = null) {
  try {
    const params = {}
    if (selectedOrganization.value) params.organization = selectedOrganization.value
    if (userId) {
      params.userId = userId
      // Buscar el nombre del usuario en la lista
      const user = userList.value.find(u => u.userId === userId)
      if (user) {
        // Guardar el nombre del usuario para mostrarlo en el PDF
        selectedUserName.value = user.userName || 'Sin nombre'
      }
    } else {
      selectedUserName.value = null
    }
    const { data } = await MaturityModelService.getDashboard(formId, params)
    report.value = data
    // limpiar charts and refs for re-render
    canvasRefs.value = {}
    charts.length = 0
  } catch (err) {
    console.error('Error cargando dashboard filtrado:', err)
  }
}

async function loadPerUserList() {
  try {
    const org = selectedOrganization.value || undefined
    const { data } = await MaturityModelService.getUsers(formId, org)
    userList.value = data
  } catch (err) {
    console.error('Error cargando lista por usuario:', err)
  }
}

// Watcher para crear los gráficos cuando tanto los datos como las refs estén disponibles
watch([report, canvasRefs], async () => {
  if (report.value && Object.keys(canvasRefs.value).length > 0) {
    await nextTick()
    setTimeout(async () => {
      createCharts()
      
      // Verificar si se debe descargar automáticamente el PDF
      const autoDownload = localStorage.getItem(`autoDownloadReport_${formId}`)
      if (autoDownload === 'true') {
        // Esperar a que los gráficos se rendericen completamente antes de descargar
        // Los gráficos de Chart.js necesitan tiempo para renderizarse
        setTimeout(async () => {
          try {
            await downloadPdf()
            // Limpiar la marca después de descargar exitosamente
            localStorage.removeItem(`autoDownloadReport_${formId}`)
          } catch (error) {
            console.error('Error en descarga automática:', error)
            // Limpiar la marca incluso si hay error para evitar intentos infinitos
            localStorage.removeItem(`autoDownloadReport_${formId}`)
          }
        }, 3000) // Esperar 3 segundos para asegurar que los gráficos estén completamente renderizados
      }
    }, 100)
  }
}, { deep: true })

async function downloadPdf() {
  if (downloading.value || !report.value) return
  
  downloading.value = true
  
  try {
    const pdf = new jsPDF('p', 'mm', 'a4')
    let y = 15
    
    // Crear encabezado del reporte con título y filtros
    const pageWidth = pdf.internal.pageSize.getWidth()
    
    // Subtítulo "Modelo de Madurez"
    pdf.setFontSize(9)
    pdf.setTextColor(136, 136, 136)
    pdf.text('Modelo de Madurez', pageWidth / 2, y, { align: 'center' })
    y += 8
    
    // Título del formulario
    pdf.setFontSize(20)
    pdf.setTextColor(86, 0, 91)
    pdf.setFont(undefined, 'bold')
    const title = report.value?.formTitle || 'Sin título'
    pdf.text(title, pageWidth / 2, y, { align: 'center' })
    y += 10
    
    // Información de filtros aplicados
    pdf.setFontSize(10)
    pdf.setTextColor(107, 114, 128)
    pdf.setFont(undefined, 'normal')
    
    if (!isAdmin.value) {
      // Usuario normal - mostrar "Mis respuestas"
      pdf.text('Mis respuestas', pageWidth / 2, y, { align: 'center' })
      y += 6
    } else if (selectedOrganization.value || selectedUserName.value) {
      // Admin con filtros aplicados
      if (selectedOrganization.value) {
        pdf.text(`Organización: ${selectedOrganization.value}`, pageWidth / 2, y, { align: 'center' })
        y += 6
      }
      if (selectedUserName.value) {
        pdf.text(`Usuario: ${selectedUserName.value}`, pageWidth / 2, y, { align: 'center' })
        y += 6
      }
    }
    
    // Línea separadora
    pdf.setDrawColor(229, 231, 235)
    pdf.setLineWidth(0.5)
    pdf.line(10, y, pageWidth - 10, y)
    y += 10
    
    // Agregar tarjetas de métricas
    const metricCards = document.querySelectorAll('.metric-card')
    for (let i = 0; i < metricCards.length; i++) {
      const metricCanvas = await html2canvas(metricCards[i], { 
        scale: 2,
        useCORS: true,
        logging: false
      })
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
    
    // Agregar dominios con gráficos
    const domainCards = document.querySelectorAll('.domain-card')
    for (let i = 0; i < domainCards.length; i++) {
      const domainCanvas = await html2canvas(domainCards[i], { 
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      })
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
    
    // Generar nombre del archivo
    const cleanTitle = (report.value?.formTitle || 'Reporte').replace(/[^a-zA-Z0-9-_ ]/g, '').replace(/\s+/g, '_')
    const fileName = `Reporte-MM${formId}-${cleanTitle}.pdf`
    
    // Guardar el PDF
    pdf.save(fileName)
  } catch (error) {
    console.error('Error al generar el PDF:', error)
    alert('Error al generar el PDF. Por favor, intente nuevamente.')
  } finally {
    downloading.value = false
  }
}
</script>

<style scoped>
.report-container { 
  max-width: 1400px; 
  margin: 0 auto; 
  padding: 2rem;
  background: #ffffff;
  min-height: 100vh;
  font-family: 'Roboto', sans-serif;
}

.page-header {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 2rem;
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
  flex-wrap: wrap;
}

.header-content {
  flex: 1;
  min-width: 300px;
}

.breadcrumb {
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.page-title {
  color: #56005b;
  font-size: 2rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  line-height: 1.2;
}

.user-info-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #56005b 0%, #7a007f 100%);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  margin-top: 0.75rem;
  box-shadow: 0 2px 8px rgba(86, 0, 91, 0.2);
}

.badge-icon {
  font-size: 1rem;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}

.filters-section {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.filters-container {
  display: flex;
  gap: 2rem;
  align-items: center;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.filter-label {
  color: #374151;
  font-weight: 500;
  font-size: 0.9rem;
}

.filter-select {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  color: #374151;
  font-size: 0.9rem;
  cursor: pointer;
  transition: border-color 0.2s;
  min-width: 200px;
}

.filter-select:hover {
  border-color: #56005b;
}

.filter-select:focus {
  outline: none;
  border-color: #56005b;
  box-shadow: 0 0 0 3px rgba(86, 0, 91, 0.1);
}

.filter-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
  color: #374151;
}

.filter-checkbox input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #56005b;
}

/* Tarjetas de métricas */
.metrics-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.metric-card {
  background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%);
  border-radius: 8px;
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  border: 1px solid #e5e7eb;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.metric-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(86, 0, 91, 0.15);
  border-color: #56005b;
}

.metric-info h3 {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  line-height: 1;
  color: #56005b;
}

.metric-info p {
  font-size: 0.95rem;
  margin: 0;
  color: #6b7280;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Grid del dashboard */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(550px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.domain-card { 
  background: #ffffff; 
  border-radius: 8px; 
  padding: 2rem; 
  border: 1px solid #e5e7eb;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.domain-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(86, 0, 91, 0.15);
  border-color: #56005b;
}

.domain-header {
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #f3f4f6;
}

.domain-header h2 {
  color: #56005b;
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.domain-stats {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.stat-item {
  background: #f9fafb;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  color: #374151;
  border: 1px solid #e5e7eb;
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

.btn-download { 
  background: #56005b;
  color: #fff;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
  box-shadow: 0 2px 4px rgba(86, 0, 91, 0.2);
}

.btn-download:hover:not(:disabled) {
  background: #7a007f;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(86, 0, 91, 0.3);
}

.btn-download:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
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

.user-list { 
  display: grid; 
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); 
  gap: 1.25rem; 
  margin-bottom: 2rem;
}

.user-card { 
  background: #ffffff; 
  border-radius: 8px; 
  padding: 1.25rem; 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  border: 1px solid #e5e7eb;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.user-card:hover {
  border-color: #56005b;
  box-shadow: 0 2px 8px rgba(86, 0, 91, 0.1);
}

.user-info {
  flex: 1;
}

.user-card .muted { 
  color: #6b7280; 
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.user-card button { 
  background: #56005b; 
  color: #fff; 
  border: none; 
  padding: 0.5rem 1rem; 
  border-radius: 6px; 
  cursor: pointer;
  font-weight: 500;
  font-size: 0.85rem;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.user-card button:hover {
  background: #7a007f;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(86, 0, 91, 0.3);
}
</style>
