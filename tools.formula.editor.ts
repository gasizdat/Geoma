/// <reference path="utils.ts" />
/// <reference path="sprites.ts" />
/// <reference path="polygons.ts" />
/// <reference path="interfaces.ts" />
/// <reference path="play_ground.ts" />
/// <reference path="syntax.tree.ts" />
/// <reference path="tools.core.ts" />
/// <reference path="tools.styles.ts" />
/// <reference path="tools.document.ts" />
/// <reference path="tools.button.ts" />
/// <reference path="tools.line.parametric.ts"/>
/// <reference path="ThirdParty/geekrope/ts-math-parser/app.ts"/>

module Geoma.Tools
{
    import makeMod = Utils.makeMod;
    import assert = Utils.assert;
    import MulticastEvent = Utils.MulticastEvent;
    import binding = Utils.binding;
    import CodeElement = Syntax.CodeElement;
    import CodeDefinitionElement = Syntax.CodeDefinitionElement;
    import CodeArgument = Syntax.CodeArgument;
    import CodeArgumentX = Syntax.CodeArgumentX;
    import CodeLiteral = Syntax.CodeLiteral;
    import CodeBinary = Syntax.CodeBinary;
    import CodeUnary = Syntax.CodeUnary;
    import BinaryFunctions = Syntax.BinaryFunctions;
    import UnaryFunctions = Syntax.UnaryFunctions;

    const paramaterNames = `abcdfhgiklmnoprstu`;

    abstract class MenuButton extends Button
    {
        constructor(document: Document,
            x: binding<number>,
            y: binding<number>,
            text: binding<string>,
            textBrush?: Sprite.Brush,
            horizontal_padding: binding<number> = 2,
            vertical_padding: binding<number> = 10)
        {
            super(document, x, y, text, horizontal_padding, vertical_padding, true);
            if (textBrush)
            {
                this.foregroundBrush.reset(textBrush);
            }
        }

        protected onClick(): boolean
        {
            if (this.document.canShowMenu(this))
            {
                const menu = new Menu(this.document, this.middleX, this.bottom);
                this.onShowMenu(menu);
                menu.show();
            }
            return true;
        }

        protected abstract onShowMenu(menu: Menu): void;
    }

    abstract class CodePresenter extends DocumentSprite<Sprite.Container>
    {
        constructor(document: Document)
        {
            super(document, new Sprite.Container());
        }

        public abstract get codeElement(): CodeElement;
        public abstract set codeElement(value: CodeElement);

        protected static readonly hPadding: number = 5;
        protected static readonly vPadding: number = 5;
    }

    class CodeLabel extends Button
    {
        constructor(document: Document,
            x: binding<number>,
            y: binding<number>,
            text: binding<string>,
            horizontal_padding: binding<number> = 10,
            vertical_padding: binding<number> = 10)
        {
            super(document, x, y, text, horizontal_padding, vertical_padding, true);
        }

        public get selected(): boolean
        {
            return this._labelSelected || (this._pairedLabel != undefined && this._pairedLabel._labelSelected);
        }

        public addPairedLabel(label: CodeLabel)
        {
            this._pairedLabel = label;
        }

        protected mouseMove(event: MouseEvent): void
        {
            this._labelSelected = this.mouseHit(event);
        }
        protected onClick(): boolean
        {
            return false;
        }

        private _pairedLabel?: CodeLabel;
        private _labelSelected: boolean = false;
    }

