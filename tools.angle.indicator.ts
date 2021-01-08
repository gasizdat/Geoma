/// <reference path="utils.ts" />
/// <reference path="sprites.ts" />
/// <reference path="polygons.ts" />
/// <reference path="interfaces.ts" />
/// <reference path="play_ground.ts" />
/// <reference path="tools.core.ts" />
/// <reference path="tools.menu.ts" />
/// <reference path="tools.tools.ts" />
/// <reference path="tools.styles.ts" />
/// <reference path="tools.point.base.ts" />
/// <reference path="tools.point.active.ts" />
/// <reference path="tools.point.common.ts" />
/// <reference path="tools.line.base.ts" />
/// <reference path="tools.line.segment.ts" />
/// <reference path="tools.line.bisector.ts" />
/// <reference path="tools.document.ts" />
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

    export enum AngleDirection
    {
        clockwise,
        anticlockwise
    }

    export class AngleIndicator extends DocumentSprite<Sprite.Container> implements ICircle
    {
        constructor(document: Document, s1: ActiveLineSegment, s2: ActiveLineSegment)
        {
            super(document, new Sprite.Container());
            this.segment1 = s1;
            this.segment2 = s2;
            this.enabled = true;

            if (s1.start == s2.start)
            {
                this.commonPivot = s1.start;
                this._p1 = s1.end;
                this._p2 = s2.end;
            }
            else if (s1.start == s2.end)
            {
                this.commonPivot = s1.start;
                this._p1 = s1.end;
                this._p2 = s2.start;
            }
            else if (s1.end == s2.start)
            {
                this.commonPivot = s1.end;
                this._p1 = s1.start;
                this._p2 = s2.end;
            }
            else
            {
                this.commonPivot = s1.end;
                this._p1 = s1.start;
                this._p2 = s2.start;
            }
            assert(this.commonPivot != this._p1 && this.commonPivot != this._p2 && this._p1 != this._p2);
            assert(s2.belongs(this.commonPivot));

            this.addVisible(makeMod(this, (value: boolean) => value && this.commonPivot.visible));

            const indicators = this.document.getAngleIndicators(this.commonPivot).length;
            this._selectionRadius = 30 + 15 * indicators;

            this._angle = new Utils.ModifiableProperty<number>(makeMod(
                this,
                () => ActiveLineSegment.getAngle(this.commonPivot.x, this.commonPivot.y, this._p1.x, this._p1.y, this._p2.x, this._p2.y)
            ), 0);
            this._startAngle = new Utils.ModifiableProperty<number>(makeMod(
                this,
                () => ActiveLineSegment.getAngle(this.commonPivot.x, this.commonPivot.y, this._p1.x, this._p1.y)
            ), 0);
            this._endAngle = new Utils.ModifiableProperty<number>(makeMod(
                this,
                () => ActiveLineSegment.getAngle(this.commonPivot.x, this.commonPivot.y, this._p2.x, this._p2.y)
            ), 0);
            this._textAngle = new Utils.ModifiableProperty<number>(makeMod(
                this,
                () =>
                {
                    const anticlockwise = this._angleDirection.value;
                    if (anticlockwise)
                    {
                        return this._startAngle.value - this.angle / 2;
                    }
                    else
                    {
                        return this._startAngle.value + this.angle / 2;
                    }
                }
            ), 0);
            this._angleDirection = new Utils.ModifiableProperty<AngleDirection>(makeMod(this,
                () => AngleIndicator.angleDifDirection(this._startAngle.value, this._endAngle.value)
            ), AngleDirection.clockwise);
            this._bisectorAngle = new Utils.ModifiableProperty<number>(makeMod(
                this,
                () => (this._startAngle.value + this._endAngle.value) / 2
            ), 0);
            const text = new Sprite.Text(
                makeMod(this, () => Math.cos(this._textAngle.value) * this._selectionRadius + this.commonPivot.x),
                makeMod(this, () => Math.sin(this._textAngle.value) * this._selectionRadius + this.commonPivot.y),
                undefined,
                undefined,
                makeMod(this, () => this.selected ? CurrentTheme.AngleNameSelectBrush : CurrentTheme.AngleNameBrush),
                () => CurrentTheme.AngleNameStyle,
                makeMod(this, () => this._angleName ? this._angleName : `${Utils.toDeg(this.angle).toFixed(CurrentTheme.AngleIndicatorPrecision)}°`)
            );
            text.strokeBrush.addModifier(() => CurrentTheme.AngleIndicatorStrokeBrush);
            text.strokeWidth.addModifier(() => CurrentTheme.AngleIndicatorStrokeWidth);

            const visible_mod = makeMod(this, () => this.selected);
            const x_mod = makeMod(this, () => this.commonPivot.x - this._selectionRadius);
            const y_mod = makeMod(this, () => this.commonPivot.y - this._selectionRadius);
            const ellipse = new Polygon.Ellipse(
                Geoma.Utils.Point.make(this._selectionRadius, this._selectionRadius),
                this._selectionRadius,
                this._selectionRadius,
                0,
                2 * Math.PI
            );
            const selection_back = new Sprite.Polyshape(
                x_mod,
                y_mod,
                undefined,
                () => CurrentTheme.AngleIndicatorSelectionBrush
            );
            selection_back.alpha = 0.1;
            selection_back.addVisible(visible_mod);
            selection_back.addPolygon(ellipse);
            const selection_border = new Sprite.Polyline(
                x_mod,
                y_mod,
                1,
                () => CurrentTheme.AngleIndicatorSelectionBorderBrush
            );
            selection_border.addVisible(visible_mod);
            selection_border.addPolygon(ellipse);

            this.item.push(selection_back);
            this.item.push(selection_border);
            this.item.push(text);
        }

        public readonly segment1: ActiveLineSegment;
        public readonly segment2: ActiveLineSegment;
        public readonly commonPivot: ActivePoint;
        public get angle(): number
        {
            return this._angle.value;
        }
        public get bisectorAngle(): number
        {
            return this._bisectorAngle.value;
        }
        public get name(): string
        {
            return this._angleName ?? this.realName;
        }
        public set name(name: string)
        {
            assert(!this._angleName);
            this._angleName = name;
        }
        public get hasBisector(): boolean
        {
            return this._bisector != null;
        }
        public get center(): IPoint
        {
            return this.commonPivot;
        }
        public get radius(): number
        {
            return this._selectionRadius;
        }

        public enabled: boolean;

        public isRelated(sprite: Sprite.Sprite): boolean
        {
            return this.commonPivot == sprite || this.segment1 == sprite || this.segment2 == sprite;
        }
        public dispose(): void
        {
            super.dispose();
            if (this._bisector)
            {
                this.removeBisector(this._bisector);
            }
        }
        public addBisector(): void
        {
            assert(!this._bisector);
            this._bisector = new BisectorLine(this);
        }
        public removeBisector(bisector: BisectorLine): void
        {
            assert(this._bisector == bisector);
            this._bisector.dispose();
            delete this._bisector;
            if (!this.enabled)
            {
                this.document.removeAngle(this);
            }
        }
        public serialize(context: SerializationContext): Array<string>
        {
            const data: Array<string> = [];
            data.push(context.lines[this.segment1.name].toString());
            data.push(context.lines[this.segment2.name].toString());
            if (this.hasBisector)
            {
                data.push(`b`);
            }
            if (!this.enabled)
            {
                data.push(`d`);
            }
            return data;
        }

        public static angleDifDirection(start_angle: number, end_angle: number): AngleDirection
        {
            let anticlockwise = false;
            if (start_angle < Math.PI)
            {
                if (end_angle > Math.PI)
                {
                    anticlockwise = (end_angle - start_angle) > Math.PI;
                }
                else
                {
                    anticlockwise = end_angle < start_angle;
                }
            }
            else
            {
                if (end_angle > Math.PI)
                {
                    anticlockwise = end_angle < start_angle;
                }
                else
                {
                    anticlockwise = (start_angle - end_angle) < Math.PI;
                }
            }
            return anticlockwise ? AngleDirection.anticlockwise : AngleDirection.clockwise;
        }
        public static deserialize(context: DesializationContext, data: Array<string>, index: number): AngleIndicator | null
        {
            if (data.length < (index + 1))
            {
                return null;
            }
            else
            {
                const line1 = context.data.lines.item(toInt(data[index]));
                const line2 = context.data.lines.item(toInt(data[index + 1]));
                const angle = new AngleIndicator(context.document, line1, line2);
                for (let i = index + 2; i < data.length; i++)
                {
                    switch (data[i])
                    {
                        case 'b':
                            angle.addBisector();
                            break;
                        case 'd':
                            angle.enabled = false;
                            break;
                        default:
                            return null;
                    }
                }
                return angle;
            }
        }

        protected get realName(): string
        {
            if (this._p1.name < this._p2.name)
            {
                return `∠${this._p1.name}${this.commonPivot.name}${this._p2.name}`;
            }
            else
            {
                return `∠${this._p2.name}${this.commonPivot.name}${this._p1.name}`;
            }
        }

        protected canSelect(event: MouseEvent): boolean
        {
            const dx = event.x - this.commonPivot.x;
            const dy = event.y - this.commonPivot.y;
            return this.enabled && (dx * dx + dy * dy) <= (this._selectionRadius * this._selectionRadius);
        }
        protected innerDraw(play_ground: PlayGround): void
        {
            if (this._bisector)
            {
                this._bisector.draw(play_ground);
            }

            if (this.enabled)
            {
                const x = this.commonPivot.x;
                const y = this.commonPivot.y;

                play_ground.context2d.beginPath();

                if (Math.abs(Math.round(Utils.toDeg(this._angle.value)) - 90) < 0.01)
                {
                    const i1 = LineCircle.intersection(this.segment1, this);
                    const i2 = LineCircle.intersection(this.segment2, this);
                    const p1 = i1.p1 ?? i1.p2;
                    const p2 = i2.p1 ?? i2.p2;

                    if (p1 && p2)
                    {
                        if (this.selected)
                        {
                            play_ground.context2d.beginPath();
                            play_ground.context2d.fillStyle = CurrentTheme.AngleIndicatorSelectionBrush;
                            play_ground.context2d.moveTo(p1.x, p1.y);
                            play_ground.context2d.lineTo(p1.x + p2.x - x, p1.y + p2.y - y);
                            play_ground.context2d.lineTo(p2.x, p2.y);
                            play_ground.context2d.lineTo(x, y);
                            play_ground.context2d.closePath();
                            play_ground.context2d.fill();
                        }
                        else
                        {
                            play_ground.context2d.beginPath();
                            play_ground.context2d.strokeStyle = CurrentTheme.AngleIndicatorBrush;
                            play_ground.context2d.lineWidth = CurrentTheme.AngleIndicatorLineWidth;
                            play_ground.context2d.moveTo(p1.x, p1.y);
                            play_ground.context2d.lineTo(p1.x + p2.x - x, p1.y + p2.y - y);
                            play_ground.context2d.lineTo(p2.x, p2.y);
                            play_ground.context2d.stroke();
                        }
                    }
                }
                else if (this.selected)
                {
                    play_ground.context2d.fillStyle = CurrentTheme.AngleIndicatorSelectionBrush;
                    play_ground.context2d.arc(
                        this.commonPivot.x,
                        this.commonPivot.y,
                        this._selectionRadius,
                        this._startAngle.value,
                        this._endAngle.value,
                        this._angleDirection.value == AngleDirection.anticlockwise
                    );
                    play_ground.context2d.lineTo(this.commonPivot.x, this.commonPivot.y);
                    play_ground.context2d.fill();
                }
                else
                {
                    play_ground.context2d.strokeStyle = CurrentTheme.AngleIndicatorBrush;
                    play_ground.context2d.lineWidth = CurrentTheme.AngleIndicatorLineWidth;
                    play_ground.context2d.arc(
                        this.commonPivot.x,
                        this.commonPivot.y,
                        this._selectionRadius,
                        this._startAngle.value,
                        this._endAngle.value,
                        this._angleDirection.value == AngleDirection.anticlockwise
                    );
                    play_ground.context2d.stroke();
                }

                super.innerDraw(play_ground);
            }
        }
        protected mouseMove(event: MouseEvent): void
        {
            let can_select = this.canSelect(event);
            if (can_select)
            {
                const min_sel_radius = this._selectionRadius;
                for (const indicator of this.document.getAngleIndicators(this.commonPivot))
                {
                    if (indicator != this && indicator.canSelect(event) && indicator._selectionRadius < min_sel_radius)
                    {
                        can_select = false;
                        break;
                    }
                }
            }
            this.selected = can_select;
            super.mouseMove(event);
        }
        protected mouseClick(event: MouseEvent): void
        {
            const doc = this.document;

            if (doc.canShowMenu(this))
            {
                const x = doc.mouseArea.mousePoint.x;
                const y = doc.mouseArea.mousePoint.y;
                const menu = new Menu(doc, x, y);

                let menu_item = menu.addMenuItem(`Показать биссектрисы углов`);
                menu_item.onChecked.bind(this, this.addBisector);
                menu_item.enabled.addModifier(makeMod(this, () => !this._bisector));

                const set_name = (index: number) => this._angleName = AngleIndicator._anglesNames.charAt(index);
                if (this._angleName)
                {
                    menu_item = menu.addMenuItem(`По умолчанию (${this.realName})`);
                    menu_item.onChecked.bind(this, () => this._angleName = undefined);
                }

                const custom_name = menu.addMenuGroup("Настраиваемое имя");
                let stripe: MenuStrip;
                for (let i = 0; i < AngleIndicator._anglesNames.length; i++)
                {
                    if (i % 6 == 0)
                    {
                        stripe = custom_name.addMenuStrip();
                    }
                    const index = i;
                    const menu_item = stripe!.addMenuItem(` ${AngleIndicator._anglesNames.charAt(index)} `);
                    menu_item.onChecked.bind(this, () => set_name(index));
                }

                menu_item = menu.addMenuItem(`Удалить индикатор угла ${this.name}`);
                menu_item.onChecked.bind(this, () => doc.removeAngle(this));

                menu.show();
            }
            super.mouseClick(event);
        }

        private _angleName?: string;
        private _angle: property<number>;
        private _startAngle: property<number>;
        private _endAngle: property<number>;
        private _textAngle: property<number>;
        private _angleDirection: property<AngleDirection>;
        private _bisectorAngle: property<number>;
        private _p1: ActivePoint;
        private _p2: ActivePoint;
        private _bisector?: BisectorLine;
        private readonly _selectionRadius: number;
        private static readonly _anglesNames: string = "αβγδεζηθικλμνξορστυyφχψω";
    }
}