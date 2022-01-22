/// <reference path="utils.ts" />
/// <reference path="polygons.ts" />
/// <reference path="interfaces.ts" />
/// <reference path="play_ground.ts" />
/// <reference path="latex.ts" />

module Geoma.Sprite
{
    import makeProp = Utils.makeProp;
    import toInt = Utils.toInt;
    import Point = Utils.Point;
    import assert = Utils.assert;
    import modifier = Utils.modifier;
    import property = Utils.ModifiableProperty;
    import Box = Utils.Box;
    import binding = Utils.binding;

    const DefaultBrush: Brush = "Black";
    const DefaultTextStyle: CanvasTextDrawingStyles = {
        font: "18px Arial", textBaseline: "top", direction: "inherit", textAlign: "left"
    };;

    export type Brush = string | CanvasGradient | CanvasPattern;

    export abstract class Sprite extends Box
    {
        public get name(): string
        {
            return this._name;
        }
        public set name(value: string)
        {
            this._name = value;
        }
        public get alpha(): number
        {
            return this._alpha.value;
        }
        public set alpha(value: number)
        {
            this._alpha.value = value;
        }
        public get visible(): boolean
        {
            return this.getVisible();
        }
        public set visible(value: boolean)
        {
            this._visible.value = value;
        }
        public get disposed(): boolean
        {
            return this._disposed;
        }

        public addAlpha(modifier: modifier<number>): void
        {
            this._alpha.addModifier(modifier);
        }
        public addVisible(modifier: modifier<boolean>): void
        {
            this._visible.addModifier(modifier);
        }
        public resetVisible(value?: boolean): void
        {
            this._visible.reset(value);
        }
        public dispose(): void
        {
            this._disposed = true;
        }
        public readonly draw: Function = (play_ground: PlayGround): void =>
        {
            if (this.visible)
            {
                if (this.alpha < 1)
                {
                    const global_alpha = play_ground.context2d.globalAlpha;
                    play_ground.context2d.globalAlpha = this.alpha;
                    this.innerDraw(play_ground);
                    play_ground.context2d.globalAlpha = global_alpha;
                }
                else
                {
                    this.innerDraw(play_ground);
                }
            }
        }

        protected abstract innerDraw(play_ground: PlayGround): void;
        protected resetAlpha(value?: number): void
        {
            this._alpha.reset(value);
        }
        protected getVisible(): boolean
        {
            return this._visible.value;
        }

        private _name: string = "";
        private _disposed = false;
        private readonly _alpha: property<number> = new property<number>(1);
        private readonly _visible: property<boolean> = new property<boolean>(true);
    }

    export class Container extends Sprite
    {
        constructor(...args: any[])
        {
            super(...args);
            super.addX(this.xModifier.bind(this));
            super.addY(this.yModifier.bind(this));
            super.addW(this.wModifier.bind(this));
            super.addH(this.hModifier.bind(this));
        }
        public get length(): number
        {
            return this._sprites.length;
        }
        public get first(): Sprite | null
        {
            return this.length ? this.item(0) : null;
        }
        public get last(): Sprite | null
        {
            return this.length ? this.item(this.length - 1) : null;
        }

        public item(index: number): Sprite
        {
            assert(index >= 0);
            assert(index < this._sprites.length);
            return this._sprites[index];
        }
        public push<TSprite extends Sprite>(sprite: TSprite): void
        {
            assert(sprite);
            assert(this._sprites.indexOf(sprite) == -1);
            this._sprites.push(sprite);
        }
        public remove(sprite: Sprite): void
        {
            assert(sprite);
            const index = this._sprites.indexOf(sprite);
            assert(index != -1);
            this._sprites.splice(index, 1);
        }
        public contains(sprite: Sprite): boolean
        {
            return this._sprites.indexOf(sprite) > -1;
        }
        public addX(modifier: modifier<number>)
        {
            for (const sprite of this._sprites)
            {
                sprite.addX(modifier);
            }
        }
        public addY(modifier: modifier<number>)
        {
            for (const sprite of this._sprites)
            {
                sprite.addY(modifier);
            }
        }
        public addW(modifier: modifier<number>)
        {
            for (const sprite of this._sprites)
            {
                sprite.addW(modifier);
            }
        }
        public addH(modifier: modifier<number>)
        {
            for (const sprite of this._sprites)
            {
                sprite.addH(modifier);
            }
        }
        public dispose(): void
        {
            for (const sprite of this._sprites)
            {
                sprite.dispose();
            }
            this._sprites.splice(0);
            super.dispose();
        }

