<template>
  <div class="report-container">
    <!-- Loading state -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Cargando reporte...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon-wrapper">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>
      <p>{{ error }}</p>
      <button class="btn-secondary" @click="goBack">Volver</button>
    </div>

    <!-- Report content -->
    <template v-else-if="reportData">
      <!-- Header -->
      <div class="report-header">
        <div class="header-content">
          <h1 class="report-title">Reporte de Barreras y Oportunidades</h1>
          <p class="report-subtitle">{{ formTitle }}</p>
        </div>
        <div class="header-meta">
          <span class="report-date">{{ formattedDate }}</span>
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="summary-section">
        <div class="summary-card barriers">
          <div class="card-icon barriers-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="9" y1="9" x2="15" y2="15"></line>
              <line x1="15" y1="9" x2="9" y2="15"></line>
            </svg>
          </div>
          <div class="card-content">
            <span class="card-label">Barreras</span>
            <span class="card-value">{{ barriersAverage.toFixed(1) }}</span>
            <span class="card-sublabel">Promedio</span>
          </div>
        </div>
        
        <div class="summary-card opportunities">
          <div class="card-icon opportunities-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
              <line x1="9" y1="9" x2="9.01" y2="9"></line>
              <line x1="15" y1="9" x2="15.01" y2="9"></line>
            </svg>
          </div>
          <div class="card-content">
            <span class="card-label">Oportunidades</span>
            <span class="card-value">{{ opportunitiesAverage.toFixed(1) }}</span>
            <span class="card-sublabel">Promedio</span>
          </div>
        </div>
        
        <div class="summary-card total">
          <div class="card-icon total-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
          </div>
          <div class="card-content">
            <span class="card-label">Promedio General</span>
            <span class="card-value">{{ totalAverage.toFixed(1) }}</span>
            <span class="card-sublabel">de 5.0</span>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="charts-section">
        <div class="chart-card">
          <div class="chart-header">
            <h3 class="chart-title">Puntuación por Categoría</h3>
          </div>
          <div class="chart-container">
            <canvas ref="barChartCanvas"></canvas>
          </div>
        </div>

        <div class="chart-card">
          <div class="chart-header">
            <h3 class="chart-title">Perfil de Evaluación</h3>
          </div>
          <div class="chart-container">
            <canvas ref="radarChartCanvas"></canvas>
          </div>
        </div>
      </div>

      <!-- Detailed Results -->
      <div class="details-section">
        <div class="section-header">
          <h2 class="section-title">Detalle por Categoría</h2>
        </div>
        
        <div v-for="category in categoryResults" :key="category.name" class="category-detail">
          <div class="category-header-detail">
            <div class="category-info">
              <span class="category-badge" :class="category.type.toLowerCase()">
                {{ category.type === 'BARRIER' ? 'Barrera' : 'Oportunidad' }}
              </span>
              <h3 class="category-name-detail">{{ category.name }}</h3>
            </div>
            <div class="category-score-badge" :class="getScoreClass(category.average)">
              {{ category.average.toFixed(1) }}
            </div>
          </div>
          
          <div class="questions-detail">
            <div v-for="question in category.questions" :key="question.id" class="question-detail">
              <p class="question-text-detail">{{ question.text }}</p>
              <div class="score-bar-container">
                <div class="score-bar-bg">
                  <div class="score-bar-fill" :class="getScoreClass(question.score)" :style="{ width: (question.score / 5 * 100) + '%' }"></div>
                </div>
                <span class="score-value" :class="getScoreClass(question.score)">{{ question.score }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recommendations -->
      <div class="recommendations-section">
        <div class="section-header">
          <h2 class="section-title">Recomendaciones</h2>
        </div>
        <div class="recommendations-grid">
          <div class="recommendation-card improvement" v-if="lowestCategories.length > 0">
            <div class="recommendation-header">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              <h4>Áreas de Mejora</h4>
            </div>
            <ul>
              <li v-for="cat in lowestCategories" :key="cat.name">
                <span class="rec-name">{{ cat.name }}</span>
                <span class="rec-score">{{ cat.average.toFixed(1) }}/5</span>
              </li>
            </ul>
          </div>
          <div class="recommendation-card strengths" v-if="highestCategories.length > 0">
            <div class="recommendation-header">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <h4>Fortalezas</h4>
            </div>
            <ul>
              <li v-for="cat in highestCategories" :key="cat.name">
                <span class="rec-name">{{ cat.name }}</span>
                <span class="rec-score">{{ cat.average.toFixed(1) }}/5</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="report-actions">
        <button class="btn-secondary" @click="goBack">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Volver
        </button>
        <button class="btn-primary" @click="printReport">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 6 2 18 2 18 9"></polyline>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
            <rect x="6" y="14" width="12" height="8"></rect>
          </svg>
          Imprimir Reporte
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Chart, registerables } from 'chart.js';
import Api from '@/services/BarriersOpportunitiesService';

