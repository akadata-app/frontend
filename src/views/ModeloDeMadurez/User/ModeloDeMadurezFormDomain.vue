<template>
  <!-- Success -->
  <div v-if="formSubmitted" class="result-page">
    <div class="result-card">
      <div class="result-icon success">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
      <h1>Formulario completado</h1>
      <p>Tus respuestas han sido guardadas. Seras redirigido al reporte.</p>
      <div class="result-actions">
        <button class="btn-outline" @click="goToFormsList">Volver a la lista</button>
        <button v-if="isAdmin" class="btn-primary" @click="goToReport">Ver reporte</button>
      </div>
    </div>
  </div>

  <!-- Form -->
  <div v-else-if="domain" class="form-page">
    <!-- Header -->
    <header class="form-header">
      <button class="btn-icon" @click="goToFormsList">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </button>
      <div class="header-content">
        <span class="header-label">Dominio</span>
        <h1>{{ domain.name }}</h1>
      </div>
      <div class="header-progress">
        <span>{{ currentKdaIndex + 1 }} / {{ domain.kdas.length }}</span>
      </div>
    </header>

    <!-- Progress -->
    <div class="progress-bar">
      <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
    </div>

    <!-- Question Card -->
    <main class="question-container">
      <div class="question-card">
        <div class="question-header">
          <span class="question-badge">Pregunta {{ currentKdaIndex + 1 }}</span>
          <h2>{{ currentKda.name }}</h2>
          <p v-if="currentKda.question">{{ currentKda.question }}</p>
        </div>

        <!-- Levels Grid -->
        <div class="levels-grid">
          <div
            v-for="level in 5"
            :key="level"
            class="level-card"
            :class="{
              'selected-actual': answers[currentKda.id]?.actual === level,
              'selected-desired': answers[currentKda.id]?.desired === level
            }"
          >
            <div class="level-header">
              <span class="level-num">{{ level }}</span>
            </div>
            <div class="level-body">
              <p class="level-desc">{{ currentKda['level' + level] || 'Sin descripcion' }}</p>
            </div>
            <div class="level-footer">
              <div class="radio-group">
                <label class="radio-item">
                  <input
                    type="radio"
                    :name="`actual-${currentKda.id}`"
                    :value="level"
                    v-model="answers[currentKda.id].actual"
                  />
                  <span class="radio-dot actual"></span>
                  <span class="radio-label">Actual</span>
                </label>
                <label class="radio-item">
                  <input
                    type="radio"
                    :name="`desired-${currentKda.id}`"
                    :value="level"
                    v-model="answers[currentKda.id].desired"
                  />
                  <span class="radio-dot desired"></span>
                  <span class="radio-label">Deseado</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Hint -->
        <div v-if="!answeredCurrentKda" class="hint">
          Selecciona el nivel actual y el nivel deseado para continuar
        </div>
      </div>
    </main>

    <!-- Navigation -->
    <footer class="nav-footer">
      <button
        class="btn-outline"
        v-if="hasPreviousKda"
        @click="goToPreviousKda"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Anterior
      </button>
      <div class="nav-spacer"></div>
      <button
        class="btn-primary"
        v-if="hasNextKda"
        @click="goToNextKda"
        :disabled="!answeredCurrentKda"
      >
        Siguiente
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </button>
      <button
        class="btn-primary"
        v-if="!hasNextKda && allKdasAnswered"
        @click="goToNextDomainOrSubmit"
      >
        Finalizar
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </button>
    </footer>

    <div v-if="submitMsg" class="error-toast">{{ submitMsg }}</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MaturityModelService from '@/services/MaturityModelService'
import axios from 'axios'
const API_ROOT = (import.meta?.env?.VITE_API_URL || 'http://localhost:8080').replace(/\/+$/, '')

const route = useRoute()
const router = useRouter()
const formId = Number(route.params.formId)
const domainId = Number(route.params.domainId)

const form = ref(null)
const domain = ref(null)
const answers = ref({})
const submitMsg = ref('')
const formSubmitted = ref(false)

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
  currentDomain.kdas.forEach(kda => {
    answers.value[kda.id] = { actual: null, desired: null }
  })
})

watch(() => route.params.domainId, (newDomainId) => {
  const newDomain = form.value.domains.find(d => d.id === Number(newDomainId))
  domain.value = newDomain
  currentKdaIndex.value = 0
  newDomain.kdas.forEach(kda => {
    if (!answers.value[kda.id]) {
      answers.value[kda.id] = { actual: null, desired: null }
    }
  })
})

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
    domains: form.value.domains.map(d => ({
      domainId: d.id,
      domainName: d.name,
      kdas: d.kdas.map(kda => ({
        kdaId: kda.id,
        kdaName: kda.name,
        actual: answers.value[kda.id].actual,
        desired: answers.value[kda.id].desired
      }))
    }))
  }
  const dto = { maturityModelFormId: formId, jsonResponse }
  try {
    await axios.post(`${API_ROOT}/api/maturity-models/form-response`, dto)
    formSubmitted.value = true
    setTimeout(() => {
      localStorage.setItem(`autoDownloadReport_${formId}`, 'true')
      goToReport()
    }, 2000)
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
.form-page {
  min-height: 100vh;
  background: #fafafa;
  display: flex;
  flex-direction: column;
}

/* Result Page */
.result-page {
  min-height: 100vh;
  background: #fafafa;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}
.result-card {
  background: white;
  border-radius: 16px;
  border: 1px solid #eee;
  padding: 3rem 2rem;
  text-align: center;
  max-width: 420px;
  width: 100%;
}
.result-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}
.result-icon.success { background: #f0fdf4; color: #22c55e; }
.result-card h1 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 0.5rem;
}
.result-card p {
  font-size: 0.9rem;
  color: #666;
  margin: 0 0 1.5rem;
  line-height: 1.5;
}
.result-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
}

