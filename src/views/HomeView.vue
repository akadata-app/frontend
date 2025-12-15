<template>
  <div class="login-page">
    <div class="login-container">
      <!-- Panel izquierdo: Formulario -->
      <div class="login-form-panel">
        <div class="form-wrapper">
          <div class="brand">
            <div class="brand-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="m2 17 10 5 10-5"/>
                <path d="m2 12 10 5 10-5"/>
              </svg>
            </div>
            <span class="brand-name">AKADATA</span>
          </div>

          <h1 class="form-title">Bienvenido</h1>
          <p class="form-subtitle">Inicia sesion para acceder a tu cuenta</p>

          <form @submit.prevent="onSubmit" class="login-form">
            <div class="form-group">
              <label for="email">Correo electronico</label>
              <input
                id="email"
                type="email"
                v-model="email"
                required
                class="form-input"
                placeholder="tu@correo.com"
              />
            </div>

            <div class="form-group">
              <label for="password">Contrasena</label>
              <input
                id="password"
                type="password"
                v-model="password"
                required
                class="form-input"
                placeholder="Tu contrasena"
              />
            </div>

            <div class="form-options">
              <label class="checkbox-wrapper">
                <input type="checkbox" v-model="verification" class="checkbox" />
                <span class="checkbox-label">Recordar sesion</span>
              </label>
              <a href="#" class="forgot-link" @click.prevent="showReset = !showReset">
                Olvidaste tu contrasena?
              </a>
            </div>

            <div v-if="errorMsg" class="error-message">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {{ errorMsg }}
            </div>

            <button type="submit" class="btn-login" :disabled="loading">
              <span v-if="loading" class="spinner"></span>
              {{ loading ? 'Iniciando...' : 'Iniciar sesion' }}
            </button>
          </form>

          <p class="register-link">
            No tienes cuenta? <a href="#" @click.prevent="onRegister">Registrate</a>
          </p>

          <!-- Reset Password -->
          <div v-if="showReset" class="reset-section">
            <div class="reset-divider">
              <span>Recuperar contrasena</span>
            </div>
            <div class="form-group">
              <input
                type="email"
                v-model="resetEmail"
                class="form-input"
                placeholder="Ingresa tu correo"
              />
            </div>
            <button class="btn-reset" @click="onResetPassword">Enviar enlace</button>
            <p v-if="resetMsg" class="reset-message">{{ resetMsg }}</p>
          </div>
        </div>
      </div>

      <!-- Panel derecho: Ilustracion -->
      <div class="login-info-panel">
        <div class="info-content">
          <div class="info-badge">Universidad de Antioquia</div>
          <h2>Gobernanza de Datos para la Educacion Superior</h2>
          <p>Herramientas de diagnostico, evaluacion y seguimiento para fortalecer la gestion de datos en tu institucion.</p>
          
          <ul class="info-features">
            <li>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Modelo de Madurez
            </li>
            <li>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Taxonomia de Gobernanza
            </li>
            <li>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Analisis de Barreras
            </li>
          </ul>

          <div class="info-illustration">
            <img :src="image1" alt="Ilustracion" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import image1 from '@/assets/img/login.png'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login, resetPassword } from '@/services/authService.js'

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
    errorMsg.value = error.response?.data || 'Error de conexion'
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
    resetMsg.value = 'Si el correo existe, recibirás una nueva contrasena.'
  } catch (error) {
    resetMsg.value = error.response?.data || 'No se pudo enviar el correo.'
  }
}
</script>

<style scoped>
.login-page {
  min-height: calc(100vh - 140px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  padding: 2rem;
}

.login-container {
  display: flex;
  width: 100%;
  max-width: 1000px;
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
}

/* Panel Formulario */
.login-form-panel {
  flex: 1;
  padding: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-wrapper {
  width: 100%;
  max-width: 360px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.brand-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #56005b 0%, #7b1fa2 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.brand-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a1a;
}

.form-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 0.5rem;
}

.form-subtitle {
  font-size: 0.95rem;
  color: #6c757d;
  margin: 0 0 2rem;
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
  font-size: 0.85rem;
  font-weight: 500;
  color: #495057;
}

.form-input {
  padding: 0.875rem 1rem;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 0.95rem;
  color: #1a1a1a;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: #56005b;
  box-shadow: 0 0 0 3px rgba(86, 0, 91, 0.1);
}

.form-input::placeholder {
  color: #adb5bd;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox {
  width: 16px;
  height: 16px;
  accent-color: #56005b;
  cursor: pointer;
}

.checkbox-label {
  font-size: 0.85rem;
  color: #6c757d;
}

.forgot-link {
  font-size: 0.85rem;
  color: #56005b;
  text-decoration: none;
  font-weight: 500;
}

.forgot-link:hover {
  text-decoration: underline;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem;
  background: #f8d7da;
  color: #721c24;
  border-radius: 8px;
  font-size: 0.875rem;
}

.btn-login {
  padding: 0.875rem;
  background: #56005b;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-login:hover:not(:disabled) {
  background: #7b1fa2;
}

.btn-login:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.register-link {
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.9rem;
  color: #6c757d;
}

.register-link a {
  color: #56005b;
  font-weight: 600;
  text-decoration: none;
}

.register-link a:hover {
  text-decoration: underline;
}

/* Reset Section */
.reset-section {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e9ecef;
}

.reset-divider {
  text-align: center;
  margin-bottom: 1rem;
}

.reset-divider span {
  font-size: 0.85rem;
  color: #6c757d;
  font-weight: 500;
}

.btn-reset {
  width: 100%;
  padding: 0.75rem;
  background: #e9ecef;
  color: #495057;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 0.75rem;
  transition: background 0.2s ease;
}

.btn-reset:hover {
  background: #dee2e6;
}

.reset-message {
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: #d4edda;
  color: #155724;
  border-radius: 8px;
  font-size: 0.85rem;
  text-align: center;
}

/* Panel Info */
.login-info-panel {
  flex: 1;
  background: linear-gradient(135deg, #56005b 0%, #7b1fa2 100%);
  padding: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.login-info-panel::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -30%;
  width: 80%;
  height: 150%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
}

.info-content {
  position: relative;
  z-index: 1;
  color: white;
  max-width: 400px;
}

.info-badge {
  display: inline-block;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

.info-content h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 1rem;
  line-height: 1.3;
}

.info-content > p {
  font-size: 0.95rem;
  opacity: 0.9;
  line-height: 1.6;
  margin: 0 0 1.5rem;
}

.info-features {
  list-style: none;
  padding: 0;
  margin: 0 0 2rem;
}

.info-features li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
  opacity: 0.9;
}

.info-features svg {
  color: #4caf50;
}

.info-illustration {
  text-align: center;
}

.info-illustration img {
  max-width: 280px;
  width: 100%;
  filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.3));
}

/* Responsive */
@media (max-width: 900px) {
  .login-container {
    flex-direction: column;
  }
  
  .login-info-panel {
    display: none;
  }
  
  .login-form-panel {
    padding: 2rem;
  }
}

@media (max-width: 480px) {
  .login-page {
    padding: 1rem;
  }
  
  .login-form-panel {
    padding: 1.5rem;
  }
  
  .form-title {
    font-size: 1.5rem;
  }
  
  .form-options {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
}
</style>

