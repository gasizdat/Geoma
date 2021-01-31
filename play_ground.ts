/// <reference path="utils.ts" />
/// <reference path="interfaces.ts" />

module Geoma
{
    import MulticastEvent = Utils.MulticastEvent;
    import Point = Utils.Point;
    import assert = Utils.assert;

    export class PlayGround extends Utils.Box implements IMouseArea
    {
        constructor(canvas: HTMLCanvasElement)
        {
            super(0, 0);

            assert(canvas);
            this._canvas = canvas;

            const mouse_pointed_device = ("onmousemove" in window);
            const touch_screen_device =
                ("ontouchstart" in window) ||
                (navigator.maxTouchPoints > 0) ||
                (navigator.msMaxTouchPoints > 0);

            if (touch_screen_device)
            {
                this._touchInterface = true;
                console.log("The touchsreen device.");
                this._canvas.ontouchmove = ((touch_event: TouchEvent) =>
                {
                    const document = this._canvas.ownerDocument;
                    for (let i = 0; i < touch_event.targetTouches.length; i++)
                    {
                        const touch = touch_event.targetTouches[i];
                        const mouse_data = PlayGround.touchToMouseEventInit(touch_event, touch);
                        Tools.Thickness.setMouseThickness(Math.max(touch.radiusX, touch.radiusY));
                        this.mouseMove(new MouseEvent("mousemove", mouse_data));
                    }
                }).bind(this);
                this._canvas.ontouchstart = ((touch_event: TouchEvent) =>
                {
                    const document = this._canvas.ownerDocument;
                    for (let i = 0; i < touch_event.targetTouches.length; i++)
                    {
                        const touch = touch_event.targetTouches[i];
                        const mouse_data = PlayGround.touchToMouseEventInit(touch_event, touch);
                        Tools.Thickness.setMouseThickness(Math.max(touch.radiusX, touch.radiusY));
                        let mouse_event = new MouseEvent("mousedown", mouse_data);
                        if (this.mousePoint.x != mouse_event.x || this.mousePoint.y != mouse_event.y)
                        {
                            this.mouseMove(mouse_event);
                            if (mouse_event.cancelBubble)
                            {
                                mouse_event = new MouseEvent("mousedown", mouse_data);
                            }
                        }
                        this.mouseDown(mouse_event);
                    }
                }).bind(this);
                this._canvas.ontouchend = ((touch_event: TouchEvent) =>
                {
                    const document = this._canvas.ownerDocument;
                    for (let i = 0; i < touch_event.changedTouches.length; i++)
                    {
                        const touch = touch_event.changedTouches[i];
                        const mouse_data = PlayGround.touchToMouseEventInit(touch_event, touch);
                        Tools.Thickness.setMouseThickness(Math.max(touch.radiusX, touch.radiusY));
                        let mouse_event = new MouseEvent("mouseup", mouse_data);
                        if (this.mousePoint.x != mouse_event.x || this.mousePoint.y != mouse_event.y)
                        {
                            this.mouseMove(mouse_event);
                            if (mouse_event.cancelBubble)
                            {
                                mouse_event = new MouseEvent("mouseup", mouse_data);
                            }
                        }
                        this.mouseUp(mouse_event);
                    }
                }).bind(this);
            }
            else if (mouse_pointed_device)
            {
                console.log("The device with mouse or touchpad.");
                this._canvas.onmousemove = this.mouseMove.bind(this);
                this._canvas.onmousedown = this.mouseDown.bind(this);
                this._canvas.onmouseup = this.mouseUp.bind(this);
            }
            else
            {
                assert(false, "The device doesn't have mouse or touchscreen");
            }

            this.invalidate();
            this.addW(Utils.makeMod(this, () => Math.trunc(this._canvas.width / this.ratio)));
            this.addH(Utils.makeMod(this, () => Math.trunc(this._canvas.height / this.ratio)));

            const context2d = this._canvas.getContext("2d");
            assert(context2d);
            this._context2d = context2d;
        }

