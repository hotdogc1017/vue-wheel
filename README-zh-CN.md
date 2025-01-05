# Vue Wheel

一个可自定义的 Vue (>= 2.7.x) 转盘组件。

[English](./README.md)

## 安装

```bash
npm install vue-wheel
```

## 使用方法

```vue
<script setup lang="ts">
import { Wheel } from 'vue-wheel'
import { ref } from 'vue'

const list = [
    { name: '项目 1' },
    { name: '项目 2' },
    { name: '项目 3' },
    { name: '项目 4' },
]

const wheelRef = ref()

const spin = async () => {
    try {
        const result = await wheelRef.value.spin(Math.floor(Math.random() * list.length))
        console.log('选中:', result)
    } catch (error) {
        console.error(error)
    }
}
</script>

<template>
    <Wheel
        ref="wheelRef"
        :list="list"
        @stop="() => console.log('停止旋转')"
        @ok="(item) => console.log('选中项目:', item)"
        @error="(err) => console.error('错误:', err)"
    />
    <button @click="spin">旋转</button>
</template>
```

## 属性

| 名称 | 类型 | 默认值 | 描述 |
|------|------|---------|-------------|
| list | `Draw[]` | 必填 | 转盘上显示的项目数组 |
| themeColor | `string` | 随机 | 偶数索引段的主题颜色 |
| pointerColor | `string` | 'black' | 指针颜色 |
| duration | `number` | 2 | 旋转动画持续时间（秒） |
| rate | `number` | 1 | 旋转速度（每秒圈数） |
| randomOffsetAngle | `number[]` | [0.2, 0.8] | 随机偏移角度范围 |

## 事件

- `stop`: 停止旋转时触发
- `ok`: 成功完成旋转并选中项目时触发
- `error`: 旋转失败时触发错误

## 类型定义

```typescript
interface Draw {
    name: string
    color?: string
}
```

## 许可证

MIT