Chart.register(...registerables);

const router = useRouter();
const route = useRoute();

const loading = ref(true);
const error = ref(null);
const reportData = ref(null);
const formData = ref(null);
const formTitle = ref('');

const barChartCanvas = ref(null);
const radarChartCanvas = ref(null);

let barChart = null;
let radarChart = null;

const formattedDate = computed(() => {
  return new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

const categoryResults = computed(() => {
  if (!reportData.value || !formData.value) return [];
  
  const responses = reportData.value.jsonResponse?.responses || [];
  const responseMap = {};
  responses.forEach(r => {
    responseMap[r.questionId] = r.optionValue;
  });

  return (formData.value.categories || []).map(cat => {
    const questions = (cat.questions || []).map(q => ({
      id: q.id,
      text: q.questionText,
      score: responseMap[q.id] || 0
    }));
    
    const average = questions.length > 0 
      ? questions.reduce((sum, q) => sum + q.score, 0) / questions.length 
      : 0;

    return {
      name: cat.name,
      type: cat.type,
      questions,
      average
    };
  });
});

const barriersAverage = computed(() => {
  const barriers = categoryResults.value.filter(c => c.type === 'BARRIER');
  if (barriers.length === 0) return 0;
  return barriers.reduce((sum, c) => sum + c.average, 0) / barriers.length;
});

const opportunitiesAverage = computed(() => {
  const opportunities = categoryResults.value.filter(c => c.type === 'OPPORTUNITY');
  if (opportunities.length === 0) return 0;
  return opportunities.reduce((sum, c) => sum + c.average, 0) / opportunities.length;
});

const totalAverage = computed(() => {
  if (categoryResults.value.length === 0) return 0;
  return categoryResults.value.reduce((sum, c) => sum + c.average, 0) / categoryResults.value.length;
});

const lowestCategories = computed(() => {
  return [...categoryResults.value]
    .sort((a, b) => a.average - b.average)
    .slice(0, 3)
    .filter(c => c.average < 3.5);
});

const highestCategories = computed(() => {
  return [...categoryResults.value]
    .sort((a, b) => b.average - a.average)
    .slice(0, 3)
    .filter(c => c.average >= 3.5);
});

function getScoreColor(score) {
  if (score >= 4) return '#4caf50';
  if (score >= 3) return '#ff9800';
  return '#f44336';
}

function getScoreClass(score) {
  if (score >= 4) return 'score-high';
  if (score >= 3) return 'score-medium';
  return 'score-low';
}

async function loadReport() {
  loading.value = true;
  error.value = null;
  
  try {
    const responseId = route.params.responseId;
    const formId = route.params.formId;

    // Cargar la respuesta
    const { data: response } = await Api.getResponseById(responseId);
    reportData.value = response;

    // Cargar el formulario para tener los nombres de las categorías y preguntas
    const { data: form } = await Api.getFormById(formId);
    formData.value = form;
    formTitle.value = form.title || 'Formulario de Barreras y Oportunidades';

    await nextTick();
    createCharts();
  } catch (err) {
    console.error('Error al cargar reporte:', err);
    error.value = 'No se pudo cargar el reporte. Por favor, intenta nuevamente.';
  } finally {
    loading.value = false;
  }
}

function createCharts() {
  if (!categoryResults.value.length) return;

  // Bar Chart
  if (barChartCanvas.value) {
    const ctx = barChartCanvas.value.getContext('2d');
    
    if (barChart) barChart.destroy();
    
    barChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: categoryResults.value.map(c => c.name),
        datasets: [{
          label: 'Puntuación',
          data: categoryResults.value.map(c => c.average),
          backgroundColor: categoryResults.value.map(c => 
            c.type === 'BARRIER' ? 'rgba(244, 67, 54, 0.7)' : 'rgba(76, 175, 80, 0.7)'
          ),
          borderColor: categoryResults.value.map(c => 
            c.type === 'BARRIER' ? 'rgb(244, 67, 54)' : 'rgb(76, 175, 80)'
          ),
          borderWidth: 2,
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 5,
            ticks: {
              stepSize: 1
            }
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
  }

  // Radar Chart
  if (radarChartCanvas.value) {
    const ctx = radarChartCanvas.value.getContext('2d');
    
    if (radarChart) radarChart.destroy();

    const barriers = categoryResults.value.filter(c => c.type === 'BARRIER');
    const opportunities = categoryResults.value.filter(c => c.type === 'OPPORTUNITY');
    
    radarChart = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: categoryResults.value.map(c => c.name),
        datasets: [{
          label: 'Tu Perfil',
          data: categoryResults.value.map(c => c.average),
          fill: true,
          backgroundColor: 'rgba(86, 0, 91, 0.2)',
          borderColor: 'rgb(86, 0, 91)',
          pointBackgroundColor: 'rgb(86, 0, 91)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgb(86, 0, 91)'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            beginAtZero: true,
            max: 5,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    });
  }
}

function printReport() {
  window.print();
}

function goBack() {
  router.push('/barreras-oportunidades/forms');
}

onMounted(() => {
  loadReport();
});
</script>

<style scoped>
/* Variables */
:root {
  --primary-purple: #56005b;
  --primary-purple-light: #7b4870;
  --primary-green: #2e7d32;
  --primary-green-light: #4caf50;
  --bg-light: #f8f9fc;
  --bg-card: #ffffff;
  --text-primary: #1a1f36;
  --text-secondary: #6b7280;
  --border-color: #e5e7eb;
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.08);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.08);
  --shadow-lg: 0 8px 24px rgba(0,0,0,0.12);
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
}

.report-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Roboto', sans-serif;
  background: linear-gradient(135deg, #f5f0f6 0%, #f0f7f0 100%);
  min-height: 100vh;
}

/* Loading & Error States */
.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6rem 2rem;
  text-align: center;
  gap: 1.5rem;
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.loading-spinner {
  width: 56px;
  height: 56px;
  border: 4px solid #f3e5f5;
  border-top-color: var(--primary-purple);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-icon-wrapper {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff5f5;
  border-radius: 50%;
  color: #e53e3e;
}

.error-state p {
  color: var(--text-secondary);
  font-size: 1.1rem;
}

/* Report Header */
.report-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding: 2rem;
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  border-left: 4px solid var(--primary-purple);
}

.header-content {
  flex: 1;
}

.report-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.02em;
}

.report-subtitle {
  font-size: 1rem;
  color: var(--text-secondary);
  margin: 0;
}

.header-meta {
  text-align: right;
}

.report-date {
  font-size: 0.875rem;
  color: var(--text-secondary);
  background: #f8f9fc;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-sm);
}

/* Summary Section */
.summary-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.5rem;
  border-radius: var(--radius-md);
  background: white;
  box-shadow: var(--shadow-sm);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.card-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  flex-shrink: 0;
}

