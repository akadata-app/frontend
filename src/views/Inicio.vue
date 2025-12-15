<template>
  <div class="inicio-container">
    <section class="hero">
      <div class="hero-content">
        <span class="hero-badge">Framework de Gobernanza de Datos</span>
        <h1>Transformando la Gobernanza de Datos en la Educacion Superior</h1>
        <p class="hero-subtitle">
          Una plataforma integral para el diagnostico, diseno y seguimiento de programas
          institucionales de gobernanza de datos.
        </p>
        <div class="hero-actions">
          <button class="btn-primary" @click="goTo('/herramientas-evaluacion')">
            Comenzar ahora
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </button>
          <button class="btn-secondary" @click="goTo('/open-ressources')">
            Ver recursos
          </button>
        </div>
      </div>
    </section>

    <section class="about-section">
      <div class="about-card">
        <div class="about-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="m2 17 10 5 10-5"/>
            <path d="m2 12 10 5 10-5"/>
          </svg>
        </div>
        <div class="about-content">
          <h2>Que es AKADATA?</h2>
          <p>
            <strong>Akadata</strong> es una plataforma disenada para apoyar a
            Instituciones de Educacion Superior en la implementacion de estrategias de
            gobernanza de datos. Con un enfoque flexible, Akadata impulsa la
            <em>madurez digital institucional</em> orientada por datos.
          </p>
        </div>
      </div>
    </section>

    <section class="features-section">
      <div class="section-header">
        <h2>Nuestras herramientas</h2>
        <p>Todo lo que necesitas para transformar la gobernanza de datos en tu institucion</p>
      </div>
      
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon feature-icon-green">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
          </div>
          <h3>Acceso Abierto</h3>
          <p>
            Portal informativo con acceso libre a documentos, videos y herramientas
            para la alfabetizacion digital institucional.
          </p>
          <button class="feature-link" @click="goTo('/open-ressources')">
            Explorar recursos
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </button>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon feature-icon-purple">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 11H3v10h6V11z"/>
              <path d="M21 3h-6v18h6V3z"/>
              <path d="M15 7H9v14h6V7z"/>
            </svg>
          </div>
          <h3>Herramientas de Evaluacion</h3>
          <p>
            Diagnostico escalable que incluye encuesta de barreras y oportunidades, modelo
            de madurez y taxonomia.
          </p>
          <button class="feature-link" @click="goTo('/herramientas-evaluacion')">
            Ver herramientas
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </button>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon feature-icon-yellow">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4"/>
              <path d="M12 8h.01"/>
            </svg>
          </div>
          <h3>Soporte Institucional</h3>
          <p>
            Acompanamiento personalizado y recursos de apoyo para implementar
            estrategias de gobernanza efectivas.
          </p>
          <button class="feature-link" @click="goTo('/conocenos')">
            Conocer mas
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </button>
        </div>
      </div>
    </section>

    <section class="cta-section">
      <div class="cta-card">
        <div class="cta-content">
          <h2>Listo para transformar tu institucion?</h2>
          <p>Comienza tu diagnostico de gobernanza de datos hoy mismo</p>
        </div>
        <button class="cta-btn" @click="goTo('/herramientas-evaluacion')">
          Comenzar evaluacion
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m9 18 6-6-6-6"/>
          </svg>
        </button>
      </div>
    </section>
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
  min-height: calc(100vh - 140px);
  background: linear-gradient(180deg, #fafafa 0%, #ffffff 100%);
}

/* Hero Section */
.hero {
  padding: 4rem 2rem;
  text-align: center;
  background: linear-gradient(135deg, #f3e5f5 0%, #e8f5e9 100%);
  position: relative;
  overflow: hidden;
}

.hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2356005b' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  opacity: 0.5;
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 800px;
  margin: 0 auto;
}

