<script setup lang="ts">
import { ref } from 'vue'
import Wheel from './components/Wheel.vue'

const list = [
  { name: 'gift 1', color: 'red' },
  { name: 'gift 2', color: 'blue' },
  { name: 'gift 3', color: 'green' },
  { name: 'gift 4', color: 'orange' },
  { name: 'gift 5', color: 'pink' },
]

const wheelRef = ref<InstanceType<typeof Wheel>>()
const timeout = ref<number>(2000)
const settings = ref({
  pointerColor: undefined,
  randomOffsetAngle: undefined,
})

async function handleClick(type: 'normal' | 'mock') {
  const randomValue = Math.floor(Math.random() * list.length)

  let name: string = ''
  if (type === 'normal') {
    ({ name } = (await wheelRef.value?.spin(randomValue))!)
  }
  else if (type === 'mock') {
    ({ name } = (await wheelRef.value?.spin(() => mockRequest(randomValue)))!)
  }
  alert(`You won ${name}`)
}

async function mockRequest(value: number) {
  return new Promise<number>((resolve) => {
    setTimeout(() => {
      resolve(value)
    }, timeout.value)
  })
}
</script>

<template>
  <Wheel ref="wheelRef" :list="list" v-bind="settings" />
  <p style="display: grid;">
    <button @click="handleClick('normal')">
      Start
    </button>
    <button @click="handleClick('mock')">
      Async Start
    </button>
  </p>

  <p>
    <span style="font-size: 1.5rem;">Settings:</span>
  </p>
  <footer id="wheel_container_settings">
    <label>
      Timeout(ms):
    </label>
    <input v-model="timeout" type="number">
    <label>
      Pointer Color:
    </label>
    <input v-model="settings.pointerColor" type="color">
    <label>
      Random Offset Angle:
    </label>
    <input v-model="settings.randomOffsetAngle" type="number">
  </footer>
</template>

<style scoped>
button {
  margin-top: 1rem;
}

#wheel_container_settings {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}
#wheel_container_settings > label {
  justify-self: end;
}
</style>