    class CodeArgumentPresenter extends CodePresenter
    {
        constructor(document: Document, x: binding<number>, y: binding<number>)
        {
            super(document);
            class ArgButton extends MenuButton
            {
                constructor(owner: CodeArgumentPresenter, x: binding<number>, y: binding<number>)
                {
                    super(owner.document, x, y, () => owner.codeElement.text);
                    this._owner = owner;
                }

                protected onShowMenu(menu: Menu): void
                {
                    let item = menu.addMenuItem(`x`);
                    item.onChecked.bind(this, () => this._owner._codeElement = new CodeArgumentX());

                    item = menu.addMenuItem(`123`);
                    item.onChecked.bind(this, () =>
                    {
                        const number = this.document.promptNumber(``);
                        if (number != null)
                        {
                            this._owner._codeElement = new CodeLiteral(number);
                        }
                    });

                    const group = menu.addMenuGroup("abc");
                    let stripe: MenuStrip;
                    for (let i = 0; i < paramaterNames.length; i++)
                    {
                        if (i % 6 == 0)
                        {
                            stripe = group.addMenuStrip();
                        }
                        const index = i;
                        const arg_name = paramaterNames.charAt(index);
                        const menu_item = stripe!.addMenuItem(` ${arg_name} `);
                        menu_item.onChecked.bind(this, () => this._owner._codeElement = new CodeArgument(arg_name));
                    }

                }

                private readonly _owner: CodeArgumentPresenter;
            }

            this._codeElement = new CodeArgumentX();
            this.item.push(new ArgButton(this, x, y));
        }

        public get codeElement(): CodeDefinitionElement
        {
            return this._codeElement;
        }
        public set codeElement(value: CodeDefinitionElement)
        {
            this._codeElement = value;
        }

        private _codeElement: CodeDefinitionElement;
    }

    class CodeUnaryPresenter extends CodePresenter
    {
        constructor(document: Document, x: binding<number>, y: binding<number>, func: UnaryFunctions = "sin")
        {
            super(document);
            class UnaryButton extends MenuButton
            {
                constructor(owner: CodeUnaryPresenter, x: binding<number>, y: binding<number>)
                {
                    super(owner.document, x, y, () => owner._function);
                    this._owner = owner;
                }
                protected onShowMenu(menu: Menu): void
                {
                    const groups: Record<string, Array<UnaryFunctions>> = {};
                    groups["Trig"] = ["sin", "cos", "tan", "arcsin", "arccos", "arctan"];
                    groups["Hyper"] = ["sinh", "cosh", "tanh", "arcsinh", "arccosh", "arctanh"];
                    groups["Log"] = ["ln", "log2", "log10"];
                    groups["Roots"] = ["√", "∛", "∜",];
                    groups["Int"] = ["round", "ceil", "floor"];

                    const misc: Array<UnaryFunctions> = ["exp", "neg", "sign", "abs", "!", "f'"];

                    for (const group_name in groups)
                    {
                        const group = menu.addMenuGroup(group_name);
                        for (const unary_function of groups[group_name])
                        {
                            this.addMenu(group, unary_function);
                        }
                    }

                    for (const unary_function of misc)
                    {
                        this.addMenu(menu, unary_function);
                    }
                }
                protected addMenu(root: IMenuGroup, unary_function: UnaryFunctions): void
                {
                    const name = new CodeUnary(unary_function, new CodeArgumentX()).text;
                    const menu = root.addMenuItem(name);
                    menu.onChecked.bind(this, () => this._owner._function = unary_function);
                    menu.addW((value: number) => Math.max(20, value));
                }

                private readonly _owner: CodeUnaryPresenter;
            }

            const button = new UnaryButton(this, x, y);
            const left_bracket = new CodeLabel(document, () => button.right, () => button.y, `(`, 0);
            const placeholder = new CodePlaceholder(document, () => left_bracket.right, y, false);
            const right_bracket = new CodeLabel(document, () => placeholder.right, () => placeholder.y, `)`, 0);
            left_bracket.addPairedLabel(right_bracket);
            right_bracket.addPairedLabel(left_bracket);

            this._function = func;
            this.item.push(button);
            this.item.push(left_bracket);
            this.item.push(placeholder);
            this.item.push(right_bracket);
        }

        public get codeElement(): CodeUnary
        {
            return new CodeUnary(this._function, this.placeholder.codeElement);
        }
        public set codeElement(value: CodeUnary)
        {
            this._function = value.function;
            this.placeholder.codeElement = value.operand;
        }

