<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { NAlert, NButton, NCard, NModal } from 'naive-ui';
import {
    getCurrentNotifications,
    markNotificationRead,
    type CurrentNotificationsResponse,
    type SiteNotificationItem
} from '@/api/notification';
import { authToken, isAuthenticated } from '@/utils/auth';
import { NOTIFICATION_READ_STORAGE_KEY } from '@/utils/constants';

type LocalReadState = Record<string, string>;

const notifications = ref<CurrentNotificationsResponse>({ banners: [], popups: [] });
const popupVisible = ref(false);
const activePopupIndex = ref(0);
const loading = ref(false);

const visibleBanners = computed(() => notifications.value.banners.filter(item => !isRead(item)));

const visiblePopups = computed(() => notifications.value.popups.filter(item => !isRead(item)));

const visiblePopup = computed(() => {
    return visiblePopups.value[activePopupIndex.value] ?? visiblePopups.value[0] ?? null;
});

const popupPositionText = computed(() => {
    if (visiblePopups.value.length <= 1) return '';
    return `${activePopupIndex.value + 1} / ${visiblePopups.value.length}`;
});

function readLocalState(): LocalReadState {
    try {
        const raw = localStorage.getItem(NOTIFICATION_READ_STORAGE_KEY);
        if (!raw) return {};
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
        return {};
    }
}

function writeLocalState(state: LocalReadState) {
    localStorage.setItem(NOTIFICATION_READ_STORAGE_KEY, JSON.stringify(state));
}

function markLocalRead(item: SiteNotificationItem) {
    const state = readLocalState();
    state[String(item.id)] = item.updatedAt;
    writeLocalState(state);
}

function isLocalRead(item: SiteNotificationItem) {
    return readLocalState()[String(item.id)] === item.updatedAt;
}

function isRead(item: SiteNotificationItem) {
    return item.read || isLocalRead(item);
}

async function syncLocalAndRemoteReadState() {
    const items = [...notifications.value.banners, ...notifications.value.popups];

    for (const item of items) {
        if (item.read) {
            markLocalRead(item);
            continue;
        }

        if (isAuthenticated.value && isLocalRead(item)) {
            const response = await markNotificationRead(item.id, item.updatedAt);
            if (response.code === 200) {
                item.read = true;
                markLocalRead(item);
            }
        }
    }
}

async function loadNotifications() {
    if (loading.value) return;
    loading.value = true;
    try {
        const response = await getCurrentNotifications();
        if (response.code !== 200 || !response.data) return;
        notifications.value = {
            banners: response.data.banners ?? [],
            popups: response.data.popups ?? []
        };
        await syncLocalAndRemoteReadState();
        clampActivePopupIndex();
        popupVisible.value = visiblePopups.value.length > 0;
    } finally {
        loading.value = false;
    }
}

function clampActivePopupIndex() {
    activePopupIndex.value = Math.min(
        activePopupIndex.value,
        Math.max(visiblePopups.value.length - 1, 0)
    );
}

function showPreviousPopup() {
    if (activePopupIndex.value <= 0) return;
    activePopupIndex.value -= 1;
}

function showNextPopup() {
    if (activePopupIndex.value >= visiblePopups.value.length - 1) return;
    activePopupIndex.value += 1;
}

async function dismissNotification(item: SiteNotificationItem) {
    markLocalRead(item);
    item.read = true;
    if (item.channel === 'popup') {
        clampActivePopupIndex();
        popupVisible.value = visiblePopups.value.length > 0;
    }

    if (!isAuthenticated.value) return;

    const response = await markNotificationRead(item.id, item.updatedAt);
    if (response.code === 409) {
        await loadNotifications();
    }
}

function handlePopupShowChange(show: boolean) {
    if (show) {
        popupVisible.value = true;
        return;
    }

    const item = visiblePopup.value;
    if (!item) {
        popupVisible.value = false;
        return;
    }

    void dismissNotification(item);
}

watch(authToken, () => {
    void loadNotifications();
});

watch(visiblePopups, () => {
    clampActivePopupIndex();
    if (popupVisible.value && visiblePopups.value.length === 0) {
        popupVisible.value = false;
    }
});

onMounted(() => {
    void loadNotifications();
});
</script>

<template>
    <div v-if="visibleBanners.length > 0" class="site-notification-banners">
        <n-alert
            v-for="item in visibleBanners"
            :key="item.id"
            type="info"
            :title="item.title"
            :bordered="true"
            closable
            @close="dismissNotification(item)"
        >
            <!-- Admin-managed HTML notification content. -->
            <!-- eslint-disable-next-line vue/no-v-html -->
            <div class="notification-html" v-html="item.content"></div>
        </n-alert>
    </div>

    <n-modal :show="popupVisible" @update:show="handlePopupShowChange">
        <n-card
            v-if="visiblePopup"
            :bordered="false"
            role="dialog"
            aria-modal="true"
            :title="visiblePopup.title"
            :style="{ width: 'min(560px, calc(100vw - 32px))' }"
        >
            <!-- Admin-managed HTML notification content. -->
            <!-- eslint-disable-next-line vue/no-v-html -->
            <div class="notification-html popup-content" v-html="visiblePopup.content"></div>
            <template #footer>
                <div class="popup-actions">
                    <div v-if="visiblePopups.length > 1" class="popup-switcher">
                        <n-button
                            size="small"
                            :disabled="activePopupIndex === 0"
                            @click="showPreviousPopup"
                        >
                            上一条
                        </n-button>
                        <span class="popup-index">{{ popupPositionText }}</span>
                        <n-button
                            size="small"
                            :disabled="activePopupIndex >= visiblePopups.length - 1"
                            @click="showNextPopup"
                        >
                            下一条
                        </n-button>
                    </div>
                    <n-button type="primary" @click="dismissNotification(visiblePopup)">
                        知道了
                    </n-button>
                </div>
            </template>
        </n-card>
    </n-modal>
</template>

<style scoped>
.site-notification-banners {
    position: fixed;
    top: max(12px, env(safe-area-inset-top));
    left: 50%;
    z-index: 1600;
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: min(960px, calc(100vw - 32px));
    max-height: calc(100vh - 24px);
    overflow: auto;
    pointer-events: none;
    transform: translateX(-50%);
}

.site-notification-banners > :deep(.n-alert) {
    background: color-mix(in srgb, var(--ui-info-color) 18%, var(--ui-card-color)) !important;
    pointer-events: auto;
    box-shadow: var(--ui-elevated-shadow);
}

.notification-html {
    line-height: 1.7;
    color: var(--ui-text-color);
}

.notification-html :deep(p:first-child) {
    margin-top: 0;
}

.notification-html :deep(p:last-child) {
    margin-bottom: 0;
}

.notification-html :deep(a) {
    color: var(--ui-link-color);
    text-decoration: none;
}

.notification-html :deep(a:hover) {
    color: var(--ui-link-hover-color);
}

.popup-content {
    max-height: min(58vh, 520px);
    overflow: auto;
}

.popup-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
}

.popup-switcher {
    display: flex;
    align-items: center;
    gap: 8px;
}

.popup-index {
    min-width: 48px;
    color: var(--ui-secondary-text-color);
    font-size: 13px;
    text-align: center;
    white-space: nowrap;
}
</style>
