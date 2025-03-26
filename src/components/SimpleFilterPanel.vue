<template>
  <v-card class="filter-panel mb-4">
    <v-card-title class="bg-primary text-white py-3 d-flex justify-space-between align-center">
      Filter opties
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
            <!-- Filter by Name -->
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                  v-model="filters.name"
                  label="Naam"
                  variant="outlined"
                  hide-details
                  density="compact"
                  class="mb-3"
                  clearable
              ></v-text-field>
            </v-col>
            <!-- Filter by ID -->
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
            <!-- Filter by Product -->
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
            <!-- Filter by Language Code -->
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                  v-model="filters.languageCode"
                  label="Taal"
                  variant="outlined"
                  hide-details
                  density="compact"
                  class="mb-3"
                  clearable
              ></v-text-field>
            </v-col>
            <!-- Filter by Index -->
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
            <!-- Filter by Published -->
            <v-col cols="12" sm="6" md="4">
              <v-select
                  v-model="filters.published"
                  :items="booleanOptions"
                  label="Gepubliceerd"
                  variant="outlined"
                  hide-details
                  density="compact"
                  class="mb-3"
                  clearable
              ></v-select>
            </v-col>
            <!-- Filter by NoResize -->
            <v-col cols="12" sm="6" md="4">
              <v-select
                  v-model="filters.noResize"
                  :items="booleanOptions"
                  label="Geen Resize"
                  variant="outlined"
                  hide-details
                  density="compact"
                  class="mb-3"
                  clearable
              ></v-select>
            </v-col>
            <!-- Filter by Expiry Date Range -->
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                  v-model="filters.expiryDateFrom"
                  label="Vervaldatum vanaf"
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
                  label="Vervaldatum tot"
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
            Toepassen
          </v-btn>
        </v-card-actions>
      </div>
    </v-expand-transition>
  </v-card>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';

const emit = defineEmits(['filter-changed', 'reset-filters']);

// Accept initial filters state from parent
const props = defineProps({
  initialFilters: {
    type: Object,
    default: () => ({})
  }
});

// Control expansion state
const isExpanded = ref(true);

// Create reactive filter object
const filters = reactive({
  id: '',
  name: '',
  product: '',
  languageCode: '',
  published: null,
  noResize: null,
  index: '',
  expiryDateFrom: '',
  expiryDateTo: ''
});

// Boolean options for dropdowns
const booleanOptions = [
  { title: 'Ja', value: true },
  { title: 'Nee', value: false }
];

// Initialize filters from props if available
watch(() => props.initialFilters, (newFilters) => {
  if (newFilters) {
    Object.keys(newFilters).forEach(key => {
      if (key in filters) {
        filters[key] = newFilters[key];
      }
    });
  }
}, { immediate: true, deep: true });

// Apply filters
const applyFilters = () => {
  // Create a new object with only non-empty values
  const activeFilters = {};

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) {
      activeFilters[key] = value;
    }
  });

  emit('filter-changed', activeFilters);
};

// Reset all filters
const resetFilters = () => {
  // Reset all filter values to empty or null
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