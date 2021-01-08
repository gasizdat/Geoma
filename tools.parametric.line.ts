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
/// <reference path="tools.intersections.ts" />
/// <reference path="tools.axes.lines.ts" />

const factorialCache: Array<number> = [];

function factorial(value: number): number
{
    if (!factorialCache.length)
    {
        factorialCache.push(1);
        for (let i = 1; i <= 100; i++)
        {
            factorialCache.push(factorialCache[factorialCache.length - 1] * i);
        }
    }
    if (value > 100)
    {
        return Infinity;
    }
    else if (value >= 0)
    {
        return factorialCache[Geoma.Utils.toInt(value)];
    }
    else
    {
        return NaN;
    }
}

function derivative(id: string, line: Geoma.Tools.ParametricLine, code: string): number
{
    const f = line.getFunction(id);
    if (f)
    {
        const last_x = line.arg(`${id}_x`);
        const last_y = line.arg(`${id}_y`);
        const current_x = line.arg(`x`);
        const current_y = f(current_x);
        line.setArg(`${id}_x`, current_x);
        line.setArg(`${id}_y`, current_y);
        if (last_x < current_x)
        {
            return (current_y - last_y) / (current_x - last_x);
        }
        else
        {
            return NaN;
        }
    }
    else
    {
        line.addFunction(id, code);
        const f = line.getFunction(id);
        Geoma.Utils.assert(f);
        const current_x = line.arg(`x`);
        const current_y = f(current_x);
        line.addArg(`${id}_x`, current_x);
        line.addArg(`${id}_y`, current_y);
        return NaN;
    }
}

module Geoma.Tools
{
    import makeMod = Utils.makeMod;
    import makeProp = Utils.makeProp;
    import toInt = Utils.toInt;
    import Point = Utils.Point;
    import assert = Utils.assert;
    import MulticastEvent = Utils.MulticastEvent;
    import modifier = Utils.modifier;
    import property = Utils.ModifiableProperty;
    import Box = Utils.Box;
    import binding = Utils.binding;
    import Debug = Sprite.Debug;

    type DeserializedCode = { code: CodeElement, index: number };
    export abstract class CodeElement
    {
        public abstract get code(): string;
        public abstract get text(): string;
        public serialize(data: Array<string>): void
        {
            if (this instanceof CodeLiteral)
            {
                data.push(`+l`);
                data.push(this.text);
            }
            else if (this instanceof CodeArgumentX)
            {
                data.push(`+x`);
            }
            else if (this instanceof CodeArgument)
            {
                data.push(`+a`);
                data.push(this.text);
            }
            else if (this instanceof CodeUnary)
            {
                data.push(`+u`);
                data.push(this.function);
                this.operand.serialize(data);
            }
            else if (this instanceof CodeBinary)
            {
                data.push(`+b`);
                data.push(this.function);
                this.operand1.serialize(data);
                this.operand2.serialize(data);
            }
        }
        public static deserialize(data: Array<string>, i: number): DeserializedCode
        {
            if (i >= data.length)
            {
                throw CodeElement.error;
            }
            switch (data[i])
            {
                case `+l`:
                    i++;
                    if (i >= data.length)
                    {
                        throw CodeElement.error;
                    }
                    const value = parseFloat(data[i]);
                    if (data[i] != `${value}`)
                    {
                        throw CodeElement.error;
                    }
                    return { code: new CodeLiteral(value), index: i + 1 };
                case `+x`:
                    return { code: new CodeArgumentX(), index: i + 1 };
                case `+a`:
                    i++;
                    if (i >= data.length)
                    {
                        throw CodeElement.error;
                    }
                    return { code: new CodeArgument(data[i]), index: i + 1 };
                case `+u`:
                    i++;
                    if (i >= data.length)
                    {
                        throw CodeElement.error;
                    }
                    const unary_function = data[i] as UnaryFunctions;
                    const operand = CodeElement.deserialize(data, i + 1);
                    return { code: new CodeUnary(unary_function, operand.code), index: operand.index };
                case `+b`:
                    i++;
                    if (i >= data.length)
                    {
                        throw CodeElement.error;
                    }
                    const binary_function = data[i] as BinaryFunctions;
                    const operand1 = CodeElement.deserialize(data, i + 1);
                    const operand2 = CodeElement.deserialize(data, operand1.index);
                    return { code: new CodeBinary(operand1.code, binary_function, operand2.code), index: operand2.index };
                default:
                    throw CodeElement.error;
            }
        }

