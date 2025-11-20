<template>
  <div class="admin-center">
    <div class="page-header">
      <h1>Centro de administración</h1>
      <p class="subtitle">Gestiona organizaciones y usuarios del sistema.</p>
    </div>

    <!-- Tabs de navegación -->
    <div class="tabs-container">
      <button 
        @click="activeTab = 'organizations'" 
        :class="['tab-button', { active: activeTab === 'organizations' }]"
      >
        Organizaciones
      </button>
      <button 
        @click="activeTab = 'users'" 
        :class="['tab-button', { active: activeTab === 'users' }]"
      >
        Usuarios
      </button>
    </div>

    <!-- Sección de Organizaciones -->
    <div v-if="activeTab === 'organizations'" class="tab-content">
      <div class="section-header">
        <h2>Gestión de organizaciones</h2>
        <button @click="openCreateModal" class="btn-primary">
          ➕ Nueva organización
        </button>
      </div>

    <div v-if="loading" class="loading">Cargando organizaciones...</div>
    <div v-else-if="error" class="error">{{ error }}</div>

      <div v-else class="organizations-grid">
        <div v-for="org in organizations" :key="org.id" class="org-card">
          <div class="org-header">
            <h3>{{ org.name }}</h3>
            <div class="org-actions">
              <button @click="openEditModal(org)" class="btn-edit" title="Editar">
                ✏️
              </button>
              <button @click="confirmDelete(org)" class="btn-delete" title="Eliminar">
                🗑️
              </button>
            </div>
          </div>
          <div class="org-info">
            <p><strong>Tipo:</strong> {{ org.industry }}</p>
            <p><strong>Tamaño:</strong> {{ org.industrySize }}</p>
          </div>
          <p class="org-date">Creada: {{ formatDate(org.createdAt) }}</p>
        </div>

        <div v-if="organizations.length === 0" class="empty-state">
          <p>No hay organizaciones</p>
        </div>
      </div>
    </div>

    <!-- Sección de Usuarios -->
    <div v-if="activeTab === 'users'" class="tab-content">
      <div class="section-header">
        <h2>Usuarios</h2>
      </div>

      <div v-if="loadingUsers" class="loading">Cargando usuarios...</div>
      <div v-else-if="usersError" class="error">{{ usersError }}</div>

      <div v-else class="users-table-container">
        <table class="users-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Nombre</th>
              <th>Correo electrónico</th>
              <th>Organización</th>
              <th>Rol actual</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td>{{ user.username }}</td>
              <td>{{ user.firstName }} {{ user.lastName }}</td>
              <td>{{ user.email }}</td>
              <td>{{ user.organization?.name || 'Sin organización' }}</td>
              <td>
                <span :class="['role-badge', user.role.toLowerCase()]">
                  {{ user.role === 'ADMIN' ? 'Administrador' : 'Usuario' }}
                </span>
              </td>
              <td>
                <button 
                  @click="openRoleChangeModal(user)" 
                  class="btn-change-role"
                  title="Cambiar rol"
                >
                  Cambiar rol
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="users.length === 0" class="empty-state">
          <p>No hay usuarios registrados</p>
        </div>
      </div>
    </div>

    <!-- Modal para crear/editar -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ isEditing ? 'Editar Organización' : 'Nueva Organización' }}</h2>
          <button @click="closeModal" class="btn-close">✕</button>
        </div>
        <form @submit.prevent="saveOrganization" class="modal-body">
          <div class="form-group">
            <label for="orgName">Nombre *</label>
            <input
              id="orgName"
              v-model="formData.name"
              type="text"
              required
              placeholder="Ej: Universidad Nacional"
              maxlength="100"
            />
          </div>
          <div class="form-group">
            <label for="orgIndustry">Tipo *</label>
            <select
              id="orgIndustry"
              v-model="formData.industry"
              required
            >
              <option value="" disabled>Seleccione el tipo</option>
              <option value="Gubernamental">Gubernamental</option>
              <option value="Educación">Educación</option>
              <option value="Salud">Salud</option>
              <option value="Financiero">Financiero</option>
              <option value="Tecnología">Tecnología</option>
              <option value="Manufactura">Manufactura</option>
              <option value="Comercio">Comercio</option>
              <option value="Servicios">Servicios</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
          <div class="form-group">
            <label for="orgSize">Tamaño *</label>
            <select
              id="orgSize"
              v-model="formData.industrySize"
              required
            >
              <option value="" disabled>Seleccione el tamaño</option>
              <option value="1-10">1-10 empleados</option>
              <option value="11-50">11-50 empleados</option>
              <option value="51-200">51-200 empleados</option>
              <option value="201-500">201-500 empleados</option>
              <option value="501-1000">501-1000 empleados</option>
              <option value="1000+">Más de 1000 empleados</option>
            </select>
          </div>
          <div class="modal-footer">
            <button type="button" @click="closeModal" class="btn-secondary">
              Cancelar
            </button>
            <button type="submit" class="btn-primary" :disabled="saving">
              {{ saving ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal de confirmación de eliminación -->
    <div v-if="showDeleteConfirm" class="modal-overlay" @click.self="showDeleteConfirm = false">
      <div class="modal-content modal-small">
        <div class="modal-header">
          <h2>Confirmar eliminación</h2>
          <button @click="showDeleteConfirm = false" class="btn-close">✕</button>
        </div>
        <div class="modal-body">
          <p>¿Está seguro que desea eliminar la organización <strong>{{ orgToDelete?.name }}</strong>?</p>
          <p class="warning-text">⚠️ Esta acción no se puede deshacer.</p>
        </div>
        <div class="modal-footer">
          <button @click="showDeleteConfirm = false" class="btn-secondary">
            Cancelar
          </button>
          <button @click="deleteOrganization" class="btn-danger" :disabled="deleting">
            {{ deleting ? 'Eliminando...' : 'Eliminar' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal para cambiar rol de usuario -->
    <div v-if="showRoleChangeModal" class="modal-overlay" @click.self="closeRoleChangeModal">
      <div class="modal-content modal-small">
        <div class="modal-header">
          <h2>Editar usuario</h2>
          <button @click="closeRoleChangeModal" class="btn-close">✕</button>
        </div>
        <div class="modal-body">
          <p>Usuario: <strong>{{ userToChange?.username }}</strong></p>
          <p>Rol actual: <span :class="['role-badge', userToChange?.role.toLowerCase()]">
            {{ userToChange?.role === 'ADMIN' ? 'Administrador' : 'Usuario' }}
          </span></p>
          
          <div class="form-group">
            <label for="newRole">Nuevo rol:</label>
            <select id="newRole" v-model="newRole" class="role-select">
              <option value="USER">Usuario</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </div>

          <p class="info-text">
            ℹ️ Los administradores tienen acceso completo al sistema, incluyendo la gestión de organizaciones y usuarios.
          </p>
        </div>
        <div class="modal-footer">
          <button @click="closeRoleChangeModal" class="btn-secondary">
            Cancelar
          </button>
          <button @click="changeUserRole" class="btn-primary" :disabled="changingRole || newRole === userToChange?.role">
            {{ changingRole ? 'Cambiando...' : 'Cambiar rol' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import organizationService from '@/services/organizationService'
import authService from '@/services/authService'

// Tab activa
const activeTab = ref('organizations')

// Estados de organizaciones
const organizations = ref([])
const loading = ref(false)
const error = ref(null)
const showModal = ref(false)
const showDeleteConfirm = ref(false)
const isEditing = ref(false)
const saving = ref(false)
const deleting = ref(false)
const orgToDelete = ref(null)

// Estados de usuarios
const users = ref([])
const loadingUsers = ref(false)
const usersError = ref(null)
const showRoleChangeModal = ref(false)
const userToChange = ref(null)
const newRole = ref('')
const changingRole = ref(false)

const formData = ref({
  id: null,
  name: '',
  industry: '',
  industrySize: ''
})

// Watch para cargar datos cuando cambia el tab
watch(activeTab, (newTab) => {
  if (newTab === 'organizations' && organizations.value.length === 0) {
    loadOrganizations()
  } else if (newTab === 'users' && users.value.length === 0) {
    loadUsers()
  }
})

onMounted(() => {
  loadOrganizations()
})

async function loadOrganizations() {
  loading.value = true
  error.value = null
  try {
    const { data } = await organizationService.getAll()
    organizations.value = data
  } catch (err) {
    error.value = 'Error al cargar las organizaciones: ' + (err.response?.data?.message || err.message)
    console.error('Error loading organizations:', err)
  } finally {
    loading.value = false
  }
}

function openCreateModal() {
  isEditing.value = false
  formData.value = {
    id: null,
    name: '',
    industry: '',
    industrySize: ''
  }
  showModal.value = true
}

function openEditModal(org) {
  isEditing.value = true
  formData.value = {
    id: org.id,
    name: org.name,
    industry: org.industry || '',
    industrySize: org.industrySize || ''
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  formData.value = {
    id: null,
    name: '',
    industry: '',
    industrySize: ''
  }
}

async function saveOrganization() {
  if (!formData.value.name.trim()) {
    alert('El nombre es obligatorio')
    return
  }
  if (!formData.value.industry) {
    alert('El tipo es obligatorio')
    return
  }
  if (!formData.value.industrySize) {
    alert('El tamaño es obligatorio')
    return
  }

  saving.value = true
  try {
    if (isEditing.value) {
      await organizationService.update(formData.value.id, formData.value)
    } else {
      await organizationService.create(formData.value)
    }
    await loadOrganizations()
    closeModal()
  } catch (err) {
    const errorMsg = err.response?.data?.message || err.message
    alert('Error al guardar: ' + errorMsg)
    console.error('Error saving organization:', err)
  } finally {
    saving.value = false
  }
}

function confirmDelete(org) {
  orgToDelete.value = org
  showDeleteConfirm.value = true
}

async function deleteOrganization() {
  if (!orgToDelete.value) return

  deleting.value = true
  try {
    await organizationService.delete(orgToDelete.value.id)
    await loadOrganizations()
    showDeleteConfirm.value = false
    orgToDelete.value = null
  } catch (err) {
    const errorMsg = err.response?.data?.message || err.message
    alert('Error al eliminar: ' + errorMsg)
    console.error('Error deleting organization:', err)
  } finally {
    deleting.value = false
  }
}

function formatDate(dateString) {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Funciones de usuarios
async function loadUsers() {
  loadingUsers.value = true
  usersError.value = null
  try {
    const { data } = await authService.getAllUsers()
    users.value = data
  } catch (err) {
    usersError.value = 'Error al cargar los usuarios: ' + (err.response?.data?.message || err.message)
    console.error('Error loading users:', err)
  } finally {
    loadingUsers.value = false
  }
}

function openRoleChangeModal(user) {
  userToChange.value = user
  newRole.value = user.role
  showRoleChangeModal.value = true
}

function closeRoleChangeModal() {
  showRoleChangeModal.value = false
  userToChange.value = null
  newRole.value = ''
}

async function changeUserRole() {
  if (!userToChange.value || !newRole.value) return
  if (newRole.value === userToChange.value.role) {
    alert('El usuario ya tiene ese rol')
    return
  }

  changingRole.value = true
  try {
    await authService.changeUserRole(userToChange.value.id, newRole.value)
    await loadUsers()
    closeRoleChangeModal()
    alert('Rol actualizado correctamente')
  } catch (err) {
    const errorMsg = err.response?.data?.message || err.message
    alert('Error al cambiar el rol: ' + errorMsg)
    console.error('Error changing user role:', err)
  } finally {
    changingRole.value = false
  }
}
</script>

<style scoped>
.admin-center {
  max-width: 1400px;
  margin: 2rem auto;
  padding: 1rem;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  color: #56005b;
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
}

.subtitle {
  color: #666;
  margin: 0;
  font-size: 1.1rem;
}

/* Tabs */
.tabs-container {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid #e0e0e0;
}

.tab-button {
  padding: 0.75rem 1.5rem;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  color: #666;
  transition: all 0.2s;
}

.tab-button:hover {
  color: #56005b;
  background: #f9f9f9;
}

.tab-button.active {
  color: #56005b;
  border-bottom-color: #56005b;
}

.tab-content {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.section-header h2 {
  color: #56005b;
  margin: 0;
  font-size: 1.5rem;
}

.loading, .error {
  text-align: center;
  padding: 2rem;
  font-size: 1.1rem;
}

.error {
  color: #c63b1e;
  background: #fff3f0;
  border-radius: 8px;
  border: 1px solid #c63b1e;
}

.organizations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.org-card {
  background: #fff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border: 1px solid #e0e0e0;
  transition: transform 0.2s, box-shadow 0.2s;
}

.org-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.org-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.org-header h3 {
  color: #56005b;
  margin: 0;
  font-size: 1.25rem;
  flex: 1;
}

.org-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-edit, .btn-delete {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0.25rem;
  transition: transform 0.2s;
}

.btn-edit:hover, .btn-delete:hover {
  transform: scale(1.2);
}

.org-description {
  color: #666;
  margin: 0.5rem 0;
  font-size: 0.95rem;
  line-height: 1.4;
}

.org-date {
  color: #999;
  font-size: 0.85rem;
  margin: 0.5rem 0 0 0;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 3rem 1rem;
  color: #666;
}

.empty-state p {
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

/* Tabla de usuarios */
.users-table-container {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow: hidden;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table thead {
  background: #56005b;
  color: #fff;
}

.users-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.95rem;
}

.users-table tbody tr {
  border-bottom: 1px solid #e0e0e0;
  transition: background 0.2s;
}

.users-table tbody tr:hover {
  background: #f9f9f9;
}

.users-table td {
  padding: 1rem;
  font-size: 0.95rem;
}

.role-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.role-badge.admin {
  background: #ffeaa7;
  color: #d63031;
}

.role-badge.user {
  background: #dfe6e9;
  color: #2d3436;
}

.btn-change-role {
  padding: 0.5rem 1rem;
  background: #56005b;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.btn-change-role:hover {
  background: #40004a;
  transform: translateY(-1px);
}

.role-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: border-color 0.2s;
}

.role-select:focus {
  outline: none;
  border-color: #56005b;
}

.info-text {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #e8f5e9;
  border-left: 4px solid #4caf50;
  color: #2e7d32;
  font-size: 0.9rem;
}

/* Botones */
.btn-primary, .btn-secondary, .btn-danger {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.95rem;
  transition: all 0.2s;
}

.btn-primary {
  background: #56005b;
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  background: #40004a;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(86, 0, 91, 0.3);
}

.btn-secondary {
  background: #f0f0f0;
  color: #333;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

.btn-danger {
  background: #c63b1e;
  color: #fff;
}

.btn-danger:hover:not(:disabled) {
  background: #a83219;
}

.btn-primary:disabled, .btn-danger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.modal-small {
  max-width: 450px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h2 {
  margin: 0;
  color: #56005b;
  font-size: 1.5rem;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s;
}

.btn-close:hover {
  background: #f0f0f0;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  font-family: inherit;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #56005b;
}

.form-group textarea {
  resize: vertical;
}

.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  font-family: inherit;
  cursor: pointer;
  background: #fff;
  transition: border-color 0.2s;
}

.org-info {
  margin: 0.75rem 0;
}

.org-info p {
  margin: 0.25rem 0;
  color: #666;
  font-size: 0.9rem;
}

.org-info strong {
  color: #56005b;
  font-weight: 500;
}

.warning-text {
  color: #c63b1e;
  font-weight: 500;
  margin-top: 0.5rem;
}

@media (max-width: 768px) {
  .admin-center {
    padding: 0.5rem;
  }

  .section-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .organizations-grid {
    grid-template-columns: 1fr;
  }

  .users-table-container {
    overflow-x: auto;
  }

  .users-table {
    font-size: 0.85rem;
  }

  .users-table th,
  .users-table td {
    padding: 0.75rem 0.5rem;
  }

  .modal-content {
    width: 95%;
    max-height: 95vh;
  }
}
</style>
