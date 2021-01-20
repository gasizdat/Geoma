﻿/// <reference path="utils.ts" />
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
/// <reference path="tools.intersections.ts" />

module Geoma.Tools
{
    import makeMod = Utils.makeMod;
    import toInt = Utils.toInt;
    import Point = Utils.Point;
    import assert = Utils.assert;
    import MulticastEvent = Utils.MulticastEvent;
    import modifier = Utils.modifier;
    import property = Utils.ModifiableProperty;
    import Box = Utils.Box;
    import binding = Utils.binding;
    import Debug = Sprite.Debug;

    export class ActiveLineSegment extends ActiveLineBase
    {
        constructor(
            start: ActivePoint,
            end: ActivePoint,
            line_width: binding<number> = CurrentTheme.ActiveLineWidth,
            brush: binding<Sprite.Brush> = CurrentTheme.ActiveLineBrush,
            selected_brush: binding<Sprite.Brush> = CurrentTheme.ActiveLineSelectBrush
        )
        {
            super(
                start.document,
                start,
                end,
                line_width,
                brush,
                selected_brush
            );
            this._mouseDownListener = this.document.mouseArea.onMouseDown.bind(this, this.mouseDown);
            this._mouseUpListener = this.document.mouseArea.onMouseUp.bind(this, this.mouseUp);
            this.addVisible((value: boolean) => value && start.visible && end.visible);
        }

        public get name(): string
        {
            const start_name = this.start.name;
            const end_name = this.end.name;
            if (start_name > end_name)
            {
                return `${end_name}${start_name}`;
            }
            else
            {
                return `${start_name}${end_name}`;
            }
        }
        public get start(): ActivePoint
        {
            return this.startPoint as ActivePoint;
        }
        public get end(): ActivePoint
        {
            return this.endPoint as ActivePoint;
        }
        public get quadrant(): 1 | 2 | 3 | 4
        {
            return ActiveLineBase.getQuadrant(this.startPoint.x, this.startPoint.y, this.endPoint.x, this.endPoint.y);
        }
        public set quadrant(value: 1 | 2 | 3 | 4)
        {
            const current_quadrant = this.quadrant;
            const p1 = this.start;
            const p2 = this.end;
            switch (value)
            {
                case 1:
                    switch (current_quadrant)
                    {
                        case 1:
                            break;
                        case 2:
                            p2.move(0, 2 * this.projY);
                            break;
                        case 3:
                            p2.move(-(2 * this.projX), 2 * this.projY);
                            break;
                        case 4:
                            p2.move(-(2 * this.projX), 0);
                            break;
                    }
                    break;
                case 2:
                    switch (current_quadrant)
                    {
                        case 1:
                            p2.move(0, -(2 * this.projY));
                            break;
                        case 2:
                            break;
                        case 3:
                            p2.move(-(2 * this.projX), 0);
                            break;
                        case 4:
                            p2.move(-(2 * this.projX), -(2 * this.projY));
                            break;
                    }
                    break;
                case 3:
                    switch (current_quadrant)
                    {
                        case 1:
                            p2.move(2 * this.projX, -(2 * this.projY));
                            break;
                        case 2:
                            p2.move(2 * this.projX, 0);
                            break;
                        case 3:
                            break;
                        case 4:
                            p2.move(0, -(2 * this.projY));
                            break;
                    }
                    break;
                case 4:
                    switch (current_quadrant)
                    {
                        case 1:
                            p2.move(2 * this.projX, 0);
                            break;
                        case 2:
                            p2.move(2 * this.projX, 2 * this.projY);
                            break;
                        case 3:
                            p2.move(0, 2 * this.projY);
                            break;
                        case 4:
                            break;
                    }
                    break;
                default:
                    assert(false, "quadrant value from 1 TO 4");
            }
        }
        public get fixedLength(): boolean
        {
            return this._fixed != null;
        }
        public get moved(): boolean
        {
            return this.start.moved(this.name) || this.end.moved(this.name);
        }
        public get points(): Array<ActivePointBase>
        {
            const ret = new Array<ActivePointBase>(this.start, this.end);
            if (this._points)
            {
                ret.push(...this._points);
            }
            return ret;
        }

