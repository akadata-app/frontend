<template>
  <!-- Injecte les hauteurs réelles header/footer pour que les panneaux fixés soient pile entre les deux -->
  <div
    class="taxonomy-form-page"
    :style="{ '--header-h': headerH + 'px', '--footer-h': footerH + 'px' }"
  >
    <!-- BOUTON HAMBURGER -->
    <button
      class="menu-btn"
      :class="{ inside: menuOpen }"
      type="button"
      @click="toggleMenu"
      :aria-expanded="menuOpen.toString()"
      aria-controls="side-menu"
      aria-label="Abrir/Cerrar menú"
    >
      <img src="@/assets/img/menu.png" alt="" />
    </button>

    <!-- MENU LATERAL : liste des formulaires (sélection / ajout / suppression) -->
    <aside
      id="side-menu"
      class="side-menu"
      :class="{ open: menuOpen }"
      role="navigation"
      aria-label="Lista de formularios"
    >
      <div class="menu-content">
        <h2>Lista formularios taxonomías</h2>

        <div class="new-item">
          <button class="new-btn" type="button" @click="addForm">
            <span class="emoji">➕</span> Nuevo formulario
          </button>
        </div>

        <div v-if="loading.forms" class="muted">Cargando…</div>
        <div v-else-if="!formularios.length" class="muted">Aucun formulaire trouvé</div>

        <ul v-else>
          <li
            v-for="form in formularios"
            :key="form.id"
            :class="{ active: form.id === selectedFormId }"
            @click="selectForm(form.id)"
            title="Seleccionar formulario"
          >
            <span class="item">
              <span class="emoji">📂</span>
              <span class="name">{{ form.nombre }}</span>
            </span>

            <div class="row-actions">
              <button
                class="rename-btn"
                title="Renombrar"
                type="button"
                @click.stop="renameForm(form)"
              >✏️</button>

              <button
                class="delete-btn"
                title="Eliminar"
                type="button"
                @click.stop="deleteForm(form.id)"
              >🗑</button>
            </div>
          </li>
        </ul>
      </div>
    </aside>

    <!-- CONTENU PRINCIPAL -->
    <main class="content" :class="{ 'editor-open': capaEditorOpen }" v-if="currentForm">
      <h1 class="title">{{ currentForm.nombre }}</h1>

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

        <!-- COLONNE DROITE : información (masquée si l’éditeur est ouvert) -->
        <div class="info-user" aria-labelledby="info-title" v-if="!capaEditorOpen">
          <h2 id="info-title">Información para el usuario</h2>

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

    <!-- ONGLET / EDITEUR CAPA -->
    <aside
      class="capa-editor compact"
      :class="{ open: capaEditorOpen }"
      v-if="currentCapa"
      role="complementary"
      aria-label="Editor de capa"
    >
      <div class="capa-editor-inner">
        <button class="drawer-close" type="button" @click="closeCapa">
          <span aria-hidden="true">×</span>
        </button>

        <h3 class="drawer-title">Capa {{ capaIndexInForm + 1 }}</h3>

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
    </aside>

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
/* Variables pilotées par :style */
.taxonomy-form-page{
  --menu-w: 340px;
  --drawer-w: clamp(520px, 42vw, 720px);
  --primary-color: #56005b;
  --primary-hover: #40004a;
  --secondary-bg: #f9fafb;
  --border-color: #e5e7eb;
  --text-primary: #1f2937;
  --text-secondary: #6b7280;
  --card-bg: #ffffff;
  position: relative;
  width: 100%;
  box-sizing: border-box;
  font-family: 'Roboto', 'Segoe UI', system-ui, -apple-system, sans-serif;
  background: var(--secondary-bg);
  color: var(--text-primary);
}

