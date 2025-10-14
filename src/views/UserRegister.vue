<template>
  <div class="registro-wrapper">
    <!-- Overlay de succès -->
    <div v-if="registrationSuccess" class="success-overlay">
      <div class="check-icon">✔</div>
      <div class="success-box">
        <p><strong>Hola, {{ form.primerNombre }}.</strong></p>
        <p>Te damos la bienvenida, ahora puedes acceder a nuestras herramientas.</p>
        <p class="email">{{ form.email }}</p>
      </div>
    </div>

    <!-- Formulaire toujours visible mais flouté si succès -->
    <form
      class="registro-form"
      :class="{ blurred: registrationSuccess }"
      @submit.prevent="submitForm"
    >
      <div class="form-columns">
        <!-- Colonne gauche -->
        <div class="form-col">
          <div class="form-group">
            <label for="primerNombre">Primer nombre *</label>
            <input type="text" id="primerNombre" v-model="form.primerNombre" required />
          </div>
          <div class="form-group">
            <label for="segundoNombre">Segundo nombre</label>
            <input type="text" id="segundoNombre" v-model="form.segundoNombre" />
          </div>
          <div class="form-group">
            <label for="primerApellido">Primer apellido *</label>
            <input type="text" id="primerApellido" v-model="form.primerApellido" required />
          </div>
          <div class="form-group">
            <label for="segundoApellido">Segundo apellido</label>
            <input type="text" id="segundoApellido" v-model="form.segundoApellido" />
          </div>
          <div class="form-group">
            <label for="email">Correo electrónico *</label>
            <input type="email" id="email" v-model="form.email" required />
          </div>
          <div class="form-group">
            <label for="confirmEmail">Confirmación de correo electrónico *</label>
            <input type="email" id="confirmEmail" v-model="form.confirmEmail" required />
          </div>
          <div class="form-group">
            <label for="password">Contraseña *</label>
            <input type="password" id="password" v-model="form.password" required />
          </div>
          <div class="form-group">
            <label for="confirmPassword">Confirmación de contraseña *</label>
            <input type="password" id="confirmPassword" v-model="form.confirmPassword" required />
          </div>
        </div>

        <!-- Colonne droite -->
        <div class="form-col">
          <div class="form-group">
            <label for="orgName">Nombre de organización</label>
            <input type="text" id="orgName" v-model="form.orgName" />
          </div>
          <div class="form-group">
            <label for="orgType">Tipo de organización</label>
            <input type="text" id="orgType" v-model="form.orgType" />
          </div>
          <div class="form-group">
            <label for="orgSize">Tamaño de la organización</label>
            <input type="text" id="orgSize" v-model="form.orgSize" />
          </div>

          <div class="checkbox-group">
            <input type="checkbox" id="terms" v-model="form.acceptedTerms" required />
            <label for="terms">Política de privacidad y términos de uso *</label>
          </div>

          <button type="submit" class="submit-button">Continuar</button>
        </div>
      </div>
    </form>
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
    errorMsg.value = error.response?.data || 'Error al registrar usuario.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Wrapper avec position relative pour superposition */
.registro-wrapper {
  position: relative;
  min-height: 100vh;
  padding: 2rem;
}

/* Overlay vert semi-transparent */
.success-overlay {
  position: absolute;
  inset: 0;
  background-color: rgba(93, 130, 81, 0.85); /* vert avec opacité */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: 2rem; /* ✅ Bord arrondi ajouté */
  margin: 2rem;         /* ✅ Ajoute un peu d’espace autour */
}


.check-icon {
  background-color: #4c1044;
  color: white;
  font-size: 3rem;
  border-radius: 50%;
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.success-box {
  background-color: #ddd;
  padding: 2rem 3rem;
  border-radius: 1rem;
  text-align: center;
  max-width: 400px;
  font-size: 0.95rem;
}

.success-box .email {
  color: #999;
  margin-top: 0.5rem;
  font-size: 0.85rem;
}

/* Ajout de flou quand success */
.blurred {
  filter: blur(4px);
  pointer-events: none;
  user-select: none;
}

/* Formulaire */
.registro-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
}

.form-columns {
  display: flex;
  gap: 3rem;
  width: 100%;
  max-width: 1000px;
  justify-content: center;
}

.form-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

label {
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

input[type="text"],
input[type="email"],
input[type="password"] {
  padding: 0.7rem;
  border: none;
  background-color: #e0e0e0;
  border-radius: 1.5rem;
  font-size: 1rem;
}

.checkbox-group {
  display: flex;
  align-items: center;
  margin-top: 1rem;
  font-size: 0.9rem;
  gap: 0.5rem;
}

.submit-button {
  margin-top: 2rem;
  background-color: #f9b115;
  color: black;
  border: none;
  border-radius: 999px;
  padding: 0.6rem 1.8rem;
  font-weight: 600;
  font-size: 1rem;
  box-shadow: 2px 2px 5px #ccc;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.submit-button:hover {
  background-color: #e2a100;
}
</style>
