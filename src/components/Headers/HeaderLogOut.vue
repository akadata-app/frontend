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
        <li><span @click="onOpenConocenos" class="nav-clickable">Conócenos</span></li>
      </ul>
    </nav>

    <div class="right-section">
      <a href="/" class="login-button">Ingresar</a>
      <button class="menu-toggle" aria-label="Abrir menú">
        <img :src="menuIcon" alt="Icono menú" class="menu-icon" />
      </button>
    </div>
  </header>
</template>

<script setup>
import logoUdeA from '@/assets/img/logosimbolo-horizontal-png.png'
import menuIcon from '@/assets/img/menu.png'

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
  background-color: #32621c;
  padding: 1rem 2rem;
  color: white;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo-link {
  display: flex;
  align-items: center;
  text-decoration: none;
}

.logo {
  height: 40px;
  margin-right: 0.75rem;
}

.site-title {
  font-size: 1.4rem;
  font-weight: 600;
  color: white;
  margin: 0;
  font-family: 'Roboto', sans-serif;
}

.nav {
  flex: 1;
  margin-left: 3rem;
}

.nav-list {
  display: flex;
  gap: 2.5rem;
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-clickable {
  cursor: pointer;
  color: white;
  font-weight: 400;
  font-size: 0.95rem;
  font-family: 'Roboto', sans-serif;
  transition: opacity 0.2s ease;
}

.nav-clickable:hover {
  opacity: 0.8;
}

.right-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.login-button {
  background-color: #f9b115;
  color: #1c1c1c;
  padding: 0.5rem 1.5rem;
  border: none;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  font-family: 'Roboto', sans-serif;
  transition: background-color 0.2s ease;
}

.login-button:hover {
  background-color: #e2a100;
}

.menu-toggle {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
}

.menu-icon {
  width: 24px;
  height: 24px;
  filter: brightness(100);
}
</style>
