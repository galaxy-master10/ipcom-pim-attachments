<template>
  <v-card class="mt-6">
    <v-card-title>{{ title }}</v-card-title>
    <v-data-table
        :headers="headers"
        :items="attachments"
        class="elevation-0"
        hide-default-footer
    >
      <!-- Name column with icon based on file type -->
      <template v-slot:item.name="{ item }">
        <div class="d-flex align-center">
          <v-icon size="small" class="mr-2">{{ getFileIcon(item.name) }}</v-icon>
          {{ item.name }}
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

      <!-- Actions column with detail button -->
      <template v-slot:item.actions="{ item }">
        <v-btn
            color="primary"
            size="small"
            variant="flat"
            @click="viewDetails(item.id)"
        >
          Details
        </v-btn>
      </template>
    </v-data-table>
  </v-card>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  attachments: {
    type: Array,
    required: true
  },
  title: {
    type: String,
    default: 'Attachments'
  }
});

const headers = [
  { title: 'NAAM', key: 'name', align: 'start' },
  { title: 'PRODUCT', key: 'product', align: 'start' },
  { title: 'VERVALDATUM', key: 'expiryDate', align: 'start' },
  { title: 'STATUS', key: 'status', align: 'start' },
  { title: 'ACTIES', key: 'actions', align: 'center', sortable: false }
];

const getFileIcon = (filename) => {
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

const viewDetails = (id) => {
  console.log(`View details for attachment ${id}`);
  // Implement navigation or modal dialog here
};
</script>