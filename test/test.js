/* eslint-env mocha, es6 */

import path from 'path';
import fs from 'fs';
import assert from 'assert';

import markdownit from '@gerhobbelt/markdown-it';
import generate from '@gerhobbelt/markdown-it-testgen';

import { fileURLToPath } from 'url';

// see https://nodejs.org/docs/latest-v13.x/api/esm.html#esm_no_require_exports_module_exports_filename_dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import plugin from '../index.js';


describe('markdown-it-modify-token', function () {
  let md = markdownit({
    html: true,
    linkify: true,
    typography: true,
    modifyToken: function (token, env) {
      switch (token.type) {
      case 'image': // set all images to 200px width except for foo.gif
        if (token.attrObj.src !== 'foo.gif') {
          token.attrObj.width = '200px';
        }
        break;
      case 'link_open':
        token.attrObj.target = '_blank'; // set all links to open in new window
        if (env.linkPrefix && token.attrObj.href) {
          token.attrObj.href = env.linkPrefix + token.attrObj.href;
        }
        break;
      }
      // return a new or modified token otherwise it will use previous token
      return token;
    }
  }).use(plugin);
  generate(path.join(__dirname, 'fixtures/attr-modification.txt'), md);

  it('Passes on env', function (done) {
    let html = md.render(fs.readFileSync(path.join(__dirname, 'fixtures/env.txt'), 'utf-8'), {
      linkPrefix: 'test/'
    });
    assert.strictEqual(html, '<p><a href="test/a" target="_blank">Hello</a></p>\n');
    done();
  });
});