        protected get placeholder(): CodePlaceholder
        {
            assert(this.item.length == 4);
            const placeholder = this.item.item(2);
            assert(placeholder instanceof CodePlaceholder);
            return placeholder;
        }

        private _function: UnaryFunctions;
    }

    class CodeBinaryPresenter extends CodePresenter
    {
        constructor(document: Document, x: binding<number>, y: binding<number>)
        {
            super(document);
            class BinaryButton extends MenuButton
            {
                constructor(owner: CodeBinaryPresenter, x: binding<number>, y: binding<number>)
                {
                    super(owner.document, x, y, () => ` ${owner._function} `);
                    this._owner = owner;
                }
                protected onShowMenu(menu: Menu): void
                {
                    const functions: Array<BinaryFunctions> = ["pow", "n√", "+", "-", "*", "÷"];
                    for (const binary_function of functions)
                    {
                        menu.addMenuItem(binary_function).onChecked.bind(this, () => this._owner._function = binary_function);
                    }
                }

                private readonly _owner: CodeBinaryPresenter;
            }

            const left_bracket = new CodeLabel(document, x, y, `(`, 0);
            const operand1 = new CodePlaceholder(document, () => left_bracket.right, y, false);
            const button = new BinaryButton(this, () => operand1.right, () => operand1.y);
            const operand2 = new CodePlaceholder(document, () => button.right, () => button.y, false);
            const right_bracket = new CodeLabel(document, () => operand2.right, () => operand2.y, `)`, 0);
            left_bracket.addPairedLabel(right_bracket);
            right_bracket.addPairedLabel(left_bracket);

            this._function = "+";
            this.item.push(left_bracket);
            this.item.push(operand1);
            this.item.push(button);
            this.item.push(operand2);
            this.item.push(right_bracket);
        }

        public get codeElement(): CodeBinary
        {
            assert(this.item.length == 5);
            const operand1 = this.item.item(1);
            const operand2 = this.item.item(3);
            assert(operand1 instanceof CodePlaceholder);
            assert(operand2 instanceof CodePlaceholder);
            return new CodeBinary(operand1.codeElement, this._function, operand2.codeElement);
        }
        public set codeElement(value: CodeBinary)
        {
            this._function = value.function;
            this.placeholder1.codeElement = value.operand1;
            this.placeholder2.codeElement = value.operand2;
        }

        protected get placeholder1(): CodePlaceholder
        {
            assert(this.item.length == 5);
            const placeholder = this.item.item(1);
            assert(placeholder instanceof CodePlaceholder);
            return placeholder;
        }
        protected get placeholder2(): CodePlaceholder
        {
            assert(this.item.length == 5);
            const placeholder = this.item.item(3);
            assert(placeholder instanceof CodePlaceholder);
            return placeholder;
        }

        private _function: BinaryFunctions;
    }

