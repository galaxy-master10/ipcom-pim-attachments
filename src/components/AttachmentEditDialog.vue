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
                    v-model="formData.countries"
                    :items="countryOptions"
                    label="Countries"
                    variant="outlined"
                    density="comfortable"
                    multiple
                    chips
                    item-title="name"
                    item-value="id"
                    :loading="loadingCountries"
                    :disabled="loadingCountries"
                    :hint="loadingCountries ? 'Loading countries...' : ''"
                    persistent-hint
                >
                  <template v-slot:selection="{ item }">
                    <v-chip>
                      <span>{{ item.raw.name }} ({{ item.raw.countryCode }})</span>
                    </v-chip>
                  </template>
                  <template v-slot:item="{ item, props }">
                    <v-list-item v-bind="props">
                      <template v-slot:prepend>
                        <span class="country-code">{{ item.raw.countryCode }}</span>
                      </template>
                      <v-list-item-title>{{ item.raw.name }}</v-list-item-title>
                    </v-list-item>
                  </template>
                </v-select>

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
import { ref, computed, watch, toRefs, onMounted } from 'vue';
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
const loadingCountries = ref(false);
const loadingCategories = ref(false);
const countryOptions = ref([]);
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
  countries: [],
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

// Process countries data for the dropdown and display
const processCountryData = (countriesData) => {
  if (!countriesData || !countriesData.$values) {
    return [];
  }

  return countriesData.$values.map(country => ({
    id: country.id,
    name: country.name,
    countryCode: country.countryCode
  }));
};

// Process the selected countries in attachment data
const processSelectedCountries = (selectedCountries) => {
  if (!selectedCountries || !selectedCountries.length) {
    return [];
  }

  // If the countries are already objects with id property, return them
  if (typeof selectedCountries[0] === 'object' && selectedCountries[0].id) {
    return selectedCountries;
  }

  // If the selected countries are just strings (country names or ids)
  // Find the corresponding country objects from the countryOptions
  return selectedCountries.map(countryName => {
    const foundCountry = countryOptions.value.find(
        c => c.name === countryName || c.id === countryName
    );
    return foundCountry ? foundCountry.id : countryName;
  });
};

// Fetch countries data
const fetchCountries = async () => {
  try {
    loadingCountries.value = true;
    const data = await attachmentService.getCountries();
    countryOptions.value = processCountryData(data);
    return data;
  } catch (error) {
    console.error('Error fetching countries:', error);
    return { $values: [] };
  } finally {
    loadingCountries.value = false;
  }
};

// Fetch categories data
const fetchCategories = async () => {
  try {
    loadingCategories.value = true;
    const data = await attachmentService.getCategories();
    return data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  } finally {
    loadingCategories.value = false;
  }
};

// Watch for changes to the attachment prop and update form data
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
      countries: newAttachment.countryNames?.$values || [],
      categories: newAttachment.categoryNames?.$values || [],
      status: 'Active' // Assuming status is derived from expiryDate and not stored
    };

    // Ensure countries are correctly mapped after countryOptions are loaded
    if (countryOptions.value.length > 0 && formData.value.countries.length > 0) {
      formData.value.countries = processSelectedCountries(formData.value.countries);
    }
  }
}, { immediate: true });

// After countryOptions are loaded, update the selectedCountries if needed
watch(countryOptions, (newCountryOptions) => {
  if (newCountryOptions.length > 0 && formData.value.countries.length > 0) {
    formData.value.countries = processSelectedCountries(formData.value.countries);
  }
});

const saveAttachment = async () => {
  try {
    saving.value = true;
    error.value = null;

    // Prepare data for API
    const attachmentData = {
      ...formData.value,
      // Convert country objects/ids back to the format expected by the API
      countries: Array.isArray(formData.value.countries)
          ? formData.value.countries.map(country =>
              typeof country === 'object' ? country.id : country
          )
          : []
    };

    console.log('Saving attachment data:', attachmentData);

    // Simulate API call
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

onMounted(async () => {
  // Fetch countries and categories data when component mounts
  await fetchCountries();
  await fetchCategories();

  // If the attachment data is already available, update the countries selection
  if (formData.value.countries.length > 0 && countryOptions.value.length > 0) {
    formData.value.countries = processSelectedCountries(formData.value.countries);
  }
});
</script>

<style scoped>
.country-code {
  display: inline-block;
  min-width: 36px;
  padding: 2px 6px;
  background-color: #f0f0f0;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
  text-align: center;
  margin-right: 8px;
}
</style>