        public get touchInterface(): boolean
        {
            return this._touchInterface;
        }
        public get mousePoint(): IPoint
        {
            return this._mousePoint;
        }
        public get context2d(): CanvasRenderingContext2D
        {
            return this._context2d;
        }
        public get ratio(): number
        {
            return window.devicePixelRatio ?? 1;
        }

        public readonly onMouseMove = new MulticastEvent<MouseEvent>();
        public readonly onMouseDown = new MulticastEvent<MouseEvent>();
        public readonly onMouseUp = new MulticastEvent<MouseEvent>();
        public readonly onMouseClick = new MulticastEvent<MouseEvent>();
        public static drawingSprites: number = 0;

        public invalidate(): void
        {
            const parent = this._canvas.parentElement;
            if (parent)
            {
                const ratio = this.ratio;
                this._canvas.width = parent.clientWidth * ratio;
                this._canvas.height = parent.clientHeight * ratio;
            }
        }
        public static getPosition(el: HTMLElement): IPoint
        {
            let x = 0;
            let y = 0;
            if (el.offsetParent)
            {
                x = el.offsetLeft
                y = el.offsetTop
                while (el = el.offsetParent as HTMLElement)
                {
                    x += el.offsetLeft
                    y += el.offsetTop
                }
            }
            return Point.make(x, y);
        }

        protected updateMouseEvent(event: MouseEvent): MouseEvent
        {
            if (event.x == event.offsetX && event.y == event.offsetY)
            {
                return event;
            }
            else
            {
                return new MouseEvent(event.type, {
                    view: event.view ?? window,
                    altKey: event.altKey,
                    bubbles: event.bubbles,
                    button: event.button,
                    buttons: event.buttons,
                    cancelable: event.cancelable,
                    clientX: event.offsetX,
                    clientY: event.offsetY,
                    ctrlKey: event.ctrlKey,
                    detail: event.detail,
                    metaKey: event.metaKey,
                    relatedTarget: event.target,
                    screenX: event.screenX,
                    screenY: event.screenY,
                    shiftKey: event.shiftKey,
                    movementX: event.movementX,
                    movementY: event.movementY
                });
            }
        }
        protected mouseMove(event: MouseEvent): void
        {
            const updated_event = this.updateMouseEvent(event);
            this._mousePoint = updated_event;
            this.onMouseMove.emitEvent(updated_event);
        }
        protected mouseDown(event: MouseEvent): void
        {
            const updated_event = this.updateMouseEvent(event);
            this._downPoint = updated_event;
            this.onMouseDown.emitEvent(updated_event);
        }
        protected mouseUp(event: MouseEvent): void
        {
            const updated_event = this.updateMouseEvent(event);
            const click_tolerance = 1;
            if (this._downPoint && Math.abs(this._downPoint.x - updated_event.x) <= click_tolerance && Math.abs(this._downPoint.y - updated_event.y) <= click_tolerance)
            {
                this.onMouseClick.emitEvent(updated_event);
            }
            this.onMouseUp.emitEvent(updated_event);
        }

        private static touchToMouseEventInit(touch_event: TouchEvent, touch: Touch): MouseEventInit
        {
            let dx: number = 0, dy: number = 0;
            if (touch_event.target instanceof HTMLElement)
            {
                dx = touch_event.target.offsetLeft;
                dy = touch_event.target.offsetTop;
            }
            return {
                view: touch_event.view ?? window,
                altKey: touch_event.altKey,
                bubbles: touch_event.bubbles,
                button: 1,
                buttons: 1,
                cancelable: true,
                clientX: touch.clientX - dx,
                clientY: touch.clientY - dy,
                ctrlKey: touch_event.ctrlKey,
                detail: touch_event.detail,
                metaKey: touch_event.metaKey,
                relatedTarget: touch.target,
                screenX: touch.screenX,
                screenY: touch.screenY,
                shiftKey: touch_event.shiftKey,
            };
        }

        private readonly _touchInterface: boolean = false;
        private readonly _canvas: HTMLCanvasElement;
        private readonly _context2d: CanvasRenderingContext2D;
        private _mousePoint: IPoint = Point.make(0, 0);
        private _downPoint: IPoint = Point.make(0, 0);
    }
}