<script setup lang="ts">
import { computed, ref } from 'vue'

export interface Draw {
  /**
   * 名称.
   */
  name: string
  /**
   * 区域颜色. 默认为红色(索引下标为单数)或者主题色(索引下标为复数).
   */
  color?: string
}

const props = withDefaults(
  defineProps<{
    /**
     * 列表数据
     */
    list: Draw[]
    /**
     * 主题色. 默认随机颜色.
     */
    themeColor?: string
    /**
     * 指针颜色. 默认黑色.
     */
    pointerColor?: string
    /**
     * 轮盘转动的持续时间(单位:秒). 默认2秒
     */
    duration?: number
    /**
     * 轮盘转动的速度(单位:圈/秒). 默认1圈/秒
     */
    rate?: number
    /**
     * 轮盘转动的随机偏移角度范围. 取值范围: >= 0.1; <= 0.9. 默认0.2-0.8
     */
    randomOffsetAngle?: number[]
  }>(),
  {
    duration: 2,
    rate: 1,
    randomOffsetAngle: () => [0.2, 0.8],
  },
)

const emits = defineEmits<{
  (e: 'stop'): void
  (e: 'ok', value: Draw): void
  (e: 'error', err: unknown): void
}>()

const gRef = ref<SVGAElement>()
const isSpinning = ref(false)
const currentAngle = ref(0)
const lastRandomOffsetAngle = ref(0)
const currentIndex = ref(0)

const theme = computed(() => {
  const getRandomColor = () =>
    `rgb(${[...Array.from({ length: 3 })]
      .map(() => Math.floor(Math.random() * 256))
      .join(',')})`
  return props.themeColor || getRandomColor()
})
const pointer = computed(() => props.pointerColor || 'black')

/**
 * 每个扇形的角度
 */
const segmentAngle = computed(() => 360 / (props.list ?? []).length)

const wheelSegments = computed(() => {
  const segmentAngle = 360 / (props.list.length ?? 0)
  return props.list.map((item, index) => {
    const startAngle = index * segmentAngle
    const endAngle = (index + 1) * segmentAngle
    const midAngle = (startAngle + endAngle) / 2

    const radius = 35

    const textX = 50 + Math.cos(((midAngle - 90) * Math.PI) / 180) * radius
    const textY = 50 + Math.sin(((midAngle - 90) * Math.PI) / 180) * radius

    return {
      name: item.name,
      color: item.color || (index % 2 === 0 ? theme.value : 'red'),
      path: describeArc(50, 50, 45, startAngle, endAngle),
      textX,
      textY,
      textRotation: `rotate(${midAngle}, ${textX}, ${textY})`,
    }
  })
})

async function spin(
  indexOrPromise: number | Promise<number> | (() => Promise<number>),
) {
  if (isSpinning.value) {
    return
  }

  const isFunOrPromise
    = typeof indexOrPromise === 'function' || indexOrPromise instanceof Promise
  if (!isFunOrPromise && !isValidIndex(indexOrPromise as number)) {
    throw new TypeError(
      `参数需要是整数或者Promise, 但是得到: ${indexOrPromise}`,
    )
  }

  const getterAsync = isFunOrPromise ? indexOrPromise : Promise.resolve(indexOrPromise)
  isSpinning.value = true

  let index = isFunOrPromise ? 0 : indexOrPromise
  const baseDuration = props.rate * 1000
  // 假定启动动画结束前的最后一帧, 旋转的平均速度是匀速时的 1 倍
  const waitingCount = Math.ceil(Math.max(props.duration - baseDuration * 2, 1))
  const easing = {
    start: 'ease-in',
    waiting: 'linear',
    end: 'ease-out',
  }

  const waiting = waitingAnimation()
  const customProcess = (getterAsync instanceof Promise
    ? getterAsync
    : getterAsync())

  waiting.start()

  let err: unknown
  try {
    index = await customProcess
  }
  catch (e) {
    err = e
  }

  if (!err && !isValidIndex(index)) {
    err = new TypeError(`无效下标: ${index}`)
  }

  if (err) {
    waiting.cancel()
    handleError(err)
    throw err
  }

  function waitingAnimation() {
    let counter = 0
    const iterations = isFunOrPromise ? Number.MAX_SAFE_INTEGER : waitingCount
    let a: Animation
    async function start() {
      if (counter > iterations) {
        return
      }
      a = animate(currentAngle.value + (counter === 0 ? 0 : 360), {
        duration: baseDuration,
        easing: easing[counter === 0 ? 'start' : 'waiting'],
      })!
      await a.finished
      counter++
      start()
    }

    async function stop() {
      counter = iterations
      await a.finished
    }

    function cancel() {
      a?.cancel()
    }

    return { start, stop, cancel }
  };

  const [angle, randomOffsetAngle] = computeRotationAngle(index)

  await waiting.stop()

  const animation = animate(angle + 360, {
    duration: baseDuration * 2,
    easing: easing.end,
  })!

  await animation.finished

  isSpinning.value = false
  currentIndex.value = index
  lastRandomOffsetAngle.value = randomOffsetAngle
  currentAngle.value = angle % 360

  emits('stop')
  emits('ok', props.list[index])
  return props.list[index]
}

