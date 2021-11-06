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
/// <reference path="tools.resources.ts" />
/// <reference path="tools.point.base.ts" />
/// <reference path="tools.point.active.ts" />
/// <reference path="tools.point.common.ts" />
/// <reference path="tools.line.base.ts" />
/// <reference path="tools.line.segment.ts" />
/// <reference path="tools.line.bisector.ts" />
/// <reference path="tools.intersections.ts" />

module Geoma.Tools
{
    import makeMod = Utils.makeMod;
    import makeProp = Utils.makeProp;
    import toInt = Utils.toInt;
    import Point = Utils.Point;
    import assert = Utils.assert;
    import property = Utils.ModifiableProperty;
    import binding = Utils.binding;

    export enum CircleLineKind
    {
        Radius,
        Diameter
    }

    export class ActiveCircleLine extends DocumentSprite<Sprite.Sprite> implements ICircle
    {
        constructor(
            document: Document,
            kind: CircleLineKind,
            point1: ActivePoint,
            point2: ActivePoint,
            line_width: binding<number> = CurrentTheme.ActiveCircleWidth,
            brush: binding<Sprite.Brush> = CurrentTheme.ActiveCircleBrush,
            selected_brush: binding<Sprite.Brush> = CurrentTheme.ActiveCircleSelectBrush
        )
        {
            assert(document);
            assert(point1);
            assert(point2);
            class stub extends Sprite.Sprite
            {
                protected innerDraw(__play_ground: PlayGround): void
                {
                    throw new Error("Method not implemented.");
                }
            }
            super(document, new stub());
            this._point1 = point1;
            this._point2 = point2;
            this.kind = kind;
            this.lineWidth = makeProp(line_width, 1);
            this.brush = makeProp(brush, "Black");
            this.selectedBrush = makeProp(selected_brush, "Black");
            this._radius = makeProp(makeMod(this, () =>
            {
                const dx = this._point1.x - this._point2.x;
                const dy = this._point1.y - this._point2.y;
                const ret = Math.sqrt(dx * dx + dy * dy);
                switch (this.kind)
                {
                    case CircleLineKind.Radius:
                        return ret;
                    case CircleLineKind.Diameter:
                        return ret / 2;
                    default:
                        assert(false);
                }
            }), 1);
            this.addVisible(makeMod(
                this,
                (value: boolean) => value && this._point1.visible && this._point2.visible
            ));
            this._mouseDownListener = this.document.mouseArea.onMouseDown.bind(this, this.mouseDown);
            this._mouseUpListener = this.document.mouseArea.onMouseUp.bind(this, this.mouseUp);
        }

        public get center(): IPoint
        {
            switch (this.kind)
            {
                case CircleLineKind.Radius:
                    return this.point1;
                case CircleLineKind.Diameter:
                    return {
                        x: (this.point1.x + this.point2.x) / 2,
                        y: (this.point1.y + this.point2.y) / 2
                    }
                default:
                    assert(false);
            }
        }
        public get point1(): ActivePoint
        {
            return this._point1;
        }
        public get point2(): ActivePoint
        {
            return this._point2;
        }
        public get radius(): number
        {
            return this._radius.value;
        }
        public get name(): string
        {
            let prefix: string;
            switch (this.kind)
            {
                case CircleLineKind.Radius:
                    prefix = "R";
                    break;
                case CircleLineKind.Diameter:
                    prefix = "D";
                    break;
                default:
                    assert(false);
            }
            const name1 = this._point1.name;
            const name2 = this._point2.name;
            if (name1 < name2)
            {
                return `${prefix}(${name1}${name2})`;
            }
            else
            {
                return `${prefix}(${name2}${name1})`;
            }
        }

        public readonly kind: CircleLineKind;
        public readonly lineWidth: property<number>;
        public readonly brush: property<Sprite.Brush>;
        public readonly selectedBrush: property<Sprite.Brush>;

        public dispose(): void
        {
            if (!this.disposed)
            {
                this._transaction?.rollback();
                this._mouseDownListener.dispose();
                this._mouseUpListener.dispose();
                super.dispose();
            }
        }
        public isPivot(point: ActivePointBase): boolean
        {
            return this._point1 == point || this._point2 == point;
        }
        public isRelated(point: ActivePointBase): boolean
        {
            if (this.isPivot(point))
            {
                return true;
            }
            else if (this._points)
            {
                for (const p of this._points)
                {
                    if (p == point)
                    {
                        return true;
                    }
                }
            }
            return false;
        }
        public mouseHit(point: IPoint): boolean
        {
            return PointCircle.isIntersected(point, this, Thickness.Mouse);
        }
        public addPoint(point: ActiveCommonPoint): void
        {
            assert(!this.isRelated(point));
            assert(this.mouseHit(point));
            if (!this._points)
            {
                this._points = [];
            }
            this._points.push(point);
        }
        public removePoint(point: ActiveCommonPoint): void
        {
            assert(this.isRelated(point));
            assert(this._points);
            const index = this._points.indexOf(point);
            assert(index >= 0);
            this._points.splice(index, 1);
            point.removeSegment(this);
        }
        public serialize(context: SerializationContext): Array<string>
        {
            const data: Array<string> = [];
            data.push(this.kind.toString());
            data.push(context.points[this.point1.name].toString());
            data.push(context.points[this.point2.name].toString());
            if (this._points)
            {
                for (const point of this._points)
                {
                    data.push(`p${context.points[point.name]}`);
                }
            }
            return data;
        }
        public move(dx: number, dy: number)
        {
            this.point1.move(dx, dy);
            this.point2.move(dx, dy);
        }

