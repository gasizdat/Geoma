/// <reference path="utils.ts" />
/// <reference path="sprites.ts" />
/// <reference path="polygons.ts" />
/// <reference path="interfaces.ts" />
/// <reference path="play_ground.ts" />
/// <reference path="tools.core.ts" />
/// <reference path="tools.styles.ts" />
/// <reference path="tools.document.ts" />
/// <reference path="tools.button.ts" />
/// <reference path="tools.parametric.line.ts"/>

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

    abstract class MenuButton extends Button
    {
        constructor(document: Document,
            x: binding<number>,
            y: binding<number>,
            text: binding<string>,
            textBrush?: Sprite.Brush,
            horizontal_padding: binding<number> = 10,
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
                    for (let i = 0; i < ArgButton._paramaterNames.length; i++)
                    {
                        if (i % 6 == 0)
                        {
                            stripe = group.addMenuStrip();
                        }
                        const index = i;
                        const menu_item = stripe!.addMenuItem(` ${ArgButton._paramaterNames.charAt(index)} `);
                        menu_item.onChecked.bind(this, (item: CustomEvent<MenuItem>) => this._owner._codeElement = new CodeArgument(item.detail.tooltip));
                    }

                }

                private readonly _owner: CodeArgumentPresenter;
                private static readonly _paramaterNames: string = `abcdefhgiklmnoprst`;
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
        constructor(document: Document, x: binding<number>, y: binding<number>)
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
                    const functions: Array<UnaryFunctions> = ["sin", "cos", "tan",
                        "arcsin", "arccos", "arctan",
                        "ln", "log2", "log10",
                        "exp", "√", "∛", "∜", "sign", "abs",
                        "sinh", "cosh", "tanh",
                        "arcsinh", "arccosh", "arctanh",
                        "!", "f'"];
                    for (const unary_function of functions)
                    {
                        menu.addMenuItem(unary_function).onChecked.bind(this, () => this._owner._function = unary_function);
                    }
                }

                private readonly _owner: CodeUnaryPresenter;
            }

            const button = new UnaryButton(this, x, y);
            const left_bracket = new CodeLabel(document, () => button.right, () => button.y, `(`, 0);
            const placeholder = new CodePlaceholder(document, () => left_bracket.right, y);
            const right_bracket = new CodeLabel(document, () => placeholder.right, () => placeholder.y, `)`, 0);
            left_bracket.addPairedLabel(right_bracket);
            right_bracket.addPairedLabel(left_bracket);

            this._function = "sin";
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
            const operand1 = new CodePlaceholder(document, () => left_bracket.right, y);
            const button = new BinaryButton(this, () => operand1.right, () => operand1.y);
            const operand2 = new CodePlaceholder(document, () => button.right, () => button.y);
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
        constructor(document: Document, x: binding<number>, y: binding<number>)
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
                }
                protected onClick(): boolean
                {
                    this._editor.onEnter.emitEvent(new CustomEvent<CodeElement>("ExpressionEditorEvent", { cancelable: false, detail: this._editor._code.codeElement }));
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
                    this._editor.onEnter.emitEvent(new CustomEvent<CodeElement>("ExpressionEditorEvent", { cancelable: false, detail: undefined }));
                    return false;
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
            const code = new CodePlaceholder(document, x_mod, makeMod(this, () => background.y + this._padding));
            const text = new Sprite.Text(
                x_mod,
                makeMod(this, () => code.bottom + this._padding),
                0,
                0,
                () => CurrentTheme.FormulaSampleTextBrush,
                () => CurrentTheme.FormulaSampleTextStyle,
                () =>
                {
                    const text = code.codeElement.text;
                    if (text.length > 0 && text.charAt(0) == `(`)
                    {
                        return `y = ${text.substr(1, text.length - 2)}`;
                    }
                    else
                    {
                        return `y = ${text}`;
                    }
                }
            );

            const y_mod = makeMod(this, () => text.bottom + this._padding);
            const ok = new OkButton(this, x_mod, y_mod);
            const cancel = new CancelButton(this, makeMod(this, () => ok.right + this._padding), y_mod);
            background.addW(makeMod(this, () => Math.max(code.right, cancel.right) - background.left + this._padding));
            background.addH(makeMod(this, () => cancel.bottom - background.top + this._padding));

            this.onEnter = new MulticastEvent<CustomEvent<CodeElement | undefined>>();
            this._code = code;
            this.item.push(background);
            this.item.push(code);
            this.item.push(text);
            this.item.push(ok);
            this.item.push(cancel);

            if (expression)
            {
                code.codeElement = expression;
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

        public readonly onEnter: MulticastEvent<CustomEvent<CodeElement| undefined>>;

        protected mouseHandle(event: MouseEvent): void
        {
            event.cancelBubble = true;
        }
        protected mouseMove(event: MouseEvent): void
        {
            this.mouseHandle(event);
            super.mouseMove(event);
        }

        private readonly _mouseDownBinder: IEventListener<MouseEvent>;
        private readonly _mouseUpBinder: IEventListener<MouseEvent>;
        private readonly _code: CodePlaceholder;
        private readonly _padding: number = 10;
    }
}