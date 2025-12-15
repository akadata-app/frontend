<template>
  <div
    class="barriers-opportunities-page"
    :style="{ '--header-h': headerH + 'px', '--footer-h': footerH + 'px' }"
  >
    <!-- TOOLBAR INTEGRADO -->
    <header class="page-toolbar">
      <button
        class="toolbar-menu-btn"
        type="button"
        @click="toggleMenu"
        aria-label="Abrir menu de formularios"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
        <span>Formularios</span>
      </button>
      <h1 class="toolbar-title" v-if="currentForm">{{ currentForm.nombre }}</h1>
      <div class="toolbar-spacer"></div>
    </header>

    <!-- MODAL BACKDROP -->
    <div class="modal-backdrop" :class="{ open: menuOpen }" @click="toggleMenu"></div>

    <!-- MENU LATERAL MODAL -->
    <aside
      id="side-menu"
      class="side-menu"
      :class="{ open: menuOpen }"
      role="navigation"
      aria-label="Lista de formularios"
    >
      <div class="menu-header">
        <h2>Formularios</h2>
        <button class="menu-close" @click="toggleMenu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div class="menu-content">
        <div class="new-item">
          <button class="new-btn" type="button" @click="addForm">
            + Nuevo formulario
          </button>
        </div>

        <div v-if="loading.forms" class="muted">Cargando...</div>
        <div v-else-if="!formularios.length" class="muted">No hay formularios</div>

        <ul v-else>
          <li
            v-for="form in formularios"
            :key="form.id"
            :class="{ active: form.id === selectedFormId }"
            @click="selectForm(form.id)"
            title="Seleccionar formulario"
          >
            <span class="item">
              <span class="name">{{ form.nombre }}</span>
            </span>

            <div class="row-actions">
              <button class="rename-btn" title="Renombrar" type="button" @click.stop="renameForm(form)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
              <button class="delete-btn" title="Eliminar" type="button" @click.stop="deleteForm(form.id)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
              </button>
            </div>
          </li>
        </ul>
      </div>
    </aside>

    <!-- CONTENIDO PRINCIPAL -->
    <main class="content" v-if="currentForm">
      <section class="form-layout">
        <!-- COLUMNA IZQUIERDA: Lista de categorías -->
        <div class="categories-section">
          <div class="categories-scrollable">
            <div class="categories-header">
              <h3>Categorías</h3>
              <div class="category-actions">
                <button class="add-button" @click="addCategory('BARRIER')" type="button">
                  + Nueva Categoría (Barrera)
                </button>
                <button class="add-button" @click="addCategory('OPPORTUNITY')" type="button">
                  + Nueva Categoría (Oportunidad)
                </button>
              </div>
            </div>
            
            <div class="categories-list">
              <div
                v-for="(category, index) in currentForm.categorias"
                :key="category.id || index"
                class="category-card"
                :class="{ active: editingCategoryId === (category.id || index) }"
                @click="openCategory(category.id || index)"
              >
                <div class="category-type-badge" :class="category.type?.toLowerCase()">
                  {{ category.type === 'BARRIER' ? 'Barrera' : 'Oportunidad' }}
                </div>
                <div class="category-name">{{ category.name || 'Sin nombre' }}</div>
                <div class="category-questions-count">
                  {{ (category.questions || []).length }} pregunta(s)
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- COLUMNA DERECHA: Información del formulario y preguntas de la categoría -->
        <div class="info-section" v-if="currentCategory">
          <h2>{{ currentCategory.name || 'Categoría' }}</h2>
          
          <div class="category-info">
            <div class="info-group">
              <label for="categoryName">Nombre de la categoría*</label>
              <input
                id="categoryName"
                type="text"
                v-model="currentCategory.name"
                placeholder="Nombre de la categoría"
              />
            </div>

            <div class="info-group">
              <label for="categoryDescription">Descripción</label>
              <textarea
                id="categoryDescription"
                v-model="currentCategory.description"
                rows="3"
                placeholder="Descripción de la categoría"
              ></textarea>
            </div>

            <div class="info-group">
              <label for="categoryType">Tipo*</label>
              <select id="categoryType" v-model="currentCategory.type">
                <option value="BARRIER">Barrera</option>
                <option value="OPPORTUNITY">Oportunidad</option>
              </select>
            </div>

            <button class="submit-button" @click="saveCurrentCategory" type="button" :disabled="saving">
              Guardar Categoría
            </button>

            <button
              class="btn danger"
              type="button"
              @click="deleteCurrentCategory"
              :disabled="!currentCategory.id"
            >
              Eliminar Categoría
            </button>
          </div>

          <hr class="section-sep" />

          <div class="questions-section">
            <div class="questions-header">
              <h3>Preguntas</h3>
              <button class="add-button" @click="addQuestion" type="button">
                + Nueva Pregunta
              </button>
            </div>

            <div class="questions-list">
              <div
                v-for="(question, index) in currentCategory.questions"
                :key="question.id || index"
                class="question-card"
                :class="{ active: editingQuestionId === (question.id || index) }"
                @click="openQuestion(question.id || index)"
              >
                <div class="question-text">{{ question.questionText || 'Sin pregunta' }}</div>
                <div class="question-options-info">
                  Opciones: 1, 2, 3, 4, 5
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Información del formulario (cuando no hay categoría seleccionada) -->
        <div class="info-section" v-else>
          <h2>Información para el usuario</h2>

          <div class="info-group">
            <label for="descripcion">Descripción</label>
            <textarea id="descripcion" v-model="currentForm.info.descripcion" rows="3"></textarea>
          </div>

          <div class="info-group">
            <label for="dirigido">¿A quién va dirigido?</label>
            <textarea id="dirigido" v-model="currentForm.info.dirigido" rows="3"></textarea>
          </div>

          <div class="info-group">
            <label for="resultado">¿Qué resultado ofrece?</label>
            <textarea id="resultado" v-model="currentForm.info.resultado" rows="3"></textarea>
          </div>

          <button class="submit-button" @click="saveForm" type="button" :disabled="saving">
            Guardar
          </button>
        </div>
      </section>
    </main>

    <!-- MODAL BACKDROP PARA EDITOR -->
    <div class="modal-backdrop editor-backdrop" :class="{ open: questionEditorOpen }" @click="closeQuestion"></div>

    <!-- MODAL EDITOR DE PREGUNTA -->
    <div
      class="question-editor-modal"
      :class="{ open: questionEditorOpen }"
      v-if="currentQuestion"
      role="dialog"
      aria-label="Editor de pregunta"
    >
      <div class="modal-header">
        <h3 class="modal-title">Editar Pregunta</h3>
        <button class="modal-close" type="button" @click="closeQuestion">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div class="modal-body">

        <div class="drawer-group">
          <label for="questionText">Texto de la pregunta*</label>
          <textarea
            id="questionText"
            rows="3"
            v-model="currentQuestion.questionText"
            placeholder="Escribe la pregunta aquí"
          ></textarea>
        </div>

        <hr class="drawer-sep" />

        <div class="options-section">
          <div class="options-header">
            <h4>Opciones de respuesta (1 al 5)</h4>
            <p class="options-info">Las opciones se crean automáticamente con valores del 1 al 5</p>
          </div>

          <div class="options-list">
            <div
              v-for="option in sortedOptions"
              :key="option.id || option.value"
              class="option-row"
            >
              <div class="option-number">{{ option.value }}</div>
              <div class="option-value-display">Valor: {{ option.value }}</div>
            </div>
          </div>
        </div>

        <div class="drawer-actions">
          <button
            class="btn danger"
            type="button"
            @click="deleteCurrentQuestion"
            :disabled="!currentQuestion.id"
            title="Eliminar la pregunta actual"
          >
            Eliminar
          </button>

          <button class="btn primary" type="button" @click="saveCurrentQuestion" :disabled="saving">
            Guardar pregunta
          </button>
        </div>
      </div>
    </div>

    <!-- toasts -->
    <div v-if="error" class="toast error">{{ error }}</div>
    <div v-if="success" class="toast ok">{{ success }}</div>

    <!-- Popup de éxito -->
    <div v-if="showSuccessPopup" class="success-popup-overlay">
      <div class="success-popup">
        <div class="success-popup-icon">✓</div>
        <h3 class="success-popup-title">¡Éxito!</h3>
        <p class="success-popup-message">{{ successMessage }}</p>
        <button class="success-popup-button" @click="closeSuccessPopup">Aceptar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
