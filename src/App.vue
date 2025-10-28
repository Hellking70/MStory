<script setup lang="ts">
import TreeGrid from "./components/TreeGrid.vue";
import {items} from "./mocks/mockData.ts";
</script>

<template>
  <div id="app">
    <h2>Тестовое задание MStroy — Tree Grid</h2>
    <TreeGrid :items="items" />
  </div>
</template>

<style scoped>
#app {
  padding: 20px;
  font-family: Arial, sans-serif;
}
</style>