    class CodePlaceholder extends CodePresenter
    {
        constructor(document: Document, x: binding<number>, y: binding<number>, symmetric: boolean)
        {
            super(document);
            class PlaceholderButton extends MenuButton
            {
                constructor(owner: CodePlaceholder, x: binding<number>, y: binding<number>)
                {
                    super(owner.document, x, y, `↓`, "DarkGray", 1);
                    this._owner = owner;
                }
                protected onShowMenu(menu: Menu): void
                {
                    const x_mod = makeMod(this, () => this.right);
                    const y_mod = makeMod(this, () => this.top);

                    if (symmetric)
                    {
                        const symmetric_func = `±`;
                        let item = menu.addMenuItem(symmetric_func);
                        let presenter: CodePresenter = new CodeUnaryPresenter(document, x_mod, y_mod, symmetric_func);
                        item.onChecked.bind(this, () =>
                        {
                            if (this._owner.codeElement instanceof CodeUnary && this._owner.codeElement.function == symmetric_func)
                            {
                                if (this._owner.codeElement.operand instanceof CodeArgument)
                                {
                                    presenter = new CodeArgumentPresenter(document, x_mod, y_mod);
                                    presenter.codeElement = this._owner.codeElement.operand;
                                }
                                else if (this._owner.codeElement.operand instanceof CodeUnary)
                                {
                                    presenter = new CodeUnaryPresenter(document, x_mod, y_mod);
                                    presenter.codeElement = this._owner.codeElement.operand;
                                }
                                else
                                {
                                    assert(this._owner.codeElement.operand instanceof CodeBinary);
                                    presenter = new CodeBinaryPresenter(document, x_mod, y_mod);
                                    presenter.codeElement = this._owner.codeElement.operand;
                                }
                            }
                            else
                            {
                                const expression = new CodeUnary(symmetric_func, this._owner.codeElement);
                                presenter.codeElement = expression;
                            }
                            this._owner.setPresenter(presenter)
                        });
                    }

                    let item = menu.addMenuItem(`{arg}`);
                    item.onChecked.bind(this, () => this._owner.setPresenter(new CodeArgumentPresenter(document, x_mod, y_mod)));

                    item = menu.addMenuItem(`f(u)`);
                    item.onChecked.bind(this, () => this._owner.setPresenter(new CodeUnaryPresenter(document, x_mod, y_mod)));

                    item = menu.addMenuItem(`f(u, v)`);
                    item.onChecked.bind(this, () => this._owner.setPresenter(new CodeBinaryPresenter(document, x_mod, y_mod)));

                    item = menu.addMenuItem(`ψ{ f() }`);
                    item.onChecked.bind(this, () =>
                    {
                        const expression = new CodeUnary("sin", this._owner.codeElement);
                        const presenter = new CodeUnaryPresenter(document, x_mod, y_mod);
                        presenter.codeElement = expression;
                        this._owner.setPresenter(presenter);
                    });

                    item = menu.addMenuItem(`ψ{ f(), v }`);
                    item.onChecked.bind(this, () =>
                    {
                        const expression = new CodeBinary(this._owner.codeElement, "+", new CodeArgumentX());
                        const presenter = new CodeBinaryPresenter(document, x_mod, y_mod);
                        presenter.codeElement = expression;
                        this._owner.setPresenter(presenter);
                    });

                    item = menu.addMenuItem(`ψ{ u, f() }`);
                    item.onChecked.bind(this, () =>
                    {
                        const expression = new CodeBinary(new CodeArgumentX(), "+", this._owner.codeElement);
                        const presenter = new CodeBinaryPresenter(document, x_mod, y_mod);
                        presenter.codeElement = expression;
                        this._owner.setPresenter(presenter);
                    });
                }

                private readonly _owner: CodePlaceholder;
            }
            const button = new PlaceholderButton(this, x, y);
            this._codePresenter = new CodeArgumentPresenter(document, () => button.right, () => button.top);
            this.item.push(button);
            this.item.push(this._codePresenter);
        }

        public get codeElement(): CodeElement
        {
            return this._codePresenter.codeElement;
        }
        public set codeElement(value: CodeElement)
        {
            const button = this.item.first!;
            const x_mod = () => button.right;
            const y_mod = () => button.top;
            if (value instanceof CodeArgumentX || value instanceof CodeArgument || value instanceof CodeLiteral)
            {
                const presenter = new CodeArgumentPresenter(this.document, x_mod, y_mod);
                presenter.codeElement = value;
                this.setPresenter(presenter);
            }
            else if (value instanceof CodeUnary)
            {
                const presenter = new CodeUnaryPresenter(this.document, x_mod, y_mod);
                presenter.codeElement = value;
                this.setPresenter(presenter);
            }
            else if (value instanceof CodeBinary)
            {
                const presenter = new CodeBinaryPresenter(this.document, x_mod, y_mod);
                presenter.codeElement = value;
                this.setPresenter(presenter);
            }
            else
            {
                assert(false);
            }
        }

        protected setPresenter(presenter: CodePresenter): void
        {
            this.item.remove(this._codePresenter);
            this._codePresenter.dispose();
            this._codePresenter = presenter;
            this.item.push(this._codePresenter);
        }

        private _codePresenter: CodePresenter;
    }