        protected innerDraw(play_ground: PlayGround): void
        {
            for (const sprite of this._sprites)
            {
                sprite.draw(play_ground);
            }
        }
        protected xModifier(value: number): number
        {
            let ret: number = value;
            if (this._sprites.length)
            {
                ret = this._sprites[0].x;
                for (let i = 1; i < this._sprites.length; i++)
                {
                    ret = Math.min(ret, this._sprites[i].x);
                }
            }
            return ret;
        }
        protected yModifier(value: number): number
        {
            let ret: number = value;
            if (this._sprites.length)
            {
                ret = this._sprites[0].y;
                for (let i = 1; i < this._sprites.length; i++)
                {
                    ret = Math.min(ret, this._sprites[i].y);
                }
            }
            return ret;
        }
        protected wModifier(value: number): number
        {
            if (this._sprites.length)
            {
                let x = this._sprites[0].x;
                let r = this._sprites[0].right;
                for (let i = 1; i < this._sprites.length; i++)
                {
                    x = Math.min(x, this._sprites[i].x);
                    r = Math.max(r, this._sprites[i].right);
                }
                return r - x;
            }
            else
            {
                return value;
            }
        }
        protected hModifier(value: number): number
        {
            if (this._sprites.length)
            {
                let y = this._sprites[0].y;
                let b = this._sprites[0].bottom;
                for (let i = 1; i < this._sprites.length; i++)
                {
                    y = Math.min(y, this._sprites[i].y);
                    b = Math.max(b, this._sprites[i].bottom);
                }
                return b - y;
            }
            else
            {
                return value;
            }
        }

        private readonly _sprites: Array<Sprite> = new Array<Sprite>();
    }

    export abstract class ProxySprite<TSprite extends Sprite> extends Sprite
    {
        constructor(sprite: TSprite)
        {
            assert(sprite);
            super();
            this._item = sprite;
        }

        public get x(): number
        {
            return this._item.x;
        }
        public set x(value: number)
        {
            this._item.x = value;
        }
        public get y(): number
        {
            return this._item.y;
        }
        public set y(value: number)
        {
            this._item.y = value;
        }
        public get w(): number
        {
            return this._item.w;
        }
        public set w(value: number)
        {
            this._item.w = value;
        }
        public get h(): number
        {
            return this._item.h;
        }
        public set h(value: number)
        {
            this._item.h = value;
        }
        public get visible(): boolean
        {
            return this._item.visible;
        }
        public set visible(value: boolean)
        {
            this._item.visible = value;
        }
        public set alpha(value: number)
        {
            this._item.alpha = value;
        }
        public get name(): string
        {
            return this._item.name;
        }
        public get item(): TSprite
        {
            return this._item;
        }
        public get disposed(): boolean
        {
            return this._item.disposed;
        }

        public dispose(): void
        {
            if (!this.disposed)
            {
                this._item.dispose();
                super.dispose();
            }
        }
        public addX(modifier: modifier<number>)
        {
            this._item.addX(modifier);
        }
        public addY(modifier: modifier<number>)
        {
            this._item.addY(modifier);
        }
        public addW(modifier: modifier<number>)
        {
            this._item.addW(modifier);
        }
        public addH(modifier: modifier<number>)
        {
            this._item.addH(modifier);
        }
        public addAlpha(modifier: modifier<number>): void
        {
            this._item.addAlpha(modifier);
        }
        public addVisible(modifier: modifier<boolean>): void
        {
            this._item.addVisible(modifier);
        }
        public resetVisible(value?: boolean): void
        {
            this._item.resetVisible(value);
        }
        public mouseHit(point: IPoint): boolean
        {
            return this._item.mouseHit(point);
        }

        private _item: TSprite;
    }

