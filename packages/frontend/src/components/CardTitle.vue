<script setup lang="ts">
import { computed, inject, type Component, type Ref } from 'vue';
import { NIcon } from 'naive-ui';
import { uiThemeKey, type UiThemeVars } from '@/styles/theme/themeKeys.ts';

const themeVars: Ref<UiThemeVars> = inject(uiThemeKey)!;

const props = defineProps({
    title: {
        type: String,
        required: true
    },
    icon: {
        type: Object as () => Component,
        default: null
    },
    backgroundColor: {
        type: String,
        default: null
    },
    iconColor: {
        type: String,
        default: null
    },
    textColor: {
        type: String,
        default: null
    },
    chip: {
        type: String,
        default: null
    }
});

const effectiveIconColor = computed(() => props.iconColor || themeVars.value.primaryColor);
const effectiveTextColor = computed(() => props.textColor || themeVars.value.cardTitleColor);
const effectiveBackground = computed(() => props.backgroundColor || themeVars.value.cardColor);
</script>

<template>
    <header class="page-header" :style="{ background: effectiveBackground }">
        <div class="header-main">
            <div v-if="icon" class="icon-frame" aria-hidden="true">
                <n-icon :component="icon" :color="effectiveIconColor" size="22" />
            </div>
            <div class="header-text">
                <h1 class="title" :style="{ color: effectiveTextColor }">{{ title }}</h1>
                <p class="subtitle">
                    <slot />
                </p>
            </div>
        </div>
        <span v-if="chip" class="header-chip">{{ chip }}</span>
    </header>
</template>

<style scoped>
.page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 20px 24px;
    border: 1px solid var(--ui-border-color);
    border-radius: var(--ui-card-radius);
    box-shadow: var(--ui-card-shadow);
}

.header-main {
    display: flex;
    align-items: center;
    gap: 14px;
    min-width: 0;
}

.icon-frame {
    width: 44px;
    height: 44px;
    flex-shrink: 0;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--ui-panel-color);
}

.header-text {
    min-width: 0;
}

.title {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    line-height: 1.3;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.subtitle {
    margin: 2px 0 0;
    color: var(--ui-muted-text-color);
    font-size: 13px;
    line-height: 1.6;
}

.subtitle:empty {
    display: none;
}

.header-chip {
    flex-shrink: 0;
    color: var(--ui-muted-text-color);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
}

@media (max-width: 720px) {
    .page-header {
        padding: 16px 20px;
    }

    .header-chip {
        display: none;
    }
}
</style>