        public static deserialize(context: DesializationContext, data: Array<string>, index: number): ActiveCircleLine | null
        {
            if (data.length > (index + 2))
            {
                const kind = toInt(data[index]) as CircleLineKind;
                const center = context.data.points.item(toInt(data[index + 1]));
                const pivot = context.data.points.item(toInt(data[index + 2]));
                switch (kind)
                {
                    case CircleLineKind.Radius:
                    case CircleLineKind.Diameter:
                        break;
                    default:
                        return null;
                }
                const circle = new ActiveCircleLine(context.document, kind, center, pivot);
                for (let i = index + 3; i < data.length; i++)
                {
                    const chunck = data[i];
                    const p_index = toInt(chunck.substring(1));
                    const point = context.data.points.item(p_index);
                    assert(point instanceof ActiveCommonPoint);
                    (point as ActiveCommonPoint).addGraphLine(circle);
                    circle.addPoint(point);
                }
                return circle;
            }
            else
            {
                return null;
            }
        }
        public static getX(y: number, x0: number, y0: number, r: number): number | null 
        {
            const dy = y - y0;
            if (dy > r)
            {
                return null;
            }
            else
            {
                return Math.sqrt(r * r - dy * dy) + x0;
            }
        }
        public static getY(x: number, x0: number, y0: number, r: number): number | null 
        {
            const dx = x - x0;
            if (dx > r)
            {
                return null;
            }
            else
            {
                return Math.sqrt(r * r - dx * dx) + y0;
            }
        }

        protected innerDraw(play_groun: PlayGround): void
        {
            play_groun.context2d.beginPath();
            play_groun.context2d.strokeStyle = this.selected ? this.selectedBrush.value : this.brush.value;
            play_groun.context2d.lineWidth = this.lineWidth.value;
            const center = this.center;
            play_groun.context2d.arc(center.x, center.y, this.radius, 0, Math.PI * 2);
            play_groun.context2d.stroke();
        }
        protected mouseMove(event: MouseEvent): void
        {
            super.mouseMove(event);
            if (this._dragStart)
            {
                if (event.buttons != 0)
                {
                    const dpos = Point.sub(this._dragStart, event);
                    if (dpos.x != 0 || dpos.y != 0)
                    {
                        if (!this._transaction)
                        {
                            this._transaction = this.document.beginUndo(Resources.string("Перемещение окружности {0}", this.name));
                        }
                        this.move(dpos.x, dpos.y);
                    }
                    this._dragStart = event;
                    event.cancelBubble = true;
                }
                else
                {
                    this.mouseUp(event);
                }
            }
            this.selected = this.mouseHit(event);
            super.mouseMove(event);
        }
        protected mouseClick(event: MouseEvent): void
        {
            if (this.mouseHit(event))
            {
                const doc = this.document;

                if (doc.canShowMenu(this))
                {
                    const x = doc.mouseArea.mousePoint.x;
                    const y = doc.mouseArea.mousePoint.y;
                    const menu = new Menu(doc, x, y);

                    let menu_item = menu.addMenuItem(Resources.string("Добавить точку"));
                    menu_item.onChecked.bind(this, () => doc.addPoint(Point.make(x, y)));

                    menu_item = menu.addMenuItem(Resources.string("Удалить окружность {0}", this.name));
                    menu_item.onChecked.bind(this, () => doc.removeCircleLine(this));

                    menu.show();
                }
            }
        }
        protected mouseDown(event: MouseEvent): void
        {
            if (this.mouseHit(event))
            {
                this._dragStart = event;
            }
        }
        protected mouseUp(__event: MouseEvent): void
        {
            if (this._dragStart)
            {
                this._transaction?.commit();
                delete this._dragStart;
                delete this._transaction;
            }
        }

        private _point1: ActivePoint;
        private _point2: ActivePoint;
        private _radius: property<number>;
        private _points?: Array<ActiveCommonPoint>;
        private _dragStart?: IPoint;
        private _mouseDownListener: IEventListener<MouseEvent>;
        private _mouseUpListener: IEventListener<MouseEvent>;
        private _transaction?: UndoTransaction;
    }
}