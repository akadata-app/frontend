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
          <h3 class="section-title">Cambiar contraseña</h3>
          
          <div class="form-group">
            <label>Nueva contraseña</label>
            <input type="password" v-model="form.newPassword" class="form-input" placeholder="Dejar vacío para no cambiar" />
          </div>

          <div class="form-group">
            <label>Contraseña actual <span class="required">*</span></label>
            <input type="password" v-model="form.currentPassword" required class="form-input" placeholder="Ingresa tu contraseña actual" />
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
import { getUserInfo, updateUserInfo, getUserRoles } from '@/services/authService.js'

const user = ref(null)
const roles = ref([])
const form = ref({
  name: '',
  nameSecond: '',
  email: '',
  organizationName: '',
  industry: '',
  industrySize: '',
  role: '',
  newPassword: '',
  currentPassword: ''
})
const successMsg = ref('')
const errorMsg = ref('')

onMounted(async () => {
  try {
    const [userRes, rolesRes] = await Promise.all([
      getUserInfo(),
      getUserRoles()
    ])
    user.value = userRes.data
    Object.assign(form.value, userRes.data)
    roles.value = rolesRes.data
  } catch (e) {
    errorMsg.value = "No se pudo cargar la información del usuario o los roles."
  }
})

async function onSubmit() {
  errorMsg.value = ''
  successMsg.value = ''
  try {
    const oldEmail = user.value.email
    await updateUserInfo(form.value)
    localStorage.setItem('userRole', form.value.role)
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
    form.value.newPassword = ''
    form.value.currentPassword = ''
  } catch (e) {
    errorMsg.value = e.response?.data || "Error al actualizar el perfil."
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