        private static readonly error = new Error("Невозможно восстановить данные");
    }

    export abstract class CodeDefinitionElement extends CodeElement
    {
    }

    export class CodeArgument extends CodeDefinitionElement
    {
        constructor(arg_name: string)
        {
            super();
            this._argName = arg_name;
        }

        public get code(): string
        {
            return `this.arg('${this._argName}')`;
        }
        public get text(): string
        {
            return `${this._argName}`;
        }

        private readonly _argName: string;
    }

    export class CodeLiteral extends CodeDefinitionElement
    {
        constructor(value: number)
        {
            super();
            this._value = value;
        }

        public get code(): string
        {
            return `${this._value}`;
        }
        public get text(): string
        {
            return `${this._value}`;
        }

        private readonly _value: number;
    }

    export class CodeArgumentX extends CodeArgument
    {
        constructor()
        {
            super("x");
        }
    }

    Math.sinh
    Math.cosh
    Math.tanh
    export type UnaryFunctions =
        "sin" | "cos" | "tan" |
        "arcsin" | "arccos" | "arctan" |
        "ln" | "log2" | "log10" |
        "exp" | "√" | "∛" | "∜" | "sign" | "abs" |
        "sinh" | "cosh" | "tanh" |
        "arcsinh" | "arccosh" | "arctanh" |
        "!" | "f'";

    export class CodeUnary extends CodeElement
    {
        constructor(_function: UnaryFunctions, operand: CodeElement)
        {
            super();
            this._function = _function;
            this._operand = operand;
        }

        public get code(): string
        {
            let math_function: string;
            switch (this._function)
            {
                case "arccos":
                    math_function = "Math.acos";
                    break;
                case "arcsin":
                    math_function = "Math.asin";
                    break;
                case "arctan":
                    math_function = "Math.atan";
                    break;
                case "sin":
                    math_function = "Math.sin";
                    break;
                case "cos":
                    math_function = "Math.cos";
                    break;
                case "tan":
                    math_function = "Math.tan";
                    break;
                case "ln":
                    math_function = "Math.log";
                    break;
                case "log2":
                    math_function = "Math.log2";
                    break;
                case "log10":
                    math_function = "Math.log10";
                    break;
                case "exp":
                    math_function = "Math.exp";
                    break;
                case "√":
                    math_function = "Math.sqrt";
                    break;
                case "∛":
                    return `Math.cbrt(${this._operand.code})`;
                case "∜":
                    return `Math.sqrt(Math.sqrt(${this._operand.code}))`;
                case "sign":
                    math_function = "Math.sign";
                    break;
                case "abs":
                    math_function = "Math.abs";
                    break;
                case "sinh":
                    math_function = "Math.sinh";
                    break;
                case "cosh":
                    math_function = "Math.cosh";
                    break;
                case "tanh":
                    math_function = "Math.tanh";
                    break;
                case "arcsinh":
                    math_function = "Math.asinh";
                    break;
                case "arccosh":
                    math_function = "Math.acosh";
                    break;
                case "arctanh":
                    math_function = "Math.atanh";
                    break;
                case "!":
                    math_function = "factorial";
                    break;
                case "f'":
                    const code = this._operand.code.replaceAll(`\\`, `\\\\`).replaceAll(`"`, `\\"`);
                    return `derivative(${CodeUnary._functionNo++}, this, "${code}")`;
                default:
                    assert(false, `Math function ${this._function} not supported`);
            }
            return `${math_function}(${this._operand.code})`;
        }
        public get text(): string
        {
            if (this._operand instanceof CodeBlock)
            {
                return `${this._function}${this._operand.text}`;
            }
            else if (this._operand.text.length > 0 && this._operand.text.charAt(0) == `(`)
            {
                return `${this._function}${this._operand.text}`;
            }
            else
            {
                return `${this._function}(${this._operand.text})`;
            }
        }
        public get function(): UnaryFunctions
        {
            return this._function;
        }
        public get operand(): CodeElement
        {
            return this._operand;
        }