/* eslint-disable no-console */
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import Api from '@/services/BarriersOpportunitiesService';

/* =========================
   Medidas header/footer
   ========================= */
const headerH = ref(0);
const footerH = ref(0);

function getHeaderEl() {
  return (
    document.querySelector('header') ||
    document.querySelector('[role="banner"]') ||
    document.querySelector('.header') ||
    document.querySelector('#header')
  );
}
function getFooterEl() {
  return (
    document.querySelector('footer') ||
    document.querySelector('[role="contentinfo"]') ||
    document.querySelector('.footer') ||
    document.querySelector('#footer')
  );
}
function measureBars() {
  const h = getHeaderEl();
  const f = getFooterEl();
  headerH.value = h ? Math.round(h.getBoundingClientRect().height) : 0;
  footerH.value = f ? Math.round(f.getBoundingClientRect().height) : 0;
}
const onResize = () => {
  measureBars();
  requestAnimationFrame(measureBars);
};
let headerObserver, footerObserver;

onMounted(() => {
  measureBars();
  window.addEventListener('resize', onResize);
  window.addEventListener('orientationchange', onResize);
  const H = getHeaderEl();
  const F = getFooterEl();
  if (window.ResizeObserver) {
    if (H) {
      headerObserver = new ResizeObserver(measureBars);
      headerObserver.observe(H);
    }
    if (F) {
      footerObserver = new ResizeObserver(measureBars);
      footerObserver.observe(F);
    }
  }
  setTimeout(measureBars, 100);
  setTimeout(measureBars, 400);
});
onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize);
  window.removeEventListener('orientationchange', onResize);
  headerObserver?.disconnect?.();
  footerObserver?.disconnect?.();
});

