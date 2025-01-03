<script setup lang="ts">
import { ref } from 'vue'
import Wheel from './components/Wheel.vue'

const list = [
  { name: 'gift 1', color: 'red' },
  { name: 'gift 2', color: 'blue' },
  { name: 'gift 3', color: 'green' },
]

const wheelRef = ref<InstanceType<typeof Wheel>>()

async function handleClick() {
  const { name } = (await wheelRef.value?.spin(1))!
  alert(`You won ${name}`)
}
</script>

<template>
  <Wheel ref="wheelRef" :list="list" />
  <button @click="handleClick">
    Start
  </button>
</template>

<style scoped>
button {
  margin-top: 1rem;
}
</style>
