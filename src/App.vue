<template>
  <v-app>
    <v-layout>
      <!-- App Bar -->
      <v-app-bar color="primary" dark>
        <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
        <v-avatar color="white" size="32" class="mr-4 ml-2">
          <v-icon color="primary">mdi-link-variant</v-icon>
        </v-avatar>
        <v-app-bar-title>IPCOM Attachment Expiry System</v-app-bar-title>
        <v-spacer></v-spacer>
        <div>{{ currentDate }}</div>
      </v-app-bar>

      <!-- Navigation Drawer -->
      <v-navigation-drawer v-model="drawer" app>
        <v-list-subheader>NAVIGATIE</v-list-subheader>
        <v-list density="compact" nav>
          <v-list-item
              v-for="(item, i) in navigationItems"
              :key="i"
              :value="item.value"
              :to="item.to"
              :active="currentRoute === item.to"
              @click="currentRoute = item.to"
          >
            <template v-slot:prepend>
              <v-icon :icon="item.icon"></v-icon>
            </template>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-navigation-drawer>

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
const drawer = ref(false);
const currentRoute = ref('/dashboard');

const navigationItems = [
  { title: 'Dashboard', icon: 'mdi-view-dashboard', to: '/dashboard', value: 'dashboard' },
  { title: 'Producten', icon: 'mdi-package-variant-closed', to: '/products', value: 'products' },
  { title: 'Attachments', icon: 'mdi-attachment', to: '/attachments', value: 'attachments' },
  { title: 'Rapportages', icon: 'mdi-chart-box', to: '/reports', value: 'reports' },
  { title: 'Instellingen', icon: 'mdi-cog', to: '/settings', value: 'settings' }
];

const currentDate = computed(() => {
  const date = new Date();
  return date.toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
});
</script>