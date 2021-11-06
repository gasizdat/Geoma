/// <reference path="utils.ts" />
/// <reference path="sprites.ts" />
/// <reference path="polygons.ts" />
/// <reference path="interfaces.ts" />
/// <reference path="play_ground.ts" />
/// <reference path="tools.core.ts" />
/// <reference path="tools.document.ts" />
/// <reference path="tools.point.base.ts" />
/// <reference path="tools.point.active.ts" />
/// <reference path="tools.line.base.ts" />
/// <reference path="tools.line.segment.ts" />
/// <reference path="tools.line.circle.ts" />
/// <reference path="tools.parametric.line.ts" />

module Geoma.Tools
{
    import makeMod = Utils.makeMod;
    import makeProp = Utils.makeProp;
    import Point = Utils.Point;
    import assert = Utils.assert;
    import property = Utils.ModifiableProperty;

    export type GraphLine = ActiveLineBase | ActiveCircleLine | ParametricLine;

    export abstract class Intersection
    {
        constructor(start_point: IPoint)
        {
            this._startPoint = start_point;
        }

        public get dx(): number
        {
            return this.startPoint.x - this.point.x;
        }
        public get dy(): number
        {
            return this.startPoint.y - this.point.y;
        }
        public get disposed(): boolean
        {
            return this._disposed;
        }
        public get visible(): boolean
        {
            return !Point.isEmpty(this.point);
        }
        public abstract get point(): IPoint;

        public static makePoint(point: IPoint, line1: GraphLine, line2?: GraphLine): IPoint
        {
            if (line2 == undefined)
            {
                if (line1 instanceof ActiveLineBase)
                {
                    return PointLineSegment.intersection(point, line1.startPoint, line1.endPoint);
                }
                else if (line1 instanceof ActiveCircleLine)
                {
                    return PointCircle.intersection(point, line1);
                }
                else if (line1 instanceof ParametricLine)
                {
                    return PointParametric.intersection(point, line1);
                }
            }
            else
            {
                const make_helper = (point: IPoint, line1: GraphLine, line2: GraphLine): IPoint | null =>
                {
                    if (line1 instanceof ActiveLineBase)
                    {
                        if (line2 instanceof ActiveLineBase)
                        {
                            return LineLine.intersection(line1, line2);
                        }
                        else if (line2 instanceof ActiveCircleLine)
                        {
                            const intersection = LineCircle.intersection(line1, line2);
                            return LineCircle.preferredIntersection(LineCircle.getPreference(point, intersection), intersection);
                        }
                    }
                    return null;
                };

                let ret = make_helper(point, line1, line2);
                if (!ret && line2)
                {
                    ret = make_helper(point, line2, line1);
                }
                if (ret)
                {
                    return ret;
                }
            }
            assert(false, "Not supported");
        }
        public static makeIntersection(point: ActivePointBase, line1: GraphLine, line2?: GraphLine): Intersection
        {
            if (line2 == undefined)
            {
                if (line1 instanceof ActiveLineSegment)
                {
                    return new PointLineSegment(point, line1);
                }
                else if (line1 instanceof ActiveCircleLine)
                {
                    return new PointCircle(point, line1);
                }
                else if (line1 instanceof ParametricLine)
                {
                    return new PointParametric(point, line1);
                }
                else if (line1 instanceof ActiveLine)
                {
                    return new PointLine(point, line1);
                }
            }
            else
            {
                const make_helper = (point: ActivePointBase, line1: GraphLine, line2: GraphLine): Intersection | null =>
                {
                    if (line1 instanceof ActiveLineBase)
                    {
                        if (line2 instanceof ActiveLineBase)
                        {
                            return new LineLine(point, line1, line2);
                        }
                        else if (line2 instanceof ActiveCircleLine)
                        {
                            return new LineCircle(point, line1, line2);
                        }
                    }
                    return null;
                };

                let ret = make_helper(point, line1, line2);
                if (!ret && line2)
                {
                    ret = make_helper(point, line2, line1);
                }
                if (ret)
                {
                    return ret;
                }
            }
            assert(false, "Not supported");
        }

        public dispose(): void
        {
            this._disposed = true;
        }
        public move(__dx: number, __dy: number): void
        {
            assert(false, "Not supported");
        }

        protected get startPoint(): IPoint
        {
            return this._startPoint;
        }

        private _disposed: boolean = false;
        private _startPoint: IPoint;
    }

