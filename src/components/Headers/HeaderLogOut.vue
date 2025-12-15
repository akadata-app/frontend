<template>
  <header class="header">
    <div class="left-section">
      <a href="/" class="logo-link">
        <img
          class="logo"
          :src="logoUdeA"
          alt="Logo Universidad de Antioquia"
        />
        <h1 class="site-title">AKADATA</h1>
      </a>
    </div>

    <nav class="nav">
      <ul class="nav-list">
        <li><span @click="onOpenInicio" class="nav-clickable">Inicio</span></li>
        <li><span @click="onOpenRessources" class="nav-clickable">Recursos abiertos</span></li>
        <li><span @click="onHerramientasEvaluacion" class="nav-clickable">Herramientas</span></li>
        <li><span @click="onOpenConocenos" class="nav-clickable">Conocenos</span></li>
      </ul>
    </nav>

    <div class="right-section">
      <a href="/" class="login-button">Ingresar</a>
    </div>
  </header>
</template>

<script setup>
import logoUdeA from '@/assets/img/logosimbolo-horizontal-png.png'

import { useRouter } from 'vue-router'

const router = useRouter()

function onOpenInicio() {
  router.push({name: 'Inicio'})
}

function onOpenRessources() {
  router.push({ name: 'OpenRessources' })
}

function onOpenConocenos() {
  router.push({ name: 'Conocenos'})
}

function onHerramientasEvaluacion() {
  router.push({ name: 'HerramientasEvaluacion' })
}
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #1b5e20 0%, #2e7d32 50%, #388e3c 100%);
  padding: 0.875rem 2.5rem;
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.left-section {
  display: flex;
  align-items: center;
}

.logo-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  gap: 0.75rem;
}

.logo {
  height: 44px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  transition: transform 0.2s ease;
}

.logo-link:hover .logo {
  transform: scale(1.05);
}

.site-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin: 0;
  letter-spacing: 0.5px;
}

.nav {
  flex: 1;
  display: flex;
  justify-content: center;
}

.nav-list {
  display: flex;
  gap: 0.5rem;
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-clickable {
  cursor: pointer;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  font-size: 0.9rem;
  padding: 0.625rem 1.25rem;
  border-radius: 8px;
  transition: all 0.2s ease;
  position: relative;
  display: inline-block;
}

.nav-clickable:hover {
  background-color: rgba(255, 255, 255, 0.15);
  color: white;
}

.nav-clickable::after {
  content: '';
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%) scaleX(0);
  width: 20px;
  height: 2px;
  background-color: white;
  border-radius: 1px;
  transition: transform 0.2s ease;
}

.nav-clickable:hover::after {
  transform: translateX(-50%) scaleX(1);
}

.right-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.login-button {
  background: linear-gradient(135deg, #ffc107 0%, #ffb300 100%);
  color: #1a1a1a;
  padding: 0.5rem 1.5rem;
  border: none;
  border-radius: 9999px;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.login-button:hover {
  background: linear-gradient(135deg, #ffca28 0%, #ffc107 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.25);
  color: #1a1a1a;
}

@media (max-width: 1024px) {
  .header {
    padding: 0.75rem 1.5rem;
  }
  
  .nav-list {
    gap: 0.25rem;
  }
  
  .nav-clickable {
    padding: 0.5rem 0.75rem;
    font-size: 0.85rem;
  }
}

@media (max-width: 768px) {
  .nav {
    display: none;
  }
}
</style>
