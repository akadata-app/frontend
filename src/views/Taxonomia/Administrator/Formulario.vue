<template>
  <div
    class="taxonomy-form-page"
    :style="{ '--header-h': headerH + 'px', '--footer-h': footerH + 'px' }"
  >
    <!-- TOOLBAR INTEGRADO -->
    <header class="page-toolbar">
      <button
        class="toolbar-menu-btn"
        type="button"
        @click="toggleMenu"
        :aria-expanded="menuOpen.toString()"
        aria-controls="side-menu"
        aria-label="Abrir/Cerrar menu"
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

    <!-- MODAL MENU LATERAL -->
    <div class="modal-backdrop" :class="{ open: menuOpen }" @click="toggleMenu"></div>
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
              <button
                class="rename-btn"
                title="Renombrar"
                type="button"
                @click.stop="renameForm(form)"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>

              <button
                class="delete-btn"
                title="Eliminar"
                type="button"
                @click.stop="deleteForm(form.id)"
              >
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

    <!-- CONTENU PRINCIPAL -->
    <main class="content" v-if="currentForm">

      <!-- Quand le drawer est ouvert, on masque la carte “Información …” -->
      <section class="form-layout" :class="{ wide: capaEditorOpen }">
        <!-- COLONNE GAUCHE : CAPAS -->
        <div class="capas-section">
          <div class="capas-scrollable">
            <div class="capas">
              <div class="capa" v-for="(capa, index) in currentForm.capas" :key="capa.id || index">
                <label :id="'capa-label-'+(capa.id || index)">Capa {{ index + 1 }}</label>

                <button
                  class="capa-name"
                  :class="{ active: editingCapaId === (capa.id || index) }"
                  type="button"
                  :aria-labelledby="'capa-label-'+(capa.id || index)"
                  :aria-selected="(editingCapaId === (capa.id || index)).toString()"
                  @click="openCapa(capa.id || index)"
                  :title="capa.nombre || 'Nombre de la capa'"
                >
                  {{ capa.nombre || 'Nombre de la capa*' }}
                </button>
              </div>

              <div class="capa-actions">
                <button class="add-button" @click="addCapa" type="button">+ Nueva capa</button>
                <button
                  class="del-button"
                  type="button"
                  :disabled="editingCapaId === null"
                  @click="deleteSelectedCapa"
                  title="Eliminar la capa seleccionada"
                >
                  Eliminar capa
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- COLONNE DROITE : información -->
        <div class="info-user" aria-labelledby="info-title">
          <h2 id="info-title">Informacion para el usuario</h2>

          <div class="info-group">
            <label for="descripcion">Descripcion</label>
            <textarea id="descripcion" v-model="currentForm.info.descripcion" rows="3"></textarea>
          </div>

          <div class="info-group">
            <label for="dirigido">A quien va dirigido?</label>
            <textarea id="dirigido" v-model="currentForm.info.dirigido" rows="3"></textarea>
          </div>

          <div class="info-group">
            <label for="resultado">Que resultado ofrece?</label>
            <textarea id="resultado" v-model="currentForm.info.resultado" rows="3"></textarea>
          </div>

          <button class="submit-button" @click="saveForm" type="button" :disabled="saving">
            Guardar
          </button>
        </div>
      </section>
    </main>

    <!-- MODAL EDITOR DE CAPA -->
    <div class="modal-backdrop editor-backdrop" :class="{ open: capaEditorOpen }" @click="closeCapa"></div>
    <div
      class="capa-editor-modal"
      :class="{ open: capaEditorOpen }"
      v-if="currentCapa"
      role="dialog"
      aria-label="Editor de capa"
    >
      <div class="modal-header">
        <h3 class="modal-title">Capa {{ capaIndexInForm + 1 }}</h3>
        <button class="modal-close" type="button" @click="closeCapa">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div class="modal-body">

        <div class="drawer-group">
          <label for="capaNombre">Nombre de la capa*</label>
          <input id="capaNombre" type="text" v-model="currentCapa.nombre" placeholder="Nombre de la capa*" />
        </div>

        <div class="drawer-group">
          <label for="capaDescripcionGeneral">Descripción de la capa*</label>
          <textarea
            id="capaDescripcionGeneral"
            rows="2"
            v-model="currentCapa.descripcionGeneral"
            placeholder="Descripción general de la capa*"
          ></textarea>
        </div>

        <hr class="drawer-sep" />

        <div class="dims-bar">
          <button class="nav-chip" type="button" @click="prevTab">‹</button>

          <div class="dims-tabs" ref="tabsWrap">
            <button
              v-for="(d, i) in currentCapa.dimensiones"
              :key="d.id || i"
              type="button"
              class="dim-chip"
              :class="{ active: i === activeDimIndex }"
              @click="setActiveDim(i)"
            >
              Dimensión {{ i + 1 }}
            </button>
          </div>

          <button class="nav-chip" type="button" @click="nextTab">›</button>
        </div>

        <div v-if="activeDim" class="drawer-group">
          <label for="dimensionNombre">Nombre de la dimensión*</label>
          <input id="dimensionNombre" type="text" v-model="activeDim.nombre" placeholder="Nombre de la dimensión*" />
        </div>

        <div v-if="activeDim" class="drawer-group">
          <label for="dimDescripcion">Descripción*</label>
          <textarea id="dimDescripcion" rows="3" v-model="activeDim.descripcion" placeholder="Descripción*"></textarea>
        </div>

        <div v-if="activeDim" class="drawer-group">
          <div class="car-title">Características</div>
          <input type="text" v-model="activeDim.caracteristicas[0]" placeholder="Característica 1*" />
          <input type="text" v-model="activeDim.caracteristicas[1]" placeholder="Característica 2*" />
          <input type="text" v-model="activeDim.caracteristicas[2]" placeholder="Característica 3*" />
          <input type="text" v-model="activeDim.caracteristicas[3]" placeholder="Característica 4" />
        </div>

        <div class="drawer-actions">
          <div class="left">
            <button
              class="btn ghost"
              type="button"
              @click="addDimension"
              :disabled="currentCapa.dimensiones.length >= 4"
              :title="currentCapa.dimensiones.length >= 4 ? 'Máximo 4 dimensiones' : 'Añadir dimensión'"
            >
              + Nueva dimensión
            </button>

            <button
              class="btn danger"
              type="button"
              @click="removeActiveDimension"
              :disabled="!activeDim"
              title="Eliminar la dimensión actual"
            >
              Eliminar
            </button>
          </div>

          <!-- ICI : on enregistre UNIQUEMENT la couche -->
          <button class="btn primary" type="button" @click="saveCurrentCapa" :disabled="saving">
            Guardar capa
          </button>
        </div>
      </div>
    </div>

    <!-- toasts -->
    <div v-if="error" class="toast error">{{ error }}</div>
    <div v-if="success" class="toast ok">{{ success }}</div>
  </div>
