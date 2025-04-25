<template>
  <v-app>
    <v-layout>

      <v-app-bar color="primary" dark elevation="2">
        <v-app-bar-title>IPCOM Attachment Expiry System</v-app-bar-title>

        <v-spacer></v-spacer>

        <v-btn
            class="mr-2"
            variant="text"
            to="/dashboard"
            :active="currentRoute === '/dashboard'"
            @click="currentRoute = '/dashboard'"
        >
          <v-icon class="mr-1">mdi-view-dashboard</v-icon>
          DASHBOARD
        </v-btn>

        <v-btn class="mr-2" icon @click="goToNotifications">
          <v-badge
              :content="notificationCount"
              :model-value="notificationCount > 0"
              color="error"
          >
            <v-icon>mdi-bell-outline</v-icon>
          </v-badge>
        </v-btn>

        <v-menu offset-y>
          <template v-slot:activator="{ props }">
            <v-btn
                class="mr-3"
                icon
                v-bind="props"
            >
              <v-icon>mdi-account-circle</v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item @click="handleLogout">
              <template v-slot:prepend>
                <v-icon>mdi-logout</v-icon>
              </template>
              <v-list-item-title>Logout</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>

        <div class="date-circle d-flex align-center justify-center">
          {{ currentDate }}
        </div>
      </v-app-bar>

      <v-main>

        <v-alert
            v-if="authError"
            type="error"
            closable
            class="ma-3"
            @click:close="authError = null"
        >
          {{ authError }}
          <v-btn @click="microsoftLogin" color="white" class="ml-2" size="small">
            Retry
          </v-btn>
        </v-alert>


        <v-container v-if="isAuthenticated">
          <router-view></router-view>
        </v-container>

        <v-container v-else class="d-flex flex-column align-center justify-center" style="height: 80vh">
          <v-icon size="64" color="primary" class="mb-4">mdi-account-lock</v-icon>
          <h2 class="text-h4 mb-4">Authentication Required</h2>
          <p class="text-body-1 text-center mb-6">Please log in with your Microsoft account to access the application.</p>
          <v-btn color="primary" size="large" @click="microsoftLogin">
            <v-icon left>mdi-microsoft</v-icon>
            Login with Microsoft
          </v-btn>
        </v-container>
      </v-main>
    </v-layout>
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useNotificationStore } from './stores/notificationStore';
import AuthService from "@/auth/authService.js";

const router = useRouter();
const route = useRoute();
const notificationStore = useNotificationStore();
const isAuthenticated = ref(false)
const authError = ref(null)
const isLoading = ref(true)

const currentRoute = ref('/dashboard');

const notificationCount = computed(() => {
  return notificationStore.unreadCount;
});

watch(
    () => route.path,
    (newPath) => {
      currentRoute.value = newPath;
    },
    { immediate: true }
);

const currentDate = computed(() => {
  const date = new Date();
  return date.toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
});

const goToNotifications = () => {
  router.push('/notifications');
  currentRoute.value = '/notifications';
};

const microsoftLogin = async () => {
  try {
    authError.value = null;
    await AuthService.login();

  } catch (error) {
    authError.value = 'Failed to login. Please try again.';
  }
}

const checkAuthentication = async () => {
  try {
    isLoading.value = true;

    await AuthService.initialize();


    const response = await AuthService.handleRedirectPromise();

    if (response) {

      isAuthenticated.value = true;
    } else {

      isAuthenticated.value = await AuthService.isAuthenticated();
    }

    isLoading.value = false;
  } catch (error) {
    authError.value = "Failed to check authentication status. Please try again.";
    isAuthenticated.value = false;
    isLoading.value = false;
  }
}

const handleLogout = async () => {
  try {
    await AuthService.logout();
    isAuthenticated.value = false;
  } catch (error) {
    authError.value = "Failed to logout. Please try again.";
  }
}


onMounted(async () => {

  await checkAuthentication();
})
</script>

<style scoped>
.date-circle {
  font-size: 0.8rem;
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  padding: 6px 14px;
  color: white;
  white-space: nowrap;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
</style>