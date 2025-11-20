<template>
  <div
    class="madurez-page"
    :class="{ 'drawer-open': drawerOpen }"
    :style="{ '--header-h': headerH + 'px', '--footer-h': footerH + 'px' }"
  >
    <!-- ===== Bouton hamburger (menu Formulaires) ===== -->
    <button
      class="menu-btn"
      :class="{ inside: menuOpen }"
      type="button"
      @click="toggleMenu"
      :aria-expanded="menuOpen.toString()"
      aria-controls="side-menu"
      aria-label="Abrir/Cerrar menú de formularios"
    >
      <img src="@/assets/img/menu.png" alt="" />
    </button>

    <!-- ===== Menu latéral : Liste de formularios ===== -->
    <aside
      id="side-menu"
      class="side-menu"
      :class="{ open: menuOpen }"
      role="navigation"
      aria-label="Lista de formularios"
    >
      <div class="menu-content">
        <h2>Lista de formularios</h2>

        <div class="new-item">
          <button class="new-btn" type="button" @click="addForm">
            <span class="emoji">➕</span> Nuevo formulario
          </button>
        </div>

        <div v-if="loading.forms" class="muted">Cargando…</div>
        <div v-else-if="!formularios.length" class="muted">Aucun formulario</div>

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

    <!-- ===== Colonne gauche : dominios du formulario courant ===== -->
    <aside class="left" v-if="currentForm">
      <h2 class="left-title">{{ currentForm.title || currentForm.nombre }}</h2>

      <ul class="dominios">
        <li v-for="(dom, i) in currentForm.dominios" :key="dom.id || i" class="dom-item">
          <button
            class="dom-pill"
            :class="{ active: selectedDomainKey === (dom.id ?? i) }"
            type="button"
            @click="openEditor(dom.id ?? i)"
            :title="dom.nombre || ('Dominio ' + (i + 1))"
          >
            <span class="label">{{ dom.nombre || ('Dominio ' + (i + 1)) }}</span>
          </button>
        </li>
      </ul>

      <div class="left-actions">
        <button class="add-domain" type="button" @click="addDominio">
          <span class="plus">＋</span> Nuevo dominio
        </button>

        <button
          class="del-domain"
          type="button"
          :disabled="!currentForm || currentForm.dominios.length <= 1"
          @click="removeDominio"
          title="Eliminar el dominio seleccionado (o el último si ninguno está abierto)"
        >
          🗑 Eliminar dominio
        </button>
      </div>
    </aside>

    <!-- ===== Panneau droit : info / drawer edición ===== -->
    <main class="right" v-if="currentForm">
      <section v-if="!drawerOpen" class="info-card" aria-labelledby="info-title">
        <h3 id="info-title">Información para el usuario</h3>

        <div class="info-group">
          <label for="infodesc">Descripción</label>
          <textarea id="infodesc" rows="4" v-model="currentForm.info.descripcion"></textarea>
        </div>

        <div class="info-group">
          <label for="infodir">¿A quién va dirigido?</label>
          <textarea id="infodir" rows="3" v-model="currentForm.info.dirigido"></textarea>
        </div>

        <div class="info-group">
          <label for="infores">¿Qué resultado ofrece?</label>
          <textarea id="infores" rows="3" v-model="currentForm.info.resultado"></textarea>
        </div>

        <div class="actions" style="justify-content:flex-end;margin-top:10px">
          <button class="primary" type="button" :disabled="saving" @click="saveForm">Guardar ficha</button>
        </div>
      </section>

      <!-- Drawer d’édition Dominio/KDA -->
      <section class="drawer" :class="{ open: drawerOpen }" v-if="currentDominio">
        <button class="close" type="button" @click="closeEditor" aria-label="Cerrar editor">✕</button>

        <header class="drawer-head">
          <h3>Dominio {{ dominioIndex + 1 }}</h3>
        </header>

        <div class="group">
          <label>Nombre del dominio</label>
          <input type="text" v-model="currentDominio.nombre" placeholder="Nombre del dominio" />
        </div>

        <div class="kda-tabs" v-if="currentDominio && currentDominio.kdas?.length">
          <button
            v-for="(kda, i) in currentDominio.kdas"
            :key="kda.id || i"
            type="button"
            class="kda-pill"
            :class="{ active: selectedKDAIndex === i }"
            @click="selectedKDAIndex = i"
            :title="kda.nombre || ('KDA ' + (i + 1))"
          >
            {{ kda.nombre || ('KDA ' + (i + 1)) }}
          </button>
        </div>

        <hr class="sep" />

        <div v-if="currentKDA">
          <div class="group">
            <label>Nombre del KDA</label>
            <input type="text" v-model="currentKDA.nombre" placeholder="Nombre del KDA" />
          </div>

          <div class="group">
            <label>Descripción</label>
            <textarea rows="3" v-model="currentKDA.descripcion" placeholder="Descripción"></textarea>
          </div>

          <div class="group">
            <label>Pregunta</label>
            <textarea rows="3" v-model="currentKDA.pregunta" placeholder="Pregunta"></textarea>
          </div>

          <!-- Niveles -->
          <div class="levels">
            <div class="levels-head">
              <div class="col level-col">Nivel</div>
              <div class="col answer-col">Respuesta / criterio</div>
            </div>

            <div v-for="(nivel, idx) in currentKDA.niveles" :key="idx" class="row">
              <div class="col level-col">Nivel {{ idx + 1 }}</div>

              <div class="col answer-col">
                <input type="text" v-model="nivel.texto" :placeholder="`Nivel ${idx + 1}`" />
              </div>
            </div>
          </div>

          <!-- Imagen -->
          <div class="image-line">
            <button class="img-btn" type="button" @click="askImage">
              <span class="cam">📷</span> Agregar imagen asociada
            </button>
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              class="hidden"
              @change="onImagePicked"
            />
            <div v-if="currentKDA.imagenNombre" class="img-name">
              {{ currentKDA.imagenNombre }}
            </div>
          </div>

          <div class="actions">
            <button class="ghost" type="button" @click="newKDA">Nuevo KDA</button>
            <button
              class="danger"
              type="button"
              :disabled="!currentDominio || currentDominio.kdas.length <= 1"
              @click="removeKDA"
              title="Eliminar el KDA actual"
            >
              Eliminar KDA
            </button>
            <button class="primary" type="button" :disabled="saving" @click="saveCurrentKDA">
              Guardar KDA
            </button>
          </div>
        </div>
      </section>
    </main>

    <div v-if="error" class="toast error">{{ error }}</div>
    <div v-if="success" class="toast ok">{{ success }}</div>
  </div>
