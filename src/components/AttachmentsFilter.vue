<template>
  <v-card class="filter-panel mb-4">
    <v-card-title class="bg-primary text-white py-3 d-flex justify-space-between align-center">
      Filter options
      <v-btn
          icon
          variant="text"
          color="white"
          @click="isExpanded = !isExpanded"
          aria-label="Toggle filter visibility"
      >
        <v-icon>{{ isExpanded ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
      </v-btn>
    </v-card-title>
    <v-expand-transition>
      <div v-if="isExpanded">
        <v-card-text class="py-4">
          <v-row>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                  v-model="filters.name"
                  label="Name"
                  variant="outlined"
                  hide-details
                  density="compact"
                  class="mb-3"
                  clearable
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                  v-model="filters.id"
                  label="ID"
                  variant="outlined"
                  hide-details
                  density="compact"
                  class="mb-3"
                  clearable
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                  v-model="filters.product"
                  label="Product"
                  variant="outlined"
                  hide-details
                  density="compact"
                  class="mb-3"
                  clearable
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                  v-model="filters.languageCode"
                  label="Language"
                  variant="outlined"
                  hide-details
                  density="compact"
                  class="mb-3"
                  clearable
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                  v-model.number="filters.categoryName"
                  label="Category"
                  variant="outlined"
                  hide-details
                  density="compact"
                  class="mb-3"
                  clearable
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                  v-model.number="filters.index"
                  label="Index"
                  type="number"
                  variant="outlined"
                  hide-details
                  density="compact"
                  class="mb-3"
                  clearable
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-select
                  v-model="filters.published"
                  :items="booleanOptions"
                  label="Published"
                  variant="outlined"
                  hide-details
                  density="compact"
                  class="mb-3"
                  clearable
              ></v-select>
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-select
                  v-model="filters.noResize"
                  :items="booleanOptions"
                  label="No Resize"
                  variant="outlined"
                  hide-details
                  density="compact"
                  class="mb-3"
                  clearable
              ></v-select>
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                  v-model="filters.expiryDateFrom"
   label="Expiry Date From"
                  type="date"
                  variant="outlined"
                  hide-details
                  density="compact"
                  class="mb-3"
                  clearable
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                  v-model="filters.expiryDateTo"
                 label="Expiry Date To"
                  type="date"
                  variant="outlined"
                  hide-details
                  density="compact"
                  class="mb-3"
                  clearable
              ></v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-spacer></v-spacer>
          <v-btn color="error" variant="text" @click="resetFilters">
            Reset
          </v-btn>
          <v-btn color="primary" @click="applyFilters">
           Apply
          </v-btn>
        </v-card-actions>
      </div>
    </v-expand-transition>
  </v-card>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';

const emit = defineEmits(['filter-changed', 'reset-filters']);

const props = defineProps({
  initialFilters: {
    type: Object,
    default: () => ({})
  }
});


const isExpanded = ref(true);


const filters = reactive({
  id: '',
  name: '',
  product: '',
  languageCode: '',
  published: null,
  noResize: null,
  index: '',
  expiryDateFrom: '',
  expiryDateTo: '',
  categoryName: ''
});


const booleanOptions = [
  { title: 'Yes', value: true },
  { title: 'No', value: false }
];

watch(() => props.initialFilters, (newFilters) => {
  if (newFilters) {
    Object.keys(newFilters).forEach(key => {
      if (key in filters) {
        filters[key] = newFilters[key];
      }
    });
  }
}, { immediate: true, deep: true });


const applyFilters = () => {

  const activeFilters = {};

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) {
      activeFilters[key] = value;
    }
  });

  emit('filter-changed', activeFilters);
};

const resetFilters = () => {
  Object.keys(filters).forEach(key => {
    if (typeof filters[key] === 'boolean' || filters[key] === true || filters[key] === false) {
      filters[key] = null;
    } else {
      filters[key] = '';
    }
  });

  emit('reset-filters');
};
</script>

<style scoped>
.filter-panel {
  border-radius: 8px;
}
</style>