        public belongs(p1: ActivePointBase): boolean
        {
            if (this.startPoint == p1 || this.endPoint == p1)
            {
                return true;
            }
            else if (this._points)
            {
                for (const point of this._points)
                {
                    if (p1 == point)
                    {
                        return true;
                    }
                }
            }

            return false;
        }
        public setParallelTo(other_segment: ActiveLineSegment): void
        {
            const parallel_line = other_segment;
            const q1 = this.quadrant;
            const q2 = parallel_line.quadrant;
            switch (q2)
            {
                case 1:
                    switch (q1)
                    {
                        case 1:
                        case 2:
                            this.setAngle(parallel_line.angle);
                            break;
                        case 3:
                        case 4:
                            this.setAngle(parallel_line.angle - Math.PI);
                            break;
                    }
                    break;
                case 2:
                    switch (q1)
                    {
                        case 1:
                        case 2:
                            this.setAngle(parallel_line.angle);
                            break;
                        case 3:
                        case 4:
                            this.setAngle(parallel_line.angle, this.end);
                            break;
                    }
                    break;
                case 3:
                    switch (q1)
                    {
                        case 1:
                        case 2:
                            this.setAngle(parallel_line.angle, this.end);
                            break;
                        case 3:
                        case 4:
                            this.setAngle(parallel_line.angle - Math.PI, this.end);
                            break;
                    }
                    break;
                case 4:
                    switch (q1)
                    {
                        case 1:
                        case 2:
                            this.setAngle(parallel_line.angle, this.end);
                            break;
                        case 3:
                        case 4:
                            this.setAngle(parallel_line.angle - Math.PI, this.end);
                            break;
                    }
                    break;
            }

        }
        public setPerpendicularTo(other_segment: ActiveLineSegment): void
        {
            const perpendicular_line = other_segment;
            const common_point = other_segment.belongs(this.start) ? this.start : this.end;
            assert(other_segment.belongs(common_point));

            const start_angle = other_segment.getAngle(common_point);
            const end_angle = this.getAngle(common_point);
            switch (AngleIndicator.angleDifDirection(start_angle, end_angle))
            {
                case AngleDirection.anticlockwise:
                    this.setAngle(other_segment.getAngle(common_point) - Math.PI / 2, common_point);
                    break;
                default:
                    this.setAngle(other_segment.getAngle(common_point) + Math.PI / 2, common_point);
                    break;
            }
        }
        public setAngle(value: number, pivot_point?: IPoint): void
        {
            let start: ActivePoint, end: ActivePoint;
            if (pivot_point)
            {
                start = pivot_point as ActivePoint;
                if (start == this.start)
                {
                    end = this.end;
                }
                else
                {
                    end = this.start;
                }
            }
            else
            {
                start = this.start;
                end = this.end;
            }

            const l = this.length;
            const x1 = start.x + Math.cos(value) * l;
            const y1 = start.y + Math.sin(value) * l;
            end.move(end.x - x1, end.y - y1);
        }
        public setLength(value: number, fix_point?: IPoint): void
        {
            assert(value > 0);
            assert(!this.fixedLength);
            let start: ActivePoint, end: ActivePoint;
            if (fix_point)
            {
                start = fix_point as ActivePoint;
                if (start == this.start)
                {
                    end = this.end;
                }
                else
                {
                    end = this.start;
                }
            }
            else
            {
                start = this.start;
                end = this.end;
            }
            const k = value / this.length;
            const x2 = start.x + (end.x - start.x) * k;
            const y2 = start.y + (end.y - start.y) * k;
            end.move(end.x - x2, end.y - y2);
        }
        public dispose(): void
        {
            if (!this.disposed)
            {
                this._mouseDownListener.dispose();
                this._mouseUpListener.dispose();
                if (this._beforeDrawListener)
                {
                    this._beforeDrawListener.dispose();
                }
                if (this._points)
                {
                    for (const point of this._points)
                    {
                        point.removeSegment(this);
                    }
                }
                delete this._points;
                super.dispose();
            }
        }
        public makeFixed(): void
        {
            assert(!this.fixedLength);
            this._fixed = { length: this.length, ...this.info };
            this._beforeDrawListener = this.document.onBeforeDraw.bind(this, this.beforeDraw);
        }
        public makeFree(): void
        {
            assert(this.fixedLength);
            assert(this._beforeDrawListener);

            delete this._fixed;
            this._beforeDrawListener.dispose();
            delete this._beforeDrawListener;
        }
        public addPoint(point: ActiveCommonPoint): void
        {
            assert(!this.belongs(point));
            assert(this.mouseHit(point));
            if (!this._points)
            {
                this._points = [];
            }
            this._points.push(point);
        }
        public removePoint(point: ActiveCommonPoint): void
        {
            assert(this.belongs(point));
            assert(this._points);
            const index = this._points.indexOf(point);
            assert(index >= 0);
            this._points.splice(index, 1);
            point.removeSegment(this);
        }
        public move(dx: number, dy: number)
        {
            this.start.move(dx, dy);
            this.end.move(dx, dy);
        }
        public serialize(context: SerializationContext): Array<string>
        {
            const data: Array<string> = [];

            data.push(context.points[this.start.name].toString());
            data.push(context.points[this.end.name].toString());
            if (this.fixedLength)
            {
                data.push('f');
            }
            if (this._points)
            {
                for (const point of this._points)
                {
                    data.push(`p${context.points[point.name]}`);
                }
            }
            return data;
        }
        public static deserialize(context: DesializationContext, data: Array<string>, index: number): ActiveLineSegment | null
        {
            if (data.length < (index + 1))
            {
                return null;
            }
            else
            {
                const start_point = context.data.points.item(toInt(data[index]));
                const end_point = context.data.points.item(toInt(data[index + 1]));
                const line = new ActiveLineSegment(start_point, end_point);
                for (let i = index + 2; i < data.length; i++)
                {
                    const chunck = data[i];
                    if (chunck == 'f')
                    {
                        line.makeFixed();
                    }
                    else if (chunck.length && chunck.charAt(0) == 'p')
                    {
                        const p_index = toInt(chunck.substring(1));
                        const point = context.data.points.item(p_index);
                        assert(point instanceof ActiveCommonPoint);
                        (point as ActiveCommonPoint).addSegment(line);
                        line.addPoint(point);
                    }
                    else
                    {
                        return null;
                    }
                }
                return line;
            }
        }

