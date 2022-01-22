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
    import makeProp = Utils.makeProp;
    import Point = Utils.Point;
    import assert = Utils.assert;
    import property = Utils.ModifiableProperty;
    import binding = Utils.binding;

    export type LineCoefficients = { k: number; b: number; }

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

    export interface LineDrawInfo
    {
        readonly startPoint: IPoint;
        readonly endPoint: IPoint;
    }

    export abstract class ActiveLineBase extends DocumentSprite<Sprite.Sprite> implements ILine
    {
        constructor(
            document: Document,
            start: ActivePointBase,
            end: ActivePointBase,
            line_width: binding<number>,
            brush: binding<Sprite.Brush>,
            selected_brush: binding<Sprite.Brush>
        )
        {
            class stub extends Sprite.Sprite
            {
                protected innerDraw(__play_ground: PlayGround): void
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
        public get coefficients(): LineCoefficients | null
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
        public get startPoint(): ActivePointBase
        {
            return this._startPoint;
        }
        public get endPoint(): ActivePointBase
        {
            return this._endPoint;
        }
        public abstract get isPartOf(): ActiveLineBase | null;
        public abstract get points(): Array<ActivePointBase>;

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
        public static getAngle(line1: ActiveLineBase, line2: ActiveLineBase): number;
        public static getAngle(...args: any[]): number
        {
            switch (args.length)
            {
                case 2:
                    {
                        const line1 = args[0] as ActiveLineBase;
                        const line2 = args[1] as ActiveLineBase;
                        const k1 = line1.coefficients ? line1.coefficients.k : 0;
                        const k2 = line2.coefficients ? line2.coefficients.k : 0;

                        const ret = Math.atan((k2 - k1) / (1 + (k1 * k2)));
                        if (ret < 0)
                        {
                            return Math.PI + ret;
                        }
                        else
                        {
                            return ret;
                        }
                    }
                case 4:
                    {
                        const x0 = args[0] as number, y0 = args[1] as number, x1 = args[2] as number, y1 = args[3] as number;
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
                    }
                case 6:
                    {
                        const x0 = args[0] as number, y0 = args[1] as number, x1 = args[2] as number, y1 = args[3] as number;
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
                default:
                    {
                        assert(false);
                    }
            }
        }
        public static getLength(p1: IPoint, p2: IPoint): number
        {
            const p = Point.sub(p1, p2);
            return Math.sqrt(p.x * p.x + p.y * p.y);
        }
        /**
         * Minimal offset around of pivot coords to rotate line by the given angle
         * @param value - target angle
         * @param pivot_x - x of pivot point
         * @param pivot_y - y of pivot point
         * @param x2 - x of moved point
         * @param y2 - y of moved point
         */
        public static setAngle(value: number, pivot_x: number, pivot_y: number, x2: number, y2: number): IPoint
        {
            const dx = pivot_x - x2;
            const dy = pivot_y - y2;
            const length = Math.sqrt(dx * dx + dy * dy);
            const x1 = pivot_x + Math.cos(value) * length;
            const y1 = pivot_y + Math.sin(value) * length;
            return Point.make(x2 - x1, y2 - y1);
        }
        public static getY(x: number, coefficients: LineCoefficients): number
        {
            return coefficients.k * x + coefficients.b;
        }
        public static getX(y: number, coefficients: LineCoefficients): number
        {
            return (y - coefficients.b) / coefficients.k;
        }
        /**
        * Line segment formula coefficients
        * @param x1 - start x of line segment
        * @param y1 - start y of line segment
        * @param x2 - end x of line segment
        * @param y2 - end y of line segment
        */
        public static getCoefficients(x1: number, y1: number, x2: number, y2: number): LineCoefficients | null
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
        public static getLineDrawInfo(document: Document, pivot: IPoint, angle: number): LineDrawInfo
        {
            const offset = document.mouseArea.offset;
            const viewport_w = document.mouseArea.w;
            const viewport_h = document.mouseArea.h;
            const tan_angle = Math.tan(angle);
            if (tan_angle == 0)
            {
                return { startPoint: Point.make(offset.x - viewport_w, pivot.y), endPoint: Point.make(offset.x + viewport_w * 2, pivot.y) };
            }

            const x0 = pivot.x - offset.x;
            const y0 = pivot.y - offset.y;

            let x1 = x0 - y0 / tan_angle;
            let y1 = 0;

            if (x1 < 0)
            {
                y1 -= x1 * tan_angle;
                x1 = 0;
            }
            else if (x1 > viewport_w)
            {
                y1 -= (x1 - viewport_w) * tan_angle;
                x1 = viewport_w;
            }

            y1 += offset.y;
            x1 += offset.x;

            let x2 = x0 - (y0 - viewport_h) / tan_angle;
            let y2 = viewport_h;

            if (x2 < 0)
            {
                y2 -= x2 * tan_angle;
                x2 = 0;
            }
            else if (x2 > viewport_w)
            {
                y2 -= (x2 - viewport_w) * tan_angle;
                x2 = viewport_w;
            }

            y2 += offset.y;
            x2 += offset.x;

            return { startPoint: Point.make(x1, y1), endPoint: Point.make(x2, y2) };
        }
        public static getPoint(start_point: IPoint, end_point: IPoint, length: number): IPoint
        {
            const this_length = this.getLength(start_point, end_point);

            return Utils.Point.make
                (
                    start_point.x + (length * (end_point.x - start_point.x) / this_length),
                    start_point.y + (length * (end_point.y - start_point.y) / this_length)
                );
        }

        public mouseHit(__point: IPoint): boolean
        {
            return this.visible;
        }
        public setLength(__value: number, __fix_point?: IPoint): void
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
        public setAngle(__value: number, __pivot_point?: IPoint)
        {
            assert(false, "Not implemented yet");
        }
        public through(p: ActivePointBase)
        {
            assert(this.isRelated(p));
            if (!PointLineSegment.intersected(p, this.startPoint, this.endPoint, Thickness.Calc))
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
        public addPoint(__point: ActivePointBase): void
        {
            assert(false, "Not implemented yet");
        }
        public removePoint(__point: ActivePointBase): void
        {
            assert(false, "Not implemented yet");
        }
        public setParallelTo(other_segment: ActiveLineBase): void
        {
            const start_angle_1 = ActiveLineBase.getAngle(this.startPoint.x, this.startPoint.y, this.endPoint.x, this.endPoint.y);
            const end_angle_1 = ActiveLineBase.getAngle(this.endPoint.x, this.endPoint.y, this.startPoint.x, this.startPoint.y);
            const start_angle_2 = ActiveLineBase.getAngle(other_segment.startPoint.x, other_segment.startPoint.y, other_segment.endPoint.x, other_segment.endPoint.y);
            const end_angle_2 = ActiveLineBase.getAngle(other_segment.endPoint.x, other_segment.endPoint.y, other_segment.startPoint.x, other_segment.startPoint.y);
            let rotate_angle_abs = 2 * Math.PI;
            let rotate_angle: number;
            let rotate_start = false;
            if (Math.abs(start_angle_1 - start_angle_2) < rotate_angle_abs)
            {
                rotate_start = true;
                rotate_angle = start_angle_2;
                rotate_angle_abs = Math.abs(start_angle_1 - start_angle_2);
            }

            if (Math.abs(start_angle_1 - end_angle_2) < rotate_angle_abs)
            {
                rotate_start = true;
                rotate_angle = end_angle_2;
                rotate_angle_abs = Math.abs(start_angle_1 - end_angle_2);
            }

            if (Math.abs(end_angle_1 - start_angle_2) < rotate_angle_abs)
            {
                rotate_start = false;
                rotate_angle = start_angle_2;
                rotate_angle_abs = Math.abs(end_angle_1 - start_angle_2);
            }

            if (Math.abs(end_angle_1 - end_angle_2) < rotate_angle_abs)
            {
                rotate_start = false;
                rotate_angle = end_angle_2;
                rotate_angle_abs = Math.abs(end_angle_1 - end_angle_2);
            }

            if (rotate_start)
            {
                this.setAngle(rotate_angle!, this.startPoint);
            }
            else
            {
                this.setAngle(rotate_angle!, this.endPoint);
            }
        }
        public getPoint(pivot: IPoint, length: number): IPoint
        {
            assert(this.isPivot(pivot));

            const p2 = pivot == this.startPoint ? this.endPoint : this.startPoint;
            return ActiveLineBase.getPoint(pivot, p2, length);
        }
        public isRelated(p: ActivePointBase): boolean
        {
            return this.points.includes(p);
        }
        public getNearestPoints(point: IPoint): Array<ActivePointBase>
        {
            const ret = new Array<ActivePointBase>();
            const i = PointLine.intersection(point, this.startPoint, this.coefficients);
            let p1: ActivePointBase | null = null;
            let l1: number | null = null;
            let p2: ActivePointBase | null = null;
            let l2: number | null = null;

            const is_between = (p1: IPoint, l1: number, p2: IPoint, l2: number): boolean =>
            {
                const p1p2_len = ActiveLineBase.getLength(p1, p2);
                return p1p2_len >= l1 && p1p2_len >= l2;
            };

            for (const p of this.points)
            {
                const len = ActiveLineBase.getLength(i, p);
                if (l1 === null)
                {
                    l1 = len;
                    p1 = p;
                }
                else if (l2 === null)
                {
                    assert(p1);
                    if (is_between(p1, l1, p, len))
                    {
                        l2 = len;
                        p2 = p;
                    }
                    else if (l1 > len)
                    {
                        l1 = len;
                        p1 = p;
                    }
                }
                else 
                {
                    assert(p1);
                    assert(p2);
                    if (is_between(p1, l1, p, len) && ActiveLineBase.getLength(p1, p2) > ActiveLineBase.getLength(p1, p))
                    {
                        p2 = p;
                        l2 = len;
                    }
                    else if (is_between(p, len, p2, l2) && ActiveLineBase.getLength(p1, p2) > ActiveLineBase.getLength(p, p2))
                    {
                        p1 = p;
                        l1 = len;
                    }
                }
            }
            if (l1 !== null)
            {
                assert(p1);
                if (l2 !== null)
                {
                    assert(p2);
                    ret.push(p1);
                    ret.push(p2);
                }
                else
                {
                    ret.push(p1);
                }
            }

            return ret;
        }

        public abstract move(dx: number, dy: number): void;
        public abstract isMoved(receiptor: string): boolean;

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

        private readonly _startPoint: ActivePointBase;
        private readonly _endPoint: ActivePointBase;
    }
}