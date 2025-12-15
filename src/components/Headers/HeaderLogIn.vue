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
        <li><a href="#" @click.prevent="onOpenConocenos">Conocenos</a></li>
        <li><a @click.prevent="onOpenProfile" href="#">Mi perfil</a></li>
      </ul>
    </nav>

    <div class="right-section">
      <span class="user-button">{{ userName }}</span>
      <a href="#" class="logout-button" @click.prevent="onLogout">Cerrar sesion</a>
    </div>
  </header>
</template>

<script setup>
import logoUdeA from '@/assets/img/logosimbolo-horizontal-png.png'
import { useRouter } from 'vue-router'
import { logout, getUserName } from '@/services/authService.js'
import { ref, onMounted } from 'vue'

const router = useRouter()
const userName = ref('')

onMounted(() => {
  userName.value = getUserName() || 'Usuario'
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

.nav-list li a {
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9rem;
  padding: 0.625rem 1.25rem;
  border-radius: 8px;
  transition: all 0.2s ease;
  position: relative;
}

.nav-list li a:hover {
  background-color: rgba(255, 255, 255, 0.15);
  color: white;
}

.nav-list li a::after {
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

.nav-list li a:hover::after {
  transform: translateX(-50%) scaleX(1);
}

.right-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-button {
  background: linear-gradient(135deg, #ffc107 0%, #ffb300 100%);
  color: #1a1a1a;
  padding: 0.5rem 1.25rem;
  border-radius: 9999px;
  font-weight: 600;
  font-size: 0.875rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.user-button::before {
  content: '';
  width: 8px;
  height: 8px;
  background-color: #4caf50;
  border-radius: 50%;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.3);
}

.logout-button {
  background: linear-gradient(135deg, #56005b 0%, #7b1fa2 100%);
  color: white;
  padding: 0.5rem 1.25rem;
  border-radius: 9999px;
  font-weight: 500;
  font-size: 0.875rem;
  text-decoration: none;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(86, 0, 91, 0.3);
}

.logout-button:hover {
  background: linear-gradient(135deg, #7b1fa2 0%, #9c27b0 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(86, 0, 91, 0.4);
  color: white;
}

@media (max-width: 1024px) {
  .header {
    padding: 0.75rem 1.5rem;
  }
  
  .nav-list {
    gap: 0.25rem;
  }
  
  .nav-list li a {
    padding: 0.5rem 0.75rem;
    font-size: 0.85rem;
  }
}

@media (max-width: 768px) {
  .nav {
    display: none;
  }
  
  .user-button {
    display: none;
  }
}
</style>