</template>

<script setup>
/* eslint-disable no-console */
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import Api from '@/services/MaturityModelService'  // <— branchement sur ton back

/* ===== Entête/pied (mesures) ===== */
const headerH = ref(0)
const footerH = ref(0)
function getHeaderEl () {
  return (
    document.querySelector('header') ||
    document.querySelector('[role="banner"]') ||
    document.querySelector('.header') ||
    document.querySelector('#header')
  )
}
function getFooterEl () {
  return (
    document.querySelector('footer') ||
    document.querySelector('[role="contentinfo"]') ||
    document.querySelector('.footer') ||
    document.querySelector('#footer')
  )
}
function measureBars () {
  const h = getHeaderEl()
  const f = getFooterEl()
  headerH.value = h ? Math.round(h.getBoundingClientRect().height) : 0
  footerH.value = f ? Math.round(f.getBoundingClientRect().height) : 0
}
const onResize = () => { measureBars(); requestAnimationFrame(measureBars) }
let headerObserver, footerObserver
onMounted(() => {
  measureBars()
  window.addEventListener('resize', onResize)
  window.addEventListener('orientationchange', onResize)
  const H = getHeaderEl()
  const F = getFooterEl()
  if (window.ResizeObserver) {
    if (H) { headerObserver = new ResizeObserver(measureBars); headerObserver.observe(H) }
    if (F) { footerObserver = new ResizeObserver(measureBars); footerObserver.observe(F) }
  }
  setTimeout(measureBars, 120)
  setTimeout(measureBars, 420)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  window.removeEventListener('orientationchange', onResize)
  headerObserver?.disconnect?.()
  footerObserver?.disconnect?.()
})