function handleError(err: unknown) {
  isSpinning.value = false
  emits('stop')
  emits('error', err)
}

function animate(angle: number, options: KeyframeAnimationOptions) {
  return gRef.value?.animate(
    [
      { transform: `rotate(${currentAngle.value}deg)` },
      { transform: `rotate(${360 + angle}deg)` },
    ],
    {
      fill: 'forwards',
      ...options,
    },
  )
}

function isValidIndex(index: number) {
  return Number.isInteger(index) && index < props.list.length
}

function computeRotationAngle(index: number) {
  // 目标扇形的旋转角度(边缘位置)
  const targetAngle = segmentAngle.value * (index - (currentIndex.value ?? 0))

  // 目标扇形的随机偏移旋转角度
  let [min, max] = props.randomOffsetAngle
  min = Math.min(min, max, 0.01)
  max = Math.max(min, max, 0.99)
  const randomOffsetAngle
    = segmentAngle.value * min + segmentAngle.value * (max - min) * Math.random()

  const rotation = {
    /**
     * 无随机偏移的初始旋转值(当前旋转值 + 上一次随机偏移的旋转值)，用于校准本次的随机偏移值而不是继承上次的偏移值
     */
    start: currentAngle.value + lastRandomOffsetAngle.value,
    /**
     * 有随机偏移的结束旋转值(到目标位置的旋转值 + 本次随机偏移的旋转值)
     */
    end: targetAngle + randomOffsetAngle,
  }

  const angle = rotation.start - rotation.end

  return [angle, randomOffsetAngle]
}

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  }
}

function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(x, y, radius, endAngle)
  const end = polarToCartesian(x, y, radius, startAngle)
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1'
  return [
    'M',
    start.x,
    start.y,
    'A',
    radius,
    radius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
    'L',
    x,
    y,
    'Z',
  ].join(' ')
}

defineExpose({
  spin,
})
</script>

<template>
  <div class="wheel-container">
    <svg class="wheel" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="50" fill="#f2f2f2" />
      <circle cx="50" cy="50" r="45" fill="#fff" />
      <g ref="gRef" data-wheel-rotation>
        <g v-for="(segment, index) in wheelSegments" :key="index">
          <path :d="segment.path" :fill="segment.color" />
          <text
            :x="segment.textX" :y="segment.textY" fill="#fff" font-size="4" text-anchor="middle"
            :transform="segment.textRotation"
          >
            {{ segment.name }}
          </text>
        </g>
      </g>
      <path d="M 48,50 L 50,40 L 52,50 Z" :fill="pointer" transform="rotate(0, 50, 50)" />
      <circle cx="50" cy="50" r="2" :fill="pointer" />
    </svg>
  </div>
</template>

<style scoped>
.wheel-container {
  position: relative;
  width: 300px;
  height: 300px;
}

.wheel {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 0 10px rgba(0, 0, 0, 0.3));
}

.wheel [data-wheel-rotation] {
  transform-origin: 50% 50%;
}
</style>
