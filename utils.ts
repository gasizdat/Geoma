/// <reference path="interfaces.ts" />

module Geoma.Utils
{
    class AssertionError extends Error
    {
    }

    export function assert(condition: any, msg?: string): asserts condition
    {
        if (!condition)
        {
            let alert_message = msg ?? "Logic error. If you see this, then something gone wrong way ):";
            const stack = (new Error).stack;
            if (stack)
            {
                alert_message += `\n${stack}`;
            }
            console.log(alert_message);
            window.alert(alert_message);
            throw new AssertionError(alert_message);
        }
    }

    export interface IMouseReceptor
    {
        mouseMove(event: MouseEvent): boolean;
        mouseDown(event: MouseEvent): boolean;
        mouseUp(event: MouseEvent): boolean;
    }

    type EventCallback<TEvent extends Event> = (event: TEvent) => void;

    export function toRad(deg: number)
    {
        return deg * Math.PI / 180;
    }

    export function toDeg(rad: number)
    {
        return rad * 180 / Math.PI;
    }

    export function isInstanceOfAny<TInstanceType>(ctors: { new(...args: any[]): TInstanceType }[], instance: any): boolean
    {
        for (const ctor of ctors)
        {
            if (instance instanceof ctor)
            {
                return true;
            }
        }
        return false;
    }

    export class MulticastEvent<TEvent extends Event>
    {
        constructor()
        {
            this._listeners = new Array<IEventListener<TEvent>>();
        }

        public emitEvent(event: TEvent): boolean
        {
            this._isEmited = true;
            let ret = true;
            for (const listener of this._listeners)
            {
                if (listener)
                {
                    listener.onEvent(event);
                    if (event.cancelable && event.cancelBubble)
                    {
                        ret = false;
                        break;
                    }
                }
            }

            if (this._dirtyRemoveListeners)
            {
                for (const listener of this._dirtyRemoveListeners)
                {
                    const index = this._listeners.indexOf(listener);
                    assert(index != -1);
                    this._listeners.splice(index, 1);
                }
                delete this._dirtyRemoveListeners;
            }

            if (this._dirtyForwardListeners)
            {
                this._listeners.unshift(...this._dirtyForwardListeners);
                delete this._dirtyForwardListeners;
            }

            if (this._dirtyBackwardListeners)
            {
                this._listeners.push(...this._dirtyBackwardListeners);
                delete this._dirtyBackwardListeners;
            }

            this._isEmited = false;
            return ret;
        }
        public bindListener(listener: IEventListener<TEvent>, forward?: boolean): void
        {
            assert(listener);
            let listeners = this._listeners;
            if (this._isEmited)
            {
                if (forward)
                {
                    if (!this._dirtyForwardListeners)
                    {
                        this._dirtyForwardListeners = new Array<IEventListener<TEvent>>();
                    }
                    listeners = this._dirtyForwardListeners;
                }
                else 
                {
                    if (!this._dirtyBackwardListeners)
                    {
                        this._dirtyBackwardListeners = new Array<IEventListener<TEvent>>();
                    }
                    listeners = this._dirtyBackwardListeners;
                }
            }

            assert(listeners.indexOf(listener) == -1);

            if (forward)
            {
                listeners.unshift(listener);
            }
            else
            {
                listeners.push(listener);
            }
        }
        public bind<TObject>(obj: TObject, callback: EventCallback<TEvent>, forward?: boolean): IEventListener<TEvent>
        {
            const ret: IEventListener<TEvent> = new Binder(obj, callback, this);
            this.bindListener(ret, forward);
            return ret;
        }
        public connect(): (event: TEvent) => void
        {
            return (event: TEvent) => this.emitEvent(event);
        }
        public remove(listener: IEventListener<TEvent>): void
        {
            let index = this._listeners.indexOf(listener);
            if (index != -1)
            {
                if (this._isEmited)
                {
                    if (!this._dirtyRemoveListeners)
                    {
                        this._dirtyRemoveListeners = [];
                    }
                    this._dirtyRemoveListeners.push(listener);
                }
                else
                {
                    this._listeners.splice(index, 1);
                }
                return;
            }
            if (this._dirtyForwardListeners)
            {
                index = this._dirtyForwardListeners.indexOf(listener);
                if (index != -1)
                {
                    this._dirtyForwardListeners.splice(index, 1);
                    return;
                }
            }
            if (this._dirtyBackwardListeners)
            {
                index = this._dirtyBackwardListeners.indexOf(listener);
                if (index != -1)
                {
                    this._dirtyBackwardListeners.splice(index, 1);
                    return;
                }
            }
            assert(false);
        }

