import { h, type FunctionalComponent, type SVGAttributes } from 'vue';
import { Icon, addCollection } from '@iconify/vue';
import lucideIcons from '@iconify-json/lucide/icons.json';

// Register the whole Lucide collection locally so icons resolve offline instead
// of being fetched from the Iconify API at runtime.
addCollection(lucideIcons);

/**
 * Wraps a Lucide icon name into a Vue functional component, so call sites can
 * keep passing icons as components (n-icon `component` prop, `renderIcon()`,
 * category tables) exactly as they did with `@vicons/*` icons.
 */
const lucide = (name: string): FunctionalComponent<SVGAttributes> => {
    const component: FunctionalComponent<SVGAttributes> = props =>
        h(Icon, { icon: `lucide:${name}`, ...props });
    component.displayName = `Lucide${name}`;
    return component;
};

export const IconActivity = lucide('activity');
export const IconArrowLeft = lucide('arrow-left');
export const IconArrowRight = lucide('arrow-right');
export const IconAtSign = lucide('at-sign');
export const IconBookOpen = lucide('book-open');
export const IconCalendar = lucide('calendar');
export const IconCamera = lucide('camera');
export const IconChartColumn = lucide('chart-column');
export const IconChartLine = lucide('chart-line');
export const IconCircleAlert = lucide('circle-alert');
export const IconCircleCheck = lucide('circle-check');
export const IconCircleHelp = lucide('circle-help');
export const IconCirclePlay = lucide('circle-play');
export const IconCircleUser = lucide('circle-user');
export const IconCircleX = lucide('circle-x');
export const IconClipboard = lucide('clipboard');
export const IconClock = lucide('clock');
export const IconCloud = lucide('cloud');
export const IconCloudDownload = lucide('cloud-download');
export const IconCodeXml = lucide('code-xml');
export const IconCopy = lucide('copy');
export const IconCopyright = lucide('copyright');
export const IconCpu = lucide('cpu');
export const IconExternalLink = lucide('external-link');
export const IconFlame = lucide('flame');
export const IconGamepad2 = lucide('gamepad-2');
export const IconGithub = lucide('github');
export const IconGlobe = lucide('globe');
export const IconGraduationCap = lucide('graduation-cap');
export const IconHammer = lucide('hammer');
export const IconHistory = lucide('history');
export const IconHouse = lucide('house');
export const IconKeyRound = lucide('key-round');
export const IconLayoutGrid = lucide('layout-grid');
export const IconLibrary = lucide('library');
export const IconLightbulb = lucide('lightbulb');
export const IconList = lucide('list');
export const IconMegaphone = lucide('megaphone');
export const IconMenu = lucide('menu');
export const IconMessageCircleMore = lucide('message-circle-more');
export const IconMessagesSquare = lucide('messages-square');
export const IconNetwork = lucide('network');
export const IconNewspaper = lucide('newspaper');
export const IconPalette = lucide('palette');
export const IconRefreshCw = lucide('refresh-cw');
export const IconSearch = lucide('search');
export const IconServer = lucide('server');
export const IconSettings = lucide('settings');
export const IconShare2 = lucide('share-2');
export const IconShieldCheck = lucide('shield-check');
export const IconShieldUser = lucide('shield-user');
export const IconSparkles = lucide('sparkles');
export const IconTrash2 = lucide('trash-2');
export const IconTriangleAlert = lucide('triangle-alert');
export const IconTrophy = lucide('trophy');
export const IconUser = lucide('user');
export const IconUsers = lucide('users');
export const IconWrench = lucide('wrench');
