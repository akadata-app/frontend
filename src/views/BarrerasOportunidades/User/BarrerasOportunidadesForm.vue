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
      <button class="btn-outline" @click="goBack">Volver</button>
    </div>

    <!-- Empty -->
    <div v-else-if="!form || !form.categorias || form.categorias.length === 0" class="state-container">
      <div class="state-icon">?</div>
      <h2>Formulario vacio</h2>
      <p>No hay categorias configuradas.</p>
      <button class="btn-outline" @click="goBack">Volver</button>
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
          <h1>{{ form.nombre }}</h1>
          <p v-if="form.info?.descripcion">{{ form.info.descripcion }}</p>
        </div>
      </header>

      <!-- Progress -->
      <div class="progress-container">
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
        </div>
        <span class="progress-label">{{ answeredQuestions }} / {{ totalQuestions }}</span>
      </div>

      <!-- Categories -->
      <main class="form-content">
        <section
          v-for="(category, catIndex) in form.categorias"
          :key="category.id || catIndex"
          class="category"
        >
          <div class="category-header">
            <span class="category-badge" :class="category.type?.toLowerCase()">
              {{ category.type === 'BARRIER' ? 'Barrera' : 'Oportunidad' }}
            </span>
            <h2>{{ category.name }}</h2>
            <p v-if="category.description">{{ category.description }}</p>
          </div>

          <div class="questions-grid">
            <article
              v-for="(question, qIndex) in category.questions"
              :key="question.id || qIndex"
              class="question"
            >
              <div class="question-label">
                <span class="question-num">{{ catIndex + 1 }}.{{ qIndex + 1 }}</span>
                <p>{{ question.questionText }}</p>
              </div>
              <div class="scale">
                <span class="scale-label">1</span>
                <div class="scale-options">
                  <label
                    v-for="option in question.options"
                    :key="option.id || option.value"
                    class="scale-option"
                    :class="{ active: responses[question.id] === option.value }"
                  >
                    <input
                      type="radio"
                      :name="`q-${question.id}`"
                      :value="option.value"
                      v-model="responses[question.id]"
                    />
                    <span class="option-dot"></span>
                  </label>
                </div>
                <span class="scale-label">5</span>
              </div>
            </article>
          </div>
        </section>
      </main>

      <!-- Actions -->
      <footer class="form-footer">
        <button
          class="btn-primary"
          @click="submitForm"
          :disabled="saving || !isFormComplete"
        >
          {{ saving ? 'Guardando...' : 'Finalizar' }}
        </button>
      </footer>

      <!-- Success Toast -->
      <div v-if="showSuccessPopup" class="toast success">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        <span>{{ successMessage }}</span>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import Api from '@/services/BarriersOpportunitiesService';

const router = useRouter();
const route = useRoute();

const form = ref(null);
const loading = ref(true);
const error = ref(null);
const saving = ref(false);
const responses = ref({});
const showSuccessPopup = ref(false);
const successMessage = ref('');

function normalize(dto) {
  return {
    id: dto?.id ?? null,
    nombre: dto?.title ?? dto?.name ?? 'Formulario Barreras y Oportunidades',
    categorias: (dto?.categories || []).map((cat, i) => ({
      id: cat?.id ?? null,
      name: cat?.name ?? '',
      description: cat?.description ?? '',
      type: cat?.type ?? 'BARRIER',
      orderIndex: cat?.orderIndex ?? i,
      questions: (cat?.questions || []).map((q, j) => ({
        id: q?.id ?? null,
        questionText: q?.questionText ?? '',
        orderIndex: q?.orderIndex ?? j,
        options: (q?.options || []).map((opt) => ({
          id: opt?.id ?? null,
          value: opt?.value ?? 0
        })).sort((a, b) => (a.value || 0) - (b.value || 0))
      })).sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
    })).sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0)),
    info: {
      descripcion: dto?.description ?? '',
      dirigido: dto?.target ?? '',
      resultado: dto?.result ?? ''
    }
  };
}

const totalQuestions = computed(() => {
  if (!form.value?.categorias) return 0;
  return form.value.categorias.reduce((t, c) => t + (c.questions?.length || 0), 0);
});

const answeredQuestions = computed(() => {
  return Object.keys(responses.value).filter(k => responses.value[k] != null).length;
});

const progressPercentage = computed(() => {
  if (totalQuestions.value === 0) return 0;
  return Math.round((answeredQuestions.value / totalQuestions.value) * 100);
});

const isFormComplete = computed(() => {
  return answeredQuestions.value === totalQuestions.value && totalQuestions.value > 0;
});