        private _listeners: Array<IEventListener<TEvent>>;
        private _dirtyForwardListeners?: Array<IEventListener<TEvent>>;
        private _dirtyBackwardListeners?: Array<IEventListener<TEvent>>;
        private _dirtyRemoveListeners?: Array<IEventListener<TEvent>>;
        private _isEmited: boolean = false;
    }

    export class ModuleInteger
    {
        constructor(value: number = 0)
        {
            this._value = value;
        }

        public get value(): number
        {
            return this._value;
        }
        public inc(): number
        {
            this._value = toInt(this._value) % ModuleInteger._module + 1;
            return this._value;
        }

        private _value: number;
        private static readonly _module: number = 1000000;
    }

    export class Pulse
    {
        constructor()
        {
            this._revision = new ModuleInteger();
            this._receiptors = {};
        }

        public set(): void
        {
            this._revision.inc();
        }
        public get(receiptor: string)
        {
            if (this._receiptors[receiptor] == null)
            {
                this._receiptors[receiptor] = this._revision.value;
                return this._revision.value != 0;
            }
            else
            {
                const ret = this._receiptors[receiptor] != this._revision.value;
                this._receiptors[receiptor] = this._revision.value;
                return ret;
            }
        }

        private _revision: ModuleInteger;
        private _receiptors: Record<string, number>;
    }

    class Binder<TObject, TEvent extends Event> implements IEventListener<TEvent>
    {
        constructor(obj: TObject, callback: EventCallback<TEvent>, event_source: MulticastEvent<TEvent>)
        {
            assert(obj);
            assert(callback);
            this._callback = callback.bind(obj);
            this._eventSource = event_source;
        }

        public onEvent(event: TEvent): void
        {
            this._callback(event);
        }
        public dispose(): void
        {
            this._eventSource.remove(this);
        }

        private _callback: EventCallback<TEvent>;
        private _eventSource: MulticastEvent<TEvent>;
    }

    export abstract class Point
    {
        public static make(x: number, y: number): IPoint
        {
            return { x: x, y: y };
        }
        public static add(left: IPoint, right: IPoint): IPoint
        {
            return Point.make(left.x + right.x, left.y + right.y);
        }
        public static sub(left: IPoint, right: IPoint): IPoint
        {
            return Point.make(left.x - right.x, left.y - right.y);
        }
        public static top(p1: IPoint, p2: IPoint): number
        {
            return Math.min(p1.y, p2.y);
        }
        public static bottom(p1: IPoint, p2: IPoint): number
        {
            return Math.max(p1.y, p2.y);
        }
        public static left(p1: IPoint, p2: IPoint): number
        {
            return Math.min(p1.x, p2.x);
        }
        public static right(p1: IPoint, p2: IPoint): number
        {
            return Math.max(p1.x, p2.x);
        }
        public static isEmpty(point: IPoint): boolean
        {
            return isNaN(point.x) && isNaN(point.y);
        }

        public static get empty(): IPoint
        {
            return Point.make(NaN, NaN);
        }
    }

    export type modifier<T> = (value: T) => T;

    export type binding<T> = T | modifier<T>;

    const ModifiablePropertyCalcRevision = new ModuleInteger();
    const InitiaizeRevision: number = -1;

    export function UpdateCalcRevision(): void
    {
        ModifiablePropertyCalcRevision.inc();
    }

    export class ModifiableProperty<T>
    {
        constructor(value: T);
        constructor(modifier: modifier<T>, value: T);
        constructor(...args: any[])
        {
            switch (args.length)
            {
                case 1:
                    this._value = args[0] as T;
                    break;
                case 2:
                    this.addModifier(args[0] as modifier<T>);
                    this._value = args[1] as T;
                    break;
                default:
                    assert(false);
            }

            this._calcRevision = InitiaizeRevision;
        }

