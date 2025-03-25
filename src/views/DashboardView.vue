<template>
  <v-container>
    <!-- Filter Options Section -->
    <v-card class="mb-6">
      <v-card-title>Filter opties</v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" sm="4">
            <v-select
                v-model="selectedProduct"
                :items="products"
                label="Product selecteren"
                item-title="name"
                item-value="id"
                variant="outlined"
                hide-details
            ></v-select>
          </v-col>
          <v-col cols="12" sm="4">
            <v-menu
                v-model="dateMenu"
                :close-on-content-click="false"
                transition="scale-transition"
                min-width="auto"
            >
              <template v-slot:activator="{ props }">
                <v-text-field
                    v-bind="props"
                    v-model="dateRangeText"
                    label="Datumbereik"
                    readonly
                    variant="outlined"
                    hide-details
                ></v-text-field>
              </template>
              <v-date-picker
                  v-model="dateRange"
                  range
                  @update:model-value="dateMenu = false"
              ></v-date-picker>
            </v-menu>
          </v-col>
          <v-col cols="12" sm="4">
            <v-text-field
                v-model="search"
                label="Zoeken..."
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                hide-details
            ></v-text-field>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

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
    <AttachmentsTable :attachments="filteredAttachments" title="Vervallende Attachments" />

    <!-- Pagination -->
    <div class="d-flex justify-center mt-4">
      <v-pagination
          v-model="page"
          :length="totalPages"
          :total-visible="5"
      ></v-pagination>
    </div>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import AttachmentStatCard from '@/components/AttachmentStatCard.vue';
import AttachmentsTable from '@/components/AttachmentsTable.vue';

// State
const selectedProduct = ref(null);
const dateMenu = ref(false);
const dateRange = ref([]);
const search = ref('');
const page = ref(1);
const itemsPerPage = ref(10);

// Mock data
const products = ref([
  { id: 'a', name: 'Product A' },
  { id: 'b', name: 'Product B' },
  { id: 'c', name: 'Product C' },
]);

const attachments = ref([
  {
    id: 1,
    name: 'Veiligheidsblad.pdf',
    product: 'Product C',
    expiryDate: '2025-03-28',
    status: 'Vervalt binnen 1',
    statusLevel: 1
  },
  {
    id: 2,
    name: 'Specificaties.xlsx',
    product: 'Product A',
    expiryDate: '2025-04-07',
    status: 'Vervalt binnen 2',
    statusLevel: 2
  },
  {
    id: 3,
    name: 'Certificaat.docx',
    product: 'Product B',
    expiryDate: '2025-04-14',
    status: 'Vervalt binnen 3',
    statusLevel: 3
  },
  {
    id: 4,
    name: 'Handleiding.pdf',
    product: 'Product A',
    expiryDate: '2025-04-21',
    status: 'Vervalt binnen 4',
    statusLevel: 4
  },
]);

// Computed values
const dateRangeText = computed(() => {
  return dateRange.value.length > 0
      ? `${dateRange.value[0]} - ${dateRange.value[1] || dateRange.value[0]}`
      : '';
});

const expiringSoon = computed(() => {
  const now = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(now.getDate() + 7);

  const count = attachments.value.filter(a => {
    const expiryDate = new Date(a.expiryDate);
    return expiryDate <= nextWeek && expiryDate >= now;
  }).length;

  return { count };
});

const expiringThisMonth = computed(() => {
  const now = new Date();
  const nextMonth = new Date();
  nextMonth.setDate(now.getDate() + 30);

  const count = attachments.value.filter(a => {
    const expiryDate = new Date(a.expiryDate);
    return expiryDate <= nextMonth && expiryDate >= now;
  }).length;

  return { count };
});

const totalAttachments = computed(() => {
  return { count: attachments.value.length };
});

const filteredAttachments = computed(() => {
  let filtered = [...attachments.value];

  if (selectedProduct.value) {
    filtered = filtered.filter(a => a.product === selectedProduct.value.name);
  }

  if (dateRange.value.length === 2) {
    const startDate = new Date(dateRange.value[0]);
    const endDate = new Date(dateRange.value[1]);
    filtered = filtered.filter(a => {
      const expiryDate = new Date(a.expiryDate);
      return expiryDate >= startDate && expiryDate <= endDate;
    });
  }

  if (search.value) {
    const searchLower = search.value.toLowerCase();
    filtered = filtered.filter(a =>
        a.name.toLowerCase().includes(searchLower) ||
        a.product.toLowerCase().includes(searchLower)
    );
  }

  // Pagination
  const start = (page.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filtered.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(attachments.value.length / itemsPerPage.value);
});

// Lifecycle
onMounted(() => {
  // Here you would typically fetch data from an API
  console.log('Dashboard component mounted');
});
</script>