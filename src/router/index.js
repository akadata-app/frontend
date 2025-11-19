// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

// Pages générales
import HomeView from '../views/HomeView.vue'
import UserRegister from '../views/UserRegister.vue'
import OpenRessources from '../views/ResourceGrid.vue'
import Conocenos from '../views/Conocenos.vue'
import Inicio from '../views/Inicio.vue'
import UserProfile from '../views/UserProfile.vue'

// Herramientas de Evaluación (layouts)
import HerramientasEvaluacion from '@/views/HerramientasEvaluacionLayouts/HerramientasEvaluacion.vue'
import MaturityModelView from '@/views/HerramientasEvaluacionLayouts/MaturityModelView.vue'
import ObjetivosView from '@/views/HerramientasEvaluacionLayouts/ObjetivosBarrerasView.vue'
import TaxonomyView from '@/views/HerramientasEvaluacionLayouts/TaxonomyView.vue'

// Taxonomía (Administrator & User)
import TaxonomiaFormulario from '@/views/Taxonomia/Administrator/Formulario.vue'
import TaxonomyFormList from '@/views/Taxonomia/User/TaxonomyFormList.vue'
import TaxonomyForm from '@/views/Taxonomia/User/TaxonomyForm.vue'
import Formulario from '@/views/Taxonomia/Administrator/Formulario.vue' // alias conservé

// >>> Nouveau : Modèle de Madurez (Administrator)
import FormularioMadurez from '@/views/ModeloDeMadurez/Administrator/FormularioMadurez.vue'
import ModeloDeMadurezFormList from '@/views/ModeloDeMadurez/User/ModeloDeMadurezFormList.vue'
import ModeloDeMadurezFormDomain from '@/views/ModeloDeMadurez/User/ModeloDeMadurezFormDomain.vue'
import ModeloDeMadurezDashboard from '@/views/ModeloDeMadurez/User/ModeloDeMadurezDashboard.vue'
import OrganizationManagement from '@/views/OrganizationManagement.vue'

const routes = [
  // Accueil
  { path: '/', name: 'home', component: HomeView },

  // Auth / Profil
  { path: '/register', name: 'UserRegister', component: UserRegister },
  { path: '/profile', name: 'UserProfile', component: UserProfile },

  // Contenu public
  { path: '/open-ressources', name: 'OpenRessources', component: OpenRessources },
  { path: '/conocenos', name: 'Conocenos', component: Conocenos },
  { path: '/inicio', name: 'Inicio', component: Inicio },

  // Herramientas de Evaluación
  { path: '/herramientas-evaluacion', name: 'HerramientasEvaluacion', component: HerramientasEvaluacion },
  { path: '/herramientas-evaluacion/maturity-model', name: 'MaturityModel', component: MaturityModelView },
  { path: '/herramientas-evaluacion/objetivos', name: 'Objetivos', component: ObjetivosView },
  { path: '/herramientas-evaluacion/taxonomy', name: 'Taxonomy', component: TaxonomyView },

  // Taxonomía - côté utilisateur
  { path: '/herramientas-evaluacion/taxonomy/forms', name: 'FormsList', component: TaxonomyFormList },
  { path: '/herramientas-evaluacion/taxonomy/forms/:id', name: 'FormPage', component: TaxonomyForm, props: true },
  { path: '/herramientas-evaluacion/taxonomy/forms/:formId/reporte', name: 'TaxonomyDashboard', component: () => import('@/views/Taxonomia/User/TaxonomyDashboard.vue') },

  // Taxonomía - administration (routes existantes conservées)
  { path: '/Taxonomia/Administrator', name: 'TaxonomiaFormulario', component: TaxonomiaFormulario },
  { path: '/formulario', name: 'Formulario', component: Formulario },

  // >>> Modèle de Madurez - administration (NOUVELLE ROUTE)
  // URL propre en minuscules avec tirets ; ajuste-la si tu préfères un autre slug.
  {
    path: '/modelo-de-madurez/administrator',
    name: 'FormularioMadurezAdmin',
    component: FormularioMadurez
  },
  {
    path: '/modelo-de-madurez/forms',
    name: 'ModeloDeMadurezFormList',
    component: ModeloDeMadurezFormList
  },
  {
    path: '/modelo-de-madurez/forms/:formId/domain/:domainId',
    name: 'ModeloDeMadurezFormDomain',
    component: ModeloDeMadurezFormDomain
  },
  {
    path: '/modelo-de-madurez/forms/:formId/reporte',
     name: 'ModeloDeMadurezDashboard',
     component: ModeloDeMadurezDashboard
  },
  {
    path: '/formulario-madurez',
    name: 'FormularioMadurez',
    component: () => import('@/views/ModeloDeMadurez/Administrator/FormularioMadurez.vue')
  },
  {
    path: '/admin',
    name: 'AdminCenter',
    component: OrganizationManagement
  }
]

const router = createRouter({
  history: createWebHistory('/'),
  scrollBehavior () {
    return { top: 0 }
  },
  routes
})

// Guard de navegación para rutas protegidas
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('jwtToken')
  
  // Rutas que requieren autenticación
  const protectedRoutes = [
    'FormsList',
    'FormPage',
    'TaxonomyDashboard',
    'TaxonomiaFormulario',
    'Formulario',
    'FormularioMadurezAdmin',
    'ModeloDeMadurezFormList',
    'ModeloDeMadurezFormDomain',
    'ModeloDeMadurezDashboard',
    'FormularioMadurez',
    'UserProfile',
    'AdminCenter'
  ]
  
  // Verificar si la ruta requiere autenticación
  if (protectedRoutes.includes(to.name) && !token) {
    // Redirigir al home o página de login
    next({ name: 'home' })
  } else {
    next()
  }
})

export default router
