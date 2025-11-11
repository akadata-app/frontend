<template>
  <div class="home-container">
    <section class="login-section">
      <div class="login-card">
        <div class="login-header">
          <h2>Iniciar sesión</h2>
          <p class="login-subtitle">Bienvenido de nuevo a AKADATA</p>
        </div>
        
        <form @submit.prevent="onSubmit" class="login-form">
          <div class="form-group">
            <label for="email">Correo electrónico</label>
            <input
              id="email"
              type="email"
              placeholder="tu@correo.com"
              v-model="email"
              required
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="password">Contraseña</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              v-model="password"
              required
              class="form-input"
            />
          </div>

          <div class="form-group checkbox-group">
            <input
              id="verification"
              type="checkbox"
              v-model="verification"
              class="checkbox-input"
            />
            <label for="verification" class="checkbox-label">Verificación</label>
          </div>

          <div v-if="errorMsg" class="error-message">
            {{ errorMsg }}
          </div>

          <div class="buttons">
            <button type="button" class="register-btn" @click="onRegister">
              Regístrate
            </button>
            <button type="submit" class="continue-btn" :disabled="loading">
              {{ loading ? 'Iniciando...' : 'Continuar' }}
            </button>
          </div>

          <a href="#" class="forgot-password" @click.prevent="showReset = !showReset">
            ¿Olvidaste tu contraseña?
          </a>
        </form>

        <div v-if="showReset" class="reset-box">
          <h3 class="reset-title">Recuperar contraseña</h3>
          <div class="form-group">
            <label for="reset-email">Correo electrónico</label>
            <input
              id="reset-email"
              type="email"
              v-model="resetEmail"
              placeholder="tu@correo.com"
              required
              class="form-input"
            />
          </div>
          <button class="reset-btn" @click="onResetPassword">Enviar</button>
          <div v-if="resetMsg" class="reset-message">{{ resetMsg }}</div>
        </div>
      </div>
    </section>

    <section class="image-section">
      <div class="image-wrapper">
        <img :src="image1" alt="Ilustración de trabajo en equipo" />
      </div>
    </section>
  </div>
</template>

<script setup>
import image1 from '@/assets/img/login.png'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login, register, resetPassword } from '@/services/authService.js'

const router = useRouter()

const email = ref('')
const password = ref('')
const verification = ref(false)
const loading = ref(false)
const errorMsg = ref('')

const showReset = ref(false)
const resetEmail = ref('')
const resetMsg = ref('')

async function onSubmit() {
  loading.value = true
  errorMsg.value = ''
  try {
    await login(email.value, password.value)
    router.push({ name: 'Inicio' }).then(() => window.location.reload())
  } catch (error) {
    errorMsg.value = error.response?.data || 'Error de conexión'
  } finally {
    loading.value = false
  }
}

function onRegister() {
  router.push({ name: 'UserRegister' })
}

async function onResetPassword() {
  resetMsg.value = ''
  try {
    await resetPassword(resetEmail.value)
    resetMsg.value = 'Si el correo existe, se ha enviado una nueva contraseña.'
  } catch (error) {
    resetMsg.value = error.response?.data || 'No se pudo enviar el correo.'
  }
}
</script>

<style scoped>
.home-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  gap: 4rem;
  min-height: calc(100vh - 200px);
  background: #ffffff;
  font-family: 'Roboto', sans-serif;
}

.login-section {
  flex: 1;
  max-width: 450px;
  display: flex;
  justify-content: center;
}

.login-card {
  width: 100%;
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  padding: 2.5rem;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-header h2 {
  font-size: 1.75rem;
  font-weight: 600;
  color: #56005b;
  margin-bottom: 0.5rem;
}

.login-subtitle {
  color: #6b7280;
  font-size: 0.9rem;
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  font-size: 0.9rem;
  color: #374151;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
  color: #1f2937;
  background: #ffffff;
  transition: border-color 0.2s ease;
  font-family: 'Roboto', sans-serif;
}

.form-input:focus {
  outline: none;
  border-color: #56005b;
}

.form-input::placeholder {
  color: #9ca3af;
}

.checkbox-group {
  flex-direction: row;
  align-items: center;
  gap: 0.75rem;
}

.checkbox-input {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #56005b;
}

.checkbox-label {
  margin: 0;
  cursor: pointer;
  font-weight: 400;
  user-select: none;
}

.error-message {
  color: #dc2626;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
}

.buttons {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
}

.register-btn,
.continue-btn {
  flex: 1;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  font-family: 'Roboto', sans-serif;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.register-btn {
  background: #56005b;
  color: white;
}

.register-btn:hover {
  background: #7a007f;
}

.continue-btn {
  background: #ffc700;
  color: #1c1c1c;
}

.continue-btn:hover:not(:disabled) {
  background: #e2a100;
}

.continue-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.forgot-password {
  text-align: center;
  font-size: 0.9rem;
  color: #56005b;
  text-decoration: none;
  margin-top: 0.5rem;
  transition: color 0.2s ease;
}

.forgot-password:hover {
  color: #7a007f;
}

.reset-box {
  margin-top: 2rem;
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.reset-title {
  font-size: 1rem;
  font-weight: 600;
  color: #56005b;
  margin-bottom: 1rem;
  text-align: center;
}

.reset-btn {
  width: 100%;
  padding: 0.75rem;
  background: #56005b;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  font-family: 'Roboto', sans-serif;
  cursor: pointer;
  transition: background-color 0.2s ease;
  margin-top: 0.5rem;
}

.reset-btn:hover {
  background: #7a007f;
}

.reset-message {
  margin-top: 1rem;
  color: #059669;
  text-align: center;
  font-size: 0.9rem;
  padding: 0.75rem;
  background: #d1fae5;
  border-radius: 6px;
}

.image-section {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.image-wrapper {
  max-width: 600px;
  width: 100%;
}

.image-wrapper img {
  width: 100%;
  height: auto;
  object-fit: contain;
}

/* Responsive */
@media (max-width: 1024px) {
  .home-container {
    flex-direction: column;
    gap: 2rem;
    padding: 1.5rem;
  }
  
  .login-section {
    max-width: 100%;
  }
  
  .image-section {
    display: none;
  }
}

@media (max-width: 768px) {
  .login-card {
    padding: 2rem 1.5rem;
  }
  
  .buttons {
    flex-direction: column;
  }
  
  .register-btn,
  .continue-btn {
    width: 100%;
  }
}
</style>
