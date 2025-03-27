<template>
  <div class="notifications-page">
    <v-container>
      <v-row>
        <v-col>
          <h1 class="text-h4 mb-6">Notifications</h1>

          <!-- Collapsible Filter and Sort Options -->
          <v-card class="mb-6">
            <v-card-title class="d-flex justify-space-between py-2">
              <span>Filters</span>
              <v-btn icon @click="filtersExpanded = !filtersExpanded">
                <v-icon>{{ filtersExpanded ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
              </v-btn>
            </v-card-title>

            <v-expand-transition>
              <div v-show="filtersExpanded">
                <v-divider></v-divider>
                <v-card-text>
                  <v-row>
                    <v-col cols="12" md="4">
                      <v-select
                          v-model="filterType"
                          :items="filterOptions"
                          label="Filter by type"
                          outlined
                          dense
                      ></v-select>
                    </v-col>
                    <v-col cols="12" md="4">
                      <v-select
                          v-model="sortBy"
                          :items="sortOptions"
                          label="Sort by"
                          outlined
                          dense
                      ></v-select>
                    </v-col>
                    <v-col cols="12" md="4" class="d-flex align-center">
                      <v-checkbox
                          v-model="showReadNotifications"
                          label="Show read notifications"
                          hide-details
                      ></v-checkbox>
                    </v-col>
                  </v-row>
                </v-card-text>
              </div>
            </v-expand-transition>
          </v-card>

          <!-- Email Notification Settings -->
          <v-card class="mb-6">
            <v-card-title class="d-flex justify-space-between py-2">
              <span>Email Notification Settings</span>
              <v-btn icon @click="emailSettingsExpanded = !emailSettingsExpanded">
                <v-icon>{{ emailSettingsExpanded ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
              </v-btn>
            </v-card-title>

            <v-expand-transition>
              <div v-show="emailSettingsExpanded">
                <v-divider></v-divider>
                <v-card-text>
                  <v-form ref="emailSettingsForm" v-model="emailSettingsValid">
                    <v-row>
                      <v-col cols="12" md="6">
                        <v-text-field
                            v-model="emailSettings.email"
                            label="Email address"
                            placeholder="Enter your email address"
                            outlined
                            dense
                            :rules="[v => !!v || 'Email is required', v => /.+@.+\..+/.test(v) || 'Email must be valid']"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-select
                            v-model="emailSettings.notificationType"
                            :items="notificationTypeOptions"
                            label="Notification type"
                            outlined
                            dense
                        ></v-select>
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-slider
                            v-model="emailSettings.days"
                            label="Days before expiry"
                            min="1"
                            max="30"
                            thumb-label="always"
                            dense
                        ></v-slider>
                      </v-col>
                      <v-col cols="12" md="6" class="d-flex align-center justify-end">
                        <v-btn color="primary" @click="saveEmailSettings" :disabled="!emailSettingsValid">
                          Save Settings
                        </v-btn>
                      </v-col>
                    </v-row>
                  </v-form>
                </v-card-text>
              </div>
            </v-expand-transition>
          </v-card>

          <!-- Current Email Notification Settings -->
          <v-card class="mb-6" v-if="savedEmailSettings.length > 0">
            <v-card-title>Your Email Notification Settings</v-card-title>
            <v-card-text>
              <v-simple-table>
                <template v-slot:default>
                  <thead>
                  <tr>
                    <th>Email</th>
                    <th>Notification Type</th>
                    <th>Days Before Expiry</th>
                    <th>Actions</th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr v-for="(setting, index) in savedEmailSettings" :key="index">
                    <td>{{ setting.email }}</td>
                    <td>{{ setting.notificationType }}</td>
                    <td>{{ setting.days }} days</td>
                    <td>
                      <v-btn small icon color="error" @click="removeEmailSetting(index)">
                        <v-icon small>mdi-delete</v-icon>
                      </v-btn>
                    </td>
                  </tr>
                  </tbody>
                </template>
              </v-simple-table>
            </v-card-text>
          </v-card>

          <!-- Notifications List -->
          <v-card>
            <v-card-text v-if="filteredNotifications.length === 0" class="text-center py-8">
              <v-icon size="64" color="grey lighten-1">mdi-bell-off-outline</v-icon>
              <div class="text-h6 mt-4 text-grey">No notifications found</div>
            </v-card-text>

            <v-list v-else two-line>
              <v-list-item
                  v-for="notification in filteredNotifications"
                  :key="notification.id"
                  @click="openNotificationModal(notification)"
                  :class="{'unread-notification': !notification.read}"
              >
                <v-list-item-avatar>
                  <v-icon :color="getNotificationColor(notification.type)">{{ getNotificationIcon(notification.type) }}</v-icon>
                </v-list-item-avatar>

                <v-list-item-content>
                  <v-list-item-title class="font-weight-medium">{{ notification.title }}</v-list-item-title>
                  <v-list-item-subtitle>{{ notification.shortDescription }}</v-list-item-subtitle>
                  <div class="d-flex mt-1">
                    <v-chip x-small :color="getNotificationColor(notification.type)" text-color="white" class="mr-2">
                      {{ notification.type }}
                    </v-chip>
                    <span class="text-caption text-grey">{{ formatDate(notification.timestamp) }}</span>
                  </div>
                </v-list-item-content>

                <v-list-item-action>
                  <v-btn icon @click.stop="markAsRead(notification)" v-if="!notification.read">
                    <v-icon small>mdi-email-mark-as-unread</v-icon>
                  </v-btn>
                </v-list-item-action>
              </v-list-item>

              <v-divider v-if="filteredNotifications.length > 0"></v-divider>

              <!-- Pagination -->
              <div class="d-flex justify-center pa-4">
                <v-pagination
                    v-model="page"
                    :length="totalPages"
                    :total-visible="7"
                ></v-pagination>
              </div>
            </v-list>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Notification Detail Modal -->
    <v-dialog v-model="notificationModalOpen" max-width="600">
      <v-card v-if="selectedNotification">
        <v-card-title class="d-flex justify-space-between">
          <div>
            <v-chip small :color="getNotificationColor(selectedNotification.type)" text-color="white" class="mr-2">
              {{ selectedNotification.type }}
            </v-chip>
            {{ selectedNotification.title }}
          </div>
          <v-btn icon @click="notificationModalOpen = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text>
          <div class="text-caption mb-4">
            {{ formatDate(selectedNotification.timestamp) }}
          </div>

          <div v-html="selectedNotification.content"></div>

          <div v-if="selectedNotification.attachmentId" class="mt-4">
            <v-divider class="mb-4"></v-divider>
            <div class="d-flex align-center">
              <v-icon class="mr-2">mdi-paperclip</v-icon>
              <span>Related Attachment: <strong>{{ selectedNotification.attachmentId }}</strong></span>
              <v-btn small text color="primary" class="ml-2" @click="viewAttachment(selectedNotification.attachmentId)">
                View Attachment
              </v-btn>
            </div>
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
              color="primary"
              text
              @click="markAsRead(selectedNotification); notificationModalOpen = false"
          >
            Mark as read
          </v-btn>
          <v-btn
              color="primary"
              @click="notificationModalOpen = false"
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Success Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
      {{ snackbar.text }}
      <template v-slot:action="{ attrs }">
        <v-btn text v-bind="attrs" @click="snackbar.show = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup>
// Import necessary Vue functions and store
import {ref, computed, onMounted, watch} from "vue";
import { useNotificationStore } from '../stores/notificationStore';

// Initialize the notification store
const notificationStore = useNotificationStore();

// State variables
const filterType = ref('all');
const sortBy = ref('newest');
const showReadNotifications = ref(true);
const page = ref(1);
const itemsPerPage = ref(10);
const notificationModalOpen = ref(false);
const selectedNotification = ref(null);

// Collapsible filters state
const filtersExpanded = ref(true);
const emailSettingsExpanded = ref(false);

// Email notification settings
const emailSettingsForm = ref(null);
const emailSettingsValid = ref(false);
const emailSettings = ref({
  email: '',
  days: 7,
  notificationType: 'all'
});
const savedEmailSettings = ref([]);

// Snackbar
const snackbar = ref({
  show: false,
  text: '',
  color: 'success'
});

// Define filter and sort options
const filterOptions = [
  { text: 'All notifications', value: 'all' },
  { text: 'Expiry', value: 'expiry' },
  { text: 'System', value: 'system' },
  { text: 'Update', value: 'update' }
];

const sortOptions = [
  { text: 'Newest first', value: 'newest' },
  { text: 'Oldest first', value: 'oldest' },
  { text: 'Priority (high to low)', value: 'priority-desc' },
  { text: 'Priority (low to high)', value: 'priority-asc' }
];

const notificationTypeOptions = [
  { text: 'All notifications', value: 'all' },
  { text: 'Expiry notifications only', value: 'expiry' },
  { text: 'System notifications only', value: 'system' },
  { text: 'Update notifications only', value: 'update' }
];

// Get notifications from the store
const notifications = computed(() => notificationStore.notifications);

// Computed properties
const filteredNotifications = computed(() => {
  return notificationStore.getFilteredNotifications(
      filterType.value,
      sortBy.value,
      showReadNotifications.value,
      page.value,
      itemsPerPage.value
  );
});

const totalPages = computed(() => {
  return notificationStore.getTotalPages(
      filterType.value,
      showReadNotifications.value,
      itemsPerPage.value
  );
});

// Methods
const formatDate = (date) => {
  if (!date) return '';

  const now = new Date();
  const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24));

  if (diff === 0) {
    return 'Today, ' + date.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
  } else if (diff === 1) {
    return 'Yesterday, ' + date.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
  } else if (diff < 7) {
    return diff + ' days ago';
  } else {
    return date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
  }
};

const getNotificationColor = (type) => {
  switch (type) {
    case 'expiry': return 'error';
    case 'system': return 'info';
    case 'update': return 'success';
    default: return 'primary';
  }
};

const getNotificationIcon = (type) => {
  switch (type) {
    case 'expiry': return 'mdi-alert-circle-outline';
    case 'system': return 'mdi-information-outline';
    case 'update': return 'mdi-file-document-outline';
    default: return 'mdi-bell-outline';
  }
};

const openNotificationModal = (notification) => {
  selectedNotification.value = notification;
  notificationModalOpen.value = true;
};

const markAsRead = (notification) => {
  notificationStore.markAsRead(notification.id);
};

const viewAttachment = (attachmentId) => {
  console.log('View attachment:', attachmentId);
  // In a real app, you would navigate to the attachment detail page
  // or open it in a viewer
  alert(`Opening attachment: ${attachmentId}`);
};

// Email notification settings methods
const saveEmailSettings = () => {
  if (emailSettingsForm.value.validate()) {
    savedEmailSettings.value.push({...emailSettings.value});

    // In a real app, you would send this to the server
    console.log('Saved email notification setting:', emailSettings.value);

    // Reset form
    emailSettings.value = {
      email: '',
      days: 7,
      notificationType: 'all'
    };

    // Show success message
    snackbar.value = {
      show: true,
      text: 'Email notification settings saved successfully!',
      color: 'success'
    };
  }
};

const removeEmailSetting = (index) => {
  savedEmailSettings.value.splice(index, 1);

  // Show success message
  snackbar.value = {
    show: true,
    text: 'Email notification setting removed',
    color: 'info'
  };
};

// Load saved settings from localStorage on component mount
onMounted(() => {
  const savedSettings = localStorage.getItem('emailNotificationSettings');
  if (savedSettings) {
    try {
      savedEmailSettings.value = JSON.parse(savedSettings);
    } catch (e) {
      console.error('Error loading saved email settings:', e);
    }
  }
});

// Save settings to localStorage when they change
watch(savedEmailSettings, (newValue) => {
  localStorage.setItem('emailNotificationSettings', JSON.stringify(newValue));
}, { deep: true });
</script>

<style scoped>
.unread-notification {
  background-color: #f5f9ff;
  font-weight: 500;
}

.v-list-item:hover {
  background-color: #f5f5f5;
  cursor: pointer;
}
</style>