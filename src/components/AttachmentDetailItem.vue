// src/components/AttachmentDetailItem.vue
<template>
  <div class="mb-4">
    <div class="text-subtitle-2 font-weight-medium text-grey-darken-1">{{ label }}</div>

    <div v-if="boolean" class="d-flex align-center mt-1">
      <v-icon :color="value ? 'success' : 'grey'" class="mr-2">
        {{ value ? 'mdi-check-circle' : 'mdi-close-circle' }}
      </v-icon>
      <span>{{ value ? 'Yes' : 'No' }}</span>
    </div>

    <div v-else-if="statusChip" class="mt-1">
      <v-chip
          :color="getStatusColor(statusLevel)"
          text-color="white"
          size="small"
      >
        {{ value }}
      </v-chip>
    </div>

    <div v-else-if="chips" class="d-flex flex-wrap gap-2 mt-1">
      <v-chip
          v-for="(item, index) in Array.isArray(value) ? value : [value]"
          :key="index"
          size="small"
          color="green-lighten-8"
      >
        {{ item }}
      </v-chip>
    </div>

    <div v-else-if="chip" class="mt-1">
      <v-chip size="small" color="red">
        {{ value }}
      </v-chip>
    </div>

    <div v-else-if="highlight" class="mt-1">
      <div class="d-flex align-center">
        <span>{{ value }}</span>
        <v-progress-linear
            v-if="highlight"
            :color="getStatusColor(highlight)"
            :value="100"
            class="ml-4"
            style="max-width: 100px"
        ></v-progress-linear>
      </div>
    </div>

    <div v-else class="text-body-1 mt-1">{{ value }}</div>
  </div>
</template>

<script setup>
import { getStatusColor } from '@/utilities/utilities.js';

defineProps({
  label: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number, Boolean, Array],
    required: true
  },
  boolean: {
    type: Boolean,
    default: false
  },
  statusChip: {
    type: Boolean,
    default: false
  },
  statusLevel: {
    type: String,
    default: 'info'
  },
  chips: {
    type: Boolean,
    default: false
  },
  chip: {
    type: Boolean,
    default: false
  },
  highlight: {
    type: String,
    default: ''
  }
});

</script>