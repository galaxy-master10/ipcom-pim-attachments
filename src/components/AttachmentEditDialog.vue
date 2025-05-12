<template>
  <v-dialog v-model="dialog" max-width="900px" persistent>
    <!-- Header Bar -->
    <v-card>
      <v-toolbar color="primary" dark flat>
        <v-toolbar-title>Edit Attachment</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="closeDialog">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <!-- Loading State -->
      <v-card-text v-if="loading" class="pt-6">
        <div class="d-flex flex-column justify-center align-center">
          <v-progress-circular indeterminate color="primary" size="50" width="5" class="mb-4"></v-progress-circular>
          <span class="text-body-1">Loading attachment data...</span>
        </div>
      </v-card-text>

      <!-- Error State -->
      <v-card-text v-else-if="error" class="pt-6">
        <v-alert type="error" class="mb-0" variant="tonal">
          <div class="d-flex align-center">
            <v-icon size="large" class="mr-3">mdi-alert-circle</v-icon>
            <span>{{ error }}</span>
          </div>
        </v-alert>
      </v-card-text>

      <!-- Edit Form -->
      <div v-else>
        <v-form ref="form" @submit.prevent="saveAttachment">
          <v-card-text class="pt-4">
            <v-container>
              <v-row>
                <!-- Left Column: File Information -->
                <v-col cols="12" md="6">
                  <v-card variant="outlined" class="mb-4">
                    <v-card-item>
                      <template v-slot:prepend>
                        <v-icon color="primary" size="large">mdi-file-document-outline</v-icon>
                      </template>
                      <v-card-title class="text-h6">File Information</v-card-title>
                    </v-card-item>

                    <v-divider></v-divider>

                    <v-card-text>
                      <v-text-field
                          v-model="formData.name"
                          label="File Name"
                          variant="outlined"
                          density="comfortable"
                          prepend-inner-icon="mdi-file"
                          class="mb-3"
                      ></v-text-field>

                      <v-text-field
                          v-model="formData.id"
                          label="ID"
                          variant="outlined"
                          density="comfortable"
                          prepend-inner-icon="mdi-identifier"
                          disabled
                          hint="ID cannot be modified"
                          persistent-hint
                          class="mb-3"
                      ></v-text-field>

                      <v-text-field
                          v-model="displayLanguageName"
                          label="Language"
                          variant="outlined"
                          density="comfortable"
                          prepend-inner-icon="mdi-translate"
                          disabled
                          hint="Language cannot be modified"
                          persistent-hint
                          class="mb-3"
                      ></v-text-field>

                      <v-text-field
                          v-model.number="formData.index"
                          type="number"
                          label="Index"
                          variant="outlined"
                          density="comfortable"
                          prepend-inner-icon="mdi-order-numeric-ascending"
                          class="mb-4"
                      ></v-text-field>

                      <div class="d-flex flex-wrap gap-3">
                        <v-checkbox
                            v-model="formData.published"
                            label="Published"
                            color="success"
                            class="mr-4"
                        ></v-checkbox>

                        <v-checkbox
                            v-model="formData.noResize"
                            label="No Resize"
                            color="primary"
                        ></v-checkbox>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>

                <!-- Right Column: Association Information -->
                <v-col cols="12" md="6">
                  <v-card variant="outlined" class="mb-4">
                    <v-card-item>
                      <template v-slot:prepend>
                        <v-icon color="primary" size="large">mdi-link-variant</v-icon>
                      </template>
                      <v-card-title class="text-h6">Association Information</v-card-title>
                    </v-card-item>

                    <v-divider></v-divider>

                    <v-card-text>
                      <v-text-field
                          v-model="formData.expiryDate"
                          label="Expiry Date"
                          variant="outlined"
                          density="comfortable"
                          prepend-inner-icon="mdi-calendar"
                          type="date"
                          class="mb-3"
                      ></v-text-field>

                      <v-text-field
                          v-model="formData.productName"
                          label="Product Name"
                          variant="outlined"
                          density="comfortable"
                          prepend-inner-icon="mdi-package-variant-closed"
                          disabled
                          hint="Product name cannot be modified"
                          persistent-hint
                          class="mb-3"
                      ></v-text-field>

                      <v-select
                          v-model="formData.categories"
                          :items="filteredCategories"
                          label="Categories"
                          variant="outlined"
                          density="comfortable"
                          prepend-inner-icon="mdi-tag-multiple"
                          multiple
                          chips
                          item-title="name"
                          item-value="id"
                          :loading="loadingCategories"
                          :disabled="loadingCategories"
                          :hint="loadingCategories ? 'Loading categories...' : filteredCategoriesHint"
                          persistent-hint
                          class="mb-3"
                      >
                        <template v-slot:selection="{ item }">
                          <v-chip color="primary" variant="tonal" size="small">
                            {{ item.raw.name }}
                          </v-chip>
                        </template>
                      </v-select>

                      <v-select
                          v-model="formData.countries"
                          :items="countryOptions"
                          label="Countries"
                          variant="outlined"
                          density="comfortable"
                          prepend-inner-icon="mdi-earth"
                          multiple
                          chips
                          item-title="name"
                          item-value="id"
                          :loading="loadingCountries"
                          :disabled="loadingCountries"
                          :hint="loadingCountries ? 'Loading countries...' : ''"
                          persistent-hint
                          class="mb-3"
                      >
                        <template v-slot:selection="{ item }">
                          <v-chip color="info" variant="tonal" size="small">
                            {{ item.raw.name }} ({{ item.raw.countryCode }})
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
                          prepend-inner-icon="mdi-check-circle"
                          class="mb-3"
                      ></v-select>

                      <v-file-input
                          label="Replace File (Optional)"
                          variant="outlined"
                          density="comfortable"
                          prepend-icon="mdi-paperclip"
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                          show-size
                          truncate-length="25"
                          class="mt-4"
                      ></v-file-input>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>

          <v-divider></v-divider>

          <!-- Action Buttons -->
          <v-card-actions class="px-6 py-3">
            <v-spacer></v-spacer>
            <v-btn
                color="grey-darken-1"
                variant="text"
                @click="closeDialog"
                class="px-5"
            >
              Cancel
            </v-btn>
            <v-btn
                color="primary"
                variant="elevated"
                @click="saveAttachment"
                :loading="saving"
                :disabled="saving"
                class="px-5 ml-2"
            >
              Save
            </v-btn>
          </v-card-actions>
        </v-form>
      </div>
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
const loadingLanguages = ref(false);
const countryOptions = ref([]);
const languages = ref([]);
const categoryData = ref([]);
const filteredCategories = ref([]);
const displayLanguageName = ref(''); // This will hold the formatted language name for display

