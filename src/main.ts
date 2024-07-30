import './assets/main.css'

import { createApp, ref } from 'vue'
import App from './App.vue'
import { resetParameter } from './utils'

export const app = ref({
  width: window.innerWidth,
  height: window.innerHeight,
  computeWidth: 1024,
  computeHeight: 1024,
  fps: 0
})

export const fps = ref(0)

export const parameter = ref({
  beta: 0.1,
  hue: 0
})

export const parameterProps = ref([
  {
    name: 'Parameters',
    visible: false,
    props: [
      {
        name: 'beta',
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
