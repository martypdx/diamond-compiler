import { base } from 'acorn/dist/walk.es';

export const TaggedTemplateExpression = (node, module, c) => {
    base.TaggedTemplateExpression(node, module, c);
    if (node.tag.name !== module.tag) return;
    module.makeTemplate(node);
};

export const Program = (node, module, c) => {
    base.Program(node, module, c);
    module.addDeclarations(node.body);
};

export const ImportDeclaration = ({ source, specifiers }, { name, imports }) => {
    if(!source.value.endsWith(name)) return;
    imports.specifiers = specifiers;
};