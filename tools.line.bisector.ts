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

    export class BisectorLine extends ActiveLineBase
    {
        constructor(
            angle_indicator: AngleIndicator,
            line_width: binding<number> = CurrentTheme.BisectorLineWidth,
            brush: binding<Sprite.Brush> = CurrentTheme.BisectorBrush,
            selected_brush: binding<Sprite.Brush> = CurrentTheme.BisectorSelectionBrush
        )
        {
            class pivot implements IPoint
            {
                constructor(angle_indicator: AngleIndicator, start: boolean)
                {
                    this._angleIndicator = angle_indicator;
                    this._start = start;
                }
                public get x(): number
                {
                    const i = this._angleIndicator;
                    const a = this._start ? i.bisectorAngle : i.bisectorAngle - Math.PI;
                    const x = i.commonPivot.x;
                    const w = i.document.mouseArea.w;
                    const h = i.document.mouseArea.h;
                    const r = Math.sqrt(w * w + h * h);
                    return Math.cos(a) * r + x;
                }
                public get y(): number
                {
                    const i = this._angleIndicator;
                    const a = this._start ? i.bisectorAngle : i.bisectorAngle - Math.PI;
                    const y = i.commonPivot.y;
                    const w = i.document.mouseArea.w;
                    const h = i.document.mouseArea.h;
                    const r = Math.sqrt(w * w + h * h);
                    return Math.sin(a) * r + y;
                }

                private readonly _start: boolean;
                private _angleIndicator: AngleIndicator;
            }

            super(
                angle_indicator.document,
                new pivot(angle_indicator, true),
                new pivot(angle_indicator, false),
                line_width,
                brush,
                selected_brush
            );
            this._angleIndicator = angle_indicator;
        }

        public get moved(): boolean
        {
            return this._angleIndicator.segment1.moved || this._angleIndicator.segment2.moved;
        }

        public move(dx: number, dy: number): void
        {
            assert(false, "Not implemented yet");
        }
        public belongs(p1: ActivePointBase): boolean
        {
            return this._angleIndicator.commonPivot == p1;
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

                    const menu_item = menu.addMenuItem("Удалить биссектрису");
                    menu_item.onChecked.bind(this, () => this._angleIndicator.removeBisector(this));
                    menu.show();
                }
            }
            super.mouseClick(event);
        }

        private _angleIndicator: AngleIndicator;
    }
}