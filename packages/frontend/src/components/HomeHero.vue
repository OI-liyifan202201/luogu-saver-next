<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { NIcon, NInput, NButton } from 'naive-ui';
import { IconSearch, IconNewspaper, IconGlobe } from '@/utils/icons';
import LuoguLogo from '@/components/icons/LuoguLogo.vue';

const searchText = ref('');
const router = useRouter();

const features = [
    { icon: IconNewspaper, title: '内容归档', desc: '文章与剪贴板长期保存，原文删除后仍可访问' },
    { icon: IconSearch, title: '全文检索', desc: '按标题、正文、作者快速定位已保存内容' },
    { icon: IconGlobe, title: '文章广场', desc: '浏览社区最新收录与个性化推荐' }
];

function parsePathLikeInput(input: string) {
    try {
        return new URL(input).pathname;
    } catch {
        if (/^(?:www\.)?luogu\.com(?:\.cn)?\//i.test(input)) {
            return new URL(`https://${input}`).pathname;
        }
        return input.startsWith('/') ? input : '';
    }
}

const handleSearch = () => {
    const query = searchText.value.trim();
    if (!query) return;

    const path = parsePathLikeInput(query);
    const articlePathMatch = path.match(/^\/article\/([A-Za-z0-9_-]+)\/?$/);
    if (articlePathMatch?.[1]) {
        router.push(`/article/${articlePathMatch[1]}`);
        return;
    }

    const pastePathMatch = path.match(/^\/paste\/([A-Za-z0-9_-]+)\/?$/);
    if (pastePathMatch?.[1]) {
        router.push(`/paste/${pastePathMatch[1]}`);
        return;
    }

    const userPathMatch = path.match(/^\/user\/(\d+)\/?$/);
    if (userPathMatch?.[1]) {
        router.push(`/user/${userPathMatch[1]}`);
        return;
    }

    const explicitArticleMatch = query.match(/^article\s*[:：]\s*([A-Za-z0-9_-]+)$/i);
    if (explicitArticleMatch?.[1]) {
        router.push(`/article/${explicitArticleMatch[1]}`);
        return;
    }

    const explicitPasteMatch = query.match(/^paste\s*[:：]\s*([A-Za-z0-9_-]+)$/i);
    if (explicitPasteMatch?.[1]) {
        router.push(`/paste/${explicitPasteMatch[1]}`);
        return;
    }

    const explicitUserMatch = query.match(/^(?:user|uid|用户)\s*[:：]\s*(\d+)$/i);
    if (explicitUserMatch?.[1]) {
        router.push(`/user/${explicitUserMatch[1]}`);
        return;
    }

    const numericUidMatch = query.match(/^[1-9]\d*$/);
    if (numericUidMatch) {
        router.push(`/user/${query}`);
        return;
    }

    const articleIdMatch = query.match(/^([A-Za-z0-9]{8})$/);
    if (articleIdMatch?.[1]) {
        router.push(`/article/${articleIdMatch[1]}`);
        return;
    }

    router.push({ path: '/search', query: { q: query } });
};
</script>

<template>
    <section class="hero-section" aria-labelledby="hero-title">
        <div class="hero-brand">
            <n-icon class="hero-logo" size="44" :component="LuoguLogo" aria-hidden="true" />
            <h1 id="hero-title" class="hero-title">洛谷保存站</h1>
        </div>
        <p class="hero-subtitle">Save everything, keep it alive.</p>

        <div class="hero-search">
            <n-input
                v-model:value="searchText"
                class="hero-input"
                size="large"
                placeholder="输入链接、文章 ID、关键词或作者用户名"
                aria-label="搜索已保存内容"
                clearable
                @keydown.enter="handleSearch"
            >
                <template #prefix>
                    <n-icon :component="IconSearch" class="search-icon" />
                </template>
            </n-input>
            <n-button
                secondary
                type="primary"
                size="large"
                class="search-button"
                aria-label="搜索"
                @click="handleSearch"
            >
                查看
            </n-button>
        </div>

        <ul class="hero-features">
            <li v-for="feature in features" :key="feature.title" class="feature-item">
                <div class="feature-icon" aria-hidden="true">
                    <n-icon :component="feature.icon" size="18" />
                </div>
                <div class="feature-text">
                    <span class="feature-title">{{ feature.title }}</span>
                    <span class="feature-desc">{{ feature.desc }}</span>
                </div>
            </li>
        </ul>
    </section>
</template>

<style scoped>
.hero-section {
    max-width: 720px;
    margin: 0 auto;
    padding: clamp(32px, 6vh, 72px) 16px 0;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
}

.hero-brand {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 10px;
}

.hero-logo {
    color: var(--ui-primary-color);
}

.hero-title {
    margin: 0;
    font-size: clamp(32px, 4.5vw, 44px);
    font-weight: 700;
    line-height: 1.15;
    color: var(--ui-card-title-color);
}

.hero-subtitle {
    margin: 0 0 28px;
    font-size: 16px;
    line-height: 1.7;
    color: var(--ui-secondary-text-color);
}

.hero-search {
    width: 100%;
    display: flex;
    gap: 10px;
}

.hero-input {
    flex: 1;
}

.hero-input :deep(.n-input__input-el) {
    height: 44px;
}

.search-icon {
    color: var(--ui-muted-text-color);
}

/* The input's visible fill is inset by its 1px border; mirror that inset with
   a transparent border so both controls paint the same 42px visual height. */
.search-button {
    flex-shrink: 0;
    height: 44px;
    border: 1px solid transparent;
    background-clip: padding-box;
}

.hero-features {
    list-style: none;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    width: 100%;
    margin: 36px 0 0;
    padding: 0;
}

.feature-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 14px 16px;
    text-align: left;
    background: var(--ui-card-color);
    border: 1px solid var(--ui-border-color);
    border-radius: var(--ui-card-radius);
}

.feature-icon {
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

.feature-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
}

.feature-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--ui-card-title-color);
}

.feature-desc {
    font-size: 12px;
    line-height: 1.6;
    color: var(--ui-muted-text-color);
    text-wrap: pretty;
}

@media (max-width: 720px) {
    .hero-features {
        grid-template-columns: 1fr;
    }

    .hero-subtitle {
        font-size: 15px;
    }
}
</style>
