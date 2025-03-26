<template>
  <v-card class="mt-6">
    <v-card-title>{{ title }}</v-card-title>

    <!-- Loading state -->
    <v-card-text v-if="loading" class="text-center">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
      <div class="mt-2">Laden van attachment data...</div>
    </v-card-text>

    <!-- Error state -->
    <v-card-text v-else-if="error" class="text-center text-error">
      <v-icon icon="mdi-alert-circle" color="error" size="large" class="mb-2"></v-icon>
      <div>{{ error }}</div>
    </v-card-text>

    <!-- Data table -->
    <v-data-table
        v-else
        :headers="headers"
        :items="processedAttachments"
        :items-per-page="pagination.pageSize"
        :page="pagination.currentPage"
        class="elevation-0"
        hide-default-footer
    >
      <!-- Name column with icon based on file type -->
      <template v-slot:item.name="{ item }">
        <div class="d-flex align-center">
          <v-icon size="small" class="mr-2">{{ getFileIcon(item.name) }}</v-icon>
          <span>{{ item.name }}</span>
        </div>
      </template>

      <!-- Status column with colored chip -->
      <template v-slot:item.status="{ item }">
        <v-chip
            :color="getStatusColor(item.statusLevel)"
            text-color="white"
            size="small"
        >
          {{ item.status }}
        </v-chip>
      </template>

      <!-- Language column -->
      <template v-slot:item.languageCode="{ item }">
        <v-chip size="small" color="grey-lighten-1">
          {{ item.languageCode }}
        </v-chip>
      </template>

      <!-- Size column -->
      <template v-slot:item.size="{ item }">
        {{ formatFileSize(item.size) }}
      </template>

      <!-- Boolean columns -->
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

    <!-- Pagination with page size options -->
    <div class="d-flex justify-space-between align-center px-4 py-3">
      <!-- Page size selector -->
      <div class="d-flex align-center">
        <span class="text-body-2 mr-2">Rijen per pagina:</span>
        <v-select
            v-model="pagination.pageSize"
            :items="pageSizeOptions"
            variant="outlined"
            density="compact"
            class="page-size-select"
            hide-details
            @update:model-value="changePageSize"
        ></v-select>
      </div>
    </div>

    <!-- Pagination -->
    <div class="d-flex justify-center align-center pa-4">
      <v-btn
          icon="mdi-chevron-left"
          variant="text"
          :disabled="pagination.currentPage <= 1"
          @click="changePage(pagination.currentPage - 1)"
      ></v-btn>

      <span class="mx-4">
        Pagina {{ pagination.currentPage }} van {{ pagination.totalPages }}
      </span>

      <v-btn
          icon="mdi-chevron-right"
          variant="text"
          :disabled="pagination.currentPage >= pagination.totalPages"
          @click="changePage(pagination.currentPage + 1)"
      ></v-btn>
    </div>
  </v-card>
</template>

<script setup>
import { ref, computed, onMounted, watch, inject } from 'vue';
import { AttachmentService } from '../services/attachmentService';

// Props definition
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

// Use shared state from parent component
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
// Emits
const emit = defineEmits(['page-changed']);

// Table headers
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

// Derived data
const processedAttachments = computed(() => {
  // Map received attachments to include the derived product name and status
  return attachments.value.$values?.map(attachment => {
    // Find product name, defaulting to 'Unknown' if null or not found
    const product = attachment.products && attachment.products.$values && attachment.products.$values.length > 0
        ? (attachment.products.$values[0].name || 'Unknown')
        : 'Unknown';

    // Calculate status level and message based on expiry date
    let status = 'Active';
    let statusLevel = 4; // Default to success/green

    if (attachment.expiryDate) {
      const expiryDate = new Date(attachment.expiryDate);
      const today = new Date();
      const daysToExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));

      if (daysToExpiry <= 0) {
        status = 'Verlopen';
        statusLevel = 0;
      } else if (daysToExpiry <= 7) {
        status = `Vervalt binnen ${daysToExpiry} dagen`;
        statusLevel = 1;
      } else if (daysToExpiry <= 14) {
        status = `Vervalt binnen ${daysToExpiry} dagen`;
        statusLevel = 2;
      } else if (daysToExpiry <= 30) {
        status = `Vervalt binnen ${daysToExpiry} dagen`;
        statusLevel = 3;
      }
    }

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
// Change the number of items per page
const changePageSize = (newSize) => {
  // Reset to page 1 when changing page size to avoid empty results
  pagination.value.currentPage = 1;
  pagination.value.pageSize = newSize;
  fetchAttachments();
  emit('page-size-changed', newSize);
};

// Utility methods
const getFileIcon = (filename) => {
  if (!filename) return 'mdi-file-question-outline';

  const extension = filename.split('.').pop().toLowerCase();

  switch (extension) {
    case 'pdf':
      return 'mdi-file-pdf-box';
    case 'docx':
    case 'doc':
      return 'mdi-file-word-box';
    case 'xlsx':
    case 'xls':
      return 'mdi-file-excel-box';
    case 'pptx':
    case 'ppt':
      return 'mdi-file-powerpoint-box';
    case 'jpg':
    case 'jpeg':
    case 'png':
      return 'mdi-file-image-box';
    default:
      return 'mdi-file-document-outline';
  }
};

const getStatusColor = (level) => {
  switch (level) {
    case 0:
      return 'grey';
    case 1:
      return 'error';
    case 2:
      return 'deep-orange';
    case 3:
      return 'amber-darken-2';
    case 4:
      return 'success';
    default:
      return 'grey';
  }
};

const formatFileSize = (bytes) => {
  if (!bytes && bytes !== 0) return '';
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
</script>