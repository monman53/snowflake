<script lang="ts"></script>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { app, fps } from './main'

// Shaders
import computeVS from './glsl/compute.vert?raw'
import computeFS0 from './glsl/compute0.frag?raw'
import computeFS1 from './glsl/compute1.frag?raw'
import computeFS2 from './glsl/compute2.frag?raw'
import computeFS3 from './glsl/compute3.frag?raw'
import computeFS4 from './glsl/compute4.frag?raw'
import computeFS5 from './glsl/compute5.frag?raw'
import drawVS from './glsl/draw.vert?raw'
import drawFS from './glsl/draw.frag?raw'
import { parameter } from './parameters'

const textureSize = computed(() => {
  return app.value.computeRadius * 2 + 1
})

//--------------------------------
// WebGL support functions
//--------------------------------
const createShader = (gl: WebGL2RenderingContext, type: GLenum, src: string) => {
  const shader = gl.createShader(type)
  if (!shader) {
    throw new Error()
  }
  gl.shaderSource(shader, src)
  gl.compileShader(shader)
  // if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
  //     throw new Error(gl.getShaderInfoLog(shader));
  // }
  return shader
}

function createProgram(gl: WebGL2RenderingContext, shaderSources: string[]) {
  const program = gl.createProgram()
  if (!program) {
    throw new Error()
  }
  ;[gl.VERTEX_SHADER, gl.FRAGMENT_SHADER].forEach((type, ndx) => {
    const shader = createShader(gl, type, shaderSources[ndx])
    if (!shader) {
      throw new Error()
    }
    gl.attachShader(program, shader)
  })
  gl.linkProgram(program)
  // if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
  //     throw new Error(gl.getProgramParameter(program));
  // }
  return program
}

// Canvases
// const computeCanvas = new OffscreenCanvas(app.value.computeWidth, app.value.computeHeight)
const canvas = ref()

