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
    import MulticastEvent = Utils.MulticastEvent;
    import modifier = Utils.modifier;
    import property = Utils.ModifiableProperty;
    import Box = Utils.Box;
    import binding = Utils.binding;
    import Debug = Sprite.Debug;

    class BisectorLineCalculator
    {
        constructor(angle_indicator: AngleIndicator)
        {
            this.angleIndicator = angle_indicator;
            this.drawInfo = { startPoint: Point.empty, endPoint: Point.empty };
        }

        public evaluate(): void
        {
            this.drawInfo = ActiveLineBase.getLineDrawInfo(this.angleIndicator.document, this.angleIndicator.commonPivot, this.angleIndicator.bisectorAngle);
        }

        public readonly angleIndicator: AngleIndicator;
        public drawInfo: LineDrawInfo;
    }

    class BisectorLinePivot implements IPoint
    {
        constructor(calculator: BisectorLineCalculator, start: boolean)
        {
            this._calculator = calculator;
            this._start = start;
        }
        public get x(): number
        {
            return this._start ? this._calculator.drawInfo.startPoint.x : this._calculator.drawInfo.endPoint.x;
        }
        public get y(): number
        {
            return this._start ? this._calculator.drawInfo.startPoint.y : this._calculator.drawInfo.endPoint.y;
        }

        private readonly _calculator: BisectorLineCalculator;
        private readonly _start: boolean;
    }

    export class BisectorLine extends ActiveLineBase
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
                angle_indicator.document,
                new BisectorLinePivot(calculator, true),
                new BisectorLinePivot(calculator, false),
                line_width,
                brush,
                selected_brush
            );

            this._calculator = calculator;
            this._beforeDrawListener = this.document.onBeforeDraw.bind(this._calculator, this._calculator.evaluate);
        }

        public get moved(): boolean
        {
            return this._calculator.angleIndicator.segment1.moved || this._calculator.angleIndicator.segment2.moved;
        }
        public get isPartOf(): ActiveLineBase | null
        {
            throw new Error("Method not implemented.");
        }

        public dispose(): void
        {
            if (!this.disposed)
            {
                this._beforeDrawListener.dispose();
                super.dispose();
            }
        }
        public move(dx: number, dy: number): void
        {
            assert(false, "Not implemented yet");
        }
        public belongs(p1: ActivePointBase): boolean
        {
            return this._calculator.angleIndicator.commonPivot == p1;
        }
        public mouseHit(point: IPoint)
        {
            return super.mouseHit(point) && PointLine.intersected(
                point,
                this._calculator.angleIndicator.center,
                this.coefficients,
                Thickness.Mouse
            );
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

                    const menu_item = menu.addMenuItem(Resources.string("Удалить биссектрису"));
                    menu_item.onChecked.bind(this, () => this._calculator.angleIndicator.removeBisector(this));
                    menu.show();
                }
            }
            super.mouseClick(event);
        }

        private readonly _calculator: BisectorLineCalculator;
        private readonly _beforeDrawListener: IEventListener<BeforeDrawEvent>;
    }
}