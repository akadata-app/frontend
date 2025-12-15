<template>
  <div class="profile-page" v-if="user">
    <aside class="profile-sidebar">
      <div class="sidebar-header">
        <div class="user-avatar">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="8" r="4"/>
            <path d="M20 21a8 8 0 1 0-16 0"/>
          </svg>
        </div>
        <h3 class="user-name">{{ form.name || 'Usuario' }}</h3>
        <p class="user-email">{{ form.email }}</p>
        <span class="user-role" :class="user.role === 'ADMIN' ? 'role-admin' : 'role-user'">
          {{ user.role === 'ADMIN' ? 'Administrador' : 'Usuario' }}
        </span>
      </div>

      <nav class="sidebar-nav">
        <button 
          class="nav-item" 
          :class="{ active: activeSection === 'personal' }"
          @click="activeSection = 'personal'"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="8" r="4"/>
            <path d="M20 21a8 8 0 1 0-16 0"/>
          </svg>
          Informacion Personal
        </button>
        <button 
          class="nav-item" 
          :class="{ active: activeSection === 'organization' }"
          @click="activeSection = 'organization'"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          Organizacion
        </button>
        <button 
          class="nav-item" 
          :class="{ active: activeSection === 'security' }"
          @click="activeSection = 'security'"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          Seguridad
        </button>
      </nav>
    </aside>

    <main class="profile-main">
      <form @submit.prevent="onSubmit" class="profile-form">
        <!-- Seccion: Informacion Personal -->
        <section v-show="activeSection === 'personal'" class="form-section">
          <div class="section-header">
            <h2>Informacion Personal</h2>
            <p>Actualiza tu informacion de contacto</p>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label for="name">Primer nombre</label>
              <input id="name" v-model="form.name" type="text" class="form-input" />
            </div>

            <div class="form-group">
              <label for="nameSecond">Segundo nombre</label>
              <input id="nameSecond" v-model="form.nameSecond" type="text" class="form-input" />
            </div>

            <div class="form-group full-width">
              <label for="email">Correo electronico</label>
              <input id="email" v-model="form.email" type="email" class="form-input" />
            </div>
          </div>
        </section>

        <!-- Seccion: Organizacion -->
        <section v-show="activeSection === 'organization'" class="form-section">
          <div class="section-header">
            <h2>Informacion de la Organizacion</h2>
            <p>Datos de tu institucion o empresa</p>
          </div>

          <div class="form-grid">
            <div class="form-group full-width">
              <label for="organizationName">Nombre de la organizacion</label>
              <input id="organizationName" v-model="form.organizationName" type="text" class="form-input" />
            </div>

            <div class="form-group">
              <label for="industry">Tipo de organizacion</label>
              <input id="industry" v-model="form.industry" type="text" class="form-input" />
            </div>

            <div class="form-group">
              <label for="industrySize">Tamano</label>
              <input id="industrySize" v-model="form.industrySize" type="text" class="form-input" />
            </div>
          </div>
        </section>

        <!-- Seccion: Seguridad -->
        <section v-show="activeSection === 'security'" class="form-section">
          <div class="section-header">
            <h2>Seguridad de la Cuenta</h2>
            <p>Gestiona tu contrasena</p>
          </div>

          <div class="form-grid">
            <div class="form-group full-width">
              <label for="currentPassword">Contrasena actual <span class="required">*</span></label>
              <input 
                id="currentPassword"
                type="password" 
                v-model="form.currentPassword" 
                class="form-input" 
                placeholder="Requerida para guardar cambios"
              />
              <span class="field-hint">Se requiere para confirmar cualquier cambio en tu perfil</span>
            </div>

            <div class="form-group full-width">
              <label for="newPassword">Nueva contrasena</label>
              <input 
                id="newPassword"
                type="password" 
                v-model="form.newPassword" 
                class="form-input" 
                placeholder="Dejar vacio para mantener la actual"
              />
            </div>
          </div>
        </section>

        <!-- Mensajes y Boton -->
        <div class="form-footer">
          <div v-if="successMsg" class="message success">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            {{ successMsg }}
          </div>
          
          <div v-if="errorMsg" class="message error">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {{ errorMsg }}
          </div>

          <button type="submit" class="btn-submit">
            Guardar cambios
          </button>
        </div>
      </form>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getUserInfo, updateUserInfo } from '@/services/authService.js'

const user = ref(null)
const activeSection = ref('personal')
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
    errorMsg.value = "No se pudo cargar la informacion del usuario."
  }
})

