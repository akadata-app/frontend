<template>
  <!-- Mensaje de éxito después del envío -->
  <div v-if="formSubmitted" class="success-container">
    <div class="success-card">
      <div class="success-icon">✓</div>
      <h1 class="success-title">¡Respuesta enviada!</h1>
      <p class="success-message">Gracias por completar el modelo de madurez. Tus respuestas han sido guardadas correctamente.</p>
      <div class="success-actions">
        <button @click="goToFormsList" class="btn-next">Volver a la lista</button>
        <button v-if="isAdmin" @click="goToReport" class="btn-prev">Ver reporte</button>
      </div>
    </div>
  </div>

  <!-- Formulario -->
  <div v-else-if="domain" class="domain-container">
    <!-- Header con progreso -->
    <div class="form-header">
      <div class="header-top">
        <button class="btn-back" @click="goToFormsList">
          <span class="back-icon">←</span>
          <span>Volver</span>
        </button>
        <div class="progress-info">
          <span class="progress-text">Pregunta {{ currentKdaIndex + 1 }} de {{ domain.kdas.length }}</span>
        </div>
      </div>
      <h1 class="domain-title">{{ domain.name }}</h1>
      <div class="progress-bar-container">
        <div class="progress-bar" :style="{ width: progressPercentage + '%' }"></div>
      </div>
    </div>

    <!-- Bloque de pregunta -->
    <div class="kda-question-block">
      <div class="question-header">
        <span class="question-label">Pregunta</span>
        <h2 class="question-name">{{ currentKda.name }}</h2>
      </div>
      <p class="question-text">{{ currentKda.question }}</p>
    </div>

    <!-- Tabla de niveles horizontal -->
    <div class="kda-table-wrapper">
      <div class="levels-container-horizontal">
        <div 
          v-for="level in 5" 
          :key="'level-'+level"
          class="level-column"
          :class="{ 
            'selected-actual': answers[currentKda.id]?.actual === level,
            'selected-desired': answers[currentKda.id]?.desired === level
          }"
        >
          <div class="level-header">
            <div class="level-number">Nivel {{ level }}</div>
          </div>
          
          <div class="level-description">
            <p class="level-text">{{ currentKda['level' + level] }}</p>
          </div>
          
          <div class="level-radio-section">
            <div class="radio-group-label">Nivel actual</div>
            <label class="radio-label" :class="{ 'selected': answers[currentKda.id]?.actual === level }">
              <input
                type="radio"
                :name="`actual-${currentKda.id}`"
                :value="level"
                v-model="answers[currentKda.id].actual"
                class="radio-input"
              />
              <span class="radio-custom"></span>
            </label>
          </div>
          
          <div class="level-radio-section">
            <div class="radio-group-label">Nivel deseado</div>
            <label class="radio-label" :class="{ 'selected': answers[currentKda.id]?.desired === level }">
              <input
                type="radio"
                :name="`desired-${currentKda.id}`"
                :value="level"
                v-model="answers[currentKda.id].desired"
                class="radio-input"
              />
              <span class="radio-custom"></span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- Descripción adicional -->
    <div v-if="currentKda.description" class="kda-description">
      <div class="description-icon">ℹ️</div>
      <p>{{ currentKda.description }}</p>
    </div>

    <!-- Indicador de completitud -->
    <div v-if="!answeredCurrentKda" class="completion-hint">
      <span class="hint-icon">💡</span>
      <span>Por favor, selecciona el nivel actual y el nivel deseado para continuar</span>
    </div>

    <!-- Navegación -->
    <div class="navigation-buttons">
      <button 
        class="btn-prev" 
        v-if="hasPreviousKda" 
        @click="goToPreviousKda"
      >
        <span class="btn-icon">←</span>
        <span>Pregunta anterior</span>
      </button>
      
      <button 
        class="btn-next" 
        v-if="hasNextKda && answeredCurrentKda" 
        @click="goToNextKda"
        :disabled="!answeredCurrentKda"
      >
        <span>Siguiente pregunta</span>
        <span class="btn-icon">→</span>
      </button>
      
      <button 
        class="btn-submit" 
        v-if="!hasNextKda && allKdasAnswered" 
        @click="goToNextDomainOrSubmit"
        :disabled="!allKdasAnswered"
      >
        <span>Finalizar dominio</span>
        <span class="btn-icon">✓</span>
      </button>
    </div>

    <div v-if="submitMsg" class="submit-message">{{ submitMsg }}</div>
    <canvas id="radarChart" width="400" height="400"></canvas>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MaturityModelService from '@/services/MaturityModelService'
