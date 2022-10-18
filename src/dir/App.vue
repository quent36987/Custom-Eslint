<template>
  <v-my-component
    v-if="caaaaaa"
    :is="caaaaaa"
    :key="caaaaaa"
    v-directive="caaaaaa"
    :any-bound-prop="caaaaaa"
    any-unbound-prop="caaaaaa"
    class="v-icon"
    any-boolean-prop
    @event="caaaaaa"
  />
</template>

<script lang="ts"></script>

<style scoped>
.v-icon {
  --header-font-size: 1.2em;
  --layer-panels-z-index: 20000;
  --layer-system-z-index: 30000;
  --spacing-s: 0.5rem;
  --subtitle-font-size: 0.8em;
  --title-font-size: 1em;

  top: 5px;
  left: 0;
  z-index: var(--layer-system-z-index);

  width: 1em;
  margin-right: auto;
  margin-bottom: initial;
  margin: var(--global-spacing);
  padding-top: initial;
  padding-bottom: initial;

  background: var(--white);
  border-top: var(--border-size) solid var(--border-color);
  color: #2c3e50;
  font-size: 12pt;
  text-align: center;

  grid-column-start: 1 !important;
  grid-column-end: calc(var(--columns-sm) + 1) !important;
}
</style>