    export type ArgumentValues = Map<string, number>;

    export type ExpressionInfo = {
        expression: CodeElement;
        argValues?: ArgumentValues;
    }

    export class ExpressionDialog extends DocumentSprite<Sprite.Container>
    {
        constructor(document: Document, x: binding<number>, y: binding<number>, expression?: CodeElement)
        {
            super(document, new Sprite.Container(), true);

            class OkButton extends Button
            {
                constructor(editor: ExpressionDialog, x: binding<number>, y: binding<number>)
                {
                    super(editor.document, x, y, `OK`, 5, 5, true);
                    this._editor = editor;
                    this.addVisible(() => !editor._parseError);
                }
                protected onClick(): boolean
                {
                    this._editor.emitOnEnter();
                    return false;
                }
                private readonly _editor: ExpressionDialog;
            }
            class CancelButton extends Button
            {
                constructor(editor: ExpressionDialog, x: binding<number>, y: binding<number>)
                {
                    super(editor.document, x, y, `Cancel`, 5, 5, true);
                    this._editor = editor;
                }
                protected onClick(): boolean
                {
                    this._editor.onEnter.emitEvent(new CustomEvent<ExpressionInfo>("ExpressionEditorEvent", { cancelable: false, detail: undefined }));
                    return false;
                }
                private readonly _editor: ExpressionDialog;
            }
            class EditButton extends Button
            {
                constructor(editor: ExpressionDialog, x: binding<number>, y: binding<number>)
                {
                    super(editor.document, x, y, Resources.string("⌨⇆🖰"), 5, 5, true);
                    this._editor = editor;
                }
                protected onClick(): boolean
                {
                    this._editor._code.visible = !this._editor._code.visible;
                    if (!this._editor._code.visible)
                    {
                        text_editor.text = this._editor._code.codeElement.text;
                    }
                    else
                    {
                        delete this._editor._parseError;
                    }
                    return true;
                }
                private readonly _editor: ExpressionDialog;
            }
            const background = new Sprite.Rectangle(
                x,
                y,
                1,
                1,
                () => CurrentTheme.FormulaEditorBackgroundBrush
            );

            const x_mod = makeMod(this, () => background.x + this._padding);
            let y_mod = makeMod(this, () => (text_editor.visible ? text_editor : visual_editor).bottom + this._padding);

            const text_editor = new Sprite.TextInput(
                x_mod,
                makeMod(this, () => background.y + this._padding),
                makeMod(this, () => background.w - 2 * this._padding),
                30,
                expression?.text,
                () => CurrentTheme.FormulaInputTextBrush,
                () => CurrentTheme.FormulaInputTextStyle,
                () => CurrentTheme.FormulaInputTextBackgroundBrush
            );
            const visual_editor = new CodePlaceholder(document, x_mod, makeMod(this, () => background.y + this._padding), true);
            visual_editor.visible = false;
            text_editor.addVisible(() => !visual_editor.visible);
            text_editor.onKeyPress.bind(this, (event: KeyboardEvent): boolean =>
            {
                this.parse(text_editor.text);
                const enter_key_code = 13;
                if (event.keyCode == enter_key_code)
                {
                    this.emitOnEnter();
                }
                return true;
            });
            const plain_text = new Sprite.Text(
                x_mod,
                y_mod,
                0,
                0,
                () => CurrentTheme.FormulaSampleTextBrush,
                () => CurrentTheme.FormulaSampleTextStyle,
                makeMod(this, () => this._code.visible ? this._plainText : (this._parseError ?? this._plainText))
            );
            plain_text.addVisible(Utils.makeMod(this, () => document.latexEngine.disabled || !!this._parseError));
            const latex = new Sprite.LatexContainer(
                document.latexEngine,
                makeMod(this, () => this._latex),
                x_mod,
                y_mod,
                1.2,
            );
            latex.addVisible(() => !plain_text.visible);

            y_mod = makeMod(this, () => Math.max(plain_text.bottom, latex.bottom) + this._padding);

            let calc_x: number | undefined;
            let calc_width: number | undefined;
            const ok = new OkButton(this, x_mod, y_mod);
            const cancel = new CancelButton(this, makeMod(this, () => ok.right + this._padding), y_mod);
            const edit = new EditButton(this, makeMod(this, () => cancel.right + this._padding), y_mod)
            const width_calculator = makeMod(this, (): number =>
            {
                const w1 = (visual_editor.visible ? visual_editor.w : text_editor.textWidth) + 2 * this._padding;
                const w2 = plain_text.visible ? plain_text.w + 2 * this._padding : 0;
                const w3 = ok.w + cancel.w + edit.w + 4 * this._padding;
                const w4 = (plain_text.visible ? plain_text.w : latex.w) + 2 * this._padding;

                calc_width = Math.max(w1, w2, w3, w4);
                return calc_width;
            });
            const x_calculator = (value: number): number =>
            {
                if (!calc_width || !calc_x)
                {
                    calc_x = value;
                }
                else if ((calc_x + calc_width) > document.mouseArea.w)
                {
                    calc_x = (document.mouseArea.w - calc_width) / 2;
                }
                return Math.max(document.mouseArea.x, calc_x);
            };

            background.addX(x_calculator);
            background.addW(width_calculator);
            background.addH(makeMod(this, () => edit.bottom - background.top + this._padding));

            this.onEnter = new MulticastEvent<CustomEvent<ExpressionInfo | undefined>>();
            this._code = visual_editor;
            this.item.push(background);
            this.item.push(text_editor);
            this.item.push(visual_editor);
            this.item.push(plain_text);
            this.item.push(latex);
            this.item.push(ok);
            this.item.push(cancel);
            this.item.push(edit);

            if (expression)
            {
                visual_editor.codeElement = expression;
            }
            this._mouseDownBinder = document.mouseArea.onMouseDown.bind(this, this.mouseHandle);
            this._mouseUpBinder = document.mouseArea.onMouseDown.bind(this, this.mouseHandle);
        }