import axios from 'axios'
const API_ROOT = (import.meta?.env?.VITE_API_URL || 'http://localhost:8080').replace(/\/+$/, '')
import Chart from 'chart.js/auto'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

const route = useRoute()
const router = useRouter()
const formId = Number(route.params.formId)
const domainId = Number(route.params.domainId)

const form = ref(null)
const domain = ref(null)
const answers = ref({})
const submitMsg = ref('')
const formSubmitted = ref(false)

// Verificar si el usuario es admin
const isAdmin = computed(() => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  return user.role === 'ADMIN'
})

const currentKdaIndex = ref(0)
const currentKda = computed(() => domain.value?.kdas[currentKdaIndex.value] || {})

const progressPercentage = computed(() => {
  if (!domain.value || !domain.value.kdas.length) return 0
  return ((currentKdaIndex.value + 1) / domain.value.kdas.length) * 100
})

onMounted(async () => {
  const res = await MaturityModelService.getById(formId)
  form.value = res.data
  const currentDomain = form.value.domains.find(d => d.id === domainId)
  domain.value = currentDomain
  currentKdaIndex.value = 0
  // Inicializar respuestas
  currentDomain.kdas.forEach(kda => {
    answers.value[kda.id] = { actual: null, desired: null }
  })
})

watch(
  () => route.params.domainId,
  (newDomainId) => {
    const newDomain = form.value.domains.find(d => d.id === Number(newDomainId))
    domain.value = newDomain
    currentKdaIndex.value = 0
    newDomain.kdas.forEach(kda => {
      if (!answers.value[kda.id]) {
        answers.value[kda.id] = { actual: null, desired: null }
      }
    })
  }
)

const hasPreviousKda = computed(() => currentKdaIndex.value > 0)
const hasNextKda = computed(() => domain.value && currentKdaIndex.value < domain.value.kdas.length - 1)
const answeredCurrentKda = computed(() => {
  const ans = answers.value[currentKda.value.id]
  return ans && ans.actual !== null && ans.desired !== null
})
const allKdasAnswered = computed(() =>
  domain.value && domain.value.kdas.every(kda => {
    const ans = answers.value[kda.id]
    return ans && ans.actual !== null && ans.desired !== null
  })
)

function goToPreviousKda() {
  if (hasPreviousKda.value) currentKdaIndex.value--
}
function goToNextKda() {
  if (hasNextKda.value && answeredCurrentKda.value) currentKdaIndex.value++
}
function goToNextDomainOrSubmit() {
  const currentDomainId = Number(route.params.domainId)
  const domainIndex = form.value.domains.findIndex(d => d.id === currentDomainId)
  if (domain.value && allKdasAnswered.value) {
    if (domainIndex < form.value.domains.length - 1) {
      const nextDomain = form.value.domains[domainIndex + 1]
      currentKdaIndex.value = 0
      router.push(`/modelo-de-madurez/forms/${formId}/domain/${nextDomain.id}`)
    } else {
      submitForm()
    }
  }
}