        protected mouseMove(event: MouseEvent): void
        {
            if (this._dragStart && event.buttons != 0)
            {
                const dpos = Point.sub(this._dragStart, event);
                if (dpos.x != 0 || dpos.y != 0)
                {
                    this.move(dpos.x, dpos.y);
                }
                this._dragStart = event;
                event.cancelBubble = true;
            }
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
                    const exists_other_segments = makeMod(this, () => doc.lineSegments.length > 1);

                    let menu_item = menu.addMenuItem(Resources.string("Обозначить угол..."));
                    menu_item.onChecked.bind(this, () => doc.setAngleIndicatorState(this, event));
                    menu_item.enabled.addModifier(exists_other_segments);

                    menu_item = menu.addMenuItem(Resources.string("Показать биссектрису угла..."));
                    menu_item.onChecked.bind(this, () => doc.setBisectorState(this, event));
                    menu_item.enabled.addModifier(exists_other_segments);

                    menu_item = menu.addMenuItem(Resources.string("Задать размер..."));
                    menu_item.onChecked.bind(this, () =>
                    {
                        const value = this.document.prompt(Resources.string("Введите размер в пикселях"), Utils.toInt(this.length).toString());
                        if (value != null)
                        {
                            const length = Utils.toInt(toInt(value));
                            if (length)
                            {
                                this.setLength(length);
                            }
                            else
                            {
                                this.document.alert(Resources.string("Введен недопустимый размер {0}", value));
                            }
                        }
                    });
                    menu_item.enabled.addModifier(makeMod(this, () => !this.fixedLength));

                    menu_item = menu.addMenuItem(makeMod(this, (): string =>
                        this.fixedLength ? Resources.string("Изменяемый размер") : Resources.string("Фиксированный размер")));
                    menu_item.onChecked.bind(this, this.fixedLength ? this.makeFree : this.makeFixed);

                    menu_item = menu.addMenuItem(Resources.string("Сделать ||..."));
                    menu_item.onChecked.bind(this, () => doc.setParallelLineState(this));
                    menu_item.enabled.addModifier(exists_other_segments);

                    menu_item = menu.addMenuItem(Resources.string("Сделать ⟂..."));
                    menu_item.onChecked.bind(this, () => doc.setPerpendicularLineState(this));
                    menu_item.enabled.addModifier(exists_other_segments);

                    menu_item = menu.addMenuItem(Resources.string("Добавить точку"));
                    menu_item.onChecked.bind(this, () => doc.addPoint(Point.make(x, y)));

                    menu_item = menu.addMenuItem(Resources.string("Удалить прямую {0}", this.name));
                    menu_item.onChecked.bind(this, () => doc.removeLineSegment(this));

                    menu.show();
                }
            }
            super.mouseClick(event);
        }
        protected mouseDown(event: MouseEvent): void
        {
            if (this.mouseHit(event))
            {
                this._dragStart = event;
            }
        }
        protected mouseUp(event: MouseEvent): void
        {
            if (this._dragStart)
            {
                delete this._dragStart;
            }
        }
        protected beforeDraw(event: BeforeDrawEvent)
        {
            assert(this._fixed);
            const precision = 1;
            if (toInt(this._fixed.x2 * precision) != toInt(this.end.x * precision) || toInt(this._fixed.y2 * precision) != toInt(this.end.y * precision))
            {
                const i = LineCircle.intersection(this, {
                    center: this.start,
                    radius: 1
                });
                const p = i.p1 ?? i.p2;
                assert(p);
                const new_x = p.x - (this.start.x - p.x) * this._fixed.length;
                const new_y = p.y - (this.start.y - p.y) * this._fixed.length;
                //Sprite.Debug.dot(play_ground, new_x, new_y);
                if (this._fixed.length < this.length)
                {
                    this.end.move(this.end.x - new_x, this.end.y - new_y);
                }
                else
                {
                    const dx = new_x - this.end.x;
                    const dy = new_y - this.end.y;
                    //console.log(`dx ${dx}, dy ${dy}, new_len ${len} real_len ${this.len}`);
                    this.start.move(dx, dy);
                }
            }
            else if (toInt(this._fixed.x1 * precision) != toInt(this.start.x * precision) || toInt(this._fixed.y1 * precision) != toInt(this.start.y * precision))
            {
                const i = LineCircle.intersection(this, {
                    center: this.end,
                    radius: 1
                });
                const p = i.p1 ?? i.p2;
                assert(p);
                const new_x = p.x - (this.end.x - p.x) * this._fixed.length;
                const new_y = p.y - (this.end.y - p.y) * this._fixed.length;
                //Sprite.Debug.dot(play_ground, new_x, new_y);
                if (this._fixed.length < this.length)
                {
                    this.start.move(this.start.x - new_x, this.start.y - new_y);
                }
                else
                {
                    const dx = new_x - this.start.x;
                    const dy = new_y - this.start.y;
                    this.end.move(dx, dy);
                }
            }
            this._fixed.x1 = this.start.x;
            this._fixed.y1 = this.start.y;
            this._fixed.x2 = this.end.x;
            this._fixed.y2 = this.end.y;

        }

        private _mouseDownListener: IEventListener<MouseEvent>;
        private _mouseUpListener: IEventListener<MouseEvent>;
        private _beforeDrawListener?: IEventListener<BeforeDrawEvent>;
        private _dragStart?: IPoint;
        private _fixed?: SegmentFixInfo;
        private _points?: Array<ActiveCommonPoint>;
    }
}