/* =========================
   UI estado global
   ========================= */
const menuOpen = ref(false);
const toggleMenu = () => {
  menuOpen.value = !menuOpen.value;
};
const onKey = (e) => {
  if (e.key === 'Escape') {
    if (showSuccessPopup.value) closeSuccessPopup();
    else if (questionEditorOpen.value) questionEditorOpen.value = false;
    else if (menuOpen.value) menuOpen.value = false;
  }
};
onMounted(() => window.addEventListener('keydown', onKey));
onBeforeUnmount(() => window.removeEventListener('keydown', onKey));

/* =========================
   Datos desde la API
   ========================= */
const formularios = ref([]);
const selectedFormId = ref(null);
const loading = ref({ forms: true, form: false });
const saving = ref(false);
const error = ref('');
const success = ref('');
const showSuccessPopup = ref(false);
const successMessage = ref('');

const editingCategoryId = ref(null);
const editingQuestionId = ref(null);
const questionEditorOpen = ref(false);

/* =========================
   Popup de éxito
   ========================= */
function showSuccess(message) {
  success.value = message;
  successMessage.value = message;
  showSuccessPopup.value = true;
  // Auto-cerrar después de 3 segundos
  setTimeout(() => {
    closeSuccessPopup();
  }, 3000);
}

function closeSuccessPopup() {
  showSuccessPopup.value = false;
  // Limpiar el mensaje después de un breve delay para la animación
  setTimeout(() => {
    success.value = '';
    successMessage.value = '';
  }, 300);
}

/**
 * Normaliza el DTO del backend -> modelo UI
 */
function normalize(dto) {
  return {
    id: dto?.id ?? null,
    nombre: dto?.title ?? dto?.name ?? 'Formulario Barreras y Oportunidades',
    categorias: (dto?.categories || []).map((cat, i) => ({
      id: cat?.id ?? null,
      name: cat?.name ?? '',
      description: cat?.description ?? '',
      type: cat?.type ?? 'BARRIER',
      orderIndex: cat?.orderIndex ?? i,
      questions: (cat?.questions || []).map((q, j) => ({
        id: q?.id ?? null,
        questionText: q?.questionText ?? '',
        orderIndex: q?.orderIndex ?? j,
        options: (q?.options || []).map((opt) => ({
          id: opt?.id ?? null,
          value: opt?.value ?? 0
        })).sort((a, b) => (a.value || 0) - (b.value || 0))
      })).sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
    })).sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0)),
    info: {
      descripcion: dto?.description ?? '',
      dirigido: dto?.target ?? '',
      resultado: dto?.result ?? ''
    }
  };
}

/**
 * Desnormaliza modelo UI -> DTO del backend
 */
function toDTO(form) {
  return {
    id: form.id ?? undefined,
    title: form.nombre,
    description: form.info?.descripcion ?? '',
    target: form.info?.dirigido ?? '',
    result: form.info?.resultado ?? ''
  };
}

/* =========================
   Carga y selección
   ========================= */
async function fetchFormsList() {
  loading.value.forms = true;
  error.value = '';
  try {
    const { data } = await Api.getFormsList();
    const list = Array.isArray(data) ? data : data?.content || [];
    formularios.value = list.map(it => ({
      id: it.id,
      nombre: it.title ?? it.name ?? 'Sin título'
    }));
    if (!selectedFormId.value && formularios.value.length) {
      await selectForm(formularios.value[0].id);
    } else if (
      selectedFormId.value &&
      !formularios.value.find(f => f.id === selectedFormId.value) &&
      formularios.value.length
    ) {
      await selectForm(formularios.value[0].id);
    }
  } catch (e) {
    console.error(e);
    error.value = 'Error al cargar la lista.';
  } finally {
    loading.value.forms = false;
  }
}

const currentForm = ref(null);
const currentCategory = ref(null);
const currentQuestion = ref(null);

async function selectForm(id) {
  if (!id) return;
  loading.value.form = true;
  error.value = '';
  success.value = '';
  try {
    const { data } = await Api.getFormById(id);
    currentForm.value = normalize(data);
    selectedFormId.value = currentForm.value.id;
    editingCategoryId.value = null;
    editingQuestionId.value = null;
    questionEditorOpen.value = false;
    currentCategory.value = null;
    currentQuestion.value = null;
  } catch (e) {
    console.error(e);
    error.value = 'Error al cargar el formulario.';
  } finally {
    loading.value.form = false;
  }
}

/* =========================
   Acciones formulario
   ========================= */
async function addForm() {
  try {
    const { data } = await Api.createForm({
      title: 'Nuevo formulario',
      description: '',
      target: '',
      result: ''
    });
    showSuccess('Formulario creado correctamente.');
    await fetchFormsList();
    await selectForm(data?.id || formularios.value[0]?.id);
    menuOpen.value = true;
  } catch (e) {
    console.error(e);
    error.value = 'No se pudo crear el formulario.';
  }
}

