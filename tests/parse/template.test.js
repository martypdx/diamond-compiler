/*eslint no-unused-vars: off */
/* globals _ */
import { NONE, STAR, AT } from '../../src/parse/sigil-types';
import template from '../../src/parse/template';
import chai from 'chai';
const assert = chai.assert;
import { recursive } from 'acorn/dist/walk.es';

const TAG = '_';

function findTemplates(ast) {
    const state = { template: null };
    
    recursive(ast, state, {
        TaggedTemplateExpression(node, st) {
            if (node.tag.name !== TAG) return;
            st.template = node;
        },

    });

    return state.template;
}

const parseSource = source => {
    const { quasi } = findTemplates(source.toAst());
    return template(quasi);
};

describe('parse template', () => {

    describe('text-node', () => {
    
        function testFirst(binders, options) {
            assert.equal(binders.length, 1);
            testText(binders[0], options);
        }    

        function testText(binder, {
            elIndex = 0,
            moduleIndex = -1,
            index = 0,
            name = '',
            sigil = STAR,
            ref = '',
            observables = []
        } = {}) {
            const { name: astName, type: astType } = binder.ast;
            assert.equal(astType, 'Identifier');
            assert.equal(astName, ref);
            delete binder.ast;
            delete binder.target;
            assert.deepEqual(
                binder, 
                { elIndex, moduleIndex, index, name, sigil, observables }, 
                `ref: ${ref}`
            );
        }

        it('stand-alone text node', () => {
            function source() {
                const template = foo => _`*${foo}`;
            }
            const { html, binders } = parseSource(source);
            assert.equal(html, '<text-node></text-node>');
            testFirst(binders, { ref: 'foo' });
        });

        it('value text node', () => {
            function source() {
                const template = foo => _`${foo}`;
            }
            const { html, binders } = parseSource(source);
            assert.equal(html, '<text-node></text-node>');
            testFirst(binders, { ref: 'foo', sigil: NONE });
        });

        it('block text node', () => {
            function source() {
                const template = foo => _`${foo}#`;
            }
            const { html, binders } = parseSource(source);
            assert.equal(html, '<!-- block -->');
            testFirst(binders, { ref: 'foo', sigil: NONE });
        });

        it('block observer text node', () => {
            function source() {
                const template = foo => _`*${foo}#`;
            }
            const { html, binders } = parseSource(source);
            assert.equal(html, '<!-- block -->');
            testFirst(binders, { ref: 'foo' });
        });

        it('element with text node', () => {
            function source() {
                const template = place => _`<span>hello *${place}</span>`;
            }

            const { html, binders } = parseSource(source);

            assert.equal(html,
                '<span data-bind>hello <text-node></text-node></span>'
            );
            testFirst(binders, { index: 1, ref: 'place' });
        });

        it('second element with text node', () => {
            function source() {
                const template = place => _`<span>hello</span> <span>*${place}</span>`;
            }

            const { html, binders } = parseSource(source);

            assert.equal(html,
                '<span>hello</span> <span data-bind><text-node></text-node></span>'
            );
            testFirst(binders, { ref: 'place' });
        });

        it('two elements with text node', () => {
            function source() {
                const template = (salutation, place) => _`<span>*${salutation}</span> <span>*${place}</span>`;
            }

            const { html, binders } = parseSource(source);

            assert.equal(html,
                '<span data-bind><text-node></text-node></span> <span data-bind><text-node></text-node></span>'
            );
            assert.equal(binders.length, 2);
            testText(binders[0], { ref: 'salutation' });
            testText(binders[1], { elIndex: 1, ref: 'place' });
        });

        it('one elements with two text node', () => {
            function source() {
                const template = (salutation, place) => _`<span>*${salutation} *${place}</span>`;
            }

            const { html, binders } = parseSource(source);

            assert.equal(html,
                '<span data-bind><text-node></text-node> <text-node></text-node></span>'
            );
            assert.equal(binders.length, 2);
            testText(binders[0], { ref: 'salutation' });
            testText(binders[1], { index: 2, ref: 'place' });
        });

        it('child element with text node', () => {
            function source() {
                const template = foo => _`<div><span>*${foo}</span></div>`;
            }

            const { html, binders } = parseSource(source);

            assert.equal(html,
                '<div><span data-bind><text-node></text-node></span></div>'
            );
            testFirst(binders, { ref: 'foo' });
        });

        it('multiple nested elements with text node', () => {
            function source() {
                const template = (one, two, three, four, five) => _`
                    <div>*${one}
                        <span>*${three}</span>
                        <p><span>*${five}</span>*${four}</p>
                        *${two}
                    </div>
                `;
            }

            const { html, binders } = parseSource(source);
            assert.equal(html, `
                    <div data-bind><text-node></text-node>
                        <span data-bind><text-node></text-node></span>
                        <p data-bind><span data-bind><text-node></text-node></span><text-node></text-node></p>
                        <text-node></text-node>
                    </div>
                `);
            
            assert.equal(binders.length, 5);
            testText(binders[0], { elIndex: 0, ref: 'one' });
            testText(binders[1], { elIndex: 0, index: 6, ref: 'two' });
            testText(binders[2], { elIndex: 1, ref: 'three' });
            testText(binders[3], { elIndex: 2, index: 1, ref: 'four' });
            testText(binders[4], { elIndex: 3, ref: 'five' });
        });
    });

    describe('attribute', () => {

        function testFirst(binders, options) {
            assert.equal(binders.length, 1);
            testAttr(binders[0], options);
        }   
        
        function testAttr(binder, {
            elIndex = 0,
            moduleIndex = -1,
            name = '',
            index = -1,
            sigil = NONE,
            ref = '',
            observables = []
        } = {}) {
            assert.ok(binder, 'binder does not exist');
            const { ast } = binder;
            assert.equal(ast.type, 'Identifier');
            assert.equal(ast.name, ref);
            delete binder.ast;
            delete binder.target;
            assert.deepEqual(
                binder, 
                { elIndex, moduleIndex, name, index, sigil, observables }, 
                `name: ${name}`
            );
        }

        it('simple', () => {
            function source() {
                const template = foo => _`<span bar=${foo}></span>`;
            }
            const { html, binders } = parseSource(source);
            assert.equal(html, '<span bar="" data-bind></span>');
            testFirst(binders, { name: 'bar', ref: 'foo' });
        });

        it('with statics, value and valueless', () => {
            function source() {
                const template = foo => _`<input class=${foo} type="checkbox" checked>`;
            }
            const { html, binders } = parseSource(source);
            // NOTE: empty string is equivalent to boolean attribute per spec.
            assert.equal(html, '<input class="" type="checkbox" checked="" data-bind>');
            testFirst(binders, { name: 'class', ref: 'foo' });
        });

        it('many', () => {
            function source() {
                const template = (one, two, three, four, five) => _`
                    <div one=${one}>
                        <span two=${two}>${three}</span>
                        <p><span four=${four}>text</span></p>
                    </div>
                `;
            }
            const { html, binders } = parseSource(source);
            assert.equal(html, `
                    <div one="" data-bind>
                        <span two="" data-bind><text-node></text-node></span>
                        <p><span four="" data-bind>text</span></p>
                    </div>
                `);
            
            assert.equal(binders.length, 4);
            testAttr(binders[0], { elIndex: 0, name: 'one', ref: 'one' });
            testAttr(binders[1], { elIndex: 1, name: 'two', ref: 'two' });
            testAttr(binders[3], { elIndex: 2, name: 'four', ref: 'four' });
        });

        it('binding types', () => {
            function source() {
                const template = (one, two, three) => _`<span one=${one} two=*${two} three=@${three}></span>`;
            }
            const { html, binders } = parseSource(source);
            assert.equal(html, '<span one="" two="" three="" data-bind></span>');
            assert.equal(binders.length, 3);
            testAttr(binders[0], { sigil: NONE, name: 'one', ref: 'one' });
            testAttr(binders[1], { sigil: STAR, name: 'two', ref: 'two' });
            testAttr(binders[2], { sigil: AT, name: 'three', ref: 'three' });
        });
    });

    describe('html', () => {
        it('leaves void elements intact', () => {
            function source() {
                const template = foo => _`<input>`;
            }
            const { html, binders } = parseSource(source);
            assert.equal(html, '<input>');
        });
    });
});
