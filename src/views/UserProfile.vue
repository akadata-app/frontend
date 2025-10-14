<template>
  <div class="profile-container" v-if="user">
    <h2>Mi perfil</h2>
    <form @submit.prevent="onSubmit" class="profile-form">
      <label>Primer nombre</label>
      <input v-model="form.name" />

      <label>Segundo nombre</label>
      <input v-model="form.nameSecond" />

      <label>Correo electrónico</label>
      <input v-model="form.email"/>

      <label>Organización</label>
      <input v-model="form.organizationName" />

      <label>Tipo de organización</label>
      <input v-model="form.industry" />

      <label>Tamaño de la organización</label>
      <input v-model="form.industrySize" />

      <label>Nueva contraseña</label>
      <input type="password" v-model="form.newPassword" />

      <label>Contraseña actual <span style="color:red">*</span></label>
      <input type="password" v-model="form.currentPassword" required />

      <button type="submit">Actualizar</button>
      <div v-if="successMsg" class="success">{{ successMsg }}</div>
      <div v-if="errorMsg" class="error">{{ errorMsg }}</div>
    </form>
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
  max-width: 400px;
  margin: 2rem auto;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  padding: 2rem 2.5rem;
}

.profile-container h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #32621c;
}

.profile-form label {
  display: block;
  margin-top: 1rem;
  margin-bottom: 0.3rem;
  font-weight: 500;
}

.profile-form input,
.profile-form select {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #b5c9b0;
  border-radius: 6px;
  margin-bottom: 0.5rem;
  font-size: 1rem;
}

.profile-form input[disabled] {
  background: #f4f4f4;
  color: #888;
}

.profile-form button {
  margin-top: 1.5rem;
  width: 100%;
  padding: 0.7rem;
  background: #32621c;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.profile-form button:hover {
  background: #274e17;
}

.success {
  margin-top: 1rem;
  color: #218838;
  font-weight: 500;
  text-align: center;
}

.error {
  margin-top: 1rem;
  color: #c82333;
  font-weight: 500;
  text-align: center;
}
</style>