    enum LocusType { outerStart = 1, innerStart, innerEnd, outerEnd };
    export class PointLine extends Intersection
    {
        constructor(point: IPoint, line: ActiveLineBase)
        {
            super(PointLine.intersection(point, line.startPoint, line.coefficients));
            this._line = line;
            this.updateLocusInfo(point);

            this._intersection = makeProp(makeMod(this, (): IPoint =>
            {
                const c = LineCircle.intersection(
                    this._line,
                    {
                        center: this._center,
                        radius: this._locusRadius
                    }
                );
                assert(c.p1 && c.p2);
                switch (this._locus)
                {
                    case LocusType.outerStart:
                        if (this.locus(c.p1) == LocusType.outerStart)
                        {
                            return c.p1;
                        }
                        else
                        {
                            return c.p2;
                        }
                    case LocusType.innerStart:
                        if (this.locus(c.p1) == LocusType.outerStart)
                        {
                            return c.p2;
                        }
                        else
                        {
                            return c.p1;
                        }
                    case LocusType.innerEnd:
                        if (this.locus(c.p1) == LocusType.outerEnd)
                        {
                            return c.p2;
                        }
                        else
                        {
                            return c.p1;
                        }
                    case LocusType.outerEnd:
                        if (this.locus(c.p1) == LocusType.outerEnd)
                        {
                            return c.p1;
                        }
                        else
                        {
                            return c.p2;
                        }
                    default:
                        assert(false);
                }
            }), Point.empty);
        }

        public get point(): IPoint 
        {
            return this._intersection.value;
        }

        public dispose(): void
        {
            if (!this.disposed)
            {
                super.dispose();
                this._intersection.reset();
            }
        }
        public move(dx: number, dy: number): void
        {
            this.updateLocusInfo(Point.sub(this.point, Point.make(dx, dy)));
        }

        public static intersection(point: IPoint, pivot_point: IPoint, coefficient: LineCoefficients | null): IPoint
        {
            if (coefficient)
            {
                return Point.make(point.x, ActiveLineBase.getY(point.x, coefficient));
            }
            else
            {
                return Point.make(pivot_point.x, point.y);
            }
        }
        public static intersected(point: IPoint, pivot_point: IPoint, coefficient: LineCoefficients | null, sensitivity: number): boolean
        {
            assert(sensitivity >= 0);

            if (coefficient)
            {
                const y = ActiveLineBase.getY(point.x, coefficient);
                if (Math.abs(y - point.y) <= sensitivity)
                {
                    return true;
                }
                else
                {
                    const x = ActiveLineBase.getX(point.y, coefficient);
                    if (Math.abs(x - point.x) <= sensitivity)
                    {
                        return true;
                    }
                    else
                    {
                        return false;
                    }
                }
            }
            else
            {
                return Math.abs(point.x - pivot_point.x) <= sensitivity;
            }
        }

        protected updateLocusInfo(point: IPoint): void
        {
            this._locus = this.locus(point);
            const dp = Point.sub(point, this._center);
            this._locusRadius = Math.sqrt(dp.x * dp.x + dp.y * dp.y);
        }
        protected locus(point: IPoint): LocusType
        {
            // -------(x1)------(start)------(x2)----------(x3)------(end)------(x4)------
            // ---[outerStart]-----*-----[innerStart]---[innerEnd]-----*-----[outerEnd]---
            const line_length = this._line.length;
            const dp_start = Point.sub(this._line.startPoint, point);
            const start_length = Math.sqrt(dp_start.x * dp_start.x + dp_start.y * dp_start.y);
            const dp_end = Point.sub(this._line.endPoint, point);
            const end_length = Math.sqrt(dp_end.x * dp_end.x + dp_end.y * dp_end.y);
            if (start_length <= line_length && end_length <= line_length)
            {
                if (start_length < end_length)
                {
                    return LocusType.innerStart;
                }
                else
                {
                    return LocusType.innerEnd;
                }
            }
            else if (start_length < end_length)
            {
                return LocusType.outerStart;
            }
            else
            {
                return LocusType.outerEnd;
            }
        }

        private get _center(): IPoint
        {
            return (this._locus == LocusType.innerEnd || this._locus == LocusType.outerEnd) ? this._line.endPoint : this._line.startPoint;
        }
        private _line: ActiveLineBase;
        private _locusRadius!: number;
        private _locus!: LocusType;
        private _intersection: property<IPoint>;
    }

