
<script setup lang="ts">
import { ref, computed, watch, PropType } from 'vue';
import { AgGridVue } from 'ag-grid-vue3';
import type { TreeItem } from '../types/global';
import TreeStore from '../lib/TreeStore';

const props = defineProps({
  items: {
    type: Array as PropType<TreeItem[]>,
    required: true,
  },
});

const reactiveItems = ref<TreeItem[]>([...props.items]);

const treeStore = computed(() =>{
  const store = new TreeStore(reactiveItems.value);
  return store;
});


const columnDefs = [
  {
    headerName: '№ п/п',
    valueGetter: (params: any) => {
      return params.node.rowIndex + 1;
    },
    width: 100,
    sortable: false,
    filter: false,
  }, {
    headerName: 'Категория',
    // Эта колонка будет отображаться как групповая
    showRowGroup: true, // ← Ключевая настройка!
    cellRenderer: 'agGroupCellRenderer',
    cellRendererParams: {
      suppressCount: true,
      innerRenderer: (params: any) => {
        if (!params.data) {
          return '';
        }

        const item = params.data as TreeItem;
        if (!item || item.id === undefined) {
          return '';
        }

        const hasChildren = treeStore.value.getChildren(item.id).length > 0;
        return hasChildren ? 'Группа' : 'Элемент';
      },
    },
    width: 220,
  },
  {
    headerName: 'Наименование',
    field: 'label',
    flex: 1,
  },
];

const getDataPath = (data: TreeItem): (string | number)[] => {
  if (!data) {
    return [];
  }

  if (data.parent === null) {
    return [data.id];
  }

  const parents = treeStore.value.getAllParents(data.id);
  if (!parents || parents.length === 0) {
    return [];
  }

  return parents.reverse().map(item => item.id);
};

</script>

<template>
  <div class="tree-grid">
    <ag-grid-vue
        class="ag-theme-alpine"
        :column-defs="columnDefs"
        :row-data="reactiveItems"
        :tree-data="true"
        :get-data-path="getDataPath"
        :group-default-expanded="-1"
        animate-rows
        style="text-align: left"
        group-display-type="groupRows"
    />
  </div>
</template>

<style scoped>
.tree-grid {
  height: 600px;
  width: 520px;
}
.tree-grid :deep(.ag-root-wrapper) {
  min-height: 600px;
}
</style>
