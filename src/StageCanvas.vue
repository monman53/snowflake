<script lang="ts"></script>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { app, fps, parameter } from './main'

// Shaders
import updatePositionVS from './glsl/updatePosition.vert?raw'
import dummyFS from './glsl/dummy.frag?raw'
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

function createProgram(
  gl: WebGL2RenderingContext,
  shaderSources: string[],
  transformFeedbackVaryings: any
) {
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
  if (transformFeedbackVaryings) {
    gl.transformFeedbackVaryings(program, transformFeedbackVaryings, gl.SEPARATE_ATTRIBS)
  }
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

function makeTransformFeedback(gl: any, buffers: any[]) {
  const tf = gl.createTransformFeedback()
  gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, tf)
  buffers.forEach((buffer, idx) => {
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, idx, buffer)
  })
  return tf
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
const offscreenCanvas = new OffscreenCanvas(app.value.width, app.value.height)
const gl = offscreenCanvas.getContext('webgl2', { alpha: true, premultipliedAlpha: false })
const canvas = ref()
onMounted(() => {
  // const gl = canvas.value.getContext('webgl2')
  const mainCtx = canvas.value.getContext('bitmaprenderer')
  if (gl === null) {
    throw new Error()
  }

  //--------------------------------
  // Create programs
  //--------------------------------
  const updatePositionProgram = createProgram(
    gl,
    [updatePositionVS, dummyFS],
    ['newPosition', 'newVelocity']
  )
  const drawParticlesProgram = createProgram(gl, [drawVS, drawFS], [])

  const updatePositionPrgLocs = {
    oldPosition: gl.getAttribLocation(updatePositionProgram, 'oldPosition'),
    canvasDimensions: gl.getUniformLocation(updatePositionProgram, 'canvasDimensions')
  }

  const drawParticlesProgLocs = {
    position: gl.getAttribLocation(drawParticlesProgram, 'position'),
    matrix: gl.getUniformLocation(drawParticlesProgram, 'matrix')
  }

  //--------------------------------
  // Create buffers
  //--------------------------------
  // CPU initial buffers
  // const numParticles = 1024 * 1024 * 16
  const numParticles = 1024 * 1024 * 1
  const bytes = numParticles * dim * 4

  // GPU buffers
  const position1Buffer = makeBuffer(gl, bytes, gl.DYNAMIC_DRAW)
  const position2Buffer = makeBuffer(gl, bytes, gl.DYNAMIC_DRAW)
  const velocity1Buffer = makeBuffer(gl, bytes, gl.DYNAMIC_DRAW)
  const velocity2Buffer = makeBuffer(gl, bytes, gl.DYNAMIC_DRAW)

  // Vertex arrays for updater
  const updatePositionVA1 = makeVertexArray(gl, [
    [position1Buffer, updatePositionPrgLocs.oldPosition]
  ])
  const updatePositionVA2 = makeVertexArray(gl, [
    [position2Buffer, updatePositionPrgLocs.oldPosition]
  ])

  // Vertex arrays for drawer
  const drawVA1 = makeVertexArray(gl, [[position1Buffer, drawParticlesProgLocs.position]])
  const drawVA2 = makeVertexArray(gl, [[position2Buffer, drawParticlesProgLocs.position]])

  const tf1 = makeTransformFeedback(gl, [position1Buffer, velocity1Buffer])
  const tf2 = makeTransformFeedback(gl, [position2Buffer, velocity2Buffer])

  // For ping-pong buffering
  let current = {
    updateVA: updatePositionVA1, // read from position1
    tf: tf2, // write to position2
    drawVA: drawVA2, // draw with position2
    buffer: position2Buffer,
    velocityBuffer: velocity2Buffer
  }
  let next = {
    updateVA: updatePositionVA2, // read from position2
    tf: tf1, // write to position1
    drawVA: drawVA1, // draw with position1
    buffer: position1Buffer,
    velocityBuffer: velocity1Buffer
  }

  // unbind left over stuff
  gl.bindBuffer(gl.ARRAY_BUFFER, null)
  gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER, null)

  //================================
  // Frame render function
  //================================
  let hoge = 0
  let then = 0
  let counter = 0
  let fpsThen = 0
  function render(time: number) {
    if (gl === null) {
      throw new Error()
    }

    //--------------------------------
    // Calculate FPS
    //--------------------------------
    counter += 1
    // convert to seconds
    time *= 0.001
    // Subtract the previous time from the current time
    const deltaTime = time - then
    // Remember the current time for the next frame.
    then = time
    if (counter % 100 == 0) {
      fps.value = 100 / (time - fpsThen)
      fpsThen = time
    }

    // Clear canvas
    gl.clearColor(0, 0, 0, 1)
    gl.clear(gl.COLOR_BUFFER_BIT)

    //--------------------------------
    // Update positions using transform feedback
    //--------------------------------
    // compute the new positions
    gl.useProgram(updatePositionProgram)
    gl.bindVertexArray(current.updateVA)
    // gl.uniform2f(updatePositionPrgLocs.canvasDimensions, gl.canvas.width, gl.canvas.height)
    // gl.uniform1f(updatePositionPrgLocs.gravity, parameter.value.gravity)

    gl.enable(gl.RASTERIZER_DISCARD)

    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, current.tf)
    gl.beginTransformFeedback(gl.POINTS)
    gl.drawArrays(gl.POINTS, 0, numParticles)
    gl.endTransformFeedback()
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null)

    // turn on using fragment shaders again
    gl.disable(gl.RASTERIZER_DISCARD)

    //--------------------------------
    // Draw
    //--------------------------------
    // Color blending
    //gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    gl.blendFunc(gl.SRC_ALPHA, gl.DST_ALPHA)
    //gl.blendFunc(gl.ONE, gl.ZERO)
    gl.enable(gl.BLEND)
    gl.useProgram(drawParticlesProgram)

    gl.bindVertexArray(current.drawVA)

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

    const matrix = [
      [1 / canvas.value.width, 0, 0, 0],
      [0, 1 / canvas.value.height, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1]
    ].flat()
    gl.uniformMatrix4fv(drawParticlesProgLocs.matrix, false, matrix)
    // gl.uniform1f(drawParticlesProgLocs.particleSize, parameter.value.particleSize)
    // gl.uniform1f(drawParticlesProgLocs.opacity, parameter.value.opacity)
    // gl.uniform1f(drawParticlesProgLocs.saturation, parameter.value.saturation)
    // gl.uniform1f(drawParticlesProgLocs.lightness, parameter.value.lightness)
    gl.drawArrays(gl.POINTS, 0, numParticles)

    //--------------------------------
    // Copy offscreen render result to main canvas
    //--------------------------------
    mainCtx.transferFromImageBitmap(offscreenCanvas.transferToImageBitmap())

    //--------------------------------
    // Swap buffers
    //--------------------------------
    // swap which buffer we will read from
    // and which one we will write to
    {
      const temp = current
      current = next
      next = temp
    }

    window.requestAnimationFrame(render)
  }

  // const animationLoop = () => {
  //     render()
  //     window.requestAnimationFrame(animationLoop)
  // }

  // const draw = () => {
  // }

  window.requestAnimationFrame(render)

  watch(
    [app],
    () => {
      canvas.value.width = app.value.width
      canvas.value.height = app.value.height
      offscreenCanvas.width = app.value.width
      offscreenCanvas.height = app.value.height
      //   window.requestAnimationFrame(render)
    },
    { deep: true }
  )
})
</script>

<template>
  <div id="base">
    <canvas ref="canvas" :width="app.width" :height="app.height"></canvas>
  </div>
</template>
