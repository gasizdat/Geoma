/// <reference path="utils.ts" />
/// <reference path="sprites.ts" />
/// <reference path="polygons.ts" />
/// <reference path="interfaces.ts" />
/// <reference path="play_ground.ts" />
/// <reference path="tools.document.ts" />

module Geoma.Tools
{
    import makeMod = Utils.makeMod;
    import makeProp = Utils.makeProp;
    import toInt = Utils.toInt;
    import Point = Utils.Point;
    import assert = Utils.assert;
    import MulticastEvent = Utils.MulticastEvent;
    import modifier = Utils.modifier;
    import property = Utils.ModifiableProperty;
    import Box = Utils.Box;
    import binding = Utils.binding;
    import Debug = Sprite.Debug;

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

        protected mouseClick(event: MouseEvent): void
        {
        }
        protected mouseMove(event: MouseEvent): void
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

    export class TapIndicator extends DocumentSprite<Sprite.Sprite>
    {
        constructor(
            document: Document,
            delay_time: binding<number>,
            activate_time: binding<number>,
            line_width: binding<number>,
            radius: binding<number>,
            brush: binding<Sprite.Brush>
        )
        {
            class stub extends Sprite.Sprite
            {
                protected innerDraw(play_ground: PlayGround): void
                {
                    throw new Error("Method not implemented.");
                }
            }
            super(document, new stub());

            this._mouseUp = makeProp<boolean>(false);
            this._delayTime = makeProp(delay_time, 0);
            this._activateTime = makeProp(activate_time, 0);
            this._lineWidth = makeProp(line_width, 0);
            this._radius = makeProp(radius, 0);
            this._brush = makeProp(brush, "Black");
            this._startTicks = Document.getTicks();
            this._activated = false;
        }

        public get activated(): boolean
        {
            return this._activated;
        }

        protected innerDraw(play_ground: PlayGround): void
        {
            const dt = Math.abs(this._startTicks - Document.getTicks()) - this._delayTime.value;
            if (dt > 0)
            {
                const point = play_ground.mousePoint;
                play_ground.context2d.beginPath();
                play_ground.context2d.strokeStyle = this._brush.value;
                play_ground.context2d.lineWidth = this._lineWidth.value;
                play_ground.context2d.shadowColor = CurrentTheme.TapShadowColor;
                play_ground.context2d.shadowBlur = CurrentTheme.TapShadowBlure;
                const duration = this._activateTime.value - this._delayTime.value;
                const radius = Math.cos(Math.PI * dt / duration - Math.PI / 2) * this._radius.value;
                if (dt >= duration)
                {
                    if (!this._mouseUp.value)
                    {
                        this._activated = true;
                    }
                    play_ground.context2d.shadowColor = "rgba(0,0,0,0)";
                    play_ground.context2d.shadowBlur = 0;
                    return;
                }
                play_ground.context2d.arc(
                    point.x,
                    point.y,
                    radius,
                    0,
                    Math.PI * 2,
                    false
                );
                play_ground.context2d.lineWidth = 2;
                play_ground.context2d.stroke();
                play_ground.context2d.shadowColor = "rgba(0,0,0,0)";
                play_ground.context2d.shadowBlur = 0;
            }
        }

        private _delayTime: property<number>;
        public _mouseUp: property<boolean>;
        private _activateTime: property<number>;
        private _lineWidth: property<number>;
        private _radius: property<number>;
        private _brush: property<Sprite.Brush>;
        private _startTicks: number;
        private _activated: boolean;
    }
}