/* ===== UI global ===== */
const drawerOpen = ref(false)
const menuOpen = ref(false)
const toggleMenu = () => { menuOpen.value = !menuOpen.value }

/* ===== Toasts & flags ===== */
const loading = ref({ forms: false, form: false })
const saving  = ref(false)
const error   = ref('')
const success = ref('')

/* ===== Form courant + liste ===== */
const currentForm = ref(null)
const selectedFormId = ref(null)
const formularios = ref([]) // [{id, nombre}]

/* ===== Drawer/KDA ===== */
const selectedDomainKey = ref(null)
const selectedKDAIndex = ref(0)
const currentDominio = computed(() => {
  const doms = currentForm.value?.dominios || []
  if (selectedDomainKey.value == null) return null
  const idx = doms.findIndex(d => (d.id ?? doms.indexOf(d)) === selectedDomainKey.value)
  return idx >= 0 ? doms[idx] : null
})
const dominioIndex = computed(() => {
  if (!currentDominio.value) return -1
  return (currentForm.value?.dominios || []).findIndex(d => d === currentDominio.value)
})
const currentKDA = computed(() => currentDominio.value?.kdas[selectedKDAIndex.value])

/* ===== Fabriques locales ===== */
function makeDominio (nombre = '') {
  return { id: null, nombre, kdas: [makeKDA()] }
}
function makeKDA () {
  return {
    id: null,
    nombre: '', descripcion: '', pregunta: '',
    niveles: [
      { texto: '', peso: 0, activo: true },
      { texto: '', peso: 0, activo: true },
      { texto: '', peso: 0, activo: true },
      { texto: '', peso: 0, activo: true },
      { texto: '', peso: 0, activo: true }
    ],
    imagen: null, imagenNombre: ''
  }
}

/* ===== Mapping back <-> UI ===== */
function normalizeModel(dto) {
  const domains = Array.isArray(dto?.domains) ? dto.domains : [];
  return {
    id: dto?.id ?? null,
    title: dto?.title ?? dto?.name ?? 'Formulario de Madurez',
    nombre: dto?.title ?? dto?.name ?? 'Formulario de Madurez',
    dominios: domains.map((d, i) => {
      return {
        id: d?.id ?? null,
        nombre: d?.name ?? `Dominio ${i + 1}`,
        descripcionGeneral: d?.description ?? '',
        kdas: Array.isArray(d?.kdas) ? d.kdas.map((k, j) => {
          return {
            id: k?.id ?? null,
            nombre: k?.name ?? `KDA ${j + 1}`,
            descripcion: k?.description ?? '',
            pregunta: k?.question ?? '',
            niveles: [
              { texto: k?.level1 ?? '', peso: 0, activo: true },
              { texto: k?.level2 ?? '', peso: 0, activo: true },
              { texto: k?.level3 ?? '', peso: 0, activo: true },
              { texto: k?.level4 ?? '', peso: 0, activo: true },
              { texto: k?.level5 ?? '', peso: 0, activo: true }
            ],
            imagen: k?.image ?? null,
            imagenNombre: ''
          };
        }) : []
      };
    }),
    info: {
      descripcion: dto?.description ?? '',
      dirigido: dto?.target ?? dto?.audience ?? '',
      resultado: dto?.result ?? dto?.outcome ?? ''
    }
  };
}
function normalizeDomain(raw, i = 0) {
  return {
    id: raw?.id ?? null,
    nombre: raw?.name ?? `Dominio ${i + 1}`,
    kdas: (raw?.kdas || raw?.dimensions || []).map((k, j) => normalizeKda(k, j))
  }
}
function normalizeKda(k, j = 0) {
  // Manejar datos del backend que vienen como level1, level2, etc.
  const niveles = [
    { texto: k?.level1 || '' },
    { texto: k?.level2 || '' },
    { texto: k?.level3 || '' },
    { texto: k?.level4 || '' },
    { texto: k?.level5 || '' }
  ];
  
  return {
    id: k?.id ?? null,
    nombre: k?.name ?? `KDA ${j + 1}`,
    descripcion: k?.description ?? '',
    pregunta: k?.question ?? '',
    niveles,
    imagen: null, imagenNombre: ''
  }
}