async function fetchForm() {
  loading.value = true;
  error.value = null;
  try {
    const formId = route.params.id;
    if (!formId) throw new Error('ID no proporcionado');
    const { data } = await Api.getFormById(formId);
    form.value = normalize(data);
    if (form.value?.categorias) {
      form.value.categorias.forEach(cat => {
        cat.questions?.forEach(q => {
          if (q.id) responses.value[q.id] = null;
        });
      });
    }
  } catch (err) {
    error.value = err.response?.data?.message || err.message || 'Error al cargar.';
  } finally {
    loading.value = false;
  }
}

async function submitForm() {
  if (!isFormComplete.value) return;
  const token = localStorage.getItem('jwtToken');
  if (!token) {
    if (confirm('Debes iniciar sesion. Ir al login?')) router.push('/login');
    return;
  }
  saving.value = true;
  try {
    const formId = route.params.id;
    const jsonResponse = {
      formId: parseInt(formId),
      responses: Object.keys(responses.value).map(qId => ({
        questionId: parseInt(qId),
        optionValue: responses.value[qId]
      }))
    };
    const { data: saved } = await Api.saveFormResponse(formId, { formId: parseInt(formId), jsonResponse, user: null });
    successMessage.value = 'Respuestas guardadas correctamente';
    showSuccessPopup.value = true;
    setTimeout(() => {
      showSuccessPopup.value = false;
      router.push({ name: 'BarrerasOportunidadesReport', params: { formId, responseId: saved.id } });
    }, 2000);
  } catch (err) {
    if (err.response?.status === 401) {
      if (confirm('Sesion expirada. Ir al login?')) router.push('/login');
    } else {
      alert(err.response?.data || 'Error al guardar.');
    }
  } finally {
    saving.value = false;
  }
}

function goBack() {
  router.push('/barreras-oportunidades/forms');
}

onMounted(fetchForm);
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
.progress-container {
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
.progress-label {
  font-size: 0.8rem;
  font-weight: 500;
  color: #666;
  min-width: 50px;
  text-align: right;
}

/* Content */
.form-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Category */
.category {
  background: white;
  border-radius: 12px;
  border: 1px solid #eee;
  overflow: hidden;
}
.category-header {
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
}
.category-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-radius: 100px;
  margin-bottom: 0.75rem;
}
.category-badge.barrier { background: #fef2f2; color: #b91c1c; }
.category-badge.opportunity { background: #f0fdf4; color: #15803d; }
.category-header h2 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 0.25rem;
}
.category-header p {
  font-size: 0.85rem;
  color: #666;
  margin: 0;
}

/* Questions */
.questions-grid {
  display: flex;
  flex-direction: column;
}
.question {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 2rem;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f5f5f5;
}
.question:last-child { border-bottom: none; }

.question-label {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}
.question-num {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 24px;
  background: #56005b;
  color: white;
  font-size: 0.7rem;
  font-weight: 600;
  border-radius: 6px;
  flex-shrink: 0;
}
.question-label p {
  font-size: 0.9rem;
  color: #333;
  margin: 0;
  line-height: 1.5;
}

/* Scale */
.scale {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.scale-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: #999;
  width: 16px;
  text-align: center;
}
.scale-options {
  display: flex;
  gap: 0.5rem;
}
.scale-option {
  position: relative;
  cursor: pointer;
}
.scale-option input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}
.option-dot {
  display: block;
  width: 32px;
  height: 32px;
  border: 2px solid #ddd;
  border-radius: 50%;
  background: white;
  transition: all 0.2s;
}
.scale-option:hover .option-dot {
  border-color: #56005b;
  transform: scale(1.1);
}
.scale-option.active .option-dot {
  border-color: #56005b;
  background: #56005b;
  box-shadow: inset 0 0 0 4px white;
}

/* Footer */
.form-footer {
  margin-top: 1.5rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  border: 1px solid #eee;
  text-align: center;
}
.btn-primary {
  padding: 0.875rem 2.5rem;
  background: #56005b;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-primary:hover:not(:disabled) {
  background: #6d0070;
  transform: translateY(-1px);
}
.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
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

/* Toast */
.toast {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: white;
  border-radius: 10px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.12);
  animation: slideUp 0.3s ease;
}
.toast.success { border-left: 3px solid #22c55e; }
.toast svg { color: #22c55e; flex-shrink: 0; }
.toast span { font-size: 0.9rem; color: #333; }
@keyframes slideUp {
  from { transform: translateX(-50%) translateY(100%); opacity: 0; }
  to { transform: translateX(-50%) translateY(0); opacity: 1; }
}

/* Responsive */
@media (max-width: 768px) {
  .form-page { padding: 1rem; }
  .question {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  .scale { justify-content: center; }
  .option-dot { width: 36px; height: 36px; }
}
</style>
