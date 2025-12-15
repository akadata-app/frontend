<template>
  <div class="registro-wrapper">
    <div v-if="registrationSuccess" class="success-overlay">
      <div class="success-content">
        <div class="check-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <div class="success-box">
          <h3>Bienvenido, {{ form.primerNombre }}!</h3>
          <p>Te damos la bienvenida, ahora puedes acceder a nuestras herramientas.</p>
          <p class="email">{{ form.email }}</p>
          <a href="/" class="success-btn">Ir al inicio</a>
        </div>
      </div>
    </div>

    <div class="registro-container" :class="{ blurred: registrationSuccess }">
      <div class="registro-sidebar">
        <div class="sidebar-content">
          <div class="sidebar-badge">AKADATA</div>
          <h2>Unete a nuestra plataforma</h2>
          <p>Accede a herramientas de diagnostico, evaluacion y seguimiento para la gobernanza de datos en tu institucion.</p>
          <ul class="sidebar-features">
            <li>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Herramientas de evaluacion
            </li>
            <li>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Recursos abiertos
            </li>
            <li>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Reportes personalizados
            </li>
          </ul>
        </div>
      </div>

      <div class="registro-main">
        <div class="registro-header">
          <h1>Crear cuenta</h1>
          <p class="registro-subtitle">Completa tus datos para comenzar</p>
        </div>

        <form class="registro-form" @submit.prevent="submitForm">
          <div v-if="errorMsg" class="error-message">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {{ errorMsg }}
          </div>

          <div class="form-section">
            <h3 class="section-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="8" r="4"/>
                <path d="M20 21a8 8 0 1 0-16 0"/>
              </svg>
              Informacion personal
            </h3>
            
            <div class="form-grid">
              <div class="form-group">
                <label for="primerNombre">Primer nombre *</label>
                <input type="text" id="primerNombre" v-model="form.primerNombre" required class="form-input" />
              </div>
              
              <div class="form-group">
                <label for="segundoNombre">Segundo nombre</label>
                <input type="text" id="segundoNombre" v-model="form.segundoNombre" class="form-input" />
              </div>
              
              <div class="form-group">
                <label for="primerApellido">Primer apellido *</label>
                <input type="text" id="primerApellido" v-model="form.primerApellido" required class="form-input" />
              </div>
              
              <div class="form-group">
                <label for="segundoApellido">Segundo apellido</label>
                <input type="text" id="segundoApellido" v-model="form.segundoApellido" class="form-input" />
              </div>
            </div>
          </div>

          <div class="form-section">
            <h3 class="section-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Informacion de cuenta
            </h3>
            
            <div class="form-grid">
              <div class="form-group">
                <label for="email">Correo electronico *</label>
                <input type="email" id="email" v-model="form.email" required class="form-input" placeholder="tu@correo.com" />
              </div>
              
              <div class="form-group">
                <label for="confirmEmail">Confirmar correo *</label>
                <input type="email" id="confirmEmail" v-model="form.confirmEmail" required class="form-input" placeholder="tu@correo.com" />
              </div>
              
              <div class="form-group">
                <label for="password">Contrasena *</label>
                <input type="password" id="password" v-model="form.password" required class="form-input" placeholder="Min. 8 caracteres" />
              </div>
              
              <div class="form-group">
                <label for="confirmPassword">Confirmar contrasena *</label>
                <input type="password" id="confirmPassword" v-model="form.confirmPassword" required class="form-input" />
              </div>
            </div>
          </div>

          <div class="form-section">
            <h3 class="section-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              Informacion organizacional
              <span class="optional-tag">Opcional</span>
            </h3>
            
            <div class="form-grid form-grid-3">
              <div class="form-group">
                <label for="orgName">Nombre de organizacion</label>
                <input type="text" id="orgName" v-model="form.orgName" class="form-input" />
              </div>
              
              <div class="form-group">
                <label for="orgType">Tipo de organizacion</label>
                <input type="text" id="orgType" v-model="form.orgType" class="form-input" />
              </div>
              
              <div class="form-group">
                <label for="orgSize">Tamano</label>
                <input type="text" id="orgSize" v-model="form.orgSize" class="form-input" />
              </div>
            </div>
          </div>

          <div class="checkbox-group">
            <input type="checkbox" id="terms" v-model="form.acceptedTerms" required class="checkbox-input" />
            <label for="terms" class="checkbox-label">
              Acepto la <a href="#" class="link">politica de privacidad</a> y <a href="#" class="link">terminos de uso</a>
            </label>
          </div>

          <button type="submit" class="submit-button" :disabled="loading">
            <span v-if="loading" class="spinner"></span>
            {{ loading ? 'Creando cuenta...' : 'Crear cuenta' }}
          </button>

          <p class="login-link">
            Ya tienes cuenta? <a href="/" class="link">Inicia sesion</a>
          </p>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { register } from '@/services/authService.js'

const form = reactive({
  primerNombre: '',
  segundoNombre: '',
  primerApellido: '',
  segundoApellido: '',
  email: '',
  confirmEmail: '',
  password: '',
  confirmPassword: '',
  orgName: '',
  orgType: '',
  orgSize: '',
  acceptedTerms: false
})

const registrationSuccess = ref(false)
const errorMsg = ref('')
const loading = ref(false)

