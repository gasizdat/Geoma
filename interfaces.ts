/// <reference path="utils.ts" />

module Geoma
{
    export interface IMouseArea
    {
        readonly onMouseMove: Utils.MulticastEvent<MouseEvent>;
        readonly onMouseDown: Utils.MulticastEvent<MouseEvent>;
        readonly onMouseUp: Utils.MulticastEvent<MouseEvent>;
        readonly onMouseClick: Utils.MulticastEvent<MouseEvent>;
        readonly mousePoint: IPoint;
        readonly x: number;
        readonly y: number;
        readonly w: number;
        readonly h: number;
        readonly ratio: number;
        readonly offset: IPoint;

        setOffset(dx: number, dy: number): void;
    }

    export interface IEventListener<TEvent extends Event>
    {
        onEvent(event: TEvent): void;
        dispose(): void;
    }

    export interface IPoint
    {
        readonly x: number;
        readonly y: number;
    }

    export interface ILine
    {
        readonly startPoint: IPoint;
        readonly endPoint: IPoint;
    }

    export interface ICircle
    {
        readonly center: IPoint;
        readonly radius: number;
    }

    export interface IPolygon
    {
        readonly path: Path2D;
        readonly box: Utils.Box;
    }

    export interface ICodeEvaluatorContext
    {
        getFunction(name: string): Function | null;
        addFunction(name: string, code: string): void;
        arg(name: string): number;
        hasArg(name: string): boolean;
        addArg(name: string, arg: Utils.binding<number>): void;
        setArg(name: string, value: number): void;
    }

    export interface ISamplesAdapter
    {
        getScreenY(screen_x: number): number;
        lineTo(x: number, y: number, discontinuity: boolean): void;
        addSample(): void;
        setSample(screen_x: number, screen_y: number): void;
    }
}