const formData = ref({
  id: '',
  name: '',
  productName: '',
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

const statusOptions = ['Active', 'Inactive', 'Pending'];

// Computed property to provide hint for filtered categories
const filteredCategoriesHint = computed(() => {
  if (filteredCategories.value.length === 0 && formData.value.languageCode) {
    return `No categories available for language: ${formData.value.languageCode}`;
  }
  return '';
});

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

// Process the language data from the API
const processLanguageData = (languageData) => {
  if (!languageData || !languageData.$values) {
    return [];
  }

  return languageData.$values.map(language => ({
    id: language.id,
    name: language.name,
    isoCode: language.isoCode
  }));
};

// Process categories data properly to handle the new structure
const processCategoryData = (categoriesData) => {
  if (!categoriesData || !categoriesData.$values) {
    return [];
  }

  // Map the complex category structure to a simplified format with translations
  return categoriesData.$values.map(category => {
    const translationMap = {};

    // Process translations using the new structure
    if (category.translations && category.translations.$values) {
      category.translations.$values.forEach(translation => {
        translationMap[translation.languageCode] = {
          id: translation.id,
          name: translation.languageTranslation,
          property: translation.property
        };
      });
    }

    return {
      id: category.id,
      // Use English as fallback, or first translation, or generic name
      name: translationMap.EN?.name ||
          (Object.values(translationMap)[0]?.name) ||
          'Unnamed Category',
      translations: translationMap
    };
  });
};

// Update language display name
const updateLanguageDisplay = () => {
  if (!formData.value.languageCode || languages.value.length === 0) return;

  const language = languages.value.find(l => l.isoCode === formData.value.languageCode);
  if (language) {
    displayLanguageName.value = `${language.name} (${language.isoCode})`;
  } else {
    displayLanguageName.value = formData.value.languageCode;
  }
};

// Fetch languages data
const fetchLanguages = async () => {
  try {
    loadingLanguages.value = true;
    const data = await attachmentService.getLanguages();
    languages.value = processLanguageData(data);
    // Update language display name after loading languages
    updateLanguageDisplay();
    return data;
  } catch (error) {
    console.error('Error fetching languages:', error);
    return { $values: [] };
  } finally {
    loadingLanguages.value = false;
  }
};

// Filter categories by the current language code
const filterCategoriesByLanguage = (languageCode) => {
  if (!categoryData.value.length || !languageCode) {
    filteredCategories.value = [];
    return;
  }

  // Filter categories that have a translation for the current language
  const filtered = categoryData.value.filter(category =>
      category.translations && category.translations[languageCode]
  );

  // Map filtered categories to format expected by v-select
  filteredCategories.value = filtered.map(category => ({
    id: category.id,
    name: category.translations[languageCode].name
  }));

  // Update selected categories to ensure they're valid for the current language
  if (formData.value.categories && formData.value.categories.length > 0) {
    const validCategoryIds = new Set(filteredCategories.value.map(c => c.id));
    formData.value.categories = formData.value.categories.filter(catId => {
      const categoryId = typeof catId === 'object' ? catId.id : catId;
      return validCategoryIds.has(categoryId);
    });
  }
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
    categoryData.value = processCategoryData(data);

    // Initially filter by the current language
    if (formData.value.languageCode) {
      filterCategoriesByLanguage(formData.value.languageCode);
    }

    return data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return { $values: [] };
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
      productName: newAttachment.products?.$values?.[0]?.name || '',
      published: newAttachment.published || false,
      noResize: newAttachment.noResize || false,
      index: newAttachment.index || 0,
      expiryDate: newAttachment.expiryDate ? newAttachment.expiryDate.split('T')[0] : '',
      productId: newAttachment.products?.$values?.[0] || null,
      countries: newAttachment.countryNames?.$values || [],
      categories: newAttachment.categoryNames?.$values || [],
      status: 'Active' // Assuming status is derived from expiryDate and not stored
    };

    // Update the language display name
    updateLanguageDisplay();

    // After setting form data, filter categories by the current language
    if (newAttachment.languageCode && categoryData.value.length > 0) {
      filterCategoriesByLanguage(newAttachment.languageCode);
    }

    // Ensure countries are correctly mapped after countryOptions are loaded
    if (countryOptions.value.length > 0 && formData.value.countries.length > 0) {
      formData.value.countries = processSelectedCountries(formData.value.countries);
    }
  }
}, { immediate: true });

