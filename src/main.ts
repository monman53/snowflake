import './assets/main.css'

import { createApp, ref } from 'vue'
import App from './App.vue'
import { resetParameter } from './utils'

export const app = ref({
  width: window.innerWidth,
  height: window.innerHeight,
  computeWidth: 1024,
  computeHeight: 1024,
  reset: true,
  fps: 0
})

export const fps = ref(0)

export const parameter = ref({
  rho: 1.0,
  beta: 0.1,
  alpha: 1.0,
  theta: 1.0,
  kappa: 0.05,
  mu: 1.0,
  gamma: 1.0,
  sigma: 1.0,
  hue: 0
})

export const parameterProps = ref([
  {
    name: 'Parameters',
    visible: false,
    props: [
      {
        name: 'rho',
        default: 0.1,
        min: 0,
        max: 1,
        step: 0.001
      },
      {
        name: 'beta',
        default: 0.1,
        min: 0,
        max: 1,
        step: 0.001
      },
      {
        name: 'alpha',
        default: 0.1,
        min: 0,
        max: 1,
        step: 0.001
      },
      {
        name: 'theta',
        default: 0.1,
        min: 0,
        max: 1,
        step: 0.001
      },
      {
        name: 'kappa',
        default: 0.05,
        min: 0,
        max: 1,
        step: 0.001
      },
      {
        name: 'mu',
        default: 0.1,
        min: 0,
        max: 1,
        step: 0.001
      },
      {
        name: 'gamma',
        default: 0.1,
        min: 0,
        max: 1,
        step: 0.001
      },
      {
        name: 'sigma',
        default: 0.1,
        min: 0,
        max: 1,
        step: 0.001
      }
    ]
  },
  {
    name: 'Background',
    visible: false,
    props: [
      {
        name: 'hue',
        default: 0.1,
        min: 0,
        max: 1,
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
