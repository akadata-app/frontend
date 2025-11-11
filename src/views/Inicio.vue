<template>
  <div class="inicio-container">
    <div class="content-wrapper">
      <section class="hero">
        <h1>Transformando la Gobernanza de Datos en la Educación Superior</h1>
        <p class="subtitle">
          Una plataforma integral para el diagnóstico, diseño y seguimiento de programas
          institucionales de gobernanza de datos.
        </p>
      </section>

      <section class="akadata-card">
        <p>
          <strong>Akadata</strong> es una plataforma diseñada para apoyar a
          Instituciones de Educación Superior en la implementación de estrategias de
          gobernanza de datos. Con un enfoque flexible, Akadata impulsa la
          <em>madurez digital institucional</em> orientada por datos.
        </p>
      </section>

      <section class="features">
        <div class="feature">
          <h3>Acceso Abierto</h3>
          <p>
            Portal informativo con acceso libre a documentos, videos y herramientas
            para la alfabetización digital institucional.
          </p>
        </div>
        <div class="feature">
          <h3>Herramientas de Evaluación</h3>
          <p>
            Diagnóstico escalable que incluye encuesta de barreras y oportunidades, modelo
            de madurez y taxonomía, adaptable a las necesidades de cada institución.
          </p>
        </div>
      </section>

      <section class="cta">
        <button class="cta-btn" @click="goTo('/herramientas-evaluacion')">
          ¿Listos para transformar la gobernanza de datos en tu institución?
          <span class="arrow">→</span>
        </button>
      </section>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
function goTo(path) {
  router.push(path)
}
</script>

<style scoped>
.inicio-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 200px);
  padding: 3rem 2rem;
  background: #ffffff;
  font-family: 'Roboto', sans-serif;
}

.content-wrapper {
  max-width: 900px;
  width: 100%;
  text-align: center;
}

.hero {
  margin-bottom: 3rem;
}

.hero h1 {
  margin: 0 0 1rem;
  font-size: 2rem;
  line-height: 1.4;
  font-weight: 600;
  color: #56005b;
}

.subtitle {
  margin: 0;
  color: #4a5568;
  font-size: 1rem;
  line-height: 1.6;
}

.akadata-card {
  margin-bottom: 3rem;
  padding: 2rem;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.akadata-card p {
  margin: 0;
  line-height: 1.7;
  font-size: 1rem;
  color: #4a5568;
  text-align: left;
}

.akadata-card strong {
  color: #56005b;
  font-weight: 600;
}

.akadata-card em {
  color: #56005b;
  font-style: normal;
  font-weight: 500;
}

.features {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 3rem;
  text-align: left;
}

.feature {
  padding: 1.5rem;
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.feature h3 {
  margin: 0 0 0.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: #56005b;
}

.feature p {
  margin: 0;
  color: #4a5568;
  font-size: 0.95rem;
  line-height: 1.6;
}

.cta {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.cta-btn {
  appearance: none;
  border: none;
  border-radius: 6px;
  padding: 0.875rem 2rem;
  background: #ffc700;
  color: #1c1c1c;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-size: 1rem;
  font-family: 'Roboto', sans-serif;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.cta-btn:hover {
  background: #e2a100;
}

.arrow {
  font-size: 1rem;
}

/* Responsive */
@media (max-width: 768px) {
  .inicio-container {
    padding: 2rem 1rem;
  }
  
  .hero h1 {
    font-size: 1.75rem;
  }
  
  .subtitle {
    font-size: 0.95rem;
  }
  
  .cta-btn {
    padding: 0.75rem 1.5rem;
    font-size: 0.95rem;
  }
}
</style>
