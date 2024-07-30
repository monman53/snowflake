<script lang="ts"></script>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { app, fps, parameter } from './main'

// Shaders
import computeVS from './glsl/compute.vert?raw'
import computeFS from './glsl/compute.frag?raw'

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

const computeCanvas = new OffscreenCanvas(app.value.computeWidth, app.value.computeHeight)
const gl = computeCanvas.getContext('webgl2')
const drawCanvas = ref()
onMounted(() => {
  const mainCtx = drawCanvas.value.getContext('webgl2')
  if (gl === null) {
    throw new Error()
  }

  //--------------------------------
  // Create programs
  //--------------------------------

  const computeProgram = createProgram(gl, [computeVS, computeFS])

  //--------------------------------
  // Create buffers
  //--------------------------------

  // Dummy clip for texture computation
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
  const positionLoc = gl.getAttribLocation(computeProgram, 'position')
  gl.enableVertexAttribArray(positionLoc)
  gl.vertexAttribPointer(
    positionLoc,
    2, // size (num components)
    gl.FLOAT, // type of data in buffer
    false, // normalize
    0, // stride (0 = auto)
    0 // offset
  )

  // create our source texture
  const srcTexLoc = gl.getUniformLocation(computeProgram, 'srcTex')
  const srcWidth = 3
  const srcHeight = 2
  const tex = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, tex)
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1) // see https://webglfundamentals.org/webgl/lessons/webgl-data-textures.html
  gl.texImage2D(
    gl.TEXTURE_2D,
    0, // mip level
    gl.R8, // internal format
    srcWidth,
    srcHeight,
    0, // border
    gl.RED, // format
    gl.UNSIGNED_BYTE, // type
    new Uint8Array([1, 2, 3, 4, 5, 6])
  )
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

  gl.useProgram(computeProgram)
  gl.uniform1i(srcTexLoc, 0) // tell the shader the src texture is on texture unit 0

  gl.drawArrays(gl.TRIANGLES, 0, 6) // draw 2 triangles (6 vertices)

  // get the result
  const dstWidth = 3
  const dstHeight = 2
  const results = new Uint8Array(dstWidth * dstHeight * 4)
  gl.readPixels(0, 0, dstWidth, dstHeight, gl.RGBA, gl.UNSIGNED_BYTE, results)

  // print the results
  for (let i = 0; i < dstWidth * dstHeight; ++i) {
    console.log(results[i * 4])
  }

  //================================
  // Frame render function
  //================================
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

    //--------------------------------
    // Draw
    //--------------------------------
    // Color blending
    //gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    gl.blendFunc(gl.SRC_ALPHA, gl.DST_ALPHA)
    //gl.blendFunc(gl.ONE, gl.ZERO)
    gl.enable(gl.BLEND)

    // gl.useProgram(drawProgram)
    // gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    // const matrix = [
    //   [1 / canvas.value.width, 0, 0, 0],
    //   [0, 1 / canvas.value.height, 0, 0],
    //   [0, 0, 1, 0],
    //   [0, 0, 0, 1]
    // ].flat()
    // gl.uniformMatrix4fv(drawParticlesProgLocs.matrix, false, matrix)
    // // gl.uniform1f(drawParticlesProgLocs.particleSize, parameter.value.particleSize)
    // // gl.uniform1f(drawParticlesProgLocs.opacity, parameter.value.opacity)
    // // gl.uniform1f(drawParticlesProgLocs.saturation, parameter.value.saturation)
    // // gl.uniform1f(drawParticlesProgLocs.lightness, parameter.value.lightness)
    // gl.drawArrays(gl.POINTS, 0, numParticles)

    //--------------------------------
    // Swap buffers
    //--------------------------------

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
      drawCanvas.value.width = app.value.width
      drawCanvas.value.height = app.value.height
      computeCanvas.width = app.value.width
      computeCanvas.height = app.value.height
      //   window.requestAnimationFrame(render)
    },
    { deep: true }
  )
})
</script>

<template>
  <div id="base">
    <canvas ref="drawCanvas" :width="app.width" :height="app.height"></canvas>
  </div>
</template>
