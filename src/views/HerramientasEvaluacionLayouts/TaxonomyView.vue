<template>
  <div class="tool-view">
    <h1 class="title">Taxonomía de Gobernanza de Datos</h1>

    <div class="content">
      <img src="@/assets/img/herramientasEvaluacion/taxonomy.png" alt="Taxonomía imagen" class="image" />

      <div class="text">
        <p>
          Es una estructura conceptual que permite a las Instituciones clasificar, organizar y
          entender los elementos clave de la gobernanza de datos, a partir de conceptos,
          categorías, niveles y relaciones comunes.
        </p>
        <p>
          La taxonomía aborda componentes como principios rectores, dominios funcionales,
          actores y procesos clave proporcionando un marco común para orientar el diseño,
          evaluación e implementación de programas de gobernanza de datos.
        </p>
        <p>
          Sirve como referente organizador para facilitar el diálogo institucional, la toma de
          decisiones y el alineamiento entre diferentes áreas funcionales.
        </p>
      </div>
    </div>

    <!-- Sección de Videos -->
    <div class="videos-section">
      <h2 class="videos-title">📹 Recursos en Video</h2>
      <div class="videos-container">
        <a href="https://www.youtube.com/watch?v=HfggWRtlYwo" target="_blank" rel="noopener noreferrer" class="video-link">
          <span class="video-icon">▶</span>
          <span class="video-text">Ver vídeo de Taxonomía de GoD</span>
        </a>
      </div>
    </div>

    <div class="info-sections">
      <div class="info">
        <h2>¿A quién va dirigido?</h2>
        <p>
          Diseñadores de políticas institucionales, comités de gobernanza, líderes de tecnología, docentes
          investigadores y equipos de datos en instituciones educativas.
        </p>
      </div>

      <div class="info">
        <h2>¿Qué resultado ofrece?</h2>
        <p>
          Facilita una comprensión integral y estructurada de los elementos que componen la gobernanza de
          datos, sirviendo como base para estrategias más coherentes y articuladas.
        </p>
      </div>
    </div>

    <!-- Botón de Acceso a la Herramienta -->
    <div v-if="isAuthenticated" class="tool-actions">
      <button class="tool-button" @click.prevent="onOpenHerramienta">
        <span class="button-icon">→</span>
        <span>IR A LA HERRAMIENTA</span>
      </button>

      <button v-if="userRole === 'ADMIN'" class="tool-button secondary" @click.prevent="onOpenFormulario">
        <span class="button-icon">⚙</span>
        <span>CONFIGURACIÓN</span>
      </button>
    </div>

    <div v-else class="login-prompt">
      <p class="login-message">
        Por favor, <router-link to="/" class="login-link">inicia sesión</router-link> para acceder a las taxonomías.
      </p>
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
.tool-view {
  padding: 3rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
  font-family: 'Roboto', sans-serif;
  color: #2e2e2e;
  background: #ffffff;
  min-height: calc(100vh - 200px);
}

.title {
  font-size: 2rem;
  color: #56005b;
  font-weight: 600;
  margin-bottom: 2rem;
  text-align: center;
}

.content {
  display: flex;
  flex-direction: row;
  gap: 2.5rem;
  align-items: flex-start;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 3rem;
}

.image {
  max-width: 450px;
  width: 100%;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
  border: 1px solid #e5e7eb;
}

.text {
  max-width: 550px;
  text-align: left;
  font-size: 1rem;
  line-height: 1.7;
  color: #4a5568;
}

.text p {
  margin-bottom: 1rem;
}

/* Sección de Videos */
.videos-section {
  background: #f9fafb;
  border-radius: 8px;
  padding: 2rem;
  margin: 3rem 0;
  border: 1px solid #e5e7eb;
}

.videos-title {
  font-size: 1.25rem;
  color: #56005b;
  font-weight: 600;
  margin-bottom: 1.5rem;
  text-align: center;
}

.videos-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 600px;
  margin: 0 auto;
}

.video-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.25rem;
  background: #ffffff;
  border: 1px solid #6d8e5a;
  border-radius: 6px;
  text-decoration: none;
  color: #56005b;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.video-link:hover {
  background: #6d8e5a;
  color: #ffffff;
}

.video-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.video-text {
  flex: 1;
}

.info-sections {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  margin: 3rem 0;
  gap: 2rem;
}

.info {
  flex: 1;
  min-width: 300px;
  background: #ffffff;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.info h2 {
  color: #56005b;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  text-align: center;
}

.info p {
  text-align: left;
  color: #4a5568;
  line-height: 1.7;
  margin: 0;
}

/* Botones de Acción */
.tool-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  margin: 3rem 0;
}

.tool-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 2rem;
  background: #ffc700;
  color: #1c1c1c;
  font-weight: 500;
  font-size: 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  text-decoration: none;
  transition: background-color 0.2s ease;
  font-family: 'Roboto', sans-serif;
}

.tool-button:hover {
  background: #e2a100;
}

.tool-button.secondary {
  background: #56005b;
  color: #ffffff;
}

.tool-button.secondary:hover {
  background: #7a007f;
}

.button-icon {
  font-size: 1.2rem;
}

.login-prompt {
  text-align: center;
  margin: 3rem 0;
  padding: 1.5rem;
  background: #fff3cd;
  border-radius: 8px;
  border: 1px solid #ffc700;
}

.login-message {
  color: #56005b;
  font-size: 1.1rem;
  font-weight: 500;
  margin: 0;
}

.login-link {
  color: #56005b;
  font-weight: 700;
  text-decoration: underline;
  transition: color 0.3s ease;
}

.login-link:hover {
  color: #7a007f;
}

/* Responsive */
@media (max-width: 768px) {
  .tool-view {
    padding: 2rem 1rem;
  }

  .title {
    font-size: 2rem;
  }

  .content {
    flex-direction: column;
    gap: 1.5rem;
  }

  .image {
    max-width: 100%;
  }

  .videos-container {
    max-width: 100%;
  }

  .info-sections {
    flex-direction: column;
  }

  .tool-button {
    width: 100%;
    justify-content: center;
    padding: 0.875rem 2rem;
    font-size: 1rem;
  }
}
</style>
