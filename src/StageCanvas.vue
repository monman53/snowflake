<script lang="ts"></script>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { app, fps, parameter } from './main'

// Shaders
import computeVS from './glsl/compute.vert?raw'
import computeFS1 from './glsl/compute1.frag?raw'
import computeFS2 from './glsl/compute2.frag?raw'
import computeFS3 from './glsl/compute3.frag?raw'
import computeFS4 from './glsl/compute4.frag?raw'
import computeFS5 from './glsl/compute5.frag?raw'
import drawVS from './glsl/draw.vert?raw'
import drawFS from './glsl/draw.frag?raw'

//--------------------------------
// WebGL support functions
//--------------------------------
const dim = 4

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

  const computeProgram1 = createProgram(gl, [computeVS, computeFS1])
  const computeProgLocs1 = {
    time: gl.getUniformLocation(computeProgram1, 'time'),
    reset: gl.getUniformLocation(computeProgram1, 'reset'),
    rho: gl.getUniformLocation(computeProgram1, 'rho'),
    computeTex: gl.getUniformLocation(computeProgram1, 'computeTex'),
    computeSize: gl.getUniformLocation(computeProgram1, 'computeSize')
  }

  const computeProgram2 = createProgram(gl, [computeVS, computeFS2])
  const computeProgLocs2 = {
    time: gl.getUniformLocation(computeProgram2, 'time'),
    computeTex: gl.getUniformLocation(computeProgram2, 'computeTex'),
    computeSize: gl.getUniformLocation(computeProgram2, 'computeSize'),
    kappa: gl.getUniformLocation(computeProgram2, 'kappa')
  }

  const computeProgram3 = createProgram(gl, [computeVS, computeFS3])
  const computeProgLocs3 = {
    time: gl.getUniformLocation(computeProgram3, 'time'),
    computeTex: gl.getUniformLocation(computeProgram3, 'computeTex'),
    computeSize: gl.getUniformLocation(computeProgram3, 'computeSize'),
    beta: gl.getUniformLocation(computeProgram3, 'beta'),
    alpha: gl.getUniformLocation(computeProgram3, 'alpha'),
    theta: gl.getUniformLocation(computeProgram3, 'theta')
  }

  const computeProgram4 = createProgram(gl, [computeVS, computeFS4])
  const computeProgLocs4 = {
    time: gl.getUniformLocation(computeProgram4, 'time'),
    computeTex: gl.getUniformLocation(computeProgram4, 'computeTex'),
    computeSize: gl.getUniformLocation(computeProgram4, 'computeSize'),
    mu: gl.getUniformLocation(computeProgram4, 'mu'),
    gamma: gl.getUniformLocation(computeProgram4, 'gamma')
  }

  const computeProgram5 = createProgram(gl, [computeVS, computeFS5])
  const computeProgLocs5 = {
    time: gl.getUniformLocation(computeProgram5, 'time'),
    computeTex: gl.getUniformLocation(computeProgram5, 'computeTex'),
    computeSize: gl.getUniformLocation(computeProgram5, 'computeSize'),
    sigma: gl.getUniformLocation(computeProgram5, 'sigma')
  }

  const drawProgram = createProgram(gl, [drawVS, drawFS])
  const drawProgLocs = {
    canvasSize: gl.getUniformLocation(drawProgram, 'canvasSize'),
    computeSize: gl.getUniformLocation(drawProgram, 'computeSize'),
    computeTex: gl.getUniformLocation(drawProgram, 'computeTex'),
    rot: gl.getUniformLocation(drawProgram, 'rot'),
    lightAngle: gl.getUniformLocation(drawProgram, 'lightAngle'),
    lightIntensity: gl.getUniformLocation(drawProgram, 'lightIntensity'),
    hue: gl.getUniformLocation(drawProgram, 'hue'),
    saturation: gl.getUniformLocation(drawProgram, 'saturation'),
    lightness: gl.getUniformLocation(drawProgram, 'lightness')
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

  const computeVA1 = createDummyClipVA(gl, computeProgram1)
  const computeVA2 = createDummyClipVA(gl, computeProgram2)
  const computeVA3 = createDummyClipVA(gl, computeProgram3)
  const computeVA4 = createDummyClipVA(gl, computeProgram4)
  const computeVA5 = createDummyClipVA(gl, computeProgram5)
  const drawVA = createDummyClipVA(gl, drawProgram)

  // Create textures
  const createTexture = (gl: WebGL2RenderingContext) => {
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
      app.value.computeSize,
      app.value.computeSize,
      0, // border
      gl.RGBA, // format
      gl.FLOAT, // type
      null
    )
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
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
    const numItr = 32
    for (let i = 0; i < numItr; i++) {
      //--------------------------------
      // (1)
      //--------------------------------
      let tex = computeTex1
      let fb = fb2
      gl.useProgram(computeProgram1)
      gl.bindVertexArray(computeVA1)
      gl.uniform1i(computeProgLocs1.computeTex, 0)
      gl.viewport(0, 0, app.value.computeSize, app.value.computeSize)
      gl.uniform1f(computeProgLocs1.time, time)
      gl.uniform1i(computeProgLocs1.computeSize, app.value.computeSize)
      gl.uniform1i(computeProgLocs1.reset, app.value.reset ? 1 : 0)
      gl.uniform1f(computeProgLocs1.rho, parameter.value.rho)
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb)
      gl.bindTexture(gl.TEXTURE_2D, tex)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
      if (app.value.reset) {
        app.value.iteration = 0
        app.value.reset = false
      }

      //--------------------------------
      // (2)
      //--------------------------------
      tex = computeTex2
      fb = fb3
      gl.useProgram(computeProgram2)
      gl.bindVertexArray(computeVA2)
      gl.uniform1i(computeProgLocs2.computeTex, 0)
      gl.viewport(0, 0, app.value.computeSize, app.value.computeSize)
      gl.uniform1f(computeProgLocs2.time, time)
      gl.uniform1i(computeProgLocs2.computeSize, app.value.computeSize)
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
      gl.viewport(0, 0, app.value.computeSize, app.value.computeSize)
      gl.uniform1f(computeProgLocs3.time, time)
      gl.uniform1f(computeProgLocs3.beta, parameter.value.beta)
      gl.uniform1f(computeProgLocs3.alpha, parameter.value.alpha)
      gl.uniform1f(computeProgLocs3.theta, parameter.value.theta)
      gl.uniform1i(computeProgLocs3.computeSize, app.value.computeSize)
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
      gl.viewport(0, 0, app.value.computeSize, app.value.computeSize)
      gl.uniform1f(computeProgLocs4.time, time)
      gl.uniform1f(computeProgLocs4.mu, parameter.value.mu)
      gl.uniform1f(computeProgLocs4.gamma, parameter.value.gamma)
      gl.uniform1i(computeProgLocs4.computeSize, app.value.computeSize)
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
      gl.viewport(0, 0, app.value.computeSize, app.value.computeSize)
      gl.uniform1f(computeProgLocs5.time, time)
      gl.uniform1i(computeProgLocs5.computeSize, app.value.computeSize)
      gl.uniform1f(computeProgLocs5.sigma, parameter.value.sigma)
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb)
      gl.bindTexture(gl.TEXTURE_2D, tex)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
    }
    app.value.iteration += numItr

    //--------------------------------
    // Draw
    //--------------------------------
    // Clear canvas
    gl.useProgram(drawProgram)
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.clearColor(0, 0, 0, 1)
    gl.clear(gl.COLOR_BUFFER_BIT)

    gl.bindTexture(gl.TEXTURE_2D, computeTex1)
    gl.uniform1i(drawProgLocs.computeTex, 0)
    gl.uniform1f(drawProgLocs.rot, parameter.value.rot)
    gl.uniform1f(drawProgLocs.lightAngle, parameter.value.lightAngle)
    gl.uniform1f(drawProgLocs.lightIntensity, parameter.value.lightIntensity)
    gl.uniform1f(drawProgLocs.hue, parameter.value.hue)
    gl.uniform1f(drawProgLocs.saturation, parameter.value.saturation)
    gl.uniform1f(drawProgLocs.lightness, parameter.value.lightness)
    gl.uniform2f(drawProgLocs.canvasSize, app.value.width, app.value.height)
    gl.uniform1i(drawProgLocs.computeSize, app.value.computeSize)

    gl.bindVertexArray(drawVA)
    gl.viewport(0, 0, app.value.width, app.value.height)
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
