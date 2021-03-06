/*eslint no-unused-vars: off */
/* globals _, $, __makeRenderer, __textBinder, 
__map, __blockBinder, __attrBinder, __propBinder */
import codeEqual from '../helpers/code-equal';
import compile from '../../src/compilers/compile';
import { ByIdRenderer } from '../../src/state/fragment-renderers';

describe('compiler', () => {

    it('hello world', () => {
        const source = `
            import { html as _ } from 'azoth';
            const template = (greeting, name) => _\`<span>\${greeting} \${name}</span>\`;
        `;

        const compiled = compile(source);

        const expected = `
            const __render0 = __makeRenderer(\`<span data-bind><text-node></text-node> <text-node></text-node></span>\`);
            import { __makeRenderer, __textBinder } from 'azoth';
            const template = (greeting, name) => {
                const { __fragment, __nodes } = __render0();
                const __child0 = __nodes[0].childNodes[0];
                const __child1 = __nodes[0].childNodes[2];
                __textBinder(__child0)(greeting);
                __textBinder(__child1)(name);
                return __fragment;
            };
        `;

        codeEqual(compiled, expected);
    }); 

    it('hello world observable', () => {
        const source = `
            import { html as _ } from 'azoth';
            const template = (name=$) => _\`<span>Hello *\${name}</span>\`;
        `;

        const compiled = compile(source);

        const expected = `
            const __render0 = __makeRenderer(\`<span data-bind>Hello <text-node></text-node></span>\`);
            import { __makeRenderer, __textBinder } from 'azoth';
            const template = name => {
                const { __fragment, __nodes } = __render0();
                const __child0 = __nodes[0].childNodes[1];
                const __sub0 = name.subscribe(__textBinder(__child0));
                __fragment.unsubscribe = () => {
                    __sub0.unsubscribe();
                };
                return __fragment;
            };
        `;

        codeEqual(compiled, expected);
    });

    it('orphan text', () => {
        const source = () => {
            const template = name => _`${name}`;
        };

        const compiled = compile(source.toCode());

        const expected = () => {
            const __render0 = __makeRenderer(`<text-node></text-node>`);
            const template = (name) => {
                const { __fragment, __nodes } = __render0();
                const __child0 = __fragment.childNodes[0];
                __textBinder(__child0)(name);
                return __fragment;
            };
        };

        codeEqual(compiled, expected);
    }); 

    it('oninit', () => {
        function source() {
            const t = () => _`<span oninit=${node => node.innerText= 'Foo'}></span>`;
        }

        const compiled = compile(source.toCode());

        const expected = () => {
            const __render0 = __makeRenderer(`<span data-bind></span>`);
            const t = () => {
                const { __fragment, __nodes } = __render0();
                (oninit => oninit(__nodes[0]))(node => node.innerText = 'Foo');
                return __fragment;
            };
        };

        codeEqual(compiled, expected);
    }); 

    it('oninit with other binders', () => {
        function source() {
            const t = foo => _`<span oninit=${node => node.innerText += '!'}>${foo}</span>`;
        }

        const compiled = compile(source.toCode());

        const expected = () => {
            const __render0 = __makeRenderer(`<span data-bind><text-node></text-node></span>`);
            const t = (foo) => {
                const { __fragment, __nodes } = __render0();
                const __child1 = __nodes[0].childNodes[0];
                __textBinder(__child1)(foo);
                (oninit => oninit(__nodes[0]))(node => node.innerText += '!');
                return __fragment;
            };
        };

        codeEqual(compiled, expected);
    }); 

    it('hello attribute', () => {
        const source = `
            import { html as _ } from 'azoth';
            const template = name => _\`<span class=\${name}>Hello World</span>\`;
        `;

        const compiled = compile(source);

        const expected = `
            const __render0 = __makeRenderer(\`<span class="" data-bind>Hello World</span>\`);
            import { __makeRenderer, __attrBinder } from 'azoth';
            const template = name => {
                const { __fragment, __nodes } = __render0();
                __attrBinder(__nodes[0], 'class')(name);
                return __fragment;
            };
        `;

        codeEqual(compiled, expected);
    }); 

    it('no import', () => {
        function source() {
            const template = name => _`<span>Hello ${name}</span>`;
        }

        const compiled = compile(source.toCode());

        const expected = `
            const __render0 = __makeRenderer(\`<span data-bind>Hello <text-node></text-node></span>\`);
            const template = name => {
                const { __fragment, __nodes } = __render0();
                const __child0 = __nodes[0].childNodes[1];
                __textBinder(__child0)(name);
                return __fragment;
            };
        `;

        codeEqual(compiled, expected);
    });

    it('nested', () => {
        const source = `
            import { html as _ } from 'azoth';
            const template = (foo , bar) => _\`<div>\${ foo ? _\`<span>Hello \${bar}</span>\` : _\`<span>Goodbye \${bar}</span>\`}#</div>\`;
        `;
        const compiled = compile(source);

        const expected = `
            const __render0 = __makeRenderer(\`<span data-bind>Hello <text-node></text-node></span>\`);
            const __render1 = __makeRenderer(\`<span data-bind>Goodbye <text-node></text-node></span>\`);
            const __render2 = __makeRenderer(\`<div data-bind><!-- block --></div>\`);
            import { __makeRenderer, __textBinder, __blockBinder } from 'azoth';
            const template = (foo, bar) => {
                const { __fragment, __nodes } = __render2();
                const __child0 = __nodes[0].childNodes[0];
                const __sub0b = __blockBinder(__child0);
                __sub0b.observer(foo ? () => {
                    const { __fragment, __nodes } = __render0();
                    const __child0 = __nodes[0].childNodes[1];
                    __textBinder(__child0)(bar);
                    return __fragment;
                } : () => {
                    const { __fragment, __nodes } = __render1();
                    const __child0 = __nodes[0].childNodes[1];
                    __textBinder(__child0)(bar);
                    return __fragment;
                });
                __fragment.unsubscribe = () => {
                    __sub0b.unsubscribe();
                };
                return __fragment
            };
        `;

        codeEqual(compiled, expected);
    });

    it('hello world observable', () => {
        const source = `
            import { html as _ } from 'azoth';
            const template = (name=$) => _\`<span>Hello *\${name}</span>\`;
        `;

        const compiled = compile(source);

        const expected = `
            const __render0 = __makeRenderer(\`<span data-bind>Hello <text-node></text-node></span>\`);
            import { __makeRenderer, __textBinder } from 'azoth';
            const template = name => {
                const { __fragment, __nodes } = __render0();
                const __child0 = __nodes[0].childNodes[1];
                const __sub0 = name.subscribe(__textBinder(__child0))
                __fragment.unsubscribe = () => {
                    __sub0.unsubscribe();
                };
                return __fragment;
            };
        `;

        codeEqual(compiled, expected);
    }); 

    it('hello world once observable', () => {
        const source = `
            import { html as _ } from 'azoth';
            const template = (name=$) => _\`<span>Hello $\${name}</span>\`;
        `;

        const compiled = compile(source);

        const expected = `
            const __render0 = __makeRenderer(\`<span data-bind>Hello <text-node></text-node></span>\`);
            import { __makeRenderer, __textBinder, __first } from 'azoth';
            const template = name => {
                const { __fragment, __nodes } = __render0();
                const __child0 = __nodes[0].childNodes[1];
                const __sub0 = __first(name, __textBinder(__child0));
                __fragment.unsubscribe = () => {
                    __sub0.unsubscribe();
                };
                return __fragment;
            };
        `;

        codeEqual(compiled, expected);
    }); 

    it('mapped observable expression', () => {
        const source = `
            import { html as _ } from 'azoth';
            const template = (x=$) => _\`<span>*\${x * x}</span>\`;
        `;

        const compiled = compile(source);

        const expected = `
            const __render0 = __makeRenderer(\`<span data-bind><text-node></text-node></span>\`);
            import { __makeRenderer, __textBinder, __map } from 'azoth';
            const template = x => {
                const { __fragment, __nodes } = __render0();
                const __child0 = __nodes[0].childNodes[0];
                const __sub0 = __map(x, x => x * x, __textBinder(__child0));
                __fragment.unsubscribe = () => {
                    __sub0.unsubscribe();
                };
                return __fragment;
            };
        `;

        codeEqual(compiled, expected);
    }); 


    it('destructured param observable', () => {
        const source = `
            import { html as _ } from 'azoth';
            const template = ({ name }=$) => _\`<span>*\${name}</span>\`;
        `;

        const compiled = compile(source);

        const expected = `
            const __render0 = __makeRenderer(\`<span data-bind><text-node></text-node></span>\`);
            import {__makeRenderer, __textBinder} from 'azoth';
            const template = __ref0 => {
                const name = __ref0.child('name');
                const { __fragment, __nodes } = __render0();
                const __child0 = __nodes[0].childNodes[0];
                const __sub0 = name.subscribe(__textBinder(__child0));
                __fragment.unsubscribe = () => {
                    __sub0.unsubscribe();
                };
                return __fragment;
            };
        `;

        codeEqual(compiled, expected);
    }); 

    it('destructured variable observable', () => {
        const source = `
            import { html as _ } from 'azoth';
            const template = person => {
                const { name: { first }=$ } = person;
                return _\`<span>*\${first}</span>\`;
            };
        `;
        
        const compiled = compile(source);

        const expected = `
            const __render0 = __makeRenderer(\`<span data-bind><text-node></text-node></span>\`);
            import {__makeRenderer, __textBinder} from 'azoth';
            const template = person => {
                const {name: __ref0} = person;
                const first = __ref0.child('first');
                const { __fragment, __nodes } = __render0();
                const __child0 = __nodes[0].childNodes[0];
                const __sub0 = first.subscribe(__textBinder(__child0));
                __fragment.unsubscribe = () => {
                    __sub0.unsubscribe();
                };
                return __fragment;
            };
        `;

        codeEqual(compiled, expected);
    }); 

    it('combined observable expression', () => {
        const source = `
            import { html as _ } from 'azoth';
            const template = (x=$, y=$) => _\`<span>*\${x + y}</span>\`;
        `;

        const compiled = compile(source);

        const expected = `
            const __render0 = __makeRenderer(\`<span data-bind><text-node></text-node></span>\`);
            import { __makeRenderer, __textBinder, __combine } from 'azoth';
            const template = (x, y) => {
                const { __fragment, __nodes } = __render0();
                const __child0 = __nodes[0].childNodes[0];
                const __sub0 = __combine([x, y], (x, y) => x + y, __textBinder(__child0));
                __fragment.unsubscribe = () => {
                    __sub0.unsubscribe();
                };
                return __fragment;
            };
        `;

        codeEqual(compiled, expected);
    }); 
 
    it('block component', () => {
        const source = `
            import { _, Block } from 'azoth';
            const template = name => _\`<span>Hello <#:\${Block({ name })}/></span>\`;
        `;

        const compiled = compile(source);

        const expected = `
            const __render0 = __makeRenderer(\`<span data-bind>Hello <!-- component start --><!-- component end --></span>\`);
            import { Block, __makeRenderer } from 'azoth';
            const template = name => {
                const { __fragment, __nodes } = __render0();
                const __child0 = __nodes[0].childNodes[2];
                const __sub0b = Block({ name });
                __sub0b.onanchor(__child0);                
                __fragment.unsubscribe = () => {
                    __sub0b.unsubscribe();
                };
                return __fragment;
            };
        `;

        codeEqual(compiled, expected);
    }); 

    it('Widget component with content', () => {
        const source = () => {
            const template = foo => _`<#:${Widget}><span>${foo}</span></#:>`;
        };

        const compiled = compile(source.toCode());

        const expected = () => {
            const __render0 = __makeRenderer(`<!-- component start --><!-- component end -->`);
            const __render1 = __makeRenderer(`<span data-bind><text-node></text-node></span>`);
            const template = foo => {
                const { __fragment, __nodes } = __render0();
                const __child0 = __fragment.childNodes[1];
                const __sub0b = Widget;
                __propBinder(__sub0b, 'content')(() => {
                    const { __fragment, __nodes } = __render1();
                    const __child0 = __nodes[0].childNodes[0];
                    __textBinder(__child0)(foo);
                    return __fragment;
                });
                __sub0b.onanchor(__child0);
                __fragment.unsubscribe = () => {
                    __sub0b.unsubscribe();
                };
                return __fragment;
            };
        };

        codeEqual(compiled, expected);
    }); 

    it('block component with attributes and content', () => {
        const source = () => {
            const template = (name, foo=$) => _`<span><#:${Block({ name })} foo=*${foo} bar="bar"><em>${name}</em></#:></span>`;
        };

        const compiled = compile(source.toCode());

        const expected = () => {
            const __render0 = __makeRenderer(`<span data-bind><!-- component start --><!-- component end --></span>`);
            const __render1 = __makeRenderer(`<em data-bind><text-node></text-node></em>`);
            const template = (name, foo) => {
                const { __fragment, __nodes } = __render0();
                const __child0 = __nodes[0].childNodes[1];
                const __sub0b = Block({ name });
                const __sub0_0 = foo.subscribe(__propBinder(__sub0b, 'foo'));
                __propBinder(__sub0b, 'bar')('bar');
                __propBinder(__sub0b, 'content')(() => {
                    const { __fragment, __nodes } = __render1();
                    const __child0 = __nodes[0].childNodes[0];
                    __textBinder(__child0)(name);
                    return __fragment;
                });
                __sub0b.onanchor(__child0);
                __fragment.unsubscribe = () => {
                    __sub0b.unsubscribe();
                    __sub0_0.unsubscribe();
                };
                return __fragment;
            };
        };

        codeEqual(compiled, expected);
    }); 

    /* globals Block, Widget */
    it('block component maintains correct child index', () => {
        const source = () => {
            const template = foo => _`<span>${foo}<#:${Block()}/>${foo}</span>`;
        };

        const compiled = compile(source.toCode());

        const expected = () => {
            const __render0 = __makeRenderer(`<span data-bind><text-node></text-node><!-- component start --><!-- component end --><text-node></text-node></span>`);
            const template = foo => {
                const { __fragment, __nodes } = __render0();
                const __child0 = __nodes[0].childNodes[0];
                const __child1 = __nodes[0].childNodes[2];
                const __child2 = __nodes[0].childNodes[3];
                __textBinder(__child0)(foo);
                const __sub1b = Block();
                __sub1b.onanchor(__child1);
                __textBinder(__child2)(foo);
                __fragment.unsubscribe = () => {
                    __sub1b.unsubscribe();
                };
                return __fragment;
            };
        };

        codeEqual(compiled, expected);
    }); 

    // TODO: this should just be tranforms/fragment.js unit test
    it('block component unsubscribes but not its binder', () => {
        const source = () => {
            const template = (name=$) => _`<#:${new Block(name)}></#:>`;
        };

        const compiled = compile(source.toCode());

        const expected = () => {
            const __render0 = __makeRenderer(`<!-- component start --><!-- component end -->`);
            const template = name => {
                const { __fragment, __nodes } = __render0();
                const __child0 = __fragment.childNodes[1];
                const __sub0b = new Block(name);
                __sub0b.onanchor(__child0);
                __fragment.unsubscribe = () => {
                    __sub0b.unsubscribe();
                };
                return __fragment;
            };
        };

        codeEqual(compiled, expected);
    }); 

    it.skip('class component', () => {
        const source = () => {
            // @Widget
            class Control {
                render() {
                    return _`
                        <div class=${`control ${this.class}`}>
                            ${this.content}#
                        </div>
                    `;
                }
            }
        };

        const compiled = compile(source.toCode());
        
        const expected = () => {
            const __render0 = __makeRenderer(`
                        <div class="" data-bind>
                            <!-- block -->
                        </div>
                    `);
            class Control extends _ {
                render() {
                    const { __fragment, __nodes } = __render0();
                    const __child1 = __nodes[0].childNodes[1];
                    __attrBinder(__nodes[0], 'class')(`control ${this.class}`);
                    const __sub1b = __blockBinder(__child1);
                    __sub1b.observer(this.content);
                    __fragment.unsubscribe = () => {
                        __sub1b.unsubscribe();
                    };
                    return __fragment;
                }
            }
        };

        codeEqual(compiled, expected);
    });

    describe('no subscriptions for undeclareds in nested templates', () => {
        
        it('implicit return template', () => {

            const source = () => {
                const template = ({ foo=$, bar=$}) => _`
                    *${foo.map(f => _`*${bar}`)}#        
                `;
            };

            const compiled = compile(source.toCode());

            const expected = () => {
                const __render0 = __makeRenderer(`<text-node></text-node>`);
                const __render1 = __makeRenderer(`<!-- block -->`);
                const template = ({foo, bar}) => {
                    const { __fragment, __nodes } = __render1();
                    const __child0 = __fragment.childNodes[1];
                    const __sub0b = __blockBinder(__child0);
                    const __sub0 = __map(foo, foo => foo.map(f => {
                        const { __fragment, __nodes } = __render0();
                        const __child0 = __fragment.childNodes[0];
                        const __sub0 = bar.subscribe(__textBinder(__child0));
                        __fragment.unsubscribe = () => {
                            __sub0.unsubscribe();
                        };
                        return __fragment;
                    }), __sub0b.observer);
                    __fragment.unsubscribe = () => {
                        __sub0.unsubscribe();
                        __sub0b.unsubscribe();
                    };
                    return __fragment;
                };

            };

            codeEqual(compiled, expected);
        });

        it('return statements', () => {
            const source = () => {
                const template = (foo=$, bar=$) => _`
                    $${foo.map(f => {
                        const a = 12;
                        return _`*${bar + a}`;
                    })}#
                `;
            };

            const compiled = compile(source.toCode());

            const expected = () => {
                const __render0 = __makeRenderer(`<text-node></text-node>`);
                const __render1 = __makeRenderer(`<!-- block -->`);
                const template = (foo, bar) => {
                    const { __fragment, __nodes } = __render1();
                    const __child0 = __fragment.childNodes[1];
                    const __sub0b = __blockBinder(__child0);
                    const __sub0 = __map(foo, foo => foo.map(f => {
                        const a = 12;
                        const { __fragment, __nodes } = __render0();
                        const __child0 = __fragment.childNodes[0];
                        const __sub0 = __map(bar, bar => bar + a, __textBinder(__child0));
                        __fragment.unsubscribe = () => {
                            __sub0.unsubscribe();
                        };
                        return __fragment;
                    }), __sub0b.observer, true);
                    __fragment.unsubscribe = () => {
                        __sub0.unsubscribe();
                        __sub0b.unsubscribe();
                    };
                    return __fragment;
                };
            };

            codeEqual(compiled, expected);
        });
    });

    describe('ByIdRenderer', () => {

        const byIdRenderer = new ByIdRenderer();

        it('hello world', () => {
            const source = `
                import { html as _ } from 'azoth';
                const template = (greeting, name) => _\`<span>\${greeting} \${name}</span>\`;
            `;

            const compiled = compile(source, { htmlRenderer: byIdRenderer });

            const expected = `
                const __render93f875dca5 = __getRenderer('93f875dca5');
                import { __getRenderer, __textBinder } from 'azoth';
                const template = (greeting, name) => {
                    const { __fragment, __nodes } = __render93f875dca5();
                    const __child0 = __nodes[0].childNodes[0];
                    const __child1 = __nodes[0].childNodes[2];
                    __textBinder(__child0)(greeting);
                    __textBinder(__child1)(name);
                    return __fragment;
                };
            `;

            codeEqual(compiled, expected);
        }); 
    });
    
    // for debug of files that are failing compile.
    // put file contents in ./build/test-file.js
    // it.only('parses domUtil file', () => {
    //     const source = readFileSync('./build/test-file.js', 'utf8');
    //     const compiled = compile(source);
    //     // assert.ok(compiled);
    //     codeEqual(compiled, '');
        
    // });
});

// import { readFileSync } from 'fs';
// import assert from 'assert';