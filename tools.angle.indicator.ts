/// <reference path="utils.ts" />
/// <reference path="sprites.ts" />
/// <reference path="polygons.ts" />
/// <reference path="interfaces.ts" />
/// <reference path="play_ground.ts" />
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
/// <reference path="tools.document.ts" />
/// <reference path="tools.intersections.ts" />

module Geoma.Tools
{
    import makeMod = Utils.makeMod;
    import toInt = Utils.toInt;
    import assert = Utils.assert;
    import property = Utils.ModifiableProperty;

    export enum AngleDirection
    {
        clockwise,
        anticlockwise
    }

    export class AngleIndicator extends DocumentSprite<Sprite.Container> implements ICircle
    {
        constructor(document: Document, p0: ActivePointBase, p1: ActivePointBase, p2: ActivePointBase)
        {
            assert(p0 != p1 && p0 != p2 && p1 != p2);
            super(document, new Sprite.Container());
            this.enabled = true;
            this.commonPivot = p0;
            this._p1 = p1;
            this._p2 = p2;
            this.addVisible(makeMod(this, (value: boolean) => value && this.commonPivot.visible && this._p1.visible && this._p2.visible));

            this._selectionRadius = Utils.makeProp<number>(makeMod(this, () => 30 + 15 * this.document.getEngleIndicatorOrder(this)), 30);

            this._angle = new Utils.ModifiableProperty<number>(
                makeMod(this,
                () => ActiveLineSegment.getAngle(this.commonPivot.x, this.commonPivot.y, this._p1.x, this._p1.y, this._p2.x, this._p2.y)
            ), 0);
            this._startAngle = new Utils.ModifiableProperty<number>(
                makeMod(this,
                () => ActiveLineSegment.getAngle(this.commonPivot.x, this.commonPivot.y, this._p1.x, this._p1.y)
            ), 0);
            this._endAngle = new Utils.ModifiableProperty<number>(
                makeMod(this,
                () => ActiveLineSegment.getAngle(this.commonPivot.x, this.commonPivot.y, this._p2.x, this._p2.y)
            ), 0);
            this._textAngle = new Utils.ModifiableProperty<number>(
                makeMod(this,
                () =>
                {
                    switch(this.angleDirection)
                    {
                        case AngleDirection.clockwise:
                            return this.startAngle + this.angle / 2;
                        default:
                            return this.startAngle - this.angle / 2;
                    }
                }
            ), 0);
            this._angleDirection = new Utils.ModifiableProperty<AngleDirection>(
                makeMod(this, () => AngleIndicator.angleDifDirection(this.startAngle, this.endAngle)
            ), AngleDirection.clockwise);
            const text = new Sprite.Text(
                makeMod(this, () => Math.cos(this.textAngle) * this.radius + this.commonPivot.x),
                makeMod(this, () => Math.sin(this.textAngle) * this.radius + this.commonPivot.y),
                undefined,
                undefined,
                makeMod(this, () => this.selected ? CurrentTheme.AngleNameSelectBrush : CurrentTheme.AngleNameBrush),
                () => CurrentTheme.AngleNameStyle,
                makeMod(this, () => this._angleName ? this._angleName : `${Utils.toFixed(Utils.toDeg(this.angle), CurrentTheme.AngleIndicatorPrecision)}°`)
            );
            text.strokeBrush.addModifier(() => CurrentTheme.AngleIndicatorStrokeBrush);
            text.strokeWidth.addModifier(() => CurrentTheme.AngleIndicatorStrokeWidth);
            this.item.push(text);
        }

