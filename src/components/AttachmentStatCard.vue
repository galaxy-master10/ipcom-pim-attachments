<template>
  <v-card class="h-100">
    <v-card-text>
      <p class="text-subtitle-1">{{ title }}</p>
      <div class="d-flex align-center">
        <span class="text-h3" :class="`text-${color}`">{{ count }}</span>
        <span class="ml-2 text-body-2">{{ label }}</span>
      </div>
      <v-progress-linear
          :model-value="progress"
          :color="color"
          height="8"
          rounded
          class="mt-2"
      ></v-progress-linear>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  count: {
    type: Number,
    required: true
  },
  label: {
    type: String,
    default: 'items'
  },
  color: {
    type: String,
    default: 'primary'
  },
  maxValue: {
    type: Number,
    default: 100
  }
});

const progress = computed(() => {
  return (props.count / props.maxValue) * 100;
});
</script>