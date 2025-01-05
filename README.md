# Vue Wheel

A customizable wheel spinning component for Vue (>= 2.7.x).

[中文文档](./README-ZH-CN.md)

## Installation

```bash
npm install wheel-spin-vue
```

## Usage

```vue
<script setup lang="ts">
import { Wheel } from 'wheel-spin-vue'
import { ref } from 'vue'

const list = [
    { name: 'Item 1' },
    { name: 'Item 2' },
    { name: 'Item 3' },
    { name: 'Item 4' },
]

const wheelRef = ref()

const spin = async () => {
    try {
        const result = await wheelRef.value.spin(Math.floor(Math.random() * list.length))
        console.log('Selected:', result)
    } catch (error) {
        console.error(error)
    }
}
</script>

<template>
    <Wheel
        ref="wheelRef"
        :list="list"
        @stop="() => console.log('Spinning stopped')"
        @ok="(item) => console.log('Selected item:', item)"
        @error="(err) => console.error('Error:', err)"
    />
    <button @click="spin">Spin</button>
</template>
```

## Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| list | `Draw[]` | Required | Array of items to display on the wheel |
| themeColor | `string` | Random | Theme color for even-indexed segments |
| pointerColor | `string` | 'black' | Color of the pointer |
| duration | `number` | 2 | Duration of spin animation (seconds) |
| rate | `number` | 1 | Rotation speed (rounds per second) |
| randomOffsetAngle | `number[]` | [0.2, 0.8] | Range for random offset angle |

## Events

- `stop`: Emitted when spinning stops
- `ok`: Emitted with selected item when spinning completes successfully
- `error`: Emitted with error when spinning fails

## Types

```typescript
interface Draw {
    name: string
    color?: string
}
```

## License

MIT