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
/// <reference path="tools.intersections.ts" />
/// <reference path="tools.axes.lines.ts" />
/// <reference path="syntax.tree.ts" />

module Geoma.Tools
{
    import makeMod = Utils.makeMod;
    import makeProp = Utils.makeProp;
    import toInt = Utils.toInt;
    import Point = Utils.Point;
    import assert = Utils.assert;
    import property = Utils.ModifiableProperty;
    import binding = Utils.binding;

    type ArgsMap = Record<string, property<number>>;

    export type ParametricLineIntersections = Array<IPoint>;

    export class ParametricLine extends DocumentSprite<Sprite.Sprite> implements ICodeEvaluatorContext
    {
        constructor(
            document: Document,
            line_width: binding<number>,
            brush: binding<Sprite.Brush>,
            selected_brush: binding<Sprite.Brush>,
            axes: AxesLines,
        )
        {
            class stub extends Sprite.Sprite
            {
                protected innerDraw(__play_ground: PlayGround): void
                {
                    throw new Error("Method not implemented.");
                }
            }

            super(document, new stub());

            this.axes = axes;
            this.axes.addLine(this);
            this.lineWidth = makeProp(line_width, 1);
            this.brush = makeProp(brush, "Black");
            this.selectedBrush = makeProp(selected_brush, "Black");
            this._dx = 1;
            this._args = {};
            this._argX = NaN;
            this._argY = NaN;
            this._derivativeLevel = 0;
            this._function = makeMod(this, () => this.document.alert('No any code'));
            this._mouseDownListener = document.mouseArea.onMouseDown.bind(this, this.mouseDown);
            this._mouseUpListener = document.mouseArea.onMouseUp.bind(this, this.mouseUp);
            this._screenSamples = [];
            this._suppressModified = false;
            this._isModified = new Utils.Pulse();
            this._id = `${this.axes.axesId}-${ParametricLine._idSource.inc()}-{47705e19-541a-4f59-b0c0-34edd1f6fefa}`;
        }

        public readonly axes: AxesLines
        public readonly lineWidth: property<number>;
        public readonly brush: property<Sprite.Brush>;
        public readonly selectedBrush: property<Sprite.Brush>;

        public get dx(): number
        {
            return this._dx;
        }
        public set dx(value: number)
        {
            this._dx = value;
            this.setModified();
        }
        public get code(): Syntax.CodeElement
        {
            return this._code ?? new Syntax.CodeLiteral(0);
        }
        public set code(value: Syntax.CodeElement)
        {
            this._code = value;
            this._function = Utils.makeEvaluator(this, this._code.code);
            this._derivativeLevel = this._code.derivativeLevel;
            this.setModified();
        }
        public get symmetric(): boolean
        {
            return this.code instanceof Syntax.CodeUnary && this.code.function == "±";
        }
        public get derivativeLevel(): number
        {
            return this._derivativeLevel;
        }
        public get points(): Array<ActivePointBase> | null
        {
            return this._points ?? null;
        }

