import './assets/main.css'

import { createApp, ref } from 'vue'
import App from './App.vue'
import { resetParameter } from './utils'

export const app = ref({
  width: window.innerWidth,
  height: window.innerHeight,
  computeSize: 1 << 10,
  reset: true,
  iteration: 0,
  fps: 0
})

export const fps = ref(0)

export const parameter = ref({
  lightAngle: 0,
  lightIntensity: 1.0,
  rot: 0,
  rho: 1.0,
  beta: 2.2,
  alpha: 1.0,
  theta: 1.0,
  kappa: 0.05,
  mu: 1.0,
  gamma: 1.0,
  sigma: 1.0,
  hue: 0,
  saturation: 0,
  lightness: 0
})

export const parameterProps = ref([
  {
    name: 'Parameters',
    visible: true,
    props: [
      {
        name: 'rot',
        default: 1 / 12,
        min: 0,
        max: 1,
        step: 0.0001
      },
      {
        name: 'rho',
        default: 0.46,
        min: 0,
        max: 1,
        step: 0.001
      },
      {
        name: 'beta',
        default: 1.3,
        min: 1.0,
        max: 4.0,
        step: 0.001
      },
      {
        name: 'alpha',
        default: 0.08,
        min: 0,
        max: 0.5,
        step: 0.0001
      },
      {
        name: 'theta',
        default: 0.025,
        min: 0,
        max: 0.2,
        step: 0.001
      },
      {
        name: 'kappa',
        default: 0.003,
        min: 0,
        max: 0.2,
        step: 0.0001
      },
      {
        name: 'mu',
        default: 0.07,
        min: 0,
        max: 0.2,
        step: 0.0001
      },
      {
        name: 'gamma',
        default: 0.00005,
        min: 0,
        max: 1,
        step: 0.001
      },
      {
        name: 'sigma',
        default: 0,
        min: 0,
        max: 0.0001,
        step: 0.000001
      }
    ]
  },
  {
    name: 'Color',
    visible: false,
    props: [
      {
        name: 'hue',
        default: 0.6,
        min: 0,
        max: 1,
        step: 0.0001
      },
      {
        name: 'saturation',
        default: 0.7,
        min: 0,
        max: 1,
        step: 0.0001
      },
      {
        name: 'lightness',
        default: 0.7,
        min: 0,
        max: 1,
        step: 0.0001
      },
      {
        name: 'lightAngle',
        default: 0,
        min: 0,
        max: 1,
        step: 0.0001
      },
      {
        name: 'lightIntensity',
        default: 1,
        min: 0,
        max: 10,
        step: 0.0001
      }
    ]
  }
])

resetParameter()

const resize = () => {
  app.value.width = window.innerWidth
  app.value.height = window.innerHeight
}
resize()
window.addEventListener('resize', resize)

createApp(App).mount('#app')
