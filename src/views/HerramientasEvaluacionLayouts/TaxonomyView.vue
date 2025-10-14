<template>
  <div class="taxonomy-view">
    <h1 class="title">Taxonomía</h1>

    <div class="content">
      <img src="@/assets/img/herramientasEvaluacion/taxonomy.png" alt="Taxonomía imagen" class="image" />

      <div class="text">
        <p>
          Es una estructura conceptual que permite a las Instituciones clasificar, organizar y entender los elementos clave de la gobernanza de datos, a partir de conceptos, categorías, niveles y relaciones comunes.
        </p>
        <p>
          La taxonomía aborda componentes como principios rectores, dominios funcionales, actores responsables, procesos clave, tecnologías habilitadoras y métricas asociadas, proporcionando un marco común para orientar el diseño, evaluación e implementación de políticas de datos.
        </p>
        <p>
          Sirve como referente organizador para facilitar el diálogo institucional, la toma de decisiones y el alineamiento entre diferentes áreas funcionales.
        </p>
      </div>
    </div>

    <div class="info-sections">
      <div class="info">
        <h2>¿A quién va dirigido?</h2>
        <p>
          Diseñadores de políticas institucionales, comités de gobernanza, líderes de TIC, docentes investigadores y equipos de datos en instituciones educativas.
        </p>
      </div>

      <div class="info">
        <h2>¿Qué resultado ofrece?</h2>
        <p>
          Facilita una comprensión integral y estructurada de los elementos que componen la gobernanza de datos, sirviendo como base para estrategias más coherentes y articuladas.
        </p>
      </div>
    </div>

    <div v-if="isAuthenticated">
      <div class="button-container">
        <button class="cta-button" @click.prevent="onOpenHerramienta">VER TAXONOMÍAS</button>
      </div>
      
      <div class="button-container" v-if="userRole === 'ADMIN'">
        <button class="cta-button" @click.prevent="onOpenFormulario">CONFIGURACIÓN</button>
      </div>
    </div>

    <div class="button-container" v-else>
      <p class="login-message">Por favor, <router-link to="/" class="login-link">inicia sesión</router-link> para acceder a las taxonomías.</p>
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

function onOpenHerramienta() {
  router.push({ name: 'FormsList' })
}

function onOpenFormulario() {
  router.push({ name: 'Formulario' })
}
</script>

<style scoped>
.taxonomy-view {
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