    export class Dragable<TSprite extends Sprite> extends ProxySprite<TSprite>
    {
        constructor(mouse_area: IMouseArea, sprite: TSprite)
        {
            super(sprite);
            this._mouseMoveListener = mouse_area.onMouseMove.bind(this, this.mouseMove, true);
            this._mouseDownListener = mouse_area.onMouseDown.bind(this, this.mouseDown, true);
            this._mouseUpListener = mouse_area.onMouseUp.bind(this, this.mouseUp, true);
            sprite.addX(((value: number) =>
            {
                return value + this._dx;
            }).bind(this));
            sprite.addY(((value: number) =>
            {
                return value + this._dy;
            }).bind(this));
        }

        public selectStyle?: Brush;

        public mouseMove(event: MouseEvent): void
        {
            if (event.buttons == 0 && this.selectStyle)
            {
                this._mouseHover = this.mouseHit(event);
            }

            if (this._dragStart)
            {
                if (event.buttons != 0)
                {
                    const dpos = Point.sub(this._dragStart, event);
                    this._dx -= dpos.x;
                    this._dy -= dpos.y;
                    this._dragStart = event;
                    event.cancelBubble = true;
                }
                else
                {
                    this.mouseUp(event);
                }
            }
        }
        public mouseDown(event: MouseEvent): void
        {
            if (this.mouseHit(event))
            {
                this._dragStart = event;
            }
        }
        public mouseUp(__event: MouseEvent): void
        {
            if (this._dragStart)
            {
                delete this._dragStart;
            }
        }
        public dispose()
        {
            if (!this.disposed)
            {
                this._mouseMoveListener.dispose();
                this._mouseDownListener.dispose();
                this._mouseUpListener.dispose();
                super.dispose();
            }
        }
        public move(dx: number, dy: number): void
        {
            this._dx -= dx;
            this._dy -= dy;
        }

        protected innerDraw(play_ground: PlayGround): void
        {
            this.item.draw(play_ground);
            if (this._mouseHover)
            {
                play_ground.context2d.lineWidth = 1;
                if (this.selectStyle)
                {
                    play_ground.context2d.strokeStyle = this.selectStyle;
                }
                play_ground.context2d.strokeRect(toInt(this.x), toInt(this.y), toInt(this.w), toInt(this.h));
            }
        }

        private _dragStart?: IPoint;
        private _mouseHover: boolean = false;
        private _dx: number = 0;
        private _dy: number = 0;
        private _mouseMoveListener: IEventListener<MouseEvent>;
        private _mouseDownListener: IEventListener<MouseEvent>;
        private _mouseUpListener: IEventListener<MouseEvent>;
    }

    export class Rectangle extends Sprite
    {
        constructor(x?: binding<number>, y?: binding<number>, width?: binding<number>, height?: binding<number>, brush?: binding<Brush>)
        {
            super(x, y, width, height);
            this.brush = makeProp<Brush>(brush, DefaultBrush);
        }

        public brush: property<Brush>;

        public innerDraw(play_ground: PlayGround): void
        {
            PlayGround.drawingSprites++;
            if (this.brush)
            {
                play_ground.context2d.fillStyle = this.brush.value;
            }
            play_ground.context2d.fillRect(toInt(this.x), toInt(this.y), toInt(this.w), toInt(this.h));
        }
    }

    export class Text extends Sprite
    {
        constructor(x?: binding<number>, y?: binding<number>, width?: binding<number>, height?: binding<number>, brush?: binding<Brush>, style?: binding<CanvasTextDrawingStyles>, text?: binding<string>, fixWidth?: boolean)
        {
            super(x, y, width, height);
            this.brush = makeProp<Brush>(brush, DefaultBrush);
            this.style = makeProp<CanvasTextDrawingStyles>(style, DefaultTextStyle);
            this.text = makeProp<string>(text, ``);
            this.fixWidth = makeProp<boolean>(fixWidth, false).value;
            this.strokeWidth = new property<number>(0);
            this.strokeBrush = new property<Brush>("White");

            this.addW(((value: number) =>
            {
                return this.fixWidth ? value : Math.max(value, this._width);
            }).bind(this));
            this.addH(((value: number) =>
            {
                return Math.max(value, this._height);
            }).bind(this));
        }

        public readonly text: property<string>;
        public readonly brush: property<Brush>;
        public readonly style: property<CanvasTextDrawingStyles>;
        public readonly strokeWidth: property<number>;
        public readonly strokeBrush: property<Brush>;
        public readonly fixWidth: boolean;

