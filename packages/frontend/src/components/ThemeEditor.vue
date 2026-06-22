<script setup lang="ts">
import { computed, inject, ref } from 'vue';
import {
    NButton,
    NColorPicker,
    NDrawer,
    NDrawerContent,
    NForm,
    NFormItem,
    NIcon,
    NInput,
    NInputNumber,
    useMessage
} from 'naive-ui';
import { Settings } from '@vicons/ionicons5';
import { uiThemeKey } from '@/styles/theme/themeKeys.ts';
import { defaultTheme, darkTheme } from '@/styles/theme/default-theme.ts';

const uiTheme = inject(uiThemeKey);
const message = useMessage();

if (!uiTheme) {
    throw new Error('ThemeEditor 必须在 provider 内部使用');
}

const showDrawer = ref(false);

const radiusNumber = computed({
    get: () => Number.parseInt(uiTheme.value.cardRadius, 10) || 0,
    set: value => {
        uiTheme.value.cardRadius = `${value ?? 0}px`;
    }
});

const colorItems = [
  ['bodyColor', '页面背景色 (bodyColor)'],
  ['bodyGradientStart', '页面渐变起始色 (bodyGradientStart)'],
  ['bodyGradientEnd', '页面渐变结束色 (bodyGradientEnd)'],
  ['primaryColor', '主色 (primaryColor)'],
  ['primaryColorHover', '主色悬停色 (primaryColorHover)'],
  ['primaryColorPressed', '主色按压色 (primaryColorPressed)'],
  ['primaryColorSuppl', '补充主色 (primaryColorSuppl)'],
  ['cardColor', '卡片背景色 (cardColor)'],
  ['translucentCardColor', '半透明卡片背景色 (translucentCardColor)'],
  ['cardTitleColor', '卡片标题颜色 (cardTitleColor)'],
  ['textColor', '文本颜色 (textColor)'],
  ['secondaryTextColor', '次要文本颜色 (secondaryTextColor)'],
  ['mutedTextColor', '弱化文本颜色 (mutedTextColor)'],
  ['borderColor', '边框颜色 (borderColor)'],
  ['panelColor', '面板背景色 (panelColor)'],
  ['codeBackgroundColor', '代码背景色 (codeBackgroundColor)'],
  ['codeTextColor', '代码文本颜色 (codeTextColor)'],
  ['iconColor', '图标颜色 (iconColor)'],
  ['userRedColor', '红名用户 (userRedColor)'],
  ['userOrangeColor', '橙名用户 (userOrangeColor)'],
  ['userPurpleColor', '紫名用户 (userPurpleColor)'],
  ['userGreenColor', '绿名用户 (userGreenColor)'],
  ['userBlueColor', '蓝名用户 (userBlueColor)'],
  ['userGrayColor', '灰名用户 (userGrayColor)'],
  ['userCheaterColor', '作弊用户 (userCheaterColor)'],
  ['prizeGreenColor', '绿钩/气球 (prizeGreenColor)'],
  ['prizeBlueColor', '蓝钩/气球 (prizeBlueColor)'],
  ['prizeGoldColor', '金钩/气球 (prizeGoldColor)']
] as const;

const handleResetdark = () => {
    uiTheme.value = { ...darkTheme };
    message.success('已重置为深色主题');
};
const handleReset = () => {
    uiTheme.value = { ...defaultTheme };
    message.success('已重置为浅色主题');
};
</script>

<template>
    <n-button
        type="primary"
        circle
        size="large"
        class="theme-editor-trigger"
        @click="showDrawer = true"
    >
        <template #icon>
            <n-icon>
                <Settings />
            </n-icon>
        </template>
    </n-button>

    <n-drawer 
        v-model:show="showDrawer" 
        :width="380" 
        placement="right"
        :theme-overrides="{ 
            color: uiTheme?.cardColor,             
            borderRadius: uiTheme?.cardRadius,     
            boxShadow: uiTheme?.cardShadow,       
            titleTextColor: uiTheme?.cardTitleColor,
            textColor: uiTheme?.textColor          
        }"
    >
        <n-drawer-content title="主题编辑器" :style="{ '--n-color': uiTheme?.cardColor }">
            <n-form v-if="uiTheme" label-placement="top" label-width="auto" :model="uiTheme">
                <n-form-item
                    v-for="[key, label] in colorItems"
                    :key="key"
                    :label="label"
                    :path="key"
                >
                    <n-color-picker v-model:value="uiTheme[key]" show-alpha />
                </n-form-item>
                <n-form-item label="Card shadow" path="cardShadow">
                    <n-input v-model:value="uiTheme.cardShadow" />
                </n-form-item>
                <n-form-item label="Elevated shadow" path="elevatedShadow">
                    <n-input v-model:value="uiTheme.elevatedShadow" />
                </n-form-item>
                <n-form-item label="Radius">
                    <n-input-number v-model:value="radiusNumber" :min="0" />
                </n-form-item>
            </n-form>

            <template #footer>
                <n-button type="warning" ghost @click="handleReset">选用默认浅色</n-button>
                <n-button type="warning" ghost @click="handleResetdark">选用默认深色</n-button>
            </template>
        </n-drawer-content>
    </n-drawer>
</template>

<style scoped>
.theme-editor-trigger {
    position: fixed;
    right: 20px;
    bottom: 20px;
    z-index: 1000;
}

</style>
