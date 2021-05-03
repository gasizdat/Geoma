/// <reference path="utils.ts" />
/// <reference path="polygons.ts" />
/// <reference path="interfaces.ts" />
/// <reference path="play_ground.ts" />

module Geoma.Sprite
{
    import makeProp = Utils.makeProp;
    import toInt = Utils.toInt;
    import Point = Utils.Point;
    import assert = Utils.assert;
    import MulticastEvent = Utils.MulticastEvent;
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
            return this._visible.value;
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
        public mouseUp(event: MouseEvent): void
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
            const dw = this.deltaLineWidth;
            this.addW(((value: number) => Math.max(value, polygon.box.right) + dw).bind(this));
            this.addH(((value: number) => Math.max(value, polygon.box.bottom) + dw).bind(this));
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
            return this.lineWidth.value ? (this.lineWidth.value / 2) : 0;
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
        public static dot(play_groun: PlayGround, x: number, y: number)
        {
            play_groun.context2d.beginPath();
            play_groun.context2d.moveTo(x, y);
            play_groun.context2d.fillStyle = "Red";
            play_groun.context2d.arc(x, y, 5, 0, Math.PI * 2);
            play_groun.context2d.closePath();
            play_groun.context2d.fill();
        }
    }
}