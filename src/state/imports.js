import { 
    RENDERER_IMPORT, 
    MAKE_FRAGMENT_IMPORT,
    FIRST_IMPORT,
    MAP_IMPORT,
    COMBINE_IMPORT
} from '../transformers/identifiers';

import { 
    COMBINE, COMBINE_FIRST, 
    FIRST, 
    MAP, MAP_FIRST, 
    SUBSCRIBE, 
    VALUE } from '../binders/binding-types';
import { specifier } from '../transformers/common';

const SPECIFIER_NAME = /html|_/;
const baseNames = [RENDERER_IMPORT, MAKE_FRAGMENT_IMPORT];
const baseSpecifiers = baseNames.map(specifier);

const importSpecifiers = {
    [COMBINE]: COMBINE_IMPORT,
    [COMBINE_FIRST]: COMBINE_IMPORT,
    [FIRST]: FIRST_IMPORT,
    [MAP]: MAP_IMPORT,
    [MAP_FIRST]: MAP_IMPORT,
    [SUBSCRIBE]: null,
    [VALUE]: null,
};

export class Imports {
    constructor({ tag }) {
        this.names = new Set(baseNames);
        this.ast = [];
        this.tag = tag;
    }

    addBinder({ declaration: { name }, type }) {
        this.addName(name);
        const typeImport = importSpecifiers[type];
        if(typeImport) this.addName(typeImport);     
    }

    addName(name) {
        const { ast, names } = this;
        if(!ast || names.has(name)) return;
        names.add(name);
        this.ast.push(specifier(name));
    }

    set specifiers(specifiers) {
        this.ast = specifiers;
        const index = specifiers.findIndex(({ imported }) => SPECIFIER_NAME.test(imported.name)); 
        if(index > -1) {
            this.tag = specifiers[index].local.name;
            specifiers.splice(index, 1);
        }
        specifiers.push(...baseSpecifiers.slice());
    }
}