    export class PointLineSegment extends Intersection
    {
        constructor(point: IPoint, line: ActiveLineBase)
        {
            super(PointLineSegment.intersection(point, line.startPoint, line.endPoint));
            this._line = line;
            const dp = Point.sub(this.startPoint, line.startPoint);
            const length = Math.sqrt(dp.x * dp.x + dp.y * dp.y);
            this._startRatio = length / line.length;
            this._intersection = makeProp(makeMod(this, (): IPoint =>
            {
                const c = LineCircle.intersection(this._line, { center: this._line.startPoint, radius: this._line.length * this._startRatio });
                return c.p1 ?? c.p2 ?? Point.empty;
            }), Point.empty);
        }

        public get point(): IPoint 
        {
            return this._intersection.value;
        }

        public dispose(): void
        {
            if (!this.disposed)
            {
                super.dispose();
                this._intersection.reset();
            }
        }
        public move(dx: number, dy: number): void
        {
            const new_pos = Point.sub(this.point, Point.make(dx, dy));
            const dp = Point.sub(new_pos, this._line.startPoint);
            const length = Math.sqrt(dp.x * dp.x + dp.y * dp.y);
            if (length < this._line.length)
            {
                this._startRatio = length / this._line.length;
            }
        }

        public static intersection(point: IPoint, line_start: IPoint, line_end: IPoint): IPoint
        {
            const c = ActiveLineBase.getCoefficients(line_start.x, line_start.y, line_end.x, line_end.y);
            if (c)
            {
                return Point.make(point.x, ActiveLineBase.getY(point.x, c));
            }
            else
            {
                return Point.make(line_start.x, Utils.limit(point.y, line_start.y, line_end.y));
            }
        }
        public static intersected(point: IPoint, line_start: IPoint, line_end: IPoint, sensitivity: number): boolean
        {
            assert(sensitivity >= 0);
            //const dx = Math.abs(line_start.x - line_end.x);
            //if (dx <= sensitivity)
            //{
            //    return point.x >= (Point.left(line_start, line_end) - sensitivity) &&
            //        point.x <= (Point.right(line_start, line_end) + sensitivity) &&
            //        point.y >= Point.top(line_start, line_end) &&
            //        point.y <= Point.bottom(line_start, line_end);
            //}
            //else
            //{
            //    const p = this.getIntersection(point, line_start, line_end);
            //    if (p.x >= Point.left(line_start, line_end) && p.x <= Point.right(line_start, line_end) &&
            //        p.y >= Point.top(line_start, line_end) && p.y <= Point.bottom(line_start, line_end))
            //    {
            //        const dp = Point.sub(p, point);
            //        if (Math.abs(dp.x) <= sensitivity && Math.abs(dp.y) <= sensitivity)
            //        {
            //            return true;
            //        }
            //    }
            //}

            //return false;

            if (Math.abs(line_start.x - line_end.x) <= sensitivity)
            {
                return Math.abs(point.x - (line_start.x + line_end.x) / 2) <= sensitivity &&
                    Point.top(line_start, line_end) <= point.y &&
                    Point.bottom(line_start, line_end) >= point.y;
            }
            const coeff = ActiveLineBase.getCoefficients(line_start.x, line_start.y, line_end.x, line_end.y);
            if (coeff)
            {
                if (Math.abs(coeff.k) <= 0.5)
                {
                    if (point.x >= Point.left(line_start, line_end) && point.x <= Point.right(line_start, line_end))
                    {
                        const y = ActiveLineBase.getY(point.x, coeff);
                        return Math.abs(y - point.y) <= sensitivity;
                    }
                    else
                    {
                        return false;
                    }
                }
                else if (Point.top(line_start, line_end) <= point.y && Point.bottom(line_start, line_end) >= point.y)
                {
                    const x = ActiveLineBase.getX(point.y, coeff);
                    return Math.abs(x - point.x) <= sensitivity;
                }
            }
            return false;
        }

        private _line: ActiveLineBase;
        private _startRatio: number;
        private _intersection: property<IPoint>;
    }

    export class LineLine extends Intersection
    {
        constructor(__point: IPoint, line1: ActiveLineBase, line2: ActiveLineBase)
        {
            super(LineLine.intersection(line1, line2));
            this._intersection = makeProp((): IPoint =>
            {
                return LineLine.intersection(line1, line2);
            }, Point.empty);
        }

        public get point(): IPoint 
        {
            return this._intersection.value;
        }

        public dispose(): void
        {
            if (!this.disposed)
            {
                super.dispose();
                this._intersection.reset();
            }
        }

