/// <reference path="utils.ts" />
/// <reference path="sprites.ts" />
/// <reference path="polygons.ts" />
/// <reference path="interfaces.ts" />
/// <reference path="play_ground.ts" />
/// <reference path="tools.core.ts" />
/// <reference path="tools.styles.ts" />
/// <reference path="tools.document.ts" />

module Geoma.Tools
{
    import makeMod = Utils.makeMod;
    import makeProp = Utils.makeProp;
    import property = Utils.ModifiableProperty;
    import Brush = Sprite.Brush;
    import binding = Utils.binding;

    export abstract class Button extends DocumentSprite<Sprite.Container>
    {
        constructor(
            document: Document,
            x: binding<number>,
            y: binding<number>,
            text: binding<string>,
            horizontal_padding: binding<number> = 10,
            vertical_padding: binding<number> = 10,
            forward_event: boolean = false,
            width?: binding<number>
        )
        {
            super(document, new Sprite.Container(), forward_event);
            this._hPadding = makeProp(horizontal_padding, 10);
            this._vPadding = makeProp(vertical_padding, 10);
            this._mouseDown = false;
            this._mouseDownListener = this.document.mouseArea.onMouseDown.bind(this, this.mouseDown, forward_event);
            this._mouseUpListener = this.document.mouseArea.onMouseUp.bind(this, this.mouseUp, forward_event);
            this.backgroundBrush = makeProp(CurrentTheme.ButtonBackgroundBrush);
            this.backgroundSelectBrush = makeProp(CurrentTheme.ButtonSelectedBrush);
            this.foregroundBrush = makeProp(CurrentTheme.ButtonItemTextBrush);
            this.foregroundSelectBrush = makeProp(CurrentTheme.ButtonSelectedItemTextBrush);
            this.textStyle = makeProp(CurrentTheme.ButtonItemTextStyle);

            const text_sprite = new Sprite.Text(
                undefined,
                undefined,
                undefined,
                undefined,
                makeMod(this, () => this.selected ? this.foregroundSelectBrush.value : this.foregroundBrush.value),
                makeMod(this, () => this.textStyle.value),
                text
            );

            const background = new Sprite.Rectangle(
                x,
                y,
                width ? width : () => text_sprite.w + 2 * this._hPadding.value,
                () => text_sprite.h + 2 * this._vPadding.value,
                makeMod(this, () => this.selected ? this.backgroundSelectBrush.value : this.backgroundBrush.value)
            );

            text_sprite.addX(makeMod(this, () => background.x + ((this.selected && !this._mouseDown) ? this._hPadding.value * 0.9 : this._hPadding.value)));
            text_sprite.addY(makeMod(this, () => background.y + ((this.selected && !this._mouseDown) ? this._vPadding.value * 0.9 : this._vPadding.value)));

            this.item.push(background);
            this.item.push(text_sprite);
        }

        public readonly backgroundBrush: property<Brush>;
        public readonly backgroundSelectBrush: property<Brush>;
        public readonly foregroundBrush: property<Brush>;
        public readonly foregroundSelectBrush: property<Brush>;
        public readonly textStyle: property<CanvasTextDrawingStyles>;
        public get isPressed(): boolean
        {
            return this._mouseDown;
        }

        public dispose(): void
        {
            if (!this.disposed)
            {
                this._mouseDownListener.dispose();
                this._mouseUpListener.dispose();
                super.dispose();
            }
        }
        public addX(modifier: Utils.modifier<number>): void
        {
            this.item.first!.addX(modifier);
        }
        public addY(modifier: Utils.modifier<number>): void
        {
            this.item.first!.addY(modifier);
        }
        public addText(modifier: Utils.modifier<string>): void
        {
            (this.item.item(1) as Sprite.Text).text.addModifier(modifier);
        }

        protected abstract onClick(): boolean;
        protected mouseClick(event: MouseEvent): void
        {
            if (this.mouseHit(event))
            {
                if (this.onClick())
                {
                    event.cancelBubble = true;
                }
            }
            this._mouseDown = false;
            super.mouseClick(event);
        }
        protected mouseMove(event: MouseEvent): void
        {
            this.selected = this.mouseHit(event);
            super.mouseMove(event);
        }
        protected mouseDown(event: MouseEvent): void
        {
            this._mouseDown = this.mouseHit(event);
            event.cancelBubble = this._mouseDown;
        }
        protected mouseUp(__event: MouseEvent): void
        {
            this._mouseDown = false;
        }

        private _mouseDown: boolean;
        private readonly _hPadding: property<number>;
        private readonly _vPadding: property<number>;
        private readonly _mouseDownListener: IEventListener<MouseEvent>;
        private readonly _mouseUpListener: IEventListener<MouseEvent>;
    }
}