        public get value(): T
        {
            if (this._calcRevision == ModifiablePropertyCalcRevision.value)
            {
                return this._calcValue!;
            }
            else
            {
                let ret: T = this._value;
                if (this._modifiers)
                {
                    for (const m of this._modifiers)
                    {
                        ret = m(ret);
                    }
                }
                this._calcValue = ret;
                this._calcRevision = ModifiablePropertyCalcRevision.value;
                return ret;
            }
        }
        public set value(value: T)
        {
            this._value = value;
            if (this._calcRevision != null)
            {
                this._calcRevision = InitiaizeRevision;
            }
        }

        public addModifier(modifier: modifier<T>)
        {
            if (!this._modifiers)
            {
                this._modifiers = new Array<modifier<T>>();
            }
            this._modifiers.push(modifier);
            if (this._calcRevision != null)
            {
                this._calcRevision = InitiaizeRevision;
            }
        }
        public addBinding(binding: binding<T>): void
        {
            if (typeof binding == 'function')
            {
                this.addModifier(binding as modifier<T>);
            }
            else
            {
                this.value = binding as T;
            }
        }
        public reset(value?: T): void
        {
            this._modifiers = [];
            if (value !== undefined)
            {
                this.value = value;
            }
            if (this._calcRevision != null)
            {
                this._calcRevision = InitiaizeRevision;
            }
        }

        private _modifiers?: Array<modifier<T>>;
        private _value: T;
        private _calcValue?: T;
        private _calcRevision?: number;
    }

    export class Box
    {
        constructor(x?: binding<number>, y?: binding<number>, w?: binding<number>, h?: binding<number>)
        {
            this._x = makeProp<number>(x, 0);
            this._y = makeProp<number>(y, 0);
            this._w = makeProp<number>(w, 0);
            this._h = makeProp<number>(h, 0);
        }

        public get x(): number
        {
            return this._x.value;
        }
        public set x(value: number)
        {
            this._x.value = value;
        }
        public get y(): number
        {
            return this._y.value;
        }
        public set y(value: number)
        {
            this._y.value = value;
        }
        public get w(): number
        {
            return this._w.value;
        }
        public set w(value: number)
        {
            this._w.value = value;
        }
        public get h(): number
        {
            return this._h.value;
        }
        public set h(value: number)
        {
            this._h.value = value;
        }

        public get top(): number
        {
            return this.y;
        }
        public get left(): number
        {
            return this.x;
        }
        public get right(): number
        {
            return this.x + this.w;
        }
        public get bottom(): number
        {
            return this.y + this.h;
        }
        public get middleY(): number
        {
            return this.y + this.h / 2;
        }
        public get middleX(): number
        {
            return this.x + this.w / 2;
        }

        public addX(modifier: modifier<number>)
        {
            this._x.addModifier(modifier);
        }
        public addY(modifier: modifier<number>)
        {
            this._y.addModifier(modifier);
        }
        public addW(modifier: modifier<number>)
        {
            this._w.addModifier(modifier);
        }
        public addH(modifier: modifier<number>)
        {
            this._h.addModifier(modifier);
        }
        public mouseHit(point: IPoint): boolean
        {
            return this.left <= point.x &&
                this.right >= point.x &&
                this.top <= point.y &&
                this.bottom >= point.y;
        }
        public isCover(other: Box): boolean
        {
            return this.left <= other.left && this.right >= other.right &&
                this.top <= other.top && this.bottom >= other.bottom;
        }

        protected clear(): void
        {
            this._x.reset();
            this._y.reset();
            this._w.reset();
            this._h.reset();
        }

        private _x: ModifiableProperty<number>;
        private _y: ModifiableProperty<number>;
        private _w: ModifiableProperty<number>;
        private _h: ModifiableProperty<number>;
    }

