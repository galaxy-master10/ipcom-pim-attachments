// src/views/AttachmentDetailView.vue
<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-breadcrumbs :items="breadcrumbs" class="pa-0 mb-4">
          <template v-slot:divider>
            <v-icon>mdi-chevron-right</v-icon>
          </template>
        </v-breadcrumbs>
      </v-col>
    </v-row>

    <v-card v-if="loading" class="text-center pa-6">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
      <div class="mt-2">Loading attachment data...</div>
    </v-card>

    <v-card v-else-if="error" class="text-center pa-6">
      <v-icon icon="mdi-alert-circle" color="error" size="large" class="mb-2"></v-icon>
      <div>{{ error }}</div>
    </v-card>

    <template v-else>
      <!-- Attachment Header Card -->
      <v-card class="mb-4">
        <v-card-item>
          <v-row align="center">
            <v-col cols="12" sm="8" md="10">
              <div class="d-flex align-center">
                <v-icon size="large" class="mr-2">{{ getFileIcon(attachment.name) }}</v-icon>
                <div>
                  <v-card-title class="pa-0 text-h5">{{ attachment.name }}</v-card-title>
                  <v-card-subtitle class="pa-0 text-caption text-grey">
                    ID: {{ attachment.id }}
                  </v-card-subtitle>
                </div>
              </div>
            </v-col>
            <v-col cols="12" sm="4" md="2" class="d-flex justify-end">
              <v-btn
                  color="primary"
                  prepend-icon="mdi-pencil"
                  class="mr-2"
                  @click="showEditDialog = true"
              >
                Edit
              </v-btn>
              <v-menu>
                <template v-slot:activator="{ props }">
                  <v-btn icon v-bind="props">
                    <v-icon>mdi-dots-vertical</v-icon>
                  </v-btn>
                </template>
                <v-list>
                  <v-list-item @click="downloadAttachment">
                    <template v-slot:prepend>
                      <v-icon>mdi-download</v-icon>
                    </template>
                    <v-list-item-title>Download</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="showDeleteConfirmation = true">
                    <template v-slot:prepend>
                      <v-icon>mdi-delete</v-icon>
                    </template>
                    <v-list-item-title>Delete</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </v-col>
          </v-row>
        </v-card-item>
      </v-card>

      <!-- Tabs -->
      <v-card>
        <v-tabs v-model="activeTab" color="primary" class="elevation-0">
          <v-tab value="details">Details</v-tab>
          <v-tab value="preview">Preview</v-tab>
          <v-tab value="history">History</v-tab>
        </v-tabs>

        <v-divider></v-divider>

        <v-window v-model="activeTab">
          <!-- Details Tab -->
          <v-window-item value="details">
            <v-row>
              <!-- Left Column: File Information -->
              <v-col cols="12" md="6">
                <v-card flat class="pa-4">
                  <v-card-title class="pa-0 mb-4">File Information</v-card-title>

                  <attachment-detail-item label="Name:" :value="attachment.name" />
                  <attachment-detail-item label="ID:" :value="attachment.id" />
                  <attachment-detail-item label="Language:" :value="attachment.languageCode" chip />
                  <attachment-detail-item
                      label="Size:"
                      :value="formatFileSize(attachment.size)"
                  />
                  <attachment-detail-item
                      label="Published:"
                      :value="attachment.published"
                      boolean
                  />
                  <attachment-detail-item
                      label="No Resize:"
                      :value="attachment.noResize"
                      boolean
                  />
                  <attachment-detail-item label="Index:" :value="attachment.index" />
                </v-card>
              </v-col>

              <!-- Right Column: Association Information -->
              <v-col cols="12" md="6">
                <v-card flat class="pa-4">
                  <v-card-title class="pa-0 mb-4">Association Information</v-card-title>

                  <attachment-detail-item
                      label="Expiry Date:"
                      :value="attachment.expiryDate"
                      :highlight="getExpiryDateHighlight(attachment.expiryDate)"
                  />
                  <attachment-detail-item
                      label="Product:"
                      :value="getProductName()"
                  />
                  <div class="text-caption text-grey mb-4" v-if="attachment.products?.$values?.[0]">
                    Product ID: {{ attachment.products.$values[0].id }}
                  </div>
                  <attachment-detail-item
                      label="Categories:"
                      :value="getCategoryNames()"
                      chips
                  />
                  <attachment-detail-item
                      label="Status:"
                      :value="getStatus(attachment.expiryDate).status"
                      status-chip
                      :status-level="getStatus(attachment.expiryDate).statusLevel"
                  />
                </v-card>
              </v-col>
            </v-row>
          </v-window-item>

          <!-- Preview Tab -->
          <v-window-item value="preview">
            <attachment-preview :attachment="attachment" />
          </v-window-item>

          <!-- History Tab -->
          <v-window-item value="history">
            <v-card flat class="pa-4">
              <v-card-title class="pa-0 mb-4">Attachment History</v-card-title>
              <p class="text-body-1 text-grey">No history data available for this attachment.</p>
            </v-card>
          </v-window-item>
        </v-window>
      </v-card>
    </template>

    <!-- Edit Attachment Dialog -->
    <attachment-edit-dialog
        v-model="showEditDialog"
        :attachment="attachment"
        @updated="loadAttachment"
    />

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteConfirmation" max-width="500px">
      <v-card>
        <v-card-title class="text-h5">Confirm Deletion</v-card-title>
        <v-card-text>
          Are you sure you want to delete this attachment? This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" @click="showDeleteConfirmation = false">
            Cancel
          </v-btn>
          <v-btn color="error" variant="text" @click="deleteAttachment">
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { AttachmentService } from '@/services/attachmentService.js';
import { getFileIcon, getStatusAndLevel, getStatusColor, formatFileSize } from '@/utilities/utilities.js';
import AttachmentDetailItem from '@/components/AttachmentDetailItem.vue';
import AttachmentEditDialog from '@/components/AttachmentEditDialog.vue';
import AttachmentPreview from '@/components/AttachmentPreview.vue';

