/// <reference path="utils.ts" />
/// <reference path="tools.core.ts" />
/// <reference path="tools.document.ts" />
/// <reference path="tools.point.base.ts" />

module Geoma.Tools
{
    export class ActiveVirtualPoint extends ActivePointBase
    {
        constructor(document: Document, x: Utils.binding<number>, y: Utils.binding<number>)
        {
            super(document, 0, 0, 0, 0, "", "", "");
            const prop_x = Utils.makeProp(x, 0);
            const prop_y = Utils.makeProp(y, 0);
            this.addX(() => prop_x.value);
            this.addY(() => prop_y.value);
        }

        public moved(_receiptor: string): boolean
        {
            return false;
        }

        protected mouseClick(): void 
        {
        }
    }
}