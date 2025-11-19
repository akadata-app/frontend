<template>
  <div class="page-container">
    <div class="card-container">
      <div class="page-header">
        <h1 class="title">Modelos de Madurez</h1>
        <p class="subtitle">Selecciona un modelo de madurez para comenzar tu evaluación</p>
      </div>

      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Cargando modelos...</p>
      </div>
      
      <div v-if="error" class="error-state">
        <span class="error-icon">⚠</span>
        <p>{{ error }}</p>
      </div>

      <div v-if="!loading && !error && forms.length === 0" class="empty-state">
        <span class="empty-icon">📊</span>
        <p>No hay modelos de madurez disponibles en este momento</p>
      </div>

      <div v-if="!loading && !error && forms.length > 0" class="forms-list">
        <div
          v-for="form in forms"
          :key="form.id"
          class="form-item"
          @click="goToForm(form.id)"
        >
          <div class="form-icon">🪜</div>
          <div class="form-content">
            <h2>{{ form.title }}</h2>
            <p class="description">{{ form.description || 'Sin descripción' }}</p>
            <div class="form-meta">
              <span class="meta-item"><strong>Dirigido a:</strong> {{ form.target }}</span>
              <span class="meta-item"><strong>Resultado:</strong> {{ form.result }}</span>
            </div>
          </div>
          <div class="form-actions">
            <a class="btn-view-report" @click.stop="goToReport(form.id)" title="Ver reporte">
              Ver reporte
            </a>
          </div>
          <div class="form-arrow">→</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import MaturityModelService from '@/services/MaturityModelService'
import { useRouter } from 'vue-router'
import { getUserRole } from '@/services/authService'
import axios from 'axios'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

const API_ROOT = (import.meta?.env?.VITE_API_URL || 'http://localhost:8080').replace(/\/+$/, '')

const forms = ref([])
const loading = ref(true)
const error = ref(null)
const router = useRouter()
const userRole = ref(null)
const isAdmin = computed(() => (userRole.value || '').includes('ADMIN'))
const downloadingReports = ref({})

async function fetchForms() {
  try {
    const response = await MaturityModelService.list()
    forms.value = response.data
  } catch {
    error.value = "No se pudo cargar los modelos de madurez."
  } finally {
    loading.value = false
  }
}

function goToForm(id) {
  // Redirige al primer dominio del formulario
  const form = forms.value.find(f => f.id === id)
  if (form && form.domains && form.domains.length > 0) {
    router.push(`/modelo-de-madurez/forms/${id}/domain/${form.domains[0].id}`)
  }
}

function goToReport(id) {
  router.push(`/modelo-de-madurez/forms/${id}/reporte`)
}

async function downloadReport(formId) {
  if (downloadingReports.value[formId]) return
  
  downloadingReports.value[formId] = true
  
  try {
    // Obtener los datos del reporte desde el backend
    const { data: report } = await axios.get(`${API_ROOT}/api/maturity-models/report/${formId}/dashboard`)
    
    // Crear un elemento temporal para renderizar el reporte
    const tempContainer = document.createElement('div')
    tempContainer.style.position = 'absolute'
    tempContainer.style.left = '-9999px'
    tempContainer.style.top = '-9999px'
    tempContainer.style.width = '1200px'
    tempContainer.style.background = '#ffffff'
    tempContainer.style.padding = '2rem'
    document.body.appendChild(tempContainer)
    
    // Generar HTML del reporte
    let reportHTML = `
      <div style="max-width: 1200px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 2px solid #e5e7eb;">
          <h6 style="color: #888888; font-size: 0.9rem; font-weight: 400; margin: 0 0 0.5rem 0; text-transform: uppercase; letter-spacing: 1px;">Reporte del Modelo de Madurez</h6>
          <h1 style="color: #56005b; font-size: 2.5rem; font-weight: 700; margin: 0;">${report.formTitle || 'Sin título'}</h1>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-bottom: 3rem;">
          <div style="background: #fff; border-radius: 16px 16px 4px 4px; color: #32621c; padding: 1.5rem; border-bottom: 4px solid #32621c;">
            <h3 style="font-size: 2rem; font-weight: 700; margin: 0;">${report.domains.length}</h3>
            <p style="font-size: 1rem; margin: 0.25rem 0 0 0;">Dominios</p>
          </div>
          <div style="background: #fff; border-radius: 16px 16px 4px 4px; color: #32621c; padding: 1.5rem; border-bottom: 4px solid #32621c;">
            <h3 style="font-size: 2rem; font-weight: 700; margin: 0;">${report.domains.reduce((sum, d) => sum + d.kdas.length, 0)}</h3>
            <p style="font-size: 1rem; margin: 0.25rem 0 0 0;">KDA en total</p>
          </div>
          <div style="background: #fff; border-radius: 16px 16px 4px 4px; color: #32621c; padding: 1.5rem; border-bottom: 4px solid #32621c;">
            <h3 style="font-size: 2rem; font-weight: 700; margin: 0;">${report.totalResponses || 0}</h3>
            <p style="font-size: 1rem; margin: 0.25rem 0 0 0;">Respuestas</p>
          </div>
        </div>
    `
    
    // Agregar información de cada dominio
    report.domains.forEach(domain => {
      const avgActual = domain.kdas.length > 0 
        ? (domain.kdas.reduce((acc, kda) => acc + kda.avgActual, 0) / domain.kdas.length).toFixed(0)
        : 0
      const avgDesired = domain.kdas.length > 0
        ? (domain.kdas.reduce((acc, kda) => acc + kda.avgDesired, 0) / domain.kdas.length).toFixed(0)
        : 0
      
      reportHTML += `
        <div style="background: #fff; border-radius: 16px; padding: 1.5rem; margin-bottom: 2rem; border: 1px solid rgba(0,0,0,0.05);">
          <div style="text-align: center; margin-bottom: 1.5rem; padding-bottom: 1rem;">
            <h2 style="color: #32621c; margin: 0 0 0.75rem 0; font-size: 1.5rem; font-weight: 700;">${domain.domainName}</h2>
            <div style="display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap;">
              <span style="background: #f8f9fa; padding: 0.4rem 0.8rem; border-radius: 20px; font-size: 0.85rem; font-weight: 600; color: #555;">${domain.kdas.length} KDA</span>
              <span style="background: #f8f9fa; padding: 0.4rem 0.8rem; border-radius: 20px; font-size: 0.85rem; font-weight: 600; color: #555;">Nivel actual: ${avgActual}</span>
              <span style="background: #f8f9fa; padding: 0.4rem 0.8rem; border-radius: 20px; font-size: 0.85rem; font-weight: 600; color: #555;">Nivel deseado: ${avgDesired}</span>
            </div>
          </div>
          <div style="margin-top: 1rem;">
            <p style="font-weight: 600; margin-bottom: 0.5rem;">Detalles por KDA:</p>
            <ul style="list-style: none; padding: 0;">
              ${domain.kdas.map(kda => `
                <li style="padding: 0.5rem 0; border-bottom: 1px solid #e5e7eb;">
                  <strong>${kda.kdaName}</strong><br>
                  <span style="color: #666; font-size: 0.9rem;">Actual: ${kda.avgActual.toFixed(1)} / Deseado: ${kda.avgDesired.toFixed(1)}</span>
                </li>
              `).join('')}
            </ul>
          </div>
        </div>
      `
    })
    
    reportHTML += '</div>'
    tempContainer.innerHTML = reportHTML
    
    // Esperar a que se renderice
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Generar PDF
    const pdf = new jsPDF('p', 'mm', 'a4')
    const canvas = await html2canvas(tempContainer, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    })
    
    const imgData = canvas.toDataURL('image/png')
    const imgProps = pdf.getImageProperties(imgData)
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
    
    // Limpiar
    document.body.removeChild(tempContainer)
    
    // Guardar PDF
    const cleanTitle = (report.formTitle || 'Reporte').replace(/[^a-zA-Z0-9-_ ]/g, '').replace(/\s+/g, '_')
    pdf.save(`Reporte-MM${formId}-${cleanTitle}.pdf`)
    
  } catch (error) {
    console.error('Error al descargar el reporte:', error)
    alert('Error al generar el PDF. Por favor, intente nuevamente.')
  } finally {
    downloadingReports.value[formId] = false
  }
}

