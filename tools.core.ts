/// <reference path="utils.ts" />
/// <reference path="sprites.ts" />
/// <reference path="polygons.ts" />
/// <reference path="interfaces.ts" />
/// <reference path="play_ground.ts" />
/// <reference path="tools.document.ts" />

module Geoma.Tools
{
    import assert = Utils.assert;
    import binding = Utils.binding;

    export abstract class DocumentSprite<TSprite extends Sprite.Sprite> extends Sprite.ProxySprite<TSprite>
    {
        constructor(document: Document, sprite: TSprite, forward_event: boolean = false)
        {
            assert(document);
            super(sprite);
            this._mouseMoveListener = document.mouseArea.onMouseMove.bind(this, this.mouseMove, forward_event);
            this._mouseClickListener = document.mouseArea.onMouseClick.bind(this, this.mouseClick, forward_event);
            this._selected = false;
            this.document = document;
        }

        public get selected(): boolean
        {
            return this._selected;
        }
        public set selected(value: boolean)
        {
            if (this._selected)
            {
                if (!value)
                {
                    this.document.removeSelectedSprite(this);
                    this._selected = false;
                }
            }
            else if (value)
            {
                this.document.addSelectedSprite(this);
                this._selected = true;
            }
        }
        public readonly document: Document;

        public dispose(): void
        {
            if (!this.disposed)
            {
                if (this.selected)
                {
                    this.document.removeSelectedSprite(this);
                }
                this._mouseClickListener.dispose();
                this._mouseMoveListener.dispose();
                super.dispose();
            }
        }

        protected mouseClick(__event: MouseEvent): void
        {
        }
        protected mouseMove(__event: MouseEvent): void
        {
        }
        protected innerDraw(play_ground: PlayGround): void
        {
            this.item.draw(play_ground);
        }

        private _mouseMoveListener: IEventListener<MouseEvent>;
        private _mouseClickListener: IEventListener<MouseEvent>;
        private _selected: boolean;
    }

    export class Container<TSprite extends Sprite.Sprite> extends Sprite.Container
    {
        public get first(): TSprite | null
        {
            return this.length ? this.item(0) as TSprite : null;
        }
        public get last(): TSprite | null
        {
            return this.length ? this.item(this.length - 1) as TSprite : null;
        }

        public item(index: number): TSprite
        {
            return super.item(index) as TSprite;
        }
        /*public push<XSprite extends TSprite>(sprite: XSprite): void
        {
        }*/
    }

    export class Tooltip extends Sprite.Container
    {
        constructor(x: binding<number>, y: binding<number>, text: binding<string>, style: binding<CanvasTextDrawingStyles> = CurrentTheme.TooltipStyle, background: binding<Sprite.Brush> = CurrentTheme.TooltipBackground, foreground: binding<Sprite.Brush> = CurrentTheme.TooltipForeground)
        {
            super();
            const padding = 10;
            const tooltip = new Sprite.Text(undefined, undefined, undefined, undefined, foreground, style, text);
            const rect = new Sprite.Rectangle(x, y, () => tooltip.w + padding * 2, () => tooltip.h + padding * 2, background);
            tooltip.addX(() => rect.x + padding);
            tooltip.addY(() => rect.y + padding);

            this.push(rect);
            this.push(tooltip);
        }
    }
}