        public static intersection(line1: ActiveLineBase, line2: ActiveLineBase): IPoint
        {
            const coeff1 = line1.coefficients;
            const coeff2 = line2.coefficients;
            if (coeff1 && coeff2)
            {
                const dk = coeff1.k - coeff2.k;
                if (dk)
                {
                    const x = (coeff2.b - coeff1.b) / dk;
                    return Point.make(x, ActiveLineBase.getY(x, coeff1));
                }
                else
                {
                    assert(false, "todo");
                }
            }
            else if (coeff1)
            {
                return Point.make(line2.startPoint.x, ActiveLineBase.getY(line2.startPoint.x, coeff1));
            }
            else if (coeff2)
            {
                return Point.make(line1.startPoint.x, ActiveLineBase.getY(line1.startPoint.x, coeff2));
            }
            else
            {
                return Point.make(line1.startPoint.x, line1.startPoint.y);
            }
        }

        private _intersection: property<IPoint>;
    }

    export class PointCircle extends Intersection
    {
        constructor(point: IPoint, circle: ICircle)
        {
            super(PointCircle.intersection(point, circle));
            this._circle = circle;
            this._angle = ActiveLineBase.getAngle(circle.center.x, circle.center.y, point.x, point.y);
            this._intersection = makeProp(makeMod(this, (): IPoint =>
            {
                return Point.add(Point.make(circle.radius * Math.cos(this._angle), circle.radius * Math.sin(this._angle)), circle.center);
            }), Point.empty);
        }

        public get point(): IPoint 
        {
            return this._intersection.value;
        }

        public dispose(): void
        {
            this._intersection.reset();
            super.dispose();
        }
        public move(dx: number, dy: number): void
        {
            const point = Point.sub(this.point, Point.make(dx, dy));
            this._angle = ActiveLineBase.getAngle(this._circle.center.x, this._circle.center.y, point.x, point.y);
        }

        public static intersection(point: IPoint, circle: ICircle): IPoint
        {
            const angle = ActiveLineBase.getAngle(circle.center.x, circle.center.y, point.x, point.y);
            return Point.add(Point.make(circle.radius * Math.cos(angle), circle.radius * Math.sin(angle)), circle.center);
        }
        public static isIntersected(point: IPoint, circle: ICircle, sensitivity: number): boolean
        {
            assert(sensitivity);
            const dp = Point.sub(point, circle.center);
            const radius = Math.sqrt(dp.x * dp.x + dp.y * dp.y);
            return Math.abs(radius - circle.radius) <= sensitivity;
        }

        private _angle: number;
        private _circle: ICircle;
        private _intersection: property<IPoint>;
    }

    export class LineCircle extends Intersection
    {
        constructor(point: IPoint, line: ActiveLineBase, circle: ICircle)
        {
            super(Point.make(point.x, point.y));
            const intersection = LineCircle.intersection(line, circle);
            this._preference = LineCircle.getPreference(point, intersection);
            this._intersection = makeProp(makeMod(this, (): IPoint =>
            {
                const intersection = LineCircle.intersection(line, circle);
                return LineCircle.preferredIntersection(this._preference, intersection);
            }), Point.empty);
        }
        public get point(): IPoint 
        {
            return this._intersection.value;
        }

