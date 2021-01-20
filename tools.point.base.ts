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
    import toInt = Utils.toInt;
    import Point = Utils.Point;
    import assert = Utils.assert;
    import Brush = Sprite.Brush;
    import MulticastEvent = Utils.MulticastEvent;
    import modifier = Utils.modifier;
    import property = Utils.ModifiableProperty;
    import Box = Utils.Box;
    import binding = Utils.binding;
    import Debug = Sprite.Debug;

    export abstract class ActivePointBase extends DocumentSprite<Sprite.Container> implements IPoint
    {
        constructor(
            document: Document,
            x: number,
            y: number,
            radius: number = 5,
            line_width: number = 2,
            brush: binding<Brush>,
            line_brush: binding<Brush>,
            select_line_brush: binding<Brush>
        )
        {
            super(document, new Sprite.Container(), true);

            const ellipse = new Polygon.Ellipse(Geoma.Utils.Point.make(radius, radius), radius, radius, 0, 2 * Math.PI);
            const bg = new Sprite.Polyshape(x - radius, y - radius, 0, brush);
            bg.addPolygon(ellipse);
            const line_brush_prop: property<Brush> = makeProp(line_brush, "BlacK");
            const select_line_brush_prop: property<Brush> = makeProp(select_line_brush, "Black");
            this._line = new Sprite.Polyline(
                x - radius - line_width / 2,
                y - radius - line_width / 2,
                line_width,
                makeMod(this, () => this.selected ? select_line_brush_prop.value : line_brush_prop.value)
            );
            this._line.addPolygon(ellipse);
            this.item.push(bg);
            this.item.push(this._line);
        }

        public get lineBrush(): Brush
        {
            return this._line.brush.value;
        }
        public get x(): number
        {
            return this._line.middleX;
        }
        public get y(): number
        {
            return this._line.middleY;
        }
        public get right(): number
        {
            return this._line.x + this.item.w;
        }
        public get bottom(): number
        {
            return this._line.y + this.item.h;
        }

        public setName(value: binding<string>, brush: binding<Brush>, style: binding<CanvasTextDrawingStyles>): void
        {
            assert(!this.name);
            const name_text = new Sprite.Text(this._line.right + 5, this.y, 0, 0, brush, style, value);
            this.item.push(name_text);
            this.item.name = name_text.text.value;
        }
        public serialize(context: SerializationContext): Array<string>
        {
            assert(false);
        }

        protected get boundingBox(): Box
        {
            return this._line;
        }
        protected abstract mouseClick(event: MouseEvent): void;
        protected mouseMove(event: MouseEvent): void
        {
            this.selected = this.mouseHit(event);
            super.mouseMove(event);
        }

        private _line: Sprite.Polyline;
    }
}