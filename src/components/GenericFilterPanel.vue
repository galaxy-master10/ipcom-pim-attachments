<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  // Initial filter values
  initialFilters: {
    type: Object,
    default: () => ({})
  },
  // Specify which filters to show (all are shown if not specified)
  visibleFilters: {
    type: Array,
    default: () => [
      'name', 'languageCode', 'published', 'noResize',
      'expiryDateFrom', 'expiryDateTo', 'productId', 'index',
      'pageNumber', 'pageSize'
    ]
  },
  // Filter configuration (labels, types, etc.)
  filterConfig: {
    type: Object,
    default: () => ({
      name: {
        label: 'Name',
        type: 'text'
      },
      languageCode: {
        label: 'LanguageCode',
        type: 'text'
      },
      published: {
        label: 'Published',
        type: 'boolean'
      },
      noResize: {
        label: 'NoResize',
        type: 'boolean'
      },
      expiryDateFrom: {
        label: 'ExpiryDateFrom',
        type: 'date'
      },
      expiryDateTo: {
        label: 'ExpiryDateTo',
        type: 'date'
      },
      productId: {
        label: 'ProductId',
        type: 'text'
      },
      index: {
        label: 'Index',
        type: 'number'
      },
      pageNumber: {
        label: 'PageNumber',
        type: 'number',
        min: 1,
        defaultValue: 1
      },
      pageSize: {
        label: 'PageSize',
        type: 'number',
        min: 1,
        max: 100,
        defaultValue: 10
      }
    })
  },
  // Card title
  title: {
    type: String,
    default: 'Filter opties'
  },
  // Apply button label
  applyButtonLabel: {
    type: String,
    default: 'Toepassen'
  },
  // Reset button label
  resetButtonLabel: {
    type: String,
    default: 'Reset'
  },
  // Auto apply filters on change
  autoApply: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['filter-changed', 'reset-filters']);

// Create reactive filter values
const filterValues = ref({});

// Boolean options for dropdowns
const booleanOptions = [
  { title: '--', value: '' },
  { title: 'Ja', value: true },
  { title: 'Nee', value: false }
];

// Initialize filter values from props or defaults
const initializeFilters = () => {
  const initializedValues = {};

  props.visibleFilters.forEach(filterName => {
    const config = props.filterConfig[filterName];

    if (!config) return;

    // Use initial value from props if available, otherwise use default from config
    if (props.initialFilters[filterName] !== undefined) {
      initializedValues[filterName] = props.initialFilters[filterName];
    } else if (config.defaultValue !== undefined) {
      initializedValues[filterName] = config.defaultValue;
    } else {
      // Set default empty values based on type
      switch (config.type) {
        case 'boolean':
          initializedValues[filterName] = '';
          break;
        case 'number':
          initializedValues[filterName] = config.min || '';
          break;
        case 'select':
          initializedValues[filterName] = config.options && config.options.length > 0
              ? config.options[0].value
              : '';
          break;
        default:
          initializedValues[filterName] = '';
      }
    }
  });

  filterValues.value = initializedValues;
};

// Build filters object from all inputs
const getFilters = () => {
  const result = {};

  // Add non-empty filters
  Object.entries(filterValues.value).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) {
      result[key] = value;
    }
  });

  return result;
};

// Apply filters
const applyFilters = () => {
  emit('filter-changed', getFilters());
};

// Reset all filters
const resetFilters = () => {
  initializeFilters();
  emit('reset-filters');
};

// Watch for changes if autoApply is enabled
watch(filterValues, () => {
  if (props.autoApply) {
    applyFilters();
  }
}, { deep: true });

// Initialize on component creation
initializeFilters();
</script>

<template>
  <v-card class="filter-panel mb-4">
    <v-card-title class="bg-primary text-white py-3">
      {{ title }}
    </v-card-title>

    <v-card-text class="py-4">
      <v-row>
        <!-- Generate form fields dynamically based on configuration -->
        <v-col
            v-for="(filterName, index) in visibleFilters"
            :key="index"
            cols="12" sm="6" md="4" lg="3"
            v-if="filterConfig[filterName]"
        >
          <!-- Text field -->
          <v-text-field
              v-if="filterConfig[filterName].type === 'text'"
              v-model="filterValues[filterName]"
              :label="filterConfig[filterName].label"
              variant="outlined"
              hide-details
              density="compact"
              class="mb-3"
          ></v-text-field>

          <!-- Number field -->
          <v-text-field
              v-else-if="filterConfig[filterName].type === 'number'"
              v-model.number="filterValues[filterName]"
              :label="filterConfig[filterName].label"
              type="number"
              :min="filterConfig[filterName].min"
              :max="filterConfig[filterName].max"
              variant="outlined"
              hide-details
              density="compact"
              class="mb-3"
          ></v-text-field>

          <!-- Date field -->
          <v-text-field
              v-else-if="filterConfig[filterName].type === 'date'"
              v-model="filterValues[filterName]"
              :label="filterConfig[filterName].label"
              type="date"
              variant="outlined"
              hide-details
              density="compact"
              class="mb-3"
          ></v-text-field>

          <!-- Boolean dropdown -->
          <v-select
              v-else-if="filterConfig[filterName].type === 'boolean'"
              v-model="filterValues[filterName]"
              :items="booleanOptions"
              :label="filterConfig[filterName].label"
              variant="outlined"
              hide-details
              density="compact"
              class="mb-3"
          ></v-select>

          <!-- Custom dropdown -->
          <v-select
              v-else-if="filterConfig[filterName].type === 'select'"
              v-model="filterValues[filterName]"
              :items="filterConfig[filterName].options || []"
              :label="filterConfig[filterName].label"
              variant="outlined"
              hide-details
              density="compact"
              class="mb-3"
          ></v-select>
        </v-col>
      </v-row>
    </v-card-text>

    <v-card-actions class="px-4 pb-4" v-if="!autoApply">
      <v-spacer></v-spacer>
      <v-btn color="error" variant="text" @click="resetFilters">
        {{ resetButtonLabel }}
      </v-btn>
      <v-btn color="primary" @click="applyFilters">
        {{ applyButtonLabel }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<style scoped>
.filter-panel {
  border-radius: 8px;
}
</style>