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
/// <reference path="tools.point.virtual.ts" />
/// <reference path="tools.point.common.ts" />
/// <reference path="tools.line.ts" />
/// <reference path="tools.intersections.ts" />

module Geoma.Tools
{
    import Point = Utils.Point;
    //import assert = Utils.assert;
    import binding = Utils.binding;

    class BisectorLineCalculator
    {
        constructor(angle_indicator: AngleIndicator)
        {
            this._drawInfo = new Utils.ModifiableProperty<LineDrawInfo>(() =>
            {
                const angle1 = angle_indicator.textAngle;
                const angle2 = Math.PI + angle1;
                return {
                    startPoint: Point.make(
                        angle_indicator.commonPivot.x + BisectorLineCalculator._radius * Math.cos(angle1),
                        angle_indicator.commonPivot.y + BisectorLineCalculator._radius * Math.sin(angle1)
                    ),
                    endPoint: Point.make(
                        angle_indicator.commonPivot.x + BisectorLineCalculator._radius * Math.cos(angle2),
                        angle_indicator.commonPivot.y + BisectorLineCalculator._radius * Math.sin(angle2)
                    )
                };
            },
                {
                    startPoint: Point.empty,
                    endPoint: Point.empty
                });
        }

        public get drawInfo(): LineDrawInfo
        {
            return this._drawInfo.value;
        }

        private _drawInfo: Utils.ModifiableProperty<LineDrawInfo>;
        private static readonly _radius: number = 100;
    }

    class BisectorLinePivot extends ActiveVirtualPoint
    {
        constructor(document: Document, calculator: BisectorLineCalculator, start: boolean)
        {
            if (start)
            {
                super(document, () => calculator.drawInfo.startPoint.x, () => calculator.drawInfo.startPoint.y);
            }
            else
            {
                super(document, () => calculator.drawInfo.endPoint.x, () => calculator.drawInfo.endPoint.y);
            }
        }
    }

    export class BisectorLine extends ActiveLine
    {
        constructor(
            angle_indicator: AngleIndicator,
            line_width: binding<number> = CurrentTheme.BisectorLineWidth,
            brush: binding<Sprite.Brush> = CurrentTheme.BisectorBrush,
            selected_brush: binding<Sprite.Brush> = CurrentTheme.BisectorSelectionBrush
        )
        {
            const calculator = new BisectorLineCalculator(angle_indicator);
            super(
                new BisectorLinePivot(angle_indicator.document, calculator, true),
                new BisectorLinePivot(angle_indicator.document, calculator, false),
                line_width,
                brush,
                selected_brush
            );

            //The virtual points is not real.
            this.points.splice(0, this.points.length);
            this.points.push(angle_indicator.commonPivot);
            this._angleIndicator = angle_indicator;
        }

        public isMoved(receiptor: string): boolean
        {
            return this._angleIndicator.isMoved(receiptor);
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

                    let menu_item = menu.addMenuItem(Resources.string("Обозначить угол..."));
                    menu_item.onChecked.bind(this, () => doc.setAngleIndicatorState(this, event));

                    menu_item = menu.addMenuItem(Resources.string("Показать биссектрису угла..."));
                    menu_item.onChecked.bind(this, () => doc.setBisectorState(this, event));

                    menu_item = menu.addMenuItem(Resources.string("Добавить точку"));
                    menu_item.onChecked.bind(this, () => doc.addPoint(Point.make(x, y)));

                    menu_item = menu.addMenuItem(Resources.string("Удалить биссектрису"));
                    menu_item.onChecked.bind(this, () => this._angleIndicator.removeBisector(this));

                    menu.show();
                }
            }
            super.mouseClick(event);
        }

        private _angleIndicator: AngleIndicator;
    }
}