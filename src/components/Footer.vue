<template>
  <footer class="footer">
    <div class="footer-content">
      <div class="footer-main">
        <div class="footer-brand">
          <span class="brand-name">AKADATA</span>
          <span class="brand-separator">|</span>
          <span class="brand-org">Universidad de Antioquia - In2Lab</span>
        </div>
        <p class="footer-project">
          Proyecto de Investigacion SIIU 2024-72450<br />
          Framework de Gobernanza de Datos para Instituciones de Educacion Superior
        </p>
      </div>
      <div class="footer-meta">
        <span class="footer-location">Medellin, Colombia</span>
        <span class="footer-copyright">2025 Akadata - Todos los derechos reservados</span>
      </div>
    </div>
  </footer>
</template>

<script setup>
</script>

<style scoped>
.footer {
  background: linear-gradient(135deg, #3d0041 0%, #56005b 50%, #7b1fa2 100%);
  color: white;
  padding: 2rem 2.5rem;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.footer-main {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.brand-name {
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.brand-separator {
  color: rgba(255, 255, 255, 0.4);
  font-weight: 300;
}

.brand-org {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.9);
}

.footer-project {
  font-size: 0.875rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.75);
  margin: 0;
}

.footer-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
}

.footer-location,
.footer-copyright {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

@media (max-width: 768px) {
  .footer {
    padding: 1.5rem 1.25rem;
  }
  
  .footer-brand {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
  
  .brand-separator {
    display: none;
  }
  
  .footer-meta {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
}
</style>