/* Header */
.form-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 2rem;
  background: white;
  border-bottom: 1px solid #eee;
}
.btn-icon {
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
}
.btn-icon:hover { background: #eee; color: #333; }

.header-content {
  flex: 1;
}
.header-label {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #999;
}
.header-content h1 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0.25rem 0 0;
}
.header-progress {
  font-size: 0.85rem;
  font-weight: 500;
  color: #666;
  padding: 0.5rem 1rem;
  background: #f5f5f5;
  border-radius: 100px;
}

/* Progress */
.progress-bar {
  height: 3px;
  background: #eee;
}
.progress-fill {
  height: 100%;
  background: #56005b;
  transition: width 0.3s ease;
}

/* Question Container */
.question-container {
  flex: 1;
  padding: 2rem;
  display: flex;
  justify-content: center;
}
.question-card {
  background: white;
  border-radius: 16px;
  border: 1px solid #eee;
  padding: 2rem;
  width: 100%;
  max-width: 1200px;
}
.question-header {
  text-align: center;
  margin-bottom: 2rem;
}
.question-badge {
  display: inline-block;
  padding: 0.375rem 1rem;
  background: #56005b;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 100px;
  margin-bottom: 1rem;
}
.question-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 0.5rem;
}
.question-header p {
  font-size: 0.9rem;
  color: #666;
  margin: 0;
  line-height: 1.5;
  max-width: 600px;
  margin: 0 auto;
}

/* Levels Grid */
.levels-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1rem;
}
.level-card {
  display: flex;
  flex-direction: column;
  border: 1px solid #eee;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s;
  background: white;
}
.level-card:hover {
  border-color: #ddd;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}
.level-card.selected-actual {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59,130,246,0.1);
}
.level-card.selected-desired {
  border-color: #22c55e;
  box-shadow: 0 0 0 2px rgba(34,197,94,0.1);
}

.level-header {
  padding: 0.75rem;
  background: #f8f8f8;
  border-bottom: 1px solid #eee;
  text-align: center;
}
.level-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 50%;
  font-size: 0.85rem;
  font-weight: 600;
  color: #333;
}
.level-card.selected-actual .level-num {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}
.level-card.selected-desired .level-num {
  background: #22c55e;
  border-color: #22c55e;
  color: white;
}

.level-body {
  flex: 1;
  padding: 1rem;
  min-height: 100px;
}
.level-desc {
  font-size: 0.8rem;
  color: #555;
  line-height: 1.5;
  margin: 0;
  text-align: center;
}

.level-footer {
  padding: 1rem;
  border-top: 1px solid #eee;
  background: #fafafa;
}
.radio-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.radio-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}
.radio-item input {
  position: absolute;
  opacity: 0;
}
.radio-dot {
  width: 18px;
  height: 18px;
  border: 2px solid #ddd;
  border-radius: 50%;
  transition: all 0.2s;
  position: relative;
}
.radio-dot.actual { border-color: #93c5fd; }
.radio-dot.desired { border-color: #86efac; }
.radio-item:hover .radio-dot { transform: scale(1.1); }
.radio-item input:checked + .radio-dot.actual {
  background: #3b82f6;
  border-color: #3b82f6;
}
.radio-item input:checked + .radio-dot.desired {
  background: #22c55e;
  border-color: #22c55e;
}
.radio-item input:checked + .radio-dot::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 6px;
  height: 6px;
  background: white;
  border-radius: 50%;
}
.radio-label {
  font-size: 0.75rem;
  color: #666;
}

/* Hint */
.hint {
  margin-top: 1.5rem;
  padding: 1rem;
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 8px;
  text-align: center;
  font-size: 0.85rem;
  color: #92400e;
}

/* Navigation Footer */
.nav-footer {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 2rem;
  background: white;
  border-top: 1px solid #eee;
}
.nav-spacer { flex: 1; }

.btn-outline {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: white;
  color: #666;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-outline:hover { border-color: #999; color: #333; }

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
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
.btn-primary:disabled { background: #ccc; cursor: not-allowed; }

.error-toast {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  padding: 1rem 1.5rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #b91c1c;
  font-size: 0.9rem;
}

/* Responsive */
@media (max-width: 1024px) {
  .levels-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 768px) {
  .form-header { padding: 1rem; }
  .question-container { padding: 1rem; }
  .question-card { padding: 1.5rem; }
  .levels-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .nav-footer { padding: 1rem; }
}
@media (max-width: 480px) {
  .levels-grid {
    grid-template-columns: 1fr;
  }
  .level-body { min-height: auto; }
}
</style>