function renameForm(form) {
  const nuevo = window.prompt('Nuevo nombre del formulario:', form.nombre);
  if (!nuevo || !nuevo.trim()) return;
  (async () => {
    try {
      if (!currentForm.value || currentForm.value.id !== form.id) {
        await selectForm(form.id);
      }
      await Api.updateForm(form.id, {
        ...toDTO({ ...currentForm.value, nombre: nuevo.trim() })
      });
      await fetchFormsList();
      await selectForm(form.id);
      showSuccess('Nombre actualizado.');
    } catch (e) {
      console.error(e);
      error.value = 'No se pudo renombrar el formulario.';
    }
  })();
}

async function deleteForm(id) {
  if (!window.confirm('¿Está seguro de eliminar este formulario?')) return;
  try {
    await Api.deleteForm(id);
    showSuccess('Formulario eliminado.');
    await fetchFormsList();
    if (selectedFormId.value === id) {
      currentForm.value = null;
      selectedFormId.value = null;
    }
  } catch (e) {
    console.error(e);
    error.value = 'No se pudo eliminar el formulario.';
  }
}

async function saveForm() {
  if (!currentForm.value) return;
  try {
    saving.value = true;
    await Api.updateForm(currentForm.value.id, toDTO(currentForm.value));
    showSuccess('Formulario guardado.');
    await fetchFormsList();
  } catch (e) {
    console.error(e);
    error.value = 'No se pudo guardar el formulario.';
  } finally {
    saving.value = false;
  }
}

/* =========================
   Acciones categorías
   ========================= */
function openCategory(categoryIdOrIndex) {
  if (!currentForm.value) return;
  const category = currentForm.value.categorias.find(
    c => (c.id || currentForm.value.categorias.indexOf(c)) === categoryIdOrIndex
  );
  if (category) {
    currentCategory.value = { ...category };
    editingCategoryId.value = categoryIdOrIndex;
    editingQuestionId.value = null;
    questionEditorOpen.value = false;
    currentQuestion.value = null;
  }
}

async function addCategory(type) {
  if (!currentForm.value) return;
  try {
    saving.value = true;
    const orderIndex = currentForm.value.categorias.length;
    const { data } = await Api.createCategory(currentForm.value.id, {
      name: `Nueva categoría ${type === 'BARRIER' ? 'Barrera' : 'Oportunidad'}`,
      description: '',
      type: type,
      orderIndex: orderIndex
    });
    showSuccess('Categoría creada correctamente.');
    await selectForm(currentForm.value.id);
    if (data?.id) {
      openCategory(data.id);
    }
  } catch (e) {
    console.error(e);
    error.value = 'No se pudo crear la categoría.';
  } finally {
    saving.value = false;
  }
}

async function saveCurrentCategory() {
  if (!currentCategory.value || !currentForm.value) {
    error.value = 'No hay categoría o formulario seleccionado.';
    return;
  }
  
  // Validar campos requeridos
  if (!currentCategory.value.name || currentCategory.value.name.trim() === '') {
    error.value = 'El nombre de la categoría es requerido.';
    return;
  }
  
  if (!currentCategory.value.type) {
    error.value = 'El tipo de categoría es requerido.';
    return;
  }
  
  try {
    saving.value = true;
    error.value = '';
    
    if (!currentCategory.value.id) {
      // Crear nueva categoría
      const orderIndex = currentForm.value.categorias ? currentForm.value.categorias.length : 0;
      console.log('Creando categoría:', {
        formId: currentForm.value.id,
        name: currentCategory.value.name,
        type: currentCategory.value.type,
        orderIndex: orderIndex
      });
      
      const response = await Api.createCategory(currentForm.value.id, {
        name: currentCategory.value.name.trim(),
        description: currentCategory.value.description || '',
        type: currentCategory.value.type,
        orderIndex: orderIndex
      });
      
      console.log('Respuesta completa del servidor:', response);
      console.log('response.data:', response?.data);
      console.log('response.status:', response?.status);
      
      // Axios siempre devuelve la respuesta en response.data
      const categoryData = response?.data;
      
      if (!categoryData) {
        console.error('La respuesta del servidor está vacía');
        throw new Error('El servidor no devolvió datos');
      }
      
      // Si la respuesta es un string (mensaje de error), lanzar error
      if (typeof categoryData === 'string') {
        throw new Error(categoryData);
      }
      
      if (categoryData.id) {
        // Guardar el ID antes de recargar el formulario
        const newCategoryId = categoryData.id;
        showSuccess('Categoría creada correctamente.');
        // Recargar el formulario para obtener los datos actualizados
        await selectForm(currentForm.value.id);
        // Abrir la categoría usando el ID guardado
        if (newCategoryId) {
          openCategory(newCategoryId);
        }
      } else {
        console.error('Respuesta inválida del servidor - no tiene ID:', categoryData);
        throw new Error('No se recibió ID de la categoría creada. Respuesta: ' + JSON.stringify(categoryData));
      }
    } else {
      // Actualizar categoría existente
      // Guardar el ID antes de la actualización para poder reabrirla después
      const categoryIdToReopen = currentCategory.value.id;
      
      console.log('Actualizando categoría:', {
        categoryId: categoryIdToReopen,
        name: currentCategory.value.name,
        type: currentCategory.value.type
      });
      
      try {
        const updateResponse = await Api.updateCategory(categoryIdToReopen, {
          name: currentCategory.value.name.trim(),
          description: currentCategory.value.description || '',
          type: currentCategory.value.type,
          orderIndex: currentCategory.value.orderIndex || 0
        });
        
        console.log('Respuesta completa de actualización:', updateResponse);
        console.log('response.data:', updateResponse?.data);
        console.log('response.status:', updateResponse?.status);
        
        // Verificar que la actualización fue exitosa
        if (updateResponse?.status === 200) {
          showSuccess('Categoría actualizada correctamente.');
          // Recargar el formulario para obtener los datos actualizados
          await selectForm(currentForm.value.id);
          // Reabrir la categoría usando el ID guardado
          if (categoryIdToReopen) {
            openCategory(categoryIdToReopen);
          }
        } else {
          throw new Error('La actualización no fue exitosa. Status: ' + (updateResponse?.status || 'desconocido'));
        }
      } catch (updateError) {
        console.error('Error específico en actualización:', updateError);
        throw updateError;
      }
    }
  } catch (e) {
    console.error('Error al guardar categoría:', e);
    console.error('Error completo:', {
      message: e.message,
      response: e.response,
      responseData: e.response?.data,
      responseStatus: e.response?.status,
      responseStatusText: e.response?.statusText
    });
    
    let errorMessage = 'Error desconocido';
    if (e.response?.data) {
      // Si el backend devolvió un mensaje de error
      errorMessage = typeof e.response.data === 'string' 
        ? e.response.data 
        : (e.response.data.message || e.response.data.error || JSON.stringify(e.response.data));
    } else if (e.message) {
      errorMessage = e.message;
    }
    
    // NO intentar acceder a propiedades de null
    error.value = `No se pudo guardar la categoría: ${errorMessage}`;
  } finally {
    saving.value = false;
  }
}

