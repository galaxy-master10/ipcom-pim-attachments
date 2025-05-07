<template>
  <v-dialog v-model="dialog" max-width="900px" persistent>
    <v-card>
      <v-card-title class="bg-primary text-white">
        Edit Attachment
        <v-spacer></v-spacer>
        <v-btn icon variant="text" @click="closeDialog">
          <v-icon color="white">mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-container v-if="loading">
          <div class="d-flex justify-center align-center pa-4">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
            <span class="ml-2">Loading...</span>
          </div>
        </v-container>

        <v-container v-else-if="error">
          <v-alert type="error" class="mb-0">{{ error }}</v-alert>
        </v-container>

        <v-form v-else ref="form" @submit.prevent="saveAttachment">
          <v-container>
            <v-row>
              <!-- Left Column -->
              <v-col cols="12" md="6">
                <div class="text-h6 mb-4">File Information</div>

                <v-text-field
                    v-model="formData.name"
                    label="Name"
                    variant="outlined"
                    density="comfortable"
                ></v-text-field>

                <v-text-field
                    v-model="formData.id"
                    label="ID"
                    variant="outlined"
                    density="comfortable"
                    disabled
                    hint="ID cannot be modified"
                    persistent-hint
                ></v-text-field>

                <v-select
                    v-model="formData.languageCode"
                    :items="languageOptions"
                    label="Language"
                    variant="outlined"
                    density="comfortable"
                ></v-select>

                <v-checkbox
                    v-model="formData.published"
                    label="Published"
                ></v-checkbox>

                <v-checkbox
                    v-model="formData.noResize"
                    label="No Resize"
                ></v-checkbox>

                <v-text-field
                    v-model.number="formData.index"
                    type="number"
                    label="Index"
                    variant="outlined"
                    density="comfortable"
                ></v-text-field>
              </v-col>

              <!-- Right Column -->
              <v-col cols="12" md="6">
                <div class="text-h6 mb-4">Association Information</div>

                <v-text-field
                    v-model="formData.expiryDate"
                    label="Expiry Date"
                    variant="outlined"
                    density="comfortable"
                    type="date"
                ></v-text-field>

                <v-select
                    v-model="formData.productId"
                    :items="productOptions"
                    label="Product"
                    variant="outlined"
                    density="comfortable"
                    item-title="name"
                    item-value="id"
                    return-object
                ></v-select>

                <v-select
                    v-model="formData.categories"
                    :items="categoryOptions"
                    label="Categories"
                    variant="outlined"
                    density="comfortable"
                    multiple
                    chips
                ></v-select>

                <v-select
                    v-model="formData.status"
                    :items="statusOptions"
                    label="Status"
                    variant="outlined"
                    density="comfortable"
                ></v-select>

                <v-file-input
                    label="Replace File (Optional)"
                    variant="outlined"
                    density="comfortable"
                    prepend-icon="mdi-paperclip"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                ></v-file-input>
              </v-col>
            </v-row>
          </v-container>
        </v-form>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="grey-darken-1" variant="text" @click="closeDialog">
          Cancel
        </v-btn>
        <v-btn
            color="primary"
            variant="text"
            @click="saveAttachment"
            :loading="saving"
            :disabled="saving"
        >
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch, toRefs } from 'vue';
import { AttachmentService } from '@/services/attachmentService.js';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  attachment: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['update:modelValue', 'updated']);
const { modelValue, attachment } = toRefs(props);

const dialog = computed({
  get: () => modelValue.value,
  set: (value) => emit('update:modelValue', value)
});

const attachmentService = new AttachmentService();
const form = ref(null);
const loading = ref(false);
const saving = ref(false);
const error = ref(null);
const formData = ref({
  id: '',
  name: '',
  languageCode: '',
  published: false,
  noResize: false,
  index: 0,
  expiryDate: '',
  productId: null,
  categories: [],
  status: 'Active'
});

const languageOptions = ['NL', 'EN', 'DE', 'FR', 'ES', 'IT'];
const productOptions = ref([
  { id: '0562a3f8-92a8-414d-be0a-58827f9a7f4c', name: 'Armaflex Ultima tubes' },
  { id: '1', name: 'ORYX COLLAR WR' },
  { id: '2', name: 'Product 3' }
]);
const categoryOptions = ['TDS', 'SDS', 'Afbeeldingen', 'Manual', 'Certificate'];
const statusOptions = ['Active', 'Inactive', 'Pending'];

watch(attachment, (newAttachment) => {
  if (newAttachment?.id) {
    formData.value = {
      id: newAttachment.id || '',
      name: newAttachment.name || '',
      languageCode: newAttachment.languageCode || '',
      published: newAttachment.published || false,
      noResize: newAttachment.noResize || false,
      index: newAttachment.index || 0,
      expiryDate: newAttachment.expiryDate ? newAttachment.expiryDate.split('T')[0] : '',
      productId: newAttachment.products?.$values?.[0] || null,
      categories: newAttachment.categoryNames?.$values || [],
      status: 'Active' // Assuming status is derived from expiryDate and not stored
    };
  }
}, { immediate: true });

const saveAttachment = async () => {
  try {
    saving.value = true;
    error.value = null;


    await new Promise(resolve => setTimeout(resolve, 1000));

    emit('updated');
    closeDialog();
  } catch (err) {
    console.error('Error saving attachment:', err);
    error.value = `Failed to save changes: ${err.message || 'Unknown error'}`;
  } finally {
    saving.value = false;
  }
};

const closeDialog = () => {
  dialog.value = false;
};
</script>