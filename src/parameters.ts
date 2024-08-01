import { ref } from 'vue'

export const parameter = ref({
  // Shape parameter
  rho: 1.0,
  beta: 2.2,
  alpha: 1.0,
  theta: 1.0,
  kappa: 0.05,
  mu: 1.0,
  gamma: 1.0,
  sigma: 1.0,
  // Display parameter
  lightAngle: 0,
  lightIntensity: 1.0,
  rot: 0,
  hue: 0,
  saturation: 0,
  lightness: 0,
  shadow: 1.0,
  lightHue1: 0.0,
  lightHue2: 0.0,
  lightSaturation: 0.8,
  lightLightness: 0.5
})

export const parameterProps = ref([
  {
    name: 'Display',
    visible: true,
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
        default: 0.8,
        min: 0,
        max: 1,
        step: 0.0001
      },
      {
        name: 'lightness',
        default: 0.75,
        min: 0,
        max: 1,
        step: 0.0001
      },
      {
        name: 'rot',
        default: 1 / 12,
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
        default: 4.0,
        min: 0,
        max: 10,
        step: 0.0001
      },
      {
        name: 'shadow',
        default: 1.0,
        min: 0,
        max: 2,
        step: 0.0001
      },
      {
        name: 'lightHue1',
        default: 0.17,
        min: 0,
        max: 1,
        step: 0.0001
      },
      {
        name: 'lightHue2',
        default: 0.72,
        min: 0,
        max: 1,
        step: 0.0001
      },
      {
        name: 'lightSaturation',
        default: 0.8,
        min: 0,
        max: 1,
        step: 0.0001
      },
      {
        name: 'lightLightness',
        default: 0.5,
        min: 0,
        max: 1,
        step: 0.0001
      }
    ]
  },
  {
    name: 'Parameters',
    visible: false,
    props: [
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
  }
])
