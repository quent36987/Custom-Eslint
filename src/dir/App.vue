<template>
  <component
    v-if="panel.component"
    :is="panel.component.name"
    v-bind="panel.component.attributes"
    v-hook="hook"
    v-test="true"
    :any-bound-prop="true"
    any-unbound-prop="..."
    any-boolean-prop
  />
</template>

<script lang="ts"></script>

<style scoped></style>
