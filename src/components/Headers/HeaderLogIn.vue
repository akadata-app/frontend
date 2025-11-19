<template>
  <header class="header">
    <div class="left-section">
      <a href="#" class="logo-link" @click.prevent="onOpenInicio">
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
        <li><a href="#" @click.prevent="onOpenInicio">Inicio</a></li>
        <li><a href="#" @click.prevent="onOpenRessources">Recursos abiertos</a></li>
        <li><a href="#" @click.prevent="onHerramientasEvaluacion">Herramientas</a></li>
        <li><a href="#" @click.prevent="onOpenConocenos">Conócenos</a></li>
        <li v-if="isAdmin" class="admin-item">
          <a href="#" @click.prevent="onOpenAdminCenter" class="admin-link">
            ⚙️ Administración
          </a>
        </li>
      </ul>
    </nav>

    <div class="right-section">
      <span class="user-button" @click="onOpenProfile">{{ userName }}</span>
      <a href="#" class="logout-button" @click.prevent="onLogout">Cerrar sesión</a>
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
import { logout, getUserName, getUserRole } from '@/services/authService.js'
import { ref, onMounted, computed } from 'vue'

const router = useRouter()
const userName = ref('')
const userRole = ref('')
const isAdmin = computed(() => userRole.value === 'ADMIN')

onMounted(() => {
  userName.value = getUserName() || 'Usuario'
  userRole.value = getUserRole() || ''
})

function onLogout() {
  logout()
  router.push('/').then(() => window.location.reload())
}

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

function onOpenProfile() {
  router.push({ name: 'UserProfile' })
}

function onOpenAdminCenter() {
  router.push({ name: 'AdminCenter' })
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

.nav-list a {
  color: white;
  text-decoration: none;
  font-weight: 400;
  font-size: 0.95rem;
  font-family: 'Roboto', sans-serif;
  transition: opacity 0.2s ease;
}

.nav-list a:hover {
  opacity: 0.8;
}

.right-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-button {
  background-color: #f9b115;
  color: #1c1c1c;
  padding: 0.5rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  font-family: 'Roboto', sans-serif;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.user-button:hover {
  background-color: #e2a100;
}

.logout-button {
  background-color: #4b0a38;
  color: white;
  padding: 0.5rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  text-decoration: none;
  font-family: 'Roboto', sans-serif;
  transition: background-color 0.2s ease;
}

.logout-button:hover {
  background-color: #38082a;
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

.admin-item {
  position: relative;
}

.admin-link {
  color: #f9b115 !important;
  font-weight: 500 !important;
}

.admin-link:hover {
  opacity: 1 !important;
  text-decoration: underline;
}
</style>