        private readonly _function: UnaryFunctions;
        private readonly _operand: CodeElement;
        private static _functionNo: number = 1;
    }

    export type BinaryFunctions = "pow" | "n√" | "+" | "-" | "*" | "÷";

    export class CodeBinary extends CodeElement
    {
        constructor(operand1: CodeElement, _function: BinaryFunctions, operand2: CodeElement)
        {
            super();
            this._function = _function;
            this._operand1 = operand1;
            this._operand2 = operand2;
        }

        public get code(): string
        {
            switch (this._function)
            {
                case "pow":
                    return `Math.pow(${this._operand1.code}, ${this._operand2.code})`;
                case "n√":
                    return `Math.pow(${this._operand2.code}, 1.0 / ${this._operand1.code})`;
                case "+":
                    return `(${this._operand1.code} + ${this._operand2.code})`;
                case "-":
                    return `(${this._operand1.code} - ${this._operand2.code})`;
                case "*":
                    return `(${this._operand1.code} * ${this._operand2.code})`;
                case "÷":
                    return `(${this._operand1.code} / ${this._operand2.code})`;
                default:
                    assert(false, `Math function ${this._function} not supported`);
            }
        }
        public get text(): string
        {
            switch (this._function)
            {
                case "pow":
                    return `(${this._operand1.text} ^ ${this._operand2.text})`;
                case "n√":
                    return `(${this._operand1.text}√ ${this._operand2.text})`;
                case "+":
                    return `(${this._operand1.text} + ${this._operand2.text})`;
                case "-":
                    return `(${this._operand1.text} - ${this._operand2.text})`;
                case "*":
                    return `(${this._operand1.text} * ${this._operand2.text})`;
                case "÷":
                    return `(${this._operand1.text} / ${this._operand2.text})`;
                default:
                    assert(false, `Math function ${this._function} not supported`);
            }
        }
        public get function(): BinaryFunctions
        {
            return this._function;
        }
        public get operand1(): CodeElement
        {
            return this._operand1;
        }
        public get operand2(): CodeElement
        {
            return this._operand2;
        }

        private readonly _function: BinaryFunctions;
        private readonly _operand1: CodeElement;
        private readonly _operand2: CodeElement;
    }

    export class CodeBlock extends CodeElement
    {
        constructor(element: CodeElement)
        {
            super();
            this._element = element;
        }
        public get code(): string
        {
            return `(${this._element.code})`;
        }
        public get text(): string
        {
            return `(${this._element.text})`;
        }

        private readonly _element: CodeElement;
    }