        protected innerDraw(play_ground: PlayGround): void
        {
            PlayGround.drawingSprites++;
            if (this.brush)
            {
                play_ground.context2d.fillStyle = this.brush.value;
            }

            const style = this.style.value;
            if (style)
            {
                if (style.direction)
                {
                    play_ground.context2d.direction = style.direction;
                }
                if (style.font)
                {
                    play_ground.context2d.font = style.font;
                }
                if (style.textAlign)
                {
                    play_ground.context2d.textAlign = style.textAlign;
                }
                if (style.textBaseline)
                {
                    play_ground.context2d.textBaseline = style.textBaseline;
                }
            }

            if (this.strokeWidth.value)
            {
                play_ground.context2d.strokeStyle = this.strokeBrush.value;
                play_ground.context2d.lineWidth = this.strokeWidth.value;
                play_ground.context2d.strokeText(this.text.value, toInt(this.x), toInt(this.y));
            }

            if (this.fixWidth)
            {
                play_ground.context2d.fillText(this.text.value, toInt(this.x), toInt(this.y), toInt(this.w));
            }
            else
            {
                play_ground.context2d.fillText(this.text.value, toInt(this.x), toInt(this.y));
            }

            this._width = play_ground.context2d.measureText(this.text.value).width;
            this._height = play_ground.context2d.measureText("lIqg").actualBoundingBoxDescent;
        }

        private _width: number = 0;
        private _height: number = 0;
    }

    export type TextLineInfo = {
        brush: Brush,
        style: CanvasTextDrawingStyles,
        text: string,
        width?: number,
        strokeWidth?: number;
        strokeBrush?: Brush;
    };

    export class MultiLineText extends Sprite
    {
        constructor(x?: binding<number>, y?: binding<number>, line_padding?: binding<number>, fixWidth?: boolean)
        {
            super(x, y);
            this.fixWidth = fixWidth == true;
            this.textLines = new Array<TextLineInfo>();
            this._linePadding = makeProp(line_padding, 0);

            this.addW(((value: number) =>
            {
                return this.fixWidth ? value : Math.max(value, this._width);
            }).bind(this));
            this.addH(((value: number) =>
            {
                return Math.max(value, this._height);
            }).bind(this));
        }

        public get measuredWidth(): number
        {
            return this._measuredWidth;
        }
        public readonly textLines: Array<TextLineInfo>;
        public readonly fixWidth: boolean;

        protected innerDraw(play_ground: PlayGround): void
        {
            PlayGround.drawingSprites++;
            const line_padding = this._linePadding.value;
            let last_info: TextLineInfo | undefined;
            let current_x = toInt(this.x);
            let current_y = toInt(this.y);
            let current_w = this.fixWidth ? toInt(this.w) : undefined;
            let w: number = 0;
            for (const line of this.textLines)
            {
                if (!last_info || last_info.brush != line.brush)
                {
                    play_ground.context2d.fillStyle = line.brush;
                }
                if (!last_info || last_info.style != line.style)
                {
                    if (line.style.direction)
                    {
                        play_ground.context2d.direction = line.style.direction;
                    }
                    if (line.style.font)
                    {
                        play_ground.context2d.font = line.style.font;
                    }
                    if (line.style.textAlign)
                    {
                        play_ground.context2d.textAlign = line.style.textAlign;
                    }
                    if (line.style.textBaseline)
                    {
                        play_ground.context2d.textBaseline = line.style.textBaseline;
                    }
                }
                if (line.strokeWidth && line.strokeBrush)
                {
                    if (!last_info || last_info.strokeWidth != line.strokeWidth || last_info.strokeBrush != line.strokeBrush)
                    {
                        play_ground.context2d.strokeStyle = line.strokeBrush;
                        play_ground.context2d.lineWidth = line.strokeWidth;
                    }
                    play_ground.context2d.strokeText(line.text, current_x, current_y, current_w);
                }
                play_ground.context2d.fillText(line.text, current_x, current_y, current_w);
                w = Math.max(w, play_ground.context2d.measureText(line.text).width);
                const h = play_ground.context2d.measureText("lIqg").actualBoundingBoxDescent;
                current_y += line_padding + h;
            }

            this._measuredWidth = w;
            this._width = current_w ? current_w : w;
            this._height = current_y - line_padding;
        }

