<template>
  <div class="page-container">
    <div class="card-container">
      <h1 class="title">Modelos de Madurez</h1>

      <div v-if="loading" class="loading">Loading...</div>
      <div v-if="error" class="error">{{ error }}</div>

      <div v-if="!loading && !error" class="forms-list">
        <div
          v-for="form in forms"
          :key="form.id"
          class="form-item"
          @click="goToForm(form.id)"
        >
          <h2>{{ form.title }}</h2>
          <p class="description">{{ form.description || 'Sin descripción' }}</p>
          <p class="target"><strong>Dirigido a:</strong> {{ form.target }}</p>
          <p class="result"><strong>Resultado:</strong> {{ form.result }}</p>

          <!-- Acciones de administrador: botón de reporte -->
          <div v-if="isAdmin" class="admin-actions">
            <button class="btn-admin" @click.stop="goToReport(form.id)">Ver reporte</button>
            <button 
              class="btn-download" 
              @click.stop="downloadReport(form.id)"
              :disabled="downloadingReports[form.id]"
            >
              <span v-if="downloadingReports[form.id]">Generando...</span>
              <span v-else>📥 Descargar reporte</span>
            </button>
          </div>
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
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem;">
          <div>
            <h6 style="color: #888888; font-size: 1.5rem; font-weight: 400; margin: 0;">Reporte del Modelo de Madurez</h6>
            <h1 style="margin-top: 0; font-size: 2rem; font-weight: 700;">${report.formTitle || ''}</h1>
          </div>
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
  align-items: center;
  min-height: 100vh;
  background: #f7f7fa;
  padding: 20px;
}

.card-container {
  background: #fff;
  padding: 32px 28px;
  border-radius: 18px;
  box-shadow: 0 4px 18px rgba(0,0,0,0.08);
  max-width: 900px;
  width: 100%;
}

.title {
  color: #222;
  text-align: center;
  font-size: 2rem;
  margin-bottom: 24px;
  font-weight: 600;
}

.forms-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-item {
  background: #fafbfc;
  border-radius: 12px;
  padding: 18px 20px;
  cursor: pointer;
  transition: box-shadow 0.2s, transform 0.2s;
  border: 1px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
}

.form-item:hover {
  transform: translateY(-2px) scale(1.01);
  box-shadow: 0 6px 18px rgba(0,0,0,0.08);
  border-color: #bdbdf7;
}

.form-item h2 {
  font-size: 1.1rem;
  color: #222;
  margin-bottom: 6px;
  font-weight: 500;
}

.form-item p {
  font-size: 0.95rem;
  color: #555;
}

.description {
  margin-top: 8px;
  font-size: 0.9rem;
  color: #444;
}

.loading {
  text-align: center;
  color: #bbb;
  font-size: 1.1rem;
  margin: 30px 0;
}

.error {
  text-align: center;
  color: #d9534f;
  background: #fff0f0;
  border: 1px solid #ffd6d6;
  border-radius: 8px;
  padding: 12px 0;
  margin: 30px 0;
}
.admin-actions {
  margin-top: 10px;
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  flex-wrap: wrap;
}

.btn-admin {
  .btn-admin,
  .btn-download{
  background: #32621c;
  color: #fff;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 400;
  transition: all 0.2s ease;
}

.btn-admin:hover {
  background: #2a5318;
  transform: translateY(-2px);
}
</style>
