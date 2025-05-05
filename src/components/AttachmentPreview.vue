// src/components/AttachmentPreview.vue
<template>
  <v-card flat class="pa-4">
    <v-card-title class="pa-0 mb-4">File Preview</v-card-title>

    <div class="d-flex justify-center align-center file-preview-container">
      <!-- PDF Preview -->
      <div v-if="isPdf" class="text-center">
        <v-img
            src="/pdf-placeholder.png"
            height="300"
            contain
            class="mx-auto mb-2"
        ></v-img>
        <v-btn
            color="primary"
            variant="outlined"
            prepend-icon="mdi-eye"
            @click="openPreview"
        >
          View PDF
        </v-btn>
      </div>

      <!-- Image Preview -->
      <div v-else-if="isImage" class="text-center">
        <v-img
            :src="previewUrl"
            max-height="500"
            contain
            class="mx-auto"
        ></v-img>
      </div>

      <!-- Document Preview (Word, Excel, etc.) -->
      <div v-else-if="isDocument" class="text-center">
        <v-img
            src="/document-placeholder.png"
            height="300"
            contain
            class="mx-auto mb-2"
        ></v-img>
        <v-btn
            color="primary"
            variant="outlined"
            prepend-icon="mdi-file-document-outline"
            @click="openPreview"
        >
          View Document
        </v-btn>
      </div>

      <!-- Default (Unsupported Format) -->
      <div v-else class="text-center">
        <v-icon size="120" color="grey-lighten-1" class="mb-4">mdi-file-outline</v-icon>
        <div class="text-h6 text-grey-darken-1 mb-2">Preview not available</div>
        <div class="text-body-2 text-grey mb-4">This file format doesn't support previewing</div>
        <v-btn
            color="primary"
            variant="outlined"
            prepend-icon="mdi-download"
            @click="downloadFile"
        >
          Download File
        </v-btn>
      </div>
    </div>
  </v-card>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  attachment: {
    type: Object,
    required: true
  }
});

// Determine file type for appropriate preview
const isPdf = computed(() => props.attachment.name?.toLowerCase().endsWith('.pdf'));
const isImage = computed(() => {
  const name = props.attachment.name?.toLowerCase() || '';
  return name.endsWith('.jpg') || name.endsWith('.jpeg') ||
      name.endsWith('.png') || name.endsWith('.gif') ||
      name.endsWith('.svg');
});
const isDocument = computed(() => {
  const name = props.attachment.name?.toLowerCase() || '';
  return name.endsWith('.doc') || name.endsWith('.docx') ||
      name.endsWith('.xls') || name.endsWith('.xlsx') ||
      name.endsWith('.ppt') || name.endsWith('.pptx');
});

// Generate preview URL (implementation would depend on your API)
const previewUrl = computed(() => {
  // Example implementation:
  // return `/api/attachments/${props.attachment.id}/preview`;
  return '#'; // Placeholder
});

// Action handlers
const openPreview = () => {
  // Implementation would depend on your API
  // Example: window.open(`/api/attachments/${props.attachment.id}/preview`, '_blank');
  console.log('Open preview for:', props.attachment.id);
};

const downloadFile = () => {
  // Implementation would depend on your API
  // Example: window.open(`/api/attachments/${props.attachment.id}/download`, '_blank');
  console.log('Download file:', props.attachment.id);
};
</script>

<style scoped>
.file-preview-container {
  min-height: 400px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}
</style>
