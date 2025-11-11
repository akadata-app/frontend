<template>
  <div class="registro-wrapper">
    <!-- Overlay de éxito -->
    <div v-if="registrationSuccess" class="success-overlay">
      <div class="success-content">
        <div class="check-icon">✓</div>
        <div class="success-box">
          <h3>¡Bienvenido, {{ form.primerNombre }}!</h3>
          <p>Te damos la bienvenida, ahora puedes acceder a nuestras herramientas.</p>
          <p class="email">{{ form.email }}</p>
        </div>
      </div>
    </div>

    <!-- Formulario -->
    <div class="registro-container">
      <div class="registro-header">
        <h1>Crear cuenta</h1>
        <p class="registro-subtitle">Únete a AKADATA y accede a todas nuestras herramientas</p>
      </div>

      <form
        class="registro-form"
        :class="{ blurred: registrationSuccess }"
        @submit.prevent="submitForm"
      >
        <div v-if="errorMsg" class="error-message">
          <span class="error-icon">⚠</span>
          {{ errorMsg }}
        </div>

        <div class="form-columns">
          <!-- Columna izquierda -->
          <div class="form-col">
            <h3 class="section-title">Información personal</h3>
            
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

          <!-- Columna derecha -->
          <div class="form-col">
            <h3 class="section-title">Información de cuenta</h3>
            
            <div class="form-group">
              <label for="email">Correo electrónico *</label>
              <input type="email" id="email" v-model="form.email" required class="form-input" placeholder="tu@correo.com" />
            </div>
            
            <div class="form-group">
              <label for="confirmEmail">Confirmar correo electrónico *</label>
              <input type="email" id="confirmEmail" v-model="form.confirmEmail" required class="form-input" placeholder="tu@correo.com" />
            </div>
            
            <div class="form-group">
              <label for="password">Contraseña *</label>
              <input type="password" id="password" v-model="form.password" required class="form-input" placeholder="••••••••" />
            </div>
            
            <div class="form-group">
              <label for="confirmPassword">Confirmar contraseña *</label>
              <input type="password" id="confirmPassword" v-model="form.confirmPassword" required class="form-input" placeholder="••••••••" />
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3 class="section-title">Información organizacional</h3>
          <div class="org-fields">
            <div class="form-group">
              <label for="orgName">Nombre de organización</label>
              <input type="text" id="orgName" v-model="form.orgName" class="form-input" />
            </div>
            
            <div class="form-group">
              <label for="orgType">Tipo de organización</label>
              <input type="text" id="orgType" v-model="form.orgType" class="form-input" />
            </div>
            
            <div class="form-group">
              <label for="orgSize">Tamaño de la organización</label>
              <input type="text" id="orgSize" v-model="form.orgSize" class="form-input" />
            </div>
          </div>
        </div>

        <div class="checkbox-group">
          <input type="checkbox" id="terms" v-model="form.acceptedTerms" required class="checkbox-input" />
          <label for="terms" class="checkbox-label">
            Acepto la <a href="#" class="link">política de privacidad</a> y <a href="#" class="link">términos de uso</a> *
          </label>
        </div>

        <button type="submit" class="submit-button" :disabled="loading">
          {{ loading ? 'Registrando...' : 'Crear cuenta' }}
        </button>
      </form>
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
    errorMsg.value = 'Por favor verifica que los datos estén correctos.'
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
      errorMsg.value = 'Error al registrar usuario. Por favor, verifica tu conexión e intenta de nuevo.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.registro-wrapper {
  position: relative;
  min-height: calc(100vh - 200px);
  padding: 2rem;
  background: #ffffff;
  font-family: 'Roboto', sans-serif;
}

.registro-container {
  max-width: 1000px;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  padding: 2.5rem;
}

.registro-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.registro-header h1 {
  font-size: 1.75rem;
  font-weight: 600;
  color: #56005b;
  margin-bottom: 0.5rem;
}

.registro-subtitle {
  color: #6b7280;
  font-size: 1rem;
  margin: 0;
}

.success-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.success-content {
  background: #ffffff;
  border-radius: 8px;
  padding: 2.5rem;
  text-align: center;
  max-width: 500px;
  border: 1px solid #e5e7eb;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.check-icon {
  width: 60px;
  height: 60px;
  background: #6d8e5a;
  color: white;
  font-size: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
}

.success-box h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.75rem;
}

.success-box p {
  color: #4b5563;
  font-size: 1rem;
  margin: 0.5rem 0;
  line-height: 1.6;
}

.success-box .email {
  color: #56005b;
  font-weight: 600;
  font-size: 1.1rem;
  margin-top: 1rem;
}

.blurred {
  filter: blur(4px);
  pointer-events: none;
  user-select: none;
}

.registro-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #dc2626;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  padding: 0.875rem 1rem;
  font-size: 0.9rem;
}

.error-icon {
  font-size: 1.2rem;
}

.form-columns {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2.5rem;
}

.form-section {
  margin-top: 1rem;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #56005b;
  margin-bottom: 1.25rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e5e7eb;
}

.org-fields {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
}

.form-input {
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
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
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
  color: #7a007f;
  text-decoration: underline;
}

.submit-button {
  width: 100%;
  padding: 0.875rem 2rem;
  background: #ffc700;
  color: #1c1c1c;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  font-family: 'Roboto', sans-serif;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.submit-button:hover:not(:disabled) {
  background: #e2a100;
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 1024px) {
  .form-columns {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .org-fields {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .registro-container {
    padding: 2rem 1.5rem;
  }
  
  .registro-header h1 {
    font-size: 1.8rem;
  }
  
  .org-fields {
    grid-template-columns: 1fr;
  }
}
</style>
