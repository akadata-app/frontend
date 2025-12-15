<template>
  <section class="evaluacion">
    <div class="header-section">
      <span class="header-badge">Diagnostico Institucional</span>
      <h2 class="titulo">Herramientas de evaluacion</h2>
      <p class="subtitle">Explora nuestras herramientas para evaluar y mejorar la gobernanza de datos en tu institucion</p>
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
          <div class="tarjeta-overlay">
            <span class="tarjeta-number">01</span>
          </div>
        </div>
        <div class="tarjeta-content">
          <div class="tarjeta-icon tarjeta-icon-purple">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <h3>Oportunidades y barreras</h3>
          <p>
            Encuesta para identificar los desafios y factores habilitadores en la implementacion de
            gobernanza de datos en Instituciones de Educacion Superior.
          </p>
          <div class="tarjeta-cta">
            <span>Quieres participar?</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </div>
        </div>
      </div>
      
      <div
        class="tarjeta"
        @click="irAOtraVista('taxonomy')"
      >
        <div class="tarjeta-image-wrapper">
          <img
            src="@/assets/img/herramientasEvaluacion/taxonomy.png"
            alt="Evaluacion taxonomia"
          />
          <div class="tarjeta-overlay">
            <span class="tarjeta-number">02</span>
          </div>
        </div>
        <div class="tarjeta-content">
          <div class="tarjeta-icon tarjeta-icon-green">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="m2 17 10 5 10-5"/>
              <path d="m2 12 10 5 10-5"/>
            </svg>
          </div>
          <h3>Evaluacion taxonomia</h3>
          <p>
            Estructura conceptual jerarquica de dominios, dimensiones y caracteristicas clave de la
            gobernanza de datos en universidades.
          </p>
          <div class="tarjeta-cta">
            <span>Por donde empezar?</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </div>
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
          <div class="tarjeta-overlay">
            <span class="tarjeta-number">03</span>
          </div>
        </div>
        <div class="tarjeta-content">
          <div class="tarjeta-icon tarjeta-icon-yellow">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 11H3v10h6V11z"/>
              <path d="M21 3h-6v18h6V3z"/>
              <path d="M15 7H9v14h6V7z"/>
            </svg>
          </div>
          <h3>Modelo de madurez</h3>
          <p>
            Un marco estructurado para medir el grado de avance institucional en gobernanza de
            datos y transformacion digital, con metricas por dominios estrategicos.
          </p>
          <div class="tarjeta-cta">
            <span>En que etapa estas?</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </div>
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
  min-height: calc(100vh - 140px);
  background: linear-gradient(180deg, #fafafa 0%, #ffffff 100%);
}

.header-section {
  text-align: center;
  margin-bottom: 3rem;
  padding: 2rem;
  background: linear-gradient(135deg, #f3e5f5 0%, #e8f5e9 100%);
  border-radius: 20px;
  position: relative;
  overflow: hidden;
}

.header-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2356005b' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  opacity: 0.5;
}

.header-badge {
  position: relative;
  display: inline-block;
  background: linear-gradient(135deg, #56005b 0%, #7b1fa2 100%);
  color: white;
  padding: 0.5rem 1.25rem;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  margin-bottom: 1rem;
}

.titulo {
  position: relative;
  font-size: 2.25rem;
  font-weight: 800;
  color: #1a1a1a;
  margin: 0 0 0.75rem;
}

.subtitle {
  position: relative;
  font-size: 1rem;
  color: #4b5563;
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
  background: white;
  border-radius: 20px;
  transition: all 0.3s ease;
  cursor: pointer;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f0f0;
}

.tarjeta:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(86, 0, 91, 0.15);
}

.tarjeta-image-wrapper {
  width: 100%;
  height: 200px;
  overflow: hidden;
  position: relative;
}

.tarjeta-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0) 50%, rgba(0,0,0,0.4) 100%);
  display: flex;
  align-items: flex-end;
  padding: 1rem;
}

.tarjeta-number {
  font-size: 2rem;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1;
}

.tarjeta img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.tarjeta:hover img {
  transform: scale(1.1);
}

.tarjeta-content {
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.tarjeta-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.tarjeta-icon-purple {
  background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%);
  color: #7b1fa2;
}

.tarjeta-icon-green {
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  color: #2e7d32;
}

.tarjeta-icon-yellow {
  background: linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%);
  color: #f57c00;
}

.tarjeta h3 {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0 0 0.75rem;
  color: #1a1a1a;
}

.tarjeta p {
  font-size: 0.9rem;
  line-height: 1.7;
  color: #6b7280;
  margin: 0;
  flex-grow: 1;
}

.tarjeta-cta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1.25rem;
  padding-top: 1.25rem;
  border-top: 1px solid #f0f0f0;
  color: #56005b;
  font-weight: 600;
  font-size: 0.9rem;
}

.tarjeta-cta svg {
  transition: transform 0.2s ease;
}

.tarjeta:hover .tarjeta-cta svg {
  transform: translateX(4px);
}

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
  
  .header-section {
    padding: 1.5rem;
    border-radius: 16px;
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
