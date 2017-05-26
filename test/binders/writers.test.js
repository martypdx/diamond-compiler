import { text, block, attribute } from '../../src/binders/writers';

import chai from 'chai';
const assert = chai.assert;

describe('binder writers', () => {

    it('text', () => {
        assert.equal(text.html, '<text-node></text-node>');
        assert.equal(text.init({ index: 2 }), '__textBinder(2)');
    });

    it('block', () => {
        assert.equal(block.html, '<block-node></block-node>');
        assert.equal(block.init({ index: 2 }), '__blockBinder(2)');
    });

    it('attribute', () => {
        assert.equal(attribute.html, '""');
        assert.equal(attribute.init({ name: 'name' }), `__attrBinder('name')`);
    });
});