/* ===== BOUTON HAMBURGER ===== */
.menu-btn{
  position: fixed;
  left: 12px;
  top: calc(var(--header-h) + 12px);
  width: 44px; height: 44px;
  display: grid; place-items: center;
  background: var(--primary-color);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  z-index: 40;
  transition: all .28s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.menu-btn:hover{
  background: var(--primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
.menu-btn img{ width: 22px; height: 22px; }
.menu-btn.inside{ left: calc(var(--menu-w) - 56px); }

/* ===== MENU GAUCHE ===== */
.side-menu{
  position: fixed;
  left: calc(-1 * var(--menu-w));
  width: var(--menu-w);
  top: var(--header-h);
  bottom: var(--footer-h);
  background: var(--card-bg);
  border-radius: 0;
  box-shadow: 2px 0 12px rgba(0,0,0,.15);
  transition: left .28s ease;
  z-index: 30;
  display: flex; flex-direction: column; min-height: 0;
  border-right: 1px solid var(--border-color);
}
.side-menu.open{ left: 0; }
.menu-content{ flex: 1 1 auto; overflow-y: auto; padding: 20px; box-sizing: border-box; }
.side-menu h2{ 
  color: var(--primary-color); 
  font-size: 1.15rem; 
  margin: 0 0 16px;
  font-weight: 600;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--border-color);
}

.side-menu ul{ list-style: none; margin: 0; padding: 0; }
.side-menu li{
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 12px; border-radius: 8px; cursor: pointer;
  margin-bottom: 4px;
  border: 1px solid transparent;
  transition: all .2s ease;
}
.side-menu li:hover{ 
  background: var(--secondary-bg); 
  border-color: var(--border-color);
}
.side-menu li.active{ 
  background: var(--secondary-bg); 
  border-color: var(--primary-color);
  box-shadow: 0 2px 4px rgba(86, 0, 91, 0.1);
}
.item{ 
  display: inline-flex; 
  align-items: center; 
  gap: 8px; 
  color: var(--text-primary); 
  font-size: .95rem;
  font-weight: 500;
}
.emoji{ width: 20px; text-align: center; }
.row-actions{ display: inline-flex; gap: 8px; }
.rename-btn,
.delete-btn{ 
  background: transparent; 
  border: none; 
  cursor: pointer; 
  font-size: 1.1rem;
  padding: 4px;
  border-radius: 4px;
  transition: background .2s ease;
}
.rename-btn:hover{
  background: var(--secondary-bg);
}
.delete-btn{ color: #c63b1e; }
.delete-btn:hover{
  background: #fef2f2;
}
.new-item{ padding: 0 0 12px; }
.new-btn{
  width: 100%; 
  background: var(--primary-color); 
  color: #ffffff;
  font-weight: 600; 
  border: none; 
  border-radius: 6px; 
  padding: 10px 16px; 
  cursor: pointer;
  transition: all .2s ease;
}
.new-btn:hover{
  background: var(--primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(86, 0, 91, 0.3);
}

/* ===== CONTENU ===== */
.content{
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: clamp(12px, 1.6vw, 24px);
  box-sizing: border-box;
}
.content.editor-open{ padding-right: calc(var(--drawer-w) + 18px); }

.title{ 
  text-align: left; 
  font-size: clamp(1.25rem, 2.2vw, 1.6rem); 
  font-weight: 600; 
  margin: 0 0 20px; 
  color: var(--primary-color);
}

/* ===== LAYOUT ===== */
.form-layout{
  display: grid; grid-template-columns: 1fr 1fr;
  gap: clamp(12px, 2vw, 24px); align-items: start;
}
.form-layout.wide{ grid-template-columns: 1fr; }

@media (max-width: 920px){
  .form-layout{ grid-template-columns: 1fr; }
}

/* CAPAS (colonne gauche) */
.capas-section{ 
  min-width: 270px; 
  display: flex; 
  flex-direction: column;
  background: var(--card-bg);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid var(--border-color);
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}
.capas-scrollable{
  max-height: 520px;
  overflow-y: auto;
  overflow-x: visible;
  padding: 0;
}
.capa{ margin-bottom: 12px; }
.capa label{ 
  display: block; 
  font-weight: 600; 
  margin-bottom: 8px; 
  font-size: .95rem;
  color: var(--text-primary);
}

/* Pilules */
.capa-name{
  width: 100%;
  text-align: left;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: #ffffff;
  font-size: .95rem;
  color: var(--text-primary);
  cursor: pointer;
  outline: none;
  font-weight: 500;
  transition: all .2s ease;
}
.capa-name:hover{ 
  background: var(--secondary-bg); 
  border-color: var(--primary-color);
  transform: translateX(2px);
}
.capa-name.active,
.capa-name:focus-visible{
  background: var(--primary-color);
  color: #ffffff;
  border-color: var(--primary-color);
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(86, 0, 91, 0.2);
}

/* Zone boutons sous la liste */
.capa-actions{
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 12px;
}
.add-button{
  flex: 1;
  background: var(--primary-color);
  color: #ffffff;
  font-weight: 600;
  border: none;
  border-radius: 6px;
  padding: 10px 16px;
  font-size: .9rem;
  cursor: pointer;
  transition: all .2s ease;
}
.add-button:hover{ 
  background: var(--primary-hover); 
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(86, 0, 91, 0.3);
}
.del-button{
  flex: 1;
  background: #ffffff;
  color: #c63b1e;
  font-weight: 600;
  border: 1px solid #c63b1e;
  border-radius: 6px;
  padding: 10px 16px;
  font-size: .9rem;
  cursor: pointer;
  transition: all .2s ease;
}
.del-button:hover{
  background: #c63b1e;
  color: #ffffff;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(198, 59, 30, 0.3);
}
.del-button:disabled{
  opacity: .5;
  cursor: not-allowed;
  background: #ffffff;
  color: #c63b1e;
  transform: none;
}

/* INFO USER (colonne droite) */
.info-user{
  min-width: 300px; 
  background: var(--card-bg);
  border-radius: 12px; 
  padding: 24px; 
  display: flex; 
  flex-direction: column;
  border: 1px solid var(--border-color);
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}
.info-user h2{ 
  text-align: center; 
  font-size: 1.25rem; 
  font-weight: 600; 
  margin-bottom: 16px;
  color: var(--primary-color);
}
.info-group{ margin-bottom: 16px; }
.info-group label{ 
  display: block; 
  font-weight: 600; 
  margin-bottom: 8px;
  color: var(--text-primary);
}
.info-group textarea{
  width: 100%; 
  min-height: 84px; 
  border-radius: 8px; 
  border: 1px solid var(--border-color); 
  padding: 12px;
  resize: vertical; 
  font-size: .93rem; 
  background: #ffffff;
  transition: border-color .2s ease;
}
.info-group textarea:focus{
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(86, 0, 91, 0.1);
}
.submit-button{
  align-self: center; 
  margin-top: 8px; 
  padding: 10px 20px; 
  background: var(--primary-color); 
  color: #ffffff;
  font-weight: 600; 
  border: none; 
  border-radius: 6px; 
  cursor: pointer; 
  transition: all .2s ease;
}
.submit-button:hover{ 
  background: var(--primary-hover); 
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(86, 0, 91, 0.3);
}

/* ======== ONGLET EDITEUR DE CAPA ======== */
.capa-editor{
  position: fixed;
  right: calc(-1 * var(--drawer-w));
  top: var(--header-h);
  bottom: var(--footer-h);
  width: var(--drawer-w);
  background: var(--card-bg);
  box-shadow: -4px 0 12px rgba(0,0,0,.15);
  transition: right .28s ease;
  z-index: 35;
  display: flex; flex-direction: column; min-height: 0;
  border-left: 1px solid var(--border-color);
}
.capa-editor.open{ right: 0; }
.capa-editor-inner{
  flex: 1 1 auto; overflow-y: auto; padding: 20px; box-sizing: border-box;
}
.capa-editor.compact .drawer-title{ 
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--primary-color);
}

/* Bouton fermeture */
.drawer-close{
  position: sticky; top: 0; margin-left: auto;
  width: 32px; height: 32px; display: grid; place-items: center;
  background: var(--primary-color); color: #ffffff; border: none; border-radius: 6px; cursor: pointer;
  transition: all .2s ease;
}
.drawer-close:hover{
  background: var(--primary-hover);
  transform: scale(1.05);
}

/* Groupes compacts */
.drawer-group{ margin-bottom: 16px; display: flex; flex-direction: column; gap: 8px; }
.drawer-group label{ 
  font-weight: 600; 
  font-size: .93rem;
  color: var(--text-primary);
}
.drawer-group input[type="text"]{
  width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--border-color); background: #ffffff; font-size: .92rem;
  transition: border-color .2s ease;
}
.drawer-group input[type="text"]:focus{
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(86, 0, 91, 0.1);
}
.drawer-group textarea{
  width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--border-color); background: #ffffff; font-size: .92rem; resize: vertical;
  transition: border-color .2s ease;
}
.drawer-group textarea:focus{
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(86, 0, 91, 0.1);
}
.drawer-sep{ border: none; height: 1px; background: var(--border-color); margin: 16px 0; }

.car-title{ font-weight: 700; }

/* Barre des onglets de dimensions (compacts) */
.dims-bar{
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}
.nav-chip{
  min-width: 32px; height: 32px;
  border-radius: 6px; border: none;
  background: var(--primary-color); color: #ffffff; cursor: pointer;
  transition: all .2s ease;
}
.nav-chip:hover{
  background: var(--primary-hover);
  transform: scale(1.05);
}
.dims-tabs{
  display: flex; gap: 8px; overflow: hidden; white-space: nowrap; flex-wrap: nowrap;
}
.dim-chip{
  padding: 8px 14px; border-radius: 6px; border: 1px solid var(--border-color);
  background: #ffffff; cursor: pointer; font-weight: 500; font-size: .9rem;
  transition: all .2s ease;
}
.dim-chip:hover{
  border-color: var(--primary-color);
  background: var(--secondary-bg);
}
.dim-chip.active{ 
  background: var(--primary-color); 
  color: #ffffff;
  border-color: var(--primary-color);
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(86, 0, 91, 0.2);
}

/* Actions en bas (plus compactes) */
.drawer-actions{
  display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-top: 16px;
}
.drawer-actions .left{ display: flex; gap: 8px; flex-wrap: wrap; }

.btn{ 
  border: none; 
  padding: 10px 20px; 
  border-radius: 6px; 
  cursor: pointer; 
  font-weight: 600; 
  font-size: .9rem;
  transition: all .2s ease;
}
.btn.ghost{ 
  background: #ffffff; 
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}
.btn.ghost:hover{
  background: var(--secondary-bg);
  border-color: var(--primary-color);
}
.btn.primary{ 
  background: var(--primary-color); 
  color: #ffffff;
}
.btn.primary:hover:not(:disabled){
  background: var(--primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(86, 0, 91, 0.3);
}
.btn.primary:disabled{
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}
.btn.danger{ 
  background: #ffffff;
  color: #c63b1e;
  border: 1px solid #c63b1e;
}
.btn.danger:hover{
  background: #c63b1e;
  color: #ffffff;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(198, 59, 30, 0.3);
}

/* Scrollbars fines (optionnel) */
.capas-scrollable::-webkit-scrollbar,
.menu-content::-webkit-scrollbar,
.capa-editor-inner::-webkit-scrollbar{ width: 8px; }
.capas-scrollable::-webkit-scrollbar-thumb,
.menu-content::-webkit-scrollbar-thumb,
.capa-editor-inner::-webkit-scrollbar-thumb{ background: rgba(0,0,0,.25); border-radius: 12px; }

/* toasts */
.toast{ 
  position: fixed; 
  right: 24px; 
  bottom: calc(24px + var(--footer-h)); 
  padding: 14px 20px; 
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 70;
  font-weight: 500;
  animation: slideIn .3s ease;
}
.toast.error{ 
  background: #fef2f2; 
  color: #dc2626; 
  border: 1px solid #fecaca;
}
.toast.ok{ 
  background: #d1fae5; 
  color: #059669; 
  border: 1px solid #a7f3d0;
}
@keyframes slideIn{
  from{ transform: translateX(400px); opacity: 0; }
  to{ transform: translateX(0); opacity: 1; }
}
</style>