        private _measuredWidth: number = 0;
        private _width: number = 0;
        private _height: number = 0;
        private _linePadding: property<number>;
    }

    export class TextInput extends Sprite
    {
        constructor(
            x?: binding<number>,
            y?: binding<number>,
            w?: binding<number>,
            h?: binding<number>,
            text?: string,
            text_brush?: binding<Brush>,
            text_style?: binding<CanvasTextDrawingStyles>,
            background_brush?: binding<Brush>,
            fixWidth?: boolean
        )
        {
            super(x, y, w, h);
            this._text = text;
            this._textBrush = makeProp(text_brush, DefaultBrush);
            this._textStyle = makeProp(text_style, DefaultTextStyle);
            this._backgroundBrush = makeProp(background_brush, DefaultBrush);
            if (!fixWidth)

            this.addW(Utils.makeMod(this, (value: number) =>
            {
                return Math.max(value, this._textWidth);
            }));
        }

        public get visible(): boolean
        {
            const visible = super.getVisible();
            if (this._input)
            {
                this._input.style.visibility = visible ? "visible" : "hidden";
            }
            return visible;
        }
        public get text(): string
        {
            return this._input?.value ?? this._text ?? "";
        }
        public set text(value: string)
        {
            if (this._input)
            {
                this._input.value = value;
            }
            else
            {
                this._text = value;
            }
        }
        public get textWidth(): number
        {
            return this._textWidth;
        }
        public get textHeight(): number
        {
            return this._textHeight;
        }
        public readonly onKeyPress = new Utils.MulticastEvent<KeyboardEvent>();

        public dispose(): void
        {
            super.dispose();
            if (this._input)
            {
                document.body.removeChild(this._input);
                delete this._input;
            }
        }

        protected innerDraw(play_ground: PlayGround): void 
        {
            if (!this._input)
            {
                const input = document.createElement("input");
                input.type = "text";
                input.onkeyup = Utils.makeMod(this, (event: KeyboardEvent) =>
                {
                    event.cancelBubble = !this.onKeyPress.emitEvent(event);
                    return event;
                });
                document.body.appendChild(input);
                this._input = input;
                this._input.style.border = "none";
                this._input.style.outline = "none";
                this._input.style.position = "absolute";
                this._input.value = this._text ?? "";
            }

            const parent = play_ground.context2d.canvas;
            const style = this._input.style;
            style.left = TextInput.toHtmlPixels(this.x + parent.offsetLeft);
            style.top = TextInput.toHtmlPixels(this.y + parent.offsetTop);
            style.width = TextInput.toHtmlPixels(this.w);
            style.height = TextInput.toHtmlPixels(this.h);
            if (this._textBrush)
            {
                style.color = `${this._textBrush.value}`;
            }
            if (this._backgroundBrush)
            {
                style.backgroundColor = `${this._backgroundBrush.value}`;
            }
            if (this._textStyle)
            {
                const text_style = this._textStyle.value;
                style.font = text_style.font;
                style.direction = text_style.direction;
                style.textAlign = text_style.textAlign;

                play_ground.context2d.direction = text_style.direction;
                play_ground.context2d.font = text_style.font;
                play_ground.context2d.textAlign = text_style.textAlign;
            }
            else
            {
                play_ground.context2d.direction = style.direction as CanvasDirection;
                play_ground.context2d.font = style.font;
                play_ground.context2d.textAlign = style.textAlign as CanvasTextAlign;
            }
            this._textWidth = play_ground.context2d.measureText(this.text).width;
            this._textHeight = play_ground.context2d.measureText("lIqg").actualBoundingBoxDescent;
        }

        protected static toHtmlPixels(value: number): string
        {
            return `${value}px`;
        }

        private _text?: string;
        private _input?: HTMLInputElement;
        private _textWidth: number = 0;
        private _textHeight: number = 0;
        public readonly _textBrush: property<Brush>;
        public readonly _backgroundBrush: property<Brush>;
        public readonly _textStyle: property<CanvasTextDrawingStyles>;
    }

    abstract class PolySprite extends Sprite
    {
        /** optional params: x, y, line_width, brush*/
        constructor(x?: binding<number>, y?: binding<number>, line_width?: binding<number>, brush?: binding<Brush>, scale?: binding<number>)
        {
            super(x, y);
            this.lineWidth = makeProp<number>(line_width, 1);
            this.brush = makeProp<Brush>(brush, DefaultBrush);
            this.scale = makeProp<number>(scale, 1);
        }