// UI -> DTOs pour le back
function dtoForm(form) {
  return {
    id: form.id ?? undefined,
    title: form.title || form.nombre,
    description: form.info?.descripcion ?? ''
  }
}
function dtoDomain(dom) {
  return {
    id: dom.id ?? undefined,
    name: dom.nombre
  }
}
function dtoKda(k) {
  const niveles = k.niveles || [];
  return {
    id: k.id ?? undefined,
    name: k.nombre,
    description: k.descripcion ?? '',
    question: k.pregunta ?? '',
    level1: niveles[0]?.texto ?? '',
    level2: niveles[1]?.texto ?? '',
    level3: niveles[2]?.texto ?? '',
    level4: niveles[3]?.texto ?? '',
    level5: niveles[4]?.texto ?? ''
  }
}
function toFullDTO(form) {
  return {
    id: form.id ?? undefined,
    title: form.title || form.nombre,
    description: form.info?.descripcion ?? '',
    target: form.info?.dirigido ?? '',
    result: form.info?.resultado ?? '',
    domains: (form.dominios || []).map(dom => ({
      id: dom.id ?? undefined,
      name: dom.nombre,
      maturityModelId: form.id ?? undefined,
      kdas: (dom.kdas || []).map(kda => ({
        id: kda.id ?? undefined,
        domainId: dom.id ?? undefined,
        name: kda.nombre,
        description: kda.descripcion ?? '',
        question: kda.pregunta ?? '',
        level1: kda.niveles?.[0]?.texto ?? '',
        level2: kda.niveles?.[1]?.texto ?? '',
        level3: kda.niveles?.[2]?.texto ?? '',
        level4: kda.niveles?.[3]?.texto ?? '',
        level5: kda.niveles?.[4]?.texto ?? '',
        image: kda.imagen ?? null // à convertir en byte[] si besoin
      }))
    }))
  };
}

/* ======= API : liste & sélection de formularios ======= */
async function fetchFormsList() {
  loading.value.forms = true
  error.value = ''
  try {
    const { data } = await Api.list()
    const list = Array.isArray(data) ? data : (data?.content || [])
    formularios.value = list.map(it => ({
      id: it.id,
      nombre: it.title ?? it.name ?? 'Sin título'
    }))
    if (!selectedFormId.value && formularios.value.length) {
      await selectForm(formularios.value[0].id)
    } else if (
      selectedFormId.value &&
      !formularios.value.find(f => f.id === selectedFormId.value) &&
      formularios.value.length
    ) {
      await selectForm(formularios.value[0].id)
    }
  } catch (e) {
    console.error(e)
    error.value = 'Erreur lors du chargement de la lista de formularios.'
  } finally {
    loading.value.forms = false
  }
}

async function selectForm(id) {
  if (!id) return;
  loading.value.form = true;
  error.value = '';
  success.value = '';
  try {
    const { data } = await Api.getById(id);
    // On suppose que le back renvoie tout (domains + kdas)
    currentForm.value = normalizeModel(data);
    selectedFormId.value = currentForm.value.id;
    selectedDomainKey.value = null;
    drawerOpen.value = false;
  } catch (e) {
    console.error(e);
    error.value = 'Erreur lors du chargement del formulario.';
  } finally {
    loading.value.form = false;
  }
}

async function addForm () {
  try {
    const title = window.prompt('Nombre del formulario:', 'Nuevo formulario');
    if (title === null) return;
    const description = window.prompt('Descripción del formulario:', '') ?? '';
    const { data } = await Api.create({ title, description });
    success.value = 'Formulario creado correctamente.';
    await fetchFormsList();
    await selectForm(data?.id || formularios.value[0]?.id);
    menuOpen.value = true;
  } catch (e) {
    console.error(e);
    error.value = 'No se pudo crear el formulario.';
  }
}

