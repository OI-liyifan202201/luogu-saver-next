<script setup lang="ts">
import { EditorView, keymap, lineNumbers } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import {
    bracketMatching,
    defaultHighlightStyle,
    foldGutter,
    indentOnInput,
    syntaxHighlighting
} from '@codemirror/language';
import { html } from '@codemirror/lang-html';
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';

const props = defineProps<{
    value: string;
    readonly?: boolean;
}>();

const emit = defineEmits<{
    'update:value': [value: string];
}>();

const editorHost = ref<HTMLElement | null>(null);
let editorView: EditorView | null = null;
let syncingFromEditor = false;

const buildState = (value: string) =>
    EditorState.create({
        doc: value,
        extensions: [
            lineNumbers(),
            foldGutter(),
            history(),
            indentOnInput(),
            bracketMatching(),
            html(),
            syntaxHighlighting(defaultHighlightStyle),
            keymap.of([...defaultKeymap, ...historyKeymap]),
            EditorView.lineWrapping,
            EditorView.editable.of(!props.readonly),
            EditorView.updateListener.of(update => {
                if (!update.docChanged) return;
                syncingFromEditor = true;
                emit('update:value', update.state.doc.toString());
                syncingFromEditor = false;
            }),
            EditorView.theme({
                '&': {
                    minHeight: '320px',
                    borderRadius: '6px',
                    border: '1px solid rgba(15, 23, 42, 0.14)',
                    backgroundColor: '#ffffff',
                    color: '#1f2937',
                    fontSize: '14px'
                },
                '.cm-scroller': {
                    minHeight: '320px',
                    fontFamily: 'Fira Code, Consolas, monospace'
                },
                '.cm-content': {
                    padding: '12px 0'
                },
                '.cm-gutters': {
                    backgroundColor: '#f8fafc',
                    color: '#64748b',
                    borderRight: '1px solid rgba(148, 163, 184, 0.22)'
                },
                '.cm-activeLine': {
                    backgroundColor: 'rgba(14, 165, 233, 0.08)'
                },
                '.cm-activeLineGutter': {
                    backgroundColor: 'rgba(14, 165, 233, 0.1)'
                }
            })
        ]
    });

onMounted(() => {
    if (!editorHost.value) return;
    editorView = new EditorView({
        state: buildState(props.value),
        parent: editorHost.value
    });
});

watch(
    () => props.value,
    value => {
        if (!editorView || syncingFromEditor || value === editorView.state.doc.toString()) return;
        editorView.dispatch({
            changes: {
                from: 0,
                to: editorView.state.doc.length,
                insert: value
            }
        });
    }
);

onBeforeUnmount(() => {
    editorView?.destroy();
    editorView = null;
});
</script>

<template>
    <div ref="editorHost" class="html-code-editor"></div>
</template>

<style scoped>
.html-code-editor {
    overflow: hidden;
    border-radius: 6px;
}
</style>