async function onSubmit() {
  errorMsg.value = ''
  successMsg.value = ''
  
  if (!form.value.currentPassword || form.value.currentPassword.trim() === '') {
    errorMsg.value = 'Debes ingresar tu contrasena actual para actualizar el perfil.'
    return
  }
  
  try {
    const oldEmail = user.value.email
    
    const updateData = {
      name: form.value.name,
      nameSecond: form.value.nameSecond,
      email: form.value.email,
      organizationName: form.value.organizationName,
      industry: form.value.industry,
      industrySize: form.value.industrySize,
      currentPassword: form.value.currentPassword
    }
    
    if (form.value.newPassword && form.value.newPassword.trim() !== '') {
      updateData.newPassword = form.value.newPassword.trim()
    }
    
    await updateUserInfo(updateData)
    
    if (form.value.email !== oldEmail) {
      successMsg.value = "Correo actualizado. Por favor, inicia sesion nuevamente."
      setTimeout(() => {
        localStorage.removeItem('jwtToken')
        localStorage.removeItem('userName')
        localStorage.removeItem('userRole')
        window.location.href = '/'
      }, 2000)
    } else {
      successMsg.value = "Perfil actualizado correctamente."
    }
    
    user.value = { ...user.value, ...updateData }
    form.value.newPassword = ''
    form.value.currentPassword = ''
    
    try {
      const userRes = await getUserInfo()
      user.value = userRes.data
      Object.assign(form.value, userRes.data)
      form.value.currentPassword = ''
      form.value.newPassword = ''
    } catch (refreshError) {
      console.warn('No se pudo recargar la informacion del usuario:', refreshError)
    }
  } catch (e) {
    console.error('Error al actualizar perfil:', e)
    if (e.response?.status === 403) {
      errorMsg.value = e.response?.data?.message || e.response?.data || 'Contrasena actual incorrecta.'
    } else if (e.response?.status === 400) {
      errorMsg.value = e.response?.data?.message || e.response?.data || 'Error en los datos proporcionados.'
    } else {
      errorMsg.value = e.response?.data?.message || e.response?.data || "Error al actualizar el perfil."
    }
  }
}
</script>

<style scoped>
.profile-page {
  display: flex;
  min-height: calc(100vh - 140px);
  background: #f8f9fa;
}

/* Sidebar */
.profile-sidebar {
  width: 280px;
  min-width: 280px;
  background: white;
  border-right: 1px solid #e9ecef;
  padding: 2rem 0;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 0 1.5rem 2rem;
  border-bottom: 1px solid #e9ecef;
  text-align: center;
}

.user-avatar {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #56005b 0%, #7b1fa2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  color: white;
}

.user-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 0.25rem;
}

.user-email {
  font-size: 0.85rem;
  color: #6c757d;
  margin: 0 0 0.75rem;
  word-break: break-all;
}

.user-role {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.role-admin {
  background: #f3e5f5;
  color: #7b1fa2;
}

.role-user {
  background: #e8f5e9;
  color: #2e7d32;
}

.sidebar-nav {
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  border: none;
  background: transparent;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #495057;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  width: 100%;
}

.nav-item:hover {
  background: #f8f9fa;
}

.nav-item.active {
  background: #f3e5f5;
  color: #56005b;
  font-weight: 600;
}

.nav-item svg {
  flex-shrink: 0;
}

/* Main Content */
.profile-main {
  flex: 1;
  padding: 2rem 3rem;
  overflow-y: auto;
}

.profile-form {
  max-width: 600px;
}

.form-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  border: 1px solid #e9ecef;
}

.section-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e9ecef;
}

.section-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 0.25rem;
}

.section-header p {
  font-size: 0.9rem;
  color: #6c757d;
  margin: 0;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-size: 0.85rem;
  font-weight: 500;
  color: #495057;
}

.required {
  color: #dc3545;
}

.form-input {
  padding: 0.75rem 1rem;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 0.95rem;
  color: #1a1a1a;
  background: #fff;
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

.field-hint {
  font-size: 0.8rem;
  color: #6c757d;
}

/* Footer */
.form-footer {
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
}

.message.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.message.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.btn-submit {
  padding: 0.875rem 2rem;
  background: #56005b;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
}

.btn-submit:hover {
  background: #7b1fa2;
}

/* Responsive */
@media (max-width: 900px) {
  .profile-page {
    flex-direction: column;
  }
  
  .profile-sidebar {
    width: 100%;
    min-width: 100%;
    border-right: none;
    border-bottom: 1px solid #e9ecef;
    padding: 1.5rem 0;
  }
  
  .sidebar-header {
    padding: 0 1.5rem 1.5rem;
  }
  
  .sidebar-nav {
    flex-direction: row;
    overflow-x: auto;
    padding: 1rem;
    gap: 0.5rem;
  }
  
  .nav-item {
    white-space: nowrap;
    padding: 0.75rem 1rem;
  }
  
  .profile-main {
    padding: 1.5rem;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .form-group.full-width {
    grid-column: 1;
  }
}
</style>