async function renameForm (form) {
  const nuevo = window.prompt('Nuevo nombre del formulario:', form.nombre)
  if (!nuevo || !nuevo.trim()) return
  try {
    saving.value = true
    // Only send the title field to update
    const payload = { title: nuevo.trim() }
    await Api.update(form.id, payload)
    await fetchFormsList()
    // Update current form if it's the one being renamed
    if (currentForm.value?.id === form.id) {
      currentForm.value.title = nuevo.trim()
      currentForm.value.nombre = nuevo.trim()
    }
    success.value = 'Nombre actualizado.'
  } catch (e) {
    console.error(e)
    error.value = 'No se pudo renombrar el formulario.'
  } finally {
    saving.value = false
  }
}

async function deleteForm (id) {
  const target = formularios.value.find(f => f.id === id)
  const ok = window.confirm(`¿Eliminar "${target?.nombre || 'Formulario'}"?`)
  if (!ok) return
  try {
    await Api.delete(id)
    success.value = 'Formulario eliminado.'
    await fetchFormsList()
    if (formularios.value.length) await selectForm(formularios.value[0].id)
    else {
      selectedFormId.value = null
      currentForm.value = {
        id: null, nombre: 'Formulario de Madurez',
        dominios: [makeDominio('Dominio 1')],
        info: { descripcion: '', dirigido: '', resultado: '' }
      }
    }
  } catch (e) {
    console.error(e)
    error.value = 'No se pudo eliminar el formulario.'
  }
}

/* ======= DOMINIO ======= */
function openEditor (key) {
  selectedDomainKey.value = key
  const dom = currentDominio.value
  if (dom && (!dom.kdas || !dom.kdas.length)) dom.kdas = [makeKDA()]
  selectedKDAIndex.value = 0
  drawerOpen.value = true
}
function closeEditor () { drawerOpen.value = false }

async function addDominio () {
  if (!currentForm.value) return;
  const nombre = window.prompt('Nombre del dominio:', 'Nuevo dominio');
  if (nombre === null) return;
  try {
    saving.value = true;
    // Create domain in backend immediately
    const payload = { name: nombre, maturityModelId: currentForm.value.id };
    const { data } = await Api.createDomain(currentForm.value.id, payload);
    // Normalize and add to local state
    const nuevo = normalizeDomain(data, currentForm.value.dominios.length);
    currentForm.value.dominios.push(nuevo);
    openEditor(nuevo.id ?? (currentForm.value.dominios.length - 1));
    success.value = 'Dominio creado y listo para editar.';
  } catch (e) {
    console.error(e);
    error.value = 'No se pudo crear el dominio.';
  } finally {
    saving.value = false;
  }
}
async function removeDominio () {
  const doms = currentForm.value?.dominios || []
  if (doms.length <= 1) return
  let idx = -1
  if (selectedDomainKey.value != null) {
    idx = doms.findIndex(d => (d.id ?? doms.indexOf(d)) === selectedDomainKey.value)
  }
  if (idx === -1) idx = doms.length - 1
  const target = doms[idx]
  if (!window.confirm(`¿Eliminar "${target?.nombre || `Dominio ${idx + 1}`}"?`)) return

  try {
    await Api.deleteDomain(target.id)
    doms.splice(idx, 1)
    selectedDomainKey.value = null
    drawerOpen.value = false
    success.value = 'Dominio eliminado.'
  } catch (e) {
    console.error(e)
    error.value = 'No se pudo eliminar el dominio.'
  }
}

/* ======= KDA ======= */
function newKDA () {
  if (!currentDominio.value) return
  if (currentDominio.value.kdas.length >= 4) {
    error.value = 'Máximo 4 KDA por dominio.'
    return
  }
  currentDominio.value.kdas.push(makeKDA())
  selectedKDAIndex.value = currentDominio.value.kdas.length - 1
  success.value = 'Nuevo KDA listo para editar.'
}
async function removeKDA () {
  if (!currentDominio.value) return
  if (currentDominio.value.kdas.length <= 1) return
  const kda = currentKDA.value
  const nombre = kda?.nombre || `KDA ${selectedKDAIndex.value + 1}`
  if (!window.confirm(`¿Eliminar "${nombre}"?`)) return
  try {
    if (kda?.id) await Api.deleteKda(kda.id)
    currentDominio.value.kdas.splice(selectedKDAIndex.value, 1)
    if (selectedKDAIndex.value >= currentDominio.value.kdas.length) {
      selectedKDAIndex.value = currentDominio.value.kdas.length - 1
    }
    success.value = 'KDA eliminado.'
  } catch (e) {
    console.error(e)
    error.value = 'No se pudo eliminar el KDA.'
  }
}
async function saveCurrentKDA () {
  if (!currentDominio.value || !currentKDA.value) return
  try {
    saving.value = true
    const payload = dtoKda(currentKDA.value)
    if (!currentKDA.value.id) {
      const { data } = await Api.createKda(currentDominio.value.id, payload)
      Object.assign(currentKDA.value, normalizeKda(data))
    } else {
      const { data } = await Api.updateKda(currentKDA.value.id, currentDominio.value.id, payload)
      Object.assign(currentKDA.value, normalizeKda(data))
    }
    success.value = 'KDA guardado.'
  } catch (e) {
    console.error(e)
    error.value = 'No se pudo guardar el KDA.'
  } finally {
    saving.value = false
  }
}

