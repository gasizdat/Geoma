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
            this._canvas.onmousemove = this.onMouseMove.connect();
            this._canvas.onmousedown = this.onMouseDown.connect();
            this._canvas.onmouseup = this.onMouseUp.connect();
            this._canvas.ontouchmove = (event: TouchEvent) =>
            {
                const document = this._canvas.ownerDocument;
                for (let i = 0; i < event.targetTouches.length; i++)
                {
                    const touch = event.touches[i];
                    const mouse_event = document.createEvent('MouseEvents');
                    mouse_event.initMouseEvent(
                        "mousemove",
                        true,
                        true,
                        event.view ?? window,
                        event.detail,
                        touch.screenX,
                        touch.screenY,
                        touch.clientX,
                        touch.clientY,
                        event.ctrlKey,
                        event.altKey,
                        event.shiftKey,
                        event.metaKey,
                        0,//Main button
                        touch.target
                    );
                    this.onMouseMove.emitEvent(mouse_event);
                }
            };

            this.invalidate();
            this.addW(() => this._canvas.width);
            this.addH(() => this._canvas.height);

            const context2d = this._canvas.getContext("2d");
            assert(context2d);
            this._context2d = context2d;

            this.onMouseMove.bind(this, (event: MouseEvent): void => { this._mousePoint = event });
            this.onMouseDown.bind(this, (event: MouseEvent): void => { this._downPoint = event });
            this.onMouseUp.bind(this, (event: MouseEvent): void =>
            {
                const click_tolerance = 1;
                if (this._downPoint && Math.abs(this._downPoint.x - event.x) <= click_tolerance && Math.abs(this._downPoint.y - event.y) <= click_tolerance)
                {
                    this.onMouseClick.emitEvent(event);
                }
            });
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
        public getPosition(el: HTMLElement): IPoint
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

        private _canvas: HTMLCanvasElement;
        private _context2d: CanvasRenderingContext2D;
        private _mousePoint: IPoint = Point.make(0, 0);
        private _downPoint: IPoint = Point.make(0, 0);
    }
}