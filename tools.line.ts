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
    import makeMod = Utils.makeMod;
    import toInt = Utils.toInt;
    import Point = Utils.Point;
    import assert = Utils.assert;
    import binding = Utils.binding;

    export class ActiveLine extends ActiveLineBase
    {
        constructor(
            start: ActivePointBase,
            end: ActivePointBase,
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
            this._points = new Array<ActivePointBase>(this.startPoint, this.endPoint);
        }

        public get points(): Array<ActivePointBase>
        {
            return this._points;
        }
        public get isPartOf(): ActiveLineBase | null
        {
            return null;
        }
        public get name(): string
        {
            const name1 = (this.startPoint as ActivePointBase).name;
            const name2 = (this.endPoint as ActivePointBase).name;
            if (name1 < name2)
            {
                return `${name1}${name2}`;
            }
            else
            {
                return `${name2}${name1}`;
            }
        }

        public dispose(): void
        {
            if (!this.disposed)
            {
                if (this._points)
                {
                    for (const point of this._points)
                    {
                        if (!this.isPivot(point) && point instanceof ActiveCommonPoint)
                        {
                            point.removeSegment(this);
                        }
                    }
                }

                super.dispose();
            }
        }
        public move(__dx: number, __dy: number): void
        {
            assert(false, "Not implemented yet");
        }
        public isMoved(receiptor: string): boolean
        {
            return this.startPoint.isMoved(receiptor) || this.endPoint.isMoved(receiptor);
        }
        public serialize(context: SerializationContext): Array<string>
        {
            const data: Array<string> = [];

            data.push(context.points[(this.startPoint as ActivePointBase).name].toString());
            data.push(context.points[(this.endPoint as ActivePointBase).name].toString());

            if (this._points)
            {
                for (const point of this._points)
                {
                    data.push(`p${context.points[point.name]}`);
                }
            }
            return data;
        }
        public mouseHit(point: IPoint): boolean
        {
            return this.visible && PointLine.intersected(
                point,
                this.startPoint,
                this.coefficients,
                Thickness.Mouse
            );
        }
        public addPoint(point: ActivePointBase): void
        {
            assert(!this.isRelated(point));
            assert(this.mouseHit(point));
            this._points.push(point);
        }
        public removePoint(point: ActivePointBase): void
        {
            assert(this.isRelated(point));
            const index = this._points.indexOf(point);
            assert(index >= 0);
            this._points.splice(index, 1);
            if (point instanceof ActiveCommonPoint)
            {
                point.removeSegment(this);
            }
        }
        public static deserialize(context: DesializationContext, data: Array<string>, index: number): ActiveLine | null
        {
            if (data.length < (index + 1))
            {
                return null;
            }
            else
            {
                const start_point = context.data.points.item(toInt(data[index]));
                const end_point = context.data.points.item(toInt(data[index + 1]));
                const line = new ActiveLine(start_point, end_point);
                for (let i = index + 2; i < data.length; i++)
                {
                    const chunck = data[i];
                    if (chunck.length && chunck.charAt(0) == 'p')
                    {
                        const p_index = toInt(chunck.substring(1));
                        const point = context.data.points.item(p_index);
                        if (!line.isRelated(point))
                        {
                            assert(point instanceof ActiveCommonPoint);
                            point.addGraphLine(line);
                            line.addPoint(point);
                        }
                    }
                    else
                    {
                        return null;
                    }
                }
                return line;
            }
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
                    const exists_other_segments = makeMod(this, () => doc.lines.length > 1);

                    let menu_item = menu.addMenuItem(Resources.string("Обозначить угол..."));
                    menu_item.onChecked.bind(this, () => doc.setAngleIndicatorState(this, event));
                    menu_item.enabled.addModifier(exists_other_segments);

                    menu_item = menu.addMenuItem(Resources.string("Показать биссектрису угла..."));
                    menu_item.onChecked.bind(this, () => doc.setBisectorState(this, event));
                    menu_item.enabled.addModifier(exists_other_segments);

                    menu_item = menu.addMenuItem(Resources.string("Добавить точку"));
                    menu_item.onChecked.bind(this, () => doc.addPoint(Point.make(x, y)));

                    menu_item = menu.addMenuItem(Resources.string("Сделать ||..."));
                    menu_item.onChecked.bind(this, () => doc.setParallelLineState(this));
                    menu_item.enabled.addModifier(exists_other_segments);

                    menu_item = menu.addMenuItem(Resources.string("Удалить линию {0}", this.name));
                    menu_item.onChecked.bind(this, () => doc.removeLine(this));

                    menu.show();
                }
            }
            super.mouseClick(event);
        }
        protected innerDraw(play_ground: PlayGround): void
        {
            const draw_info = ActiveLineBase.getLineDrawInfo(this.document, this.startPoint, this.angle);
            play_ground.context2d.beginPath();
            play_ground.context2d.lineWidth = this.lineWidth.value;
            play_ground.context2d.strokeStyle = this.selected ? this.selectedBrush.value : this.brush.value;
            play_ground.context2d.moveTo(draw_info.startPoint.x, draw_info.startPoint.y);
            play_ground.context2d.lineTo(draw_info.endPoint.x, draw_info.endPoint.y);
            play_ground.context2d.stroke();
        }
        public setAngle(value: number, pivot_point?: IPoint): void
        {
            const start_point = pivot_point ?? this.startPoint;
            const end_poin = (start_point == this.endPoint) ? this.startPoint : this.endPoint;
            const dp = ActiveLineBase.setAngle(value, start_point.x, start_point.y, end_poin.x, end_poin.y);
            if (end_poin instanceof ActivePoint)
            {
                end_poin.move(dp.x, dp.y);
            }
        }

        private _points: Array<ActivePointBase>;
    }
}