async function deleteCurrentCategory() {
  if (!currentCategory.value?.id) return;
  if (!window.confirm('¿Está seguro de eliminar esta categoría? Se eliminarán todas sus preguntas.')) return;
  try {
    saving.value = true;
    await Api.deleteCategory(currentCategory.value.id);
    showSuccess('Categoría eliminada.');
    currentCategory.value = null;
    editingCategoryId.value = null;
    await selectForm(currentForm.value.id);
  } catch (e) {
    console.error(e);
    error.value = 'No se pudo eliminar la categoría.';
  } finally {
    saving.value = false;
  }
}

/* =========================
   Acciones preguntas
   ========================= */
function openQuestion(questionIdOrIndex) {
  if (!currentCategory.value) return;
  const question = currentCategory.value.questions.find(
    q => (q.id || currentCategory.value.questions.indexOf(q)) === questionIdOrIndex
  );
  if (question) {
    currentQuestion.value = { ...question };
    editingQuestionId.value = questionIdOrIndex;
    questionEditorOpen.value = true;
  }
}

function closeQuestion() {
  questionEditorOpen.value = false;
  currentQuestion.value = null;
  editingQuestionId.value = null;
}

const sortedOptions = computed(() => {
  if (!currentQuestion.value?.options) return [];
  return [...currentQuestion.value.options].sort((a, b) => (a.value || 0) - (b.value || 0));
});

async function addQuestion() {
  if (!currentCategory.value?.id) {
    error.value = 'Debe guardar la categoría primero.';
    return;
  }
  try {
    saving.value = true;
    // Guardar el ID de la categoría antes de crear la pregunta
    const categoryIdToReopen = currentCategory.value.id;
    const orderIndex = currentCategory.value.questions.length;
    const { data } = await Api.createQuestion(categoryIdToReopen, {
      questionText: 'Nueva pregunta',
      orderIndex: orderIndex
    });
    showSuccess('Pregunta creada correctamente.');
    // Recargar el formulario para obtener los datos actualizados
    await selectForm(currentForm.value.id);
    // Reabrir la categoría y la pregunta usando los IDs guardados
    if (categoryIdToReopen) {
      openCategory(categoryIdToReopen);
      if (data?.id) {
        openQuestion(data.id);
      }
    }
  } catch (e) {
    console.error(e);
    error.value = 'No se pudo crear la pregunta.';
  } finally {
    saving.value = false;
  }
}

