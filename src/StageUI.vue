<script setup lang="ts">
import { ref, type Ref } from 'vue'
import { app, fps, parameter, parameterProps, parameterTemplates } from './main'
import { humanReadable, randomParameter, resetParameter } from './utils'

type ModeType = 'control' | 'info' | ''
const mode: Ref<ModeType> = ref('')

const setParameter = (t: any) => {
  parameter.value.rho = t.rho
  parameter.value.beta = t.beta
  parameter.value.alpha = t.alpha
  parameter.value.theta = t.theta
  parameter.value.kappa = t.kappa
  parameter.value.mu = t.mu
  parameter.value.gamma = t.gamma
  parameter.value.sigma = t.sigma
}
</script>

<template>
  <div id="base">
    <div class="mode-select">
      <div>
        <i v-if="mode === 'control'" class="bi bi-gear-fill pointer" @click="mode = ''" />
        <i v-else class="bi bi-gear pointer" @click="mode = 'control'" />
      </div>
      <div>
        <i v-if="mode === 'info'" class="bi bi-info-circle-fill pointer" @click="mode = ''" />
        <i v-else class="bi bi-info-circle pointer" @click="mode = 'info'" />
      </div>
      <div style="text-align: right">
        <a href="https://github.com/monman53/snowflake"><i class="bi bi-github pointer" /></a>
      </div>
    </div>

    <div class="content">
      <div v-if="mode === 'control'" id="controller">
        <template v-for="category of parameterProps" :key="category.name">
          <fieldset>
            <legend class="pointer" @click="category.visible = !category.visible">
              <i class="bi bi-dash" v-if="category.visible"></i
              ><i class="bi bi-plus" v-if="!category.visible"></i> {{ category.name }}
            </legend>
            <template v-if="category.visible">
              <template v-for="prop of category.props" :key="prop.name">
                <label>
                  {{ prop.name }}
                  <br />
                  <input
                    type="range"
                    v-model.number="parameter[prop.name as keyof typeof parameter]"
                    :step="prop.step"
                    :min="prop.min"
                    :max="prop.max"
                    @dblclick="parameter[prop.name as keyof typeof parameter] = prop.default"
                  />
                </label>
                <span style="float: right">
                  {{ humanReadable(parameter[prop.name as keyof typeof parameter]) }}
                </span>
                <br />
              </template>
            </template>
          </fieldset>
        </template>
        <fieldset>
          <legend>Templates</legend>
          <template v-for="(t, idx) of parameterTemplates" :key="idx">
            <button @click="setParameter(t)">{{ t.name }}</button>
          </template>
          <br />
          <button @click="app.reset = true">Clear</button>
          <button @click="resetParameter">Reset all parameter</button><br />
        </fieldset>
        <fieldset>
          <legend>Info</legend>
          FPS: {{ humanReadable(fps) }}<br />
          Iteration: {{ app.iteration }}<br />
        </fieldset>
      </div>
      <div v-if="mode === 'info'">
        <p>
          This is an unofficial implementation of J. Gravner, D. Griffeath,
          <i>MODELING SNOW CRYSTAL GROWTH II: A mesoscopic lattice map with plausible dynamics</i>
          Physica D: Nonlinear Phenomena, Volume 237, Issue 3, 2008, Pages 385-404
        </p>
      </div>
    </div>
    <div v-if="mode !== ''" class="footer">
      <small>Created by <a href="https://monman53.github.io/">monman53</a></small>
    </div>
  </div>
</template>

<style scoped>
#base {
  max-height: 90vh;
  overflow-y: auto;

  margin: 1em;
  padding: 0.5em;
  max-width: 20em;
  border-radius: 1em;
  color: white;
  background-color: #0008;
  backdrop-filter: blur(4px);
}

#controller {
  user-select: none;
}

#controller p {
  margin: 0;
}

legend {
  font-weight: bold;
}

.content {
  max-height: 80vh;
  overflow: auto;
}

a {
  color: white;
  text-decoration: none;
}

.mode-select {
  margin: 0.3em;
  font-size: 1.5em;
  display: grid;
  grid-template-columns: auto auto auto auto 1fr;
  gap: 0.3em;
}

.pointer {
  cursor: pointer;
}

.footer {
  padding: 0.3em;
  text-align: right;
}
</style>
