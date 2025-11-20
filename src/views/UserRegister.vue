<template>
  <div class="registro-container">
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
    <div class="registro-card">
      <div class="registro-header">
        <h2>Crear cuenta</h2>
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

        <div class="form-section">
          <h3 class="section-title">Información personal</h3>
          <div class="personal-fields">
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
          <h3 class="section-title">Información de cuenta</h3>
          <div class="account-fields">
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
              <select id="orgName" v-model="form.orgName" @change="onOrganizationChange" class="form-input form-select">
                <option value="">Selecciona una organización</option>
                <option v-for="org in organizations" :key="org.id" :value="org.name">
                  {{ org.name }}
                </option>
              </select>
            </div>

            <div v-if="selectedOrganization" class="org-info-readonly">
              <div class="info-item">
                <span class="info-label">Tipo:</span>
                <span class="info-value">{{ selectedOrganization.industry }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Tamaño:</span>
                <span class="info-value">{{ selectedOrganization.industrySize }}</span>
              </div>
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
import { reactive, ref, onMounted, computed } from 'vue'
import { register } from '@/services/authService.js'
import organizationService from '@/services/organizationService'

const organizations = ref([])
const selectedOrganization = computed(() => {
  if (!form.orgName) return null
  return organizations.value.find(org => org.name === form.orgName)
})

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
  acceptedTerms: false
})

const registrationSuccess = ref(false)
const errorMsg = ref('')
const loading = ref(false)

function onOrganizationChange() {
  // La organización seleccionada se actualiza automáticamente a través del computed
}

onMounted(async () => {
  try {
    const orgsRes = await organizationService.getAll()
    organizations.value = orgsRes.data
  } catch (error) {
    console.error('Error al cargar organizaciones:', error)
  }
})

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
      industry: selectedOrganization.value?.industry || '',
      industrySize: selectedOrganization.value?.industrySize || ''
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
.registro-container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 1rem;
  font-family: 'Roboto', sans-serif;
}

.registro-card {
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  padding: 2.5rem;
}

.registro-header {
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.registro-header h2 {
  font-size: 1.75rem;
  font-weight: 600;
  color: #56005b;
  margin-bottom: 0.5rem;
}

.registro-subtitle {
  color: #6b7280;
  font-size: 0.95rem;
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

.form-section {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #56005b;
  margin-bottom: 1.25rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e5e7eb;
}

.personal-fields,
.account-fields {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
}

.org-fields {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
}

.org-info-readonly {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #56005b;
}

.info-value {
  font-size: 0.95rem;
  color: #374151;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
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

.form-select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23374151' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  padding-right: 2.5rem;
}

.form-select:focus {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2356005b' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
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
  background: #56005b;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  font-family: 'Roboto', sans-serif;
  cursor: pointer;
  transition: background-color 0.2s ease;
  margin-top: 1rem;
}

.submit-button:hover:not(:disabled) {
  background: #7a007f;
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 1024px) {
  .personal-fields,
  .account-fields {
    grid-template-columns: 1fr;
  }
  
  .org-fields {
    grid-template-columns: 1fr;
  }
  
  .org-info-readonly {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .registro-card {
    padding: 2rem 1.5rem;
  }
  
  .registro-header h2 {
    font-size: 1.6rem;
  }
  
  .personal-fields,
  .account-fields,
  .org-fields {
    grid-template-columns: 1fr;
  }
}
</style>