        public dispose(): void
        {
            if (!this.disposed)
            {
                this._mouseDownBinder.dispose();
                this._mouseUpBinder.dispose();
                super.dispose();
            }
        }

        public readonly onEnter: MulticastEvent<CustomEvent<ExpressionInfo | undefined>>;

        protected mouseHandle(event: MouseEvent): void
        {
            event.cancelBubble = true;
        }
        protected mouseMove(event: MouseEvent): void
        {
            this.mouseHandle(event);
            super.mouseMove(event);
        }
        protected parse(text_expression: string): boolean
        {
            try
            {
                this._argValues = new Map<string, number>();
                const operand = MathParser.Parse(text_expression);
                const expression = this.expressionConverter(operand);
                this._code.codeElement = expression;
                delete this._parseError;

                return true;
            }
            catch (error)
            {
                this._parseError = Resources.string("Ошибка выражения: {0}", `${error}`);
                return false;
            }
        }
        protected emitOnEnter(): void
        {
            const result: ExpressionInfo = {
                expression: this._code.codeElement,
                argValues: this._argValues
            };
            this.onEnter.emitEvent(new CustomEvent<ExpressionInfo>("ExpressionEditorEvent", { cancelable: false, detail: result }));
        }

        private get _plainText(): string
        {
            const text = this._code.codeElement.text;
            if (text.length > 0 && text.charAt(0) == `(`)
            {
                return `y = ${text.substr(1, text.length - 2)}`;
            }
            else
            {
                return `y = ${text}`;
            }
        }
        private get _latex(): string
        {
            try
            {
                const latex_markup = `{\\color{${CurrentTheme.FormulaSampleTextBrush}} y=` +
                    MathParser.OperandToLatexFormula(MathParser.Parse(this._code.codeElement.math)) + "}";
                return latex_markup;
            }
            catch (error)
            {
                return `{\\color{red}${error}}`;
            }
        }