async function saveCurrentQuestion() {
  if (!currentQuestion.value) {
    error.value = 'No hay pregunta seleccionada.';
    return;
  }
  
  if (!currentCategory.value?.id) {
    error.value = 'Debe guardar la categoría primero.';
    return;
  }
  
  // Validar campos requeridos
  if (!currentQuestion.value.questionText || currentQuestion.value.questionText.trim() === '') {
    error.value = 'El texto de la pregunta es requerido.';
    return;
  }
  
  try {
    saving.value = true;
    error.value = '';
    
    if (!currentQuestion.value.id) {
      // Crear nueva pregunta
      const orderIndex = currentCategory.value.questions ? currentCategory.value.questions.length : 0;
      console.log('Creando pregunta:', {
        categoryId: currentCategory.value.id,
        questionText: currentQuestion.value.questionText,
        orderIndex: orderIndex
      });
      
      const response = await Api.createQuestion(currentCategory.value.id, {
        questionText: currentQuestion.value.questionText.trim(),
        orderIndex: orderIndex
      });
      
      console.log('Respuesta completa del servidor:', response);
      console.log('response.data:', response?.data);
      console.log('response.status:', response?.status);
      
      // Axios siempre devuelve la respuesta en response.data
      const questionData = response?.data;
      
      if (!questionData) {
        console.error('La respuesta del servidor está vacía');
        throw new Error('El servidor no devolvió datos');
      }
      
      // Si la respuesta es un string (mensaje de error), lanzar error
      if (typeof questionData === 'string') {
        throw new Error(questionData);
      }
      
      if (questionData.id) {
        // Guardar los IDs antes de recargar el formulario
        const newQuestionId = questionData.id;
        const categoryIdToReopen = currentCategory.value?.id;
        showSuccess('Pregunta creada correctamente.');
        // Recargar el formulario para obtener los datos actualizados
        await selectForm(currentForm.value.id);
        // Reabrir la categoría y la pregunta usando los IDs guardados
        if (categoryIdToReopen) {
          openCategory(categoryIdToReopen);
          if (newQuestionId) {
            openQuestion(newQuestionId);
          }
        }
      } else {
        console.error('Respuesta inválida del servidor - no tiene ID:', questionData);
        throw new Error('No se recibió ID de la pregunta creada. Respuesta: ' + JSON.stringify(questionData));
      }
    } else {
      // Actualizar pregunta existente
      console.log('Actualizando pregunta:', {
        questionId: currentQuestion.value.id,
        questionText: currentQuestion.value.questionText
      });
      
      try {
        // Guardar los IDs antes de la actualización para poder reabrir después
        const questionIdToReopen = currentQuestion.value.id;
        const categoryIdToReopen = currentCategory.value?.id;
        
        const updateResponse = await Api.updateQuestion(questionIdToReopen, {
          questionText: currentQuestion.value.questionText.trim(),
          orderIndex: currentQuestion.value.orderIndex || 0
        });
        
        console.log('Respuesta completa de actualización:', updateResponse);
        console.log('response.data:', updateResponse?.data);
        console.log('response.status:', updateResponse?.status);
        
        // Verificar que la actualización fue exitosa
        if (updateResponse?.status === 200) {
          showSuccess('Pregunta actualizada correctamente.');
          // Recargar el formulario para obtener los datos actualizados
          await selectForm(currentForm.value.id);
          // Reabrir la categoría y la pregunta usando los IDs guardados
          if (categoryIdToReopen) {
            openCategory(categoryIdToReopen);
            if (questionIdToReopen) {
              openQuestion(questionIdToReopen);
            }
          }
        } else {
          throw new Error('La actualización no fue exitosa. Status: ' + (updateResponse?.status || 'desconocido'));
        }
      } catch (updateError) {
        console.error('Error específico en actualización:', updateError);
        throw updateError;
      }
    }
  } catch (e) {
    console.error('Error al guardar pregunta:', e);
    console.error('Error completo:', {
      message: e.message,
      response: e.response,
      responseData: e.response?.data,
      responseStatus: e.response?.status,
      responseStatusText: e.response?.statusText
    });
    
    let errorMessage = 'Error desconocido';
    if (e.response?.data) {
      // Si el backend devolvió un mensaje de error
      errorMessage = typeof e.response.data === 'string' 
        ? e.response.data 
        : e.response.data.message || JSON.stringify(e.response.data);
    } else if (e.message) {
      errorMessage = e.message;
    }
    
    error.value = `No se pudo guardar la pregunta: ${errorMessage}`;
  } finally {
    saving.value = false;
  }
}

async function deleteCurrentQuestion() {
  if (!currentQuestion.value?.id) return;
  if (!window.confirm('¿Está seguro de eliminar esta pregunta?')) return;
  try {
    saving.value = true;
    // Guardar el ID de la categoría antes de eliminar la pregunta
    const categoryIdToReopen = currentCategory.value?.id;
    await Api.deleteQuestion(currentQuestion.value.id);
    showSuccess('Pregunta eliminada.');
    closeQuestion();
    // Recargar el formulario para obtener los datos actualizados
    await selectForm(currentForm.value.id);
    // Reabrir la categoría usando el ID guardado
    if (categoryIdToReopen) {
      openCategory(categoryIdToReopen);
    }
  } catch (e) {
    console.error(e);
    error.value = 'No se pudo eliminar la pregunta.';
  } finally {
    saving.value = false;
  }
}

/* Carga inicial */
onMounted(fetchFormsList);
</script>

<style scoped>
/* Variables */
.barriers-opportunities-page {
  --menu-w: 320px;
  --violet: #56005b;
  --violet-dark: #3d0041;
  --violet-soft: #f3e5f5;
  --text: #1a1a1a;
  --border: #e9ecef;
  --bg: #f8f9fa;
  position: relative;
  width: 100%;
  box-sizing: border-box;
  font-family: system-ui, -apple-system, sans-serif;
  background: var(--bg);
  min-height: calc(100vh - 140px);
}