async function submitForm() {
  const jsonResponse = {
    formTitle: form.value.title,
    domains: form.value.domains.map(domain => ({
      domainId: domain.id,
      domainName: domain.name,
      kdas: domain.kdas.map(kda => ({
        kdaId: kda.id,
        kdaName: kda.name,
        actual: answers.value[kda.id].actual,
        desired: answers.value[kda.id].desired
      }))
    }))
  }

  const dto = {
    maturityModelFormId: formId,
    jsonResponse
  }

  try {
    await axios.post(`${API_ROOT}/api/maturity-models/form-response`, dto)
    formSubmitted.value = true
    // Redirigir automáticamente al reporte y marcar para descarga automática
    setTimeout(() => {
      // Guardar en localStorage que se debe descargar automáticamente
      localStorage.setItem(`autoDownloadReport_${formId}`, 'true')
      goToReport()
    }, 2000) // Esperar 2 segundos para que el usuario vea el mensaje de éxito
  } catch (e) {
    submitMsg.value = 'Error al enviar el formulario.'
  }
}

function goToFormsList() {
  router.push('/modelo-de-madurez/forms')
}

function goToReport() {
  router.push(`/modelo-de-madurez/forms/${formId}/reporte`)
}
</script>

<style scoped>
.domain-container {
  max-width: 1400px;
  margin: 1rem auto;
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  padding: 1.5rem;
  font-family: 'Roboto', sans-serif;
}

/* Header con progreso */
.form-header {
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #e5e7eb;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.btn-back {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  border: 1px solid #d1d5db;
  color: #4b5563;
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.2s ease;
  font-family: 'Roboto', sans-serif;
}

.btn-back:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.back-icon {
  font-size: 1rem;
}

.progress-info {
  font-size: 0.8rem;
  color: #6b7280;
  font-weight: 500;
}

.domain-title {
  color: #56005b;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.progress-bar-container {
  width: 100%;
  height: 6px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 0.5rem;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #56005b, #7a007f);
  border-radius: 4px;
  transition: width 0.3s ease;
}

/* Bloque de pregunta */
.kda-question-block {
  background: #f9fafb;
  border-radius: 8px;
  padding: 1rem 1.25rem;
  margin-bottom: 1rem;
  border: 1px solid #e5e7eb;
}

.question-header {
  margin-bottom: 0.5rem;
}

.question-label {
  display: inline-block;
  background: #56005b;
  color: #ffffff;
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
}

.question-name {
  color: #56005b;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0.25rem 0 0 0;
  line-height: 1.3;
}

.question-text {
  color: #4b5563;
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0;
}

/* Tabla de niveles horizontal */
.kda-table-wrapper {
  margin: 1rem 0;
  border-radius: 8px;
  overflow-x: auto;
  border: 1px solid #e5e7eb;
  background: #ffffff;
}

.levels-container-horizontal {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0;
  min-width: 1000px;
}

.level-column {
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e5e7eb;
  transition: all 0.2s ease;
  background: #ffffff;
}

.level-column:last-child {
  border-right: none;
}

.level-column:hover {
  background: #f9fafb;
}

.level-column.selected-actual {
  background: #eff6ff;
  border-top: 3px solid #3b82f6;
}

.level-column.selected-desired {
  background: #f0fdf4;
  border-top: 3px solid #10b981;
}

.level-header {
  background: #56005b;
  color: #ffffff;
  padding: 0.6rem 0.5rem;
  text-align: center;
  font-weight: 600;
  font-size: 0.85rem;
}

.level-number {
  font-weight: 600;
  font-size: 0.9rem;
}

.level-description {
  padding: 0.75rem 0.6rem;
  height: 90px;
  display: flex;
  align-items: flex-start;
  border-bottom: 1px solid #e5e7eb;
  overflow-y: auto;
}

.level-text {
  color: #374151;
  font-size: 0.75rem;
  line-height: 1.4;
  text-align: center;
  margin: 0;
}

.level-radio-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 0.6rem;
  border-bottom: 1px solid #e5e7eb;
}

.level-radio-section:last-child {
  border-bottom: none;
}

.radio-group-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.radio-label {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  width: 40px;
  height: 40px;
}

.radio-input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  width: 100%;
  height: 100%;
  margin: 0;
}