/* ======= Sauver le formulaire (titre/description/info) ======= */
async function saveForm () {
  if (!currentForm.value) return
  try {
    saving.value = true
    const payload = toFullDTO(currentForm.value)
    const { data } = await Api.update(currentForm.value.id, payload)
    if (data?.id) currentForm.value = { ...currentForm.value, ...normalizeModel(data) }
    success.value = 'Formulario guardado correctamente.'
    await fetchFormsList()
  } catch (e) {
    console.error(e)
    error.value = 'No se pudo guardar el formulario.'
  } finally {
    saving.value = false
  }
}

/* ======= Imagen (front uniquement pour l’instant) ======= */
const fileInput = ref(null)
function askImage () { fileInput.value?.click?.() }
function onImagePicked (e) {
  const file = e.target.files?.[0]
  if (!file || !currentKDA.value) return
  currentKDA.value.imagen = file
  currentKDA.value.imagenNombre = file.name
}

/* ======= Boot ======= */
onMounted(fetchFormsList)
</script>

<style scoped>
/* ===== Estilos modernos y consistentes ===== */
.madurez-page{
  --primary-color: #56005b;
  --primary-hover: #40004a;
  --secondary-bg: #f9fafb;
  --border-color: #e5e7eb;
  --text-primary: #1f2937;
  --text-secondary: #6b7280;
  --card-bg: #ffffff;

  display:grid;
  grid-template-columns: 360px 1fr;
  gap:20px;
  min-height: calc(100vh - var(--header-h) - var(--footer-h));
  padding: max(0px, var(--header-h)) 18px max(0px, var(--footer-h));
  box-sizing: border-box;
  font-family: 'Roboto', 'Segoe UI', system-ui, -apple-system, sans-serif;
  color: var(--text-primary);
  background: var(--secondary-bg);
}
.madurez-page.drawer-open{ padding-bottom: 0 !important; }
.madurez-page.drawer-open .left{ padding-bottom: calc(8px + var(--footer-h)); }