.barriers-icon {
  background: linear-gradient(135deg, #fef2f2, #fecaca);
  color: #dc2626;
}

.opportunities-icon {
  background: linear-gradient(135deg, #f0fdf4, #bbf7d0);
  color: #16a34a;
}

.total-icon {
  background: linear-gradient(135deg, #faf5ff, #e9d5ff);
  color: var(--primary-purple);
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.card-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.card-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;
}

.card-sublabel {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

/* Charts Section */
.charts-section {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.chart-card {
  background: white;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.chart-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.chart-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.chart-container {
  height: 300px;
  padding: 1.5rem;
  position: relative;
}

/* Details Section */
.details-section {
  margin-bottom: 2rem;
}

.section-header {
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.section-title::before {
  content: '';
  width: 4px;
  height: 24px;
  background: var(--primary-purple);
  border-radius: 2px;
}

.category-detail {
  background: white;
  border-radius: var(--radius-md);
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
}

.category-header-detail {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.category-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.category-badge {
  padding: 0.375rem 0.875rem;
  border-radius: 100px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.category-badge.barrier {
  background: #fef2f2;
  color: #dc2626;
}

.category-badge.opportunity {
  background: #f0fdf4;
  color: #16a34a;
}

.category-name-detail {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.category-score-badge {
  padding: 0.5rem 1rem;
  border-radius: var(--radius-sm);
  font-weight: 700;
  font-size: 1rem;
}

.category-score-badge.score-high {
  background: #f0fdf4;
  color: #16a34a;
}

.category-score-badge.score-medium {
  background: #fffbeb;
  color: #d97706;
}

.category-score-badge.score-low {
  background: #fef2f2;
  color: #dc2626;
}

/* Questions Detail */
.questions-detail {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.question-detail {
  padding: 1rem 1.25rem;
  background: #f8f9fc;
  border-radius: var(--radius-sm);
  transition: background 0.2s ease;
}

.question-detail:hover {
  background: #f1f5f9;
}

.question-text-detail {
  margin: 0 0 0.75rem 0;
  color: var(--text-primary);
  font-size: 0.9rem;
  line-height: 1.5;
}

.score-bar-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.score-bar-bg {
  flex: 1;
  max-width: 200px;
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
}

.score-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.4s ease;
}

.score-bar-fill.score-high {
  background: linear-gradient(90deg, #22c55e, #16a34a);
}

.score-bar-fill.score-medium {
  background: linear-gradient(90deg, #fbbf24, #d97706);
}

.score-bar-fill.score-low {
  background: linear-gradient(90deg, #f87171, #dc2626);
}

.score-value {
  font-weight: 600;
  font-size: 0.875rem;
  min-width: 28px;
  text-align: center;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.score-value.score-high {
  background: #f0fdf4;
  color: #16a34a;
}

.score-value.score-medium {
  background: #fffbeb;
  color: #d97706;
}

.score-value.score-low {
  background: #fef2f2;
  color: #dc2626;
}

/* Recommendations Section */
.recommendations-section {
  margin-bottom: 2rem;
}

.recommendations-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.recommendation-card {
  background: white;
  border-radius: var(--radius-md);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
}

.recommendation-card.improvement {
  border-left: 4px solid #f59e0b;
}

.recommendation-card.strengths {
  border-left: 4px solid #22c55e;
}

.recommendation-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border-color);
}

.recommendation-header svg {
  flex-shrink: 0;
}

.recommendation-card.improvement .recommendation-header svg {
  color: #f59e0b;
}

.recommendation-card.strengths .recommendation-header svg {
  color: #22c55e;
}

.recommendation-header h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.recommendation-card ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.recommendation-card li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.625rem 0;
  border-bottom: 1px solid #f1f5f9;
}

.recommendation-card li:last-child {
  border-bottom: none;
}

.rec-name {
  color: var(--text-primary);
  font-size: 0.9rem;
}

.rec-score {
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

/* Actions */
.report-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
  background: white;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}

.btn-primary,
.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-primary {
  background: var(--primary-purple);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-purple-light);
  transform: translateY(-1px);
}

.btn-secondary {
  background: #f8f9fc;
  color: #56005b;
  border: 2px solid #56005b;
}

.btn-secondary:hover {
  background: #f3e5f5;
}

/* Print styles */
@media print {
  .report-actions {
    display: none;
  }
  
  .report-container {
    padding: 0;
  }
  
  .chart-card,
  .summary-card,
  .category-detail,
  .recommendation-card {
    break-inside: avoid;
  }
}

/* Responsive */
@media (max-width: 1024px) {
  .summary-section {
    grid-template-columns: 1fr;
  }
  
  .charts-section {
    grid-template-columns: 1fr;
  }
  
  .recommendations-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .report-container {
    padding: 1rem;
  }

  .report-header {
    flex-direction: column;
    gap: 1rem;
  }

  .header-meta {
    text-align: left;
  }
  
  .report-title {
    font-size: 1.5rem;
  }

  .chart-container {
    height: 250px;
  }
  
  .category-header-detail {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .category-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .report-actions {
    flex-direction: column;
  }
  
  .btn-primary,
  .btn-secondary {
    width: 100%;
    justify-content: center;
  }
}
</style>

