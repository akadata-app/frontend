<template>
  <div class="maturity-model">
    <h1 class="title">Modelo de Madurez</h1>

    <div class="content">
      <img src="@/assets/img/herramientasEvaluacion/maturityModel.png" alt="Grupo de trabajo" class="image" />

      <div class="text">
        <p>
          Es una herramienta que permite diagnosticar su nivel actual de madurez en la gestión y gobernanza de datos.
          Evalúa aspectos clave como políticas, procesos, roles, tecnologías, cultura organizacional y toma de decisiones basada en datos.
        </p>
        <p>
          Con base en este análisis, se puede diseñar un plan de acción progresivo que le permita escalar a niveles más altos de madurez,
          fortaleciendo su capacidad de generar valor a partir de los datos.
        </p>
      </div>
    </div>

    <div class="info-sections">
      <div class="info">
        <h2>¿A quién va dirigido?</h2>
        <p>Directivos, responsables de calidad, planeación institucional, áreas TIC y comités de datos.</p>
      </div>

      <div class="info">
        <h2>¿Qué resultado ofrece?</h2>
        <p>
          Proporciona una visión clara del nivel de madurez actual, identifica brechas y oportunidades de mejora,
          y facilita la planificación estratégica de acciones para avanzar hacia una gobernanza de datos institucional sólida.
        </p>
      </div>
    </div>

    <div v-if="isAuthenticated">
      <div class="button-container">
        <button class="cta-button" @click="goToFormList">VER MODELOS DE MADUREZ</button>
      </div>

      <div class="button-container" v-if="userRole === 'ADMIN'">
        <button class="cta-button" @click.prevent="onOpenFormularioMadurez">CONFIGURACIÓN</button>
      </div>
    </div>

    <div class="button-container" v-else>
      <p class="login-message">Por favor, <router-link to="/" class="login-link">inicia sesión</router-link> para acceder a los modelos de madurez.</p>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'
const router = useRouter()
const userRole = ref(localStorage.getItem('userRole'))
const isAuthenticated = ref(false)

onMounted(() => {
  isAuthenticated.value = !!localStorage.getItem('jwtToken')
})

function goToFormList() {
  router.push({ name: 'ModeloDeMadurezFormList' })
}

function onOpenFormularioMadurez() {
  router.push({ name: 'FormularioMadurez' })
}
</script>

<style scoped>
.maturity-model {
  padding: 2rem;
  max-width: 1000px;
  margin: auto;
  font-family: "Segoe UI", sans-serif;
  color: #2e2e2e;
  text-align: center;
}

.title {
  font-size: 2rem;
  color: #56005b;
  font-weight: bold;
  margin-bottom: 2rem;
}

.content {
  display: flex;
  flex-direction: row;
  gap: 2rem;
  align-items: flex-start;
  justify-content: center;
  flex-wrap: wrap;
}

.image {
  max-width: 400px;
  border-radius: 12px;
  object-fit: cover;
  flex-shrink: 0;
}

.text {
  max-width: 500px;
  text-align: left;
  font-size: 0.95rem;
  line-height: 1.5;
}

.info-sections {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  margin-top: 2rem;
  gap: 2rem;
}

.info {
  flex: 1;
  min-width: 280px;
  text-align: left;
}

.info h2 {
  color: #56005b;
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  text-align: center;
}

.button-container {
  margin-top: 2rem;
}

.cta-button {
  background-color: #ffc700;
  color: #1c1c1c;
  font-weight: bold;
  padding: 0.8rem 2rem;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  box-shadow: 2px 2px 0 #c9a000;
  transition: all 0.2s ease;
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 4px 4px 0 #c9a000;
}

.login-message {
  color: #56005b;
  font-size: 1rem;
  font-weight: 500;
}

.login-link {
  color: #56005b;
  font-weight: bold;
  text-decoration: underline;
}

.login-link:hover {
  color: #7a007f;
}
</style>
