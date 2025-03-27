<template>
  <v-card class="mt-6">
    <v-card-title>{{ title }}</v-card-title>


    <v-card-text v-if="loading" class="text-center">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
      <div class="mt-2">Laden van attachment data...</div>
    </v-card-text>

    <v-card-text v-else-if="error" class="text-center text-error">
      <v-icon icon="mdi-alert-circle" color="error" size="large" class="mb-2"></v-icon>
      <div>{{ error }}</div>
    </v-card-text>


    <v-data-table
        v-else
        :headers="headers"
        :items="processedAttachments"
        :items-per-page="pagination.pageSize"
        disable-pagination
        class="elevation-0"
        hide-default-footer
    >

      <template v-slot:item.name="{ item }">
        <div class="d-flex align-center">
          <v-icon size="small" class="mr-2">{{ getFileIcon(item.name) }}</v-icon>
          <span>{{ item.name }}</span>
        </div>
      </template>

      <template v-slot:item.status="{ item }">
        <v-chip
            :color="getStatusColor(item.statusLevel)"
            text-color="white"
            size="small"
        >
          {{ item.status }}
        </v-chip>
      </template>

      <template v-slot:item.languageCode="{ item }">
        <v-chip size="small" color="grey-lighten-1">
          {{ item.languageCode }}
        </v-chip>
      </template>


      <template v-slot:item.size="{ item }">
        {{ formatFileSize(item.size) }}
      </template>

      <template v-slot:item.published="{ item }">
        <v-icon :color="item.published ? 'success' : 'grey'">
          {{ item.published ? 'mdi-check-circle' : 'mdi-close-circle' }}
        </v-icon>
      </template>

      <template v-slot:item.noResize="{ item }">
        <v-icon :color="item.noResize ? 'success' : 'grey'">
          {{ item.noResize ? 'mdi-check-circle' : 'mdi-close-circle' }}
        </v-icon>
      </template>
    </v-data-table>

    <div class="d-flex justify-space-between align-center px-4 py-3">
      <div class="d-flex align-center">
        <span class="text-body-2 mr-2">Rijen per pagina:</span>
        <v-select
            v-model="pagination.pageSize"
            :items="pageSizeOptions"
            variant="outlined"
            density="compact"
            class="page-size-select"
            hide-details
            style="max-width: 120px;"
            @update:model-value="changePageSize"
        ></v-select>
      </div>

      <div class="d-flex align-center">
        <v-btn
            icon="mdi-chevron-left"
            variant="text"
            :disabled="pagination.currentPage <= 1"
            @click="changePage(pagination.currentPage - 1)"
        />
        <span class="mx-4">
      Pagina {{ pagination.currentPage }} van {{ pagination.totalPages }}
    </span>
        <v-btn
            icon="mdi-chevron-right"
            variant="text"
            :disabled="pagination.currentPage >= pagination.totalPages"
            @click="changePage(pagination.currentPage + 1)"
        />
      </div>
    </div>
  </v-card>
</template>

<script setup>
import { ref, computed, inject } from 'vue';
import {getFileIcon, getStatusAndLevel, getStatusColor, formatFileSize } from "@/utilities/utilities.js";


const props = defineProps({
  title: {
    type: String,
    default: 'Attachments'
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: null
  }
});


const attachments = inject('attachments', ref({ $values: [] }));
const pagination = inject('pagination', ref({
  currentPage: 1,
  pageSize: 10,
  totalItems: 0,
  totalPages: 0
}));

const activeFilters = inject('activeFilters', ref({}));
const fetchAttachments = inject('fetchAttachments', () => console.warn('fetchAttachments not provided'));
const pageSizeOptions = [10, 25, 50, 75, 100];

const emit = defineEmits(['page-changed']);


const headers = [
  { title: 'ID', key: 'id', align: 'start', sortable: false },
  { title: 'Name', key: 'name', align: 'start' },
  { title: 'Product', key: 'product', align: 'start' },
  { title: 'Status', key: 'status', align: 'center' },
  { title: 'Expiry Date', key: 'expiryDate', align: 'start' },
  { title: 'Index', key: 'index', align: 'center' },
  { title: 'Language', key: 'languageCode', align: 'center' },
  { title: 'Size', key: 'size', align: 'end' },
  { title: 'Published', key: 'published', align: 'center' },
  { title: 'No Resize', key: 'noResize', align: 'center' },
];


const processedAttachments = computed(() => {
  return attachments.value.$values?.map(attachment => {
    const product = attachment.products?.$values?.[0]?.name || 'Unknown';

    const { status, statusLevel } = getStatusAndLevel(attachment.expiryDate);

    return {
      ...attachment,
      product,
      status,
      statusLevel
    };
  }) || [];
});
const changePage = (newPage) => {
  pagination.value.currentPage = newPage;
  fetchAttachments();
  emit('page-changed', newPage);
};

const changePageSize = (newSize) => {
  pagination.value.currentPage = 1;
  pagination.value.pageSize = newSize;
  fetchAttachments();
  emit('page-size-changed', newSize);
};

</script>