const route = useRoute();
const router = useRouter();
const attachmentService = new AttachmentService();

const activeTab = ref('details');
const loading = ref(true);
const error = ref(null);
const attachment = ref({});
const showEditDialog = ref(false);
const showDeleteConfirmation = ref(false);

const breadcrumbs = [
  {
    title: 'Dashboard',
    disabled: false,
    href: '/dashboard',
  },
  {
    title: 'Attachments',
    disabled: false,
    href: '/dashboard',
  },
  {
    title: 'Detail View',
    disabled: true,
  },
];

// Load attachment data from API
const loadAttachment = async () => {
  try {
    loading.value = true;
    error.value = null;

    const id = route.params.id;
    if (!id) {
      throw new Error('Attachment ID is required');
    }

    const data = await attachmentService.getAttachement(id);
    attachment.value = data;
  } catch (err) {
    console.error('Error loading attachment:', err);
    error.value = `Failed to load attachment details: ${err.message || 'Unknown error'}`;
  } finally {
    loading.value = false;
  }
};

// Helper methods for attachment data display
const getProductName = () => {
  return attachment.value.products?.$values?.[0]?.name || 'Unknown';
};

const getCategoryNames = () => {
  return attachment.value.categoryNames?.$values || ['Unknown'];
};

const getStatus = (expiryDate) => {
  return getStatusAndLevel(expiryDate);
};

const getExpiryDateHighlight = (expiryDate) => {
  const { statusLevel } = getStatusAndLevel(expiryDate);
  return statusLevel;
};

// Action handlers
const downloadAttachment = () => {
  // Implementation would depend on your API
  console.log('Download attachment:', attachment.value.id);
  // Example implementation:
  // window.open(`/api/attachments/${attachment.value.id}/download`, '_blank');
};

const deleteAttachment = async () => {
  try {
    // Implementation would depend on your API
    // await attachmentService.deleteAttachment(attachment.value.id);
    showDeleteConfirmation.value = false;
    router.push('/dashboard');
  } catch (error) {
    console.error('Error deleting attachment:', error);
  }
};

// Initialize component
onMounted(() => {
  loadAttachment();
});
</script>