        public readonly commonPivot: ActivePointBase;
        public get angle(): number
        {
            return this._angle.value;
        }
        public get textAngle(): number
        {
            return this._textAngle.value;
        }
        public get startAngle(): number
        {
            return this._startAngle.value;
        }
        public get endAngle(): number
        {
            return this._endAngle.value;
        }
        public get angleDirection(): AngleDirection
        {
            return this._angleDirection.value;
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
        public get realName(): string
        {
            return AngleIndicator.getAngleName(this.commonPivot, this._p1, this._p2);
        }
        public get center(): IPoint
        {
            return this.commonPivot;
        }
        public get radius(): number
        {
            return this._selectionRadius.value;
        }
        public get bisector(): ActiveLineBase | null
        {
            return this._bisector ? this._bisector : null;
        }

        public enabled: boolean;

        public isMoved(receiptor: string): boolean
        {
            return this.commonPivot.isMoved(receiptor) || this._p1.isMoved(receiptor) || this._p2.isMoved(receiptor);
        }
        public isRelated(sprite: Sprite.Sprite): boolean
        {
            if (sprite instanceof ActivePointBase)
            {
                return this.commonPivot == sprite || this._p1 == sprite || this._p2 == sprite;
            }
            else if (sprite instanceof ActiveLineBase)
            {
                return sprite.isRelated(this.commonPivot) && (sprite.isRelated(this._p1) || sprite.isRelated(this._p2));
            }
            else
            {
                assert(false, "TODO");
            }
        }
        public dispose(): void
        {
            super.dispose();
            if (this._bisector)
            {
                this._removeBisector(this._bisector);
            }
        }
        public addBisector(): void
        {
            UndoTransaction.Do(this, Resources.string("Показать биссектрисы углов"), this._addBisector);
        }
        public removeBisector(bisector: BisectorLine): void
        {
            UndoTransaction.Do(this, Resources.string("Удалить биссектрису"), () => this._removeBisector(bisector));
        }
        public serialize(context: SerializationContext): Array<string>
        {
            const data: Array<string> = [];
            data.push(context.points[this.commonPivot.name].toString());
            data.push(context.points[this._p1.name].toString());
            data.push(context.points[this._p2.name].toString());
            if (this.bisector)
            {
                data.push(`b${this.bisector.points.length - 1}`);
                for (const p of this.bisector.points)
                {
                    if (p != this.commonPivot)
                    {
                        data.push(context.points[p.name].toString());
                    }
                }
            }
            if (!this.enabled)
            {
                data.push(`d`);
            }
            if (this._angleName)
            {
                data.push(`n${AngleIndicator._anglesNames.indexOf(this._angleName)}`);
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
            if (data.length < (index + 3))
            {
                return null;
            }
            else
            {
                const p0 = context.data.points.item(toInt(data[index++]));
                const p1 = context.data.points.item(toInt(data[index++]));
                const p2 = context.data.points.item(toInt(data[index++]));
                const angle = new AngleIndicator(context.document, p0, p1, p2);
                for (; index < data.length; index++)
                {
                    const chunck = data[index];
                    assert(chunck.length);
                    const prefix = chunck.charAt(0);
                    switch (prefix)
                    {
                        case 'b':
                            const bisector = angle._addBisector();
                            const common_points = toInt(chunck.substring(1));
                            for (let i = 0; i < common_points; i++)
                            {
                                index++;
                                if (index >= data.length)
                                {
                                    return null;
                                }
                                else
                                {
                                    const p = context.data.points.item(toInt(data[index]));
                                    assert(p instanceof ActiveCommonPoint);
                                    p.addGraphLine(bisector);
                                    bisector.addPoint(p);
                                }
                            }
                            break;
                        case 'd':
                            angle.enabled = false;
                            break;
                        case 'n':
                            const p_index = toInt(chunck.substring(1));
                            if (p_index >= 0 && p_index < AngleIndicator._anglesNames.length)
                            {
                                angle._angleName = AngleIndicator._anglesNames.charAt(p_index);
                            }
                            break;
                        default:
                            assert(false);
                    }
                }
                return angle;
            }
        }
        public static getAngleName(p0: ActivePointBase, p1: ActivePointBase, p2: ActivePointBase): string
        {
            if (p1.name < p2.name)
            {
                return `∠${AngleIndicator._getName(p1)}${AngleIndicator._getName(p0)}${AngleIndicator._getName(p2)}`;
            }
            else
            {
                return `∠${AngleIndicator._getName(p2)}${AngleIndicator._getName(p0)}${AngleIndicator._getName(p1)}`;
            }
        }

        protected canSelect(event: MouseEvent): boolean
        {
            const dx = event.x - this.commonPivot.x;
            const dy = event.y - this.commonPivot.y;
            return this.enabled && (dx * dx + dy * dy) <= (this.radius * this.radius);
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
                const select_brush_alpha = 0.3;
                const selection_border = ()=>
                {
                    play_ground.context2d.beginPath();
                    play_ground.context2d.strokeStyle = CurrentTheme.AngleIndicatorBrush;
                    play_ground.context2d.lineWidth = CurrentTheme.AngleIndicatorLineWidth;
                    play_ground.context2d.arc(
                        x,
                        y,
                        this.radius,
                        this.startAngle,
                        this.endAngle,
                        this.angleDirection != AngleDirection.anticlockwise
                    );
                    play_ground.context2d.stroke();
                    play_ground.context2d.closePath();
                };

                play_ground.context2d.beginPath();

                if (Math.abs(Math.round(Utils.toDeg(this.angle)) - 90) < 0.01)
                {

                    const p1 = ActiveLineBase.getPoint(this.commonPivot, this._p1, this.radius);
                    const p2 = ActiveLineBase.getPoint(this.commonPivot, this._p2, this.radius);

                    if (this.selected)
                    {
                        const global_alpha = play_ground.context2d.globalAlpha;
                        play_ground.context2d.globalAlpha = select_brush_alpha;
                        play_ground.context2d.beginPath();
                        play_ground.context2d.fillStyle = CurrentTheme.AngleIndicatorSelectionBrush;
                        play_ground.context2d.moveTo(p1.x, p1.y);
                        play_ground.context2d.lineTo(p1.x + p2.x - x, p1.y + p2.y - y);
                        play_ground.context2d.lineTo(p2.x, p2.y);
                        play_ground.context2d.lineTo(x, y);
                        play_ground.context2d.fill();

                        selection_border.apply(this);
                           
                        play_ground.context2d.globalAlpha = global_alpha;
                        play_ground.context2d.closePath();
                    }

                    play_ground.context2d.beginPath();
                    play_ground.context2d.strokeStyle = CurrentTheme.AngleIndicatorBrush;
                    play_ground.context2d.lineWidth = CurrentTheme.AngleIndicatorLineWidth;
                    play_ground.context2d.moveTo(p1.x, p1.y);
                    play_ground.context2d.lineTo(p1.x + p2.x - x, p1.y + p2.y - y);
                    play_ground.context2d.lineTo(p2.x, p2.y);
                    play_ground.context2d.stroke();
                }
                else
                {
                    if (this.selected)
                    {
                        const global_alpha = play_ground.context2d.globalAlpha;
                        play_ground.context2d.globalAlpha = select_brush_alpha;
                        play_ground.context2d.fillStyle = CurrentTheme.AngleIndicatorSelectionBrush;
                        play_ground.context2d.arc(
                            this.commonPivot.x,
                            this.commonPivot.y,
                            this.radius,
                            this.startAngle,
                            this.endAngle,
                            this.angleDirection == AngleDirection.anticlockwise
                        );
                        play_ground.context2d.lineTo(this.commonPivot.x, this.commonPivot.y);
                        play_ground.context2d.fill();
                        play_ground.context2d.closePath();

                        selection_border.apply(this);

                        play_ground.context2d.globalAlpha = global_alpha;
                        play_ground.context2d.beginPath();
                    }

                    play_ground.context2d.strokeStyle = CurrentTheme.AngleIndicatorBrush;
                    play_ground.context2d.lineWidth = CurrentTheme.AngleIndicatorLineWidth;
                    play_ground.context2d.arc(
                        this.commonPivot.x,
                        this.commonPivot.y,
                        this.radius,
                        this.startAngle,
                        this.endAngle,
                        this.angleDirection == AngleDirection.anticlockwise
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
                for (const indicator of this.document.getAngleIndicators(this.commonPivot))
                {
                    if (indicator != this && indicator.canSelect(event) && indicator.radius < this.radius)
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

                let menu_item = menu.addMenuItem(Resources.string("Показать биссектрисы углов"));
                menu_item.onChecked.bind(this, this.addBisector);
                menu_item.enabled.addModifier(makeMod(this, () => !this._bisector));

                const set_name = (index: number) =>
                {
                    const name = AngleIndicator._anglesNames.charAt(index);
                    UndoTransaction.Do(this, Resources.string("Название угла ({0})", name), () => this._angleName = name);
                };
                if (this._angleName)
                {
                    menu_item = menu.addMenuItem(Resources.string("Имя по умолчанию ({0})", this.realName));
                    menu_item.onChecked.bind(this, () =>
                    {
                        UndoTransaction.Do(this, Resources.string("Название угла ({0})", this.realName), () => this._angleName = undefined);
                    });
                }

                const custom_name = menu.addMenuGroup(Resources.string("Настраиваемое имя"));
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

                menu_item = menu.addMenuItem(Resources.string("Удалить индикатор угла {0}", this.name));
                menu_item.onChecked.bind(this, () => this.document.removeAngle(this));

                menu.show();
            }
            super.mouseClick(event);
        }

        private _addBisector(): BisectorLine
        {
            assert(!this._bisector);
            this._bisector = new BisectorLine(this);
            return this._bisector;
        }
        private _removeBisector(bisector: BisectorLine): void
        {
            assert(this._bisector == bisector);
            this._bisector.dispose();
            delete this._bisector;
            if (!this.enabled)
            {
                this.document.removeAngle(this);
            }
        }
        private static _getName(point: ActivePointBase): string
        {
            //TODO point in group may hidden by other point(s)
            /*if (point instanceof ActiveCommonPoint)
            {
                if (point.hidden)
                {
                    for (const other_point of point.document.getGroup(point))
                    {
                        if (!(other_point as ActiveCommonPoint).hidden && other_point.mouseHit(point))
                        {
                            return other_point.name;
                        }
                    }
                }
            }*/
            return point.name;
        }

        private _angleName?: string;
        private _bisector?: BisectorLine;
        private readonly _angle: property<number>;
        private readonly _startAngle: property<number>;
        private readonly _endAngle: property<number>;
        private readonly _textAngle: property<number>;
        private readonly _angleDirection: property<AngleDirection>;
        private readonly _p1: ActivePointBase;
        private readonly _p2: ActivePointBase;
        private readonly _selectionRadius: property<number>;
        private static readonly _anglesNames: string = "αβγδεζηθικλμνξορστυyφχψω";
    }
}