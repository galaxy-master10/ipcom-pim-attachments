// src/stores/notificationStore.js
import { defineStore } from 'pinia';

export const useNotificationStore = defineStore('notifications', {
    state: () => ({
        notifications: [
            {
                id: 1,
                type: 'expiry',
                title: 'Attachment about to expire',
                shortDescription: 'RWDOPBNL-802-001-01_english.pdf expires in 7 days',
                content: '<p>The attachment <strong>RWDOPBNL-802-001-01_english.pdf</strong> is set to expire on <strong>2034-03-23</strong>.</p><p>Please review this attachment and take appropriate action if needed.</p>',
                timestamp: new Date('2025-03-16T09:24:00'),
                read: false,
                priority: 'high',
                attachmentId: 'RWDOPBNL-802-001-01_english.pdf'
            },
            {
                id: 2,
                type: 'system',
                title: 'System maintenance',
                shortDescription: 'Scheduled maintenance on March 30, 2025',
                content: '<p>The system will be undergoing scheduled maintenance on <strong>March 30, 2025</strong> from 02:00 to 04:00 UTC.</p><p>During this time, the system may be unavailable or experience performance issues. Please plan accordingly.</p>',
                timestamp: new Date('2025-03-15T14:30:00'),
                read: true,
                priority: 'medium'
            },
            {
                id: 3,
                type: 'update',
                title: 'New attachment added',
                shortDescription: 'New attachment added: DoP ORYX Grafite FR_en.docx',
                content: '<p>A new attachment has been added to the system:</p><ul><li><strong>Name:</strong> DoP ORYX Grafite FR_en.docx</li><li><strong>Product:</strong> ORYX GRAFITE FR</li><li><strong>Added by:</strong> Jan Janssen</li></ul>',
                timestamp: new Date('2025-03-14T11:15:00'),
                read: false,
                priority: 'low',
                attachmentId: 'DoP ORYX Grafite FR_en.docx'
            },
            {
                id: 4,
                type: 'expiry',
                title: 'Multiple attachments expiring soon',
                shortDescription: '5 attachments will expire within 30 days',
                content: '<p>The following attachments are set to expire within the next 30 days:</p><ol><li>NEPD-4102-3121_PAROC-Stone-Wool-Thermal-Insulation--Marine-Slabs---Mats-(2).pdf - Expires on 2034-03-16</li><li>déclaration_de_performance_0543-CPR-2020-101_AF_ARMAFLEX_AF_EVO_FR.pdf - Expires on 2033-02-22</li><li>Leistungserklärung_03_20230320_EUROBATEX_HF_DE.pdf - Expires on 2032-09-24</li></ol>',
                timestamp: new Date('2025-03-13T08:45:00'),
                read: false,
                priority: 'high'
            },
            {
                id: 5,
                type: 'system',
                title: 'Account security',
                shortDescription: 'Security reminder: Update your password',
                content: '<p>As part of our security protocol, we recommend updating your password every 90 days.</p><p>Your password was last updated 85 days ago. Please consider updating it in the next 5 days.</p>',
                timestamp: new Date('2025-03-10T16:20:00'),
                read: true,
                priority: 'medium'
            }
        ]
    }),

    getters: {
        unreadCount: (state) => {
            return state.notifications.filter(notification => !notification.read).length;
        },

        getFilteredNotifications: (state) => (filter, sort, showRead, page = 1, itemsPerPage = 10) => {
            let filtered = [...state.notifications];

            // Apply type filter
            if (filter !== 'all') {
                filtered = filtered.filter(n => n.type === filter);
            }

            // Filter based on read status
            if (!showRead) {
                filtered = filtered.filter(n => !n.read);
            }

            // Apply sorting
            switch (sort) {
                case 'newest':
                    filtered.sort((a, b) => b.timestamp - a.timestamp);
                    break;
                case 'oldest':
                    filtered.sort((a, b) => a.timestamp - b.timestamp);
                    break;
                case 'priority-desc':
                    filtered.sort((a, b) => {
                        const priorityOrder = { high: 3, medium: 2, low: 1 };
                        return priorityOrder[b.priority] - priorityOrder[a.priority];
                    });
                    break;
                case 'priority-asc':
                    filtered.sort((a, b) => {
                        const priorityOrder = { high: 3, medium: 2, low: 1 };
                        return priorityOrder[a.priority] - priorityOrder[b.priority];
                    });
                    break;
            }

            // Calculate pagination
            const startIndex = (page - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;

            return filtered.slice(startIndex, endIndex);
        },

        getTotalPages: (state) => (filter, showRead, itemsPerPage) => {
            let filtered = [...state.notifications];

            // Apply type filter
            if (filter !== 'all') {
                filtered = filtered.filter(n => n.type === filter);
            }

            // Filter based on read status
            if (!showRead) {
                filtered = filtered.filter(n => !n.read);
            }

            return Math.ceil(filtered.length / itemsPerPage);
        }
    },

    actions: {
        markAsRead(notificationId) {
            const index = this.notifications.findIndex(n => n.id === notificationId);
            if (index !== -1) {
                this.notifications[index].read = true;
            }
        },

        markAllAsRead() {
            this.notifications.forEach(notification => {
                notification.read = true;
            });
        },

        addNotification(notification) {
            // Generate a new unique ID
            const newId = Math.max(...this.notifications.map(n => n.id), 0) + 1;

            this.notifications.push({
                id: newId,
                timestamp: new Date(),
                read: false,
                ...notification
            });
        },

        deleteNotification(notificationId) {
            const index = this.notifications.findIndex(n => n.id === notificationId);
            if (index !== -1) {
                this.notifications.splice(index, 1);
            }
        }
    }
});