    export class SerializeHelper
    {
        public static joinData(data: Array<string>, separator: string): string
        {
            assert(separator != SerializeHelper._escaper, `Unsupported value of separator '${separator}'`);
            for (let i = 0; i < data.length; i++)
            {
                let chunck = data[i];
                let escaped = false;
                if (SerializeHelper.contains(chunck, SerializeHelper._escaper))
                {
                    chunck = chunck.replaceAll(SerializeHelper._escaper, `${SerializeHelper._escaper}${SerializeHelper._escaper}`);
                    escaped = true;
                }

                if (SerializeHelper.contains(chunck, separator))
                {
                    chunck = chunck.replaceAll(separator, `${SerializeHelper._escaper}${separator}`);
                    escaped = true;
                }

                if (escaped)
                {
                    data[i] = chunck;
                }
            }
            return data.join(separator);
        }

        public static splitData(data: string, separator: string): Array<string>
        {
            assert(separator != SerializeHelper._escaper, `Unsupported value of separator '${separator}'`);
            const double_escape_placeholder = `🕓🕔`;
            const escape_placeholder = `🕤🕥`;
            assert(separator != escape_placeholder);
            assert(separator != double_escape_placeholder);
            assert(!SerializeHelper.contains(data, escape_placeholder));
            assert(!SerializeHelper.contains(data, double_escape_placeholder));
            const double_escaped = SerializeHelper.contains(data, `${SerializeHelper._escaper}${SerializeHelper._escaper}`);
            if (double_escaped)
            {
                data = data.replaceAll(`${SerializeHelper._escaper}${SerializeHelper._escaper}`, double_escape_placeholder)
            }
            const escaped = SerializeHelper.contains(data, `${SerializeHelper._escaper}${separator}`);
            if (escaped)
            {
                data = data.replaceAll(`${SerializeHelper._escaper}${separator}`, escape_placeholder);
            }

            const ret = data.split(separator);
            if (double_escaped || escaped)
            {
                for (let i = 0; i < ret.length; i++)
                {
                    ret[i] = ret[i].replaceAll(escape_placeholder, separator).replaceAll(double_escape_placeholder, SerializeHelper._escaper);
                }
            }
            return ret;
        }

        private static contains(text: string, pattern: string): boolean
        {
            return text.indexOf(pattern) > -1;
        }

        private static _escaper: string = `?`;
    }

    export function getArg<T extends number | string | boolean>(args: any[], index: number, default_value: T): T
    {
        return (args && args.length > index) ? args[index] as T : default_value;
    }

    export function makeProp<T>(binding?: binding<T>, default_value?: T): ModifiableProperty<T>
    {
        if (typeof binding == 'function')
        {
            assert(default_value !== undefined);
            return new ModifiableProperty<T>(binding as modifier<T>, default_value);
        }
        else if (binding != undefined)
        {
            return new ModifiableProperty<T>(binding as T);
        }
        else
        {
            assert(default_value !== undefined);
            return new ModifiableProperty<T>(default_value);
        }
    }

    export function makeMod<TObj, TValue>(obj: TObj, func: modifier<TValue>): modifier<TValue>
    {
        return func.bind(obj);
    }

    export function toInt(value: number | string): number
    {
        if (typeof value == 'string')
        {
            return toInt(+value);
        }
        else
        {
            return Math.trunc(value);
        }
    }

    export function toFixed(value: number, digits: number): string
    {
        return parseFloat(value.toFixed(digits)).toString();
    }

    export function CompareCaseInsensitive(a: string, b: string): number
    {
        //https://stackoverflow.com/a/2140723
        return a.localeCompare(b, undefined, { sensitivity: 'accent' });
    }

    export function limit(value: number, bound1: number, bound2: number): number
    {
        if (bound1 < bound2)
        {
            return Math.min(Math.max(bound1, value), bound2);
        }
        else
        {
            return Math.min(Math.max(bound2, value), bound1);
        }
    }

    export function evaluate<TThis, TRet>(context: TThis, code: string): TRet
    {
        return function () { return eval(code); }.call(context) as TRet;
    }

    export function makeEvaluator(context: ICodeEvaluatorContext, code: string): Function
    {
        return evaluate<ICodeEvaluatorContext, Function>(context, `(function() { "use strict"; return ${code}; }).bind(this)`);
    }

    export function formatString(format: string, ...args: string[]): string
    {
        //Conception: https://stackoverflow.com/a/4673436
        return format.replace(/{(\d+)}/g, (match, number): string => args[number] != undefined ? args[number] : match);
    }
}