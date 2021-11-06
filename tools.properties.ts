/// <reference path="utils.ts" />
/// <reference path="sprites.ts" />
/// <reference path="polygons.ts" />
/// <reference path="interfaces.ts" />
/// <reference path="play_ground.ts" />
/// <reference path="tools.document.ts" />
/// <reference path="tools.resources.ts" />
/// <reference path="tools.core.ts" />
/// <reference path="tools.menu.ts" />
/// <reference path="tools.tools.ts" />
/// <reference path="tools.styles.ts" />
/// <reference path="tools.point.base.ts" />
/// <reference path="tools.point.active.ts" />
/// <reference path="tools.point.common.ts" />
/// <reference path="tools.line.base.ts" />
/// <reference path="tools.intersections.ts" />

module Geoma.Tools
{
    import binding = Utils.binding;
    import toFixed = Utils.toFixed;
    import toDeg = Utils.toDeg;

    export class Properties extends Container<Sprite.Sprite>
    {
        constructor(document: Document, x: binding<number>, y: binding<number>)
        {
            super();
            this.push(new Sprite.MultiLineText(x, y, 2));
            this._document = document;
        }

        protected innerDraw(play_ground: PlayGround): void
        {
            const text = this.first as Sprite.MultiLineText;
            const points = new Array<ActivePointBase>();
            const segments = new Array<ActiveLineBase>();
            const lines = new Array<ActiveLineBase>();
            const angles = new Array<AngleIndicator>();
            const circles = new Array<ActiveCircleLine>();
            const parametric_lines = new Array<ParametricLine>();
            const empty_line = { brush: CurrentTheme.PropertyTextBrush, style: CurrentTheme.PropertyTextStyle, text: "" };

            for (let i = 0; i < this._document.points.length; ++i)
            {
                const point = this._document.points.item(i) as ActivePointBase;
                points.push(point);
            }
            for (let i = 0; i < this._document.lines.length; ++i)
            {
                const line = this._document.lines.item(i);
                if (line instanceof ActiveLineSegment)
                {
                    segments.push(line);
                }
                else 
                {
                    lines.push(line as ActiveLineBase);
                }
            }
            for (let i = 0; i < this._document.angles.length; ++i)
            {
                angles.push(this._document.angles.item(i) as AngleIndicator);
            }
            for (let i = 0; i < this._document.circles.length; ++i)
            {
                circles.push(this._document.circles.item(i) as ActiveCircleLine);
            }
            for (let i = 0; i < this._document.parametrics.length; ++i)
            {
                parametric_lines.push(this._document.parametrics.item(i) as ParametricLine);
            }


            points.sort(this._nameCollator);
            segments.sort(this._nameCollator);
            lines.sort(this._nameCollator);
            angles.sort(this._nameCollator);
            circles.sort(this._nameCollator);
            parametric_lines.sort(this._nameCollator);

            text.textLines.splice(0);

            for (const point of points)
            {
                text.textLines.push({
                    brush: this._getBrush(point),
                    style: CurrentTheme.PropertyTextStyle,
                    text: Resources.string("Точка({0}: x={1}; y={2})", point.name, this._toFixed(point.x), this._toFixed(point.y))
                });
            }
            if (points.length)
            {
                text.textLines.push(empty_line);
            }

            for (const segment of segments)
            {
                text.textLines.push({
                    brush: this._getBrush(segment),
                    style: CurrentTheme.PropertyTextStyle,
                    text: Resources.string("Отрезок({0}: l={1}; α={2}°)", segment.name, this._toFixed(segment.length), this._getAngle(segment))
                });
            }
            if (segments.length)
            {
                text.textLines.push(empty_line);
            }

            for (const line of lines)
            {
                text.textLines.push({
                    brush: this._getBrush(line),
                    style: CurrentTheme.PropertyTextStyle,
                    text: Resources.string("Линия({0}: α={1}°)", line.name, this._getAngle(line))
                });
            }
            if (lines.length)
            {
                text.textLines.push(empty_line);
            }

            for (const circle of circles)
            {
                text.textLines.push({
                    brush: this._getBrush(circle),
                    style: CurrentTheme.PropertyTextStyle,
                    text: Resources.string("Окружность({0}: Ø={1})", circle.name, this._toFixed(circle.radius * 2))
                });
            }
            if (circles.length)
            {
                text.textLines.push(empty_line);
            }

            for (const parametric_line of parametric_lines)
            {
                text.textLines.push({
                    brush: this._getBrush(parametric_line),
                    style: CurrentTheme.PropertyTextStyle,
                    text: Resources.string("Функция(f={0})", parametric_line.code.text)
                });
            }
            if (parametric_lines.length)
            {
                text.textLines.push(empty_line);
            }

            for (const angle of angles)
            {
                text.textLines.push({
                    brush: this._getBrush(angle),
                    style: CurrentTheme.PropertyTextStyle,
                    text: Resources.string("Угол({0}: {1}={2}°)", angle.realName, angle.realName != angle.name ? angle.name : "α", this._toFixed(toDeg(angle.angle)))
                });
            }

            super.innerDraw(play_ground);
        }

        private _toFixed(value: number): string
        {
            return toFixed(value, CurrentTheme.CoordinatesPrecision);
        }
        private _getAngle(line: ActiveLineBase): string
        {
            return toFixed(toDeg((Math.PI - line.angle) % Math.PI), CurrentTheme.CoordinatesPrecision);
        }
        private _getBrush<TSprite extends Sprite.Sprite>(sprite: DocumentSprite<TSprite>): Sprite.Brush
        {
            return sprite.selected ? CurrentTheme.PropertySelectedTextBrush : CurrentTheme.PropertyTextBrush;
        }
        private _nameCollator(s1: Sprite.Sprite, s2: Sprite.Sprite): number
        {
            return s1.name.localeCompare(s2.name, undefined, Properties._nameCollatorOptions);
        }


        private readonly _document: Document;
        private static readonly _nameCollatorOptions = {
            numeric: true,
            ignorePunctuation: true
        };
    }
}