<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { NIcon } from 'naive-ui';
import { IconNewspaper, IconClipboard, IconMegaphone } from '@/utils/icons';
import { getArticleCount } from '@/api/article.ts';
import { getPasteCount } from '@/api/paste.ts';
import { getCurrentAnnouncement, type Announcement } from '@/api/announcement.ts';
import HomeHero from '@/components/HomeHero.vue';
import Card from '@/components/Card.vue';

const articleCount = ref(0);
const pasteCount = ref(0);
const announcement = ref<Announcement | null>(null);

onMounted(async () => {
    getArticleCount().then(res => (articleCount.value = res.data.count));
    getPasteCount().then(res => (pasteCount.value = res.data.count));
    getCurrentAnnouncement().then(res => (announcement.value = res.data));
});
</script>

<template>
    <div class="home-container">
        <HomeHero />

        <div class="main-content">
            <Card
                :title="announcement?.title || '公告'"
                :icon="IconMegaphone"
                class="announcement-card"
            >
                <div
                    v-if="announcement"
                    class="announcement-content"
                    v-html="announcement.content"
                ></div>
                <p v-else class="announcement-empty">暂无公告</p>
            </Card>

            <div class="stats-row">
                <div class="stat-card">
                    <div class="stat-icon" aria-hidden="true">
                        <n-icon :component="IconNewspaper" size="18" />
                    </div>
                    <div class="stat-text">
                        <span class="stat-label">文章总数</span>
                        <span class="stat-value tabular-nums">{{
                            articleCount.toLocaleString()
                        }}</span>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon" aria-hidden="true">
                        <n-icon :component="IconClipboard" size="18" />
                    </div>
                    <div class="stat-text">
                        <span class="stat-label">剪贴板总数</span>
                        <span class="stat-value tabular-nums">{{
                            pasteCount.toLocaleString()
                        }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.home-container {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

/* Matches the hero column so the whole page reads as one centered axis. */
.main-content {
    width: 100%;
    max-width: 720px;
    margin: 0 auto;
    padding: 0 16px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.stats-row {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
}

/* Same visual family as the hero feature cards: icon chip + two-line text. */
.stat-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    background: var(--ui-card-color);
    border: 1px solid var(--ui-border-color);
    border-radius: var(--ui-card-radius);
}

.stat-icon {
    width: 32px;
    height: 32px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    background: var(--ui-panel-color);
    color: var(--ui-primary-color);
}

.stat-text {
    display: flex;
    flex-direction: column;
    min-width: 0;
}

.stat-label {
    font-size: 12px;
    line-height: 1.5;
    color: var(--ui-muted-text-color);
}

.stat-value {
    font-size: 18px;
    font-weight: 650;
    line-height: 1.3;
    color: var(--ui-card-title-color);
}

.announcement-content {
    font-size: 14px;
    line-height: 1.8;
    color: var(--ui-secondary-text-color);
}

.announcement-empty {
    margin: 0;
    font-size: 13px;
    line-height: 1.6;
    color: var(--ui-muted-text-color);
}

.announcement-content :deep(a) {
    color: var(--ui-link-color);
    text-decoration: none;
    transition: color 0.15s ease;
}

.announcement-content :deep(a:hover) {
    color: var(--ui-link-hover-color) !important;
}

@media (max-width: 480px) {
    .stats-row {
        grid-template-columns: minmax(0, 1fr);
    }
}
</style>