async function submitForm() {
  errorMsg.value = ''
  if (
    form.email !== form.confirmEmail ||
    form.password !== form.confirmPassword ||
    !form.acceptedTerms
  ) {
    errorMsg.value = 'Por favor verifica que los datos esten correctos.'
    return
  }
  loading.value = true
  try {
    const userData = {
      name: `${form.primerNombre} ${form.primerApellido}`.trim(),
      nameSecond: `${form.segundoNombre} ${form.segundoApellido}`.trim(),
      email: form.email,
      password: form.password,
      organizationName: form.orgName,
      industry: form.orgType,
      industrySize: form.orgSize
    }
    await register(userData)
    registrationSuccess.value = true
  } catch (error) {
    console.error('Error al registrar:', error)
    if (error.response) {
      errorMsg.value = error.response.data || error.response.statusText || 'Error al registrar usuario.'
    } else if (error.message) {
      errorMsg.value = error.message
    } else {
      errorMsg.value = 'Error al registrar usuario. Por favor, verifica tu conexion e intenta de nuevo.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.registro-wrapper {
  position: relative;
  min-height: calc(100vh - 140px);
  background: linear-gradient(135deg, #fafafa 0%, #f0f0f0 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.registro-container {
  display: flex;
  max-width: 1100px;
  width: 100%;
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

.registro-sidebar {
  width: 320px;
  min-width: 320px;
  background: linear-gradient(135deg, #56005b 0%, #7b1fa2 50%, #9c27b0 100%);
  padding: 3rem 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.registro-sidebar::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
}

.sidebar-content {
  position: relative;
  z-index: 1;
  color: white;
}

.sidebar-badge {
  display: inline-block;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 1px;
  margin-bottom: 1.5rem;
}

.sidebar-content h2 {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 1rem;
  line-height: 1.3;
}

.sidebar-content p {
  font-size: 0.9rem;
  line-height: 1.7;
  opacity: 0.9;
  margin: 0 0 2rem;
}

.sidebar-features {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar-features li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  opacity: 0.9;
}

.sidebar-features svg {
  color: #4caf50;
}

.registro-main {
  flex: 1;
  padding: 2.5rem;
  overflow-y: auto;
}

.registro-header {
  margin-bottom: 2rem;
}

.registro-header h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 0.5rem;
}

.registro-subtitle {
  color: #6b7280;
  font-size: 1rem;
  margin: 0;
}

.success-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.success-content {
  background: white;
  border-radius: 20px;
  padding: 3rem;
  text-align: center;
  max-width: 420px;
  animation: slideUp 0.4s ease;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

.check-icon {
  width: 72px;
  height: 72px;
  background: linear-gradient(135deg, #2e7d32 0%, #4caf50 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  box-shadow: 0 8px 24px rgba(76, 175, 80, 0.4);
}

.success-box h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 0.75rem;
}

.success-box p {
  color: #6b7280;
  font-size: 1rem;
  margin: 0.5rem 0;
  line-height: 1.6;
}

.success-box .email {
  color: #56005b;
  font-weight: 600;
  font-size: 1rem;
  margin: 1rem 0;
}

.success-btn {
  display: inline-block;
  margin-top: 1.5rem;
  padding: 0.875rem 2rem;
  background: linear-gradient(135deg, #56005b 0%, #7b1fa2 100%);
  color: white;
  text-decoration: none;
  border-radius: 10px;
  font-weight: 600;
  transition: all 0.2s ease;
  box-shadow: 0 4px 14px rgba(86, 0, 91, 0.35);
}

.success-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(86, 0, 91, 0.45);
}

.blurred {
  filter: blur(4px);
  pointer-events: none;
}

.registro-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #dc2626;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  padding: 1rem 1.25rem;
  font-size: 0.9rem;
}

.form-section {
  background: #fafafa;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #f0f0f0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 1.25rem;
}

.section-title svg {
  color: #56005b;
}

.optional-tag {
  font-size: 0.7rem;
  font-weight: 500;
  color: #9ca3af;
  background: #e5e7eb;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  margin-left: auto;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.form-grid-3 {
  grid-template-columns: repeat(3, 1fr);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #374151;
}

.form-input {
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 0.95rem;
  color: #1f2937;
  background: white;
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: #56005b;
  box-shadow: 0 0 0 4px rgba(86, 0, 91, 0.1);
}

.form-input::placeholder {
  color: #9ca3af;
}

.checkbox-group {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  background: #f3e5f5;
  border-radius: 12px;
}

.checkbox-input {
  width: 20px;
  height: 20px;
  margin-top: 2px;
  cursor: pointer;
  accent-color: #56005b;
  flex-shrink: 0;
}

.checkbox-label {
  font-size: 0.9rem;
  color: #4b5563;
  line-height: 1.5;
  cursor: pointer;
  margin: 0;
}

.link {
  color: #56005b;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s ease;
}

.link:hover {
  color: #7b1fa2;
}

.submit-button {
  width: 100%;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #ffc107 0%, #ffb300 100%);
  color: #1a1a1a;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-shadow: 0 4px 14px rgba(255, 193, 7, 0.35);
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 193, 7, 0.45);
}

.submit-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(0, 0, 0, 0.2);
  border-top-color: #1a1a1a;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.login-link {
  text-align: center;
  color: #6b7280;
  font-size: 0.9rem;
  margin: 0;
}

@media (max-width: 900px) {
  .registro-sidebar {
    display: none;
  }
  
  .registro-main {
    padding: 2rem;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .form-grid-3 {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .registro-wrapper {
    padding: 1rem;
  }
  
  .registro-main {
    padding: 1.5rem;
  }
  
  .form-section {
    padding: 1rem;
  }
}
</style>
