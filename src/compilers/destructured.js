import { recursive, base } from 'acorn/dist/walk.es';
import { 
    callMethod,
    declareConst, 
    identifier,
    literal } from '../transformers/common';

const property = identifier('child');
const initChild = ({ ref: object, arg }) => callMethod({ object, property, arg });

export default function makeDestructure({ newRef, sigil='$' }) {

    return function destructured(node, ref) {
        const statements = [];
        const observables = [];

        recursive(node, { ref }, {
            Property({ computed, key, value }, { ref }, c) {
                const arg = computed ? key : literal({ value: key.name });
                this.Arg(value, { ref, arg }, c);
            },

            Arg(node, { ref, arg }, c) {
                const init = initChild({ ref, arg });
                c(node, { ref, init });
            },

            Identifier(node, { init }) {
                this.Statement(node, init);
                observables.push(node.name);
            },

            Statement(node, init) {
                statements.push(declareConst({ id: node, init }));
            },

            Ref(init) {
                const ref = newRef();
                this.Statement(ref, init);
                return ref;
            },

            ObjectPattern(node, { ref, init }, c) {
                if(init) ref = this.Ref(init);
                for(let prop of node.properties) c(prop, { ref });
            },

            ArrayPattern(node, { ref, init }, c) {
                if(init) ref = this.Ref(init);
                node.elements.forEach((el, i) => {
                    if(!el) return;
                    const arg = literal({ value: i, raw: i });
                    this.Arg(el, { ref, arg }, c);
                });
            },

            AssignmentPattern(node, state, c) {
                if(node.right.name === sigil) {
                    throw new Error('Cannot "=$" twice in same destructuring path');
                }
                base.AssignmentPattern(node, state, c);
            }        
        });

        return { statements, observables };
    };
}