import { base } from 'acorn/dist/walk.es';
import { addStatementsToFunction, identifier } from '../transformers/common';
import makeObservablesFrom from './observables-from';

function setScope({ declaration, scope, functionScope }, key) {
    scope[key] = true;
    if(declaration === 'var' && functionScope !== scope) {
        functionScope[key] = true; 
    }
}

function clearScope({ declaration, scope, functionScope }, key) {
    if(!scope[key]) return;
    scope[key] = false;
    if(declaration === 'var' && functionScope !== scope) {
        functionScope[key] = false; 
    }
}

function getOptions(state) {
    const _statements = [];
    return {
        addObservable: o => setScope(state, o),
        addStatements: s => _statements.push(...s),
        addIdentifier: i => clearScope(state, i),
        get statements() { return _statements; }
    };
}

export default function createHandlers({ getRef, sigil='$' }) {
    const newRef = () => identifier(getRef());
    const observablesFrom = makeObservablesFrom({ newRef, sigil });

    return {
        Observable(node, { scope, functionScope, declaration }) {
            const addTo = declaration === 'var' ? functionScope : scope;
            return addTo[node.left.name] = true;
        },

        // modification of acorn's "Function" base visitor.
        // https://github.com/ternjs/acorn/blob/master/src/walk/index.js#L262-L267
        Function(node, state, c) {
            const { scope, functionScope } = state;
            state.scope = state.functionScope = Object.create(scope);

            const options = getOptions(state);

            node.params = node.params.map(node => observablesFrom(node, options));
            
            const priorFn = state.fn;
            state.fn = node;

            c(node.body, state, node.expression ? 'ScopeExpression' : 'ScopeBody');
            
            state.fn = priorFn;
            state.scope = scope;

            // need to wait to add statements, otherwise they will get picked up
            // in c(node.body, ...) call above (which causes the identifiers to 
            // "unregister" the observables)
            const { statements } = options;
            if(statements.length) {
                // this call may mutate the function by creating a
                // BlockStatement in lieu of AFE implicit return
                addStatementsToFunction({ fn: node, statements, returnBody: true });
            }

            state.functionScope = functionScope;
        },

        BlockStatement(node, state, c) {
            const { scope } = state;
            state.scope = Object.create(scope);
            state.__block = node.body;
            base.BlockStatement(node, state, c);
            state.scope = scope;
        },

        VariableDeclaration(node, state, c) {
            state.declaration = node.kind;
            base.VariableDeclaration(node, state, c);
            state.declaration = null;
        },

        VariableDeclarator(node, state, c) {

            const options = getOptions(state);
            node.id = observablesFrom(node.id, options);

            const { statements } = options;
            if(statements.length) {
                console.log(statements);
            }

            if(node.init) c(node.init, state);
        },

        VariablePattern({ name }, state) {
            clearScope(state, name);
        }
    };
}
