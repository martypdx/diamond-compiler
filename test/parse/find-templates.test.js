/*eslint no-unused-vars: off */
/* globals _ */
import assert from 'assert';
import findTemplates from '../../src/parse/find-templates';

describe('find templates', () => {
    
    const getTemplate = source => findTemplates(source.toAst());
    
    // const isProgramTTE = ({ ancestors, node }) => {
    //     assert.ok(ancestors.length);
    //     assert.equal(ancestors[0].type, 'Program');
    //     assert.equal(node.type, 'TaggedTemplateExpression');
    // };


    const isTTE = (node) => {
        assert.equal(node.type, 'TaggedTemplateExpression');
    };

    const parentType = ({ ancestors }) => ancestors[ancestors.length - 1].type;

    it('raw', () => {
    
        function source() {
            _`<span>${'foo'}</span>`;
        }

        const templates = getTemplate(source);
        assert.equal(templates.length, 1);
        const [ template ] = templates;
        isTTE(template);
        // assert.equal(parentType(template), 'ExpressionStatement');
    });

    it('direct return from arrow function', () => {

        function source() {
            foo => _`<span>${foo}</span>`;
        }

        const templates = getTemplate(source);
        assert.equal(templates.length, 1);
        const [ template ] = templates;
        isTTE(template);
        // assert.equal(parentType(template), 'ArrowFunctionExpression');
    });

    it('variable declaration', () => {

        function source() {
            const foo = _`<span>${foo}</span>`;
        }

        const templates = getTemplate(source);
        assert.equal(templates.length, 1);
        const [ template ] = templates;
        isTTE(template);
        // assert.equal(parentType(template), 'VariableDeclarator');
    });

    it('sibling templates', () => {

        function source() {
            const t1 = foo => _`<span>${foo}</span>`;
            const t2 = bar => _`<span>${bar}</span>`;
        }

        const templates = getTemplate(source);
        assert.equal(templates.length, 2);
        isTTE(templates[0]);
        isTTE(templates[1]);     
    });

    it('nested templates', () => {
        function source() {
            foo => _`<span>${ _`nested` }</span>`;
        }

        const templates = getTemplate(source);
        assert.equal(templates.length, 2);
        isTTE(templates[0]);
        isTTE(templates[1]);  
    });
});
