<template>
  <v-app>
    <v-layout>
      <!-- Simplified App Bar -->
      <v-app-bar color="primary" dark elevation="2">
        <v-app-bar-title>IPCOM Attachment Expiry System</v-app-bar-title>

        <v-spacer></v-spacer>

        <!-- Dashboard Button -->
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

        <!-- Notification Bell with Badge -->
        <v-btn class="mr-2" icon>
          <v-badge
              :content="notificationCount"
              :model-value="notificationCount > 0"
              color="error"
          >
            <v-icon>mdi-bell-outline</v-icon>
          </v-badge>
        </v-btn>

        <!-- User Menu -->
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
            <v-list-item @click="logout">
              <template v-slot:prepend>
                <v-icon>mdi-logout</v-icon>
              </template>
              <v-list-item-title>Logout</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>

        <!-- Date Display in Circle -->
        <div class="date-circle d-flex align-center justify-center">
          {{ currentDate }}
        </div>
      </v-app-bar>

      <!-- Main Content -->
      <v-main>
        <router-view />
      </v-main>
    </v-layout>
  </v-app>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const currentRoute = ref('/dashboard');
const notificationCount = ref(3); // Example notification count

const currentDate = computed(() => {
  const date = new Date();
  return date.toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
});


const logout = () => {
  // Handle logout functionality
  console.log('Logging out...');
  // router.push('/login');
};
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