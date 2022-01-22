/// <reference path="utils.ts" />
/// <reference path="sprites.ts" />
/// <reference path="polygons.ts" />
/// <reference path="interfaces.ts" />
/// <reference path="play_ground.ts" />
/// <reference path="syntax.tree.ts" />
/// <reference path="tools.core.ts" />
/// <reference path="tools.document.ts" />
/// <reference path="tools.point.base.ts" />
/// <reference path="tools.point.active.ts" />
/// <reference path="tools.line.base.ts" />
/// <reference path="tools.line.segment.ts" />
/// <reference path="tools.line.circle.ts" />
/// <reference path="tools.line.parametric.ts" />

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
            const dx = this.startPoint.x - this.point.x;
            if (this._lastDx != dx)
            {
                this._lastDx = dx;
                this._isMoved.set();
            }
            return dx;
        }
        public get dy(): number
        {
            const dy = this.startPoint.y - this.point.y;
            if (this._lastDy != dy)
            {
                this._lastDy = dy;
                this._isMoved.set();
            }
            return dy;
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
                        else if (line2 instanceof ParametricLine)
                        {
                            const intersections = LineParametric.intersection(line1, line2);
                            const index = LineParametric.getPrefferedIndex(point, intersections);
                            if (index >= 0)
                            {
                                return intersections[index];
                            }
                        }
                    }
                    else if (line1 instanceof ParametricLine)
                    {
                        if (line2 instanceof ParametricLine)
                        {
                            const intersections = ParametricParametric.intersection(line1, line2);
                            const index = ParametricParametric.getPrefferedIndex(point, intersections);
                            if (index >= 0)
                            {
                                return intersections[index];
                            }
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
                        else if (line2 instanceof ParametricLine)
                        {
                            return new LineParametric(point, line1, line2);
                        }
                    }
                    else if (line1 instanceof ParametricLine)
                    {
                        if (line2 instanceof ParametricLine)
                        {
                            return new ParametricParametric(point, line1, line2);
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
        public isMoved(receiptor: string): boolean
        {
            return this._isMoved.get(receiptor);
        }

        protected get startPoint(): IPoint
        {
            return this._startPoint;
        }

        private _lastDx: number = NaN;
        private _lastDy: number = NaN;
        private _disposed: boolean = false;
        private readonly _startPoint: IPoint;
        private readonly _isMoved = new Utils.Pulse();
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
			return LineLine.intersection2(line1.startPoint, line1.endPoint, line2.startPoint, line2.endPoint);
		}
		public static intersection2(point11: IPoint, point12: IPoint, point21: IPoint, point22: IPoint): IPoint
		{
			let coeff1 = ActiveLineBase.getCoefficients(point11.x, point11.y, point12.x, point12.y);
			let coeff2 = ActiveLineBase.getCoefficients(point21.x, point21.y, point22.x, point22.y);
			const maxK = 1000;
			if (coeff1 && coeff2 && Math.abs(coeff1.k) < maxK && Math.abs(coeff2.k) < maxK)
			{
				const dk = coeff1.k - coeff2.k;
				if (dk)
				{
					const x = (coeff2.b - coeff1.b) / dk;
					return Point.make(x, ActiveLineBase.getY(x, coeff1));
				}
				else
				{
					return Point.empty;
				}
			}
			else if ((!coeff1 || Math.abs(coeff1.k) > maxK) && coeff2 && Math.abs(coeff2.k) < maxK)
			{
				coeff1 = {
					k: (point12.x - point11.x) / (point12.y - point11.y),
					b: point12.x - point12.y * ((point12.x - point11.x) / (point12.y - point11.y))
				}

				const y = (coeff2.k * coeff1.b + coeff2.b) / (1 - coeff1.k * coeff2.k);
				return Point.make(y * coeff1.k + coeff1.b, y);
			}
			else if ((!coeff2 || Math.abs(coeff2.k) > maxK) && coeff1 && Math.abs(coeff1.k) < maxK)
			{
				coeff2 = {
					k: (point22.x - point21.x) / (point22.y - point21.y),
					b: point22.x - point22.y * ((point22.x - point21.x) / (point22.y - point21.y))
				}

				const y = (coeff1.k * coeff2.b + coeff1.b) / (1 - coeff1.k * coeff2.k);
				return Point.make(y * coeff2.k + coeff2.b, y);
			}
			else
			{
				coeff1 = {
					k: (point12.x - point11.x) / (point12.y - point11.y),
					b: point12.x - point12.y * ((point12.x - point11.x) / (point12.y - point11.y))
				}

				coeff2 = {
					k: (point22.x - point21.x) / (point22.y - point21.y),
					b: point22.x - point22.y * ((point22.x - point21.x) / (point22.y - point21.y))
				}

				const dk = coeff1.k - coeff2.k;

				if (dk)
				{
					const y = (coeff2.b - coeff1.b) / dk;
					return Point.make(y * coeff1.k + coeff1.b, y);
				}
				else
				{
					return Point.empty;
				}
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
            //Explanation: snap point coordinates to axes
            this._startX = this._line.axes.fromScreenX(this.startPoint.x);
            this._startY = this._line.axes.fromScreenY(this.startPoint.y);
            this._intersection = makeProp(makeMod(this, (): IPoint =>
            {
                const screen_x0 = this._line.axes.toScreenX(this._startX);
                const screen_y1 = this._line.screenY(screen_x0);
                const p1 = PointParametric.intersectionMain(Point.make(screen_x0, screen_y1), this._line);
                if (this._line.symmetric)
                {
                    const screen_y0 = this._line.axes.toScreenY(this._startY);
                    const screen_y2 = this._line.screenSymmetricY(screen_x0);
                    const p2 = PointParametric.intersectionSymmetric(Point.make(screen_x0, screen_y2), this._line);
                    const point = Point.make(screen_x0, screen_y0);
                    if (ActiveLineBase.getLength(point, p1) < ActiveLineBase.getLength(point, p2))
                    {
                        return p1;
                    }
                    else
                    {
                        return p2;
                    }
                }
                else
                {
                    return p1;
                }
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
        public move(_dx: number, _dy: number): void
        {
            /*const x = this._line.axes.toScreenX(this._startX) - dx;
            this._startX = this._line.axes.fromScreenX(x);
            const y = this._line.axes.toScreenY(this._startY) - dy;
            this._startY = this._line.axes.fromScreenY(y);*/
        }
        public static intersection(point: IPoint, line: ParametricLine): IPoint
        {
            const p1 = PointParametric.intersectionMain(point, line);
            if (line.symmetric)
            {
                const p2 = PointParametric.intersectionSymmetric(point, line);
                if (ActiveLineBase.getLength(point, p1) < ActiveLineBase.getLength(point, p2))
                {
                    return p1;
                }
                else
                {
                    return p2;
                }
            }
            else
            {
                return p1;
            }
        }
        public static intersectionMain(point: IPoint, line: ParametricLine): IPoint
        {
            const y = line.screenY(point.x);
            return Point.make(point.x, y);
        }
        public static intersectionSymmetric(point: IPoint, line: ParametricLine): IPoint
        {
            const y = line.screenSymmetricY(point.x);
            return Point.make(point.x, y);
        }
        public static intersected(point: IPoint, line: ParametricLine, sensitivity: number): boolean
        {
            assert(sensitivity);

            if (Math.abs(point.y - line.screenY(point.x)) <= sensitivity)
            {
                return true;
            }
            else if (line.symmetric && Math.abs(point.y - line.screenSymmetricY(point.x)) <= sensitivity)
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
        private _startY: number;
        private _line: ParametricLine;
        private _intersection: property<IPoint>;
    }

    export class LineParametric extends Intersection
    {
        constructor(point: IPoint, line: ActiveLineBase, parametric: ParametricLine)
        {
            super(Point.make(point.x, point.y));

            this._line = line;
            this._parametric = parametric;
            this._update(true);
            this._prefferedIntersection = FunctionFunction.getPrefferedIndex(point, this.intersections);
        }

        public get point(): IPoint 
        {
            if (this.visible)
            {
                return this.intersections[this._prefferedIntersection];
            }
            else
            {
                return Point.empty;
            }
        }
        public get visible(): boolean
        {
            return this._prefferedIntersection >= 0 && this._prefferedIntersection < this.intersections.length;
        }
        public get intersections(): ParametricLineIntersections
        {
            this._update();
            assert(this._intersections);
            return this._intersections;
        }

        public dispose()
        {
            super.dispose();
            this._calculator?.dispose();
        }

        public static getPrefferedIndex(point: IPoint, intersections: ParametricLineIntersections): number
        {
            return FunctionFunction.getPrefferedIndex(point, intersections);
        }
        public static intersection(line: ActiveLineBase, parametric: ParametricLine): ParametricLineIntersections
        {
            const calculator = new LineParametric(Point.empty, line, parametric);
            const intersections = calculator.intersections;
            calculator.dispose();
            return intersections;
        }

        private _update(force?: boolean): void
        {
            const id = this._id;
            const update_calc = this._parametric.isMoved(id) || this._parametric.isModified(id) || force;
            if (update_calc)
            {
                const calc = new FunctionFunction(
                    this._parametric.code,
                    LineParametric._lineFunction,
                    this._parametric.axes,
                    this._parametric
                );
                calc.addArg(LineParametric._kName, NaN);
                calc.addArg(LineParametric._bName, NaN);
                this._calculator?.dispose();
                this._calculator = calc;
            }

            const update_coeff = this._line.isMoved(id) || force || update_calc;
            if (update_coeff)
            {
                assert(this._calculator);
                const axes = this._calculator.axes;
                const coeff = ActiveLineBase.getCoefficients(
                    axes.fromScreenX(this._line.startPoint.x), axes.fromScreenY(this._line.startPoint.y),
                    axes.fromScreenX(this._line.endPoint.x), axes.fromScreenY(this._line.endPoint.y)
                )
                if (coeff)
                {
                    this._calculator.setArg(LineParametric._kName, coeff.k);
                    this._calculator.setArg(LineParametric._bName, coeff.b);
                }
                else
                {
                    const multiplier = 1e20;
                    const x = axes.fromScreenX(this._line.x);
                    this._calculator.setArg(LineParametric._kName, -multiplier);
                    this._calculator.setArg(LineParametric._bName, x * multiplier);
                }
                this._intersections = this._calculator.intersections;
            }
        }

        private _calculator?: FunctionFunction;
        private _intersections?: ParametricLineIntersections;
        private readonly _line: ActiveLineBase;
        private readonly _parametric: ParametricLine;
        private readonly _prefferedIntersection: number;
        private readonly _id = FunctionFunction.createId();

        private static readonly _kName = "k-{C696237D-E444-468E-A8F7-7C780E599BBB}";
        private static readonly _bName = "b-{E131A6AE-285A-45E4-AEFC-D88EE4CF1BFC}";
        private static readonly _lineFunction = LineParametric._makeLineFunction();

        private static _makeLineFunction(): Syntax.CodeElement
        {
            const kx = new Syntax.CodeBinary(new Syntax.CodeArgument(LineParametric._kName), "*", new Syntax.CodeArgumentX());
            return new Syntax.CodeBinary(kx, "+", new Syntax.CodeArgument(LineParametric._bName));
        }
    }

    export class ParametricParametric extends Intersection 
    {
        constructor(point: IPoint, parametric1: ParametricLine, parametric2: ParametricLine)
        {
            super(Point.make(point.x, point.y));
            assert(parametric1.axes === parametric2.axes); // TODO needs to recalculation
            this._parametric1 = parametric1;
            this._parametric2 = parametric2;
            this._update(true);
            this._prefferedIntersection = FunctionFunction.getPrefferedIndex(point, this.intersections);
        }

        public get point(): IPoint 
        {
            if (this.visible)
            {
                return this.intersections[this._prefferedIntersection];
            }
            else
            {
                return Point.empty;
            }
        }
        public get visible(): boolean
        {
            return this._prefferedIntersection >= 0 && this._prefferedIntersection < this.intersections.length;
        }
        public get intersections(): ParametricLineIntersections
        {
            this._update();
            assert(this._intersections);
            return this._intersections;
        }

        public dispose()
        {
            super.dispose();
            this._calculator?.dispose();
        }

        public static getPrefferedIndex(point: IPoint, intersections: ParametricLineIntersections): number
        {
            return FunctionFunction.getPrefferedIndex(point, intersections);
        }
        public static intersection(parametric1: ParametricLine, parametric2: ParametricLine): ParametricLineIntersections
        {
            const calculator = new ParametricParametric(Point.empty, parametric1, parametric2);
            const intersections = calculator.intersections;
            calculator.dispose();
            return intersections;
        }

        private _update(force?: boolean): void
        {
            const id = this._id;
            const update_calc = this._parametric1.isModified(id) || this._parametric2.isModified(id) || force;
            if (update_calc)
            {
                const calc = new FunctionFunction(
                    this._parametric1.code,
                    this._parametric2.code,
                    this._parametric1.axes,
                    this._parametric1,
                    this._parametric2
                );
                this._calculator?.dispose();
                this._calculator = calc;
            }

            if (update_calc || this._parametric1.isMoved(id) || this._parametric2.isMoved(id))
            {
                assert(this._calculator);
                this._intersections = this._calculator.intersections;
            }
        }

        private _calculator?: FunctionFunction;
        private _intersections?: ParametricLineIntersections;
        private readonly _parametric1: ParametricLine;
        private readonly _parametric2: ParametricLine;
        private readonly _prefferedIntersection: number;
        private readonly _id = FunctionFunction.createId();
    }

    class FunctionFunction implements ISamplesAdapter, ICodeEvaluatorContext
    {
        constructor(
            function1: Syntax.CodeElement,
            function2: Syntax.CodeElement,
            axes: AxesLines,
            context1: ICodeEvaluatorContext,
            context2?: ICodeEvaluatorContext
        )
        {
            this._function1 = Utils.makeEvaluator(this, function1.code);
            this._function2 = Utils.makeEvaluator(this, function2.code);
            this._context1 = context1;
            this._context2 = context2;
            this._axes = axes;

            const code = new Syntax.CodeBinary(function1, "-", function2);
            const contains_derivative = code.derivativeLevel > 0;

            this._deltaFunction = Utils.makeEvaluator(this, code.code);

            const samples_calculator = makeMod(this, () =>
            {
                const mouse_area = this._axes.document.mouseArea;
                const screen_box = new Utils.Box(mouse_area.offset.x, mouse_area.offset.y, mouse_area.w, mouse_area.h);
                this._intersectionsData.splice(0);
                this._lastPoint = Point.empty;
                ParametricLine.calcSamples(screen_box, 1, contains_derivative, this);
                return this._intersectionsData;
            });
            this._intersections = makeProp(samples_calculator, []);
        }

        public point(preffered_intersection: number): IPoint 
        {
            if (this.visible(preffered_intersection))
            {
                return this.intersections[preffered_intersection];
            }
            else
            {
                return Point.empty;
            }
        }
        public visible(preffered_intersection: number): boolean
        {
            return preffered_intersection >= 0 && preffered_intersection < this.intersections.length;
        }
        public get intersections(): ParametricLineIntersections
        {
            return this._intersections.value;
        }
        public get axes(): AxesLines
        {
            return this._axes;
        }

        public dispose()
        {
            for (const key in this._args)
            {
                this._args[key].reset();
            }
        }

        public static getPrefferedIndex(point: IPoint, intersections: ParametricLineIntersections): number
        {
            let last_length = Infinity;
            let ret = -1;
            let i = 0;
            for (const intersection of intersections)
            {
                const length = ActiveLineBase.getLength(point, intersection);
                if (length < last_length)
                {
                    ret = i;
                    last_length = length;
                }
                i++;
            }
            return ret;
        }
        public static intersection(parametric1: ParametricLine, parametric2: ParametricLine): ParametricLineIntersections
        {
            return (new ParametricParametric(Point.empty, parametric1, parametric2)).intersections;
        }
        public static createId(): string
        {
            return `${FunctionFunction._index.inc()}-{4B5D04F4-A028-48D6-BB69-B9E857793D38}`;
        }

        getFunction(_name: string): Function | null 
        {
            throw new Error("Method not implemented.");
        }
        addFunction(_name: string, _code: string): void
        {
            throw new Error("Method not implemented.");
        }
        arg(name: string): number
        {
            switch (name)
            {
                case "x":
                    return this._argX;
                default:
                    assert(this.hasArg(name));
                    if (name in this._args)
                    {
                        return this._args[name].value;
                    }
                    else if (this._context1.hasArg(name))
                    {
                        return this._context1.arg(name);
                    }
                    else
                    {
                        assert(this._context2);
                        return this._context2.arg(name);
                    }
            }
        }
        hasArg(name: string): boolean
        {
            return name in this._args || this._context1.hasArg(name) || (this._context2?.hasArg(name) ?? false);
        }
        addArg(name: string, arg: Utils.binding<number>): void
        {
            assert(!this.hasArg(name));
            this._args[name] = makeProp(arg, NaN);
        }
        setArg(name: string, value: number): void
        {
            assert(name != "x");
            assert(name in this._args);
            this._args[name].value = value;
        }

        getScreenY(screen_x: number, func?: Function): number 
        {
            const axes = this._axes;
            const x = axes.fromScreenX(screen_x);
            this._argX = x;
            const screen_y = axes.toScreenY((func ?? this._deltaFunction)());
            return screen_y;
        }
        lineTo(screen_x: number, screen_y: number, discontinuity: boolean): void
        {
            const next_point = Point.make(screen_x, screen_y);
            if (!discontinuity && !Point.isEmpty(this._lastPoint))
            {
                const axes = this._axes;
                const x_axis_intersection = (this._lastPoint.y <= axes.y && next_point.y >= axes.y) ||
                    (this._lastPoint.y >= axes.y && next_point.y <= axes.y);
                if (x_axis_intersection)
                {
                    const y1 = this.getScreenY(this._lastPoint.x, this._function1);
                    const y2 = this.getScreenY(this._lastPoint.x, this._function2);
                    const y3 = this.getScreenY(next_point.x, this._function1);
                    const y4 = this.getScreenY(next_point.x, this._function2);
                    const intersection = LineLine.intersection2(Point.make(this._lastPoint.x, y1), Point.make(next_point.x, y3), Point.make(this._lastPoint.x, y2), Point.make(next_point.x, y4));
                    this._intersectionsData.push(intersection);
                }
            }
            this._lastPoint = next_point;
        }
        addSample(): void 
        {
        }
        setSample(_screen_x: number, _screen_y: number): void 
        {
        }

        private _intersectionsData: ParametricLineIntersections = [];
        private _intersections: property<ParametricLineIntersections>;
        private _argX: number = NaN;
        private _lastPoint: IPoint = Point.empty;
        private readonly _function1: Function;
        private readonly _function2: Function;
        private readonly _deltaFunction: Function;
        private readonly _context1: ICodeEvaluatorContext;
        private readonly _context2?: ICodeEvaluatorContext
        private readonly _args: Record<string, property<number>> = {};
        private readonly _axes: AxesLines;
        private static _index = new Utils.ModuleInteger();
    }
}