    export class ParametricLine extends DocumentSprite<Sprite.Sprite>
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
                protected innerDraw(play_ground: PlayGround): void
                {
                    throw new Error("Method not implemented.");
                }
            }

            super(document, new stub());

            this.axes = axes;
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
            delete this._drawPath;
        }
        public get code(): CodeElement
        {
            return this._code ?? new CodeLiteral(0);
        }
        public set code(value: CodeElement)
        {
            this._code = value;
            this._function = Utils.makeEvaluator<ParametricLine>(this, this._code.code);
            this._derivativeLevel = ParametricLine.derivativeLevel(this._code);
            delete this._drawPath;
        }

        public dispose()
        {
            if (!this.disposed)
            {
                this._mouseDownListener.dispose();
                this._mouseUpListener.dispose();
                if (this.selected)
                {
                    this.document.removeSelectedSprite(this);
                }
                super.dispose();
            }
        }
        public screenY(screen_x: number): number
        {
            if (screen_x >= 0 && screen_x < this._screenSamples.length)
            {
                return this._screenSamples[toInt(screen_x)];
            }
            else
            {
                for (let x = screen_x - (this._derivativeLevel * 2); x < screen_x; x++)
                {
                    this.getY(this.axes.fromScreenX(x));
                }
                return this.axes.toScreenY(this.getY(this.axes.fromScreenX(screen_x)));
            }
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
            this._functions[name] = Utils.makeEvaluator<ParametricLine>(this, code);
            delete this._drawPath;
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
        public setArg(name: string, value: number): void
        {
            switch (name)
            {
                case "x":
                    assert(false);
                    break;
                default:
                    assert(this._args[name]);
                    this._args[name].value = value;
                    delete this._drawPath;
                    break;
            }
        }
        public mouseHit(point: IPoint): boolean
        {
            return PointParametric.intersected(point, this, CurrentTheme.ActiveLineMouseThickness);
        }
        public move(dx: number, dy: number): void
        {
            this.axes.move(dx, dy);
        }
        public moved(receiptor: string): boolean
        {
            return this.axes.moved(receiptor);
        }
        public showExpressionEditor(): void
        {
            const dialog = new ExpressionDialog(
                this.document,
                makeMod(this, () => this.document.mouseArea.x + this.document.mouseArea.w / 2 - this.document.mouseArea.w / 10),
                makeMod(this, () => this.document.mouseArea.y + this.document.mouseArea.h / 2 - this.document.mouseArea.h / 10),
                this.code
            );
            dialog.onEnter.bind(this, (event: CustomEvent<CodeElement | undefined>) => 
            {
                if (event.detail)
                {
                    this.code = event.detail;
                }
                this.document.remove(dialog);
                dialog.dispose();
            });
            this.document.push(dialog);
        }
        public belongs(point: ActivePointBase): boolean
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
                    () => CurrentTheme.ActiveLineWidth,
                    () => CurrentTheme.ActiveLineBrush,
                    () => CurrentTheme.ActiveLineSelectBrush,
                    context.data.axes.item(toInt(data[index++]))
                );
                const points = new Array<ActiveCommonPoint>();
                while (data[index].charAt(0) == `p`)
                {
                    const chunck = data[index++];
                    const p_index = toInt(chunck.substring(1));
                    const point = context.data.points.item(p_index);
                    assert(point instanceof ActiveCommonPoint);
                    points.push(point);
                }
                if (data[index++] == `f`)
                {
                    line.code = CodeElement.deserialize(data, index).code;
                }
                if (points.length)
                {
                    line.updateSamples(context.document.mouseArea.h);
                    for (const point of points)
                    {
                        point.addSegment(line);
                        line.addPoint(point);
                    }
                }
                return line;
            }
        }

        protected static derivativeLevel(element: CodeElement, level: number = 0): number
        {
            if (element instanceof CodeUnary)
            {
                if (element.function == "f'")
                {
                    return ParametricLine.derivativeLevel(element.operand, level + 1);
                }
                else
                {
                    return ParametricLine.derivativeLevel(element.operand, level);
                }
            }
            else if (element instanceof CodeBinary)
            {
                const result1 = ParametricLine.derivativeLevel(element.operand1, level);
                const result2 = ParametricLine.derivativeLevel(element.operand2, level);
                return Math.max(result1, result2);
            }
            else
            {
                return level;
            }
        }
        protected updateSamples(height: number): void 
        {
            let needs_move = false;
            const draw_path = new Path2D();
            const samples = new Array<number>();
            const dx: number = this.dx;
            const minimum_dx: number = 1e-11;
            const offscreen_top = -height;
            const offscreen_bottom = 2 * height;

            const line_to = (x: number, y: number): void =>
            {
                if (needs_move)
                {
                    needs_move = false;
                    draw_path.moveTo(x, y);
                }
                else
                {
                    draw_path.lineTo(x, y);
                }

                const integer_x = toInt(x);
                assert(samples.length > integer_x);
                samples[integer_x] = y;
            }
            type graph_sign = 1 | -1 | 0;
            const contains_derivative = this._derivativeLevel != 0;
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
                    draw_path.moveTo(x, offscreen_top);
                }
                else
                {
                    draw_path.moveTo(x, offscreen_bottom);
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
                    const y1 = this.axes.toScreenY(this.getY(this.axes.fromScreenX(x1)));
                    if (isNaN(y1))
                    {
                        x1 -= local_dx;
                        local_dx /= 2;
                        x1 -= local_dx;
                        if (local_dx <= minimum_dx)
                        {
                            for (; x1 > start_x; x1 -= local_dx)
                            {
                                const y2 = this.axes.toScreenY(this.getY(this.axes.fromScreenX(x1)));
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
                    const y1 = this.axes.toScreenY(this.getY(this.axes.fromScreenX(x1)));
                    if (isNaN(y1))
                    {
                        x1 += local_dx;
                        local_dx /= 2;
                        x1 += local_dx;
                        if (local_dx <= minimum_dx)
                        {
                            for (; x1 < x; x1 += local_dx)
                            {
                                const y2 = this.axes.toScreenY(this.getY(this.axes.fromScreenX(x1)));
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
            let last_sign: graph_sign = 0;
            let last_is_nan = true;
            let last_y: number = NaN;
            for (let x = 0; x < this.document.mouseArea.w; x += dx)
            {
                const integer_x = samples.length == Math.floor(x);
                const y = this.axes.toScreenY(this.getY(this.axes.fromScreenX(x)));
                if (integer_x)
                {
                    samples.push(NaN);
                }
                if (isNaN(y))
                {
                    if (!last_is_nan)
                    {
                        last_is_nan = true;
                        if (!contains_derivative)
                        {
                            right_nan(x);
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
                            const y1 = this.axes.toScreenY(this.getY(this.axes.fromScreenX(x1)));
                            if (is_infinite(y1))
                            {
                                line_to_offscreen(x, last_sign, y1);
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
                                if ((last_sign == 1 && y1 <= offscreen_top) || (last_sign == -1 && y1 >= offscreen_bottom))
                                {
                                    line_to_offscreen(x, last_sign, y1);
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
                        left_nan(x);
                    }
                    last_is_nan = false;
                }
                last_y = y;
            }
            assert(samples.length == this.document.mouseArea.w, "Logical error");

            this._drawPath = draw_path;
            this._screenSamples = samples;
        }
        protected innerDraw(play_ground: PlayGround): void
        {
            if (this.axes.needsCalc.get(this.code.text) || !this._drawPath)
            {
                this.updateSamples(play_ground.h);
                assert(this._drawPath);
            }

            play_ground.context2d.strokeStyle = this.selected ? this.selectedBrush.value : this.brush.value;
            play_ground.context2d.lineWidth = this.lineWidth.value;
            play_ground.context2d.stroke(this._drawPath);
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

                    let menu_item = menu.addMenuItem(`Точность...`);
                    menu_item.onChecked.bind(this, () =>
                    {
                        const dx = this.document.promptNumber(
                            `Приращение аргумента x функции ${this.code.text}`,
                            this.dx
                        );
                        if (dx != undefined && dx != null)
                        {
                            this.dx = dx;
                        }
                    });

                    menu_item = menu.addMenuItem("Масштаб по осям x/y...");
                    menu_item.onChecked.bind(this.axes, this.axes.scaleDialog);

                    menu_item = menu.addMenuItem(`Редактировать функцию f = ${this.code.text} ...`);
                    menu_item.onChecked.bind(this, this.showExpressionEditor);

                    menu_item = menu.addMenuItem(`Добавить точку`);
                    menu_item.onChecked.bind(this, () => doc.addPoint(Point.make(x, y)));

                    menu_item = menu.addMenuItem(`Удалить прямую ${this.name}`);
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
        }
        protected mouseDown(event: MouseEvent): void
        {
            if (this.mouseHit(event) || this.axesHit(event))
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
        protected getY(x: number): number
        {
            this._argX = x;
            this._argY = this._function();
            return this._argY;
        }

        private _code?: CodeElement;
        private _function: Function;
        private _dx: number;
        private _argX: number;
        private _argY: number;
        private _derivativeLevel: number;
        private _args: Record<string, property<number>>;
        private _screenSamples: Array<number>;
        private _points?: Array<ActiveCommonPoint>;
        private _functions?: Record<string, Function>;
        private _dragStart?: IPoint;
        private _drawPath?: Path2D;
        private _mouseDownListener: IEventListener<MouseEvent>;
        private _mouseUpListener: IEventListener<MouseEvent>;
    }
}