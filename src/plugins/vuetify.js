// src/plugins/vuetify.js
import { createVuetify } from 'vuetify'
import 'vuetify/styles'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { md } from 'vuetify/iconsets/md'
import '@mdi/font/css/materialdesignicons.css'

const vuetify = createVuetify({
    components,
    directives,
    icons: {
        defaultSet: 'mdi',
    },
    theme: {
        defaultTheme: 'light',
        themes: {
            light: {
                colors: {
                    primary: '#1e3a8a',
                    secondary: '#3b82f6',
                    error: '#ef4444',
                    warning: '#f97316',
                    info: '#3b82f6',
                    success: '#22c55e'
                }
            }
        }
    }
})

export default vuetify