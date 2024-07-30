<script lang="ts"></script>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { app, fps, parameter } from './main'

// Shaders
import computeVS from './glsl/compute.vert?raw'
import computeFS from './glsl/compute.frag?raw'
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

function makeBuffer(gl: WebGL2RenderingContext, bytes: number, usage: GLenum) {
  const buf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  gl.bufferData(gl.ARRAY_BUFFER, bytes, usage)
  return buf
}

function makeVertexArray(gl: WebGL2RenderingContext, bufLocPairs: any) {
  const va = gl.createVertexArray()
  gl.bindVertexArray(va)
  for (const [buffer, loc] of bufLocPairs) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(
      loc, // attribute location
      dim, // number of elements
      gl.FLOAT, // type of data
      false, // normalize
      0, // stride (0 = auto)
      0 // offset
    )
  }
  return va
}

// Canvases
// const computeCanvas = new OffscreenCanvas(app.value.computeWidth, app.value.computeHeight)
const canvas = ref()

onMounted(() => {
  const gl: WebGL2RenderingContext = canvas.value.getContext('webgl2')
  if (gl === null) {
    throw new Error()
  }

  //--------------------------------
  // Create programs
  //--------------------------------

  const computeProgram = createProgram(gl, [computeVS, computeFS])
  const computeProgLocs = {
    time: gl.getUniformLocation(computeProgram, 'time')
  }

  const drawProgram = createProgram(gl, [drawVS, drawFS])
  const drawProgLocs = {
    canvasSize: gl.getUniformLocation(drawProgram, 'canvasSize'),
    computeSize: gl.getUniformLocation(drawProgram, 'computeSize')
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

  const computeVA = createDummyClipVA(gl, computeProgram)
  const drawVA = createDummyClipVA(gl, computeProgram)

  // Create textures
  const createTexture = (gl: WebGL2RenderingContext) => {
    const tex = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1) // see https://webglfundamentals.org/webgl/lessons/webgl-data-textures.html
    gl.texImage2D(
      gl.TEXTURE_2D,
      0, // mip level
      gl.RGBA, // internal format
      app.value.computeWidth,
      app.value.computeHeight,
      0, // border
      gl.RGBA, // format
      gl.UNSIGNED_BYTE, // type
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
  const computeTex = createTexture(gl)
  const computeTexLoc = gl.getUniformLocation(drawProgram, 'computeTex')

  // Setup destination texture
  // Create and bind the framebuffer
  const fb = gl.createFramebuffer()
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb)
  // attach the texture as the first color attachment
  const attachmentPoint = gl.COLOR_ATTACHMENT0
  const level = 0
  gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, computeTex, level)
  gl.bindTexture(gl.TEXTURE_2D, null)

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
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb)
    for (let i = 0; i < 1000; i++) {
      gl.useProgram(computeProgram)
      gl.bindVertexArray(computeVA)
      gl.viewport(0, 0, app.value.computeWidth, app.value.computeHeight)
      gl.uniform1f(computeProgLocs.time, counter)
      gl.drawArrays(gl.TRIANGLES, 0, 6) // draw 2 triangles (6 vertices)
    }

    //--------------------------------
    // Draw
    //--------------------------------
    // Color blending
    //gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    // gl.blendFunc(gl.SRC_ALPHA, gl.DST_ALPHA)
    //gl.blendFunc(gl.ONE, gl.ZERO)
    // gl.enable(gl.BLEND)

    // Clear canvas
    gl.useProgram(drawProgram)
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.clearColor(0, 0, 0, 1)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.bindTexture(gl.TEXTURE_2D, computeTex)

    gl.uniform1i(computeTexLoc, 0)
    gl.uniform2f(drawProgLocs.canvasSize, app.value.width, app.value.height)
    gl.uniform2f(drawProgLocs.computeSize, app.value.computeWidth, app.value.computeHeight)

    gl.bindVertexArray(drawVA)
    gl.viewport(0, 0, app.value.width, app.value.height)
    gl.drawArrays(gl.TRIANGLES, 0, 6) // draw 2 triangles (6 vertices)

    //--------------------------------
    // Swap buffers
    //--------------------------------

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
