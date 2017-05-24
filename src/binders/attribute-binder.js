import Binder from './binder';

// const attrPattern = /\s*?([a-zA-Z0-9\-]+?)=$/;

// const specials = {
//     on: 'event',
//     class: 'class'
// };

export default class AttributeBinder extends Binder {
    
    constructor(options) {
        super(options);
        this.name = '';
    }

    bind(el, attr) {
        // if (parts.length > 1 && (type = specials[parts[0]])) {
        //     delete currentEl.attributes[name];
        // }
        this.name = attr;
    }

    write() {
        return '""';
    }
}