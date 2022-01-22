/// <reference path="utils.ts" />
/// <reference path="tools.button.ts" />

module Geoma.Tools
{
    import makeMod = Utils.makeMod;
    import binding = Utils.binding;

    export class ArgumentHandleButton extends Button
    {
        constructor(document: Document, x: binding<number>, arg_name: string, value: number)
        {
            super(document, x, 0, arg_name);

            this._value = value;
            this.item.name = arg_name;
            this.addX(makeMod(this, this.calcX));
            this.addY(makeMod(this, this.calcY));
            this.addText(makeMod(this, (value: string) => value + ` = ${this._value}`));
        }

        public bottomArgIndex: number = -1;

        public get value(): number
        {
            return this._value;
        }
        public set value(value: number)
        {
            const transaction_name = Resources.string("Установить {0} = {1}", this.name, `${value}`);
            UndoTransaction.Do(this,
                transaction_name,
                () =>
                {
                    this._value = value;
                    for (let i = 0; i < this.document.parametrics.length; i++)
                    {
                        const line = this.document.parametrics.item(i);
                        Utils.assert(line instanceof ParametricLine);
                        if (line.hasArg(this.name))
                        {
                            line.setModified();
                        }
                    }
                }
            );
        }

        public serialize(__context: SerializationContext): Array<string>
        {
            const data: Array<string> = [];
            data.push(`${this.name}`);
            data.push(`v`);
            data.push(`${this._value}`);
            return data;
        }

        public static deserialize(context: DesializationContext, data: Array<string>, index: number): ArgumentHandleButton | null
        {
            if (data.length < (index + 3))
            {
                return null;
            }
            else
            {
                const name = data[index++];
                switch (data[index++])
                {
                    case `v`:
                        const value = parseFloat(data[index++]);
                        return new ArgumentHandleButton(context.document, 0, name, value);
                    default:
                        //Utils.assert(false);
                        return null;
                }
            }
        }

        protected get isAddornersSelected(): boolean
        {
            return this._adorners !== undefined && this._adorners.mouseHit(this.document.mouseArea.mousePoint);
        }
        protected onClick(): boolean
        {
            if (!this.isAddornersSelected)
            {
                const result = this.document.promptNumber("Значение", this._value);
                if (result !== null)
                {
                    this.value = result;
                }
            }
            return false;
        }
        protected mouseMove(event: MouseEvent): void
        {
            super.mouseMove(event);
            if (this.selected)
            {
                if (!this._adorners)
                {
                    Utils.assert(this.item.last);
                    class adorner extends Button
                    {
                        constructor(owner: ArgumentHandleButton, x: binding<number>, text: string, direction: number)
                        {
                            super(owner.document, x, owner.y, text);
                            this._direction = direction;
                            this._owner = owner;
                        }
                        public dispose()
                        {
                            if (this._transaction)
                            {
                                this._transaction.rollback();
                                delete this._transaction;
                            }
                            super.dispose();
                        }

                        protected calcDeltaValue(): number
                        {
                            const value = this._owner._value;
                            if (Math.abs(value) < adorner._deltaValueThreshold)
                            {
                                return this._direction * 2 * adorner._deltaValueThreshold;
                            }
                            else
                            {
                                const value_magnitude = Utils.toInt(Math.log10(Math.abs(value)));
                                const delta_value = (10 ** (value_magnitude - 1)) * this._direction; //dv = 10%
                                return delta_value;
                            }
                        }
                        protected onClick(): boolean
                        {
                            const delta_value = this.calcDeltaValue();
                            this._owner.value += delta_value;
                            if (this._transaction)
                            {
                                this._transaction.commit();
                                delete this._transaction;
                            }
                            delete this._startTicks;
                            return true;
                        }
                        protected innerDraw(play_ground: PlayGround): void
                        {
                            super.innerDraw(play_ground);
                            if (this._owner.isPressed && this.mouseHit(play_ground.mousePoint))
                            {
                                if (this._startTicks === undefined)
                                {
                                    const transaction_name = Resources.string("Установить {0} = {1}", this.name, "++");
                                    this._transaction = this.document.beginUndo(transaction_name);
                                    this._accelerator = adorner._defaultAcceleration;
                                    this._startTicks = Document.ticks;
                                    this._lastTicks = Document.ticks;
                                }

                                const dt = Document.ticks - this._startTicks;
                                if (dt >= CurrentTheme.TapDelayTime)
                                {
                                    if (dt >= CurrentTheme.TapActivateTime)
                                    {
                                        const velocity = adorner._defaultVelocity / Math.max(1, Utils.toInt(this._accelerator));
                                        if ((Document.ticks - this._lastTicks) >= velocity)
                                        {
                                            this._lastTicks = Document.ticks;
                                            this._owner.value += this.calcDeltaValue();
                                        }
                                        this._accelerator += adorner._defaultAcceleration;
                                    }
                                }
                            }
                        }

                        private _owner: ArgumentHandleButton;
                        private _startTicks?: number;
                        private _transaction?: UndoTransaction;
                        private _lastTicks: number = 0;
                        private _accelerator: number = adorner._defaultAcceleration;

                        private readonly _direction: number = 0;
                        private static readonly _deltaValueThreshold = 0.001;
                        private static readonly _defaultVelocity = 1000; // 1 d/s
                        private static readonly _defaultAcceleration = 0.3;
                    }
                    this._adorners = new Container();
                    const dec_adorner = new adorner(this, this.right, "-", -1);
                    const inc_adorner = new adorner(this, () => dec_adorner.right, "+", 1);

                    this._adorners.push(inc_adorner);
                    this._adorners.push(dec_adorner);
                    this.item.push(this._adorners);
                }
            }
            else if (this._adorners)
            {
                this.item.remove(this._adorners);
                this._adorners.dispose();
                delete this._adorners;
            }
        }
        protected calcX(value: number): number
        {
            return value + CurrentTheme.PropertyLeftMargin + this.document.mouseArea.offset.x;
        }
        protected calcY(): number
        {
            if (this.bottomArgIndex == -1)
            {
                return this.document.toolsBottom + this.document.mouseArea.offset.y;
            }
            else
            {
                return this.document.args.item(this.bottomArgIndex).bottom + CurrentTheme.PropertyVerticalPadding;
            }
        }

        private _value: number;
        private _adorners?: Container<Button>;
    }
}