        public readonly lineWidth: property<number>;
        public readonly brush: property<Brush>;
        public readonly scale: property<number>;

        public addPolygon(polygon: IPolygon): void
        {
            if (!this._path)
            {
                this._path = new Path2D();
            }
            this._path.addPath(polygon.path);
            this.addW(Utils.makeMod(this, (value: number) => Math.max(value, polygon.box.right) + this.lineWidth.value));
            this.addH(Utils.makeMod(this, (value: number) => Math.max(value, polygon.box.bottom) + this.lineWidth.value));
        }
        public isPointHit(play_ground: PlayGround, point: IPoint): boolean
        {
            assert(this._path);
            play_ground.context2d.beginPath();
            const current_transform = play_ground.context2d.getTransform();
            play_ground.context2d.setTransform(
                current_transform.a * this.scale.value,
                current_transform.b,
                current_transform.c,
                current_transform.d * this.scale.value,
                current_transform.e + this.x,
                current_transform.f + this.y);
            const ret = play_ground.context2d.isPointInPath(this._path, point.x, point.y);
            play_ground.context2d.setTransform(current_transform);
            return ret;
        }

        protected innerDraw(play_ground: PlayGround): void
        {
            assert(this._path);
            PlayGround.drawingSprites++;
            play_ground.context2d.beginPath();
            const current_transform = play_ground.context2d.getTransform();
            const dw = this.deltaLineWidth;
            play_ground.context2d.setTransform(
                current_transform.a * this.scale.value,
                current_transform.b,
                current_transform.c,
                current_transform.d * this.scale.value,
                toInt(current_transform.e + (this.x + dw) * play_ground.ratio),
                toInt(current_transform.f + (this.y + dw) * play_ground.ratio)
            );
            this.onDraw(play_ground, this._path);
            play_ground.context2d.setTransform(current_transform);
        }
        protected reset(): void
        {
            delete this._path;
        }
        protected abstract onDraw(play_ground: PlayGround, path: Path2D): void;

        private get deltaLineWidth(): number
        {
            return this.lineWidth.value / 2;
        }

        private _path?: Path2D;
    }

    export class Polyline extends PolySprite
    {
        protected onDraw(play_ground: PlayGround, path: Path2D): void
        {
            play_ground.context2d.lineWidth = this.lineWidth.value;
            play_ground.context2d.strokeStyle = this.brush.value;
            play_ground.context2d.stroke(path);
        }
    }

    export class Polyshape extends PolySprite
    {
        protected onDraw(play_ground: PlayGround, path: Path2D): void
        {
            play_ground.context2d.fillStyle = this.brush.value;
            play_ground.context2d.fill(path);
        }
    }

    export abstract class Debug
    {
        public static dot(play_groun: PlayGround, x: number, y: number, radius: number = 5)
        {
            play_groun.context2d.beginPath();
            play_groun.context2d.moveTo(x, y);
            play_groun.context2d.fillStyle = "Red";
            play_groun.context2d.arc(x, y, radius, 0, Math.PI * 2);
            play_groun.context2d.closePath();
            play_groun.context2d.fill();
        }
    }

    export class LatexContainer extends Sprite
    {
        constructor(latex_engine: Geoma.Latex.LatexEngine, formula: binding<string>, x?: binding<number>, y?: binding<number>, scale?: number)
        {
            super(x, y);

            this.addW(Utils.makeMod(this, () => (this._renderedImage?.width ?? 0) * this._scale));
            this.addH(Utils.makeMod(this, () => (this._renderedImage?.height ?? 0) * this._scale));

            this._formula = makeProp<string>(formula, ``);
            this._scale = scale ?? 1;
            this._latexEngine = latex_engine;
        }

        public innerDraw(play_ground: PlayGround)
        {
            this._latexEngine.drawLatex(this._formula.value, this.x, this.y, this._scale, play_ground.context2d);
        }

        private _scale: number;
        private _formula: property<string>;
        private _latexEngine: Geoma.Latex.LatexEngine;

        private get _renderedImage(): HTMLImageElement | null
        {
            return this._latexEngine.getRenderedImage(this._formula.value) ?? null;
        }
    }
}