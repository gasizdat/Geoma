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
/// <reference path="tools.button.ts" />
/// <reference path="tools.point.base.ts" />
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

    export class AxesLines extends DocumentSprite<Sprite.Sprite>
    {
        constructor(
            document: Document,
            axes_number: number,
            x: binding<number>,
            y: binding<number>,
            kx: binding<number>,
            ky: binding<number>,
            line_width: binding<number>,
            brush: binding<Sprite.Brush>,
            selected_brush: binding<Sprite.Brush>
        )
        {
            class stub extends Sprite.Sprite
            {
                protected innerDraw(__play_ground: PlayGround): void
                {
                    throw new Error("Method not implemented.");
                }
            }
            super(document, new stub(x, y));
            this.axesId = axes_number;
            this._lineWidth = makeProp(line_width, 1);
            this._brush = makeProp(brush, "Black");
            this._selectedBrush = makeProp(selected_brush, "Black");
            this._kX = makeProp(kx, 1);
            this._kY = makeProp(ky, 1);
            this._showDegrees = makeProp<boolean>(true);
            this._needsCalc = new Utils.Pulse();
            this._dx = this._dy = 0;
            this._moved = new Utils.Pulse();
            this._beforeDrawListener = document.onBeforeDraw.bind(this, this.beforeDraw);
            this._adorners = new Sprite.Container();
            this._adorners.alpha = 0.8;
            this._adorners.addVisible(makeMod(this, ()=> this._adorners.length > 0 && document.canShowMenu(this)));

            this.addX(makeMod(this, (value: number) => value + this._dx));
            this.addY(makeMod(this, (value: number) => value + this._dy));
        }

        public readonly axesId: number;
        public get lineWidth(): number
        {
            return this._lineWidth.value;
        }
        public get brush(): Sprite.Brush
        {
            return this._brush.value;
        }
        public get selectedBrush(): Sprite.Brush
        {
            return this._selectedBrush.value;
        }
        public get kX(): number
        {
            return this._kX.value;
        }
        public get kY(): number
        {
            return this._kY.value;
        }
        public set kX(value: number)
        {
            this._kX.value = value;
        }
        public set kY(value: number)
        {
            this._kY.value = value;
        }
        public get showDegrees(): boolean
        {
            return this._showDegrees.value;
        }
        public get needsCalc(): Utils.Pulse
        {
            return this._needsCalc;
        }

        public dispose(): void
        {
            if (!this.disposed)
            {
                this._adorners.dispose();
                this._beforeDrawListener.dispose();
                super.dispose();
            }
        }
        public mouseHit(point: IPoint): boolean
        {
            if (Math.abs(point.y - this.y) <= Thickness.Mouse ||
                Math.abs(point.x - this.x) <= Thickness.Mouse)
            {
                return true;
            }
            else if (this._adorners.visible)
            {
                const margins = AxesLines._adornerMargins + Thickness.Mouse;
                return point.x >= (this._adorners.left - margins) &&
                    point.x <= (this._adorners.right + margins) &&
                    point.y >= (this._adorners.top - margins) &&
                    point.y <= (this._adorners.bottom + margins);
            }
            else
            {
                return false;
            }
        }
        public fromScreenX(screen_x: number): number
        {
            return (screen_x - this.x) * this.kX;
        }
        public fromScreenY(screen_y: number): number
        {
            return (this.y - screen_y) * this.kY;
        }
        public toScreenX(x: number): number
        {
            return this.x + (x / this.kX);
        }
        public toScreenY(y: number): number
        {
            return this.y - (y / this.kY);
        }
        public move(dx: number, dy: number): void
        {
            this._dx -= dx;
            this._dy -= dy;
            this._moved.set();
        }
        public moved(receiptor: string): boolean
        {
            return this._moved.get(receiptor);
        }
        public serialize(__context: SerializationContext): Array<string>
        {
            const data: Array<string> = [];
            data.push(`${this.axesId}`);
            data.push(`${this.x}`);
            data.push(`${this.y}`);
            data.push(`${this.kX}`);
            data.push(`${this.kY}`);
            return data;
        }
        public scaleDialog(): boolean
        {
            let scale: number | undefined;
            if (this.kX == this.kY)
            {
                scale = 1 / this.kX;
                if (scale > 1)
                {
                    scale = toInt(scale);
                }
            }
            const title = Resources.string("Масштаб по осям x/y, %");
            const new_scale = this.document.promptNumber(title, scale);
            if (new_scale != undefined)
            {
                return UndoTransaction.Do(this, title, () =>
                {
                    this.kX = 1 / new_scale;
                    this.kY = 1 / new_scale;
                    return true;
                });
            }
            else
            {
                return false;
            }
        }
        public static deserialize(context: DesializationContext, data: Array<string>, index: number): AxesLines | null
        {
            if (data.length < (index + 5))
            {
                return null;
            }
            else
            {
                const axes = new AxesLines(
                    context.document,
                    toInt(data[index++]),
                    parseFloat(data[index++]),
                    parseFloat(data[index++]),
                    parseFloat(data[index++]),
                    parseFloat(data[index++]),
                    () => CurrentTheme.AxesWidth,
                    () => CurrentTheme.AxesBrush,
                    () => CurrentTheme.AxesSelectBrush
                );
                return axes;
            }
        }

        protected static roundToDigit(value: number): { value: number, mantiss: number }
        {
            let k = 1;
            let ret = value;
            let mantiss = 0;
            if (value < 1)
            {
                while (toInt(ret) == 0)
                {
                    ret *= 10;
                    k /= 10;
                    mantiss--;
                }
            }
            else
            {
                while (toInt(ret) > 10)
                {
                    ret /= 10;
                    k *= 10;
                    mantiss++;
                }
            }
            return { value: toInt(ret) * k, mantiss: mantiss };
        }
        protected beforeDraw(__event: BeforeDrawEvent): void
        {
            if (this._lastX != this.x ||
                this._lastY != this.y ||
                this._lastKx != this.kX ||
                this._lastKy != this.kY ||
                this._lastW != this.document.mouseArea.w ||
                this._lastH != this.document.mouseArea.h ||
                this._lastOffsetX != this.document.mouseArea.offset.x ||
                this._lastOffsetY != this.document.mouseArea.offset.y
            )
            {
                this._lastX = this.x;
                this._lastY = this.y;
                this._lastKx = this.kX;
                this._lastKy = this.kY;
                this._lastW = this.document.mouseArea.w;
                this._lastH = this.document.mouseArea.h;
                this._lastOffsetX = this.document.mouseArea.offset.x;
                this._lastOffsetY = this.document.mouseArea.offset.y;
                this._needsCalc.set();
            }
        }
        protected innerDraw(play_ground: PlayGround): void
        {
            play_ground.context2d.beginPath();
            play_ground.context2d.moveTo(play_ground.offset.x, this.y);
            play_ground.context2d.lineTo(play_ground.right, this.y);
            play_ground.context2d.moveTo(this.x, play_ground.offset.y);
            play_ground.context2d.lineTo(this.x, play_ground.bottom);
            play_ground.context2d.strokeStyle = this.selected ? this.selectedBrush : this.brush;
            play_ground.context2d.lineWidth = this.lineWidth;
            if (this.showDegrees)
            {
                const grade_x = AxesLines.roundToDigit(150 * this.kX);
                const dx = grade_x.value / this.kX;
                const proportional = this.kX == this.kY;
                const grade_y = proportional ? grade_x : AxesLines.roundToDigit(150 * this.kY);
                const dy = proportional ? dx : grade_y.value / this.kY;

                play_ground.context2d.fillStyle = this.selected ? CurrentTheme.AxesTextSelectBrush : CurrentTheme.AxesTextBrush;
                const style = CurrentTheme.AxesTextStyle;
                if (style.direction)
                {
                    play_ground.context2d.direction = style.direction;
                }
                if (style.font)
                {
                    play_ground.context2d.font = style.font;
                }
                if (style.textAlign)
                {
                    play_ground.context2d.textAlign = style.textAlign;
                }
                if (style.textBaseline)
                {
                    play_ground.context2d.textBaseline = style.textBaseline;
                }
                const scale_bar_size = 10;
                const get_digits = (normalize_value: { value: number, mantiss: number }): number =>
                {
                    if (normalize_value.mantiss > 0)
                    {
                        return 0;
                    }
                    else if ((-normalize_value.mantiss) <= 4)
                    {
                        return -normalize_value.mantiss;
                    }
                    else
                    {
                        return 0;
                    }
                }
                const is_exponential = (normalize_value: { value: number, mantiss: number }): boolean =>
                {
                    if (normalize_value.mantiss > 0)
                    {
                        if (normalize_value.value > 9999)
                        {
                            return true;
                        }
                        else 
                        {
                            return false;
                        }
                    }
                    else
                    {
                        return (-normalize_value.mantiss) > 4;
                    }
                }
                const bar_text_margin = 2;
                {
                    let x_coord = -toInt((this.x - play_ground.offset.x) / dx);
                    const start_x = this.x + x_coord * dx;
                    x_coord *= grade_x.value;
                    const end_x = play_ground.right + 1;
                    const digits = get_digits(grade_x);
                    const exponential = is_exponential(grade_x);
                    let y1: number, y2: number, y3: number;
                    const screen_y = this.y - play_ground.offset.y;
                    if (screen_y >= 0)
                    {
                        if (screen_y < (play_ground.h - 2 * scale_bar_size))
                        {
                            y1 = this.y - scale_bar_size / 2;
                            y2 = this.y + scale_bar_size / 2;
                            y3 = this.y + scale_bar_size / 2 + bar_text_margin;
                        }
                        else
                        {
                            y1 = play_ground.h - scale_bar_size + play_ground.offset.y;
                            y2 = play_ground.h + play_ground.offset.y;
                            y3 = y1 - scale_bar_size;
                        }
                    }
                    else
                    {
                        y1 = play_ground.offset.y;
                        y2 = scale_bar_size + play_ground.offset.y;
                        y3 = scale_bar_size + bar_text_margin + play_ground.offset.y;
                    }

                    for (let x = start_x; x <= end_x; x += dx)
                    {
                        play_ground.context2d.moveTo(x, y1);
                        play_ground.context2d.lineTo(x, y2);
                        play_ground.context2d.fillText(exponential ? x_coord.toExponential(digits) : x_coord.toFixed(digits), x, y3);
                        x_coord += grade_x.value;
                    }
                }
                {
                    let y_coord = toInt((this.y - play_ground.offset.y) / dy);
                    const start_y = this.y - y_coord * dy;
                    y_coord *= grade_y.value;
                    const end_y = play_ground.bottom + 1;
                    const digits = get_digits(grade_y);
                    const exponential = is_exponential(grade_y);
                    let x1: number, x2: number, x3: number;
                    const screen_x = this.x - play_ground.offset.x;
                    if (screen_x >= 0)
                    {
                        if (screen_x < (play_ground.w - 2 * scale_bar_size))
                        {
                            x1 = this.x - scale_bar_size / 2;
                            x2 = this.x + scale_bar_size / 2;
                            x3 = this.x + scale_bar_size / 2 + bar_text_margin;
                        }
                        else
                        {
                            x1 = play_ground.w - scale_bar_size + play_ground.offset.x;
                            x2 = play_ground.w + play_ground.offset.x;
                            x3 = NaN;
                        }
                    }
                    else
                    {
                        x1 = play_ground.offset.x;
                        x2 = scale_bar_size + play_ground.offset.x;
                        x3 = scale_bar_size + bar_text_margin + play_ground.offset.x;
                    }
                    for (let y = start_y; y <= end_y; y += dy)
                    {
                        if (Math.abs(y - this.y) > dy / 2)
                        {
                            const y_text = exponential ? y_coord.toExponential(digits) : y_coord.toFixed(digits);
                            play_ground.context2d.moveTo(x1, y);
                            play_ground.context2d.lineTo(x2, y);
                            if (isNaN(x3))
                            {
                                const text_width = play_ground.context2d.measureText(y_text).width;
                                play_ground.context2d.fillText(y_text, x1 - text_width - scale_bar_size, y);
                            }
                            else
                            {
                                play_ground.context2d.fillText(y_text, x3, y);
                            }
                        }
                        y_coord -= grade_y.value;
                    }
                }
            }
            play_ground.context2d.stroke();

            this._adorners.draw(play_ground);
        }
        protected mouseMove(event: MouseEvent): void
        {
            const selected = this.mouseHit(event);
            if (this.selected)
            {
                if (!selected)
                {
                    while (this._adorners.first)
                    {
                        this._adorners.first.dispose();
                        this._adorners.remove(this._adorners.first);
                    }
                }
            }
            else if (selected)
            {
                let can_show_adorners = true;
                for (const sprite of this.document.selectedSprites)
                {
                    if (sprite instanceof ParametricLine && sprite.axes == this)
                    {
                        can_show_adorners = false;
                        break;
                    }                    
                }

                if (can_show_adorners)
                {
                    class ZoomButton extends Button
                    {
                        constructor(
                            axes: AxesLines,
                            x: binding<number>,
                            y: binding<number>,
                            text: binding<string>,
                            x_multiplier: number,
                            y_multiplier: number
                        )
                        {
                            super(axes.document, x, y, text, 10, 10, true, 45);
                            this._axes = axes;
                            this._x_multiplier = x_multiplier;
                            this._y_multiplier = y_multiplier;
                        }

                        protected onClick(): boolean
                        {
                            assert(this._axes);
                            if (this._axes._adorners.visible)
                            {
                                return UndoTransaction.Do(this, Resources.string("Масштабирование осей"), () =>
                                {
                                    this._axes.kX *= this._x_multiplier;
                                    this._axes.kY *= this._y_multiplier;
                                    return true;
                                });
                            }
                            else
                            {
                                return false;
                            }
                        }

                        private readonly _axes: AxesLines;
                        private readonly _x_multiplier: number;
                        private readonly _y_multiplier: number;
                    }

                    const x = this.x;
                    const y = this.y;
                    const mod_x = makeMod(this, () => event.x + AxesLines._adornerMargins + this.x - x);
                    const mod_y = makeMod(this, () => event.y - AxesLines._adornerMargins + this.y - y);
                    const multiplier = 1.5;
                    const plus = new ZoomButton(this, mod_x, mod_y, "+", 1 / multiplier, 1 / multiplier);
                    const minus = new ZoomButton(this, mod_x, () => plus.bottom, "-", multiplier, multiplier);
                    const x_plus = new ZoomButton(this, () => plus.right, mod_y, "x+", 1 / multiplier, 1);
                    const x_minus = new ZoomButton(this, () => minus.right, () => x_plus.bottom, "x-", multiplier, 1);
                    const y_plus = new ZoomButton(this, () => x_plus.right, mod_y, "y+", 1, 1 / multiplier);
                    const y_minus = new ZoomButton(this, () => x_minus.right, () => y_plus.bottom, "y-", 1, multiplier);

                    this._adorners.push(plus);
                    this._adorners.push(minus);
                    this._adorners.push(x_plus);
                    this._adorners.push(x_minus);
                    this._adorners.push(y_plus);
                    this._adorners.push(y_minus);
                }
            }

            this.selected = selected;
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

                    let menu_item = menu.addMenuItem(Resources.string("Масштаб по осям x/y..."));
                    menu_item.onChecked.bind(this, this.scaleDialog);

                    menu_item = menu.addMenuItem(Resources.string("Создать функцию..."));
                    menu_item.onChecked.bind(this, () => this.document.addParametricLine(Point.make(x, y), this));

                    const lines = this.document.getParametricLines(this);
                    if (lines.length == 1)
                    {
                        const line = lines[0];
                        menu_item = menu.addMenuItem(Resources.string("Редактировать функцию f = {0} ...", line.code.text));
                        menu_item.onChecked.bind(line, line.showExpressionEditor);
                    }
                    else if (lines.length > 1)
                    {
                        const group = menu.addMenuGroup(Resources.string("Редактировать функцию"));
                        for (const line of lines)
                        {
                            menu_item = group.addMenuItem(`f = ${line.code.text} ...`);
                            menu_item.onChecked.bind(line, line.showExpressionEditor);
                        }
                    }

                    menu_item = menu.addMenuItem(Resources.string("Удалить координатную плоскость"));
                    menu_item.onChecked.bind(this, () => doc.removeAxes(this));

                    menu.show();
                }
            }
            super.mouseClick(event);
        }

        private readonly _lineWidth: property<number>;
        private readonly _brush: property<Sprite.Brush>;
        private readonly _selectedBrush: property<Sprite.Brush>;
        private readonly _kX: property<number>;
        private readonly _kY: property<number>;
        private readonly _showDegrees: property<boolean>;
        private readonly _needsCalc: Utils.Pulse;
        private readonly _beforeDrawListener: IEventListener<BeforeDrawEvent>;
        private readonly _moved: Utils.Pulse;
        private readonly _adorners: Sprite.Container;
        private _dx: number;
        private _dy: number;
        private _lastX?: number;
        private _lastY?: number;
        private _lastKx?: number;
        private _lastKy?: number;
        private _lastW?: number;
        private _lastH?: number;
        private _lastOffsetX?: number;
        private _lastOffsetY?: number;

        private static _adornerMargins: number = 10;
    }
}