// Watch for languages data to update the language display
watch(languages, () => {
  updateLanguageDisplay();
});


watch(categoryData, (newCategoryData) => {
  if (newCategoryData.length > 0 && formData.value.languageCode) {
    filterCategoriesByLanguage(formData.value.languageCode);
  }
});

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
          : [],
      // Make sure categories are in the expected format
      categories: Array.isArray(formData.value.categories)
          ? formData.value.categories.map(category =>
              typeof category === 'object' ? category.id : category
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
  loading.value = true;
  try {

    const [categoriesPromise, countriesPromise, languagesPromise] = [
      fetchCategories(),
      fetchCountries(),
      fetchLanguages()
    ];


    await Promise.all([categoriesPromise, countriesPromise, languagesPromise]);


    if (formData.value.languageCode && categoryData.value.length > 0) {
      filterCategoriesByLanguage(formData.value.languageCode);
    }

    if (formData.value.countries.length > 0 && countryOptions.value.length > 0) {
      formData.value.countries = processSelectedCountries(formData.value.countries);
    }
  } catch (err) {
    console.error("Error during initialization:", err);
    error.value = "Failed to load required data. Please try again.";
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.country-code {
  display: inline-block;
  min-width: 36px;
  padding: 2px 6px;
  background-color: #e0e0e0;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
  text-align: center;
  margin-right: 8px;
}

.v-card-item {
  padding-bottom: 8px !important;
}

.v-card-text {
  padding-top: 16px !important;
}

/* Reduce the space between form elements */
.v-input--density-comfortable {
  margin-bottom: 12px !important;
}

/* Add spacer between input groups */
.form-spacer {
  height: 16px;
}
</style>