/* Hamburger + side menu */
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
  z-index: 60;
  transition: all .28s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.menu-btn:hover{
  background: var(--primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
.menu-btn img{ width: 22px; height: 22px; }
.menu-btn.inside{ left: calc(340px - 56px); }

.side-menu{
  --menu-w: 340px;
  position: fixed;
  left: calc(-1 * var(--menu-w));
  width: var(--menu-w);
  top: var(--header-h);
  bottom: var(--footer-h);
  background: var(--card-bg);
  box-shadow: 2px 0 12px rgba(0,0,0,.15);
  transition: left .28s ease;
  z-index: 55;
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
.rename-btn, .delete-btn{ 
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
.delete-btn{ 
  color: #c63b1e;
}
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

/* Colonne gauche */
.left{ 
  padding: 24px 16px; 
  background: var(--card-bg);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}
.left-title{ 
  font-size: 1.25rem; 
  font-weight: 600; 
  margin: 0 0 20px 0;
  color: var(--primary-color);
  padding-bottom: 12px;
  border-bottom: 2px solid var(--border-color);
}
.dominios{ list-style: none; margin:0; padding:0 6px; display: grid; gap:12px; }
.dom-pill{
  width: 100%; display: block; border: 1px solid var(--border-color); border-radius: 8px;
  background: #ffffff; padding: 12px 16px; text-align: left; cursor: pointer;
  transition: all .2s ease;
  font-weight: 500;
}
.dom-pill:hover{ 
  background: var(--secondary-bg); 
  border-color: var(--primary-color);
  transform: translateX(2px);
}
.dom-pill.active{ 
  background: var(--primary-color); 
  color: #ffffff;
  border-color: var(--primary-color);
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(86, 0, 91, 0.2);
}
.dom-pill .label{ font-size: .95rem; }

.left-actions{ display:flex; gap:10px; align-items:center; flex-wrap:wrap; margin: 14px 12px; }
.add-domain{
  flex: 1;
  padding: 10px 16px; 
  background: var(--primary-color); 
  color: #ffffff; 
  border: none;
  border-radius: 6px; 
  font-weight: 600; 
  cursor: pointer; 
  transition: all .2s ease;
}
.add-domain:hover{ 
  background: var(--primary-hover); 
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(86, 0, 91, 0.3);
}
.del-domain{
  flex: 1;
  padding: 10px 16px; 
  background: #ffffff; 
  color: #c63b1e; 
  border: 1px solid #c63b1e;
  border-radius: 6px; 
  font-weight: 600; 
  cursor: pointer; 
  transition: all .2s ease;
}
.del-domain:hover{ 
  background: #c63b1e; 
  color: #ffffff; 
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(198, 59, 30, 0.3);
}
.del-domain:disabled{ opacity:.5; cursor:not-allowed; background:#ffffff; color:#c63b1e; transform: none; }

/* Panneau droit / Drawer */
.right{ position: relative; min-height: 560px; overflow: hidden; }
.info-card{ 
  background: var(--card-bg); 
  border-radius: 12px; 
  padding: 24px; 
  max-width: 820px;
  border: 1px solid var(--border-color);
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}
.info-card h3{ 
  text-align: center; 
  margin: 0 0 16px; 
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--primary-color);
}
.info-group{ margin: 16px 0; }
.info-group label{ 
  font-weight: 600; 
  display:block; 
  margin-bottom: 8px;
  color: var(--text-primary);
}
.info-group textarea{ 
  width: 100%; 
  min-height: 80px; 
  resize: vertical; 
  border: 1px solid var(--border-color); 
  border-radius: 8px; 
  padding: 12px; 
  background: #ffffff; 
  font: inherit;
  transition: border-color .2s ease;
}
.info-group textarea:focus{
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(86, 0, 91, 0.1);
}

.drawer{
  position: fixed; top: var(--header-h); right: 0;
  height: calc(100vh - var(--header-h) - var(--footer-h));
  width: 0; max-width: 0; padding: 0; background: transparent;
  visibility: hidden; pointer-events: none; z-index: 50;
  transform: translateX(100%);
  transition: transform .28s ease, width .28s ease, max-width .28s ease, padding .18s ease, background .18s ease;
  overflow: auto;
  border-left: 1px solid var(--border-color);
}
.drawer.open{ 
  transform: translateX(0); 
  width: clamp(720px, 58vw, 980px); 
  max-width: 980px; 
  padding: 20px; 
  background: var(--card-bg); 
  visibility: visible; 
  pointer-events: auto;
  box-shadow: -4px 0 12px rgba(0,0,0,.15);
}
.close{
  position: sticky; top: 4px; margin-left: auto; display: grid; place-items: center;
  width: 32px; height: 32px; border-radius: 6px; border: none; 
  background: var(--primary-color); 
  color: #ffffff; 
  cursor: pointer;
  transition: all .2s ease;
}
.close:hover{
  background: var(--primary-hover);
  transform: scale(1.05);
}
.drawer-head h3{ 
  margin: 8px 0 16px; 
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--primary-color);
}

.kda-tabs{ display: flex; flex-wrap: wrap; gap: 8px; margin: 12px 0; }
.kda-pill{ 
  border: 1px solid var(--border-color); 
  background: #ffffff; 
  border-radius: 6px; 
  padding: 8px 14px; 
  font-weight: 500; 
  cursor: pointer;
  transition: all .2s ease;
}
.kda-pill:hover{
  border-color: var(--primary-color);
  background: var(--secondary-bg);
}
.kda-pill.active{ 
  background: var(--primary-color); 
  color: #ffffff;
  border-color: var(--primary-color);
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(86, 0, 91, 0.2);
}

.group{ margin: 16px 0; display: flex; flex-direction: column; gap: 8px; }
.group label{ 
  font-weight: 600;
  color: var(--text-primary);
}
.group input[type="text"], .group textarea{ 
  border: 1px solid var(--border-color); 
  border-radius: 8px; 
  background: #ffffff; 
  padding: 12px; 
  font: inherit;
  transition: border-color .2s ease;
}
.group input[type="text"]:focus, .group textarea:focus{
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(86, 0, 91, 0.1);
}
.sep{ border: none; height: 1px; background: var(--border-color); margin: 16px 0; }

.levels{ 
  background: var(--secondary-bg); 
  border-radius: 8px; 
  padding: 16px; 
  margin: 12px 0;
  border: 1px solid var(--border-color);
}
.levels-head, .levels .row{ display: grid; grid-template-columns: 120px 1fr; align-items: center; gap: 12px; }
.levels-head{ 
  font-weight: 600; 
  font-size: .95rem; 
  margin-bottom: 8px;
  color: var(--text-primary);
}
.answer-col input{ 
  width: 100%; 
  border: 1px solid var(--border-color); 
  border-radius: 6px; 
  background: #ffffff; 
  padding: 10px 12px; 
  font: inherit;
  transition: border-color .2s ease;
}
.answer-col input:focus{
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(86, 0, 91, 0.1);
}

.image-line{ display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-top: 8px; }
.img-btn{ 
  display: inline-flex; 
  align-items: center; 
  gap: 8px; 
  border: 1px solid var(--border-color); 
  border-radius: 6px; 
  padding: 10px 14px; 
  background: #ffffff; 
  cursor: pointer; 
  font-weight: 600;
  transition: all .2s ease;
}
.img-btn:hover{
  border-color: var(--primary-color);
  background: var(--secondary-bg);
}
.img-btn .cam{ font-size: 1.1rem; }
.hidden{ display: none; }
.img-name{ 
  font-size: .92rem; 
  color: var(--text-secondary);
  font-weight: 500;
}

.actions{ display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px; }
.ghost{ 
  background: #ffffff; 
  color: var(--text-primary); 
  border: 1px solid var(--border-color); 
  border-radius: 6px; 
  padding: 10px 20px; 
  font-weight: 600; 
  cursor: pointer;
  transition: all .2s ease;
}
.ghost:hover{
  background: var(--secondary-bg);
  border-color: var(--primary-color);
}
.danger{ 
  background: #ffffff; 
  color: #c63b1e; 
  border: 1px solid #c63b1e; 
  border-radius: 6px; 
  padding: 10px 20px; 
  font-weight: 600; 
  cursor: pointer; 
  transition: all .2s ease;
}
.danger:hover{ 
  background: #c63b1e; 
  color: #ffffff;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(198, 59, 30, 0.3);
}
.danger:disabled{ 
  opacity: .5; 
  cursor: not-allowed; 
  background: #ffffff;
  transform: none;
}
.primary{ 
  background: var(--primary-color); 
  color: #ffffff; 
  border: none; 
  border-radius: 6px; 
  padding: 10px 20px; 
  font-weight: 600; 
  cursor: pointer;
  transition: all .2s ease;
}
.primary:hover:not(:disabled){ 
  background: var(--primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(86, 0, 91, 0.3);
}
.primary:disabled{
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.toast{ 
  position: fixed; 
  right: 24px; 
  bottom: calc(24px + var(--footer-h)); 
  border-radius: 8px; 
  padding: 14px 20px; 
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

@media (max-width: 1120px){
  .madurez-page{ grid-template-columns: 320px 1fr; }
  .menu-btn.inside{ left: calc(320px - 56px); }
}
@media (max-width: 920px){
  .madurez-page{ grid-template-columns: 1fr; }
  .drawer.open{ width: 100%; max-width: 100%; }
}
</style>