        public static intersection(line: ActiveLineBase, circle: ICircle): CircleLineIntersection
        {
            const x0 = circle.center.x;
            const y0 = circle.center.y;
            const r = circle.radius;
            const coeff = line.coefficients;
            if (coeff)
            {
                const k = coeff.k;
                const b = coeff.b;
                const r2 = r * r;
                const k2 = k * k;
                const kb = k * b;
                const ky0 = k * y0;
                const d = k2 * r2 - k2 * x0 * x0 - 2 * kb * x0 + 2 * ky0 * x0 - b * b + 2 * b * y0 - y0 * y0 + r2;
                const ret: CircleLineIntersection = {};
                if (d > 0)
                {
                    const k2_1 = k2 + 1;
                    const w = - kb + ky0 + x0;
                    {
                        const x = (Math.sqrt(d) + w) / k2_1;
                        const y = ActiveLineBase.getY(x, coeff);
                        const p1 = Point.make(x, y);
                        if (LineCircle.isPointLineIntersected(p1, line))
                        {
                            ret.p1 = p1;
                        }
                    }
                    {
                        const x = (w - Math.sqrt(d)) / k2_1;
                        const y = ActiveLineBase.getY(x, coeff);
                        const p2 = Point.make(x, y);
                        if (LineCircle.isPointLineIntersected(p2, line))
                        {
                            ret.p2 = p2;
                        }
                    }
                }
                return ret;
            }
            else //Vertical line segment
            {
                const x1 = line.startPoint.x;
                const dx = Math.abs(x1 - x0);
                if (dx > r)
                {
                    return { p1: undefined, p2: undefined };
                }
                else
                {
                    const h = Math.sqrt(r * r - dx * dx);
                    const p1y = y0 + h;
                    const p2y = y0 - h;
                    const ret: CircleLineIntersection = {};
                    if (LineCircle.isPointLineIntersected(Point.make(x1, p1y), line))
                    {
                        ret.p1 = Point.make(x1, p1y);
                    }
                    if (LineCircle.isPointLineIntersected(Point.make(x1, p2y), line))
                    {
                        ret.p2 = Point.make(x1, p2y);
                    }

                    return ret;
                }
            }
        }
        public static getPreference(point: IPoint, intersection: CircleLineIntersection): 0 | 1 | 2
        {
            if (intersection.p2 == undefined)
            {
                assert(intersection.p1);
                return 1;
            }
            else if (intersection.p1 == undefined)
            {
                assert(intersection.p2);
                return 2;
            }
            else
            {
                const dp1 = Point.sub(point, intersection.p1);
                const dp2 = Point.sub(point, intersection.p2);
                if ((dp1.x * dp1.x + dp1.y * dp1.y) > (dp2.x * dp2.x + dp2.y * dp2.y))
                {
                    return 2;
                }
                else
                {
                    return 1;
                }
            }
        }
        public static preferredIntersection(preference: 0 | 1 | 2, intersection: CircleLineIntersection): IPoint
        {
            let ret: IPoint | undefined;
            switch (preference)
            {
                case 1:
                    ret = intersection.p1;
                    break;
                case 2:
                    ret = intersection.p2;
                    break;
            }
            if (ret == undefined)
            {
                return Point.empty;
            }
            else
            {
                return ret;
            }
        }

        protected static isPointLineIntersected(point: IPoint, line: ActiveLineBase): boolean
        {
            if (line instanceof ActiveLineSegment)
            {
                return PointLineSegment.intersected(point, line.startPoint, line.endPoint, Thickness.Calc);
            }
            else if (line instanceof ActiveLine)
            {
                return PointLine.intersected(point, line.startPoint, line.coefficients, Thickness.Calc);
            }
            else
            {
                return false;
            }
        }

        private _preference: 0 | 1 | 2;
        private _intersection: property<IPoint>;
    }

    export class PointParametric extends Intersection
    {
        constructor(point: IPoint, line: ParametricLine)
        {
            super(PointParametric.intersection(point, line));
            this._line = line;
            this._startX = line.axes.fromScreenX(this.startPoint.x);
            this._intersection = makeProp(makeMod(this, (): IPoint =>
            {
                const x = this._line.axes.toScreenX(this._startX);
                const y = this._line.screenY(x);
                return PointParametric.intersection(Point.make(x, y), this._line);
            }), Point.empty);
        }

        public get point(): IPoint 
        {
            return this._intersection.value;
        }

        public dispose(): void
        {
            this._intersection.reset();
            super.dispose();
        }
        public move(dx: number, __dy: number): void
        {
            const x = this._line.axes.toScreenX(this._startX) - dx;
            this._startX = this._line.axes.fromScreenX(x);
        }

        public static intersection(point: IPoint, line: ParametricLine): IPoint
        {
            const y = line.screenY(point.x);
            return Point.make(point.x, y);
        }
        public static intersected(point: IPoint, line: ParametricLine, sensitivity: number): boolean
        {
            assert(sensitivity);
            const y = line.screenY(point.x);
            if (Math.abs(point.y - y) <= sensitivity)
            {
                return true;
            }
            else
            {
                for (let x = Math.floor(point.x - sensitivity / 2); x < Math.ceil(point.x + sensitivity / 2);)
                {
                    const p1 = Point.make(x, line.screenY(x));
                    x++;
                    const p2 = Point.make(x, line.screenY(x));
                    if (PointLineSegment.intersected(point, p1, p2, sensitivity))
                    {
                        return true;
                    }
                }

                return false;
            }
        }

        private _startX: number;
        private _line: ParametricLine;
        private _intersection: property<IPoint>;
    }

}