        private expressionConverter(operand: Operand): CodeElement
        {
            const expression = operand.Value;

            if (expression instanceof Parameter)
            {
                if (expression.Name == "x")
                {
                    return new CodeArgumentX();
                }
                else
                {
                    const value = typeof expression.Value == "boolean" ? (expression.Value ? 1 : 0) : expression.Value;
                    assert(this._argValues);
                    this._argValues.set(expression.Name, value);
                    return new CodeArgument(expression.Name);
                }
            }
            else if (expression instanceof UnaryOperation)
            {
                const function_type = expression.Func.Type;
                switch (function_type)
                {
                    case "rad":
                    case "deg":
                        assert(false, "TODO");
                    case "cos":
                        assert(expression.Arguments.Length == 1);
                        return new CodeUnary("cos", this.expressionConverter(expression.Arguments.Arguments[0]));
                    case "sin":
                        assert(expression.Arguments.Length == 1);
                        return new CodeUnary("sin", this.expressionConverter(expression.Arguments.Arguments[0]));
                    case "tan":
                        assert(expression.Arguments.Length == 1);
                        return new CodeUnary("tan", this.expressionConverter(expression.Arguments.Arguments[0]));
                    case "cot":
                        assert(expression.Arguments.Length == 1);
                        return new CodeBinary(new CodeLiteral(1), "÷", new CodeUnary("tan", this.expressionConverter(expression.Arguments.Arguments[0])));
                    case "acos":
                        assert(expression.Arguments.Length == 1);
                        return new CodeUnary("arccos", this.expressionConverter(expression.Arguments.Arguments[0]));
                    case "asin":
                        assert(expression.Arguments.Length == 1);
                        return new CodeUnary("arcsin", this.expressionConverter(expression.Arguments.Arguments[0]));
                    case "atan":
                        assert(expression.Arguments.Length == 1);
                        return new CodeUnary("arctan", this.expressionConverter(expression.Arguments.Arguments[0]));
                    case "acot":
                        assert(expression.Arguments.Length == 1);
                        return new CodeUnary("arctan", new CodeBinary(new CodeLiteral(1), "÷", this.expressionConverter(expression.Arguments.Arguments[0])));
                    case "sqrt":
                        assert(expression.Arguments.Length == 1);
                        return new CodeUnary("√", this.expressionConverter(expression.Arguments.Arguments[0]));
                    case "cbrt":
                        assert(expression.Arguments.Length == 1);
                        return new CodeUnary("∛", this.expressionConverter(expression.Arguments.Arguments[0]));
                    case "ln":
                        assert(expression.Arguments.Length == 1);
                        return new CodeUnary("ln", this.expressionConverter(expression.Arguments.Arguments[0]));
                    case "abs":
                        assert(expression.Arguments.Length == 1);
                        return new CodeUnary("abs", this.expressionConverter(expression.Arguments.Arguments[0]));
                    case "log":
                        assert(expression.Arguments.Length == 2);
                        return new CodeBinary(new CodeUnary("ln", this.expressionConverter(expression.Arguments.Arguments[0])), "÷", new CodeUnary("ln", this.expressionConverter(expression.Arguments.Arguments[1])));
                    case "root":
                        assert(expression.Arguments.Length == 2);
                        return new CodeBinary(this.expressionConverter(expression.Arguments.Arguments[1]), "n√", this.expressionConverter(expression.Arguments.Arguments[0]));
                    case "cosh":
                        assert(expression.Arguments.Length == 1);
                        return new CodeUnary("cosh", this.expressionConverter(expression.Arguments.Arguments[0]));
                    case "sinh":
                        assert(expression.Arguments.Length == 1);
                        return new CodeUnary("sinh", this.expressionConverter(expression.Arguments.Arguments[0]));
                    case "tanh":
                        assert(expression.Arguments.Length == 1);
                        return new CodeUnary("tanh", this.expressionConverter(expression.Arguments.Arguments[0]));
                    case "coth":
                        assert(expression.Arguments.Length == 1);
                        return new CodeBinary(new CodeLiteral(1), "÷", new CodeUnary("tanh", this.expressionConverter(expression.Arguments.Arguments[0])));
                    case "acosh":
                        assert(expression.Arguments.Length == 1);
                        return new CodeUnary("arccosh", this.expressionConverter(expression.Arguments.Arguments[0]));
                    case "asinh":
                        assert(expression.Arguments.Length == 1);
                        return new CodeUnary("arcsinh", this.expressionConverter(expression.Arguments.Arguments[0]));
                    case "atanh":
                        assert(expression.Arguments.Length == 1);
                        return new CodeUnary("arctanh", this.expressionConverter(expression.Arguments.Arguments[0]));
                    case "acoth":
                        assert(expression.Arguments.Length == 1);
                        return new CodeUnary("arctanh", new CodeBinary(new CodeLiteral(1), "÷", this.expressionConverter(expression.Arguments.Arguments[0])));
                    case "sign":
                        assert(expression.Arguments.Length == 1);
                        return new CodeUnary("sin", this.expressionConverter(expression.Arguments.Arguments[0]));
                    case "exp":
                        assert(expression.Arguments.Length == 1);
                        return new CodeUnary("exp", this.expressionConverter(expression.Arguments.Arguments[0]));
                    case "floor":
                        assert(expression.Arguments.Length == 1);
                        return new CodeUnary("floor", this.expressionConverter(expression.Arguments.Arguments[0]));
                    case "ceil":
                        assert(expression.Arguments.Length == 1);
                        return new CodeUnary("ceil", this.expressionConverter(expression.Arguments.Arguments[0]));
                    case "round":
                        assert(expression.Arguments.Length == 1);
                        return new CodeUnary("round", this.expressionConverter(expression.Arguments.Arguments[0]));
                    case "fact":
                        assert(expression.Arguments.Length == 1);
                        return new CodeUnary("!", this.expressionConverter(expression.Arguments.Arguments[0]));
                    case "f'":
                        assert(expression.Arguments.Length == 1);
                        return new CodeUnary("f'", this.expressionConverter(expression.Arguments.Arguments[0]));
                    case "negative":
                        assert(expression.Arguments.Length == 1);
                        return new CodeUnary("neg", this.expressionConverter(expression.Arguments.Arguments[0]));
                    case "!":
                    case "rand":
                    default:
                        throw new Error(Resources.string("Неподдерживаемый тип функции: {0}", function_type));
                }
            }
            else if (expression instanceof BinaryOperation)
            {
                const operator_type = expression.Operator.Value;
                switch (operator_type)
                {
                    case "+":
                        return new CodeBinary(this.expressionConverter(expression.FirstOperand), "+", this.expressionConverter(expression.SecondOperand));
                    case "-":
                        return new CodeBinary(this.expressionConverter(expression.FirstOperand), "-", this.expressionConverter(expression.SecondOperand));
                    case "*":
                        return new CodeBinary(this.expressionConverter(expression.FirstOperand), "*", this.expressionConverter(expression.SecondOperand));
                    case "/":
                        return new CodeBinary(this.expressionConverter(expression.FirstOperand), "÷", this.expressionConverter(expression.SecondOperand));
                    case "^":
                        return new CodeBinary(this.expressionConverter(expression.FirstOperand), "pow", this.expressionConverter(expression.SecondOperand));
                    default:
                        throw new Error(Resources.string("Неподдерживаемый тип оператора: {0}", operator_type));
                }
            }
            else if (typeof expression == "number")
            {
                return new CodeLiteral(expression);
            }
            else if (typeof expression == "boolean")
            {
                return new CodeLiteral(expression ? 1 : 0);
            }
            else
            {
                throw new Error(Resources.string("Неподдерживаемый тип операнда: {0}", expression.constructor.name));
            }
        }

        private _argValues?: ArgumentValues;
        private _parseError?: string;
        private readonly _mouseDownBinder: IEventListener<MouseEvent>;
        private readonly _mouseUpBinder: IEventListener<MouseEvent>;
        private readonly _code: CodePlaceholder;
        private readonly _padding: number = 10;
    }
}