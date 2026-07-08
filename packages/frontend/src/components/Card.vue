<script setup lang="ts">
import { type CSSProperties, inject, computed, type Component, useSlots, type Ref } from 'vue';
import { NIcon } from 'naive-ui';
import { uiThemeKey, type UiThemeVars } from '@/styles/theme/themeKeys.ts';

const themeVars: Ref<UiThemeVars> = inject(uiThemeKey)!;
const slots = useSlots();

const props = defineProps({
    title: {
        type: String,
        default: null
    },
    icon: {
        type: Object as () => Component,
        default: null
    },
    iconColor: {
        type: String,
        default: null
    },
    backgroundColor: {
        type: String,
        default: null
    },
    hoverable: {
        type: Boolean,
        default: false
    },
    titleHtml: {
        type: String,
        default: null
    }
});

const emit = defineEmits<{
    click: [event: MouseEvent];
}>();

const effectiveIconColor = computed(() => {
    return props.iconColor || themeVars.value.primaryColor;
});

const effectiveBackgroundColor = computed(() => {
    return props.backgroundColor || themeVars.value.cardColor;
});

const cardStyle = computed(
    (): CSSProperties => ({
        backgroundColor: effectiveBackgroundColor.value,
        boxShadow: themeVars.value.cardShadow,
        borderRadius: themeVars.value.cardRadius
    })
);

const showHeader = computed(() => {
    return !!props.title || !!props.titleHtml || !!slots['header-extra'];
});
</script>

<template>
    <div
        class="saver-card"
        :class="{ 'is-hoverable': hoverable }"
        :style="cardStyle"
        :role="hoverable ? 'button' : undefined"
        :tabindex="hoverable ? 0 : undefined"
        @click="event => emit('click', event)"
        @keydown.enter.self="event => emit('click', event as unknown as MouseEvent)"
        @keydown.space.self.prevent="event => emit('click', event as unknown as MouseEvent)"
    >
        <div v-if="showHeader" class="card-header">
            <div class="card-title-wrapper">
                <n-icon
                    v-if="icon"
                    :component="icon"
                    :color="effectiveIconColor"
                    size="18"
                    :depth="1"
                />
                <span
                    v-if="titleHtml"
                    class="card-title"
                    :style="{ color: themeVars.cardTitleColor }"
                    v-html="titleHtml"
                />
                <span
                    v-else-if="title"
                    class="card-title"
                    :style="{ color: themeVars.cardTitleColor }"
                >
                    {{ title }}
                </span>
                <slot name="title-extra" />
            </div>
            <div class="card-extra">
                <slot name="header-extra" />
            </div>
        </div>
        <div class="card-content">
            <slot />
        </div>
    </div>
</template>

<style scoped>
.saver-card {
    padding: 20px;
    border: 1px solid var(--ui-border-color);
    transition:
        border-color 0.15s ease,
        background-color 0.15s ease;
    display: flex;
    flex-direction: column;
}

.saver-card.is-hoverable {
    cursor: pointer;
}

.saver-card.is-hoverable:hover {
    border-color: var(--ui-control-border-hover-color);
}

.saver-card.is-hoverable:active {
    background-color: var(--ui-panel-color);
}

.saver-card.is-hoverable:focus-visible {
    outline: 2px solid var(--ui-primary-color);
    outline-offset: 2px;
}

.card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 14px;
}

.card-title-wrapper {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
}

.card-title-wrapper > .n-icon {
    width: 32px;
    height: 32px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border-radius: 8px;
    background: var(--ui-panel-color);
}

.card-title {
    font-weight: 600;
    font-size: 16px;
    line-height: 1.4;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.card-content {
    flex: 1;
}

:deep(mark) {
    padding: 0 2px;
    border-radius: 3px;
    background: var(--ui-panel-color);
    color: inherit;
}
</style>
