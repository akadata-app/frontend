<template>
  <div class="conocenos-page">
    <h1>Conócenos</h1>
    <div class="equipo-grid">
      <div
        v-for="(miembro, index) in equipo"
        :key="index"
        class="miembro-card"
      >
        <img
          :src="miembro.foto"
          :alt="miembro.nombre"
          class="miembro-foto"
          :class="miembro.borde"
        />
        <h3 class="miembro-nombre">{{ miembro.nombre }}</h3>
        <p class="miembro-rol">{{ miembro.rol }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import gina from '@/assets/img/gina.jpg';
import julian from '@/assets/img/julian.jpg';
import usermale from '@/assets/img/placeholder_user_female.png';

const equipo = [
  {
    nombre: 'Gina Paola Maestre Gongóra',
    rol: 'Profesora asociada de Ingeniería de sistemas de la Universidad de Antioquia.',
    foto: gina,
    borde: 'borde-purpura'
  },
  {
    nombre: 'Julian Vanegas López',
    rol: 'Estudiante de Ingeniería de sistemas de la Universidad de Antioquia.',
    foto: julian,
    borde: 'borde-verde'
  },
  {
    nombre: 'Katherine Rodríguez Mejía',
    rol: 'Estudiante de Ingeniería de sistemas de la Universidad de Antioquia.',
    foto: usermale,
    borde: 'borde-verde'
  },
];
</script>

<style scoped>
.conocenos-page {
  text-align: center;
  padding: 2rem;
}

.equipo-grid {
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
  margin-top: 2rem;
}

.miembro-card {
  width: 180px;
}

.miembro-foto {
  width: 150px;
  height: 150px;
  object-fit: cover;
  border-radius: 50%;
  border: 6px solid;
}

.borde-purpura {
  border-color: #4B014B;
}

.borde-verde {
  border-color: #3A7D23;
}

.miembro-nombre {
  margin-top: 0.5rem;
  font-weight: bold;
}

.miembro-rol {
  font-size: 0.85rem;
  color: #444;
}
</style>
