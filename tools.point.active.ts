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
/// <reference path="tools.line.base.ts" />

module Geoma.Tools
{
    import makeMod = Utils.makeMod;
    import Point = Utils.Point;
    import binding = Utils.binding;

    export class ActivePoint extends ActivePointBase
    {
        constructor(document: Document, x: number, y: number, radius: number = 5, line_width: number = 2)
        {
            super(
                document,
                x,
                y,
                radius,
                line_width,
                () => CurrentTheme.AdornerBrush,
                () => CurrentTheme.AdornerLineBrush,
                () => CurrentTheme.AdornerSelectLineBrush
            );
            this._dx = this._dy = 0;
            this._moved = new Utils.Pulse();
            this._mouseDownListener = document.mouseArea.onMouseDown.bind(this, this.mouseDown, true);
            this._mouseUpListener = document.mouseArea.onMouseUp.bind(this, this.mouseUp, true);
            this.addX(makeMod(this, this.dxModifier));
            this.addY(makeMod(this, this.dyModifier));
        }

        public dispose()
        {
            if (!this.disposed)
            {
                this._transaction?.rollback();
                this._mouseDownListener.dispose();
                this._mouseUpListener.dispose();
                super.dispose();
            }
        }
        public move(dx: number, dy: number): void
        {
            this._dx -= dx;
            this._dy -= dy;
            this.setMoved();
        }
        public isMoved(receiptor: string): boolean
        {
            return this._moved.get(receiptor);
        }
        public serialize(context: SerializationContext): Array<string>
        {
            const data = super.serialize(context);
            data.push(this.name);
            return data;
        }
        public setName(value: string, brush: binding<Sprite.Brush> = () => CurrentTheme.AdornerNameBrush, style: binding<CanvasTextDrawingStyles> = () => CurrentTheme.AdornerNameStyle): Sprite.Text
        {
            const text = super.setName(value, brush, style);
            text.strokeBrush.value = CurrentTheme.AdornerStrokeBrush;
            text.strokeWidth.value = CurrentTheme.AdornerStrokeWidth;
            text.addX(makeMod(this, this.dxModifier));
            text.addY(makeMod(this, this.dyModifier));
            return text;
        }
        public static deserialize(context: DesializationContext, data: Array<string>, index: number): ActivePoint | null
        {
            if (data.length > (index + 2))
            {
                const point = new ActivePoint(context.document, parseFloat(data[index]), parseFloat(data[index + 1]));
                point.setName(data[index + 2]);
                return point;
            }
            else
            {
                return null;
            }
        }

        protected dxModifier(value: number): number
        {
            return value + this._dx;
        }
        protected dyModifier(value: number): number
        {
            return value + this._dy;
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

                    let menu_item = menu.addMenuItem(Resources.string("Создать линию..."));
                    menu_item.onChecked.bind(this, () => doc.setLineState(this));

                    menu_item = menu.addMenuItem(Resources.string("Создать отрезок..."));
                    menu_item.onChecked.bind(this, () => doc.setLineSegmentState(this));

                    menu_item = menu.addMenuItem(Resources.string("Создать окружность из центра..."));
                    menu_item.onChecked.bind(this, () => doc.setCirclRadiusState(this));

                    menu_item = menu.addMenuItem(Resources.string("Создать окружность на диаметре..."));
                    menu_item.onChecked.bind(this, () => doc.setCirclDiameterState(this));

                    menu_item = menu.addMenuItem(Resources.string("Удалить точку"));
                    menu_item.onChecked.bind(this, () => doc.removePoint(this));

                    menu.show();
                }
            }
        }
        protected mouseMove(event: MouseEvent): void
        {
            const selected = this.selected;
            if (this._dragStart)
            {
                if (event.buttons != 0)
                {
                    const dpos = Point.sub(this._dragStart, event);
                    if (dpos.x != 0 || dpos.y != 0)
                    {
                        if (!this._transaction)
                        {
                            this._transaction = this.document.beginUndo(Resources.string("Перемещение точки {0}", this.name));
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
            super.mouseMove(event);

            if (!selected && this.selected)
            {
                this.setInfo(makeMod(this,
                    () => `x: ${Utils.toFixed(this.x, CurrentTheme.CoordinatesPrecision)}, y: ${Utils.toFixed(this.y, CurrentTheme.CoordinatesPrecision)}`),
                    CurrentTheme.PropertyTextBrush,
                    CurrentTheme.PropertyTextStyle
                );
            }
            else if (selected && !this.selected)
            {
                this.resetInfo();
            }
        }
        protected mouseDown(event: MouseEvent): void
        {
            if (this.mouseHit(event))
            {
                this._dragStart = event;
            }
        }
        protected mouseUp(__event: MouseEvent): void
        {
            if (this._dragStart)
            {
                this._transaction?.commit();
                delete this._transaction;
                delete this._dragStart;
            }
        }
        protected setMoved(): void
        {
            this._moved.set();
        }

        private _dx: number;
        private _dy: number;
        private _dragStart?: IPoint;
        private _transaction?: UndoTransaction;
        private readonly _moved: Utils.Pulse;
        private readonly _mouseDownListener: IEventListener<MouseEvent>;
        private readonly _mouseUpListener: IEventListener<MouseEvent>;
    }
}