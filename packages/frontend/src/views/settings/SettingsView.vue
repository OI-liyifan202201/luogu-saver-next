<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { NAlert, NButton, NCard, NSpace, NSpin, NTag } from 'naive-ui';
import { clearAuthToken, isAuthenticated, startCpOAuthLogin } from '@/utils/auth.ts';
import { getCurrentUser, type AuthMeResponse } from '@/api/auth.ts';

const loading = ref(false);
const currentUser = ref<AuthMeResponse | null>(null);
const errorMessage = ref('');

async function loadCurrentUser() {
    if (!isAuthenticated.value) return;

    loading.value = true;
    errorMessage.value = '';
    try {
        const response = await getCurrentUser();
        if (response.code === 200) {
            currentUser.value = response.data;
        } else {
            errorMessage.value = response.message;
        }
    } catch (error) {
        errorMessage.value = error instanceof Error ? error.message : '加载用户信息失败';
    } finally {
        loading.value = false;
    }
}

function handleLogout() {
    clearAuthToken();
    currentUser.value = null;
}

onMounted(loadCurrentUser);
</script>

<template>
    <n-card title="账号设置">
        <n-space vertical size="large">
            <n-alert v-if="errorMessage" type="warning" title="账号状态">
                {{ errorMessage }}
            </n-alert>

            <div v-if="loading" class="loading-state">
                <n-spin size="small" />
                <span>正在加载账号信息...</span>
            </div>

            <template v-else-if="isAuthenticated && currentUser">
                <div class="account-row">
                    <div>
                        <div class="account-name">
                            {{ currentUser.user?.name || `用户 ${currentUser.uid}` }}
                        </div>
                        <div class="account-meta">Luogu UID: {{ currentUser.uid }}</div>
                    </div>
                    <n-tag type="success">已登录</n-tag>
                </div>
                <n-button secondary @click="handleLogout">退出登录</n-button>
            </template>

            <template v-else>
                <div class="account-meta">使用 CP OAuth 登录，并绑定你的洛谷账号。</div>
                <n-button type="primary" @click="startCpOAuthLogin('/settings')">
                    使用 CP OAuth 登录
                </n-button>
            </template>
        </n-space>
    </n-card>
</template>

<style scoped>
.loading-state,
.account-row {
    display: flex;
    align-items: center;
    gap: 12px;
}

.account-row {
    justify-content: space-between;
}

.account-name {
    font-size: 18px;
    font-weight: 600;
}

.account-meta {
    color: #666;
}
</style>
