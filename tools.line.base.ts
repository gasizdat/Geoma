/// <reference path="utils.ts" />
/// <reference path="sprites.ts" />
/// <reference path="polygons.ts" />
/// <reference path="interfaces.ts" />
/// <reference path="play_ground.ts" />
/// <reference path="tools.document.ts" />
/// <reference path="tools.core.ts" />
/// <reference path="tools.menu.ts" />
/// <reference path="tools.tools.ts" />
/// <reference path="tools.styles.ts" />
/// <reference path="tools.point.base.ts" />
/// <reference path="tools.intersections.ts" />

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

    export type LineSegmentCoefficients = { k: number; b: number; }

    export type CircleLineIntersection = { p1?: IPoint; p2?: IPoint; }

    export interface SegmentInfo
    {
        x1: number;
        y1: number;
        x2: number;
        y2: number;
    }

    export interface SegmentFixInfo extends SegmentInfo
    {
        length: number;
    }

    export abstract class ActiveLineBase extends DocumentSprite<Sprite.Sprite> implements ILine
    {
        constructor(
            document: Document,
            start: IPoint,
            end: IPoint,
            line_width: binding<number>,
            brush: binding<Sprite.Brush>,
            selected_brush: binding<Sprite.Brush>
        )
        {
            class stub extends Sprite.Sprite
            {
                protected innerDraw(play_ground: PlayGround): void
                {
                    throw new Error("Method not implemented.");
                }
            }
            super(
                document,
                new stub(
                    () => Math.min(start.x, end.x),
                    () => Math.min(start.y, end.y),
                    () => Math.abs(start.x - end.x),
                    () => Math.abs(start.y - end.y))
            );
            this._startPoint = start;
            this._endPoint = end;
            this.lineWidth = makeProp(line_width, 1);
            this.brush = makeProp(brush, "Black");
            this.selectedBrush = makeProp(selected_brush, "Black");
        }

        public get projX(): number
        {
            return this.w;
        }
        public get projY(): number
        {
            return this.h;
        }
        public get length(): number
        {
            return Math.sqrt(this.projX * this.projX + this.projY * this.projY);
        }
        public get angle(): number
        {
            return ActiveLineBase.getAngle(this._startPoint.x, this._startPoint.y, this._endPoint.x, this._endPoint.y);
        }
        public get coefficients(): LineSegmentCoefficients | null
        {
            return ActiveLineBase.getCoefficients(
                this._startPoint.x,
                this._startPoint.y,
                this._endPoint.x,
                this._endPoint.y
            );
        }
        public get info(): SegmentInfo
        {
            return {
                x1: this._startPoint.x,
                y1: this._startPoint.y,
                x2: this._endPoint.x,
                y2: this._endPoint.y
            };
        }
        public get startPoint(): IPoint
        {
            return this._startPoint;
        }
        public get endPoint(): IPoint
        {
            return this._endPoint;
        }
        public abstract get moved(): boolean;

        public readonly lineWidth: property<number>;
        public readonly brush: property<Sprite.Brush>;
        public readonly selectedBrush: property<Sprite.Brush>;

        /**
            * Return quadrant of a line with starting from (x0, y0) and ending at (x1, y1)
            * @param x1 - start x of line
            * @param y1 - start y of line
            * @param x2 - end x of line
            * @param y2 - end y of line
            */
        public static getQuadrant(x1: number, y1: number, x2: number, y2: number): 1 | 2 | 3 | 4
        {
            if (x1 <= x2)
            {
                if (y1 > y2)
                {
                    return 1;
                }
                else
                {
                    return 2;
                }
            }
            else if (y1 < y2)
            {
                return 3;
            }
            else
            {
                return 4;
            }
        }
        /**
            * Angle (rad) between a line and x-axis in clockwise direction
            * @param x1 - start x of line
            * @param y1 - start y of line
            * @param x2 - end x of line
            * @param y2 - end y of line
            */
        public static getAngle(x1: number, y1: number, x2: number, y2: number): number;
        /**
            * Minimal (internal) angle (rad) between a line one and line two with common point
            * @param x0 - x of common point of lines
            * @param y0 - y of common point of lines
            * @param x1 - x of opposite point of line one
            * @param y1 - y of opposite point of line one
            * @param x2 - x of opposite point of line two
            * @param y2 - y of opposite point of line two
            */
        public static getAngle(x0: number, y0: number, x1: number, y1: number, x2: number, y2: number): number
        public static getAngle(...args: any[]): number
        {
            const x0 = args[0] as number, y0 = args[1] as number, x1 = args[2] as number, y1 = args[3] as number;
            if (args.length == 4)
            {
                const q = ActiveLineBase.getQuadrant(x0, y0, x1, y1);
                switch (q)
                {
                    case 1:
                        return (2 * Math.PI) - Math.atan((y0 - y1) / (x1 - x0));
                    case 2:
                        return Math.atan((y1 - y0) / (x1 - x0));
                    case 3:
                        return (Math.PI / 2) + Math.atan((x0 - x1) / (y1 - y0));
                    default:
                        return Math.PI + Math.atan((y0 - y1) / (x0 - x1));
                }

                //return Math.atan2(y1 - y0, x1 - x0);
            }
            else if (args.length == 6)
            {
                const x2 = args[4] as number, y2 = args[5] as number;
                const a1 = this.getAngle(x0, y0, x1, y1);
                const a2 = this.getAngle(x0, y0, x2, y2);
                const a = Math.abs(a1 - a2);
                if (a > Math.PI)
                {
                    return 2 * Math.PI - a;
                }
                else
                {
                    return a;
                }
            }
            else
            {
                assert(false);
            }
        }
        public static getY(x: number, coefficients: LineSegmentCoefficients): number
        {
            return coefficients.k * x + coefficients.b;
        }
        public static getX(y: number, coefficients: LineSegmentCoefficients): number
        {
            return (y - coefficients.b) / coefficients.k;
        }
        /**
        * Line segment formula coeficients
        * @param x1 - start x of line segment
        * @param y1 - start y of line segment
        * @param x2 - end x of line segment
        * @param y2 - end y of line segment
        */
        public static getCoefficients(x1: number, y1: number, x2: number, y2: number): LineSegmentCoefficients | null
        {
            const dx = x2 - x1;
            if (dx)
            {
                const dy = y2 - y1;
                const k = dy / dx;
                const b = y1 - x1 * k;
                return { k: k, b: b };
            }
            else
            {
                return null;
            }
        }

        public mouseHit(point: IPoint): boolean
        {
            return this.visible && PointLine.intersected(
                point,
                this._startPoint,
                this._endPoint,
                Thickness.Mouse
            );
        }
        public setLength(value: number, fix_point?: IPoint): void
        {
            assert(false, "Not implemented yet");
        }
        public getQuadrant(start: IPoint): number
        {
            assert(start);
            let end: IPoint;
            if (start == this._startPoint)
            {
                end = this._endPoint;
            }
            else
            {
                end = this._startPoint;
            }
            return ActiveLineBase.getQuadrant(start.x, start.y, end.x, end.y);
        }
        public getAngle(start: IPoint): number
        {
            assert(start);
            let end: IPoint;
            if (start == this._startPoint)
            {
                end = this._endPoint;
            }
            else
            {
                end = this._startPoint;
            }
            return ActiveLineBase.getAngle(start.x, start.y, end.x, end.y);
        }
        public setAngle(value: number, pivot_point?: IPoint)
        {
            assert(false, "Not implemented yet");
        }
        public through(p: ActivePointBase)
        {
            assert(this.belongs(p));
            if (!PointLine.intersected(p, this.startPoint, this.endPoint, Thickness.Calc))
            {
                let dx = this._startPoint.x - p.x;
                let dy = this._startPoint.y - p.y;
                const l1 = Math.sqrt(dx * dx + dy * dy);
                dx = this._endPoint.x - p.x;
                dy = this._endPoint.y - p.y;
                const l2 = Math.sqrt(dx * dx + dy * dy);
                if (l1 < l2)
                {
                    const a = ActiveLineBase.getAngle(this._endPoint.x, this._endPoint.y, p.x, p.y);
                    this.setAngle(a, this._endPoint);
                }
                else if (l1 > l2)
                {
                    const a = ActiveLineBase.getAngle(this._startPoint.x, this._startPoint.y, p.x, p.y);
                    this.setAngle(a, this._startPoint);
                }
            }
        }
        public isPivot(point: IPoint): boolean
        {
            return this._startPoint == point || this._endPoint == point;
        }
        public addPoint(point: ActivePointBase): void
        {
            assert(false, "Not implemented yet");
        }
        public removePoint(point: ActivePointBase): void
        {
            assert(false, "Not implemented yet");
        }
        public abstract move(dx: number, dy: number): void;
        public abstract belongs(p1: ActivePointBase): boolean;

        protected innerDraw(play_ground: PlayGround): void
        {
            play_ground.context2d.beginPath();
            play_ground.context2d.lineWidth = this.lineWidth.value;
            play_ground.context2d.strokeStyle = this.selected ? this.selectedBrush.value : this.brush.value;
            play_ground.context2d.moveTo(this._startPoint.x, this._startPoint.y);
            play_ground.context2d.lineTo(this._endPoint.x, this._endPoint.y);
            play_ground.context2d.stroke();
        }
        protected mouseMove(event: MouseEvent): void
        {
            this.selected = this.mouseHit(event);
            super.mouseMove(event);
        }

        private readonly _startPoint: IPoint;
        private readonly _endPoint: IPoint;
    }
}