.radio-custom {
  position: relative;
  width: 22px;
  height: 22px;
  border: 2px solid #d1d5db;
  border-radius: 50%;
  background: #ffffff;
  transition: all 0.2s ease;
}

.radio-label:hover .radio-custom {
  border-color: #56005b;
  transform: scale(1.15);
  box-shadow: 0 0 0 4px rgba(86, 0, 91, 0.1);
}

.radio-input:checked + .radio-custom {
  background: #56005b;
  border-color: #56005b;
}

.radio-input:checked + .radio-custom::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ffffff;
}

.radio-label.selected .radio-custom {
  box-shadow: 0 0 0 4px rgba(86, 0, 91, 0.15);
}

/* Descripción adicional */
.kda-description {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  background: #f0f7ed;
  border: 1px solid #d4e1d5;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  margin-top: 0.75rem;
  color: #065f46;
  font-size: 0.8rem;
  line-height: 1.5;
}

.description-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.kda-description p {
  margin: 0;
}

/* Indicador de completitud */
.completion-hint {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #fff3cd;
  border: 1px solid #ffc700;
  border-radius: 6px;
  padding: 0.6rem 0.75rem;
  margin-top: 0.75rem;
  color: #856404;
  font-size: 0.8rem;
}

.hint-icon {
  font-size: 1.1rem;
}

/* Navegación */
.navigation-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.btn-prev,
.btn-next,
.btn-submit {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Roboto', sans-serif;
}

.btn-prev {
  background: #f3f4f6;
  color: #4b5563;
}

.btn-prev:hover:not(:disabled) {
  background: #e5e7eb;
}

.btn-next {
  background: #ffc700;
  color: #1c1c1c;
  margin-left: auto;
}

.btn-next:hover:not(:disabled) {
  background: #e2a100;
}

.btn-submit {
  background: #56005b;
  color: #ffffff;
  margin-left: auto;
}

.btn-submit:hover:not(:disabled) {
  background: #7a007f;
}

.btn-prev:disabled,
.btn-next:disabled,
.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-icon {
  font-size: 1.1rem;
}

.submit-message {
  margin-top: 1.5rem;
  padding: 0.875rem 1rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  color: #dc2626;
  text-align: center;
  font-weight: 500;
}

canvas#radarChart {
  position: absolute;
  left: -9999px;
  top: -9999px;
}

/* Estilos para la pantalla de éxito */
.success-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
  padding: 2rem;
}

.success-card {
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  padding: 3rem 2rem;
  text-align: center;
  max-width: 500px;
  width: 100%;
}

.success-icon {
  width: 60px;
  height: 60px;
  background: #6d8e5a;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  font-size: 2rem;
  color: #fff;
  font-weight: bold;
}

.success-title {
  color: #56005b;
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.success-message {
  color: #6b7280;
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.success-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

/* Responsive */
@media (max-width: 1200px) {
  .levels-container-horizontal {
    grid-template-columns: repeat(3, 1fr);
    min-width: 750px;
  }
}

@media (max-width: 768px) {
  .domain-container {
    padding: 1.5rem;
    margin: 1rem;
  }

  .domain-title {
    font-size: 1.75rem;
  }

  .levels-container-horizontal {
    grid-template-columns: repeat(2, 1fr);
    min-width: 500px;
  }

  .level-description {
    padding: 0.6rem 0.5rem;
    height: 80px;
  }

  .level-text {
    font-size: 0.8rem;
  }

  .level-radio-section {
    padding: 1rem 0.75rem;
  }

  .radio-group-label {
    font-size: 0.7rem;
  }

  .navigation-buttons {
    flex-direction: column;
  }

  .btn-next,
  .btn-submit {
    margin-left: 0;
    width: 100%;
    justify-content: center;
  }

  .btn-prev {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .levels-container-horizontal {
    grid-template-columns: 1fr;
    min-width: 280px;
  }

  .level-column {
    border-right: none;
    border-bottom: 1px solid #e5e7eb;
  }

  .level-column:last-child {
    border-bottom: none;
  }
}
</style>
