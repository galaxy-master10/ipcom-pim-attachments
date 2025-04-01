<template>
  <v-container>
    <AttachmentsFilter
        :initial-filters="activeFilters"
        @filter-changed="onFilterChanged"
        @reset-filters="onFilterReset"
    />

    <v-row>
      <v-col cols="12" md="4">
        <AttachmentStatCard
            title="Vervalt binnen 7 dagen"
            :count="expiringWithin7Days"
            label="attachments"
            color="error"
        />
      </v-col>
      <v-col cols="12" md="4">
        <AttachmentStatCard
            title="Vervalt binnen 30 dagen"
            :count="expiringWithin30Days"
            label="attachments"
            color="warning"
        />
      </v-col>
      <v-col cols="12" md="4">
        <AttachmentStatCard
            title="Totaal aantal attachments"
            :count="totalAttachments"
            label="attachments"
            color="info"
        />
      </v-col>
    </v-row>

    <AttachmentsTable
        title="Vervallende Attachments"
        :loading="loading"
        :error="error"
        @page-changed="onPageChanged"
        @page-size-changed="onPageSizeChanged"
    />
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, provide } from 'vue';
import AttachmentStatCard from '@/components/AttachmentStatCard.vue';
import AttachmentsTable from '@/components/AttachmentsTable.vue';
import { AttachmentService } from "@/services/attachmentService.js";
import AttachmentsFilter from "@/components/AttachmentsFilter.vue";



const attachments = ref({ $values: [] });
const loading = ref(false);
const error = ref(null);
const activeFilters = ref({});
const expiringWithin7Days = ref(0);
const expiringWithin30Days = ref(0);
const totalAttachments = ref(0);

const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  totalItems: 0,
  totalPages: 0
});


provide('attachments', attachments);
provide('pagination', pagination);
provide('activeFilters', activeFilters);

const attachmentService = new AttachmentService();



const fetchAttachments = async () => {
  try {
    loading.value = true;
    error.value = null;

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

    // Update expiring attachments

    expiringWithin7Days.value = response.expiringWithin7Days;
    expiringWithin30Days.value = response.expiringWithin30Days;
    totalAttachments.value = response.totalRecords;

  } catch (err) {
    console.error('Error fetching attachments:', err);
    error.value = `Error loading attachments: ${err.message}`;
    attachments.value = { $values: [] };
  } finally {
    loading.value = false;
  }
};


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


const onPageChanged = (page) => {
  console.log('Page changed to:', page);
  pagination.value.currentPage = page;
};

const onPageSizeChanged = (size) => {
  console.log('Page size changed to:', size);
  pagination.value.pageSize = size;
  pagination.value.currentPage = 1;
};

// Lifecycle
onMounted(() => {
  fetchAttachments();
  console.log(attachments)
});
</script>