onMounted(() => {
  const gl: WebGL2RenderingContext = canvas.value.getContext('webgl2')
  if (gl === null) {
    throw new Error()
  }
  // console.log(gl.getParameter(gl.MAX_VIEWPORT_DIMS))

  //--------------------------------
  // Create programs
  //--------------------------------

  const computeProgram0 = createProgram(gl, [computeVS, computeFS0])
  const computeProgLocs0 = {
    time: gl.getUniformLocation(computeProgram0, 'time'),
    rho: gl.getUniformLocation(computeProgram0, 'rho'),
    computeTex: gl.getUniformLocation(computeProgram0, 'computeTex'),
    computeRadius: gl.getUniformLocation(computeProgram0, 'computeRadius')
  }

  const computeProgram1 = createProgram(gl, [computeVS, computeFS1])
  const computeProgLocs1 = {
    time: gl.getUniformLocation(computeProgram1, 'time'),
    computeTex: gl.getUniformLocation(computeProgram1, 'computeTex'),
    computeRadius: gl.getUniformLocation(computeProgram1, 'computeRadius')
  }

  const computeProgram2 = createProgram(gl, [computeVS, computeFS2])
  const computeProgLocs2 = {
    time: gl.getUniformLocation(computeProgram2, 'time'),
    computeTex: gl.getUniformLocation(computeProgram2, 'computeTex'),
    computeRadius: gl.getUniformLocation(computeProgram2, 'computeRadius'),
    kappa: gl.getUniformLocation(computeProgram2, 'kappa')
  }

  const computeProgram3 = createProgram(gl, [computeVS, computeFS3])
  const computeProgLocs3 = {
    time: gl.getUniformLocation(computeProgram3, 'time'),
    computeTex: gl.getUniformLocation(computeProgram3, 'computeTex'),
    computeRadius: gl.getUniformLocation(computeProgram3, 'computeRadius'),
    beta: gl.getUniformLocation(computeProgram3, 'beta'),
    alpha: gl.getUniformLocation(computeProgram3, 'alpha'),
    theta: gl.getUniformLocation(computeProgram3, 'theta')
  }

  const computeProgram4 = createProgram(gl, [computeVS, computeFS4])
  const computeProgLocs4 = {
    time: gl.getUniformLocation(computeProgram4, 'time'),
    computeTex: gl.getUniformLocation(computeProgram4, 'computeTex'),
    computeRadius: gl.getUniformLocation(computeProgram4, 'computeRadius'),
    mu: gl.getUniformLocation(computeProgram4, 'mu'),
    gamma: gl.getUniformLocation(computeProgram4, 'gamma')
  }

  const computeProgram5 = createProgram(gl, [computeVS, computeFS5])
  const computeProgLocs5 = {
    time: gl.getUniformLocation(computeProgram5, 'time'),
    computeTex: gl.getUniformLocation(computeProgram5, 'computeTex'),
    computeRadius: gl.getUniformLocation(computeProgram5, 'computeRadius'),
    sigma: gl.getUniformLocation(computeProgram5, 'sigma')
  }

  const drawProgram = createProgram(gl, [drawVS, drawFS])
  const drawProgLocs = {
    canvasSize: gl.getUniformLocation(drawProgram, 'canvasSize'),
    computeRadius: gl.getUniformLocation(drawProgram, 'computeRadius'),
    computeTex: gl.getUniformLocation(drawProgram, 'computeTex'),
    rot: gl.getUniformLocation(drawProgram, 'rot'),
    lightAngle: gl.getUniformLocation(drawProgram, 'lightAngle'),
    lightIntensity: gl.getUniformLocation(drawProgram, 'lightIntensity'),
    hue: gl.getUniformLocation(drawProgram, 'hue'),
    saturation: gl.getUniformLocation(drawProgram, 'saturation'),
    lightness: gl.getUniformLocation(drawProgram, 'lightness'),
    shadow: gl.getUniformLocation(drawProgram, 'shadow'),
    lightHue1: gl.getUniformLocation(drawProgram, 'lightHue1'),
    lightHue2: gl.getUniformLocation(drawProgram, 'lightHue2'),
    lightSaturation: gl.getUniformLocation(drawProgram, 'lightSaturation'),
    lightLightness: gl.getUniformLocation(drawProgram, 'lightLightness')
  }

  //--------------------------------
  // Create buffers
  //--------------------------------

  // Dummy clip for texture computation
  const createDummyClipVA = (gl: WebGL2RenderingContext, program: WebGLProgram) => {
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), // Rectangle
      gl.STATIC_DRAW
    )
    const vao = gl.createVertexArray()
    gl.bindVertexArray(vao)

    // setup our attributes to tell WebGL how to pull
    // the data from the buffer above to the position attribute
    const positionLoc = gl.getAttribLocation(program, 'position')
    gl.enableVertexAttribArray(positionLoc)
    gl.vertexAttribPointer(
      positionLoc,
      2, // size (num components)
      gl.FLOAT, // type of data in buffer
      false, // normalize
      0, // stride (0 = auto)
      0 // offset
    )

    return vao
  }

  const computeVA0 = createDummyClipVA(gl, computeProgram0)
  const computeVA1 = createDummyClipVA(gl, computeProgram1)
  const computeVA2 = createDummyClipVA(gl, computeProgram2)
  const computeVA3 = createDummyClipVA(gl, computeProgram3)
  const computeVA4 = createDummyClipVA(gl, computeProgram4)
  const computeVA5 = createDummyClipVA(gl, computeProgram5)
  const drawVA = createDummyClipVA(gl, drawProgram)

  // Create textures
  const createTexture = (gl: WebGL2RenderingContext, param: GLint = gl.NEAREST) => {
    const tex = gl.createTexture()
    if (tex === null) {
      throw Error()
    }
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1) // see https://webglfundamentals.org/webgl/lessons/webgl-data-textures.html
    gl.getExtension('EXT_color_buffer_float')
    gl.texImage2D(
      gl.TEXTURE_2D,
      0, // mip level
      gl.RGBA32F, // internal format
      textureSize.value,
      textureSize.value,
      0, // border
      gl.RGBA, // format
      gl.FLOAT, // type
      null
    )
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    return tex
  }
  // const srcTex = createTexture(gl)
  // const srcTexLoc = gl.getUniformLocation(computeProgram, 'srcTex')
  const computeTex1 = createTexture(gl)
  const computeTex2 = createTexture(gl)
  const computeTex3 = createTexture(gl)
  const computeTex4 = createTexture(gl)
  const computeTex5 = createTexture(gl)

  // Setup destination texture
  // Create and bind the framebuffer
  const createFrameBuffer = (gl: WebGL2RenderingContext, texture: WebGLTexture) => {
    const fb = gl.createFramebuffer()
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb)
    // attach the texture as the first color attachment
    const attachmentPoint = gl.COLOR_ATTACHMENT0
    const level = 0
    gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, texture, level)
    gl.bindTexture(gl.TEXTURE_2D, null)
    return fb
  }
  const fb1 = createFrameBuffer(gl, computeTex1)
  const fb2 = createFrameBuffer(gl, computeTex2)
  const fb3 = createFrameBuffer(gl, computeTex3)
  const fb4 = createFrameBuffer(gl, computeTex4)
  const fb5 = createFrameBuffer(gl, computeTex5)

  //================================
  // Frame render function
  //================================
  let counter = 0
  let then = 0
  const render = (time: number) => {
    if (gl === null) {
      throw new Error()
    }

    //--------------------------------
    // Calculate FPS
    //--------------------------------
    counter += 1
    if (counter % 100 == 0) {
      time *= 0.001
      fps.value = 100 / (time - then)
      then = time
    }

    //--------------------------------
    // Computation
    //--------------------------------
    gl.viewport(0, 0, textureSize.value, textureSize.value)

    // Initialize field
    if (app.value.reset) {
      let fb = fb1
      gl.useProgram(computeProgram0)
      gl.bindVertexArray(computeVA0)
      gl.uniform1i(computeProgLocs0.computeTex, 0)
      gl.uniform1f(computeProgLocs0.rho, parameter.value.rho)
      gl.uniform1i(computeProgLocs0.computeRadius, app.value.computeRadius)
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb)
      gl.drawArrays(gl.TRIANGLES, 0, 6)

      app.value.iteration = 0
      app.value.reset = false
    }

    // Inner frame iteration
    const numItr = app.value.pause ? 0 : app.value.iterPerFrame
    for (let i = 0; i < numItr; i++) {
      if (app.value.useMaxIter && app.value.iteration >= app.value.maxIter) {
        app.value.pause = true
        break
      }

      //--------------------------------
      // (1)
      //--------------------------------
      let tex = computeTex1
      let fb = fb2
      gl.useProgram(computeProgram1)
      gl.bindVertexArray(computeVA1)
      gl.uniform1i(computeProgLocs1.computeTex, 0)
      gl.uniform1f(computeProgLocs1.time, time)
      gl.uniform1i(computeProgLocs1.computeRadius, app.value.computeRadius)
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb)
      gl.bindTexture(gl.TEXTURE_2D, tex)
      gl.drawArrays(gl.TRIANGLES, 0, 6)

      //--------------------------------
      // (2)
      //--------------------------------
      tex = computeTex2
      fb = fb3
      gl.useProgram(computeProgram2)
      gl.bindVertexArray(computeVA2)
      gl.uniform1i(computeProgLocs2.computeTex, 0)
      gl.uniform1f(computeProgLocs2.time, time)
      gl.uniform1i(computeProgLocs2.computeRadius, app.value.computeRadius)
      gl.uniform1f(computeProgLocs2.kappa, parameter.value.kappa)
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb)
      gl.bindTexture(gl.TEXTURE_2D, tex)
      gl.drawArrays(gl.TRIANGLES, 0, 6)

      //--------------------------------
      // (3)
      //--------------------------------
      tex = computeTex3
      fb = fb4
      gl.useProgram(computeProgram3)
      gl.bindVertexArray(computeVA3)
      gl.uniform1i(computeProgLocs3.computeTex, 0)
      gl.uniform1f(computeProgLocs3.time, time)
      gl.uniform1f(computeProgLocs3.beta, parameter.value.beta)
      gl.uniform1f(computeProgLocs3.alpha, parameter.value.alpha)
      gl.uniform1f(computeProgLocs3.theta, parameter.value.theta)
      gl.uniform1i(computeProgLocs3.computeRadius, app.value.computeRadius)
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb)
      gl.bindTexture(gl.TEXTURE_2D, tex)
      gl.drawArrays(gl.TRIANGLES, 0, 6)

      //--------------------------------
      // (4)
      //--------------------------------
      tex = computeTex4
      fb = fb5
      gl.useProgram(computeProgram4)
      gl.bindVertexArray(computeVA4)
      gl.uniform1i(computeProgLocs4.computeTex, 0)
      gl.uniform1f(computeProgLocs4.time, time)
      gl.uniform1f(computeProgLocs4.mu, parameter.value.mu)
      gl.uniform1f(computeProgLocs4.gamma, parameter.value.gamma)
      gl.uniform1i(computeProgLocs4.computeRadius, app.value.computeRadius)
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb)
      gl.bindTexture(gl.TEXTURE_2D, tex)
      gl.drawArrays(gl.TRIANGLES, 0, 6)

      //--------------------------------
      // (5)
      //--------------------------------
      tex = computeTex5
      fb = fb1
      gl.useProgram(computeProgram5)
      gl.bindVertexArray(computeVA5)
      gl.uniform1i(computeProgLocs5.computeTex, 0)
      gl.uniform1f(computeProgLocs5.time, time)
      gl.uniform1f(computeProgLocs5.sigma, parameter.value.sigma)
      gl.uniform1i(computeProgLocs5.computeRadius, app.value.computeRadius)
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb)
      gl.bindTexture(gl.TEXTURE_2D, tex)
      gl.drawArrays(gl.TRIANGLES, 0, 6)

      app.value.iteration += 1
    }

    //--------------------------------
    // Draw
    //--------------------------------
    // Clear canvas
    gl.useProgram(drawProgram)

    gl.uniform1i(drawProgLocs.computeTex, 0)
    gl.uniform2f(drawProgLocs.canvasSize, app.value.width, app.value.height)
    gl.uniform1i(drawProgLocs.computeRadius, app.value.computeRadius)
    gl.uniform1f(drawProgLocs.rot, parameter.value.rot)
    gl.uniform1f(drawProgLocs.lightAngle, parameter.value.lightAngle)
    gl.uniform1f(drawProgLocs.lightIntensity, parameter.value.lightIntensity)
    gl.uniform1f(drawProgLocs.hue, parameter.value.hue)
    gl.uniform1f(drawProgLocs.saturation, parameter.value.saturation)
    gl.uniform1f(drawProgLocs.lightness, parameter.value.lightness)
    gl.uniform1f(drawProgLocs.shadow, parameter.value.shadow)
    gl.uniform1f(drawProgLocs.lightHue1, parameter.value.lightHue1)
    gl.uniform1f(drawProgLocs.lightHue2, parameter.value.lightHue2)
    gl.uniform1f(drawProgLocs.lightSaturation, parameter.value.lightSaturation)
    gl.uniform1f(drawProgLocs.lightLightness, parameter.value.lightLightness)

    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.bindTexture(gl.TEXTURE_2D, computeTex1)
    gl.bindVertexArray(drawVA)
    gl.viewport(0, 0, app.value.width, app.value.height)

    gl.clearColor(0, 0, 0, 1)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.drawArrays(gl.TRIANGLES, 0, 6)

    // Next frame
    window.requestAnimationFrame(render)
  }

  window.requestAnimationFrame(render)
})
</script>

<template>
  <div id="base">
    <canvas ref="canvas" :width="app.width" :height="app.height"></canvas>
  </div>
</template>
