<template>
  <div class="objetivos-view">
    <h1 class="title">Objetivos y Barreras</h1>

    <div class="content">
      <img src="@/assets/img/herramientasEvaluacion/objetivosBarreras.png" alt="Reunión" class="image" />

      <div class="text">
        <p>
          La identificación de barreras y oportunidades es clave para diseñar estrategias eficaces de gobernanza de datos en las Instituciones de Educación Superior (IES).
          Este análisis permite comprender los factores que dificultan o favorecen la implementación de sistemas de gestión de datos eficientes, éticos y sostenibles.
        </p>
        <p>
          Una vez identificadas estas variables, es posible definir una estrategia adaptada al contexto de la IES, que aproveche las oportunidades disponibles y trace rutas para superar los obstáculos existentes.
        </p>
      </div>
    </div>

    <div class="info-sections">
      <div class="info">
        <h2>¿A quién va dirigido?</h2>
        <p>
          Gestores/as académicos, directivos/as, responsables de calidad, comités de datos y equipos de transformación digital en Instituciones de Educación Superior.
        </p>
      </div>

      <div class="info">
        <h2>¿Qué resultado ofrece?</h2>
        <p>
          Este recurso permite priorizar las oportunidades más viables y clasificar las barreras según su impacto, ayudando a las IES a establecer un plan estratégico de gobernanza de datos contextualizado y accionable.
        </p>
      </div>
    </div>
<!--
    <div v-if="isAuthenticated">
      <div class="button-container">
        <button class="cta-button">IR A LA HERRAMIENTA</button>
      </div>

      <div class="button-container" v-if="userRole === 'ADMIN'">
        <button class="cta-button">CONFIGURACIÓN</button>
      </div>
    </div>

    <div class="button-container" v-else>
        <p class="login-message">Por favor, <router-link to="/" class="login-link">inicia sesión</router-link> para acceder a la herramienta.</p>
    </div>
-->
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
</script>

<style scoped>
.objetivos-view {
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
</style>