/* ===== TOOLBAR INTEGRADO ===== */
.page-toolbar {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 2rem;
  background: white;
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 20;
}

.toolbar-menu-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text);
  transition: all 0.2s ease;
}
.toolbar-menu-btn:hover {
  background: var(--violet-soft);
  border-color: var(--violet);
}
.toolbar-menu-btn svg { flex-shrink: 0; }

.toolbar-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text);
  margin: 0;
}

.toolbar-spacer { flex: 1; }

/* ===== MODAL BACKDROP ===== */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 100;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.25s ease, visibility 0.25s ease;
}
.modal-backdrop.open {
  opacity: 1;
  visibility: visible;
}
.editor-backdrop { z-index: 200; }

/* ===== MENU LATERAL MODAL ===== */
.side-menu {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: var(--menu-w);
  background: white;
  box-shadow: 4px 0 24px rgba(0,0,0,.15);
  z-index: 101;
  display: flex;
  flex-direction: column;
  transform: translateX(-100%);
  transition: transform 0.25s ease;
}
.side-menu.open { transform: translateX(0); }

.menu-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border);
}
.menu-header h2 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  color: var(--text);
}
.menu-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: var(--bg);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  color: var(--text);
  transition: background 0.2s ease;
}
.menu-close:hover { background: #dee2e6; }

.menu-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 1.25rem;
}
.new-item {
  margin-bottom: 16px;
}
.new-btn {
  width: 100%;
  padding: 10px 14px;
  background: white;
  color: var(--violet-dark);
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.95rem;
  transition: background 0.2s;
}
.new-btn:hover {
  background: #f0f0f0;
}
.muted {
  color: rgba(255, 255, 255, 0.7);
  padding: 12px;
  text-align: center;
}
.menu-content ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.menu-content li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  margin-bottom: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}
.menu-content li:hover {
  background: rgba(255, 255, 255, 0.2);
}
.menu-content li.active {
  background: white;
  color: var(--violet-dark);
}
.menu-content li.active .name {
  font-weight: 600;
}
.item {
  flex: 1;
  min-width: 0;
}
.name {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: inherit;
}
.row-actions {
  display: flex;
  gap: 6px;
  margin-left: 8px;
}
.rename-btn,
.delete-btn {
  padding: 4px 8px;
  font-size: 0.85rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  transition: background 0.2s;
}
.menu-content li.active .rename-btn,
.menu-content li.active .delete-btn {
  background: var(--violet-soft);
  color: var(--violet-dark);
}
.rename-btn:hover,
.delete-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}
.menu-content li.active .rename-btn:hover,
.menu-content li.active .delete-btn:hover {
  background: var(--violet);
  color: white;
}

/* ===== CONTENIDO PRINCIPAL ===== */
.content {
  margin-left: 0;
  padding: 20px 24px;
  padding-top: calc(var(--header-h) + 20px);
  padding-bottom: calc(var(--footer-h) + 20px);
  min-height: calc(100vh - var(--header-h) - var(--footer-h));
  box-sizing: border-box;
  transition: margin-left 0.28s ease;
}
.side-menu.open ~ .content {
  margin-left: var(--menu-w);
}
.title {
  font-size: 1.8rem;
  margin: 0 0 24px;
  color: var(--text);
  font-weight: 600;
}
.form-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  max-width: 1400px;
}

/* ===== SECCIÓN CATEGORÍAS ===== */
.categories-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.categories-scrollable {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}
.categories-header {
  margin-bottom: 16px;
}
.categories-header h3 {
  margin: 0 0 12px;
  font-size: 1.2rem;
  color: var(--text);
}
.category-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.add-button {
  padding: 10px 14px;
  background: var(--violet);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.2s;
}
.add-button:hover {
  background: var(--violet-dark);
}
.add-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
.categories-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.category-card {
  padding: 14px;
  background: var(--violet-soft);
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}
.category-card:hover {
  border-color: var(--violet);
  background: white;
}
.category-card.active {
  border-color: var(--violet-dark);
  background: white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}
.category-type-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 8px;
  text-transform: uppercase;
}
.category-type-badge.barrier {
  background: #ffebee;
  color: #c62828;
}
.category-type-badge.opportunity {
  background: #e8f5e9;
  color: #2e7d32;
}
.category-name {
  font-weight: 600;
  color: var(--text);
  margin-bottom: 4px;
}
.category-questions-count {
  font-size: 0.85rem;
  color: #666;
}