        public dispose()
        {
            if (!this.disposed)
            {
                this._transaction?.rollback();
                this._mouseDownListener.dispose();
                this._mouseUpListener.dispose();
                if (this.selected)
                {
                    this.document.removeSelectedSprite(this);
                }
                for (const key in this._args)
                {
                    this._args[key].reset();
                }
                this.axes.removeLine(this);
                super.dispose();
            }
        }
        public screenY(screen_x: number): number
        {
            const offset_screen_x = screen_x - this.document.mouseArea.offset.x;
            if (offset_screen_x >= 0 && offset_screen_x < this._screenSamples.length)
            {
                return this._screenSamples[toInt(offset_screen_x)];
            }
            else
            {
                for (let x = offset_screen_x - (this._derivativeLevel * 2); x < offset_screen_x; x++)
                {
                    this.getY(this.axes.fromScreenX(x));
                }
                return this.axes.toScreenY(this.getY(this.axes.fromScreenX(offset_screen_x)));
            }
        }
        public screenSymmetricY(screen_x: number): number
        {
            assert(this.symmetric);
            return 2 * this.axes.y - this.screenY(screen_x);
        }
        public getFunction(name: string): Function | null
        {
            if (this._functions)
            {
                return this._functions[name];
            }
            else
            {
                return null;
            }
        }
        public addFunction(name: string, code: string): void
        {
            if (!this._functions)
            {
                this._functions = {};
            }
            this._functions[name] = Utils.makeEvaluator(this, code);
            this.setModified();
        }
        public hasArg(name: string): boolean
        {
            return name in this._args;
        }
        public addArg(name: string, arg: binding<number>): void
        {
            assert(!this._args[name]);
            this._args[name] = makeProp(arg, NaN);
        }
        public arg(name: string): number
        {
            switch (name)
            {
                case "x":
                    return this._argX;
                default:
                    assert(this._args[name]);
                    return this._args[name].value;
            }
        }
        public setArg(name: string, value: binding<number>): void
        {
            switch (name)
            {
                case "x":
                    throw assert(false);
                default:
                    assert(this._args[name]);
                    this._args[name] = makeProp(value, NaN);
                    this.setModified();
                    break;
            }
        }
        public mouseHit(point: IPoint): boolean
        {
            return PointParametric.intersected(point, this, Thickness.Mouse);
        }
        public move(dx: number, dy: number): void
        {
            this.axes.move(dx, dy);
        }
        public isMoved(receiptor: string): boolean
        {
            return this.axes.isMoved(receiptor);
        }
        public isModified(receiptor: string): boolean
        {
            if (this._isModified.get(receiptor))
            {
                return true;
            }
            else
            {
                if (this.points)
                {
                    for (const point of this.points)
                    {
                        if (point.isMoved(receiptor))
                        {
                            return true;
                        }
                    }
                }
                return false;
            }
        }
        public setModified(): void
        {
            if (!this._suppressModified)
            {
                this._isModified.set();
            }
        }
        public showExpressionEditor(): void
        {
            const dialog = new ExpressionDialog(
                this.document,
                makeMod(this, () => this.document.mouseArea.offset.x + (this.document.mouseArea.w / 2 - this.document.mouseArea.w / 10) / this.document.mouseArea.ratio),
                makeMod(this, () => this.document.mouseArea.offset.y + (this.document.mouseArea.h / 2 - this.document.mouseArea.h / 10) / this.document.mouseArea.ratio),
                this.code
            );
            dialog.onEnter.bind(this, (event: CustomEvent<ExpressionInfo | undefined>) =>
            {
                if (event.detail)
                {
                    const expression_info = event.detail;
                    UndoTransaction.Do(this, Resources.string("Редактирование функции {0}", this.code.text), () => this.editCode(expression_info));
                }
                this.document.remove(dialog);
                dialog.dispose();
            });
            this.document.push(dialog);
        }
        public isRelated(point: ActivePointBase): boolean
        {
            if (this._points)
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
        public addPoint(point: ActivePointBase): void
        {
            this._addPoint(point);
        }
        public removePoint(point: ActivePointBase): void
        {
            assert(this.isRelated(point));
            assert(this._points);
            const index = this._points.indexOf(point);
            assert(index >= 0);
            this._points.splice(index, 1);
            if (point instanceof ActiveCommonPoint)
            {
                point.removeSegment(this);
            }
        }
        public serialize(context: SerializationContext): Array<string>
        {
            const data: Array<string> = [];
            data.push(`${this.axes.axesId}`);
            if (this._points)
            {
                for (const point of this._points)
                {
                    data.push(`p${context.points[point.name]}`);
                }
            }
            data.push(`f`);
            this.code.serialize(data);
            return data;
        }

        public static deserialize(context: DesializationContext, data: Array<string>, index: number): ParametricLine | null
        {
            if (data.length < (index + 2))
            {
                return null;
            }
            else
            {
                const line = new ParametricLine(
                    context.document,
                    () => CurrentTheme.ParametricLineWidth,
                    () => CurrentTheme.ParametricLineBrush,
                    () => CurrentTheme.ParametricLineSelectBrush,
                    context.data.axes.item(toInt(data[index++]))
                );
                const points = new Array<ActivePointBase>();
                while (data[index].charAt(0) == `p`)
                {
                    const chunck = data[index++];
                    const p_index = toInt(chunck.substring(1));
                    const point = context.data.points.item(p_index);
                    points.push(point);
                }
                if (data[index++] == `f`)
                {
                    line.code = Syntax.CodeElement.deserialize(data, index).code;
                }
                line.code.visitArguments((arg: Syntax.CodeArgument) =>
                {
                    if (!(arg instanceof Syntax.CodeArgumentX))
                    {
                        const arg_name = arg.text;
                        if (!line.hasArg(arg_name))
                        {
                            const arg_modifier = context.document.getArgModifier(arg_name, line);
                            assert(arg_modifier);
                            line.addArg(arg_name, arg_modifier);
                        }
                    }
                });
                line.updateSamples(context.document.mouseArea);

                for (const point of points)
                {
                    //Adding common active points postponed until the full construction of the graph line.
                    if (point instanceof ActiveCommonPoint)
                    {
                        //The common point may be used as argument of this function and it can be added as argument of function graph.
                        if (!line.isRelated(point))
                        {
                            line._addPoint(point);
                            point.addGraphLine(line);
                        }
                    }
                }
                return line;
            }
        }
        public static calcSamples(screen_box: Utils.Box, dx: number, contains_derivative: boolean, adapter: ISamplesAdapter)
        {
            type graph_sign = 1 | -1 | 0;

            let needs_move = false;
            let last_sign: graph_sign = 0;
            let last_is_nan = true;
            let last_y: number = NaN;
            let samples_length = 0;
            const offscreen_top = - (screen_box.h - screen_box.top);
            const offscreen_bottom = (2 * screen_box.h) + screen_box.top;

            const minimum_dx: number = 1e-11;
            const line_to = (x: number, y: number): void =>
            {
                adapter.lineTo(x, y, needs_move);
                needs_move = false;

                const integer_x = Math.floor(x) - screen_box.left;
                assert(samples_length > integer_x);
                adapter.setSample(integer_x, y);
            }
            const line_to_offscreen = (x: number, last_sign: graph_sign, y: number): void =>
            {
                switch (last_sign)
                {
                    case 1:
                        line_to(x, offscreen_bottom);
                        break;
                    case -1:
                        line_to(x, offscreen_top);
                        break;
                    case 0:
                        break;
                    default:
                        assert(false);
                }

                if (Math.sign(y) == -1)
                {
                    adapter.lineTo(x, offscreen_top, true);
                }
                else
                {
                    adapter.lineTo(x, offscreen_bottom, true);
                }
            }
            const sign = (x: number, y1: number, y2: number): graph_sign =>
            {
                if (x)
                {
                    const sign = Math.sign(y2 - y1);
                    if (sign == 0)
                    {
                        return 0;
                    }
                    else if (sign > 0)
                    {
                        return 1;
                    }
                    else
                    {
                        return -1;
                    }
                }
                else
                {
                    return 0;
                }
            }
            const is_infinite = (value: number) => !isFinite(value) && !isNaN(value);
            const right_nan = (x: number): void =>
            {
                let local_dx = dx / 2;
                const start_x = x - dx;
                for (let x1 = start_x; x1 <= x; x1 += local_dx)
                {
                    const y1 = adapter.getScreenY(x1);
                    if (isNaN(y1))
                    {
                        x1 -= local_dx;
                        local_dx /= 2;
                        x1 -= local_dx;
                        if (local_dx <= minimum_dx)
                        {
                            for (; x1 > start_x; x1 -= minimum_dx)
                            {
                                const y2 = adapter.getScreenY(x1);
                                if (!isNaN(y2))
                                {
                                    needs_move = false;
                                    line_to(x1, y2);
                                    break;
                                }
                            }
                            break;
                        }
                    }
                }
            }
            const left_nan = (x: number): void =>
            {
                let local_dx = dx / 2;
                const end_x = x - dx;
                for (let x1 = x; x1 >= end_x; x1 -= local_dx)
                {
                    const y1 = adapter.getScreenY(x1);
                    if (isNaN(y1))
                    {
                        x1 += local_dx;
                        local_dx /= 2;
                        x1 += local_dx;
                        if (local_dx <= minimum_dx)
                        {
                            for (; x1 < x; x1 += minimum_dx)
                            {
                                const y2 = adapter.getScreenY(x1);
                                if (!isNaN(y2))
                                {
                                    needs_move = true;
                                    line_to(x1, y2);
                                    break;
                                }
                            }
                            break;
                        }
                    }
                }
                needs_move = false;
            }

            for (let x = screen_box.left; x < screen_box.right; x += dx)
            {
                const integer_x = (samples_length + screen_box.left) == Math.floor(x);
                const y = adapter.getScreenY(x);
                if (integer_x)
                {
                    adapter.addSample();
                    samples_length++;
                }
                if (isNaN(y))
                {
                    if (!last_is_nan)
                    {
                        last_is_nan = true;
                        if (!contains_derivative)
                        {
                            right_nan.call(this, x);
                        }
                    }
                    needs_move = true;
                }
                else
                {
                    let offscreen_break = false;
                    const new_sign = sign(x, last_y, y);
                    if (last_sign == 0)
                    {
                        last_sign = new_sign;
                    }
                    else if (last_sign != new_sign && !contains_derivative)
                    {
                        let local_dx = dx / 2;
                        for (let x1 = x - dx; x1 <= x && local_dx > minimum_dx; x1 = (x1 < x) ? Math.min(x1 + local_dx, x) : (x1 + local_dx))
                        {
                            const y1 = adapter.getScreenY(x1);
                            if (is_infinite(y1))
                            {
                                line_to_offscreen(x1, last_sign, y1);
                                offscreen_break = true;
                                break;
                            }
                            //There is local extremum (inflection point)
                            else if ((last_sign == 1 && last_y > y1) || (last_sign == -1 && last_y < y1))
                            {
                                x1 -= local_dx;
                                local_dx /= 2;
                                x1 -= local_dx;
                                //Check the function graph goes to offscreen
                                // TODO Logical error
                                // y1 <= offscreen_top and y1 >= offscreen_bottom is is necessary but not sufficient condition
                                // for example: sin(x) - 5000
                                if ((last_sign == 1 && y1 <= offscreen_top) || (last_sign == -1 && y1 >= offscreen_bottom))
                                {
                                    line_to_offscreen(x1, last_sign, y1);
                                    offscreen_break = true;
                                    break;
                                }
                            }
                            else
                            {
                                last_y = y1;
                            }
                        }
                        last_sign = new_sign;
                    }

                    if (!offscreen_break && (needs_move || integer_x))
                    {
                        line_to(x, Utils.limit(y, offscreen_top, offscreen_bottom));
                    }

                    if (last_is_nan && !contains_derivative)
                    {
                        left_nan.call(this, x);
                    }
                    last_is_nan = false;
                }
                last_y = y;
            }
            assert(samples_length == screen_box.w, "Logical error");
        }

        protected editCode(expression_info: ExpressionInfo): void
        {
            const last_args = this._args;
            this.code = expression_info.expression;
            this._args = {};
            this.document.realizeGraphArguments(this, expression_info.argValues);
            for (const key in this._args)
            {
                if (key in last_args)
                {
                    this._args[key] = last_args[key];
                    delete last_args[key];
                }
            }
            for (const key in last_args)
            {
                last_args[key].reset();
            }
        }
        protected updateSamples(mouse_area: IMouseArea): void 
        {
            class draw_adapter implements ISamplesAdapter
            {
                constructor(owner: ParametricLine)
                {
                    this.owner = owner;
                }

                getScreenY(screen_x: number): number 
                {
                    return this.owner.axes.toScreenY(this.owner.getY(this.owner.axes.fromScreenX(screen_x)));
                }
                lineTo(x: number, y: number, discontinuity: boolean): void 
                {
                    if (discontinuity)
                    {
                        this.drawPath.moveTo(x, y);
                    }
                    else
                    {
                        this.drawPath.lineTo(x, y);
                    }
                }
                addSample(): void 
                {
                    this.samples.push(NaN);
                }
                setSample(screen_x: number, screen_y: number): void 
                {
                    this.samples[screen_x] = screen_y;
                }

                public readonly drawPath = new Path2D();
                public readonly samples = new Array<number>();

                private readonly owner: ParametricLine;
            }

            const screen_box = new Utils.Box(mouse_area.offset.x, mouse_area.offset.y, mouse_area.w, mouse_area.h);
            const contains_derivative = this._derivativeLevel != 0;
            const adapter = new draw_adapter(this);

            this._suppressModified = true;
            ParametricLine.calcSamples(screen_box, this.dx, contains_derivative, adapter);
            this._suppressModified = false;

            assert(adapter.samples.length == this.document.mouseArea.w, "Logical error");

            this._drawPath = adapter.drawPath;
            this._screenSamples = adapter.samples;
        }
        protected innerDraw(play_ground: PlayGround): void
        {
            if (this.isModified(this._id) || !this._drawPath)
            {
                this.updateSamples(play_ground);
                assert(this._drawPath);
            }

            play_ground.context2d.strokeStyle = this.selected ? this.selectedBrush.value : this.brush.value;
            play_ground.context2d.lineWidth = this.lineWidth.value;
            play_ground.context2d.stroke(this._drawPath);

            if (this.symmetric)
            {
                const current_transform = play_ground.context2d.getTransform();
                play_ground.context2d.setTransform(
                    current_transform.a,
                    current_transform.b,
                    current_transform.c,
                    -current_transform.d,
                    current_transform.e,
                    current_transform.f + play_ground.ratio * 2 * this.axes.y);
                play_ground.context2d.stroke(this._drawPath);
                play_ground.context2d.setTransform(current_transform);
            }
        }
        protected axesHit(event: MouseEvent): boolean
        {
            return this.axes.visible && this.axes.mouseHit(event);
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

                    let menu_item = menu.addMenuItem(Resources.string("Точность..."));
                    menu_item.onChecked.bind(this, () =>
                    {
                        const title = Resources.string("Приращение аргумента x функции {0}", this.code.text);
                        const dx = this.document.promptNumber(title, this.dx);
                        if (dx != undefined && dx != null)
                        {
                            UndoTransaction.Do(this, title, () => this.dx = dx);
                        }
                    });

                    menu_item = menu.addMenuItem(Resources.string("Масштаб по осям x/y..."));
                    menu_item.onChecked.bind(this.axes, this.axes.scaleDialog);

                    menu_item = menu.addMenuItem(Resources.string("Редактировать функцию f = {0} ...", this.code.text));
                    menu_item.onChecked.bind(this, this.showExpressionEditor);

                    menu_item = menu.addMenuItem(Resources.string("Добавить точку"));
                    menu_item.onChecked.bind(this, () => doc.addPoint(Point.make(x, y)));

                    menu_item = menu.addMenuItem(Resources.string("Удалить график {0}", this.code.text));
                    menu_item.onChecked.bind(this, () => doc.removeParametricLine(this));

                    menu.show();
                }
            }
            super.mouseClick(event);
        }
        protected mouseMove(event: MouseEvent): void
        {
            super.mouseMove(event);
            this.selected = this.mouseHit(event);

            if (this._dragStart)
            {
                if (event.buttons != 0)
                {
                    const dpos = Point.sub(this._dragStart, event);
                    if (dpos.x != 0 || dpos.y != 0)
                    {
                        if (!this._transaction)
                        {
                            this._transaction = this.document.beginUndo(Resources.string("Перемещение функции {0}", this.code.text));
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
        }
        protected mouseDown(event: MouseEvent): void
        {
            if (this.mouseHit(event) || this.axesHit(event))
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
        protected getY(x: number): number
        {
            this._argX = x;
            this._argY = this._function();
            return this._argY;
        }

        private _addPoint(point: ActivePointBase): void
        {
            assert(!this.isRelated(point));
            if (!this._points)
            {
                this._points = [];
            }
            this._points.push(point);
        }

        private _code?: Syntax.CodeElement;
        private _function: Function;
        private _dx: number;
        private _argX: number;
        private _argY: number;
        private _derivativeLevel: number;
        private _args: ArgsMap;
        private _screenSamples: Array<number>;
        private _points?: Array<ActivePointBase>;
        private _functions?: Record<string, Function>;
        private _dragStart?: IPoint;
        private _drawPath?: Path2D;
        private _transaction?: UndoTransaction;
        private _suppressModified: boolean;
        private readonly _isModified: Utils.Pulse;
        private readonly _mouseDownListener: IEventListener<MouseEvent>;
        private readonly _mouseUpListener: IEventListener<MouseEvent>;
        private readonly _id: string;

        private static readonly _idSource = new Utils.ModuleInteger();
    }
}