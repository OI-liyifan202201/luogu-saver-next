import assert from 'node:assert/strict';
import { test } from 'node:test';

import { renderMarkdown } from '../dist/index.js';

test('replaces Luogu CAPTCHA images with a fixed placeholder', async () => {
    const captchaUrl = 'https://www.luogu.com.cn/lg4/captcha?identifier=example';
    const proxyUrl = `https://proxy.example/image/${captchaUrl}`;
    const html = await renderMarkdown(
        `before ![captcha](${captchaUrl}) and ![proxied captcha](${proxyUrl}) after`
    );

    assert.equal(html, '<p>before [LUOGU CAPTCHA] and [LUOGU CAPTCHA] after</p>');
    assert.doesNotMatch(html, /<img\b/);
    assert.doesNotMatch(html, /luogu\.com\.cn\/lg4\/captcha/);
});

test('keeps ordinary Markdown images', async () => {
    const html = await renderMarkdown('![example](https://example.com/image.png)');

    assert.match(html, /<img src="https:\/\/example\.com\/image\.png">/);
    assert.doesNotMatch(html, /\[LUOGU CAPTCHA\]/);
});