</template>

<script setup>
/* eslint-disable no-console */
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import Api from '@/services/TaxonomyFormService';

/* =========================
   Mesures header/footer
   ========================= */
const headerH = ref(0);
const footerH = ref(0);

function getHeaderEl () {
  return (
    document.querySelector('header') ||
    document.querySelector('[role="banner"]') ||
    document.querySelector('.header') ||
    document.querySelector('#header')
  );
}
function getFooterEl () {
  return (
    document.querySelector('footer') ||
    document.querySelector('[role="contentinfo"]') ||
    document.querySelector('.footer') ||
    document.querySelector('#footer')
  );
}
function measureBars () {
  const h = getHeaderEl();
  const f = getFooterEl();
  headerH.value = h ? Math.round(h.getBoundingClientRect().height) : 0;
  footerH.value = f ? Math.round(f.getBoundingClientRect().height) : 0;
}
const onResize = () => { measureBars(); requestAnimationFrame(measureBars); };
let headerObserver, footerObserver;

onMounted(() => {
  measureBars();
  window.addEventListener('resize', onResize);
  window.addEventListener('orientationchange', onResize);
  const H = getHeaderEl();
  const F = getFooterEl();
  if (window.ResizeObserver) {
    if (H) { headerObserver = new ResizeObserver(measureBars); headerObserver.observe(H); }
    if (F) { footerObserver = new ResizeObserver(measureBars); footerObserver.observe(F); }
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
   UI état global
   ========================= */
const menuOpen = ref(false);
const toggleMenu = () => { menuOpen.value = !menuOpen.value; };
const onKey = (e) => {
  if (e.key === 'Escape') {
    if (capaEditorOpen.value) capaEditorOpen.value = false;
    else if (menuOpen.value) menuOpen.value = false;
  }
};
onMounted(() => window.addEventListener('keydown', onKey));
onBeforeUnmount(() => window.removeEventListener('keydown', onKey));

/* =========================
   Données depuis l'API
   ========================= */
const formularios = ref([]);       // [{ id, nombre }]
const selectedFormId = ref(null);  // id courant
const loading = ref({ forms: true, form: false });
const saving  = ref(false);
const error   = ref('');
const success = ref('');

/**
 * Normalise le DTO back -> modèle UI (espagnol)
 */
function normalize(dto) {
  const layers = Array.isArray(dto?.layers || dto?.capas) ? (dto.layers || dto.capas) : [];
  return {
    id: dto?.id ?? null,
    nombre: dto?.title ?? dto?.name ?? 'Formulario Taxonomía',
    capas: layers.map((l, i) => ({
      id: l?.id ?? null,
      nombre: l?.name ?? l?.nombre ?? `Capa ${i + 1}`,
      descripcionGeneral: l?.description ?? l?.descripcion ?? '',
      dimensiones: (l?.dimensions || l?.dimensiones || []).map((d, j) => {
        const feats = Array.isArray(d?.features) ? d.features
          : (Array.isArray(d?.caracteristicas) ? d.caracteristicas.map(n => ({ name: n })) : []);
        const names = feats.map(f => (typeof f === 'string' ? f : (f?.name ?? '')));
        return {
          id: d?.id ?? null,
          nombre: d?.name ?? d?.nombre ?? `Dimensión ${j + 1}`,
          descripcion: d?.description ?? d?.descripcion ?? '',
          caracteristicas: [names[0] ?? '', names[1] ?? '', names[2] ?? '', names[3] ?? ''],
          // on garde les ids si présents pour une meilleure synchro
          features: Array.isArray(d?.features) ? d.features.map(f => ({ id: f.id, name: f.name })) : []
        };
      })
    })),
    info: {
      descripcion: dto?.description ?? '',
      dirigido: dto?.audience ?? '',
      resultado: dto?.outcome ?? ''
    }
  };
}

/**
 * Dénormalise modèle UI -> DTO back (pour update de méta formulaire uniquement)
 */
function toDTO(form) {
  return {
    id: form.id ?? undefined,
    title: form.nombre,
    description: form.info?.descripcion ?? '',
    audience: form.info?.dirigido ?? '',
    outcome: form.info?.resultado ?? ''
  };
}

/**
 * Dénormalise modèle UI -> DTO back (pour update de tout le formulaire)
 */
function toFullDTO(form) {
  return {
    id: form.id ?? undefined,
    title: form.nombre,
    description: form.info?.descripcion ?? '',
    layers: (form.capas || []).map(capa => ({
      id: capa.id ?? undefined,
      name: capa.nombre,
      description: capa.descripcionGeneral ?? '',
      dimensions: (capa.dimensiones || []).map(dim => ({
        id: dim.id ?? undefined,
        name: dim.nombre,
        description: dim.descripcion ?? '',
        features: (dim.caracteristicas || []).filter(f => f && f.trim()).map((f, i) => ({
          id: (dim.features && dim.features[i]?.id) || undefined,
          name: f
        }))
      }))
    }))
  };
}

/**
 * Dénormalise une capa (layer) du modèle UI -> DTO complet pour l'API
 */
function capaToDTO(capa) {
  return {
    id: capa.id ?? undefined,
    name: capa.nombre,
    description: capa.descripcionGeneral ?? '',
    dimensions: (capa.dimensiones || []).map(dim => ({
      id: dim.id ?? undefined,
      name: dim.nombre,
      description: dim.descripcion ?? '',
      features: (dim.caracteristicas || []).filter(f => f && f.trim()).map((f, i) => ({
        id: (dim.features && dim.features[i]?.id) || undefined,
        name: f
      }))
    }))
  };
}

/* =========================
   Chargement et sélection
   ========================= */
async function fetchFormsList() {
  loading.value.forms = true;
  error.value = '';
  try {
    const { data } = await Api.getFormsList();
    const list = Array.isArray(data) ? data : (data?.content || []);
    formularios.value = list.map(it => ({
      id: it.id,
      nombre: it.title ?? it.name ?? 'Sin título'
    }));
    if (!selectedFormId.value && formularios.value.length) {
      await selectForm(formularios.value[0].id);
    } else if (selectedFormId.value && !formularios.value.find(f => f.id === selectedFormId.value) && formularios.value.length) {
      await selectForm(formularios.value[0].id);
    }
  } catch (e) {
    console.error(e);
    error.value = 'Erreur lors du chargement de la liste.';
  } finally {
    loading.value.forms = false;
  }
}

const currentForm = ref(null);
async function selectForm(id) {
  if (!id) return;
  loading.value.form = true;
  error.value = '';
  success.value = '';
  try {
    const { data } = await Api.getFormById(id);
    currentForm.value = normalize(data);
    selectedFormId.value = currentForm.value.id;
    editingCapaId.value = null;
    capaEditorOpen.value = false;
  } catch (e) {
    console.error(e);
    error.value = 'Erreur lors du chargement du formulaire.';
  } finally {
    loading.value.form = false;
  }
}

/* =========================
   Actions formulaire (métadonnées seulement)
   ========================= */
async function addForm () {
  try {
    const { data } = await Api.createForm({ title: 'Nuevo formulario', description: '' });
    success.value = 'Formulario creado correctamente.';
    await fetchFormsList();
    await selectForm(data?.id || formularios.value[0]?.id);
    menuOpen.value = true;
  } catch (e) {
    console.error(e);
    error.value = 'No se pudo crear el formulario.';
  }
}

function renameForm (form) {
  const nuevo = window.prompt('Nuevo nombre del formulario:', form.nombre);
  if (!nuevo || !nuevo.trim()) return;
  (async () => {
    try {
      if (!currentForm.value || currentForm.value.id !== form.id) {
        await selectForm(form.id);
      }
      await Api.updateForm(form.id, { ...toDTO({ ...currentForm.value, nombre: nuevo.trim() }) });
      await fetchFormsList();
      await selectForm(form.id);
      success.value = 'Nombre actualizado.';
    } catch (e) {
      console.error(e);
      error.value = 'No se pudo renombrar el formulario.';
    }
  })();
}

async function deleteForm (id) {
  const target = formularios.value.find(f => f.id === id);
  const ok = window.confirm(`¿Eliminar "${target?.nombre || 'Formulario'}"?`);
  if (!ok) return;
  try {
    await Api.deleteForm(id);
    success.value = 'Formulario eliminado.';
    await fetchFormsList();
    if (formularios.value.length) await selectForm(formularios.value[0].id);
    else {
      selectedFormId.value = null;
      currentForm.value = null;
    }
  } catch (e) {
    console.error(e);
    error.value = 'No se pudo eliminar el formulario.';
  }
}

async function saveForm () {
  if (!currentForm.value) return;
  saving.value = true;
  error.value = '';
  success.value = '';
  try {
    await Api.updateForm(currentForm.value.id, toFullDTO(currentForm.value));
    success.value = 'Formulario guardado correctamente.';
    await fetchFormsList();
  } catch (e) {
    console.error(e);
    error.value = 'No se pudo guardar el formulario.';
  } finally {
    saving.value = false;
  }
}

/* =========================
   Capas : création / édition / suppression (API)
   ========================= */
function makeDimension(i) {
  return {
    id: null,
    nombre: `Dimensión ${i}`,
    descripcion: '',
    caracteristicas: ['', '', '', ''],
    features: [] // pour retenir les ids si le back les renvoie
  };
}
function makeCapa(n) {
  return {
    id: null,
    nombre: `Capa ${n}`,
    descripcionGeneral: '',
    dimensiones: [makeDimension(1)]
  };
}

async function addCapa () {
  if (!currentForm.value) return;
  try {
    const nombre = window.prompt('Nombre de la capa:', 'Nueva capa');
    if (nombre === null) return;
    const descripcion = window.prompt('Descripción de la capa:', '') ?? '';
    const { data } = await Api.createLayer(currentForm.value.id, {
      name: (nombre || '').trim(),
      description: (descripcion || '').trim()
    });
    currentForm.value.capas.push({
      id: data.id,
      nombre: data.name ?? nombre,
      descripcionGeneral: data.description ?? descripcion,
      dimensiones: []
    });
    openCapa(data.id);
    success.value = 'Capa creada.';
  } catch (e) {
    console.error(e);
    error.value = 'No se pudo crear la capa.';
  }
}

const capaEditorOpen = ref(false);
const editingCapaId = ref(null);
const currentCapa = computed(() =>
  currentForm.value?.capas.find(c => (c.id ?? currentForm.value.capas.indexOf(c)) === editingCapaId.value)
);
const capaIndexInForm = computed(() =>
  currentForm.value?.capas.findIndex(c => (c.id ?? currentForm.value.capas.indexOf(c)) === editingCapaId.value) ?? -1
);

function openCapa (capaId) {
  editingCapaId.value = capaId;
  activeDimIndex.value = 0;
  capaEditorOpen.value = true;
}
function closeCapa () { capaEditorOpen.value = false; }

async function deleteSelectedCapa () {
  if (!currentCapa.value) return;
  const ok = window.confirm(`¿Eliminar "${currentCapa.value.nombre || 'Capa'}"?`);
  if (!ok) return;
  try {
    await Api.deleteLayer(currentCapa.value.id);
    currentForm.value.capas = currentForm.value.capas.filter(c => c.id !== currentCapa.value.id);
    editingCapaId.value = null;
    capaEditorOpen.value = false;
    success.value = 'Capa eliminada.';
  } catch (e) {
    console.error(e);
    error.value = 'No se pudo eliminar la capa.';
  }
}

async function saveCurrentCapa () {
  if (!currentCapa.value) return;
  try {
    await Api.updateLayer(currentCapa.value.id, capaToDTO(currentCapa.value));
    success.value = 'Capa guardada.';
  } catch (e) {
    console.error(e);
    error.value = 'No se pudo guardar la capa.';
  }
}

/* =========================
   Dimensions (max 4) + navigation + API
   ========================= */
const activeDimIndex = ref(0);
const activeDim = computed(() => currentCapa.value?.dimensiones[activeDimIndex.value]);

function setActiveDim (i) { activeDimIndex.value = i; }
function prevTab () {
  if (!currentCapa.value || !currentCapa.value.dimensiones.length) return;
  activeDimIndex.value = (activeDimIndex.value + currentCapa.value.dimensiones.length - 1) % currentCapa.value.dimensiones.length;
}
function nextTab () {
  if (!currentCapa.value || !currentCapa.value.dimensiones.length) return;
  activeDimIndex.value = (activeDimIndex.value + 1) % currentCapa.value.dimensiones.length;
}

async function addDimension () {
  if (!currentCapa.value) return;
  if (currentCapa.value.dimensiones.length >= 4) {
    error.value = 'Máximo 4 dimensiones por capa.';
    return;
  }
  try {
    const nombre = window.prompt('Nombre de la dimensión:', 'Nueva dimensión');
    if (nombre === null) return;
    const descripcion = window.prompt('Descripción de la dimensión:', '') ?? '';
    const { data } = await Api.createDimension(currentCapa.value.id, {
      name: (nombre || '').trim(),
      description: (descripcion || '').trim()
    });
    currentCapa.value.dimensiones.push({
      id: data.id,
      nombre: data.name ?? nombre,
      descripcion: data.description ?? descripcion,
      caracteristicas: ['', '', '', ''],
      features: []
    });
    activeDimIndex.value = currentCapa.value.dimensiones.length - 1;
    success.value = 'Dimensión creada.';
  } catch (e) {
    console.error(e);
    error.value = 'No se pudo crear la dimensión.';
  }
}

async function removeActiveDimension () {
  if (!currentCapa.value || !currentCapa.value.dimensiones.length) return;
  const dim = activeDim.value;
  const ok = window.confirm('¿Eliminar la dimensión actual?');
  if (!ok) return;
  try {
    if (dim?.id) await Api.deleteDimension(dim.id);
    currentCapa.value.dimensiones.splice(activeDimIndex.value, 1);
    if (!currentCapa.value.dimensiones.length) currentCapa.value.dimensiones.push(makeDimension(1));
    if (activeDimIndex.value >= currentCapa.value.dimensiones.length) {
      activeDimIndex.value = currentCapa.value.dimensiones.length - 1;
    }
    success.value = 'Dimensión eliminada.';
  } catch (e) {
    console.error(e);
    error.value = 'No se pudo eliminar la dimensión.';
  }
}

async function saveActiveDimension () {
  if (!currentCapa.value) return;
  const dim = activeDim.value;
  if (!dim) return;
  try {
    if (!dim.id) {
      const { data } = await Api.createDimension(currentCapa.value.id, {
        name: dim.nombre, description: dim.descripcion
      });
      dim.id = data.id;
    } else {
      await Api.updateDimension(dim.id, {
        name: dim.nombre, description: dim.descripcion
      });
    }
    await syncFeatures(dim);
    success.value = 'Dimensión guardada.';
  } catch (e) {
    console.error(e);
    error.value = 'No se pudo guardar la dimensión.';
  }
}

/* =========================
   Características : synchro simple (delete all + recreate)
   ========================= */
async function syncFeatures(dim) {
  try {
    // supprimer l’existant si nous avons des ids
    if (Array.isArray(dim.features) && dim.features.length) {
      for (const f of dim.features) {
        if (f?.id) {
          try { await Api.deleteFeature(f.id); } catch (_) { /* non bloquant */ }
        }
      }
    }
    // créer celles qui ont un texte
    const created = [];
    for (const raw of dim.caracteristicas) {
      const name = (raw ?? '').trim();
      if (!name) continue;
      const { data } = await Api.createFeature(dim.id, { name });
      created.push({ id: data.id, name: data.name ?? name });
    }
    dim.features = created;
  } catch (e) {
    console.warn('syncFeatures warning', e);
  }
}

/* chargement initial */
onMounted(fetchFormsList);

/* refs non critiques (scroll éventuel) */
const tabsWrap = ref(null);
</script>

<style scoped>
/* Variables */
.taxonomy-form-page{
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

.side-menu ul { list-style: none; margin: 0; padding: 0; }
.side-menu li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 0.25rem;
  transition: background 0.15s ease;
}
.side-menu li:hover { background: var(--bg); }
.side-menu li.active { background: var(--violet-soft); }

.item { display: flex; align-items: center; gap: 0.5rem; color: var(--text); font-size: 0.9rem; flex: 1; min-width: 0; }
.item .name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.row-actions { display: flex; gap: 0.25rem; opacity: 0; transition: opacity 0.15s ease; }
.side-menu li:hover .row-actions { opacity: 1; }

.rename-btn, .delete-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  color: #6c757d;
  transition: all 0.15s ease;
}
.rename-btn:hover { background: #e3f2fd; color: #1976d2; }
.delete-btn:hover { background: #ffebee; color: #d32f2f; }

.new-item { margin-bottom: 1rem; }
.new-btn {
  width: 100%;
  background: var(--violet);
  color: white;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background 0.2s ease;
}
.new-btn:hover { background: var(--violet-dark); }
.muted { color: #6c757d; font-size: 0.875rem; text-align: center; padding: 2rem 1rem; }

/* ===== CONTENU ===== */
.content {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem;
  box-sizing: border-box;
}

/* ===== LAYOUT ===== */
.form-layout{
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 2rem; align-items: start;
}
.form-layout.wide{ grid-template-columns: 1fr; }

@media (max-width: 920px){
  .form-layout{ grid-template-columns: 1fr; }
}

/* CAPAS (colonne gauche) */
.capas-section{ 
  min-width: 280px; 
  display: flex; 
  flex-direction: column; 
  background: white;
  border-radius: 12px;
  border: 1px solid var(--border);
  padding: 1.5rem;
}
.capas-scrollable{
  max-height: 480px;
  overflow-y: auto;
  overflow-x: visible;
  padding-right: 0.5rem;
}
.capa{ margin-bottom: 1rem; }
.capa label{ display: block; font-weight: 600; margin-bottom: 0.5rem; font-size: 0.8rem; color: #6c757d; text-transform: uppercase; letter-spacing: 0.5px; }

/* Pilules */
.capa-name{
  width: 100%;
  text-align: left;
  padding: 0.875rem 1rem;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: white;
  font-size: 0.9rem;
  color: var(--text);
  cursor: pointer;
  outline: none;
  transition: all .2s ease;
}
.capa-name:hover{ background: var(--bg); border-color: #dee2e6; }
.capa-name.active,
.capa-name:focus-visible{
  background: var(--violet-soft);
  border-color: var(--violet);
  color: var(--violet);
}

/* Zone boutons sous la liste */
.capa-actions{
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border);
}
.add-button,
.del-button{
  background: white;
  color: var(--text);
  font-weight: 600;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0.625rem 1rem;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all .2s ease;
}
.add-button:hover{ background: var(--violet); color: white; border-color: var(--violet); }
.del-button:hover{ background: #dc3545; color: white; border-color: #dc3545; }
.del-button:disabled{
  opacity: .4;
  cursor: not-allowed;
  background: transparent;
  color: var(--text);
  border-color: var(--text);
}

/* INFO USER (colonne droite) */
.info-user{
  min-width: 300px; background: white;
  border-radius: 12px; padding: 1.5rem;
  border: 1px solid var(--border);
  display: flex; flex-direction: column;
}
.info-user h2{ text-align: left; font-size: 1rem; font-weight: 600; margin-bottom: 1.25rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--border); color: var(--text); }
.info-group{ margin-bottom: 1rem; }
.info-group label{ display: block; font-weight: 500; margin-bottom: 0.5rem; font-size: 0.85rem; color: #495057; }
.info-group textarea{
  width: 100%; min-height: 80px; border-radius: 8px; border: 1px solid var(--border); padding: 0.75rem 1rem;
  resize: vertical; font-size: 0.9rem; background: white; transition: border-color 0.2s ease;
}
.info-group textarea:focus{ outline: none; border-color: var(--violet); }
.submit-button{
  align-self: stretch; margin-top: 0.5rem; padding: 0.875rem 1.5rem; background: var(--violet); color: white;
  font-weight: 600; border: none; border-radius: 8px; cursor: pointer; transition: background .2s ease;
  font-size: 0.9rem;
}
.submit-button:hover{ background: var(--violet-dark); }

/* ======== MODAL EDITOR DE CAPA ======== */
.editor-backdrop {
  z-index: 200;
}

.capa-editor-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.95);
  width: 90%;
  max-width: 800px;
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
.capa-editor-modal.open {
  opacity: 1;
  visibility: visible;
  transform: translate(-50%, -50%) scale(1);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.modal-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
  color: var(--text);
}

.modal-close {
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
.modal-close:hover { background: #dee2e6; }

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

/* Groupes compacts */
.drawer-group{ margin-bottom: 10px; display: flex; flex-direction: column; gap: 6px; }
.drawer-group label{ font-weight: 700; font-size: .93rem; }
.drawer-group input[type="text"]{
  width: 100%; padding: 8px 10px; border-radius: 10px; border: none; background: #fff; font-size: .92rem;
}
.drawer-group textarea{
  width: 100%; padding: 8px 10px; border-radius: 10px; border: none; background: #fff; font-size: .92rem; resize: vertical;
}
.drawer-sep{ border: none; height: 1px; background: rgba(0,0,0,.18); margin: 8px 0 10px; }

.car-title{ font-weight: 700; }

/* Barre des onglets de dimensions (compacts) */
.dims-bar{
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.nav-chip{
  min-width: 28px; height: 28px;
  border-radius: 999px; border: none;
  background: #4b0a3b; color: #fff; cursor: pointer;
}
.dims-tabs{
  display: flex; gap: 8px; overflow: hidden; white-space: nowrap; flex-wrap: nowrap;
}
.dim-chip{
  padding: 6px 10px; border-radius: 999px; border: 2px solid #4b0a3b;
  background: #fff; cursor: pointer; font-weight: 600; font-size: .9rem;
}
.dim-chip.active{ background: #4b0a3b; color: #fff; }

/* Actions en bas (plus compactes) */
.drawer-actions{
  display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-top: 6px;
}
.drawer-actions .left{ display: flex; gap: 8px; flex-wrap: wrap; }

.btn{ border: none; padding: 8px 12px; border-radius: 999px; cursor: pointer; font-weight: 700; font-size: .9rem; }
.btn.ghost{ background: #fff; color: var(--text); }
.btn.primary{ background: #4b0a3b; color: #fff; }
.btn.danger{ background: #7a1f1f; color: #fff; }

/* Scrollbars fines (optionnel) */
.capas-scrollable::-webkit-scrollbar,
.menu-content::-webkit-scrollbar,
.capa-editor-inner::-webkit-scrollbar{ width: 8px; }
.capas-scrollable::-webkit-scrollbar-thumb,
.menu-content::-webkit-scrollbar-thumb,
.capa-editor-inner::-webkit-scrollbar-thumb{ background: rgba(0,0,0,.25); border-radius: 12px; }

/* toasts */
.toast{ position: fixed; right: 18px; bottom: 18px; padding: 10px 12px; border-radius: 10px; }
.toast.error{ background:#ffebe9; color:#b3261e; border:1px solid #b3261e; }
.toast.ok{ background:#e8f5e9; color:#1b5e20; border:1px solid #1b5e20; }
</style>