.hero-badge {
  display: inline-block;
  background: linear-gradient(135deg, #56005b 0%, #7b1fa2 100%);
  color: white;
  padding: 0.5rem 1.25rem;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  margin-bottom: 1.5rem;
}

.hero h1 {
  font-size: 2.5rem;
  font-weight: 800;
  color: #1a1a1a;
  line-height: 1.2;
  margin: 0 0 1.25rem;
}

.hero-subtitle {
  font-size: 1.125rem;
  color: #4b5563;
  line-height: 1.7;
  margin: 0 0 2rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary {
  padding: 0.875rem 1.75rem;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #56005b 0%, #7b1fa2 100%);
  color: white;
  box-shadow: 0 4px 14px rgba(86, 0, 91, 0.35);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(86, 0, 91, 0.45);
}

.btn-secondary {
  background: white;
  color: #56005b;
  border: 2px solid #56005b;
}

.btn-secondary:hover {
  background: #f3e5f5;
}

/* About Section */
.about-section {
  padding: 3rem 2rem;
  display: flex;
  justify-content: center;
}

.about-card {
  max-width: 900px;
  width: 100%;
  background: white;
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  display: flex;
  gap: 2rem;
  align-items: flex-start;
}

.about-icon {
  width: 64px;
  height: 64px;
  min-width: 64px;
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2e7d32;
}

.about-content h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 1rem;
}

.about-content p {
  margin: 0;
  line-height: 1.8;
  font-size: 1rem;
  color: #4b5563;
}

.about-content strong {
  color: #56005b;
  font-weight: 600;
}

.about-content em {
  color: #2e7d32;
  font-style: normal;
  font-weight: 500;
}

/* Features Section */
.features-section {
  padding: 3rem 2rem 4rem;
}

.section-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.section-header h2 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 0.5rem;
}

.section-header p {
  color: #6b7280;
  font-size: 1rem;
  margin: 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  max-width: 1100px;
  margin: 0 auto;
}

.feature-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  border: 1px solid #f0f0f0;
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.25rem;
}

.feature-icon-green {
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  color: #2e7d32;
}

.feature-icon-purple {
  background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%);
  color: #7b1fa2;
}

.feature-icon-yellow {
  background: linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%);
  color: #f57c00;
}

.feature-card h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 0.75rem;
}

.feature-card p {
  color: #6b7280;
  font-size: 0.9rem;
  line-height: 1.6;
  margin: 0 0 1.25rem;
}

.feature-link {
  background: none;
  border: none;
  color: #56005b;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0;
  transition: gap 0.2s ease;
}

.feature-link:hover {
  gap: 0.5rem;
}

/* CTA Section */
.cta-section {
  padding: 0 2rem 4rem;
}

.cta-card {
  max-width: 900px;
  margin: 0 auto;
  background: linear-gradient(135deg, #56005b 0%, #7b1fa2 50%, #9c27b0 100%);
  border-radius: 20px;
  padding: 3rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  position: relative;
  overflow: hidden;
}

.cta-card::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 50%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
}

.cta-content {
  position: relative;
  z-index: 1;
}

.cta-content h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin: 0 0 0.5rem;
}

.cta-content p {
  color: rgba(255, 255, 255, 0.85);
  margin: 0;
  font-size: 1rem;
}

.cta-btn {
  position: relative;
  z-index: 1;
  background: linear-gradient(135deg, #ffc107 0%, #ffb300 100%);
  color: #1a1a1a;
  border: none;
  padding: 1rem 2rem;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  white-space: nowrap;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2);
}

.cta-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

/* Responsive */
@media (max-width: 768px) {
  .hero {
    padding: 3rem 1.5rem;
  }
  
  .hero h1 {
    font-size: 1.75rem;
  }
  
  .hero-subtitle {
    font-size: 1rem;
  }
  
  .about-card {
    flex-direction: column;
    padding: 2rem;
  }
  
  .cta-card {
    flex-direction: column;
    text-align: center;
    padding: 2rem;
  }
  
  .cta-content h2 {
    font-size: 1.25rem;
  }
}
</style>
