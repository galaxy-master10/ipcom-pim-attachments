<template>
  <v-container>
    <!-- Filter Options Section -->
    <SimpleFilterPanel
        :initial-filters="activeFilters"
        @filter-changed="onFilterChanged"
        @reset-filters="onFilterReset"
    />

    <!-- Statistics Cards -->
    <v-row>
      <v-col cols="12" md="4">
        <AttachmentStatCard
            title="Vervalt binnen 7 dagen"
            :count="expiringSoon.count"
            label="attachments"
            color="error"
        />
      </v-col>
      <v-col cols="12" md="4">
        <AttachmentStatCard
            title="Vervalt binnen 30 dagen"
            :count="expiringThisMonth.count"
            label="attachments"
            color="warning"
        />
      </v-col>
      <v-col cols="12" md="4">
        <AttachmentStatCard
            title="Totaal aantal attachments"
            :count="totalAttachments.count"
            label="attachments"
            color="info"
        />
      </v-col>
    </v-row>

    <!-- Attachments Table -->
    <AttachmentsTable
        title="Vervallende Attachments"
        :loading="loading"
        :error="error"
    />
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, provide } from 'vue';
import AttachmentStatCard from '@/components/AttachmentStatCard.vue';
import AttachmentsTable from '@/components/AttachmentsTable.vue';
import { AttachmentService } from "@/services/attachmentService.js";
import SimpleFilterPanel from "@/components/SimpleFilterPanel.vue";

// State - make these available to child components
const attachments = ref({ $values: [] });
const loading = ref(false);
const error = ref(null);
const activeFilters = ref({});

const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  totalItems: 0,
  totalPages: 0
});

// Provide these values to child components
provide('attachments', attachments);
provide('pagination', pagination);
provide('activeFilters', activeFilters);

const attachmentService = new AttachmentService();

// Computed
const expiringSoon = computed(() => {
  return {
    count: countAttachmentsExpiringWithinDays(7)
  };
});

const expiringThisMonth = computed(() => {
  return {
    count: countAttachmentsExpiringWithinDays(30)
  };
});

const totalAttachments = computed(() => {
  return {
    count: (attachments.value.$values || []).length
  };
});

// Methods
function countAttachmentsExpiringWithinDays(days) {
  if (!attachments.value.$values) return 0;

  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + days);

  return attachments.value.$values.filter(attachment => {
    if (!attachment.expiryDate) return false;
    const expiryDate = new Date(attachment.expiryDate);
    return expiryDate <= futureDate && expiryDate >= today;
  }).length;
}

const fetchAttachments = async () => {
  try {
    loading.value = true;
    error.value = null;

    console.log('Fetching attachments with filters:', activeFilters.value);
    console.log('Current page:', pagination.value.currentPage);

    const response = await attachmentService.getAllAttachements(
        activeFilters.value,
        pagination.value.currentPage,
        pagination.value.pageSize
    );

    // Add daysUntilExpiry property to each attachment
    const today = new Date();
    if (response.data && response.data.$values) {
      response.data.$values = response.data.$values.map(attachment => {
        let daysUntilExpiry = null;
        if (attachment.expiryDate) {
          const expiryDate = new Date(attachment.expiryDate);
          daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
        }
        return { ...attachment, daysUntilExpiry };
      });
    }

    attachments.value = response.data || { $values: [] };

    // Update pagination
    pagination.value = {
      currentPage: response.pageNumber || 1,
      pageSize: response.pageSize || 10,
      totalItems: response.totalRecords || 0,
      totalPages: response.totalPages || 0
    };

    console.log('Fetched attachments:', attachments.value.$values?.length || 0);
    console.log('Updated pagination:', pagination.value);
  } catch (err) {
    console.error('Error fetching attachments:', err);
    error.value = `Error loading attachments: ${err.message}`;
    attachments.value = { $values: [] };
  } finally {
    loading.value = false;
  }
};

// Make fetchAttachments available to child components
provide('fetchAttachments', fetchAttachments);

const onFilterChanged = (filters) => {
  console.log('Filters changed:', filters);
  activeFilters.value = { ...filters };
  pagination.value.currentPage = 1;
  fetchAttachments();
};

const onFilterReset = () => {
  console.log('Filters reset');
  activeFilters.value = {};
  pagination.value.currentPage = 1;
  fetchAttachments();
};

// Lifecycle
onMounted(() => {
  fetchAttachments();
});
</script>