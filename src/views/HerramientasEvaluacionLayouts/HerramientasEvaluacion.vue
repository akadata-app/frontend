<template>
  <section class="evaluacion">
    <div class="header-section">
      <h2 class="titulo">Herramientas de evaluación</h2>
      <p class="subtitle">Explora nuestras herramientas para evaluar y mejorar la gobernanza de datos en tu institución</p>
    </div>
    
    <div class="contenedor-tarjetas">
      <div
        class="tarjeta"
        @click="irAOtraVista('objetivos')"
      >
        <div class="tarjeta-image-wrapper">
          <img
            src="@/assets/img/herramientasEvaluacion/objetivosBarreras.png"
            alt="Oportunidades y barreras"
          />
        </div>
        <div class="tarjeta-content">
          <h3>Oportunidades y barreras</h3>
          <p>
            Encuesta para identificar los desafíos y factores habilitadores en la implementación de
            gobernanza de datos en Instituciones de Educación Superior.
            <b>
            ¿Quieres participar?
            </b>
            Identifica los factores clave que afectan la gobernanza de datos en tu institución.
          </p>
        </div>
      </div>
      
      <div
        class="tarjeta"
        @click="irAOtraVista('taxonomy')"
      >
        <div class="tarjeta-image-wrapper">
          <img
            src="@/assets/img/herramientasEvaluacion/taxonomy.png"
            alt="Evaluación taxonomía"
          />
        </div>
        <div class="tarjeta-content">
          <h3>Evaluación taxonomía</h3>
          <p>
            Estructura conceptual jerárquica de dominios, dimensiones y características clave de la
            gobernanza de datos en universidades.
            <b>
              ¿Por dónde empezar?
            </b>
            Explora la taxonomía para identificar los elementos críticos de un sistema de gobernanza
            de datos. Personaliza tu ruta según las necesidades y capacidades institucionales.
          </p>
        </div>
      </div>
      
      <div
        class="tarjeta"
        @click="irAOtraVista('maturity-model')"
      >
        <div class="tarjeta-image-wrapper">
          <img
            src="@/assets/img/herramientasEvaluacion/maturityModel.png"
            alt="Modelo de madurez"
          />
        </div>
        <div class="tarjeta-content">
          <h3>Modelo de madurez</h3>
          <p>
            Un marco estructurado para medir el grado de avance institucional en gobernanza de
            datos y transformación digital, con métricas por dominios estratégicos.
            <b>
              ¿En qué etapa estás?
            </b>
            Evalúa tu grado de avance institucional en gobernanza de datos y con métricas por
            dominios estratégicos.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function irAOtraVista(ruta) {
  router.push(`/herramientas-evaluacion/${ruta}`)
}
</script>

<style scoped>
.evaluacion {
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 2rem;
  background: #ffffff;
  min-height: calc(100vh - 200px);
  font-family: 'Roboto', sans-serif;
}

.header-section {
  text-align: center;
  margin-bottom: 3rem;
}

.titulo {
  font-size: 2rem;
  font-weight: 600;
  color: #56005b;
  margin-bottom: 0.75rem;
}

.subtitle {
  font-size: 1rem;
  color: #6b7280;
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.6;
}

.contenedor-tarjetas {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.tarjeta {
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  transition: border-color 0.2s ease;
  cursor: pointer;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.tarjeta:hover {
  border-color: #56005b;
}

.tarjeta-image-wrapper {
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: #f3f4f6;
}

.tarjeta img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.tarjeta-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.tarjeta h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.75rem;
  color: #56005b;
}

.tarjeta p {
  font-size: 0.9rem;
  line-height: 1.6;
  color: #4a5568;
  margin: 0;
  flex-grow: 1;
}

.tarjeta p b {
  color: #56005b;
  font-weight: 600;
  display: block;
  margin-top: 0.75rem;
  font-size: 0.95rem;
}

/* Responsive */
@media (max-width: 1024px) {
  .contenedor-tarjetas {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
  }
}

@media (max-width: 768px) {
  .evaluacion {
    padding: 2rem 1rem;
  }
  
  .titulo {
    font-size: 1.75rem;
  }
  
  .subtitle {
    font-size: 0.95rem;
  }
  
  .contenedor-tarjetas {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .tarjeta-image-wrapper {
    height: 180px;
  }
}
</style>