/* ===== SECCIÓN INFORMACIÓN ===== */
.info-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  overflow-y: auto;
}
.info-section h2 {
  margin: 0 0 20px;
  font-size: 1.3rem;
  color: var(--text);
}
.info-group {
  margin-bottom: 20px;
}
.info-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  color: var(--text);
  font-size: 0.9rem;
}
.info-group input,
.info-group textarea,
.info-group select {
  width: 100%;
  padding: 10px;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 0.95rem;
  font-family: inherit;
  box-sizing: border-box;
}
.info-group input:focus,
.info-group textarea:focus,
.info-group select:focus {
  outline: none;
  border-color: var(--violet);
}
.info-group textarea {
  resize: vertical;
  min-height: 80px;
}
.submit-button {
  padding: 12px 24px;
  background: var(--violet);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.2s;
  margin-top: 8px;
}
.submit-button:hover:not(:disabled) {
  background: var(--violet-dark);
}
.submit-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.2s;
  margin-top: 12px;
  display: inline-block;
}
.btn.primary {
  background: var(--violet);
  color: white;
}
.btn.primary:hover:not(:disabled) {
  background: var(--violet-dark);
}
.btn.danger {
  background: #f44336;
  color: white;
}
.btn.danger:hover:not(:disabled) {
  background: #d32f2f;
}
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.section-sep {
  margin: 24px 0;
  border: none;
  border-top: 2px solid #eee;
}

/* ===== SECCIÓN PREGUNTAS ===== */
.questions-section {
  margin-top: 24px;
}
.questions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.questions-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: var(--text);
}
.questions-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.question-card {
  padding: 12px;
  background: #f9f9f9;
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}
.question-card:hover {
  border-color: var(--violet);
  background: white;
}
.question-card.active {
  border-color: var(--violet-dark);
  background: white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}
.question-text {
  font-weight: 500;
  color: var(--text);
  margin-bottom: 4px;
}
.question-options-info {
  font-size: 0.85rem;
  color: #666;
}

/* ===== MODAL EDITOR DE PREGUNTA ===== */
.question-editor-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.95);
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  background: white;
  border-radius: 16px;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.2);
  z-index: 201;
  display: flex;
  flex-direction: column;
  opacity: 0;
  visibility: hidden;
  transition: all 0.25s ease;
}
.question-editor-modal.open {
  opacity: 1;
  visibility: visible;
  transform: translate(-50%, -50%) scale(1);
}

.question-editor-modal .modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.question-editor-modal .modal-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
  color: var(--text);
}

.question-editor-modal .modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: var(--bg);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  color: var(--text);
  transition: background 0.2s ease;
}
.question-editor-modal .modal-close:hover { background: #dee2e6; }

.question-editor-modal .modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.drawer-title {
  margin: 0 0 20px;
  font-size: 1.3rem;
  color: var(--text);
}
.drawer-group {
  margin-bottom: 20px;
}
.drawer-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  color: var(--text);
  font-size: 0.9rem;
}
.drawer-group textarea {
  width: 100%;
  padding: 10px;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 0.95rem;
  font-family: inherit;
  box-sizing: border-box;
  resize: vertical;
}
.drawer-group textarea:focus {
  outline: none;
  border-color: var(--violet);
}
.drawer-sep {
  margin: 24px 0;
  border: none;
  border-top: 2px solid #eee;
}
.options-section {
  margin-bottom: 24px;
}
.options-header h4 {
  margin: 0 0 8px;
  font-size: 1rem;
  color: var(--text);
}
.options-info {
  margin: 0 0 16px;
  font-size: 0.85rem;
  color: #666;
}
.options-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.option-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 6px;
}
.option-number {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--violet);
  color: white;
  border-radius: 50%;
  font-weight: 600;
  font-size: 0.9rem;
}
.option-value-display {
  flex: 1;
  font-size: 0.95rem;
  color: var(--text);
}
.drawer-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 2px solid #eee;
}

/* ===== TOASTS ===== */
.toast {
  position: fixed;
  bottom: calc(var(--footer-h) + 20px);
  right: 20px;
  padding: 14px 20px;
  border-radius: 8px;
  color: white;
  font-weight: 500;
  z-index: 100;
  animation: slideIn 0.3s ease;
  max-width: 400px;
}
.toast.error {
  background: #f44336;
}
.toast.ok {
  background: #4caf50;
}
@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* ===== POPUP DE ÉXITO ===== */
.success-popup-overlay {
  position: fixed;
  bottom: calc(var(--footer-h) + 20px);
  right: 20px;
  z-index: 1000;
  animation: slideIn 0.3s ease;
}

.success-popup {
  background: white;
  border-radius: 16px;
  padding: 24px;
  max-width: 400px;
  min-width: 300px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  text-align: center;
  animation: popupSlideIn 0.3s ease;
}

.success-popup-icon {
  width: 60px;
  height: 60px;
  margin: 0 auto 16px;
  background: #4caf50;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  color: white;
  font-weight: bold;
  animation: scaleIn 0.4s ease 0.1s both;
}

.success-popup-title {
  margin: 0 0 8px;
  font-size: 1.2rem;
  color: var(--text);
  font-weight: 600;
}

.success-popup-message {
  margin: 0 0 16px;
  font-size: 0.95rem;
  color: #666;
  line-height: 1.5;
}

.success-popup-button {
  padding: 10px 24px;
  background: var(--violet);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background 0.2s;
  width: 100%;
}

.success-popup-button:hover {
  background: var(--violet-dark);
}

@keyframes popupSlideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes scaleIn {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}

/* Responsive */
@media (max-width: 1024px) {
  .form-layout {
    grid-template-columns: 1fr;
  }
  .question-editor-modal {
    width: 95%;
    max-width: none;
  }
}
</style>