onMounted(() => {
  userRole.value = getUserRole()
  fetchForms()
})
</script>

<style scoped>
.page-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: calc(100vh - 200px);
  background: #ffffff;
  padding: 2rem;
  font-family: 'Roboto', sans-serif;
}

.card-container {
  background: #ffffff;
  padding: 2.5rem;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  max-width: 900px;
  width: 100%;
}

.page-header {
  text-align: center;
  margin-bottom: 2.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #e5e7eb;
}

.title {
  color: #56005b;
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #6b7280;
  font-size: 1rem;
  margin: 0;
}

.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  text-align: center;
  gap: 1rem;
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

.loading-state p {
  color: #6b7280;
  font-size: 1rem;
}

.error-state {
  color: #dc2626;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  padding: 1.5rem;
}

.error-icon {
  font-size: 2rem;
}

.error-state p {
  margin: 0;
  font-weight: 500;
}

.empty-state {
  color: #6b7280;
}

.empty-icon {
  font-size: 3rem;
}

.empty-state p {
  font-size: 1.1rem;
  margin: 0;
}

.forms-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-item {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  background: #ffffff;
  border-radius: 6px;
  padding: 1.5rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  border: 1px solid #e5e7eb;
  cursor: pointer;
}

.form-item:hover {
  border-color: #56005b;
  box-shadow: 0 2px 8px rgba(86, 0, 91, 0.1);
}

.form-icon {
  font-size: 2rem;
  flex-shrink: 0;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border-radius: 6px;
}

.form-content {
  flex: 1;
}

.form-item h2 {
  font-size: 1.3rem;
  color: #56005b;
  margin: 0 0 0.5rem 0;
  font-weight: 600;
}

.description {
  font-size: 0.95rem;
  color: #6b7280;
  margin: 0 0 0.75rem 0;
  line-height: 1.6;
}

.form-meta {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  font-size: 0.85rem;
}

.meta-item {
  color: #6b7280;
}

.meta-item strong {
  color: #374151;
  font-weight: 500;
}

.form-arrow {
  font-size: 1.25rem;
  color: #56005b;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.form-item:hover .form-arrow {
  transform: translateX(4px);
}

.form-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-shrink: 0;
}

.btn-view-report {
  color: #56005b;
  text-decoration: underline;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.2s ease;
  background: none;
  border: none;
  padding: 0;
}

.btn-view-report:hover {
  color: #7a007f;
  text-decoration: underline;
}

.btn-download {
  background: #56005b;
  color: #fff;
  border: none;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.2s ease;
}

.btn-download:hover:not(:disabled) {
  background: #7a007f;
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(86, 0, 91, 0.3);
}

.btn-download:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Responsive */
@media (max-width: 768px) {
  .page-container {
    padding: 1rem;
  }
  
  .card-container {
    padding: 2rem 1.5rem;
  }
  
  .title {
    font-size: 1.8rem;
  }
  
  .form-item {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .form-content {
    width: 100%;
  }
  
  .form-meta {
    justify-content: center;
  }
  
  .form-actions {
    width: 100%;
    justify-content: center;
  }
  
  .form-arrow {
    display: none;
  }
}
</style>
