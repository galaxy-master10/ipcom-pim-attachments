// src/components/AttachmentPreview.vue
<template>
  <v-card flat class="pa-0 preview-card">
    <div class="file-preview-container">

      <div v-if="isPdf" class="pdf-container">
        <div v-if="contentUrl" class="pdf-embed-container">
          <div class="pdf-toolbar">
            <v-btn icon="mdi-download" color="primary" variant="text" @click="downloadFile" title="Download"></v-btn>
            <v-btn icon="mdi-printer" color="primary" variant="text" @click="printPdf" title="Print"></v-btn>
            <v-spacer></v-spacer>
            <v-btn icon="mdi-fullscreen" color="primary" variant="text" @click="toggleFullscreen" title="Fullscreen"></v-btn>
          </div>
          <iframe
              ref="pdfIframe"
              :src="contentUrl"
              width="100%"
              height="100%"
              frameborder="0"
              class="pdf-iframe"
          ></iframe>
        </div>
        <div v-else class="d-flex flex-column justify-center align-center" style="height: 100%">
          <v-progress-circular v-if="isGeneratingPreview" indeterminate color="primary" size="50" width="5" class="mb-4"></v-progress-circular>
          <div v-else>
            <v-img
                src="/pdf-placeholder.png"
                height="200"
                contain
                class="mx-auto mb-4"
            ></v-img>
            <v-btn
                color="primary"
                variant="outlined"
                prepend-icon="mdi-eye"
                :loading="isGeneratingPreview"
                @click="generatePreview"
                size="large"
            >
              Generate PDF Preview
            </v-btn>
          </div>
        </div>
      </div>

      <div v-else-if="isImage" class="image-container">
        <div v-if="contentUrl" class="image-embed-container">
          <div class="image-toolbar">
            <v-btn icon="mdi-download" color="primary" variant="text" @click="downloadFile" title="Download"></v-btn>
            <v-spacer></v-spacer>
            <v-btn icon="mdi-fullscreen" color="primary" variant="text" @click="toggleFullscreen" title="Fullscreen"></v-btn>
          </div>
          <div class="image-wrapper">
            <v-img
                :src="contentUrl"
                max-height="700"
                contain
                class="mx-auto preview-image"
            ></v-img>
          </div>
        </div>
        <div v-else class="d-flex flex-column justify-center align-center" style="height: 100%">
          <v-progress-circular v-if="isGeneratingPreview" indeterminate color="primary" size="50" width="5" class="mb-4"></v-progress-circular>
          <v-btn
              v-else
              color="primary"
              variant="outlined"
              prepend-icon="mdi-eye"
              @click="generatePreview"
              size="large"
          >
            Generate Image Preview
          </v-btn>
        </div>
      </div>

      <div v-else-if="isDocument" class="document-container d-flex flex-column justify-center align-center">
        <v-img
            src="/document-placeholder.png"
            height="200"
            contain
            class="mx-auto mb-4"
        ></v-img>
        <div class="text-h6 text-grey-darken-1 mb-2">Document Preview</div>
        <div class="text-body-2 text-grey mb-4">This document type requires external software to view</div>
        <v-btn
            color="primary"
            variant="outlined"
            prepend-icon="mdi-download"
            @click="downloadFile"
            size="large"
        >
          Download Document
        </v-btn>
      </div>

      <div v-else class="unknown-container d-flex flex-column justify-center align-center">
        <v-icon size="100" color="grey-lighten-1" class="mb-4">mdi-file-outline</v-icon>
        <div class="text-h6 text-grey-darken-1 mb-2">Preview not available</div>
        <div class="text-body-2 text-grey mb-4">This file format doesn't support previewing</div>
        <v-btn
            color="primary"
            variant="outlined"
            prepend-icon="mdi-download"
            @click="downloadFile"
            size="large"
        >
          Download File
        </v-btn>
      </div>
    </div>


    <v-dialog v-model="showFullscreen" fullscreen transition="dialog-bottom-transition">
      <v-card>
        <v-toolbar dark color="primary">
          <v-toolbar-title>{{ attachment.name }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon @click="showFullscreen = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text class="fullscreen-container pa-0">

          <iframe
              v-if="isPdf && contentUrl"
              :src="contentUrl"
              class="fullscreen-iframe"
          ></iframe>

          <div v-else-if="isImage && contentUrl" class="fullscreen-image-container">
            <v-img
                :src="contentUrl"
                contain
                height="100%"
                class="fullscreen-image"
            ></v-img>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { base64ToBlob, createObjectURL, getMimeType, createDataUrl } from '@/utilities/fileUtils';

const props = defineProps({
  attachment: {
    type: Object,
    required: true
  }
});

const contentUrl = ref(null);
const isGeneratingPreview = ref(false);
const showFullscreen = ref(false);
const pdfIframe = ref(null);


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

// Generate preview from base64 content
const generatePreview = async () => {
  try {
    isGeneratingPreview.value = true;

    if (!props.attachment.content) {
      console.error('No content available for preview');
      return;
    }

    const mimeType = getMimeType(props.attachment.name);

    if (isPdf.value || isImage.value) {

      if (mimeType) {
        contentUrl.value = createDataUrl(props.attachment.content, mimeType);
      }
    }
  } catch (error) {
    console.error('Error generating preview:', error);
  } finally {
    isGeneratingPreview.value = false;
  }
};


const toggleFullscreen = () => {
  showFullscreen.value = !showFullscreen.value;
};


const printPdf = () => {
  if (pdfIframe.value) {
    pdfIframe.value.contentWindow.print();
  } else if (contentUrl.value) {
    // Open in new window and print
    const printWindow = window.open(contentUrl.value, '_blank');
    printWindow.addEventListener('load', () => {
      printWindow.print();
    });
  }
};


const downloadFile = () => {
  try {
    if (!props.attachment.content) {
      console.error('No content available for download');
      return;
    }

    const mimeType = getMimeType(props.attachment.name);
    const blob = base64ToBlob(props.attachment.content, mimeType);

    if (blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = props.attachment.name;
      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    }
  } catch (error) {
    console.error('Error downloading file:', error);
  }
};

watch(() => props.attachment, (newValue) => {
  if (newValue?.content && (isPdf.value || isImage.value)) {
    generatePreview();
  }
}, { immediate: true });

onMounted(() => {

  if (props.attachment?.content && (isPdf.value || isImage.value)) {
    generatePreview();
  }
});
</script>

<style scoped>
.preview-card {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 250px);
  min-height: 600px;
}

.file-preview-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #f8f9fa;
  border-radius: 0 0 8px 8px;
  border: 1px solid #e0e0e0;
  overflow: hidden;
  height: 100%;
}

.pdf-container, .image-container, .document-container, .unknown-container {
  flex: 1;
  height: 100%;
  width: 100%;
}

.pdf-embed-container, .image-embed-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.pdf-toolbar, .image-toolbar {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background-color: #f0f0f0;
  border-bottom: 1px solid #e0e0e0;
  z-index: 1;
}

.pdf-iframe {
  flex: 1;
  border: none;
  background-color: #f8f9fa;
}

.image-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  overflow: auto;
}

.preview-image {
  max-width: 100%;
  object-fit: contain;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.fullscreen-container {
  height: calc(100vh - 64px);
  overflow: hidden;
}

.fullscreen-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.fullscreen-image-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
  padding: 16px;
}

.fullscreen-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
</style>