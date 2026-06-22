import { type InjectionKey, type Ref } from 'vue';

export interface UiThemeVars {
    bodyColor: string;
    bodyGradientStart: string;
    bodyGradientEnd: string;
    primaryColor: string;
    primaryColorHover: string;
    primaryColorPressed: string;
    primaryColorSuppl: string;
    cardColor: string;
    translucentCardColor: string;
    cardTitleColor: string;
    textColor: string;
    secondaryTextColor: string;
    mutedTextColor: string;
    borderColor: string;
    panelColor: string;
    codeBackgroundColor: string;
    codeTextColor: string;
    cardShadow: string;
    elevatedShadow: string;
    cardRadius: string;
    iconColor: string;
    userRedColor: string;
    userOrangeColor: string;
    userPurpleColor: string;
    userGreenColor: string;
    userBlueColor: string;
    userGrayColor: string;
    userCheaterColor: string;
    prizeGreenColor: string;
    prizeBlueColor: string;
    prizeGoldColor: string;
}

export const uiThemeKey = Symbol() as InjectionKey<Ref<UiThemeVars>>;
