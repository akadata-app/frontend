<template>
  <div class="profile-container" v-if="user">
    <div class="profile-card">
      <div class="profile-header">
        <h2>Mi perfil</h2>
        <p class="profile-subtitle">Gestiona tu información personal y de cuenta</p>
      </div>
      
      <form @submit.prevent="onSubmit" class="profile-form">
        <div class="form-section">
          <h3 class="section-title">Información personal</h3>
          
          <div class="form-group">
            <label>Primer nombre</label>
            <input v-model="form.name" class="form-input" />
          </div>

          <div class="form-group">
            <label>Segundo nombre</label>
            <input v-model="form.nameSecond" class="form-input" />
          </div>

          <div class="form-group">
            <label>Correo electrónico</label>
            <input v-model="form.email" type="email" class="form-input" />
          </div>
        </div>

        <div class="form-section">
          <h3 class="section-title">Información organizacional</h3>
          
          <div class="form-group">
            <label>Organización</label>
            <input v-model="form.organizationName" class="form-input" />
          </div>

          <div class="form-group">
            <label>Tipo de organización</label>
            <input v-model="form.industry" class="form-input" />
          </div>

          <div class="form-group">
            <label>Tamaño de la organización</label>
            <input v-model="form.industrySize" class="form-input" />
          </div>
        </div>

        <div class="form-section">
          <h3 class="section-title">Seguridad</h3>
          
          <div class="form-group">
            <label>Contraseña actual <span class="required">*</span></label>
            <input 
              type="password" 
              v-model="form.currentPassword" 
              required 
              class="form-input" 
              placeholder="Ingresa tu contraseña actual para confirmar los cambios"
            />
            <p class="field-hint">
              Se requiere tu contraseña actual para actualizar cualquier información del perfil.
            </p>
          </div>

          <div class="form-group">
            <label>Nueva contraseña</label>
            <input 
              type="password" 
              v-model="form.newPassword" 
              class="form-input" 
              placeholder="Dejar vacío para no cambiar la contraseña"
            />
            <p class="field-hint">
              Solo completa este campo si deseas cambiar tu contraseña.
            </p>
          </div>
        </div>

        <div v-if="successMsg" class="success-message">
          <span class="success-icon">✓</span>
          {{ successMsg }}
        </div>
        
        <div v-if="errorMsg" class="error-message">
          <span class="error-icon">⚠</span>
          {{ errorMsg }}
        </div>

        <button type="submit" class="submit-button">Actualizar perfil</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getUserInfo, updateUserInfo } from '@/services/authService.js'

const user = ref(null)
const form = ref({
  name: '',
  nameSecond: '',
  email: '',
  organizationName: '',
  industry: '',
  industrySize: '',
  newPassword: '',
  currentPassword: ''
})
const successMsg = ref('')
const errorMsg = ref('')

onMounted(async () => {
  try {
    const userRes = await getUserInfo()
    user.value = userRes.data
    Object.assign(form.value, userRes.data)
  } catch (e) {
    errorMsg.value = "No se pudo cargar la información del usuario."
  }
})

async function onSubmit() {
  errorMsg.value = ''
  successMsg.value = ''
  
  // Validar que se haya ingresado la contraseña actual
  if (!form.value.currentPassword || form.value.currentPassword.trim() === '') {
    errorMsg.value = 'Debes ingresar tu contraseña actual para actualizar el perfil.'
    return
  }
  
  try {
    const oldEmail = user.value.email
    
    // Preparar los datos de actualización (sin incluir el rol)
    const updateData = {
      name: form.value.name,
      nameSecond: form.value.nameSecond,
      email: form.value.email,
      organizationName: form.value.organizationName,
      industry: form.value.industry,
      industrySize: form.value.industrySize,
      currentPassword: form.value.currentPassword // Siempre requerido por el backend
    }
    
    // Solo incluir nueva contraseña si se proporcionó
    if (form.value.newPassword && form.value.newPassword.trim() !== '') {
      updateData.newPassword = form.value.newPassword.trim()
    }
    
    await updateUserInfo(updateData)
    
    if (form.value.email !== oldEmail) {
      successMsg.value = "Correo actualizado. Por favor, inicia sesión nuevamente."
      setTimeout(() => {
        localStorage.removeItem('jwtToken')
        localStorage.removeItem('userName')
        localStorage.removeItem('userRole')
        window.location.href = '/'
      }, 2000)
    } else {
      successMsg.value = "Perfil actualizado correctamente."
    }
    
    // Actualizar el objeto user con los nuevos datos
    user.value = { ...user.value, ...updateData }
    
    // Limpiar campos de contraseña después de actualizar exitosamente
    form.value.newPassword = ''
    form.value.currentPassword = ''
    
    // Recargar la información del usuario para obtener los datos actualizados
    try {
      const userRes = await getUserInfo()
      user.value = userRes.data
      Object.assign(form.value, userRes.data)
      form.value.currentPassword = ''
      form.value.newPassword = ''
    } catch (refreshError) {
      console.warn('No se pudo recargar la información del usuario:', refreshError)
    }
  } catch (e) {
    console.error('Error al actualizar perfil:', e)
    if (e.response?.status === 403) {
      errorMsg.value = e.response?.data?.message || e.response?.data || 'Contraseña actual incorrecta. Por favor, verifica tu contraseña.'
    } else if (e.response?.status === 400) {
      errorMsg.value = e.response?.data?.message || e.response?.data || 'Error en los datos proporcionados. Por favor, verifica la información.'
    } else {
      errorMsg.value = e.response?.data?.message || e.response?.data || "Error al actualizar el perfil. Por favor, intenta nuevamente."
    }
  }
}
</script>

<style scoped>
.profile-container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 1rem;
  font-family: 'Roboto', sans-serif;
}

.profile-card {
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  padding: 2.5rem;
}

.profile-header {
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.profile-header h2 {
  font-size: 1.75rem;
  font-weight: 600;
  color: #56005b;
  margin-bottom: 0.5rem;
}

.profile-subtitle {
  color: #6b7280;
  font-size: 0.95rem;
  margin: 0;
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
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
  margin-bottom: 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e5e7eb;
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

.required {
  color: #dc2626;
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

.form-input[disabled] {
  background: #f9fafb;
  color: #6b7280;
  cursor: not-allowed;
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

.field-hint {
  margin: 0.5rem 0 0 0;
  font-size: 0.8rem;
  color: #6b7280;
  font-style: italic;
}

.success-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #059669;
  background: #d1fae5;
  border: 1px solid #a7f3d0;
  border-radius: 6px;
  padding: 0.875rem 1rem;
  font-size: 0.9rem;
}

.success-icon {
  font-size: 1.2rem;
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

.submit-button:hover {
  background: #7a007f;
}

/* Responsive */
@media (max-width: 768px) {
  .profile-card {
    padding: 2rem 1.5rem;
  }
  
  .profile-header h2 {
    font-size: 1.6rem;
  }
}
</style>
