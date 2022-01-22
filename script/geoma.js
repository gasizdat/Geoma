"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var Geoma;
(function (Geoma) {
    var Utils;
    (function (Utils) {
        var AssertionError = (function (_super) {
            __extends(AssertionError, _super);
            function AssertionError() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            return AssertionError;
        }(Error));
        function assert(condition, msg) {
            if (!condition) {
                var alert_message = msg !== null && msg !== void 0 ? msg : "Logic error. If you see this, then something gone wrong way ):";
                var stack = (new Error).stack;
                if (stack) {
                    alert_message += "\n" + stack;
                }
                console.log(alert_message);
                window.alert(alert_message);
                throw new AssertionError(alert_message);
            }
        }
        Utils.assert = assert;
        function toRad(deg) {
            return deg * Math.PI / 180;
        }
        Utils.toRad = toRad;
        function toDeg(rad) {
            return rad * 180 / Math.PI;
        }
        Utils.toDeg = toDeg;
        function isInstanceOfAny(ctors, instance) {
            for (var _i = 0, ctors_1 = ctors; _i < ctors_1.length; _i++) {
                var ctor = ctors_1[_i];
                if (instance instanceof ctor) {
                    return true;
                }
            }
            return false;
        }
        Utils.isInstanceOfAny = isInstanceOfAny;
        var MulticastEvent = (function () {
            function MulticastEvent() {
                this._isEmited = false;
                this._listeners = new Array();
            }
            MulticastEvent.prototype.emitEvent = function (event) {
                var _a, _b;
                this._isEmited = true;
                var ret = true;
                for (var _i = 0, _c = this._listeners; _i < _c.length; _i++) {
                    var listener = _c[_i];
                    if (listener) {
                        listener.onEvent(event);
                        if (event.cancelable && event.cancelBubble) {
                            ret = false;
                            break;
                        }
                    }
                }
                if (this._dirtyRemoveListeners) {
                    for (var _d = 0, _e = this._dirtyRemoveListeners; _d < _e.length; _d++) {
                        var listener = _e[_d];
                        var index = this._listeners.indexOf(listener);
                        assert(index != -1);
                        this._listeners.splice(index, 1);
                    }
                    delete this._dirtyRemoveListeners;
                }
                if (this._dirtyForwardListeners) {
                    (_a = this._listeners).unshift.apply(_a, this._dirtyForwardListeners);
                    delete this._dirtyForwardListeners;
                }
                if (this._dirtyBackwardListeners) {
                    (_b = this._listeners).push.apply(_b, this._dirtyBackwardListeners);
                    delete this._dirtyBackwardListeners;
                }
                this._isEmited = false;
                return ret;
            };
            MulticastEvent.prototype.bindListener = function (listener, forward) {
                assert(listener);
                var listeners = this._listeners;
                if (this._isEmited) {
                    if (forward) {
                        if (!this._dirtyForwardListeners) {
                            this._dirtyForwardListeners = new Array();
                        }
                        listeners = this._dirtyForwardListeners;
                    }
                    else {
                        if (!this._dirtyBackwardListeners) {
                            this._dirtyBackwardListeners = new Array();
                        }
                        listeners = this._dirtyBackwardListeners;
                    }
                }
                assert(listeners.indexOf(listener) == -1);
                if (forward) {
                    listeners.unshift(listener);
                }
                else {
                    listeners.push(listener);
                }
            };
            MulticastEvent.prototype.bind = function (obj, callback, forward) {
                var ret = new Binder(obj, callback, this);
                this.bindListener(ret, forward);
                return ret;
            };
            MulticastEvent.prototype.connect = function () {
                var _this = this;
                return function (event) { return _this.emitEvent(event); };
            };
            MulticastEvent.prototype.remove = function (listener) {
                var index = this._listeners.indexOf(listener);
                if (index != -1) {
                    if (this._isEmited) {
                        if (!this._dirtyRemoveListeners) {
                            this._dirtyRemoveListeners = [];
                        }
                        this._dirtyRemoveListeners.push(listener);
                    }
                    else {
                        this._listeners.splice(index, 1);
                    }
                    return;
                }
                if (this._dirtyForwardListeners) {
                    index = this._dirtyForwardListeners.indexOf(listener);
                    if (index != -1) {
                        this._dirtyForwardListeners.splice(index, 1);
                        return;
                    }
                }
                if (this._dirtyBackwardListeners) {
                    index = this._dirtyBackwardListeners.indexOf(listener);
                    if (index != -1) {
                        this._dirtyBackwardListeners.splice(index, 1);
                        return;
                    }
                }
                assert(false);
            };
            return MulticastEvent;
        }());
        Utils.MulticastEvent = MulticastEvent;
        var ModuleInteger = (function () {
            function ModuleInteger(value) {
                if (value === void 0) { value = 0; }
                this._value = value;
            }
            Object.defineProperty(ModuleInteger.prototype, "value", {
                get: function () {
                    return this._value;
                },
                enumerable: false,
                configurable: true
            });
            ModuleInteger.prototype.inc = function () {
                this._value = toInt(this._value) % ModuleInteger._module + 1;
                return this._value;
            };
            ModuleInteger._module = 1000000;
            return ModuleInteger;
        }());
        Utils.ModuleInteger = ModuleInteger;
        var Pulse = (function () {
            function Pulse() {
                this._revision = new ModuleInteger();
                this._receiptors = {};
            }
            Pulse.prototype.set = function () {
                this._revision.inc();
            };
            Pulse.prototype.get = function (receiptor) {
                if (this._receiptors[receiptor] == null) {
                    this._receiptors[receiptor] = this._revision.value;
                    return this._revision.value != 0;
                }
                else {
                    var ret = this._receiptors[receiptor] != this._revision.value;
                    this._receiptors[receiptor] = this._revision.value;
                    return ret;
                }
            };
            return Pulse;
        }());
        Utils.Pulse = Pulse;
        var Binder = (function () {
            function Binder(obj, callback, event_source) {
                assert(obj);
                assert(callback);
                this._callback = callback.bind(obj);
                this._eventSource = event_source;
            }
            Binder.prototype.onEvent = function (event) {
                this._callback(event);
            };
            Binder.prototype.dispose = function () {
                this._eventSource.remove(this);
            };
            return Binder;
        }());
        var Point = (function () {
            function Point() {
            }
            Point.make = function (x, y) {
                return { x: x, y: y };
            };
            Point.add = function (left, right) {
                return Point.make(left.x + right.x, left.y + right.y);
            };
            Point.sub = function (left, right) {
                return Point.make(left.x - right.x, left.y - right.y);
            };
            Point.top = function (p1, p2) {
                return Math.min(p1.y, p2.y);
            };
            Point.bottom = function (p1, p2) {
                return Math.max(p1.y, p2.y);
            };
            Point.left = function (p1, p2) {
                return Math.min(p1.x, p2.x);
            };
            Point.right = function (p1, p2) {
                return Math.max(p1.x, p2.x);
            };
            Point.isEmpty = function (point) {
                return isNaN(point.x) && isNaN(point.y);
            };
            Object.defineProperty(Point, "empty", {
                get: function () {
                    return Point.make(NaN, NaN);
                },
                enumerable: false,
                configurable: true
            });
            return Point;
        }());
        Utils.Point = Point;
        var ModifiablePropertyCalcRevision = undefined;
        var InitiaizeRevision = -1;
        var CalcsCount = 0;
        function InitializeCalcRevision() {
            ModifiablePropertyCalcRevision = 0;
        }
        Utils.InitializeCalcRevision = InitializeCalcRevision;
        function UpdateCalcRevision() {
            assert(ModifiablePropertyCalcRevision != null);
            ModifiablePropertyCalcRevision = (ModifiablePropertyCalcRevision + 1) % 1000;
        }
        Utils.UpdateCalcRevision = UpdateCalcRevision;
        function GetCaclsCount() {
            var ret = CalcsCount;
            CalcsCount = 0;
            return ret;
        }
        Utils.GetCaclsCount = GetCaclsCount;
        var ModifiableProperty = (function () {
            function ModifiableProperty() {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                switch (args.length) {
                    case 1:
                        this._value = args[0];
                        break;
                    case 2:
                        this.addModifier(args[0]);
                        this._value = args[1];
                        break;
                    default:
                        assert(false);
                }
                if (ModifiablePropertyCalcRevision != undefined) {
                    this._calcRevision = InitiaizeRevision;
                }
            }
            Object.defineProperty(ModifiableProperty.prototype, "value", {
                get: function () {
                    if (ModifiablePropertyCalcRevision != undefined && this._calcRevision == ModifiablePropertyCalcRevision) {
                        return this._calcValue;
                    }
                    else {
                        var ret = this._value;
                        if (this._modifiers) {
                            for (var _i = 0, _a = this._modifiers; _i < _a.length; _i++) {
                                var m = _a[_i];
                                ret = m(ret);
                            }
                        }
                        this._calcValue = ret;
                        this._calcRevision = ModifiablePropertyCalcRevision;
                        return ret;
                    }
                },
                set: function (value) {
                    this._value = value;
                    if (this._calcRevision != null) {
                        this._calcRevision = InitiaizeRevision;
                    }
                },
                enumerable: false,
                configurable: true
            });
            ModifiableProperty.prototype.addModifier = function (modifier) {
                if (!this._modifiers) {
                    this._modifiers = new Array();
                }
                this._modifiers.push(modifier);
                if (this._calcRevision != null) {
                    this._calcRevision = InitiaizeRevision;
                }
            };
            ModifiableProperty.prototype.addBinding = function (binding) {
                if (typeof binding == 'function') {
                    this.addModifier(binding);
                }
                else {
                    this.value = binding;
                }
            };
            ModifiableProperty.prototype.reset = function (value) {
                this._modifiers = [];
                if (value !== undefined) {
                    this.value = value;
                }
                if (this._calcRevision != null) {
                    this._calcRevision = InitiaizeRevision;
                }
            };
            return ModifiableProperty;
        }());
        Utils.ModifiableProperty = ModifiableProperty;
        var Box = (function () {
            function Box(x, y, w, h) {
                this._x = makeProp(x, 0);
                this._y = makeProp(y, 0);
                this._w = makeProp(w, 0);
                this._h = makeProp(h, 0);
            }
            Object.defineProperty(Box.prototype, "x", {
                get: function () {
                    return this._x.value;
                },
                set: function (value) {
                    this._x.value = value;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(Box.prototype, "y", {
                get: function () {
                    return this._y.value;
                },
                set: function (value) {
                    this._y.value = value;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(Box.prototype, "w", {
                get: function () {
                    return this._w.value;
                },
                set: function (value) {
                    this._w.value = value;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(Box.prototype, "h", {
                get: function () {
                    return this._h.value;
                },
                set: function (value) {
                    this._h.value = value;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(Box.prototype, "top", {
                get: function () {
                    return this.y;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(Box.prototype, "left", {
                get: function () {
                    return this.x;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(Box.prototype, "right", {
                get: function () {
                    return this.x + this.w;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(Box.prototype, "bottom", {
                get: function () {
                    return this.y + this.h;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(Box.prototype, "middleY", {
                get: function () {
                    return this.y + this.h / 2;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(Box.prototype, "middleX", {
                get: function () {
                    return this.x + this.w / 2;
                },
                enumerable: false,
                configurable: true
            });
            Box.prototype.addX = function (modifier) {
                this._x.addModifier(modifier);
            };
            Box.prototype.addY = function (modifier) {
                this._y.addModifier(modifier);
            };
            Box.prototype.addW = function (modifier) {
                this._w.addModifier(modifier);
            };
            Box.prototype.addH = function (modifier) {
                this._h.addModifier(modifier);
            };
            Box.prototype.mouseHit = function (point) {
                return this.left <= point.x &&
                    this.right >= point.x &&
                    this.top <= point.y &&
                    this.bottom >= point.y;
            };
            Box.prototype.isCover = function (other) {
                return this.left <= other.left && this.right >= other.right &&
                    this.top <= other.top && this.bottom >= other.bottom;
            };
            Box.prototype.clear = function () {
                this._x.reset();
                this._y.reset();
                this._w.reset();
                this._h.reset();
            };
            return Box;
        }());
        Utils.Box = Box;
        var SerializeHelper = (function () {
            function SerializeHelper() {
            }
            SerializeHelper.joinData = function (data, separator) {
                assert(separator != SerializeHelper._escaper, "Unsupported value of separator '" + separator + "'");
                for (var i = 0; i < data.length; i++) {
                    var chunck = data[i];
                    var escaped = false;
                    if (SerializeHelper.contains(chunck, SerializeHelper._escaper)) {
                        chunck = chunck.replaceAll(SerializeHelper._escaper, "" + SerializeHelper._escaper + SerializeHelper._escaper);
                        escaped = true;
                    }
                    if (SerializeHelper.contains(chunck, separator)) {
                        chunck = chunck.replaceAll(separator, "" + SerializeHelper._escaper + separator);
                        escaped = true;
                    }
                    if (escaped) {
                        data[i] = chunck;
                    }
                }
                return data.join(separator);
            };
            SerializeHelper.splitData = function (data, separator) {
                assert(separator != SerializeHelper._escaper, "Unsupported value of separator '" + separator + "'");
                var double_escape_placeholder = "\uD83D\uDD53\uD83D\uDD54";
                var escape_placeholder = "\uD83D\uDD64\uD83D\uDD65";
                assert(separator != escape_placeholder);
                assert(separator != double_escape_placeholder);
                assert(!SerializeHelper.contains(data, escape_placeholder));
                assert(!SerializeHelper.contains(data, double_escape_placeholder));
                var double_escaped = SerializeHelper.contains(data, "" + SerializeHelper._escaper + SerializeHelper._escaper);
                if (double_escaped) {
                    data = data.replaceAll("" + SerializeHelper._escaper + SerializeHelper._escaper, double_escape_placeholder);
                }
                var escaped = SerializeHelper.contains(data, "" + SerializeHelper._escaper + separator);
                if (escaped) {
                    data = data.replaceAll("" + SerializeHelper._escaper + separator, escape_placeholder);
                }
                var ret = data.split(separator);
                if (double_escaped || escaped) {
                    for (var i = 0; i < ret.length; i++) {
                        ret[i] = ret[i].replaceAll(escape_placeholder, separator).replaceAll(double_escape_placeholder, SerializeHelper._escaper);
                    }
                }
                return ret;
            };
            SerializeHelper.contains = function (text, pattern) {
                return text.indexOf(pattern) > -1;
            };
            SerializeHelper._escaper = "?";
            return SerializeHelper;
        }());
        Utils.SerializeHelper = SerializeHelper;
        function getArg(args, index, default_value) {
            return (args && args.length > index) ? args[index] : default_value;
        }
        Utils.getArg = getArg;
        function makeProp(binding, default_value) {
            if (typeof binding == 'function') {
                assert(default_value !== undefined);
                return new ModifiableProperty(binding, default_value);
            }
            else if (binding != undefined) {
                return new ModifiableProperty(binding);
            }
            else {
                assert(default_value !== undefined);
                return new ModifiableProperty(default_value);
            }
        }
        Utils.makeProp = makeProp;
        function makeMod(obj, func) {
            return func.bind(obj);
        }
        Utils.makeMod = makeMod;
        function toInt(value) {
            if (typeof value == 'string') {
                return toInt(+value);
            }
            else {
                return Math.trunc(value);
            }
        }
        Utils.toInt = toInt;
        function toFixed(value, digits) {
            return parseFloat(value.toFixed(digits)).toString();
        }
        Utils.toFixed = toFixed;
        function CompareCaseInsensitive(a, b) {
            return a.localeCompare(b, undefined, { sensitivity: 'accent' });
        }
        Utils.CompareCaseInsensitive = CompareCaseInsensitive;
        function limit(value, bound1, bound2) {
            if (bound1 < bound2) {
                return Math.min(Math.max(bound1, value), bound2);
            }
            else {
                return Math.min(Math.max(bound2, value), bound1);
            }
        }
        Utils.limit = limit;
        function evaluate(context, code) {
            return function () { return eval(code); }.call(context);
        }
        Utils.evaluate = evaluate;
        function makeEvaluator(context, code) {
            return evaluate(context, "(function() { \"use strict\"; return " + code + "; }).bind(this)");
        }
        Utils.makeEvaluator = makeEvaluator;
        function formatString(format) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            return format.replace(/{(\d+)}/g, function (match, number) { return args[number] != undefined ? args[number] : match; });
        }
        Utils.formatString = formatString;
    })(Utils = Geoma.Utils || (Geoma.Utils = {}));
})(Geoma || (Geoma = {}));
var Geoma;
(function (Geoma) {
    var Latex;
    (function (Latex) {
        var LatexEngine = (function () {
            function LatexEngine() {
                this.disabled = false;
                this.queue = [];
                this.existingFormulas = new Map();
            }
            LatexEngine.prototype.getRenderedImage = function (formula) {
                return this.existingFormulas.get(formula);
            };
            LatexEngine.prototype.mathContainerUpdate = function () {
                var _this = this;
                var container = document.getElementById("mathContainer");
                if (container) {
                    var select = container.querySelector("svg");
                    if (select) {
                        var data = select.outerHTML;
                        var DOMURL = window.URL || window.webkitURL || window;
                        var img_1 = new Image();
                        var svg = new Blob([data], {
                            type: 'image/svg+xml;charset=utf-8'
                        });
                        var url = DOMURL.createObjectURL(svg);
                        img_1.onload = (function () {
                            if (_this.queue.length) {
                                _this.existingFormulas.set(_this.queue[0].formula, img_1);
                                _this.drawImageFromQueue();
                            }
                        }).bind(this);
                        img_1.src = url;
                    }
                }
            };
            LatexEngine.prototype.drawLatex = function (formula, x, y, scale, ctx) {
                this.queue.push({ formula: formula, x: x, y: y, ctx: ctx, scale: scale });
                if (this.queue.length == 1) {
                    this.drawLatexFromQueue();
                }
            };
            LatexEngine.prototype.drawImageFromQueue = function () {
                var imgData = this.queue[0];
                var img = this.existingFormulas.get(imgData.formula);
                imgData.ctx.save();
                imgData.ctx.transform(1, 0, 0, 1, 0, 0);
                imgData.ctx.drawImage(img, imgData.x, imgData.y, img.width * imgData.scale, img.height * imgData.scale);
                imgData.ctx.restore();
                this.queue.shift();
                this.drawLatexFromQueue();
            };
            LatexEngine.prototype.drawLatexFromQueue = function () {
                if (this.queue.length) {
                    var container = document.getElementById("mathContainer");
                    var imgData = this.queue[0];
                    if (container) {
                        if (!this.existingFormulas.has(imgData.formula)) {
                            container.innerHTML = "$" + imgData.formula + "$";
                        }
                        else {
                            this.drawImageFromQueue();
                        }
                    }
                }
            };
            return LatexEngine;
        }());
        Latex.LatexEngine = LatexEngine;
    })(Latex = Geoma.Latex || (Geoma.Latex = {}));
})(Geoma || (Geoma = {}));
var Geoma;
(function (Geoma) {
    var MulticastEvent = Geoma.Utils.MulticastEvent;
    var Point = Geoma.Utils.Point;
    var assert = Geoma.Utils.assert;
    var PlayGround = (function (_super) {
        __extends(PlayGround, _super);
        function PlayGround(canvas) {
            var _this = _super.call(this, 0, 0) || this;
            _this.onMouseMove = new MulticastEvent();
            _this.onMouseDown = new MulticastEvent();
            _this.onMouseUp = new MulticastEvent();
            _this.onMouseClick = new MulticastEvent();
            _this._touchInterface = false;
            _this._mousePoint = Point.make(0, 0);
            _this._downPoint = Point.make(0, 0);
            _this._offset = Point.make(0, 0);
            assert(canvas);
            _this._canvas = canvas;
            var mouse_pointed_device = ("onmousemove" in window);
            var touch_screen_device = ("ontouchstart" in window) ||
                (navigator.maxTouchPoints > 0);
            if (touch_screen_device) {
                _this._touchInterface = true;
                console.log("The touchsreen device.");
                _this._canvas.ontouchmove = (function (touch_event) {
                    for (var i = 0; i < touch_event.targetTouches.length; i++) {
                        var touch = touch_event.targetTouches[i];
                        var mouse_data = PlayGround.touchToMouseEventInit(touch_event, touch);
                        Geoma.Tools.Thickness.setMouseThickness(Math.max(touch.radiusX, touch.radiusY));
                        _this.mouseMove(new MouseEvent("mousemove", mouse_data));
                    }
                }).bind(_this);
                _this._canvas.ontouchstart = (function (touch_event) {
                    for (var i = 0; i < touch_event.targetTouches.length; i++) {
                        var touch = touch_event.targetTouches[i];
                        var mouse_data = PlayGround.touchToMouseEventInit(touch_event, touch);
                        Geoma.Tools.Thickness.setMouseThickness(Math.max(touch.radiusX, touch.radiusY));
                        var mouse_event = new MouseEvent("mousedown", mouse_data);
                        if (_this.mousePoint.x != mouse_event.x || _this.mousePoint.y != mouse_event.y) {
                            _this.mouseMove(mouse_event);
                            if (mouse_event.cancelBubble) {
                                mouse_event = new MouseEvent("mousedown", mouse_data);
                            }
                        }
                        _this.mouseDown(mouse_event);
                    }
                }).bind(_this);
                _this._canvas.ontouchend = (function (touch_event) {
                    for (var i = 0; i < touch_event.changedTouches.length; i++) {
                        var touch = touch_event.changedTouches[i];
                        var mouse_data = PlayGround.touchToMouseEventInit(touch_event, touch);
                        Geoma.Tools.Thickness.setMouseThickness(Math.max(touch.radiusX, touch.radiusY));
                        var mouse_event = new MouseEvent("mouseup", mouse_data);
                        if (_this.mousePoint.x != mouse_event.x || _this.mousePoint.y != mouse_event.y) {
                            _this.mouseMove(mouse_event);
                            if (mouse_event.cancelBubble) {
                                mouse_event = new MouseEvent("mouseup", mouse_data);
                            }
                        }
                        _this.mouseUp(mouse_event);
                    }
                }).bind(_this);
            }
            else if (mouse_pointed_device) {
                console.log("The device with mouse or touchpad.");
                _this._canvas.onmousemove = _this.mouseMove.bind(_this);
                _this._canvas.onmousedown = _this.mouseDown.bind(_this);
                _this._canvas.onmouseup = _this.mouseUp.bind(_this);
            }
            else {
                assert(false, "The device doesn't have mouse or touchscreen");
            }
            _this.invalidate();
            _this.addX(Geoma.Utils.makeMod(_this, function (value) { return value - _this.offset.x; }));
            _this.addY(Geoma.Utils.makeMod(_this, function (value) { return value - _this.offset.y; }));
            _this.addW(Geoma.Utils.makeMod(_this, function () { return Math.trunc(_this._canvas.width / _this.ratio); }));
            _this.addH(Geoma.Utils.makeMod(_this, function () { return Math.trunc(_this._canvas.height / _this.ratio); }));
            var context2d = _this._canvas.getContext("2d");
            assert(context2d);
            _this._context2d = context2d;
            return _this;
        }
        Object.defineProperty(PlayGround.prototype, "right", {
            get: function () {
                return this.x + this.w + this.offset.x * 2;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(PlayGround.prototype, "bottom", {
            get: function () {
                return this.y + this.h + this.offset.y * 2;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(PlayGround.prototype, "offset", {
            get: function () {
                return this._offset;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(PlayGround.prototype, "touchInterface", {
            get: function () {
                return this._touchInterface;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(PlayGround.prototype, "mousePoint", {
            get: function () {
                return this._mousePoint;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(PlayGround.prototype, "context2d", {
            get: function () {
                return this._context2d;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(PlayGround.prototype, "ratio", {
            get: function () {
                var _a;
                return (_a = window.devicePixelRatio) !== null && _a !== void 0 ? _a : 1;
            },
            enumerable: false,
            configurable: true
        });
        PlayGround.prototype.invalidate = function () {
            var parent = this._canvas.parentElement;
            if (parent) {
                var ratio = this.ratio;
                this._canvas.width = parent.clientWidth * ratio;
                this._canvas.height = parent.clientHeight * ratio;
            }
        };
        PlayGround.prototype.setOffset = function (dx, dy) {
            this._offset = Point.make(dx, dy);
        };
        PlayGround.getPosition = function (el) {
            var x = 0;
            var y = 0;
            if (el.offsetParent) {
                x = el.offsetLeft;
                y = el.offsetTop;
                while (el = el.offsetParent) {
                    x += el.offsetLeft;
                    y += el.offsetTop;
                }
            }
            return Point.make(x, y);
        };
        PlayGround.prototype.updateMouseEvent = function (event) {
            var _a;
            var offset_x = event.offsetX + this.offset.x;
            var offset_y = event.offsetY + this.offset.y;
            if (event.x == offset_x && event.y == offset_y) {
                return event;
            }
            else {
                return new MouseEvent(event.type, {
                    view: (_a = event.view) !== null && _a !== void 0 ? _a : window,
                    altKey: event.altKey,
                    bubbles: event.bubbles,
                    button: event.button,
                    buttons: event.buttons,
                    cancelable: event.cancelable,
                    clientX: offset_x,
                    clientY: offset_y,
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
        };
        PlayGround.prototype.mouseMove = function (event) {
            var updated_event = this.updateMouseEvent(event);
            this._mousePoint = updated_event;
            this.onMouseMove.emitEvent(updated_event);
        };
        PlayGround.prototype.mouseDown = function (event) {
            var updated_event = this.updateMouseEvent(event);
            this._downPoint = updated_event;
            this.onMouseDown.emitEvent(updated_event);
        };
        PlayGround.prototype.mouseUp = function (event) {
            var updated_event = this.updateMouseEvent(event);
            var click_tolerance = 1;
            if (this._downPoint && Math.abs(this._downPoint.x - updated_event.x) <= click_tolerance && Math.abs(this._downPoint.y - updated_event.y) <= click_tolerance) {
                this.onMouseClick.emitEvent(updated_event);
            }
            this.onMouseUp.emitEvent(updated_event);
        };
        PlayGround.touchToMouseEventInit = function (touch_event, touch) {
            var _a;
            var dx = 0, dy = 0;
            if (touch_event.target instanceof HTMLElement) {
                dx = touch_event.target.offsetLeft;
                dy = touch_event.target.offsetTop;
            }
            return {
                view: (_a = touch_event.view) !== null && _a !== void 0 ? _a : window,
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
        };
        PlayGround.drawingSprites = 0;
        return PlayGround;
    }(Geoma.Utils.Box));
    Geoma.PlayGround = PlayGround;
})(Geoma || (Geoma = {}));
var Geoma;
(function (Geoma) {
    var Polygon;
    (function (Polygon) {
        var assert = Geoma.Utils.assert;
        var Box = Geoma.Utils.Box;
        var Ellipse = (function () {
            function Ellipse(pivote, radius_x, radius_y, start_angle, end_angle, anticlockwise) {
                this.path = new Path2D();
                assert(pivote);
                this.path.ellipse(pivote.x, pivote.y, radius_x, radius_y, 0, start_angle, end_angle, anticlockwise);
                this.box = new Box(pivote.x - radius_x, pivote.y - radius_y, radius_x * 2, radius_y * 2);
            }
            return Ellipse;
        }());
        Polygon.Ellipse = Ellipse;
        var Arc = (function () {
            function Arc(pivote, radius, start_angle, end_angle, anticlockwise) {
                this.path = new Path2D();
                assert(pivote);
                this.path.arc(pivote.x, pivote.y, radius, start_angle, end_angle, anticlockwise);
                this.box = new Box(pivote.x - radius, pivote.y - radius, radius * 2, radius * 2);
            }
            return Arc;
        }());
        Polygon.Arc = Arc;
        var CustomPath = (function () {
            function CustomPath(pivote, path_string) {
                this.path = new Path2D();
                assert(pivote);
                this.path = new Path2D(path_string);
                this.box = new Box(pivote.x, pivote.y);
            }
            return CustomPath;
        }());
        Polygon.CustomPath = CustomPath;
        var Line = (function () {
            function Line() {
                var points = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    points[_i] = arguments[_i];
                }
                this.path = new Path2D();
                assert(points.length >= 2);
                this.path.moveTo(points[0].x, points[0].y);
                this.box = new Box(points[0].x, points[0].y);
                for (var _a = 0, points_1 = points; _a < points_1.length; _a++) {
                    var point = points_1[_a];
                    this.path.lineTo(point.x, point.y);
                    if (this.box.x > point.x) {
                        this.box.x = point.x;
                    }
                    if (this.box.y > point.y) {
                        this.box.y = point.y;
                    }
                    var w = point.x - this.box.x;
                    var h = point.y - this.box.y;
                    if (this.box.w < w) {
                        this.box.w = w;
                    }
                    if (this.box.h < h) {
                        this.box.h = h;
                    }
                }
            }
            return Line;
        }());
        Polygon.Line = Line;
        var Rectangle = (function () {
            function Rectangle(box) {
                this.path = new Path2D();
                assert(box);
                this.path.rect(box.x, box.y, box.w, box.h);
                this.box = box;
            }
            return Rectangle;
        }());
        Polygon.Rectangle = Rectangle;
    })(Polygon = Geoma.Polygon || (Geoma.Polygon = {}));
})(Geoma || (Geoma = {}));
var Geoma;
(function (Geoma) {
    var Sprite;
    (function (Sprite_1) {
        var makeProp = Geoma.Utils.makeProp;
        var toInt = Geoma.Utils.toInt;
        var Point = Geoma.Utils.Point;
        var assert = Geoma.Utils.assert;
        var property = Geoma.Utils.ModifiableProperty;
        var Box = Geoma.Utils.Box;
        var DefaultBrush = "Black";
        var DefaultTextStyle = {
            font: "18px Arial", textBaseline: "top", direction: "inherit", textAlign: "left"
        };
        ;
        var Sprite = (function (_super) {
            __extends(Sprite, _super);
            function Sprite() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.draw = function (play_ground) {
                    if (_this.visible) {
                        if (_this.alpha < 1) {
                            var global_alpha = play_ground.context2d.globalAlpha;
                            play_ground.context2d.globalAlpha = _this.alpha;
                            _this.innerDraw(play_ground);
                            play_ground.context2d.globalAlpha = global_alpha;
                        }
                        else {
                            _this.innerDraw(play_ground);
                        }
                    }
                };
                _this._name = "";
                _this._disposed = false;
                _this._alpha = new property(1);
                _this._visible = new property(true);
                return _this;
            }
            Object.defineProperty(Sprite.prototype, "name", {
                get: function () {
                    return this._name;
                },
                set: function (value) {
                    this._name = value;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(Sprite.prototype, "alpha", {
                get: function () {
                    return this._alpha.value;
                },
                set: function (value) {
                    this._alpha.value = value;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(Sprite.prototype, "visible", {
                get: function () {
                    return this.getVisible();
                },
                set: function (value) {
                    this._visible.value = value;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(Sprite.prototype, "disposed", {
                get: function () {
                    return this._disposed;
                },
                enumerable: false,
                configurable: true
            });
            Sprite.prototype.addAlpha = function (modifier) {
                this._alpha.addModifier(modifier);
            };
            Sprite.prototype.addVisible = function (modifier) {
                this._visible.addModifier(modifier);
            };
            Sprite.prototype.resetVisible = function (value) {
                this._visible.reset(value);
            };
            Sprite.prototype.dispose = function () {
                this._disposed = true;
            };
            Sprite.prototype.resetAlpha = function (value) {
                this._alpha.reset(value);
            };
            Sprite.prototype.getVisible = function () {
                return this._visible.value;
            };
            return Sprite;
        }(Box));
        Sprite_1.Sprite = Sprite;
        var Container = (function (_super) {
            __extends(Container, _super);
            function Container() {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                var _this = _super.apply(this, args) || this;
                _this._sprites = new Array();
                _super.prototype.addX.call(_this, _this.xModifier.bind(_this));
                _super.prototype.addY.call(_this, _this.yModifier.bind(_this));
                _super.prototype.addW.call(_this, _this.wModifier.bind(_this));
                _super.prototype.addH.call(_this, _this.hModifier.bind(_this));
                return _this;
            }
            Object.defineProperty(Container.prototype, "length", {
                get: function () {
                    return this._sprites.length;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(Container.prototype, "first", {
                get: function () {
                    return this.length ? this.item(0) : null;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(Container.prototype, "last", {
                get: function () {
                    return this.length ? this.item(this.length - 1) : null;
                },
                enumerable: false,
                configurable: true
            });
            Container.prototype.item = function (index) {
                assert(index >= 0);
                assert(index < this._sprites.length);
                return this._sprites[index];
            };
            Container.prototype.push = function (sprite) {
                assert(sprite);
                assert(this._sprites.indexOf(sprite) == -1);
                this._sprites.push(sprite);
            };
            Container.prototype.remove = function (sprite) {
                assert(sprite);
                var index = this._sprites.indexOf(sprite);
                assert(index != -1);
                this._sprites.splice(index, 1);
            };
            Container.prototype.contains = function (sprite) {
                return this._sprites.indexOf(sprite) > -1;
            };
            Container.prototype.addX = function (modifier) {
                for (var _i = 0, _a = this._sprites; _i < _a.length; _i++) {
                    var sprite = _a[_i];
                    sprite.addX(modifier);
                }
            };
            Container.prototype.addY = function (modifier) {
                for (var _i = 0, _a = this._sprites; _i < _a.length; _i++) {
                    var sprite = _a[_i];
                    sprite.addY(modifier);
                }
            };
            Container.prototype.addW = function (modifier) {
                for (var _i = 0, _a = this._sprites; _i < _a.length; _i++) {
                    var sprite = _a[_i];
                    sprite.addW(modifier);
                }
            };
            Container.prototype.addH = function (modifier) {
                for (var _i = 0, _a = this._sprites; _i < _a.length; _i++) {
                    var sprite = _a[_i];
                    sprite.addH(modifier);
                }
            };
            Container.prototype.dispose = function () {
                for (var _i = 0, _a = this._sprites; _i < _a.length; _i++) {
                    var sprite = _a[_i];
                    sprite.dispose();
                }
                this._sprites.splice(0);
                _super.prototype.dispose.call(this);
            };
            Container.prototype.innerDraw = function (play_ground) {
                for (var _i = 0, _a = this._sprites; _i < _a.length; _i++) {
                    var sprite = _a[_i];
                    sprite.draw(play_ground);
                }
            };
            Container.prototype.xModifier = function (value) {
                var ret = value;
                if (this._sprites.length) {
                    ret = this._sprites[0].x;
                    for (var i = 1; i < this._sprites.length; i++) {
                        ret = Math.min(ret, this._sprites[i].x);
                    }
                }
                return ret;
            };
            Container.prototype.yModifier = function (value) {
                var ret = value;
                if (this._sprites.length) {
                    ret = this._sprites[0].y;
                    for (var i = 1; i < this._sprites.length; i++) {
                        ret = Math.min(ret, this._sprites[i].y);
                    }
                }
                return ret;
            };
            Container.prototype.wModifier = function (value) {
                if (this._sprites.length) {
                    var x = this._sprites[0].x;
                    var r = this._sprites[0].right;
                    for (var i = 1; i < this._sprites.length; i++) {
                        x = Math.min(x, this._sprites[i].x);
                        r = Math.max(r, this._sprites[i].right);
                    }
                    return r - x;
                }
                else {
                    return value;
                }
            };
            Container.prototype.hModifier = function (value) {
                if (this._sprites.length) {
                    var y = this._sprites[0].y;
                    var b = this._sprites[0].bottom;
                    for (var i = 1; i < this._sprites.length; i++) {
                        y = Math.min(y, this._sprites[i].y);
                        b = Math.max(b, this._sprites[i].bottom);
                    }
                    return b - y;
                }
                else {
                    return value;
                }
            };
            return Container;
        }(Sprite));
        Sprite_1.Container = Container;
        var ProxySprite = (function (_super) {
            __extends(ProxySprite, _super);
            function ProxySprite(sprite) {
                var _this = this;
                assert(sprite);
                _this = _super.call(this) || this;
                _this._item = sprite;
                return _this;
            }
            Object.defineProperty(ProxySprite.prototype, "x", {
                get: function () {
                    return this._item.x;
                },
                set: function (value) {
                    this._item.x = value;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(ProxySprite.prototype, "y", {
                get: function () {
                    return this._item.y;
                },
                set: function (value) {
                    this._item.y = value;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(ProxySprite.prototype, "w", {
                get: function () {
                    return this._item.w;
                },
                set: function (value) {
                    this._item.w = value;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(ProxySprite.prototype, "h", {
                get: function () {
                    return this._item.h;
                },
                set: function (value) {
                    this._item.h = value;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(ProxySprite.prototype, "visible", {
                get: function () {
                    return this._item.visible;
                },
                set: function (value) {
                    this._item.visible = value;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(ProxySprite.prototype, "alpha", {
                set: function (value) {
                    this._item.alpha = value;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(ProxySprite.prototype, "name", {
                get: function () {
                    return this._item.name;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(ProxySprite.prototype, "item", {
                get: function () {
                    return this._item;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(ProxySprite.prototype, "disposed", {
                get: function () {
                    return this._item.disposed;
                },
                enumerable: false,
                configurable: true
            });
            ProxySprite.prototype.dispose = function () {
                if (!this.disposed) {
                    this._item.dispose();
                    _super.prototype.dispose.call(this);
                }
            };
            ProxySprite.prototype.addX = function (modifier) {
                this._item.addX(modifier);
            };
            ProxySprite.prototype.addY = function (modifier) {
                this._item.addY(modifier);
            };
            ProxySprite.prototype.addW = function (modifier) {
                this._item.addW(modifier);
            };
            ProxySprite.prototype.addH = function (modifier) {
                this._item.addH(modifier);
            };
            ProxySprite.prototype.addAlpha = function (modifier) {
                this._item.addAlpha(modifier);
            };
            ProxySprite.prototype.addVisible = function (modifier) {
                this._item.addVisible(modifier);
            };
            ProxySprite.prototype.resetVisible = function (value) {
                this._item.resetVisible(value);
            };
            ProxySprite.prototype.mouseHit = function (point) {
                return this._item.mouseHit(point);
            };
            return ProxySprite;
        }(Sprite));
        Sprite_1.ProxySprite = ProxySprite;
        var Dragable = (function (_super) {
            __extends(Dragable, _super);
            function Dragable(mouse_area, sprite) {
                var _this = _super.call(this, sprite) || this;
                _this._mouseHover = false;
                _this._dx = 0;
                _this._dy = 0;
                _this._mouseMoveListener = mouse_area.onMouseMove.bind(_this, _this.mouseMove, true);
                _this._mouseDownListener = mouse_area.onMouseDown.bind(_this, _this.mouseDown, true);
                _this._mouseUpListener = mouse_area.onMouseUp.bind(_this, _this.mouseUp, true);
                sprite.addX((function (value) {
                    return value + _this._dx;
                }).bind(_this));
                sprite.addY((function (value) {
                    return value + _this._dy;
                }).bind(_this));
                return _this;
            }
            Dragable.prototype.mouseMove = function (event) {
                if (event.buttons == 0 && this.selectStyle) {
                    this._mouseHover = this.mouseHit(event);
                }
                if (this._dragStart) {
                    if (event.buttons != 0) {
                        var dpos = Point.sub(this._dragStart, event);
                        this._dx -= dpos.x;
                        this._dy -= dpos.y;
                        this._dragStart = event;
                        event.cancelBubble = true;
                    }
                    else {
                        this.mouseUp(event);
                    }
                }
            };
            Dragable.prototype.mouseDown = function (event) {
                if (this.mouseHit(event)) {
                    this._dragStart = event;
                }
            };
            Dragable.prototype.mouseUp = function (__event) {
                if (this._dragStart) {
                    delete this._dragStart;
                }
            };
            Dragable.prototype.dispose = function () {
                if (!this.disposed) {
                    this._mouseMoveListener.dispose();
                    this._mouseDownListener.dispose();
                    this._mouseUpListener.dispose();
                    _super.prototype.dispose.call(this);
                }
            };
            Dragable.prototype.move = function (dx, dy) {
                this._dx -= dx;
                this._dy -= dy;
            };
            Dragable.prototype.innerDraw = function (play_ground) {
                this.item.draw(play_ground);
                if (this._mouseHover) {
                    play_ground.context2d.lineWidth = 1;
                    if (this.selectStyle) {
                        play_ground.context2d.strokeStyle = this.selectStyle;
                    }
                    play_ground.context2d.strokeRect(toInt(this.x), toInt(this.y), toInt(this.w), toInt(this.h));
                }
            };
            return Dragable;
        }(ProxySprite));
        Sprite_1.Dragable = Dragable;
        var Rectangle = (function (_super) {
            __extends(Rectangle, _super);
            function Rectangle(x, y, width, height, brush) {
                var _this = _super.call(this, x, y, width, height) || this;
                _this.brush = makeProp(brush, DefaultBrush);
                return _this;
            }
            Rectangle.prototype.innerDraw = function (play_ground) {
                Geoma.PlayGround.drawingSprites++;
                if (this.brush) {
                    play_ground.context2d.fillStyle = this.brush.value;
                }
                play_ground.context2d.fillRect(toInt(this.x), toInt(this.y), toInt(this.w), toInt(this.h));
            };
            return Rectangle;
        }(Sprite));
        Sprite_1.Rectangle = Rectangle;
        var Text = (function (_super) {
            __extends(Text, _super);
            function Text(x, y, width, height, brush, style, text, fixWidth) {
                var _this = _super.call(this, x, y, width, height) || this;
                _this._width = 0;
                _this._height = 0;
                _this.brush = makeProp(brush, DefaultBrush);
                _this.style = makeProp(style, DefaultTextStyle);
                _this.text = makeProp(text, "");
                _this.fixWidth = makeProp(fixWidth, false).value;
                _this.strokeWidth = new property(0);
                _this.strokeBrush = new property("White");
                _this.addW((function (value) {
                    return _this.fixWidth ? value : Math.max(value, _this._width);
                }).bind(_this));
                _this.addH((function (value) {
                    return Math.max(value, _this._height);
                }).bind(_this));
                return _this;
            }
            Text.prototype.innerDraw = function (play_ground) {
                Geoma.PlayGround.drawingSprites++;
                if (this.brush) {
                    play_ground.context2d.fillStyle = this.brush.value;
                }
                var style = this.style.value;
                if (style) {
                    if (style.direction) {
                        play_ground.context2d.direction = style.direction;
                    }
                    if (style.font) {
                        play_ground.context2d.font = style.font;
                    }
                    if (style.textAlign) {
                        play_ground.context2d.textAlign = style.textAlign;
                    }
                    if (style.textBaseline) {
                        play_ground.context2d.textBaseline = style.textBaseline;
                    }
                }
                if (this.strokeWidth.value) {
                    play_ground.context2d.strokeStyle = this.strokeBrush.value;
                    play_ground.context2d.lineWidth = this.strokeWidth.value;
                    play_ground.context2d.strokeText(this.text.value, toInt(this.x), toInt(this.y));
                }
                if (this.fixWidth) {
                    play_ground.context2d.fillText(this.text.value, toInt(this.x), toInt(this.y), toInt(this.w));
                }
                else {
                    play_ground.context2d.fillText(this.text.value, toInt(this.x), toInt(this.y));
                }
                this._width = play_ground.context2d.measureText(this.text.value).width;
                this._height = play_ground.context2d.measureText("lIqg").actualBoundingBoxDescent;
            };
            return Text;
        }(Sprite));
        Sprite_1.Text = Text;
        var MultiLineText = (function (_super) {
            __extends(MultiLineText, _super);
            function MultiLineText(x, y, line_padding, fixWidth) {
                var _this = _super.call(this, x, y) || this;
                _this._measuredWidth = 0;
                _this._width = 0;
                _this._height = 0;
                _this.fixWidth = fixWidth == true;
                _this.textLines = new Array();
                _this._linePadding = makeProp(line_padding, 0);
                _this.addW((function (value) {
                    return _this.fixWidth ? value : Math.max(value, _this._width);
                }).bind(_this));
                _this.addH((function (value) {
                    return Math.max(value, _this._height);
                }).bind(_this));
                return _this;
            }
            Object.defineProperty(MultiLineText.prototype, "measuredWidth", {
                get: function () {
                    return this._measuredWidth;
                },
                enumerable: false,
                configurable: true
            });
            MultiLineText.prototype.innerDraw = function (play_ground) {
                Geoma.PlayGround.drawingSprites++;
                var line_padding = this._linePadding.value;
                var last_info;
                var current_x = toInt(this.x);
                var current_y = toInt(this.y);
                var current_w = this.fixWidth ? toInt(this.w) : undefined;
                var w = 0;
                for (var _i = 0, _a = this.textLines; _i < _a.length; _i++) {
                    var line = _a[_i];
                    if (!last_info || last_info.brush != line.brush) {
                        play_ground.context2d.fillStyle = line.brush;
                    }
                    if (!last_info || last_info.style != line.style) {
                        if (line.style.direction) {
                            play_ground.context2d.direction = line.style.direction;
                        }
                        if (line.style.font) {
                            play_ground.context2d.font = line.style.font;
                        }
                        if (line.style.textAlign) {
                            play_ground.context2d.textAlign = line.style.textAlign;
                        }
                        if (line.style.textBaseline) {
                            play_ground.context2d.textBaseline = line.style.textBaseline;
                        }
                    }
                    if (line.strokeWidth && line.strokeBrush) {
                        if (!last_info || last_info.strokeWidth != line.strokeWidth || last_info.strokeBrush != line.strokeBrush) {
                            play_ground.context2d.strokeStyle = line.strokeBrush;
                            play_ground.context2d.lineWidth = line.strokeWidth;
                        }
                        play_ground.context2d.strokeText(line.text, current_x, current_y, current_w);
                    }
                    play_ground.context2d.fillText(line.text, current_x, current_y, current_w);
                    w = Math.max(w, play_ground.context2d.measureText(line.text).width);
                    var h = play_ground.context2d.measureText("lIqg").actualBoundingBoxDescent;
                    current_y += line_padding + h;
                }
                this._measuredWidth = w;
                this._width = current_w ? current_w : w;
                this._height = current_y - line_padding;
            };
            return MultiLineText;
        }(Sprite));
        Sprite_1.MultiLineText = MultiLineText;
        var TextInput = (function (_super) {
            __extends(TextInput, _super);
            function TextInput(x, y, w, h, text, text_brush, text_style, background_brush, fixWidth) {
                var _this = _super.call(this, x, y, w, h) || this;
                _this.onKeyPress = new Geoma.Utils.MulticastEvent();
                _this._textWidth = 0;
                _this._textHeight = 0;
                _this._text = text;
                _this._textBrush = makeProp(text_brush, DefaultBrush);
                _this._textStyle = makeProp(text_style, DefaultTextStyle);
                _this._backgroundBrush = makeProp(background_brush, DefaultBrush);
                if (!fixWidth)
                    _this.addW(Geoma.Utils.makeMod(_this, function (value) {
                        return Math.max(value, _this._textWidth);
                    }));
                return _this;
            }
            Object.defineProperty(TextInput.prototype, "visible", {
                get: function () {
                    var visible = _super.prototype.getVisible.call(this);
                    if (this._input) {
                        this._input.style.visibility = visible ? "visible" : "hidden";
                    }
                    return visible;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(TextInput.prototype, "text", {
                get: function () {
                    var _a, _b, _c;
                    return (_c = (_b = (_a = this._input) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : this._text) !== null && _c !== void 0 ? _c : "";
                },
                set: function (value) {
                    if (this._input) {
                        this._input.value = value;
                    }
                    else {
                        this._text = value;
                    }
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(TextInput.prototype, "textWidth", {
                get: function () {
                    return this._textWidth;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(TextInput.prototype, "textHeight", {
                get: function () {
                    return this._textHeight;
                },
                enumerable: false,
                configurable: true
            });
            TextInput.prototype.dispose = function () {
                _super.prototype.dispose.call(this);
                if (this._input) {
                    document.body.removeChild(this._input);
                    delete this._input;
                }
            };
            TextInput.prototype.innerDraw = function (play_ground) {
                var _this = this;
                var _a;
                if (!this._input) {
                    var input = document.createElement("input");
                    input.type = "text";
                    input.onkeyup = Geoma.Utils.makeMod(this, function (event) {
                        event.cancelBubble = !_this.onKeyPress.emitEvent(event);
                        return event;
                    });
                    document.body.appendChild(input);
                    this._input = input;
                    this._input.style.border = "none";
                    this._input.style.outline = "none";
                    this._input.style.position = "absolute";
                    this._input.value = (_a = this._text) !== null && _a !== void 0 ? _a : "";
                }
                var parent = play_ground.context2d.canvas;
                var style = this._input.style;
                style.left = TextInput.toHtmlPixels(this.x + parent.offsetLeft);
                style.top = TextInput.toHtmlPixels(this.y + parent.offsetTop);
                style.width = TextInput.toHtmlPixels(this.w);
                style.height = TextInput.toHtmlPixels(this.h);
                if (this._textBrush) {
                    style.color = "" + this._textBrush.value;
                }
                if (this._backgroundBrush) {
                    style.backgroundColor = "" + this._backgroundBrush.value;
                }
                if (this._textStyle) {
                    var text_style = this._textStyle.value;
                    style.font = text_style.font;
                    style.direction = text_style.direction;
                    style.textAlign = text_style.textAlign;
                    play_ground.context2d.direction = text_style.direction;
                    play_ground.context2d.font = text_style.font;
                    play_ground.context2d.textAlign = text_style.textAlign;
                }
                else {
                    play_ground.context2d.direction = style.direction;
                    play_ground.context2d.font = style.font;
                    play_ground.context2d.textAlign = style.textAlign;
                }
                this._textWidth = play_ground.context2d.measureText(this.text).width;
                this._textHeight = play_ground.context2d.measureText("lIqg").actualBoundingBoxDescent;
            };
            TextInput.toHtmlPixels = function (value) {
                return value + "px";
            };
            return TextInput;
        }(Sprite));
        Sprite_1.TextInput = TextInput;
        var PolySprite = (function (_super) {
            __extends(PolySprite, _super);
            function PolySprite(x, y, line_width, brush, scale) {
                var _this = _super.call(this, x, y) || this;
                _this.lineWidth = makeProp(line_width, 1);
                _this.brush = makeProp(brush, DefaultBrush);
                _this.scale = makeProp(scale, 1);
                return _this;
            }
            PolySprite.prototype.addPolygon = function (polygon) {
                var _this = this;
                if (!this._path) {
                    this._path = new Path2D();
                }
                this._path.addPath(polygon.path);
                this.addW(Geoma.Utils.makeMod(this, function (value) { return Math.max(value, polygon.box.right) + _this.lineWidth.value; }));
                this.addH(Geoma.Utils.makeMod(this, function (value) { return Math.max(value, polygon.box.bottom) + _this.lineWidth.value; }));
            };
            PolySprite.prototype.isPointHit = function (play_ground, point) {
                assert(this._path);
                play_ground.context2d.beginPath();
                var current_transform = play_ground.context2d.getTransform();
                play_ground.context2d.setTransform(current_transform.a * this.scale.value, current_transform.b, current_transform.c, current_transform.d * this.scale.value, current_transform.e + this.x, current_transform.f + this.y);
                var ret = play_ground.context2d.isPointInPath(this._path, point.x, point.y);
                play_ground.context2d.setTransform(current_transform);
                return ret;
            };
            PolySprite.prototype.innerDraw = function (play_ground) {
                assert(this._path);
                Geoma.PlayGround.drawingSprites++;
                play_ground.context2d.beginPath();
                var current_transform = play_ground.context2d.getTransform();
                var dw = this.deltaLineWidth;
                play_ground.context2d.setTransform(current_transform.a * this.scale.value, current_transform.b, current_transform.c, current_transform.d * this.scale.value, toInt(current_transform.e + (this.x + dw) * play_ground.ratio), toInt(current_transform.f + (this.y + dw) * play_ground.ratio));
                this.onDraw(play_ground, this._path);
                play_ground.context2d.setTransform(current_transform);
            };
            PolySprite.prototype.reset = function () {
                delete this._path;
            };
            Object.defineProperty(PolySprite.prototype, "deltaLineWidth", {
                get: function () {
                    return this.lineWidth.value / 2;
                },
                enumerable: false,
                configurable: true
            });
            return PolySprite;
        }(Sprite));
        var Polyline = (function (_super) {
            __extends(Polyline, _super);
            function Polyline() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            Polyline.prototype.onDraw = function (play_ground, path) {
                play_ground.context2d.lineWidth = this.lineWidth.value;
                play_ground.context2d.strokeStyle = this.brush.value;
                play_ground.context2d.stroke(path);
            };
            return Polyline;
        }(PolySprite));
        Sprite_1.Polyline = Polyline;
        var Polyshape = (function (_super) {
            __extends(Polyshape, _super);
            function Polyshape() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            Polyshape.prototype.onDraw = function (play_ground, path) {
                play_ground.context2d.fillStyle = this.brush.value;
                play_ground.context2d.fill(path);
            };
            return Polyshape;
        }(PolySprite));
        Sprite_1.Polyshape = Polyshape;
        var Debug = (function () {
            function Debug() {
            }
            Debug.dot = function (play_groun, x, y, radius) {
                if (radius === void 0) { radius = 5; }
                play_groun.context2d.beginPath();
                play_groun.context2d.moveTo(x, y);
                play_groun.context2d.fillStyle = "Red";
                play_groun.context2d.arc(x, y, radius, 0, Math.PI * 2);
                play_groun.context2d.closePath();
                play_groun.context2d.fill();
            };
            return Debug;
        }());
        Sprite_1.Debug = Debug;
        var LatexContainer = (function (_super) {
            __extends(LatexContainer, _super);
            function LatexContainer(latex_engine, formula, x, y, scale) {
                var _this = _super.call(this, x, y) || this;
                _this.addW(Geoma.Utils.makeMod(_this, function () { var _a, _b; return ((_b = (_a = _this._renderedImage) === null || _a === void 0 ? void 0 : _a.width) !== null && _b !== void 0 ? _b : 0) * _this._scale; }));
                _this.addH(Geoma.Utils.makeMod(_this, function () { var _a, _b; return ((_b = (_a = _this._renderedImage) === null || _a === void 0 ? void 0 : _a.height) !== null && _b !== void 0 ? _b : 0) * _this._scale; }));
                _this._formula = makeProp(formula, "");
                _this._scale = scale !== null && scale !== void 0 ? scale : 1;
                _this._latexEngine = latex_engine;
                return _this;
            }
            LatexContainer.prototype.innerDraw = function (play_ground) {
                this._latexEngine.drawLatex(this._formula.value, this.x, this.y, this._scale, play_ground.context2d);
            };
            Object.defineProperty(LatexContainer.prototype, "_renderedImage", {
                get: function () {
                    var _a;
                    return (_a = this._latexEngine.getRenderedImage(this._formula.value)) !== null && _a !== void 0 ? _a : null;
                },
                enumerable: false,
                configurable: true
            });
            return LatexContainer;
        }(Sprite));
        Sprite_1.LatexContainer = LatexContainer;
    })(Sprite = Geoma.Sprite || (Geoma.Sprite = {}));
})(Geoma || (Geoma = {}));
var Geoma;
(function (Geoma) {
    var Tools;
    (function (Tools) {
        var UiLanguage;
        (function (UiLanguage) {
            UiLanguage[UiLanguage["ruRu"] = 0] = "ruRu";
            UiLanguage[UiLanguage["enUs"] = 1] = "enUs";
        })(UiLanguage = Tools.UiLanguage || (Tools.UiLanguage = {}));
        var Resources = (function () {
            function Resources() {
            }
            Resources.collator = function () {
                switch (Resources.language) {
                    case UiLanguage.enUs:
                        return new Intl.Collator("en-US", { numeric: true });
                    case UiLanguage.ruRu:
                        return new Intl.Collator("ru-RU", { numeric: true });
                }
            };
            Resources.string = function (resource_id) {
                var _a;
                var args = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    args[_i - 1] = arguments[_i];
                }
                switch (Resources.language) {
                    case UiLanguage.enUs:
                        return Geoma.Utils.formatString.apply(Geoma.Utils, __spreadArray([(_a = Resources.enEnStrings[resource_id]) !== null && _a !== void 0 ? _a : resource_id], args, false));
                    case UiLanguage.ruRu:
                        return Geoma.Utils.formatString.apply(Geoma.Utils, __spreadArray([resource_id], args, false));
                }
            };
            Resources.language = UiLanguage.ruRu;
            Resources.enEnStrings = {
                "Создать": "Create",
                "Создать точку": "Create a point",
                "Создать отрезок...": "Create a line segment...",
                "Создать функцию...": "Create a function graph...",
                "Файл": "File",
                "Новый": "New",
                "Открыть": "Open",
                "Копировать": "Copy",
                "Удалить": "Delete",
                "Сохранить": "Save",
                "Сохранить как...": "Save as...",
                "Файла {0} больше нет": "There is not exists file {0}",
                "Введите имя документа": "Please enter document name",
                "Постоянная ссылка на документ": "Permanent document link",
                "Настройки": "Settings",
                "Светлая": "Light theme",
                "Тёмная": "Dark theme",
                "Тема": "Theme",
                "Свойства": "Properties",
                "Показать биссектрисы углов": "Show angles bisectors",
                "Имя по умолчанию ({0})": "Set default name ({0})",
                "Настраиваемое имя": "Custom name",
                "Удалить индикатор угла {0}": "Delete angle indicator",
                "Масштаб по осям x/y, %": "Scale by x/y axes (%)",
                "Масштаб по осям x/y...": "Scale by x/y axes...",
                "Редактировать функцию f = {0} ...": "Edit function f = {0} ...",
                "Редактировать функцию": "Edit function",
                "Удалить координатную плоскость": "Delete coordinate plane",
                "Выберите вторую точку": "Please select second point",
                "Выберите вторую прямую": "Please select second line segment",
                "Выберите || прямую": "Please select line segment to be parallel",
                "Выберите ⟂ прямую": "Please select line segment to be orthogonal",
                "Невозможно восстановить данные": "Unable to restore document data",
                "{0}\r\nВведите число": "{0}\r\nPlease, enter a number",
                "Значение '{0}' не является числом": "The '{0}' is not a number",
                "Нельзя провести линию к той же точке!": "Unable to make line segment with one point.",
                "Отрезок {0} уже проведен!": "Line segment {0} is already exists.",
                "Угол может быть обозначен только между различными прямыми, имеющими одну общую точку.": "The angle can be set between two different lines segments with one common point.",
                "Угол {0} уже обозначен.": "The {0} angle is already exists.",
                "Отрезки {0} и {1} не содержат общих точек": "The {0} and {1} lines segments have not common points.",
                "Биссектриса угла {0} уже проведена.": "Bisector of {0} angle is already exists.",
                "Отрезки {0} и {1} имеют общую точку и не могут стать ||.": "The {0} and {1} lines segments have one common point and cannot be parallel.",
                "Отрезки {0} и {1} не имеют общей точки и не могут стать ⟂.": "The {0} and {1} lines segments have not common points and cannot by orthogonal.",
                "Окружность {0} уже проведена!": "The {0} circle is already exists.",
                "Нельзя провести окружность к той же точке!": "Unable to make circle containing one point.",
                "Удалить биссектрису": "Delete angle bisector",
                "Добавить точку": "Add point",
                "Удалить окружность {0}": "Delete {0} circle",
                "Введен недопустимый размер {0}": "The value {0} is the invalid size",
                "Введите размер в пикселях": "Please enter the size in pixels",
                "Задать размер...": "Set the size...",
                "Изменяемый размер": "Resizable",
                "Фиксированный размер": "Fixed size",
                "Обозначить угол...": "Add the angle indicator...",
                "Показать биссектрису угла...": "Add the angle bisector...",
                "Сделать ||...": "Make it parallel to...",
                "Сделать ⟂...": "Make it orthogonal to...",
                "Удалить отрезок {0}": "Delete the {0} line segment",
                "Приращение аргумента x функции {0}": "dx value of the function {0}",
                "Точность...": "Accuracy...",
                "Создать окружность из центра...": "Create a circle with point as center...",
                "Создать окружность на диаметре...": "Create a circle with point as one of diameter point...",
                "Удалить точку": "Delete point",
                "Выберите место": "Please select a starting location",
                "Создать линию...": "Create a line...",
                "Линия {0} уже проведена!": "Line {0} is already exists.",
                "Удалить линию {0}": "Delete the {0} line ",
                "Удалить график {0}": "Delete the {0} function graph",
                "Отмена": "Undo",
                "Повтор": "Redo",
                "Перемещение точки {0}": "Moving of the {0} point",
                "Удаление точки {0}": "Delete the {0} point",
                "Добавление точки": "Add a point",
                "Перемещение сегмента {0}": "Moving of the {0} line segment",
                "Удаление сегмента {0}": "Delete the {0} line segment",
                "Удаление линии {0}": "Delete the {0} line",
                "Добавление сегмента": "Add a line segment",
                "Название угла ({0})": "Angle name ({0})",
                "Отобразить угол": "Show angle",
                "Добавление окружности": "Add a circle",
                "Перемещение окружности {0}": "Moving of the {0} circle",
                "Добавление линии": "Add a line",
                "Перемещение линии {0}": "Moving of the {0} line",
                "Сделать ||": "Make parallel",
                "Сделать ⟂": "Make orthogonal",
                "Добавление функции": "Add a function graph",
                "Перемещение функции {0}": "Moving of the {0} function graph",
                "Масштабирование функции {0}": "Scaling of the {0} function graph",
                "Редактирование функции {0}": "Editing of the {0} function grapth",
                "Масштабирование осей": "Scaling of the axes",
                "Автоматическое сохранение": "Autosave",
                "Перемещение страницы": "Moving of the canvas",
                "Точка({0}: x={1}; y={2})": "Point({0}: x={1}; y={2})",
                "Отрезок({0}: l={1}; α={2}°)": "Segment({0}: l={1}; α={2}°)",
                "Линия({0}: α={1}°)": "Line({0}: α={1}°)",
                "Окружность({0}: Ø={1})": "Circle({0}: Ø={1})",
                "Функция(f={0})": "Function(f={0})",
                "Угол({0}: {1}={2}°)": "Angle({0}: {1}={2}°)",
                "Установить {0} = {1}": "Set {0} = {1}",
                "Ошибка выражения: {0}": "Error expression: {0}",
                "Неподдерживаемый тип функции: {0}": "Unsupported function type: {0}",
                "Неподдерживаемый тип оператора: {0}": "Unsupported operator type: {0}",
                "Неподдерживаемый тип операнда: {0}": "Unsupported operand type: {0}",
                "Введите выражение": "Enter a math expression",
                "⌨⇆🖰": "⌨⇆🖰",
            };
            return Resources;
        }());
        Tools.Resources = Resources;
    })(Tools = Geoma.Tools || (Geoma.Tools = {}));
})(Geoma || (Geoma = {}));
var factorialCache = [];
function factorial(value) {
    if (!factorialCache.length) {
        factorialCache.push(1);
        for (var i = 1; i <= 170; i++) {
            factorialCache.push(factorialCache[factorialCache.length - 1] * i);
        }
    }
    if (value > 170) {
        return Infinity;
    }
    else if (value >= 0) {
        return factorialCache[Geoma.Utils.toInt(value)];
    }
    else {
        return NaN;
    }
}
function derivative(id, context, code) {
    var f = context.getFunction(id);
    if (f) {
        var last_x = context.arg(id + "_x");
        var last_y = context.arg(id + "_y");
        var current_x = context.arg("x");
        var current_y = f(current_x);
        context.setArg(id + "_x", current_x);
        context.setArg(id + "_y", current_y);
        if (last_x < current_x) {
            return (current_y - last_y) / (current_x - last_x);
        }
        else {
            return NaN;
        }
    }
    else {
        context.addFunction(id, code);
        var f_1 = context.getFunction(id);
        Geoma.Utils.assert(f_1);
        var current_x = context.arg("x");
        var current_y = f_1(current_x);
        context.addArg(id + "_x", current_x);
        context.addArg(id + "_y", current_y);
        return NaN;
    }
}
function nthRoot(value, degree) {
    if (degree > 0 && degree == Math.trunc(degree) && degree % 2) {
        return Math.sign(value) * Math.pow(Math.abs(value), 1.0 / degree);
    }
    else {
        return Math.pow(value, 1.0 / degree);
    }
}
var Geoma;
(function (Geoma) {
    var Syntax;
    (function (Syntax) {
        var assert = Geoma.Utils.assert;
        function defaultVisitor(_) { }
        var CodeElement = (function () {
            function CodeElement() {
            }
            Object.defineProperty(CodeElement.prototype, "derivativeLevel", {
                get: function () {
                    return this.getDerivativeLevel(0);
                },
                enumerable: false,
                configurable: true
            });
            CodeElement.prototype.visitArguments = function (visitor) {
                if (this instanceof Syntax.CodeArgument && !(this instanceof CodeArgumentX)) {
                    visitor(this);
                }
                else if (this instanceof CodeUnary) {
                    this.operand.visitArguments(visitor);
                }
                else if (this instanceof CodeBinary) {
                    this.operand1.visitArguments(visitor);
                    this.operand2.visitArguments(visitor);
                }
            };
            CodeElement.prototype.serialize = function (data) {
                if (this instanceof CodeLiteral) {
                    data.push("+l");
                    data.push(this.text);
                }
                else if (this instanceof CodeArgumentX) {
                    data.push("+x");
                }
                else if (this instanceof CodeArgument) {
                    data.push("+a");
                    data.push(this.text);
                }
                else if (this instanceof CodeUnary) {
                    data.push("+u");
                    data.push(this.function);
                    this.operand.serialize(data);
                }
                else if (this instanceof CodeBinary) {
                    data.push("+b");
                    data.push(this.function);
                    this.operand1.serialize(data);
                    this.operand2.serialize(data);
                }
            };
            CodeElement.deserialize = function (data, i) {
                if (i >= data.length) {
                    throw CodeElement.error;
                }
                switch (data[i]) {
                    case "+l":
                        i++;
                        if (i >= data.length) {
                            throw CodeElement.error;
                        }
                        var value = parseFloat(data[i]);
                        if (data[i] != "" + value) {
                            throw CodeElement.error;
                        }
                        return { code: new CodeLiteral(value), index: i + 1 };
                    case "+x":
                        return { code: new CodeArgumentX(), index: i + 1 };
                    case "+a":
                        i++;
                        if (i >= data.length) {
                            throw CodeElement.error;
                        }
                        return { code: new CodeArgument(data[i]), index: i + 1 };
                    case "+u":
                        i++;
                        if (i >= data.length) {
                            throw CodeElement.error;
                        }
                        var unary_function = data[i];
                        var operand = CodeElement.deserialize(data, i + 1);
                        return { code: new CodeUnary(unary_function, operand.code), index: operand.index };
                    case "+b":
                        i++;
                        if (i >= data.length) {
                            throw CodeElement.error;
                        }
                        var binary_function = data[i];
                        var operand1 = CodeElement.deserialize(data, i + 1);
                        var operand2 = CodeElement.deserialize(data, operand1.index);
                        return { code: new CodeBinary(operand1.code, binary_function, operand2.code), index: operand2.index };
                    default:
                        throw CodeElement.error;
                }
            };
            CodeElement.prototype.getDerivativeLevel = function (level) {
                if (this instanceof Syntax.CodeUnary) {
                    if (this.function == "f'") {
                        return this.operand.getDerivativeLevel(level + 1);
                    }
                    else {
                        return this.operand.getDerivativeLevel(level);
                    }
                }
                else if (this instanceof Syntax.CodeBinary) {
                    var level1 = this.operand1.getDerivativeLevel(level);
                    var level2 = this.operand2.getDerivativeLevel(level);
                    return Math.max(level1, level2);
                }
                else {
                    return level;
                }
            };
            CodeElement.error = new Error(Geoma.Tools.Resources.string("Невозможно восстановить данные"));
            return CodeElement;
        }());
        Syntax.CodeElement = CodeElement;
        var CodeDefinitionElement = (function (_super) {
            __extends(CodeDefinitionElement, _super);
            function CodeDefinitionElement() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            return CodeDefinitionElement;
        }(CodeElement));
        Syntax.CodeDefinitionElement = CodeDefinitionElement;
        var CodeArgument = (function (_super) {
            __extends(CodeArgument, _super);
            function CodeArgument(arg_name) {
                var _this = _super.call(this) || this;
                _this._argName = arg_name;
                return _this;
            }
            Object.defineProperty(CodeArgument.prototype, "code", {
                get: function () {
                    return "this.arg('" + this._argName + "')";
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(CodeArgument.prototype, "text", {
                get: function () {
                    return this._argName;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(CodeArgument.prototype, "math", {
                get: function () {
                    return this.text;
                },
                enumerable: false,
                configurable: true
            });
            return CodeArgument;
        }(CodeDefinitionElement));
        Syntax.CodeArgument = CodeArgument;
        var CodeLiteral = (function (_super) {
            __extends(CodeLiteral, _super);
            function CodeLiteral(value) {
                var _this = _super.call(this) || this;
                _this._value = value;
                return _this;
            }
            Object.defineProperty(CodeLiteral.prototype, "code", {
                get: function () {
                    return "" + this._value;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(CodeLiteral.prototype, "text", {
                get: function () {
                    return "" + this._value;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(CodeLiteral.prototype, "math", {
                get: function () {
                    return this.text;
                },
                enumerable: false,
                configurable: true
            });
            return CodeLiteral;
        }(CodeDefinitionElement));
        Syntax.CodeLiteral = CodeLiteral;
        var CodeArgumentX = (function (_super) {
            __extends(CodeArgumentX, _super);
            function CodeArgumentX() {
                return _super.call(this, "x") || this;
            }
            return CodeArgumentX;
        }(CodeArgument));
        Syntax.CodeArgumentX = CodeArgumentX;
        var CodeUnary = (function (_super) {
            __extends(CodeUnary, _super);
            function CodeUnary(_function, operand) {
                var _this = _super.call(this) || this;
                _this._function = _function;
                _this._operand = operand;
                return _this;
            }
            Object.defineProperty(CodeUnary.prototype, "code", {
                get: function () {
                    var math_function;
                    switch (this._function) {
                        case "±":
                            return "" + this._operand.code;
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
                            return "Math.cbrt(" + this._operand.code + ")";
                        case "∜":
                            return "Math.sqrt(Math.sqrt(" + this._operand.code + "))";
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
                            var code = this._operand.code.replaceAll("\\", "\\\\").replaceAll("\"", "\\\"");
                            return "derivative(" + CodeUnary._functionNo++ + ", this, \"" + code + "\")";
                        case "round":
                            math_function = "Math.round";
                            break;
                        case "ceil":
                            math_function = "Math.ceil";
                            break;
                        case "floor":
                            math_function = "Math.floor";
                            break;
                        case "neg":
                            math_function = "-";
                            break;
                        default:
                            assert(false, "Math function " + this._function + " not supported");
                    }
                    return math_function + "(" + this._operand.code + ")";
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(CodeUnary.prototype, "text", {
                get: function () {
                    return this.toText(this._operand.text);
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(CodeUnary.prototype, "math", {
                get: function () {
                    switch (this._function) {
                        case "log2":
                            return "log(" + this._operand.math + "; 2)";
                        case "log10":
                            return "log(" + this._operand.math + "; 10)";
                        case "√":
                            return "sqrt(" + this._operand.math + ")";
                        case "∛":
                            return "cbrt(" + this._operand.math + ")";
                        case "∜":
                            return "root(" + this._operand.math + ", 4)";
                        case "abs":
                            return "abs(" + this._operand.math + ")";
                        case "round":
                            return "round(" + this._operand.math + ")";
                        case "ceil":
                            return "ceil(" + this._operand.math + ")";
                        case "floor":
                            return "floor(" + this._operand.math + ")";
                        case "!":
                            return "fact(" + this._operand.math + ")";
                        default:
                            return this.toText(this._operand.math);
                    }
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(CodeUnary.prototype, "function", {
                get: function () {
                    return this._function;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(CodeUnary.prototype, "operand", {
                get: function () {
                    return this._operand;
                },
                enumerable: false,
                configurable: true
            });
            CodeUnary.prototype.toText = function (operand) {
                switch (this.function) {
                    case "abs":
                        return "|" + operand + "|";
                    case "round":
                        return "[" + operand + "]";
                    case "ceil":
                        return "\u23BE" + operand + "\u23CB";
                    case "floor":
                        return "\u23BF" + operand + "\u23CC";
                    case "!":
                        return operand + "!";
                    case "neg":
                        return "-(" + operand + ")";
                }
                if (operand.length > 0 && operand.charAt(0) == "(") {
                    return "" + this._function + operand;
                }
                else {
                    return this._function + "(" + operand + ")";
                }
            };
            CodeUnary._functionNo = 1;
            return CodeUnary;
        }(CodeElement));
        Syntax.CodeUnary = CodeUnary;
        var CodeBinary = (function (_super) {
            __extends(CodeBinary, _super);
            function CodeBinary(operand1, _function, operand2) {
                var _this = _super.call(this) || this;
                _this._function = _function;
                _this._operand1 = operand1;
                _this._operand2 = operand2;
                return _this;
            }
            Object.defineProperty(CodeBinary.prototype, "code", {
                get: function () {
                    switch (this._function) {
                        case "pow":
                            return "Math.pow(" + this._operand1.code + ", " + this._operand2.code + ")";
                        case "n√":
                            return "nthRoot(" + this._operand2.code + ", " + this._operand1.code + ")";
                        case "+":
                            return "(" + this._operand1.code + " + " + this._operand2.code + ")";
                        case "-":
                            return "(" + this._operand1.code + " - " + this._operand2.code + ")";
                        case "*":
                            return "(" + this._operand1.code + " * " + this._operand2.code + ")";
                        case "÷":
                            return "(" + this._operand1.code + " / " + this._operand2.code + ")";
                        default:
                            assert(false, "Math function " + this._function + " not supported");
                    }
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(CodeBinary.prototype, "text", {
                get: function () {
                    return this.toText(this._operand1.text, this._operand2.text);
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(CodeBinary.prototype, "math", {
                get: function () {
                    switch (this._function) {
                        case "n√":
                            return "root(" + this._operand2.math + "; " + this._operand1.math + ")";
                        default:
                            return this.toText(this._operand1.math, this._operand2.math);
                    }
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(CodeBinary.prototype, "function", {
                get: function () {
                    return this._function;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(CodeBinary.prototype, "operand1", {
                get: function () {
                    return this._operand1;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(CodeBinary.prototype, "operand2", {
                get: function () {
                    return this._operand2;
                },
                enumerable: false,
                configurable: true
            });
            CodeBinary.prototype.toText = function (operand1, operand2) {
                switch (this._function) {
                    case "pow":
                        return "(" + operand1 + " ^ " + operand2 + ")";
                    case "n√":
                        return "(" + operand1 + "\u221A " + operand2 + ")";
                    case "+":
                        return "(" + operand1 + " + " + operand2 + ")";
                    case "-":
                        return "(" + operand1 + " - " + operand2 + ")";
                    case "*":
                        return "(" + operand1 + " * " + operand2 + ")";
                    case "÷":
                        return "(" + operand1 + " / " + operand2 + ")";
                    default:
                        assert(false, "Math function " + this._function + " not supported");
                }
            };
            return CodeBinary;
        }(CodeElement));
        Syntax.CodeBinary = CodeBinary;
    })(Syntax = Geoma.Syntax || (Geoma.Syntax = {}));
})(Geoma || (Geoma = {}));
var Geoma;
(function (Geoma) {
    var Tools;
    (function (Tools) {
        var assert = Geoma.Utils.assert;
        var DocumentSprite = (function (_super) {
            __extends(DocumentSprite, _super);
            function DocumentSprite(document, sprite, forward_event) {
                if (forward_event === void 0) { forward_event = false; }
                var _this = this;
                assert(document);
                _this = _super.call(this, sprite) || this;
                _this._mouseMoveListener = document.mouseArea.onMouseMove.bind(_this, _this.mouseMove, forward_event);
                _this._mouseClickListener = document.mouseArea.onMouseClick.bind(_this, _this.mouseClick, forward_event);
                _this._selected = false;
                _this.document = document;
                return _this;
            }
            Object.defineProperty(DocumentSprite.prototype, "selected", {
                get: function () {
                    return this._selected;
                },
                set: function (value) {
                    if (this._selected) {
                        if (!value) {
                            this.document.removeSelectedSprite(this);
                            this._selected = false;
                        }
                    }
                    else if (value) {
                        this.document.addSelectedSprite(this);
                        this._selected = true;
                    }
                },
                enumerable: false,
                configurable: true
            });
            DocumentSprite.prototype.dispose = function () {
                if (!this.disposed) {
                    if (this.selected) {
                        this.document.removeSelectedSprite(this);
                    }
                    this._mouseClickListener.dispose();
                    this._mouseMoveListener.dispose();
                    _super.prototype.dispose.call(this);
                }
            };
            DocumentSprite.prototype.mouseClick = function (__event) {
            };
            DocumentSprite.prototype.mouseMove = function (__event) {
            };
            DocumentSprite.prototype.innerDraw = function (play_ground) {
                this.item.draw(play_ground);
            };
            return DocumentSprite;
        }(Geoma.Sprite.ProxySprite));
        Tools.DocumentSprite = DocumentSprite;
        var Container = (function (_super) {
            __extends(Container, _super);
            function Container() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            Object.defineProperty(Container.prototype, "first", {
                get: function () {
                    return this.length ? this.item(0) : null;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(Container.prototype, "last", {
                get: function () {
                    return this.length ? this.item(this.length - 1) : null;
                },
                enumerable: false,
                configurable: true
            });
            Container.prototype.item = function (index) {
                return _super.prototype.item.call(this, index);
            };
            return Container;
        }(Geoma.Sprite.Container));
        Tools.Container = Container;
        var Tooltip = (function (_super) {
            __extends(Tooltip, _super);
            function Tooltip(x, y, text, style, background, foreground) {
                if (style === void 0) { style = Tools.CurrentTheme.TooltipStyle; }
                if (background === void 0) { background = Tools.CurrentTheme.TooltipBackground; }
                if (foreground === void 0) { foreground = Tools.CurrentTheme.TooltipForeground; }
                var _this = _super.call(this) || this;
                var padding = 10;
                var tooltip = new Geoma.Sprite.Text(undefined, undefined, undefined, undefined, foreground, style, text);
                var rect = new Geoma.Sprite.Rectangle(x, y, function () { return tooltip.w + padding * 2; }, function () { return tooltip.h + padding * 2; }, background);
                tooltip.addX(function () { return rect.x + padding; });
                tooltip.addY(function () { return rect.y + padding; });
                _this.push(rect);
                _this.push(tooltip);
                return _this;
            }
            return Tooltip;
        }(Geoma.Sprite.Container));
        Tools.Tooltip = Tooltip;
    })(Tools = Geoma.Tools || (Geoma.Tools = {}));
})(Geoma || (Geoma = {}));
var Geoma;
(function (Geoma) {
    var Tools;
    (function (Tools) {
        var ThicknessHelper = (function () {
            function ThicknessHelper() {
                this.Calc = 0.1;
                this._mouseThickness = ThicknessHelper._minimalMouseThickness;
            }
            Object.defineProperty(ThicknessHelper.prototype, "Mouse", {
                get: function () {
                    return this._mouseThickness;
                },
                enumerable: false,
                configurable: true
            });
            ThicknessHelper.prototype.setMouseThickness = function (value) {
                this._mouseThickness = Math.max(ThicknessHelper._minimalMouseThickness, value);
            };
            ThicknessHelper._minimalMouseThickness = 5;
            return ThicknessHelper;
        }());
        var DefaultThemeStyle = (function () {
            function DefaultThemeStyle() {
                this.name = "DefaultTheme";
                this.PropertyLeftMargin = 20;
                this.PropertyVerticalPadding = 5;
                this.ButtonBackgroundBrush = "#117777";
                this.ButtonSelectedBrush = "#0011EF";
                this.ButtonItemTextBrush = "#EFFFFF";
                this.ButtonDisabledItemTextBrush = "Gray";
                this.ButtonSelectedItemTextBrush = "#FFFF00";
                this.ButtonItemTextStyle = {
                    font: "18px Arial", textBaseline: "hanging", direction: "inherit", textAlign: "left"
                };
                this.TapDelayTime = 100;
                this.TapActivateTime = 500;
                this.TapLineWidth = 10;
                this.TapRadius = 20;
                this.TapBrush = "Lime";
                this.AxesWidth = 0.5;
                this.AxesBrush = "DarkTurquoise";
                this.AxesSelectBrush = "Lime";
                this.AxesTextBrush = "DarkTurquoise";
                this.AxesTextSelectBrush = "Lime";
                this.AxesTextStyle = {
                    font: "12px Arial", textBaseline: "top", direction: "inherit", textAlign: "left"
                };
                this.ActiveLineWidth = 2;
                this.ActiveLineBrush = "Aqua";
                this.ActiveLineSelectBrush = "Lime";
                this.ActiveLineSegmentWidth = 2;
                this.ActiveLineSegmentBrush = "SandyBrown";
                this.ActiveLineSegmentSelectBrush = "Lime";
                this.ParametricLineWidth = 2;
                this.ParametricLineBrush = "SandyBrown";
                this.ParametricLineSelectBrush = "Lime";
                this.ActiveCircleWidth = 2;
                this.ActiveCircleBrush = "SandyBrown";
                this.ActiveCircleSelectBrush = "Lime";
                this.TooltipStyle = {
                    font: "18px Arial", textBaseline: "top", direction: "inherit", textAlign: "left"
                };
                this.TooltipBackground = "LemonChiffon";
                this.TooltipForeground = "DarkSlateGray";
                this.MenuBackgroundBrush = "#117777";
                this.MenuSelectedItemBrush = "#0011EF";
                this.MenuItemTextBrush = "#EFFFFF";
                this.MenuDisabledItemTextBrush = "Gray";
                this.MenuSelectedItemTextBrush = "#FFFF00";
                this.MenuItemTextStyle = {
                    font: "18px Arial", textBaseline: "hanging", direction: "inherit", textAlign: "left"
                };
                this.AngleNameBrush = "#EFFFFF";
                this.AngleNameSelectBrush = "Lime";
                this.AngleNameStyle = {
                    font: "14px Arial", textBaseline: "middle", direction: "inherit", textAlign: "left"
                };
                this.AngleIndicatorLineWidth = 1;
                this.AngleIndicatorBrush = "DarkTurquoise";
                this.AngleIndicatorSelectionBrush = "DarkTurquoise";
                this.AngleIndicatorSelectionBorderBrush = "DarkTurquoise";
                this.AngleIndicatorStrokeBrush = "White";
                this.AngleIndicatorStrokeWidth = 0;
                this.AngleIndicatorPrecision = 2;
                this.BisectorBrush = "DarkTurquoise";
                this.BisectorSelectionBrush = "Lime";
                this.BisectorLineWidth = 1;
                this.BackgroundBrush = "SteelBlue";
                this.TapShadowColor = "Lime";
                this.TapShadowBlure = 15;
                this.ToolNameBrush = "#EFFFFF";
                this.ToolNameStyle = {
                    font: "18px Arial", textBaseline: "middle", direction: "inherit", textAlign: "left"
                };
                this.ToolBrush = "#0011dd";
                this.ToolLineBrush = "#dd11cc";
                this.ToolSelectLineBrush = "Lime";
                this.ToolSeparatorBrush = "PowderBlue";
                this.ToolDisabledBrush = "#000877";
                this.ToolDisabledLineBrush = "#770088";
                this.AdornerNameBrush = "#EFFFFF";
                this.AdornerNameStyle = {
                    font: "18px Arial", textBaseline: "middle", direction: "inherit", textAlign: "left"
                };
                this.AdornerBrush = "#0011dd";
                this.AdornerLineBrush = "#dd11cc";
                this.AdornerSelectLineBrush = "Lime";
                this.AdornerStrokeBrush = "White";
                this.AdornerStrokeWidth = 0;
                this.FormulaEditorBackgroundBrush = "#117777";
                this.FormulaInputTextBrush = "#EFFFFF";
                this.FormulaInputTextBackgroundBrush = "#117777";
                this.FormulaInputTextStyle = {
                    font: "18px Consolas", textBaseline: "hanging", direction: "inherit", textAlign: "left"
                };
                this.FormulaSampleTextBrush = "SandyBrown";
                this.FormulaSampleTextStyle = {
                    font: "18px Consolas", textBaseline: "hanging", direction: "inherit", textAlign: "left"
                };
                this.CoordinatesPrecision = 2;
                this.PropertyTextBrush = "DarkTurquoise";
                this.PropertySelectedTextBrush = "Lime";
                this.PropertyTextStyle = {
                    font: "10px Arial", textBaseline: "hanging", direction: "inherit", textAlign: "left"
                };
            }
            return DefaultThemeStyle;
        }());
        var BlueThemeStyle = (function () {
            function BlueThemeStyle() {
                this.name = "BlueTheme";
                this.PropertyLeftMargin = 20;
                this.PropertyVerticalPadding = 5;
                this.ButtonBackgroundBrush = "LightSkyBlue";
                this.ButtonSelectedBrush = "SteelBlue";
                this.ButtonItemTextBrush = "DarkSlateGray";
                this.ButtonDisabledItemTextBrush = "Gray";
                this.ButtonSelectedItemTextBrush = "AliceBlue";
                this.ButtonItemTextStyle = {
                    font: "18px Arial", textBaseline: "hanging", direction: "inherit", textAlign: "left"
                };
                this.AxesWidth = 0.5;
                this.AxesBrush = "DarkTurquoise";
                this.AxesSelectBrush = "Lime";
                this.AxesTextBrush = "DarkTurquoise";
                this.AxesTextSelectBrush = "Lime";
                this.AxesTextStyle = {
                    font: "12px Arial", textBaseline: "top", direction: "inherit", textAlign: "left"
                };
                this.BackgroundBrush = "Seashell";
                this.TapDelayTime = 100;
                this.TapActivateTime = 500;
                this.TapLineWidth = 10;
                this.TapRadius = 20;
                this.TapBrush = "Lime";
                this.TapShadowColor = "Lime";
                this.TapShadowBlure = 15;
                this.ActiveLineWidth = 2;
                this.ActiveLineBrush = "DarkGray";
                this.ActiveLineSelectBrush = "OrangeRed";
                this.ActiveLineSegmentWidth = 2;
                this.ActiveLineSegmentBrush = "DarkSlateGray";
                this.ActiveLineSegmentSelectBrush = "OrangeRed";
                this.ParametricLineWidth = 2;
                this.ParametricLineBrush = "DarkSlateGray";
                this.ParametricLineSelectBrush = "OrangeRed";
                this.ActiveCircleWidth = 2;
                this.ActiveCircleBrush = "DarkSlateGray";
                this.ActiveCircleSelectBrush = "OrangeRed";
                this.ToolNameBrush = "SteelBlue";
                this.ToolNameStyle = {
                    font: "18px Arial", textBaseline: "middle", direction: "inherit", textAlign: "left"
                };
                this.ToolBrush = "LightSkyBlue";
                this.ToolLineBrush = "DarkSlateGray";
                this.ToolSelectLineBrush = "OrangeRed";
                this.ToolDisabledBrush = "LightSteelBlue";
                this.ToolDisabledLineBrush = "DimGray";
                this.TooltipStyle = {
                    font: "18px Arial", textBaseline: "top", direction: "inherit", textAlign: "left"
                };
                this.TooltipBackground = "LemonChiffon";
                this.TooltipForeground = "DarkSlateGray";
                this.ToolSeparatorBrush = "SteelBlue";
                this.MenuBackgroundBrush = "LightSkyBlue";
                this.MenuSelectedItemBrush = "SteelBlue";
                this.MenuItemTextBrush = "DarkSlateGray";
                this.MenuDisabledItemTextBrush = "Gray";
                this.MenuSelectedItemTextBrush = "AliceBlue";
                this.MenuItemTextStyle = {
                    font: "18px Arial", textBaseline: "hanging", direction: "inherit", textAlign: "left"
                };
                this.AdornerNameBrush = "SteelBlue";
                this.AdornerNameStyle = {
                    font: "18px Arial", textBaseline: "middle", direction: "inherit", textAlign: "left"
                };
                this.AdornerBrush = "LightSkyBlue";
                this.AdornerLineBrush = "DarkSlateGray";
                this.AdornerSelectLineBrush = "OrangeRed";
                this.AdornerStrokeBrush = "White";
                this.AdornerStrokeWidth = 2;
                this.AngleNameBrush = "SteelBlue";
                this.AngleNameSelectBrush = "OrangeRed";
                this.AngleNameStyle = {
                    font: "14px Arial", textBaseline: "middle", direction: "inherit", textAlign: "left"
                };
                this.AngleIndicatorLineWidth = 1;
                this.AngleIndicatorBrush = "DarkSlateGray";
                this.AngleIndicatorSelectionBrush = "LightSkyBlue";
                this.AngleIndicatorSelectionBorderBrush = "DarkSlateGray";
                this.AngleIndicatorStrokeBrush = "White";
                this.AngleIndicatorStrokeWidth = 2;
                this.AngleIndicatorPrecision = 2;
                this.BisectorBrush = "DarkSlateGray";
                this.BisectorSelectionBrush = "OrangeRed";
                this.BisectorLineWidth = 1;
                this.FormulaEditorBackgroundBrush = "PeachPuff";
                this.FormulaInputTextBrush = "DarkSlateGray";
                this.FormulaInputTextBackgroundBrush = "LightSkyBlue";
                this.FormulaInputTextStyle = {
                    font: "18px Consolas", textBaseline: "hanging", direction: "inherit", textAlign: "left"
                };
                this.FormulaSampleTextBrush = "Gray";
                this.FormulaSampleTextStyle = {
                    font: "18px Consolas", textBaseline: "hanging", direction: "inherit", textAlign: "left"
                };
                this.CoordinatesPrecision = 2;
                this.PropertyTextBrush = "DarkSlateGray";
                this.PropertySelectedTextBrush = "OrangeRed";
                this.PropertyTextStyle = {
                    font: "10px Arial", textBaseline: "hanging", direction: "inherit", textAlign: "left"
                };
            }
            return BlueThemeStyle;
        }());
        Tools.Thickness = new ThicknessHelper();
        Tools.DefaultTheme = new DefaultThemeStyle();
        Tools.BlueTheme = new BlueThemeStyle();
        Tools.CurrentTheme = Tools.DefaultTheme;
    })(Tools = Geoma.Tools || (Geoma.Tools = {}));
})(Geoma || (Geoma = {}));
var Geoma;
(function (Geoma) {
    var Tools;
    (function (Tools) {
        var makeMod = Geoma.Utils.makeMod;
        var makeProp = Geoma.Utils.makeProp;
        var assert = Geoma.Utils.assert;
        var ActivePointBase = (function (_super) {
            __extends(ActivePointBase, _super);
            function ActivePointBase(document, x, y, radius, line_width, brush, line_brush, select_line_brush) {
                if (radius === void 0) { radius = 5; }
                if (line_width === void 0) { line_width = 2; }
                var _this = _super.call(this, document, new Geoma.Sprite.Container(), true) || this;
                var ellipse = new Geoma.Polygon.Ellipse(Geoma.Utils.Point.make(radius, radius), radius, radius, 0, 2 * Math.PI);
                var bg = new Geoma.Sprite.Polyshape(x - radius, y - radius, 0, brush);
                bg.addPolygon(ellipse);
                var line_brush_prop = makeProp(line_brush, "BlacK");
                var select_line_brush_prop = makeProp(select_line_brush, "Black");
                _this._line = new Geoma.Sprite.Polyline(x - radius - line_width / 2, y - radius - line_width / 2, line_width, makeMod(_this, function () { return _this.selected ? select_line_brush_prop.value : line_brush_prop.value; }));
                _this._line.addPolygon(ellipse);
                _this.item.push(bg);
                _this.item.push(_this._line);
                return _this;
            }
            Object.defineProperty(ActivePointBase.prototype, "lineBrush", {
                get: function () {
                    return this._line.brush.value;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(ActivePointBase.prototype, "x", {
                get: function () {
                    return this._line.middleX;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(ActivePointBase.prototype, "y", {
                get: function () {
                    return this._line.middleY;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(ActivePointBase.prototype, "w", {
                get: function () {
                    return this._line.w + (this._text ? (this._text.w + ActivePointBase._textPadding) : 0);
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(ActivePointBase.prototype, "right", {
                get: function () {
                    return this._line.x + this.w;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(ActivePointBase.prototype, "bottom", {
                get: function () {
                    return this._line.y + this.item.h;
                },
                enumerable: false,
                configurable: true
            });
            ActivePointBase.prototype.setName = function (value, brush, style) {
                assert(!this.name);
                this._text = new Geoma.Sprite.Text(this._line.right + ActivePointBase._textPadding, this.y, 0, 0, brush, style, value);
                this.item.push(this._text);
                this.item.name = this._text.text.value;
                return this._text;
            };
            ActivePointBase.prototype.serialize = function (__context) {
                var data = [];
                data.push("" + (this._line.x + this.item.first.w / 2 + this._line.lineWidth.value / 2));
                data.push("" + (this._line.y + this.item.first.w / 2 + this._line.lineWidth.value / 2));
                return data;
            };
            Object.defineProperty(ActivePointBase.prototype, "boundingBox", {
                get: function () {
                    return this._line;
                },
                enumerable: false,
                configurable: true
            });
            ActivePointBase.prototype.mouseMove = function (event) {
                this.selected = this.mouseHit(event);
                _super.prototype.mouseMove.call(this, event);
            };
            ActivePointBase.prototype.setInfo = function (value, brush, style) {
                var _this = this;
                this.resetInfo();
                var info = new Geoma.Sprite.Text(makeMod(this, function () { return _this.item.item(_this.item.length - 2).x + ActivePointBase._textPadding; }), makeMod(this, function () { return _this.y - 20; }), 0, 0, brush, style, value);
                info.name = ActivePointBase._InfoSpriteName;
                this.item.push(info);
                return info;
            };
            ActivePointBase.prototype.resetInfo = function () {
                for (var i = 0; i < this.item.length; i++) {
                    if (this.item.item(i).name == ActivePointBase._InfoSpriteName) {
                        this.item.remove(this.item.item(i));
                        break;
                    }
                }
            };
            ActivePointBase._textPadding = 5;
            ActivePointBase._InfoSpriteName = "{17B56627-B5D6-4AA6-8B7A-0C1322A53629}";
            return ActivePointBase;
        }(Tools.DocumentSprite));
        Tools.ActivePointBase = ActivePointBase;
    })(Tools = Geoma.Tools || (Geoma.Tools = {}));
})(Geoma || (Geoma = {}));
var Geoma;
(function (Geoma) {
    var Tools;
    (function (Tools) {
        var makeMod = Geoma.Utils.makeMod;
        var makeProp = Geoma.Utils.makeProp;
        var assert = Geoma.Utils.assert;
        var MulticastEvent = Geoma.Utils.MulticastEvent;
        var property = Geoma.Utils.ModifiableProperty;
        var MenuElementBase = (function (_super) {
            __extends(MenuElementBase, _super);
            function MenuElementBase(document, sprite) {
                return _super.call(this, document, sprite, true) || this;
            }
            Object.defineProperty(MenuElementBase.prototype, "first", {
                get: function () {
                    assert(this.item.first);
                    return this.item.first;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(MenuElementBase.prototype, "last", {
                get: function () {
                    assert(this.item.last);
                    return this.item.last;
                },
                enumerable: false,
                configurable: true
            });
            return MenuElementBase;
        }(Tools.DocumentSprite));
        var MenuItem = (function (_super) {
            __extends(MenuItem, _super);
            function MenuItem(menu, x, y, width, text) {
                var _this = _super.call(this, menu.document, new Geoma.Sprite.Container()) || this;
                _this.enabled = new property(true);
                var tooltip = new Geoma.Sprite.Text(x, y, 0, 0, makeMod(_this, function () { return _this.selected ? Tools.CurrentTheme.MenuSelectedItemTextBrush : (_this.enabled.value ? Tools.CurrentTheme.MenuItemTextBrush : Tools.CurrentTheme.MenuDisabledItemTextBrush); }), Tools.CurrentTheme.MenuItemTextStyle, text);
                tooltip.addX(makeMod(_this, function (value) { return value + _this._menu.padding; }));
                tooltip.addY(makeMod(_this, function (value) { return value + _this._menu.padding; }));
                var rect = new Geoma.Sprite.Rectangle(x, y, (width == undefined) ? function () { return _this.clientW; } : width, function () { return Math.ceil(tooltip.h) + _this._menu.padding * 2; }, Tools.CurrentTheme.MenuSelectedItemBrush);
                rect.addVisible(makeMod(_this, function () { return _this.selected; }));
                _this.item.push(rect);
                _this.item.push(tooltip);
                _this.onChecked = new MulticastEvent();
                _this.addVisible(function (value) { return value && menu.visible; });
                _this._menu = menu;
                return _this;
            }
            Object.defineProperty(MenuItem.prototype, "clientW", {
                get: function () {
                    return this.last.w + this._menu.padding * 2;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(MenuItem.prototype, "tooltip", {
                get: function () {
                    return this.item.last.text.value;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(MenuItem.prototype, "menu", {
                get: function () {
                    return this._menu;
                },
                enumerable: false,
                configurable: true
            });
            MenuItem.prototype.mouseClick = function (event) {
                if (this.visible && this.enabled.value && this.mouseHit(event)) {
                    event.cancelBubble = true;
                    this.enabled.value = false;
                    this.selected = false;
                    if (this.onChecked) {
                        this.onChecked.emitEvent(new CustomEvent("MenuEvent", { cancelable: false, detail: this }));
                    }
                    this._menu.close();
                }
                _super.prototype.mouseClick.call(this, event);
            };
            MenuItem.prototype.mouseMove = function (event) {
                if (this.enabled.value) {
                    this.selected = this.mouseHit(event);
                }
                _super.prototype.mouseMove.call(this, event);
            };
            return MenuItem;
        }(MenuElementBase));
        Tools.MenuItem = MenuItem;
        var MenuGroup = (function (_super) {
            __extends(MenuGroup, _super);
            function MenuGroup(menu, x, y, width, text) {
                var _this = _super.call(this, menu, x, y, width, text) || this;
                var tooltip = _this.last;
                var expander = new Geoma.Sprite.Text(0, function () { return tooltip.y; }, 0, 20, function () { return tooltip.brush.value; }, function () { return tooltip.style.value; }, "►");
                expander.addX(function () { return _this.first.right - expander.w - MenuGroup._innerMargin; });
                _this.item.push(expander);
                _this._subMenuVisible = false;
                _this._subMenuAboutToHide = 0;
                _this._subMenuAboutToShow = 0;
                _this._subMenu = new Menu(_this.document, makeMod(_this, function () { return _this.right; }), makeMod(_this, function () { return _this.top - _this._subMenu.padding; }), menu.rootMenu, _this);
                _this._subMenu.addVisible(makeMod(_this, function () { return _this._subMenuVisible; }));
                _this._beforeDrawListener = _this.document.onBeforeDraw.bind(_this, function () {
                    if (_this._subMenuVisible) {
                        if (_this._subMenuAboutToHide && _this._subMenuAboutToHide <= Tools.Document.ticks) {
                            _this._subMenuAboutToHide = 0;
                            _this._subMenuVisible = _this.selected;
                        }
                    }
                    else if (_this._subMenuAboutToShow && _this._subMenuAboutToShow <= Tools.Document.ticks) {
                        _this._subMenuAboutToShow = 0;
                        _this._subMenuVisible = _this.selected;
                    }
                });
                return _this;
            }
            Object.defineProperty(MenuGroup.prototype, "clientW", {
                get: function () {
                    var text = this.item.item(this.item.length - 2);
                    return text.w + this.last.w + MenuGroup._innerMargin + this.menu.padding * 2;
                },
                enumerable: false,
                configurable: true
            });
            MenuGroup.prototype.addMenuItem = function (text) {
                return this._subMenu.addMenuItem(text);
            };
            MenuGroup.prototype.addMenuGroup = function (text) {
                return this._subMenu.addMenuGroup(text);
            };
            MenuGroup.prototype.addMenuStrip = function () {
                return this._subMenu.addMenuStrip();
            };
            MenuGroup.prototype.dispose = function () {
                if (!this.disposed) {
                    this._subMenu.dispose();
                    this._beforeDrawListener.dispose();
                    _super.prototype.dispose.call(this);
                }
            };
            MenuGroup.prototype.innerDraw = function (play_ground) {
                _super.prototype.innerDraw.call(this, play_ground);
                this._subMenu.draw(play_ground);
            };
            MenuGroup.prototype.mouseClick = function (event) {
                this.mouseMove(event);
                if (this.visible && this.enabled.value && this.mouseHit(event)) {
                    event.cancelBubble = true;
                    this.enabled.value = false;
                }
            };
            MenuGroup.prototype.mouseMove = function (event) {
                _super.prototype.mouseMove.call(this, event);
                if (this.enabled.value) {
                    this.selected = this.selected || (this._subMenu.visible && this._subMenu.mouseHit(event));
                    if (this._subMenu.visible) {
                        if (!this.selected) {
                            this._subMenuAboutToShow = 0;
                            if (!this._subMenuAboutToHide) {
                                this._subMenuAboutToHide = Tools.Document.ticks + MenuGroup._subMenuVisibilityChangeTimeOut;
                            }
                        }
                        else {
                            this._subMenuAboutToHide = 0;
                        }
                    }
                    else if (this.selected) {
                        this._subMenuAboutToHide = 0;
                        if (!this._subMenuAboutToShow) {
                            this._subMenuAboutToShow = Tools.Document.ticks + MenuGroup._subMenuVisibilityChangeTimeOut;
                        }
                    }
                }
            };
            MenuGroup._innerMargin = 5;
            MenuGroup._subMenuVisibilityChangeTimeOut = 300;
            return MenuGroup;
        }(MenuItem));
        var MenuStrip = (function (_super) {
            __extends(MenuStrip, _super);
            function MenuStrip(menu, x, y) {
                var _this = _super.call(this, menu.document, new Geoma.Sprite.Container()) || this;
                _this._menu = menu;
                _this._startX = makeProp(x, 0);
                _this._startY = makeProp(y, 0);
                return _this;
            }
            Object.defineProperty(MenuStrip.prototype, "clientW", {
                get: function () {
                    return this.last.right - this.x;
                },
                enumerable: false,
                configurable: true
            });
            MenuStrip.prototype.addMenuItem = function (text) {
                var _this = this;
                var index = this.item.length - 1;
                var ret = new MenuItem(this._menu, makeMod(this, function () { return (index >= 0) ? _this.item.item(index).right + _this._menu.padding : _this._startX.value; }), makeMod(this, function () { return _this._startY.value; }), undefined, text);
                this.item.push(ret);
                return ret;
            };
            return MenuStrip;
        }(MenuElementBase));
        Tools.MenuStrip = MenuStrip;
        var Menu = (function (_super) {
            __extends(Menu, _super);
            function Menu(document, x, y, root_menu, parent_group) {
                var _this = _super.call(this, document, new Tools.Container()) || this;
                _this.padding = 3;
                _this._hasGroupExpander = false;
                _this._dx = 0;
                _this._dy = 0;
                _this._rootMenu = root_menu;
                _this._parentGroup = parent_group;
                _this.item.push(new Geoma.Sprite.Rectangle(x, y, makeMod(_this, function () {
                    if (_this.item.length > 1) {
                        return _this._clientWidth.value + _this.padding * 2;
                    }
                    else {
                        return 0;
                    }
                }), makeMod(_this, function () {
                    if (_this.item.length > 1) {
                        return _this.last.bottom - _this.y + _this.padding;
                    }
                    else {
                        return 0;
                    }
                }), Tools.CurrentTheme.MenuBackgroundBrush));
                _this.item.addX(makeMod(_this, function (value) { return value - _this._dx; }));
                _this.item.addY(makeMod(_this, function (value) { return value - _this._dy; }));
                _this._clientWidth = makeProp(makeMod(_this, _this.maxClientWidth), 0);
                _this._mouseDownBinder = document.mouseArea.onMouseDown.bind(_this, _this.handleEvent);
                _this._mouseUpBinder = document.mouseArea.onMouseDown.bind(_this, _this.handleEvent);
                return _this;
            }
            Object.defineProperty(Menu.prototype, "rootMenu", {
                get: function () {
                    var _a;
                    return (_a = this._rootMenu) !== null && _a !== void 0 ? _a : this;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(Menu.prototype, "clientW", {
                get: function () {
                    throw assert(false, "Logical error");
                },
                enumerable: false,
                configurable: true
            });
            Menu.prototype.dispose = function () {
                if (!this.disposed) {
                    this._mouseDownBinder.dispose();
                    this._mouseUpBinder.dispose();
                    _super.prototype.dispose.call(this);
                }
            };
            Menu.prototype.addMenuItem = function (text) {
                var _this = this;
                var index = this.item.length - 1;
                var ret = new MenuItem(this, makeMod(this, function () { return _this.first.x + _this.padding; }), makeMod(this, function () { return index ? (_this.item.item(index).bottom + 1) : (_this.first.y + _this.padding); }), makeMod(this, function () { return _this._clientWidth.value; }), text);
                this.item.push(ret);
                return ret;
            };
            Menu.prototype.addMenuGroup = function (text) {
                var _this = this;
                var index = this.item.length - 1;
                var ret = new MenuGroup(this, makeMod(this, function () { return _this.first.x + _this.padding; }), makeMod(this, function () { return index ? _this.item.item(index).bottom : (_this.first.y + _this.padding); }), makeMod(this, function () { return _this._clientWidth.value; }), text);
                this.item.push(ret);
                this._hasGroupExpander = true;
                return ret;
            };
            Menu.prototype.addMenuStrip = function () {
                var _this = this;
                var index = this.item.length - 1;
                var ret = new MenuStrip(this, makeMod(this, function () { return _this.first.x + _this.padding; }), makeMod(this, function () { return index ? _this.item.item(index).bottom : (_this.first.y + _this.padding); }));
                this.item.push(ret);
                return ret;
            };
            Menu.prototype.show = function () {
                this.document.showMenu(this);
            };
            Menu.prototype.close = function () {
                this.document.closeMenu(this.rootMenu);
            };
            Menu.prototype.handleEvent = function (event) {
                if (this.visible) {
                    if (!this._parentGroup) {
                        event.cancelBubble = true;
                    }
                    return true;
                }
                else {
                    return false;
                }
            };
            Menu.prototype.mouseClick = function (event) {
                if (this.handleEvent(event) && !this.mouseHit(event)) {
                    var close_menu = true;
                    for (var i = 0; i < this.item.length; i++) {
                        if (this.item.item(i).selected) {
                            close_menu = false;
                            break;
                        }
                    }
                    if (close_menu) {
                        this.close();
                    }
                }
                _super.prototype.mouseClick.call(this, event);
            };
            Menu.prototype.mouseMove = function (event) {
                if (this.handleEvent(event) && this.mouseHit(event)) {
                    if (this._parentGroup) {
                        if (!this._parentGroup.selected) {
                            this._parentGroup.selected = true;
                        }
                    }
                }
                _super.prototype.mouseMove.call(this, event);
            };
            Menu.prototype.maxClientWidth = function () {
                var w = 0;
                for (var i = 1; i < this.item.length; i++) {
                    var menu_item = this.item.item(i);
                    w = Math.max(w, menu_item.clientW);
                }
                if (this._hasGroupExpander) {
                    w += 70;
                }
                return w;
            };
            Menu.prototype.innerDraw = function (play_ground) {
                _super.prototype.innerDraw.call(this, play_ground);
                if ((this.bottom + 10) > play_ground.bottom) {
                    var dy = this.bottom - play_ground.bottom;
                    if (dy > this._dy) {
                        this._dy = dy;
                    }
                }
                if ((this.right + 10) > play_ground.right) {
                    var dx = this.right - play_ground.right;
                    if (dx > this._dx) {
                        this._dx = dx;
                    }
                }
            };
            return Menu;
        }(MenuElementBase));
        Tools.Menu = Menu;
    })(Tools = Geoma.Tools || (Geoma.Tools = {}));
})(Geoma || (Geoma = {}));
var Geoma;
(function (Geoma) {
    var Tools;
    (function (Tools) {
        var makeMod = Geoma.Utils.makeMod;
        var makeProp = Geoma.Utils.makeProp;
        var Point = Geoma.Utils.Point;
        var assert = Geoma.Utils.assert;
        var MulticastEvent = Geoma.Utils.MulticastEvent;
        var property = Geoma.Utils.ModifiableProperty;
        var ToolBase = (function (_super) {
            __extends(ToolBase, _super);
            function ToolBase(document, x, y, radius, line_width, name, enabled) {
                if (enabled === void 0) { enabled = new property(true); }
                var _this = _super.call(this, document, x, y, radius, line_width, function () { return enabled.value ? Tools.CurrentTheme.ToolBrush : Tools.CurrentTheme.ToolDisabledBrush; }, function () { return enabled.value ? Tools.CurrentTheme.ToolLineBrush : Tools.CurrentTheme.ToolDisabledLineBrush; }, function () { return enabled.value ? Tools.CurrentTheme.ToolSelectLineBrush : Tools.CurrentTheme.ToolDisabledLineBrush; }) || this;
                _this.enabled = true;
                if (document.mouseArea instanceof Geoma.PlayGround && !document.mouseArea.touchInterface) {
                    _this.setName(name, function () { return Tools.CurrentTheme.ToolNameBrush; }, function () { return Tools.CurrentTheme.ToolNameStyle; });
                }
                return _this;
            }
            ToolBase.prototype.mouseHit = function (point) {
                return _super.prototype.mouseHit.call(this, Point.sub(point, this.document.mouseArea.offset));
            };
            ToolBase.prototype.isMoved = function (_receiptor) {
                return false;
            };
            return ToolBase;
        }(Tools.ActivePointBase));
        var PointTool = (function (_super) {
            __extends(PointTool, _super);
            function PointTool(document, x, y, radius, line_width) {
                if (radius === void 0) { radius = 5; }
                if (line_width === void 0) { line_width = 2; }
                var _this = _super.call(this, document, x, y, radius, line_width, function () { return Tools.Resources.string("Создать"); }) || this;
                _this._picked = false;
                var icon_line_width = 2;
                var ds = ((radius * 5) / 6) - icon_line_width - (line_width / 2);
                var dsw = ds / 3;
                var plus_line = new Geoma.Polygon.Line(Point.make(-ds, -dsw), Point.make(-dsw, -dsw), Point.make(-dsw, -ds), Point.make(dsw, -ds), Point.make(dsw, -dsw), Point.make(ds, -dsw), Point.make(ds, dsw), Point.make(dsw, dsw), Point.make(dsw, ds), Point.make(-dsw, ds), Point.make(-dsw, dsw), Point.make(-ds, dsw), Point.make(-ds, -dsw - (icon_line_width / 2)));
                var plus = new Geoma.Sprite.Polyline(x - icon_line_width / 2, y - icon_line_width / 2, icon_line_width, makeMod(_this, function () { return _this.lineBrush; }));
                plus.addPolygon(plus_line);
                _this.item.push(plus);
                return _this;
            }
            Object.defineProperty(PointTool.prototype, "picked", {
                get: function () {
                    return this._picked;
                },
                enumerable: false,
                configurable: true
            });
            PointTool.showMenu = function (document) {
                var x = document.mouseArea.mousePoint.x;
                var y = document.mouseArea.mousePoint.y;
                var menu = new Tools.Menu(document, x, y);
                var menu_item = menu.addMenuItem(Tools.Resources.string("Создать точку"));
                menu_item.onChecked.bind(this, function () { return document.addPoint(Point.make(x, y)); });
                menu_item = menu.addMenuItem(Tools.Resources.string("Создать линию..."));
                menu_item.onChecked.bind(this, function () { return document.setLineState(new Tools.ActivePoint(document, x, y)); });
                menu_item = menu.addMenuItem(Tools.Resources.string("Создать отрезок..."));
                menu_item.onChecked.bind(this, function () { return document.setLineSegmentState(new Tools.ActivePoint(document, x, y)); });
                menu_item = menu.addMenuItem(Tools.Resources.string("Создать окружность из центра..."));
                menu_item.onChecked.bind(this, function () { return document.setCirclRadiusState(new Tools.ActivePoint(document, x, y)); });
                menu_item = menu.addMenuItem(Tools.Resources.string("Создать окружность на диаметре..."));
                menu_item.onChecked.bind(this, function () { return document.setCirclDiameterState(new Tools.ActivePoint(document, x, y)); });
                menu_item = menu.addMenuItem(Tools.Resources.string("Создать функцию..."));
                menu_item.onChecked.bind(this, function () { return document.addParametricLine(Point.make(x, y)); });
                menu.show();
            };
            PointTool.prototype.mouseClick = function (event) {
                if (this._picked) {
                    this._picked = false;
                    if (this.document.canShowMenu(this)) {
                        PointTool.showMenu(this.document);
                    }
                }
                else {
                    this._picked = this.selected && this.mouseHit(event);
                    if (this.picked) {
                        this.document.addToolTip(Tools.Resources.string("Выберите место"));
                    }
                }
            };
            PointTool.prototype.mouseMove = function (event) {
                _super.prototype.mouseMove.call(this, event);
                this.selected = this.selected || this.picked;
            };
            return PointTool;
        }(ToolBase));
        Tools.PointTool = PointTool;
        var FileTool = (function (_super) {
            __extends(FileTool, _super);
            function FileTool(document, x, y, radius, line_width) {
                if (radius === void 0) { radius = 5; }
                if (line_width === void 0) { line_width = 2; }
                var _this = _super.call(this, document, x, y, radius, line_width, function () { return Tools.Resources.string("Файл"); }) || this;
                var icon_line_width = 2;
                var file_point = Point.make(x - radius + icon_line_width + line_width / 2, y - radius + icon_line_width + line_width / 2);
                var file = new Geoma.Sprite.Polyshape(file_point.x, file_point.y, icon_line_width, makeMod(_this, function () { return _this.lineBrush; }), 0.3);
                file.addPolygon(new Geoma.Polygon.CustomPath(file_point, "M83.012,17.5c0-0.527-0.271-0.99-0.682-1.258L66.477,2.637c-0.15-0.129-0.324-0.211-0.505-0.271C65.709,2.141,65.373,2,65,2 H18.5C17.671,2,17,2.671,17,3.5v93c0,0.828,0.671,1.5,1.5,1.5h63c0.828,0,1.5-0.672,1.5-1.5V18c0-0.067-0.011-0.13-0.02-0.195 C83.001,17.707,83.012,17.604,83.012,17.5z M20,95V5h44v12.5c0,0.829,0.672,1.5,1.5,1.5H80v76H20z"));
                file.addPolygon(new Geoma.Polygon.CustomPath(file_point, "M69,31H31c-0.552,0-1-0.448-1-1s0.448-1,1-1h38c0.553,0,1,0.448,1,1S69.553,31,69,31z"));
                file.addPolygon(new Geoma.Polygon.CustomPath(file_point, "M69,45H31c-0.552,0-1-0.448-1-1s0.448-1,1-1h38c0.553,0,1,0.448,1,1S69.553,45,69,45z"));
                file.addPolygon(new Geoma.Polygon.CustomPath(file_point, "M69,57H31c-0.552,0-1-0.447-1-1s0.448-1,1-1h38c0.553,0,1,0.447,1,1S69.553,57,69,57z"));
                file.addPolygon(new Geoma.Polygon.CustomPath(file_point, "M69,71H31c-0.552,0-1-0.447-1-1s0.448-1,1-1h38c0.553,0,1,0.447,1,1S69.553,71,69,71z"));
                _this.item.push(file);
                return _this;
            }
            Object.defineProperty(FileTool, "LocalStorageKeys", {
                get: function () {
                    var names = [];
                    var has_autosave = false;
                    for (var i = 0; i < window.localStorage.length; i++) {
                        var doc_name = window.localStorage.key(i);
                        if (doc_name != null) {
                            if (FileTool._autosavedDocumentName == doc_name) {
                                has_autosave = true;
                            }
                            else {
                                names.push(doc_name);
                            }
                        }
                    }
                    names.sort(Geoma.Utils.CompareCaseInsensitive);
                    if (has_autosave) {
                        names.splice(0, 0, FileTool._autosavedDocumentName);
                    }
                    return names;
                },
                enumerable: false,
                configurable: true
            });
            FileTool.saveLastState = function (data) {
                window.localStorage.setItem(FileTool._autosavedDocumentName, data);
            };
            FileTool.prototype.mouseClick = function (event) {
                var _this = this;
                if (this.mouseHit(event) && this.document.canShowMenu(this)) {
                    var menu = new Tools.Menu(this.document, this.x + this.document.mouseArea.offset.x, this.bottom + this.document.mouseArea.offset.y);
                    var menu_item = menu.addMenuItem(Tools.Resources.string("Новый"));
                    menu_item.onChecked.bind(this.document, this.document.new);
                    var open_group = menu.addMenuGroup(Tools.Resources.string("Открыть"));
                    menu_item = menu.addMenuItem(Tools.Resources.string("Сохранить"));
                    menu_item.onChecked.bind(this, this.saveCommand);
                    menu_item.enabled.addModifier(makeMod(this, function () { return _this.document.name != ""; }));
                    menu_item = menu.addMenuItem(Tools.Resources.string("Сохранить как..."));
                    menu_item.onChecked.bind(this, this.saveCommandAs);
                    menu_item = menu.addMenuItem(Tools.Resources.string("Копировать"));
                    menu_item.onChecked.bind(this, this.copyCommand);
                    var delete_group = menu.addMenuGroup(Tools.Resources.string("Удалить"));
                    for (var _i = 0, _a = FileTool.LocalStorageKeys; _i < _a.length; _i++) {
                        var name_1 = _a[_i];
                        if (name_1 == SettingsTool.settingsKey) {
                            continue;
                        }
                        else if (name_1 == FileTool._autosavedDocumentName) {
                            menu_item = open_group.addMenuItem(Tools.Resources.string("Автоматическое сохранение"));
                            menu_item.onChecked.bind(this, function (event) { return _this.openCommand(event, FileTool._autosavedDocumentName); });
                            menu_item = delete_group.addMenuItem(Tools.Resources.string("Автоматическое сохранение"));
                            menu_item.onChecked.bind(this, function (event) { return _this.removeCommand(event, FileTool._autosavedDocumentName); });
                        }
                        else {
                            menu_item = open_group.addMenuItem(name_1);
                            menu_item.onChecked.bind(this, this.openCommand);
                            menu_item = delete_group.addMenuItem(name_1);
                            menu_item.onChecked.bind(this, this.removeCommand);
                        }
                    }
                    menu.show();
                }
            };
            FileTool.prototype.openCommand = function (event, file_name) {
                var data = window.localStorage.getItem(file_name !== null && file_name !== void 0 ? file_name : event.detail.tooltip);
                if (data && data.length) {
                    this.document.open(data);
                    this.document.name = event.detail.tooltip;
                }
                else {
                    this.document.alert(Tools.Resources.string("Файла {0} больше нет", event.detail.tooltip));
                    this.removeCommand(event);
                }
            };
            FileTool.prototype.removeCommand = function (event, file_name) {
                window.localStorage.removeItem(file_name !== null && file_name !== void 0 ? file_name : event.detail.tooltip);
            };
            FileTool.prototype.saveCommand = function () {
                assert(this.document.name);
                var data = this.document.save();
                window.localStorage.setItem(this.document.name, data);
            };
            FileTool.prototype.saveCommandAs = function () {
                var data = this.document.save();
                var save_name = this.document.prompt(Tools.Resources.string("Введите имя документа"));
                if (save_name != null) {
                    window.localStorage.setItem(save_name, data);
                    this.document.name = save_name;
                }
            };
            FileTool.prototype.copyCommand = function () {
                var _this = this;
                var data = this.document.save();
                var href = document.location.href;
                var index = href.indexOf(document.location.hash);
                if (index > 0) {
                    href = href.substr(0, index);
                }
                data = encodeURI(href + "#" + data);
                if (window.prompt(Tools.Resources.string("Постоянная ссылка на документ"), data) != null) {
                    this.document.copyToClipboard(data).catch(function (error) {
                        _this.document.alert(error.message);
                    });
                }
            };
            FileTool._autosavedDocumentName = "{44ED56BE-46A8-4C51-8726-E1D6B4696A38}";
            return FileTool;
        }(ToolBase));
        Tools.FileTool = FileTool;
        var SettingsTool = (function (_super) {
            __extends(SettingsTool, _super);
            function SettingsTool(document, x, y, radius, line_width) {
                if (radius === void 0) { radius = 5; }
                if (line_width === void 0) { line_width = 2; }
                var _a;
                var _this = _super.call(this, document, x, y, radius, line_width, function () { return Tools.Resources.string("Настройки"); }) || this;
                var settings = _this.settings;
                if (settings.version == SettingsTool._settingsVersion) {
                    switch (settings.themeName) {
                        case "DefaultTheme":
                            Tools.CurrentTheme = Tools.DefaultTheme;
                            break;
                        case "BlueTheme":
                            Tools.CurrentTheme = Tools.BlueTheme;
                            break;
                        default:
                            Tools.CurrentTheme = Tools.DefaultTheme;
                            break;
                    }
                    Tools.Resources.language = (_a = settings.languageId) !== null && _a !== void 0 ? _a : Tools.UiLanguage.enUs;
                    if (settings.showProperties) {
                        _this.document.onOffProperties();
                    }
                }
                var icon_line_width = 2;
                var gear_point = Point.make(x - radius + icon_line_width + line_width / 2, y - radius + icon_line_width + line_width / 2);
                var gear = new Geoma.Sprite.Polyshape(gear_point.x, gear_point.y, icon_line_width, makeMod(_this, function () { return _this.lineBrush; }), 0.1);
                gear.addPolygon(new Geoma.Polygon.CustomPath(gear_point, "m297.365,183.342l-25.458,-22.983l0,-20.608l25.457,-22.981c2.614,-2.361 3.461,-6.112 2.112,-9.366l-13.605,-32.846c-1.348,-3.253 -4.588,-5.305 -8.115,-5.128l-34.252,1.749l-14.571,-14.571l1.749,-34.251c0.18,-3.518 -1.874,-6.769 -5.128,-8.116l-32.847,-13.606c-3.253,-1.35 -7.005,-0.501 -9.365,2.111l-22.984,25.458l-20.606,0l-22.982,-25.458c-2.361,-2.613 -6.112,-3.458 -9.365,-2.111l-32.846,13.605c-3.255,1.348 -5.308,4.599 -5.128,8.116l1.75,34.251l-14.572,14.571l-34.252,-1.749c-3.506,-0.188 -6.768,1.874 -8.115,5.128l-13.607,32.846c-1.348,3.255 -0.502,7.005 2.112,9.366l25.457,22.981l0,20.608l-25.455,22.983c-2.614,2.361 -3.461,6.112 -2.112,9.366l13.605,32.846c1.348,3.255 4.603,5.321 8.115,5.128l34.252,-1.749l14.572,14.571l-1.75,34.251c-0.18,3.518 1.874,6.769 5.128,8.116l32.846,13.606c3.255,1.352 7.005,0.502 9.365,-2.111l22.984,-25.458l20.606,0l22.984,25.458c1.613,1.785 3.873,2.746 6.182,2.746c1.071,0 2.152,-0.208 3.183,-0.634l32.846,-13.606c3.255,-1.348 5.308,-4.599 5.128,-8.116l-1.749,-34.251l14.571,-14.571l34.252,1.749c3.506,0.178 6.768,-1.874 8.115,-5.128l13.605,-32.846c1.348,-3.255 0.502,-7.005 -2.112,-9.366zm-24.628,30.412l-32.079,-1.639c-2.351,-0.127 -4.646,0.764 -6.311,2.428l-19.804,19.804c-1.666,1.666 -2.547,3.958 -2.428,6.311l1.638,32.079l-21.99,9.109l-21.525,-23.843c-1.578,-1.747 -3.824,-2.746 -6.179,-2.746l-28.006,0c-2.355,0 -4.601,0.998 -6.179,2.746l-21.525,23.843l-21.99,-9.109l1.639,-32.079c0.12,-2.353 -0.763,-4.646 -2.429,-6.311l-19.803,-19.804c-1.665,-1.665 -3.955,-2.55 -6.311,-2.428l-32.079,1.639l-9.109,-21.99l23.842,-21.525c1.748,-1.58 2.746,-3.824 2.746,-6.179l0,-28.008c0,-2.355 -0.998,-4.601 -2.746,-6.179l-23.842,-21.525l9.109,-21.99l32.079,1.639c2.354,0.124 4.646,-0.763 6.311,-2.428l19.803,-19.803c1.666,-1.666 2.549,-3.958 2.429,-6.313l-1.639,-32.079l21.99,-9.109l21.525,23.842c1.578,1.747 3.824,2.746 6.179,2.746l28.006,0c2.355,0 4.601,-0.998 6.179,-2.746l21.525,-23.842l21.99,9.109l-1.638,32.079c-0.12,2.353 0.761,4.645 2.428,6.313l19.804,19.803c1.666,1.665 3.959,2.564 6.311,2.428l32.079,-1.639l9.109,21.99l-23.843,21.525c-1.748,1.58 -2.746,3.824 -2.746,6.179l0,28.008c0,2.355 0.998,4.601 2.746,6.179l23.843,21.525l-9.109,21.99z"));
                gear.addPolygon(new Geoma.Polygon.CustomPath(gear_point, "m150.057,71.357c-43.394,0 -78.698,35.305 -78.698,78.698c0,43.394 35.304,78.698 78.698,78.698c43.394,0 78.698,-35.305 78.698,-78.698c-0.001,-43.394 -35.305,-78.698 -78.698,-78.698zm0,140.746c-34.214,0 -62.048,-27.834 -62.048,-62.048c0,-34.214 27.834,-62.048 62.048,-62.048c34.214,0 62.048,27.834 62.048,62.048c0,34.214 -27.836,62.048 -62.048,62.048z"));
                _this.item.push(gear);
                return _this;
            }
            Object.defineProperty(SettingsTool.prototype, "settings", {
                get: function () {
                    var settings_data = window.localStorage.getItem(SettingsTool.settingsKey);
                    if (settings_data) {
                        return JSON.parse(settings_data);
                    }
                    var settings = {
                        version: SettingsTool._settingsVersion,
                        themeName: "DefaultTheme"
                    };
                    return settings;
                },
                set: function (value) {
                    window.localStorage.setItem(SettingsTool.settingsKey, JSON.stringify(value));
                },
                enumerable: false,
                configurable: true
            });
            SettingsTool.prototype.mouseClick = function (event) {
                var _this = this;
                if (this.mouseHit(event) && this.document.canShowMenu(this)) {
                    var menu = new Tools.Menu(this.document, this.x + this.document.mouseArea.offset.x, this.bottom + this.document.mouseArea.offset.y);
                    var language_group = menu.addMenuGroup("Язык (Language)");
                    var menu_item = language_group.addMenuItem("Русский");
                    menu_item.onChecked.bind(this, function () { return _this.setLanguage(Tools.UiLanguage.ruRu); });
                    menu_item = language_group.addMenuItem("English (US)");
                    menu_item.onChecked.bind(this, function () { return _this.setLanguage(Tools.UiLanguage.enUs); });
                    var theme_group = menu.addMenuGroup(Tools.Resources.string("Тема"));
                    menu_item = theme_group.addMenuItem(Tools.Resources.string("Светлая"));
                    menu_item.onChecked.bind(this, function () { return _this.setTheme(Tools.BlueTheme); });
                    menu_item = theme_group.addMenuItem(Tools.Resources.string("Тёмная"));
                    menu_item.onChecked.bind(this, function () { return _this.setTheme(Tools.DefaultTheme); });
                    menu_item = menu.addMenuItem(Tools.Resources.string("Свойства"));
                    menu_item.onChecked.bind(this, function () { return _this.onOffProperties(); });
                    menu.show();
                }
            };
            SettingsTool.prototype.setTheme = function (theme) {
                var data = this.document.save();
                Tools.CurrentTheme = theme;
                var settings = this.settings;
                settings.themeName = theme.name;
                this.settings = settings;
                this.document.open(data);
            };
            SettingsTool.prototype.setLanguage = function (language) {
                Tools.Resources.language = language;
                var settings = this.settings;
                settings.languageId = language;
                this.settings = settings;
            };
            SettingsTool.prototype.onOffProperties = function () {
                var settings = this.settings;
                settings.showProperties = this.document.onOffProperties();
                this.settings = settings;
            };
            SettingsTool.settingsKey = "{7EB35B62-34AA-4F82-A0EC-283197A8E04E}";
            SettingsTool._settingsVersion = 1;
            return SettingsTool;
        }(ToolBase));
        Tools.SettingsTool = SettingsTool;
        var UndoTool = (function (_super) {
            __extends(UndoTool, _super);
            function UndoTool(document, x, y, radius, line_width) {
                if (radius === void 0) { radius = 5; }
                if (line_width === void 0) { line_width = 2; }
                var _this = _super.call(this, document, x, y, radius, line_width, function () { return Tools.Resources.string("Отмена"); }, new property(function () { return document.canUndo(); }, false)) || this;
                var icon_line_width = 2;
                var undo_point = Point.make(x - radius + icon_line_width + line_width / 2 + 2, y - radius + icon_line_width + line_width / 2 + 2);
                var undo_icon = new Geoma.Sprite.Polyshape(undo_point.x, undo_point.y, icon_line_width, makeMod(_this, function () { return _this.lineBrush; }), 1);
                undo_icon.addPolygon(new Geoma.Polygon.CustomPath(undo_point, "m17.026,22.957c10.957-11.421-2.326-20.865-10.384-13.309l2.464,2.352h-9.106v-8.947l2.232,2.229c14.794-13.203,31.51,7.051,14.794,17.675z"));
                _this.item.push(undo_icon);
                return _this;
            }
            UndoTool.prototype.mouseClick = function (event) {
                if (this.mouseHit(event) && this.document.canUndo()) {
                    this.document.undo();
                }
            };
            return UndoTool;
        }(ToolBase));
        Tools.UndoTool = UndoTool;
        var RedoTool = (function (_super) {
            __extends(RedoTool, _super);
            function RedoTool(document, x, y, radius, line_width) {
                if (radius === void 0) { radius = 5; }
                if (line_width === void 0) { line_width = 2; }
                var _this = _super.call(this, document, x, y, radius, line_width, function () { return Tools.Resources.string("Повтор"); }, new property(function () { return document.canRedo(); }, false)) || this;
                var icon_line_width = 2;
                var redo_point = Point.make(x - radius + icon_line_width + line_width / 2 + 2, y - radius + icon_line_width + line_width / 2 + 2);
                var redo_icon = new Geoma.Sprite.Polyshape(redo_point.x, redo_point.y, icon_line_width, makeMod(_this, function () { return _this.lineBrush; }), 1);
                redo_icon.addPolygon(new Geoma.Polygon.CustomPath(redo_point, "m6.974,22.957c-10.957-11.421,2.326-20.865,10.384-13.309l-2.464,2.352h9.106v-8.947l-2.232,2.229c-14.794-13.203-31.51,7.051-14.794,17.675z"));
                _this.item.push(redo_icon);
                return _this;
            }
            RedoTool.prototype.mouseClick = function (event) {
                if (this.mouseHit(event) && this.document.canRedo()) {
                    this.document.redo();
                }
            };
            return RedoTool;
        }(ToolBase));
        Tools.RedoTool = RedoTool;
        var TapTool = (function (_super) {
            __extends(TapTool, _super);
            function TapTool(document, delay_time, activate_time, line_width, radius, brush) {
                var _this = this;
                var stub = (function (_super) {
                    __extends(stub, _super);
                    function stub() {
                        return _super !== null && _super.apply(this, arguments) || this;
                    }
                    stub.prototype.innerDraw = function (__play_ground) {
                        throw new Error("Method not implemented.");
                    };
                    return stub;
                }(Geoma.Sprite.Sprite));
                _this = _super.call(this, document, new stub()) || this;
                _this._mouseDownListener = _this.document.mouseArea.onMouseDown.bind(_this, _this.mouseDown);
                _this._delayTime = makeProp(delay_time, 0);
                _this._activateTime = makeProp(activate_time, 0);
                _this._lineWidth = makeProp(line_width, 0);
                _this._radius = makeProp(radius, 0);
                _this._brush = makeProp(brush, "Black");
                _this.visible = false;
                _this.onActivate = new MulticastEvent();
                return _this;
            }
            TapTool.prototype.dispose = function () {
                var _a;
                if (!this.disposed) {
                    this._mouseDownListener.dispose();
                    (_a = this._mouseUpListener) === null || _a === void 0 ? void 0 : _a.dispose();
                    _super.prototype.dispose.call(this);
                }
            };
            TapTool.prototype.innerDraw = function (play_ground) {
                assert(this._startTicks);
                assert(this._downPoint);
                var elapsed_time = Tools.Document.ticks - this._startTicks;
                var active_time = elapsed_time - this._delayTime.value;
                if (active_time >= 0) {
                    var duration = this._activateTime.value - this._delayTime.value;
                    var radius = Math.cos(Math.PI * active_time / duration - Math.PI / 2) * this._radius.value;
                    if (active_time >= duration) {
                        this.tryActivate(play_ground.mousePoint);
                    }
                    else {
                        var shadow_color = play_ground.context2d.shadowColor;
                        var shadow_blur = play_ground.context2d.shadowBlur;
                        var point = this._downPoint;
                        play_ground.context2d.beginPath();
                        play_ground.context2d.strokeStyle = this._brush.value;
                        play_ground.context2d.lineWidth = this._lineWidth.value;
                        play_ground.context2d.shadowColor = Tools.CurrentTheme.TapShadowColor;
                        play_ground.context2d.shadowBlur = Tools.CurrentTheme.TapShadowBlure;
                        play_ground.context2d.arc(point.x, point.y, radius, 0, Math.PI * 2, false);
                        play_ground.context2d.lineWidth = 2;
                        play_ground.context2d.stroke();
                        play_ground.context2d.shadowColor = shadow_color;
                        play_ground.context2d.shadowBlur = shadow_blur;
                    }
                }
            };
            TapTool.prototype.mouseDown = function (event) {
                if (this.document.selectedSprites.length == 0) {
                    assert(!this._mouseUpListener);
                    this._mouseUpListener = this.document.mouseArea.onMouseUp.bind(this, this.mouseUp, true);
                    this._downPoint = event;
                    this._startTicks = Tools.Document.ticks;
                    this.visible = true;
                    this.selected = true;
                }
            };
            TapTool.prototype.mouseUp = function (__event) {
                this.visible = false;
                this.selected = false;
                assert(this._mouseUpListener);
                this._mouseUpListener.dispose();
                delete this._mouseUpListener;
            };
            TapTool.prototype.tryActivate = function (point) {
                if (this._downPoint && this.document.selectedSprites.length == 1 && this.document.canShowMenu(this)) {
                    var dp = Point.sub(this._downPoint, point);
                    if ((dp.x * dp.x + dp.y * dp.y) <= (Tools.Thickness.Mouse * Tools.Thickness.Mouse)) {
                        this.onActivate.emitEvent(new CustomEvent("ontap", { detail: point }));
                    }
                }
                this.selected = false;
                this.visible = false;
                assert(this._mouseUpListener);
                this._mouseUpListener.dispose();
                delete this._mouseUpListener;
            };
            return TapTool;
        }(Tools.DocumentSprite));
        Tools.TapTool = TapTool;
        var MoveTool = (function (_super) {
            __extends(MoveTool, _super);
            function MoveTool(document) {
                var _this = _super.call(this, document, new Tools.Container(), true) || this;
                _this._position = Point.make(document.mouseArea.mousePoint.x, document.mouseArea.mousePoint.y - MoveTool._IconSize - Tools.Thickness.Mouse - 1);
                var x = makeMod(_this, function () { return _this._position.x; });
                var y = makeMod(_this, function () { return _this._position.y; });
                var icon_path = new Geoma.Polygon.CustomPath(Point.make(MoveTool._IconSize, MoveTool._IconSize), "M500,10C229.8,10,10,229.8,10,500c0,270.2,219.8,490,490,490s490-219.8,490-490C990,229.8,770.2,10,500,10z M500,930.7C262.5,930.7,69.3,737.5,69.3,500C69.3,262.5,262.5,69.3,500,69.3c237.5,0,430.7,193.2,430.7,430.7C930.7,737.5,737.5,930.7,500,930.7z M541.9,500l100.6,100.6l6.2-40.7l58.6,8.9L689,689l-120.2,18.3l-8.9-58.6l40.7-6.2L500,541.9L398.9,643l37.8,5.8l-8.9,58.6l-120.1-18.3l-18.3-120.2L348,560l6.6,43.5L458.1,500L354.6,396.5l-6.6,43.5l-58.6-8.9L307.6,311l120.2-18.3l8.9,58.6l-37.7,5.7l101,101l100.6-100.6l-40.7-6.2l8.9-58.6L689,311l18.3,120.2l-58.6,8.9l-6.2-40.7L541.9,500z");
                var icon_stroke = new Geoma.Sprite.Polyline(x, y, Tools.CurrentTheme.TapLineWidth, Tools.CurrentTheme.TapBrush, MoveTool._IconSize / 1000);
                icon_stroke.addPolygon(icon_path);
                icon_stroke.addVisible(makeMod(_this, function () { return !_this._startDrag && !_this.mouseHit(_this.document.mouseArea.mousePoint); }));
                var icon = new Geoma.Sprite.Polyshape(x, y, Tools.CurrentTheme.TapLineWidth, Tools.CurrentTheme.TapBrush, MoveTool._IconSize / 1000);
                icon.addPolygon(icon_path);
                icon.addVisible(function () { return !icon_stroke.visible; });
                _this.item.push(icon_stroke);
                _this.item.push(icon);
                _this._touchInterface = document.mouseArea instanceof Geoma.PlayGround && document.mouseArea.touchInterface;
                if (_this._touchInterface) {
                    var stop_icon_path = new Geoma.Polygon.CustomPath(Point.make(MoveTool._IconSize, MoveTool._IconSize), "M90.914,5.296c6.927-7.034,18.188-7.065,25.154-0.068 c6.961,6.995,6.991,18.369,0.068,25.397L85.743,61.452l30.425,30.855c6.866,6.978,6.773,18.28-0.208,25.247 c-6.983,6.964-18.21,6.946-25.074-0.031L60.669,86.881L30.395,117.58c-6.927,7.034-18.188,7.065-25.154,0.068 c-6.961-6.995-6.992-18.369-0.068-25.397l30.393-30.827L5.142,30.568c-6.867-6.978-6.773-18.28,0.208-25.247 c6.983-6.963,18.21-6.946,25.074,0.031l30.217,30.643L90.914,5.296L90.914,5.296z");
                    var stop_move_icon = new Geoma.Sprite.Polyshape(x, y, Tools.CurrentTheme.TapLineWidth, "Red", MoveTool._IconSize / 500);
                    stop_move_icon.addX(function (value) { return value + MoveTool._IconSize; });
                    stop_move_icon.addPolygon(stop_icon_path);
                    _this.item.push(stop_move_icon);
                }
                _this._mouseDownListener = document.mouseArea.onMouseDown.bind(_this, _this.mouseDown, true);
                _this._mouseUpListener = document.mouseArea.onMouseUp.bind(_this, _this.mouseUp, true);
                return _this;
            }
            MoveTool.prototype.dispose = function () {
                var _a;
                if (!this.disposed) {
                    (_a = this._transaction) === null || _a === void 0 ? void 0 : _a.rollback();
                    this._mouseDownListener.dispose();
                    this._mouseUpListener.dispose();
                    _super.prototype.dispose.call(this);
                    this.document.remove(this);
                }
            };
            Object.defineProperty(MoveTool.prototype, "isActive", {
                get: function () {
                    var _a;
                    return ((_a = this.item.last) === null || _a === void 0 ? void 0 : _a.visible) == true;
                },
                enumerable: false,
                configurable: true
            });
            MoveTool.prototype.innerDraw = function (play_ground) {
                _super.prototype.innerDraw.call(this, play_ground);
            };
            MoveTool.prototype.mouseMove = function (event) {
                _super.prototype.mouseMove.call(this, event);
                if (this._startDrag) {
                    if (event.buttons > 0) {
                        if (this._touchInterface && this.mouseHit(event) && event.x >= this.middleX) {
                            this.endDrag();
                        }
                        else {
                            this.selected = true;
                            var dp = Point.add(Point.sub(this._startDrag, event), this.document.mouseArea.offset);
                            if (!this._transaction) {
                                this._transaction = this.document.beginUndo(Tools.Resources.string("Перемещение страницы"));
                            }
                            this.document.mouseArea.setOffset(dp.x, dp.y);
                        }
                    }
                    else {
                        this.selected = false;
                        this._position = Point.sub(event, Point.make(MoveTool._IconSize / 2, MoveTool._IconSize / 2));
                    }
                }
                event.cancelBubble = this.isActive;
            };
            MoveTool.prototype.mouseDown = function (event) {
                if (this.mouseHit(event)) {
                    this._startDrag = event;
                    Tools.Document.forceCloseMenu(this);
                }
                else {
                    this.dispose();
                }
                event.cancelBubble = this.isActive;
            };
            MoveTool.prototype.mouseUp = function (event) {
                if (this._startDrag && !this.selected) {
                    var dp = Point.sub(this._startDrag, event);
                    if ((dp.x * dp.x + dp.y * dp.y) <= (Tools.Thickness.Mouse * Tools.Thickness.Mouse)) {
                        this.endDrag();
                    }
                }
                event.cancelBubble = this.isActive;
            };
            MoveTool.prototype.endDrag = function () {
                var _a;
                (_a = this._transaction) === null || _a === void 0 ? void 0 : _a.commit();
                delete this._transaction;
                this.dispose();
            };
            MoveTool._IconSize = 40;
            return MoveTool;
        }(Tools.DocumentSprite));
        Tools.MoveTool = MoveTool;
    })(Tools = Geoma.Tools || (Geoma.Tools = {}));
})(Geoma || (Geoma = {}));
var Geoma;
(function (Geoma) {
    var Tools;
    (function (Tools) {
        var makeMod = Geoma.Utils.makeMod;
        var makeProp = Geoma.Utils.makeProp;
        var Button = (function (_super) {
            __extends(Button, _super);
            function Button(document, x, y, text, horizontal_padding, vertical_padding, forward_event, width) {
                if (horizontal_padding === void 0) { horizontal_padding = 10; }
                if (vertical_padding === void 0) { vertical_padding = 10; }
                if (forward_event === void 0) { forward_event = false; }
                var _this = _super.call(this, document, new Geoma.Sprite.Container(), forward_event) || this;
                _this._hPadding = makeProp(horizontal_padding, 10);
                _this._vPadding = makeProp(vertical_padding, 10);
                _this._mouseDown = false;
                _this._mouseDownListener = _this.document.mouseArea.onMouseDown.bind(_this, _this.mouseDown, forward_event);
                _this._mouseUpListener = _this.document.mouseArea.onMouseUp.bind(_this, _this.mouseUp, forward_event);
                _this.backgroundBrush = makeProp(Tools.CurrentTheme.ButtonBackgroundBrush);
                _this.backgroundSelectBrush = makeProp(Tools.CurrentTheme.ButtonSelectedBrush);
                _this.foregroundBrush = makeProp(Tools.CurrentTheme.ButtonItemTextBrush);
                _this.foregroundSelectBrush = makeProp(Tools.CurrentTheme.ButtonSelectedItemTextBrush);
                _this.textStyle = makeProp(Tools.CurrentTheme.ButtonItemTextStyle);
                var text_sprite = new Geoma.Sprite.Text(undefined, undefined, undefined, undefined, makeMod(_this, function () { return _this.selected ? _this.foregroundSelectBrush.value : _this.foregroundBrush.value; }), makeMod(_this, function () { return _this.textStyle.value; }), text);
                var background = new Geoma.Sprite.Rectangle(x, y, width ? width : function () { return text_sprite.w + 2 * _this._hPadding.value; }, function () { return text_sprite.h + 2 * _this._vPadding.value; }, makeMod(_this, function () { return _this.selected ? _this.backgroundSelectBrush.value : _this.backgroundBrush.value; }));
                text_sprite.addX(makeMod(_this, function () { return background.x + ((_this.selected && !_this._mouseDown) ? _this._hPadding.value * 0.9 : _this._hPadding.value); }));
                text_sprite.addY(makeMod(_this, function () { return background.y + ((_this.selected && !_this._mouseDown) ? _this._vPadding.value * 0.9 : _this._vPadding.value); }));
                _this.item.push(background);
                _this.item.push(text_sprite);
                return _this;
            }
            Object.defineProperty(Button.prototype, "isPressed", {
                get: function () {
                    return this._mouseDown;
                },
                enumerable: false,
                configurable: true
            });
            Button.prototype.dispose = function () {
                if (!this.disposed) {
                    this._mouseDownListener.dispose();
                    this._mouseUpListener.dispose();
                    _super.prototype.dispose.call(this);
                }
            };
            Button.prototype.addX = function (modifier) {
                this.item.first.addX(modifier);
            };
            Button.prototype.addY = function (modifier) {
                this.item.first.addY(modifier);
            };
            Button.prototype.addText = function (modifier) {
                this.item.item(1).text.addModifier(modifier);
            };
            Button.prototype.mouseClick = function (event) {
                if (this.mouseHit(event)) {
                    if (this.onClick()) {
                        event.cancelBubble = true;
                    }
                }
                this._mouseDown = false;
                _super.prototype.mouseClick.call(this, event);
            };
            Button.prototype.mouseMove = function (event) {
                this.selected = this.mouseHit(event);
                _super.prototype.mouseMove.call(this, event);
            };
            Button.prototype.mouseDown = function (event) {
                this._mouseDown = this.mouseHit(event);
                event.cancelBubble = this._mouseDown;
            };
            Button.prototype.mouseUp = function (__event) {
                this._mouseDown = false;
            };
            return Button;
        }(Tools.DocumentSprite));
        Tools.Button = Button;
    })(Tools = Geoma.Tools || (Geoma.Tools = {}));
})(Geoma || (Geoma = {}));
var Geoma;
(function (Geoma) {
    var Tools;
    (function (Tools) {
        var makeProp = Geoma.Utils.makeProp;
        var Point = Geoma.Utils.Point;
        var assert = Geoma.Utils.assert;
        var ActiveLineBase = (function (_super) {
            __extends(ActiveLineBase, _super);
            function ActiveLineBase(document, start, end, line_width, brush, selected_brush) {
                var _this = this;
                var stub = (function (_super) {
                    __extends(stub, _super);
                    function stub() {
                        return _super !== null && _super.apply(this, arguments) || this;
                    }
                    stub.prototype.innerDraw = function (__play_ground) {
                        throw new Error("Method not implemented.");
                    };
                    return stub;
                }(Geoma.Sprite.Sprite));
                _this = _super.call(this, document, new stub(function () { return Math.min(start.x, end.x); }, function () { return Math.min(start.y, end.y); }, function () { return Math.abs(start.x - end.x); }, function () { return Math.abs(start.y - end.y); })) || this;
                _this._startPoint = start;
                _this._endPoint = end;
                _this.lineWidth = makeProp(line_width, 1);
                _this.brush = makeProp(brush, "Black");
                _this.selectedBrush = makeProp(selected_brush, "Black");
                return _this;
            }
            Object.defineProperty(ActiveLineBase.prototype, "projX", {
                get: function () {
                    return this.w;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(ActiveLineBase.prototype, "projY", {
                get: function () {
                    return this.h;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(ActiveLineBase.prototype, "length", {
                get: function () {
                    return Math.sqrt(this.projX * this.projX + this.projY * this.projY);
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(ActiveLineBase.prototype, "angle", {
                get: function () {
                    return ActiveLineBase.getAngle(this._startPoint.x, this._startPoint.y, this._endPoint.x, this._endPoint.y);
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(ActiveLineBase.prototype, "coefficients", {
                get: function () {
                    return ActiveLineBase.getCoefficients(this._startPoint.x, this._startPoint.y, this._endPoint.x, this._endPoint.y);
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(ActiveLineBase.prototype, "info", {
                get: function () {
                    return {
                        x1: this._startPoint.x,
                        y1: this._startPoint.y,
                        x2: this._endPoint.x,
                        y2: this._endPoint.y
                    };
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(ActiveLineBase.prototype, "startPoint", {
                get: function () {
                    return this._startPoint;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(ActiveLineBase.prototype, "endPoint", {
                get: function () {
                    return this._endPoint;
                },
                enumerable: false,
                configurable: true
            });
            ActiveLineBase.getQuadrant = function (x1, y1, x2, y2) {
                if (x1 <= x2) {
                    if (y1 > y2) {
                        return 1;
                    }
                    else {
                        return 2;
                    }
                }
                else if (y1 < y2) {
                    return 3;
                }
                else {
                    return 4;
                }
            };
            ActiveLineBase.getAngle = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                switch (args.length) {
                    case 2:
                        {
                            var line1 = args[0];
                            var line2 = args[1];
                            var k1 = line1.coefficients ? line1.coefficients.k : 0;
                            var k2 = line2.coefficients ? line2.coefficients.k : 0;
                            var ret = Math.atan((k2 - k1) / (1 + (k1 * k2)));
                            if (ret < 0) {
                                return Math.PI + ret;
                            }
                            else {
                                return ret;
                            }
                        }
                    case 4:
                        {
                            var x0 = args[0], y0 = args[1], x1 = args[2], y1 = args[3];
                            var q = ActiveLineBase.getQuadrant(x0, y0, x1, y1);
                            switch (q) {
                                case 1:
                                    return (2 * Math.PI) - Math.atan((y0 - y1) / (x1 - x0));
                                case 2:
                                    return Math.atan((y1 - y0) / (x1 - x0));
                                case 3:
                                    return (Math.PI / 2) + Math.atan((x0 - x1) / (y1 - y0));
                                default:
                                    return Math.PI + Math.atan((y0 - y1) / (x0 - x1));
                            }
                        }
                    case 6:
                        {
                            var x0 = args[0], y0 = args[1], x1 = args[2], y1 = args[3];
                            var x2 = args[4], y2 = args[5];
                            var a1 = this.getAngle(x0, y0, x1, y1);
                            var a2 = this.getAngle(x0, y0, x2, y2);
                            var a = Math.abs(a1 - a2);
                            if (a > Math.PI) {
                                return 2 * Math.PI - a;
                            }
                            else {
                                return a;
                            }
                        }
                    default:
                        {
                            assert(false);
                        }
                }
            };
            ActiveLineBase.getLength = function (p1, p2) {
                var p = Point.sub(p1, p2);
                return Math.sqrt(p.x * p.x + p.y * p.y);
            };
            ActiveLineBase.setAngle = function (value, pivot_x, pivot_y, x2, y2) {
                var dx = pivot_x - x2;
                var dy = pivot_y - y2;
                var length = Math.sqrt(dx * dx + dy * dy);
                var x1 = pivot_x + Math.cos(value) * length;
                var y1 = pivot_y + Math.sin(value) * length;
                return Point.make(x2 - x1, y2 - y1);
            };
            ActiveLineBase.getY = function (x, coefficients) {
                return coefficients.k * x + coefficients.b;
            };
            ActiveLineBase.getX = function (y, coefficients) {
                return (y - coefficients.b) / coefficients.k;
            };
            ActiveLineBase.getCoefficients = function (x1, y1, x2, y2) {
                var dx = x2 - x1;
                if (dx) {
                    var dy = y2 - y1;
                    var k = dy / dx;
                    var b = y1 - x1 * k;
                    return { k: k, b: b };
                }
                else {
                    return null;
                }
            };
            ActiveLineBase.getLineDrawInfo = function (document, pivot, angle) {
                var offset = document.mouseArea.offset;
                var viewport_w = document.mouseArea.w;
                var viewport_h = document.mouseArea.h;
                var tan_angle = Math.tan(angle);
                if (tan_angle == 0) {
                    return { startPoint: Point.make(offset.x - viewport_w, pivot.y), endPoint: Point.make(offset.x + viewport_w * 2, pivot.y) };
                }
                var x0 = pivot.x - offset.x;
                var y0 = pivot.y - offset.y;
                var x1 = x0 - y0 / tan_angle;
                var y1 = 0;
                if (x1 < 0) {
                    y1 -= x1 * tan_angle;
                    x1 = 0;
                }
                else if (x1 > viewport_w) {
                    y1 -= (x1 - viewport_w) * tan_angle;
                    x1 = viewport_w;
                }
                y1 += offset.y;
                x1 += offset.x;
                var x2 = x0 - (y0 - viewport_h) / tan_angle;
                var y2 = viewport_h;
                if (x2 < 0) {
                    y2 -= x2 * tan_angle;
                    x2 = 0;
                }
                else if (x2 > viewport_w) {
                    y2 -= (x2 - viewport_w) * tan_angle;
                    x2 = viewport_w;
                }
                y2 += offset.y;
                x2 += offset.x;
                return { startPoint: Point.make(x1, y1), endPoint: Point.make(x2, y2) };
            };
            ActiveLineBase.getPoint = function (start_point, end_point, length) {
                var this_length = this.getLength(start_point, end_point);
                return Geoma.Utils.Point.make(start_point.x + (length * (end_point.x - start_point.x) / this_length), start_point.y + (length * (end_point.y - start_point.y) / this_length));
            };
            ActiveLineBase.prototype.mouseHit = function (__point) {
                return this.visible;
            };
            ActiveLineBase.prototype.setLength = function (__value, __fix_point) {
                assert(false, "Not implemented yet");
            };
            ActiveLineBase.prototype.getQuadrant = function (start) {
                assert(start);
                var end;
                if (start == this._startPoint) {
                    end = this._endPoint;
                }
                else {
                    end = this._startPoint;
                }
                return ActiveLineBase.getQuadrant(start.x, start.y, end.x, end.y);
            };
            ActiveLineBase.prototype.getAngle = function (start) {
                assert(start);
                var end;
                if (start == this._startPoint) {
                    end = this._endPoint;
                }
                else {
                    end = this._startPoint;
                }
                return ActiveLineBase.getAngle(start.x, start.y, end.x, end.y);
            };
            ActiveLineBase.prototype.setAngle = function (__value, __pivot_point) {
                assert(false, "Not implemented yet");
            };
            ActiveLineBase.prototype.through = function (p) {
                assert(this.isRelated(p));
                if (!Tools.PointLineSegment.intersected(p, this.startPoint, this.endPoint, Tools.Thickness.Calc)) {
                    var dx = this._startPoint.x - p.x;
                    var dy = this._startPoint.y - p.y;
                    var l1 = Math.sqrt(dx * dx + dy * dy);
                    dx = this._endPoint.x - p.x;
                    dy = this._endPoint.y - p.y;
                    var l2 = Math.sqrt(dx * dx + dy * dy);
                    if (l1 < l2) {
                        var a = ActiveLineBase.getAngle(this._endPoint.x, this._endPoint.y, p.x, p.y);
                        this.setAngle(a, this._endPoint);
                    }
                    else if (l1 > l2) {
                        var a = ActiveLineBase.getAngle(this._startPoint.x, this._startPoint.y, p.x, p.y);
                        this.setAngle(a, this._startPoint);
                    }
                }
            };
            ActiveLineBase.prototype.isPivot = function (point) {
                return this._startPoint == point || this._endPoint == point;
            };
            ActiveLineBase.prototype.addPoint = function (__point) {
                assert(false, "Not implemented yet");
            };
            ActiveLineBase.prototype.removePoint = function (__point) {
                assert(false, "Not implemented yet");
            };
            ActiveLineBase.prototype.setParallelTo = function (other_segment) {
                var start_angle_1 = ActiveLineBase.getAngle(this.startPoint.x, this.startPoint.y, this.endPoint.x, this.endPoint.y);
                var end_angle_1 = ActiveLineBase.getAngle(this.endPoint.x, this.endPoint.y, this.startPoint.x, this.startPoint.y);
                var start_angle_2 = ActiveLineBase.getAngle(other_segment.startPoint.x, other_segment.startPoint.y, other_segment.endPoint.x, other_segment.endPoint.y);
                var end_angle_2 = ActiveLineBase.getAngle(other_segment.endPoint.x, other_segment.endPoint.y, other_segment.startPoint.x, other_segment.startPoint.y);
                var rotate_angle_abs = 2 * Math.PI;
                var rotate_angle;
                var rotate_start = false;
                if (Math.abs(start_angle_1 - start_angle_2) < rotate_angle_abs) {
                    rotate_start = true;
                    rotate_angle = start_angle_2;
                    rotate_angle_abs = Math.abs(start_angle_1 - start_angle_2);
                }
                if (Math.abs(start_angle_1 - end_angle_2) < rotate_angle_abs) {
                    rotate_start = true;
                    rotate_angle = end_angle_2;
                    rotate_angle_abs = Math.abs(start_angle_1 - end_angle_2);
                }
                if (Math.abs(end_angle_1 - start_angle_2) < rotate_angle_abs) {
                    rotate_start = false;
                    rotate_angle = start_angle_2;
                    rotate_angle_abs = Math.abs(end_angle_1 - start_angle_2);
                }
                if (Math.abs(end_angle_1 - end_angle_2) < rotate_angle_abs) {
                    rotate_start = false;
                    rotate_angle = end_angle_2;
                    rotate_angle_abs = Math.abs(end_angle_1 - end_angle_2);
                }
                if (rotate_start) {
                    this.setAngle(rotate_angle, this.startPoint);
                }
                else {
                    this.setAngle(rotate_angle, this.endPoint);
                }
            };
            ActiveLineBase.prototype.getPoint = function (pivot, length) {
                assert(this.isPivot(pivot));
                var p2 = pivot == this.startPoint ? this.endPoint : this.startPoint;
                return ActiveLineBase.getPoint(pivot, p2, length);
            };
            ActiveLineBase.prototype.isRelated = function (p) {
                return this.points.includes(p);
            };
            ActiveLineBase.prototype.getNearestPoints = function (point) {
                var ret = new Array();
                var i = Tools.PointLine.intersection(point, this.startPoint, this.coefficients);
                var p1 = null;
                var l1 = null;
                var p2 = null;
                var l2 = null;
                var is_between = function (p1, l1, p2, l2) {
                    var p1p2_len = ActiveLineBase.getLength(p1, p2);
                    return p1p2_len >= l1 && p1p2_len >= l2;
                };
                for (var _i = 0, _a = this.points; _i < _a.length; _i++) {
                    var p = _a[_i];
                    var len = ActiveLineBase.getLength(i, p);
                    if (l1 === null) {
                        l1 = len;
                        p1 = p;
                    }
                    else if (l2 === null) {
                        assert(p1);
                        if (is_between(p1, l1, p, len)) {
                            l2 = len;
                            p2 = p;
                        }
                        else if (l1 > len) {
                            l1 = len;
                            p1 = p;
                        }
                    }
                    else {
                        assert(p1);
                        assert(p2);
                        if (is_between(p1, l1, p, len) && ActiveLineBase.getLength(p1, p2) > ActiveLineBase.getLength(p1, p)) {
                            p2 = p;
                            l2 = len;
                        }
                        else if (is_between(p, len, p2, l2) && ActiveLineBase.getLength(p1, p2) > ActiveLineBase.getLength(p, p2)) {
                            p1 = p;
                            l1 = len;
                        }
                    }
                }
                if (l1 !== null) {
                    assert(p1);
                    if (l2 !== null) {
                        assert(p2);
                        ret.push(p1);
                        ret.push(p2);
                    }
                    else {
                        ret.push(p1);
                    }
                }
                return ret;
            };
            ActiveLineBase.prototype.innerDraw = function (play_ground) {
                play_ground.context2d.beginPath();
                play_ground.context2d.lineWidth = this.lineWidth.value;
                play_ground.context2d.strokeStyle = this.selected ? this.selectedBrush.value : this.brush.value;
                play_ground.context2d.moveTo(this._startPoint.x, this._startPoint.y);
                play_ground.context2d.lineTo(this._endPoint.x, this._endPoint.y);
                play_ground.context2d.stroke();
            };
            ActiveLineBase.prototype.mouseMove = function (event) {
                this.selected = this.mouseHit(event);
                _super.prototype.mouseMove.call(this, event);
            };
            return ActiveLineBase;
        }(Tools.DocumentSprite));
        Tools.ActiveLineBase = ActiveLineBase;
    })(Tools = Geoma.Tools || (Geoma.Tools = {}));
})(Geoma || (Geoma = {}));
var Geoma;
(function (Geoma) {
    var Tools;
    (function (Tools) {
        var makeMod = Geoma.Utils.makeMod;
        var Point = Geoma.Utils.Point;
        var ActivePoint = (function (_super) {
            __extends(ActivePoint, _super);
            function ActivePoint(document, x, y, radius, line_width) {
                if (radius === void 0) { radius = 5; }
                if (line_width === void 0) { line_width = 2; }
                var _this = _super.call(this, document, x, y, radius, line_width, function () { return Tools.CurrentTheme.AdornerBrush; }, function () { return Tools.CurrentTheme.AdornerLineBrush; }, function () { return Tools.CurrentTheme.AdornerSelectLineBrush; }) || this;
                _this._dx = _this._dy = 0;
                _this._moved = new Geoma.Utils.Pulse();
                _this._mouseDownListener = document.mouseArea.onMouseDown.bind(_this, _this.mouseDown, true);
                _this._mouseUpListener = document.mouseArea.onMouseUp.bind(_this, _this.mouseUp, true);
                _this.addX(makeMod(_this, _this.dxModifier));
                _this.addY(makeMod(_this, _this.dyModifier));
                return _this;
            }
            ActivePoint.prototype.dispose = function () {
                var _a;
                if (!this.disposed) {
                    (_a = this._transaction) === null || _a === void 0 ? void 0 : _a.rollback();
                    this._mouseDownListener.dispose();
                    this._mouseUpListener.dispose();
                    _super.prototype.dispose.call(this);
                }
            };
            ActivePoint.prototype.move = function (dx, dy) {
                this._dx -= dx;
                this._dy -= dy;
                this.setMoved();
            };
            ActivePoint.prototype.isMoved = function (receiptor) {
                return this._moved.get(receiptor);
            };
            ActivePoint.prototype.serialize = function (context) {
                var data = _super.prototype.serialize.call(this, context);
                data.push(this.name);
                return data;
            };
            ActivePoint.prototype.setName = function (value, brush, style) {
                if (brush === void 0) { brush = function () { return Tools.CurrentTheme.AdornerNameBrush; }; }
                if (style === void 0) { style = function () { return Tools.CurrentTheme.AdornerNameStyle; }; }
                var text = _super.prototype.setName.call(this, value, brush, style);
                text.strokeBrush.value = Tools.CurrentTheme.AdornerStrokeBrush;
                text.strokeWidth.value = Tools.CurrentTheme.AdornerStrokeWidth;
                text.addX(makeMod(this, this.dxModifier));
                text.addY(makeMod(this, this.dyModifier));
                return text;
            };
            ActivePoint.deserialize = function (context, data, index) {
                if (data.length > (index + 2)) {
                    var point = new ActivePoint(context.document, parseFloat(data[index]), parseFloat(data[index + 1]));
                    point.setName(data[index + 2]);
                    return point;
                }
                else {
                    return null;
                }
            };
            ActivePoint.prototype.dxModifier = function (value) {
                return value + this._dx;
            };
            ActivePoint.prototype.dyModifier = function (value) {
                return value + this._dy;
            };
            ActivePoint.prototype.mouseClick = function (event) {
                var _this = this;
                if (this.mouseHit(event)) {
                    var doc_1 = this.document;
                    if (doc_1.canShowMenu(this)) {
                        var x = doc_1.mouseArea.mousePoint.x;
                        var y = doc_1.mouseArea.mousePoint.y;
                        var menu = new Tools.Menu(doc_1, x, y);
                        var menu_item = menu.addMenuItem(Tools.Resources.string("Создать линию..."));
                        menu_item.onChecked.bind(this, function () { return doc_1.setLineState(_this); });
                        menu_item = menu.addMenuItem(Tools.Resources.string("Создать отрезок..."));
                        menu_item.onChecked.bind(this, function () { return doc_1.setLineSegmentState(_this); });
                        menu_item = menu.addMenuItem(Tools.Resources.string("Создать окружность из центра..."));
                        menu_item.onChecked.bind(this, function () { return doc_1.setCirclRadiusState(_this); });
                        menu_item = menu.addMenuItem(Tools.Resources.string("Создать окружность на диаметре..."));
                        menu_item.onChecked.bind(this, function () { return doc_1.setCirclDiameterState(_this); });
                        menu_item = menu.addMenuItem(Tools.Resources.string("Удалить точку"));
                        menu_item.onChecked.bind(this, function () { return doc_1.removePoint(_this); });
                        menu.show();
                    }
                }
            };
            ActivePoint.prototype.mouseMove = function (event) {
                var _this = this;
                var selected = this.selected;
                if (this._dragStart) {
                    if (event.buttons != 0) {
                        var dpos = Point.sub(this._dragStart, event);
                        if (dpos.x != 0 || dpos.y != 0) {
                            if (!this._transaction) {
                                this._transaction = this.document.beginUndo(Tools.Resources.string("Перемещение точки {0}", this.name));
                            }
                            this.move(dpos.x, dpos.y);
                        }
                        this._dragStart = event;
                        event.cancelBubble = true;
                    }
                    else {
                        this.mouseUp(event);
                    }
                }
                _super.prototype.mouseMove.call(this, event);
                if (!selected && this.selected) {
                    this.setInfo(makeMod(this, function () { return "x: " + Geoma.Utils.toFixed(_this.x, Tools.CurrentTheme.CoordinatesPrecision) + ", y: " + Geoma.Utils.toFixed(_this.y, Tools.CurrentTheme.CoordinatesPrecision); }), Tools.CurrentTheme.PropertyTextBrush, Tools.CurrentTheme.PropertyTextStyle);
                }
                else if (selected && !this.selected) {
                    this.resetInfo();
                }
            };
            ActivePoint.prototype.mouseDown = function (event) {
                if (this.mouseHit(event)) {
                    this._dragStart = event;
                }
            };
            ActivePoint.prototype.mouseUp = function (__event) {
                var _a;
                if (this._dragStart) {
                    (_a = this._transaction) === null || _a === void 0 ? void 0 : _a.commit();
                    delete this._transaction;
                    delete this._dragStart;
                }
            };
            ActivePoint.prototype.setMoved = function () {
                this._moved.set();
            };
            return ActivePoint;
        }(Tools.ActivePointBase));
        Tools.ActivePoint = ActivePoint;
    })(Tools = Geoma.Tools || (Geoma.Tools = {}));
})(Geoma || (Geoma = {}));
var Geoma;
(function (Geoma) {
    var Tools;
    (function (Tools) {
        var makeMod = Geoma.Utils.makeMod;
        var toInt = Geoma.Utils.toInt;
        var assert = Geoma.Utils.assert;
        var ActiveCommonPoint = (function (_super) {
            __extends(ActiveCommonPoint, _super);
            function ActiveCommonPoint(document, x, y, group_no, radius, line_width) {
                if (radius === void 0) { radius = 5; }
                if (line_width === void 0) { line_width = 2; }
                var _this = _super.call(this, document, x, y, radius, line_width) || this;
                _this.groupNo = group_no;
                return _this;
            }
            Object.defineProperty(ActiveCommonPoint.prototype, "hidden", {
                get: function () {
                    var _a;
                    return ((_a = this._groupVisibility) === null || _a === void 0 ? void 0 : _a.value) === false;
                },
                enumerable: false,
                configurable: true
            });
            ActiveCommonPoint.prototype.dispose = function () {
                if (!this.disposed) {
                    _super.prototype.dispose.call(this);
                    delete this._groupVisibility;
                    if (this._intersection) {
                        this._intersection.dispose();
                        delete this._intersection;
                    }
                    for (var _i = 0, _a = this.document.getGroup(this); _i < _a.length; _i++) {
                        var point = _a[_i];
                        if (!point.disposed && point.mouseHit(this)) {
                            this.document.removePoint(point);
                        }
                    }
                    if (this._line2) {
                        this._line2.removePoint(this);
                        this._line2 = undefined;
                    }
                    if (this._line1) {
                        this._line1.removePoint(this);
                        this._line1 = undefined;
                    }
                }
            };
            ActiveCommonPoint.prototype.addGraphLine = function (segment) {
                var _this = this;
                var _a;
                assert(!this._line2);
                (_a = this._intersection) === null || _a === void 0 ? void 0 : _a.dispose();
                this.resetVisible();
                if (!this._line1) {
                    this._line1 = segment;
                    this._intersection = Tools.Intersection.makeIntersection(this, this._line1);
                    this.addVisible(makeMod(this, function () {
                        return _this._line1 !== undefined &&
                            _this._intersection != undefined &&
                            _this._intersection.visible &&
                            _this._line1.mouseHit(_this._intersection.point);
                    }));
                }
                else {
                    this._line2 = segment;
                    this._intersection = Tools.Intersection.makeIntersection(this, this._line1, this._line2);
                    this.addVisible(makeMod(this, function () {
                        return _this._line1 !== undefined &&
                            _this._line2 !== undefined &&
                            _this._intersection != undefined &&
                            _this._intersection.visible &&
                            _this._line1.mouseHit(_this._intersection.point) &&
                            _this._line2.mouseHit(_this._intersection.point);
                    }));
                }
            };
            ActiveCommonPoint.prototype.removeSegment = function (segment) {
                var line;
                if (this._line1 == segment) {
                    if (this._line2) {
                        line = this._line2;
                    }
                }
                else if (this._line2 == segment) {
                    if (this._line1) {
                        line = this._line1;
                    }
                }
                else {
                    assert(false);
                }
                this._line1 = this._line2 = undefined;
                if (line) {
                    this.addGraphLine(line);
                }
                else {
                    this.document.removePoint(this);
                }
            };
            ActiveCommonPoint.prototype.serialize = function (context) {
                var data = _super.prototype.serialize.call(this, context);
                data.push(this.groupNo.toString());
                return data;
            };
            ActiveCommonPoint.prototype.move = function (dx, dy) {
                if (this._line1 && !this._line2) {
                    this._intersection.move(dx, dy);
                }
            };
            ActiveCommonPoint.prototype.isMoved = function (receiptor) {
                var _a, _b;
                return _super.prototype.isMoved.call(this, receiptor) || ((_b = (_a = this._intersection) === null || _a === void 0 ? void 0 : _a.isMoved(receiptor)) !== null && _b !== void 0 ? _b : false);
            };
            ActiveCommonPoint.prototype.addGroupVisibility = function (visibility_modifier) {
                if (!this._groupVisibility) {
                    this._groupVisibility = new Geoma.Utils.ModifiableProperty(true);
                }
                this._groupVisibility.addModifier(visibility_modifier);
            };
            ActiveCommonPoint.deserialize = function (context, data, index) {
                if (data.length > (index + 2)) {
                    var group_no = -1;
                    if (context.version > Tools.Document.serializationVersion1) {
                        if (data.length > (index + 3)) {
                            group_no = toInt(data[index + 3]);
                        }
                        else {
                            return null;
                        }
                    }
                    var point = new ActiveCommonPoint(context.document, parseFloat(data[index]), parseFloat(data[index + 1]), group_no);
                    point.setName(data[index + 2]);
                    return point;
                }
                else {
                    return null;
                }
            };
            ActiveCommonPoint.prototype.dxModifier = function (value) {
                if (this._intersection) {
                    return value - this._intersection.dx;
                }
                else {
                    return _super.prototype.dxModifier.call(this, value);
                }
            };
            ActiveCommonPoint.prototype.dyModifier = function (value) {
                if (this._intersection) {
                    return value - this._intersection.dy;
                }
                else {
                    return _super.prototype.dyModifier.call(this, value);
                }
            };
            ActiveCommonPoint.prototype.innerDraw = function (play_ground) {
                if (!this.hidden) {
                    _super.prototype.innerDraw.call(this, play_ground);
                }
            };
            return ActiveCommonPoint;
        }(Tools.ActivePoint));
        Tools.ActiveCommonPoint = ActiveCommonPoint;
    })(Tools = Geoma.Tools || (Geoma.Tools = {}));
})(Geoma || (Geoma = {}));
var Geoma;
(function (Geoma) {
    var Tools;
    (function (Tools) {
        var makeMod = Geoma.Utils.makeMod;
        var toInt = Geoma.Utils.toInt;
        var Point = Geoma.Utils.Point;
        var assert = Geoma.Utils.assert;
        var ActiveLineSegment = (function (_super) {
            __extends(ActiveLineSegment, _super);
            function ActiveLineSegment(start, end, line_width, brush, selected_brush) {
                if (line_width === void 0) { line_width = Tools.CurrentTheme.ActiveLineSegmentWidth; }
                if (brush === void 0) { brush = Tools.CurrentTheme.ActiveLineSegmentBrush; }
                if (selected_brush === void 0) { selected_brush = Tools.CurrentTheme.ActiveLineSegmentSelectBrush; }
                var _this = _super.call(this, start.document, start, end, line_width, brush, selected_brush) || this;
                _this._mouseDownListener = _this.document.mouseArea.onMouseDown.bind(_this, _this.mouseDown);
                _this._mouseUpListener = _this.document.mouseArea.onMouseUp.bind(_this, _this.mouseUp);
                _this.addVisible(function (value) { return value && start.visible && end.visible; });
                return _this;
            }
            Object.defineProperty(ActiveLineSegment.prototype, "name", {
                get: function () {
                    var start_name = this.start.name;
                    var end_name = this.end.name;
                    if (start_name > end_name) {
                        return "" + end_name + start_name;
                    }
                    else {
                        return "" + start_name + end_name;
                    }
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(ActiveLineSegment.prototype, "start", {
                get: function () {
                    return this.startPoint;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(ActiveLineSegment.prototype, "end", {
                get: function () {
                    return this.endPoint;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(ActiveLineSegment.prototype, "quadrant", {
                get: function () {
                    return Tools.ActiveLineBase.getQuadrant(this.startPoint.x, this.startPoint.y, this.endPoint.x, this.endPoint.y);
                },
                set: function (value) {
                    var current_quadrant = this.quadrant;
                    var p2 = this.end;
                    switch (value) {
                        case 1:
                            switch (current_quadrant) {
                                case 1:
                                    break;
                                case 2:
                                    p2.move(0, 2 * this.projY);
                                    break;
                                case 3:
                                    p2.move(-(2 * this.projX), 2 * this.projY);
                                    break;
                                case 4:
                                    p2.move(-(2 * this.projX), 0);
                                    break;
                            }
                            break;
                        case 2:
                            switch (current_quadrant) {
                                case 1:
                                    p2.move(0, -(2 * this.projY));
                                    break;
                                case 2:
                                    break;
                                case 3:
                                    p2.move(-(2 * this.projX), 0);
                                    break;
                                case 4:
                                    p2.move(-(2 * this.projX), -(2 * this.projY));
                                    break;
                            }
                            break;
                        case 3:
                            switch (current_quadrant) {
                                case 1:
                                    p2.move(2 * this.projX, -(2 * this.projY));
                                    break;
                                case 2:
                                    p2.move(2 * this.projX, 0);
                                    break;
                                case 3:
                                    break;
                                case 4:
                                    p2.move(0, -(2 * this.projY));
                                    break;
                            }
                            break;
                        case 4:
                            switch (current_quadrant) {
                                case 1:
                                    p2.move(2 * this.projX, 0);
                                    break;
                                case 2:
                                    p2.move(2 * this.projX, 2 * this.projY);
                                    break;
                                case 3:
                                    p2.move(0, 2 * this.projY);
                                    break;
                                case 4:
                                    break;
                            }
                            break;
                        default:
                            assert(false, "quadrant value from 1 TO 4");
                    }
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(ActiveLineSegment.prototype, "fixedLength", {
                get: function () {
                    return this._fixed != null;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(ActiveLineSegment.prototype, "points", {
                get: function () {
                    var ret = new Array(this.start, this.end);
                    if (this._points) {
                        ret.push.apply(ret, this._points);
                    }
                    return ret;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(ActiveLineSegment.prototype, "isPartOf", {
                get: function () {
                    if (this.start instanceof Tools.ActiveCommonPoint || this.end instanceof Tools.ActiveCommonPoint) {
                        for (var i = 0; i < this.document.lines.length; i++) {
                            var line = this.document.lines.item(i);
                            if (this != line && line instanceof Tools.ActiveLineBase && line.isRelated(this.start) && line.isRelated(this.end)) {
                                return line;
                            }
                        }
                    }
                    return null;
                },
                enumerable: false,
                configurable: true
            });
            ActiveLineSegment.prototype.setPerpendicularTo = function (other_segment) {
                var common_point = other_segment.isRelated(this.start) ? this.start : this.end;
                assert(other_segment.isRelated(common_point));
                var start_angle = other_segment.getAngle(common_point);
                var end_angle = this.getAngle(common_point);
                switch (Tools.AngleIndicator.angleDifDirection(start_angle, end_angle)) {
                    case Tools.AngleDirection.anticlockwise:
                        this.setAngle(other_segment.getAngle(common_point) - Math.PI / 2, common_point);
                        break;
                    default:
                        this.setAngle(other_segment.getAngle(common_point) + Math.PI / 2, common_point);
                        break;
                }
            };
            ActiveLineSegment.prototype.setAngle = function (value, pivot_point) {
                var start_point = pivot_point !== null && pivot_point !== void 0 ? pivot_point : this.startPoint;
                var end_poin = (start_point == this.endPoint) ? this.startPoint : this.endPoint;
                var dp = Tools.ActiveLineBase.setAngle(value, start_point.x, start_point.y, end_poin.x, end_poin.y);
                if (end_poin instanceof Tools.ActivePoint) {
                    end_poin.move(dp.x, dp.y);
                }
            };
            ActiveLineSegment.prototype.setLength = function (value, fix_point) {
                assert(value > 0);
                assert(!this.fixedLength);
                var start, end;
                if (fix_point) {
                    start = fix_point;
                    if (start == this.start) {
                        end = this.end;
                    }
                    else {
                        end = this.start;
                    }
                }
                else {
                    start = this.start;
                    end = this.end;
                }
                var k = value / this.length;
                var x2 = start.x + (end.x - start.x) * k;
                var y2 = start.y + (end.y - start.y) * k;
                end.move(end.x - x2, end.y - y2);
            };
            ActiveLineSegment.prototype.dispose = function () {
                var _a;
                if (!this.disposed) {
                    (_a = this._transaction) === null || _a === void 0 ? void 0 : _a.rollback();
                    this._mouseDownListener.dispose();
                    this._mouseUpListener.dispose();
                    if (this._beforeDrawListener) {
                        this._beforeDrawListener.dispose();
                    }
                    if (this._points) {
                        for (var _i = 0, _b = this._points; _i < _b.length; _i++) {
                            var point = _b[_i];
                            point.removeSegment(this);
                        }
                    }
                    delete this._points;
                    _super.prototype.dispose.call(this);
                }
            };
            ActiveLineSegment.prototype.makeFixed = function () {
                assert(!this.fixedLength);
                this._fixed = __assign({ length: this.length }, this.info);
                this._beforeDrawListener = this.document.onBeforeDraw.bind(this, this.beforeDraw);
            };
            ActiveLineSegment.prototype.makeFree = function () {
                assert(this.fixedLength);
                assert(this._beforeDrawListener);
                delete this._fixed;
                this._beforeDrawListener.dispose();
                delete this._beforeDrawListener;
            };
            ActiveLineSegment.prototype.addPoint = function (point) {
                assert(!this.isRelated(point));
                assert(this.mouseHit(point));
                if (!this._points) {
                    this._points = [];
                }
                this._points.push(point);
            };
            ActiveLineSegment.prototype.removePoint = function (point) {
                assert(this.isRelated(point));
                assert(this._points);
                var index = this._points.indexOf(point);
                assert(index >= 0);
                this._points.splice(index, 1);
                point.removeSegment(this);
            };
            ActiveLineSegment.prototype.move = function (dx, dy) {
                this.start.move(dx, dy);
                this.end.move(dx, dy);
            };
            ActiveLineSegment.prototype.isMoved = function (receiptor) {
                return this.start.isMoved(receiptor) || this.end.isMoved(receiptor);
            };
            ActiveLineSegment.prototype.mouseHit = function (point) {
                return _super.prototype.mouseHit.call(this, point) && Tools.PointLineSegment.intersected(point, this.startPoint, this.endPoint, Tools.Thickness.Mouse);
            };
            ActiveLineSegment.prototype.serialize = function (context) {
                var data = [];
                data.push(context.points[this.start.name].toString());
                data.push(context.points[this.end.name].toString());
                if (this.fixedLength) {
                    data.push('f');
                }
                if (this._points) {
                    for (var _i = 0, _a = this._points; _i < _a.length; _i++) {
                        var point = _a[_i];
                        data.push("p" + context.points[point.name]);
                    }
                }
                return data;
            };
            ActiveLineSegment.deserialize = function (context, data, index) {
                if (data.length < (index + 1)) {
                    return null;
                }
                else {
                    var start_point = context.data.points.item(toInt(data[index]));
                    var end_point = context.data.points.item(toInt(data[index + 1]));
                    var line = new ActiveLineSegment(start_point, end_point);
                    for (var i = index + 2; i < data.length; i++) {
                        var chunck = data[i];
                        if (chunck == 'f') {
                            line.makeFixed();
                        }
                        else if (chunck.length && chunck.charAt(0) == 'p') {
                            var p_index = toInt(chunck.substring(1));
                            var point = context.data.points.item(p_index);
                            assert(point instanceof Tools.ActiveCommonPoint);
                            point.addGraphLine(line);
                            line.addPoint(point);
                        }
                        else {
                            return null;
                        }
                    }
                    return line;
                }
            };
            ActiveLineSegment.prototype.mouseMove = function (event) {
                if (this._dragStart) {
                    if (event.buttons != 0) {
                        var dpos = Point.sub(this._dragStart, event);
                        if (dpos.x != 0 || dpos.y != 0) {
                            if (!this._transaction) {
                                this._transaction = this.document.beginUndo(Tools.Resources.string("Перемещение сегмента {0}", this.name));
                            }
                            this.move(dpos.x, dpos.y);
                        }
                        this._dragStart = event;
                        event.cancelBubble = true;
                    }
                    else {
                        this.mouseUp(event);
                    }
                }
                _super.prototype.mouseMove.call(this, event);
            };
            ActiveLineSegment.prototype.mouseClick = function (event) {
                var _this = this;
                if (this.mouseHit(event)) {
                    var doc_2 = this.document;
                    if (doc_2.canShowMenu(this)) {
                        var x_1 = doc_2.mouseArea.mousePoint.x;
                        var y_1 = doc_2.mouseArea.mousePoint.y;
                        var menu = new Tools.Menu(doc_2, x_1, y_1);
                        var exists_other_segments = makeMod(this, function () { return doc_2.lines.length > 1; });
                        var menu_item = menu.addMenuItem(Tools.Resources.string("Обозначить угол..."));
                        menu_item.onChecked.bind(this, function () { return doc_2.setAngleIndicatorState(_this, event); });
                        menu_item.enabled.addModifier(exists_other_segments);
                        menu_item = menu.addMenuItem(Tools.Resources.string("Показать биссектрису угла..."));
                        menu_item.onChecked.bind(this, function () { return doc_2.setBisectorState(_this, event); });
                        menu_item.enabled.addModifier(exists_other_segments);
                        menu_item = menu.addMenuItem(Tools.Resources.string("Задать размер..."));
                        menu_item.onChecked.bind(this, function () {
                            var value = _this.document.prompt(Tools.Resources.string("Введите размер в пикселях"), Geoma.Utils.toInt(_this.length).toString());
                            if (value != null) {
                                var length_1 = Geoma.Utils.toInt(toInt(value));
                                if (length_1) {
                                    _this.setLength(length_1);
                                }
                                else {
                                    _this.document.alert(Tools.Resources.string("Введен недопустимый размер {0}", value));
                                }
                            }
                        });
                        menu_item.enabled.addModifier(makeMod(this, function () { return !_this.fixedLength; }));
                        menu_item = menu.addMenuItem(makeMod(this, function () {
                            return _this.fixedLength ? Tools.Resources.string("Изменяемый размер") : Tools.Resources.string("Фиксированный размер");
                        }));
                        menu_item.onChecked.bind(this, this.fixedLength ? this.makeFree : this.makeFixed);
                        menu_item = menu.addMenuItem(Tools.Resources.string("Сделать ||..."));
                        menu_item.onChecked.bind(this, function () { return doc_2.setParallelLineState(_this); });
                        menu_item.enabled.addModifier(exists_other_segments);
                        menu_item = menu.addMenuItem(Tools.Resources.string("Сделать ⟂..."));
                        menu_item.onChecked.bind(this, function () { return doc_2.setPerpendicularLineState(_this); });
                        menu_item.enabled.addModifier(exists_other_segments);
                        menu_item = menu.addMenuItem(Tools.Resources.string("Добавить точку"));
                        menu_item.onChecked.bind(this, function () { return doc_2.addPoint(Point.make(x_1, y_1)); });
                        menu_item = menu.addMenuItem(Tools.Resources.string("Удалить отрезок {0}", this.name));
                        menu_item.onChecked.bind(this, function () { return doc_2.removeLine(_this); });
                        menu.show();
                    }
                }
                _super.prototype.mouseClick.call(this, event);
            };
            ActiveLineSegment.prototype.mouseDown = function (event) {
                if (this.mouseHit(event)) {
                    this._dragStart = event;
                }
            };
            ActiveLineSegment.prototype.mouseUp = function (__event) {
                var _a;
                if (this._dragStart) {
                    (_a = this._transaction) === null || _a === void 0 ? void 0 : _a.commit();
                    delete this._dragStart;
                    delete this._transaction;
                }
            };
            ActiveLineSegment.prototype.beforeDraw = function (__event) {
                var _a, _b;
                assert(this._fixed);
                var precision = 1;
                if (toInt(this._fixed.x2 * precision) != toInt(this.end.x * precision) || toInt(this._fixed.y2 * precision) != toInt(this.end.y * precision)) {
                    var i = Tools.LineCircle.intersection(this, {
                        center: this.start,
                        radius: 1
                    });
                    var p = (_a = i.p1) !== null && _a !== void 0 ? _a : i.p2;
                    assert(p);
                    var new_x = p.x - (this.start.x - p.x) * this._fixed.length;
                    var new_y = p.y - (this.start.y - p.y) * this._fixed.length;
                    if (this._fixed.length < this.length) {
                        this.end.move(this.end.x - new_x, this.end.y - new_y);
                    }
                    else {
                        var dx = new_x - this.end.x;
                        var dy = new_y - this.end.y;
                        this.start.move(dx, dy);
                    }
                }
                else if (toInt(this._fixed.x1 * precision) != toInt(this.start.x * precision) || toInt(this._fixed.y1 * precision) != toInt(this.start.y * precision)) {
                    var i = Tools.LineCircle.intersection(this, {
                        center: this.end,
                        radius: 1
                    });
                    var p = (_b = i.p1) !== null && _b !== void 0 ? _b : i.p2;
                    assert(p);
                    var new_x = p.x - (this.end.x - p.x) * this._fixed.length;
                    var new_y = p.y - (this.end.y - p.y) * this._fixed.length;
                    if (this._fixed.length < this.length) {
                        this.start.move(this.start.x - new_x, this.start.y - new_y);
                    }
                    else {
                        var dx = new_x - this.start.x;
                        var dy = new_y - this.start.y;
                        this.end.move(dx, dy);
                    }
                }
                this._fixed.x1 = this.start.x;
                this._fixed.y1 = this.start.y;
                this._fixed.x2 = this.end.x;
                this._fixed.y2 = this.end.y;
            };
            return ActiveLineSegment;
        }(Tools.ActiveLineBase));
        Tools.ActiveLineSegment = ActiveLineSegment;
    })(Tools = Geoma.Tools || (Geoma.Tools = {}));
})(Geoma || (Geoma = {}));
var Geoma;
(function (Geoma) {
    var Tools;
    (function (Tools) {
        var ActiveVirtualPoint = (function (_super) {
            __extends(ActiveVirtualPoint, _super);
            function ActiveVirtualPoint(document, x, y) {
                var _this = _super.call(this, document, 0, 0, 0, 0, "", "", "") || this;
                var prop_x = Geoma.Utils.makeProp(x, 0);
                var prop_y = Geoma.Utils.makeProp(y, 0);
                _this.addX(function () { return prop_x.value; });
                _this.addY(function () { return prop_y.value; });
                return _this;
            }
            ActiveVirtualPoint.prototype.isMoved = function (_receiptor) {
                return false;
            };
            ActiveVirtualPoint.prototype.mouseClick = function () {
            };
            return ActiveVirtualPoint;
        }(Tools.ActivePointBase));
        Tools.ActiveVirtualPoint = ActiveVirtualPoint;
    })(Tools = Geoma.Tools || (Geoma.Tools = {}));
})(Geoma || (Geoma = {}));
var Geoma;
(function (Geoma) {
    var Tools;
    (function (Tools) {
        var makeMod = Geoma.Utils.makeMod;
        var toInt = Geoma.Utils.toInt;
        var Point = Geoma.Utils.Point;
        var assert = Geoma.Utils.assert;
        var ActiveLine = (function (_super) {
            __extends(ActiveLine, _super);
            function ActiveLine(start, end, line_width, brush, selected_brush) {
                if (line_width === void 0) { line_width = Tools.CurrentTheme.ActiveLineWidth; }
                if (brush === void 0) { brush = Tools.CurrentTheme.ActiveLineBrush; }
                if (selected_brush === void 0) { selected_brush = Tools.CurrentTheme.ActiveLineSelectBrush; }
                var _this = _super.call(this, start.document, start, end, line_width, brush, selected_brush) || this;
                _this._points = new Array(_this.startPoint, _this.endPoint);
                return _this;
            }
            Object.defineProperty(ActiveLine.prototype, "points", {
                get: function () {
                    return this._points;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(ActiveLine.prototype, "isPartOf", {
                get: function () {
                    return null;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(ActiveLine.prototype, "name", {
                get: function () {
                    var name1 = this.startPoint.name;
                    var name2 = this.endPoint.name;
                    if (name1 < name2) {
                        return "" + name1 + name2;
                    }
                    else {
                        return "" + name2 + name1;
                    }
                },
                enumerable: false,
                configurable: true
            });
            ActiveLine.prototype.dispose = function () {
                if (!this.disposed) {
                    if (this._points) {
                        for (var _i = 0, _a = this._points; _i < _a.length; _i++) {
                            var point = _a[_i];
                            if (!this.isPivot(point) && point instanceof Tools.ActiveCommonPoint) {
                                point.removeSegment(this);
                            }
                        }
                    }
                    _super.prototype.dispose.call(this);
                }
            };
            ActiveLine.prototype.move = function (__dx, __dy) {
                assert(false, "Not implemented yet");
            };
            ActiveLine.prototype.isMoved = function (receiptor) {
                return this.startPoint.isMoved(receiptor) || this.endPoint.isMoved(receiptor);
            };
            ActiveLine.prototype.serialize = function (context) {
                var data = [];
                data.push(context.points[this.startPoint.name].toString());
                data.push(context.points[this.endPoint.name].toString());
                if (this._points) {
                    for (var _i = 0, _a = this._points; _i < _a.length; _i++) {
                        var point = _a[_i];
                        data.push("p" + context.points[point.name]);
                    }
                }
                return data;
            };
            ActiveLine.prototype.mouseHit = function (point) {
                return this.visible && Tools.PointLine.intersected(point, this.startPoint, this.coefficients, Tools.Thickness.Mouse);
            };
            ActiveLine.prototype.addPoint = function (point) {
                assert(!this.isRelated(point));
                assert(this.mouseHit(point));
                this._points.push(point);
            };
            ActiveLine.prototype.removePoint = function (point) {
                assert(this.isRelated(point));
                var index = this._points.indexOf(point);
                assert(index >= 0);
                this._points.splice(index, 1);
                if (point instanceof Tools.ActiveCommonPoint) {
                    point.removeSegment(this);
                }
            };
            ActiveLine.deserialize = function (context, data, index) {
                if (data.length < (index + 1)) {
                    return null;
                }
                else {
                    var start_point = context.data.points.item(toInt(data[index]));
                    var end_point = context.data.points.item(toInt(data[index + 1]));
                    var line = new ActiveLine(start_point, end_point);
                    for (var i = index + 2; i < data.length; i++) {
                        var chunck = data[i];
                        if (chunck.length && chunck.charAt(0) == 'p') {
                            var p_index = toInt(chunck.substring(1));
                            var point = context.data.points.item(p_index);
                            if (!line.isRelated(point)) {
                                assert(point instanceof Tools.ActiveCommonPoint);
                                point.addGraphLine(line);
                                line.addPoint(point);
                            }
                        }
                        else {
                            return null;
                        }
                    }
                    return line;
                }
            };
            ActiveLine.prototype.mouseClick = function (event) {
                var _this = this;
                if (this.mouseHit(event)) {
                    var doc_3 = this.document;
                    if (doc_3.canShowMenu(this)) {
                        var x_2 = doc_3.mouseArea.mousePoint.x;
                        var y_2 = doc_3.mouseArea.mousePoint.y;
                        var menu = new Tools.Menu(doc_3, x_2, y_2);
                        var exists_other_segments = makeMod(this, function () { return doc_3.lines.length > 1; });
                        var menu_item = menu.addMenuItem(Tools.Resources.string("Обозначить угол..."));
                        menu_item.onChecked.bind(this, function () { return doc_3.setAngleIndicatorState(_this, event); });
                        menu_item.enabled.addModifier(exists_other_segments);
                        menu_item = menu.addMenuItem(Tools.Resources.string("Показать биссектрису угла..."));
                        menu_item.onChecked.bind(this, function () { return doc_3.setBisectorState(_this, event); });
                        menu_item.enabled.addModifier(exists_other_segments);
                        menu_item = menu.addMenuItem(Tools.Resources.string("Добавить точку"));
                        menu_item.onChecked.bind(this, function () { return doc_3.addPoint(Point.make(x_2, y_2)); });
                        menu_item = menu.addMenuItem(Tools.Resources.string("Сделать ||..."));
                        menu_item.onChecked.bind(this, function () { return doc_3.setParallelLineState(_this); });
                        menu_item.enabled.addModifier(exists_other_segments);
                        menu_item = menu.addMenuItem(Tools.Resources.string("Удалить линию {0}", this.name));
                        menu_item.onChecked.bind(this, function () { return doc_3.removeLine(_this); });
                        menu.show();
                    }
                }
                _super.prototype.mouseClick.call(this, event);
            };
            ActiveLine.prototype.innerDraw = function (play_ground) {
                var draw_info = Tools.ActiveLineBase.getLineDrawInfo(this.document, this.startPoint, this.angle);
                play_ground.context2d.beginPath();
                play_ground.context2d.lineWidth = this.lineWidth.value;
                play_ground.context2d.strokeStyle = this.selected ? this.selectedBrush.value : this.brush.value;
                play_ground.context2d.moveTo(draw_info.startPoint.x, draw_info.startPoint.y);
                play_ground.context2d.lineTo(draw_info.endPoint.x, draw_info.endPoint.y);
                play_ground.context2d.stroke();
            };
            ActiveLine.prototype.setAngle = function (value, pivot_point) {
                var start_point = pivot_point !== null && pivot_point !== void 0 ? pivot_point : this.startPoint;
                var end_poin = (start_point == this.endPoint) ? this.startPoint : this.endPoint;
                var dp = Tools.ActiveLineBase.setAngle(value, start_point.x, start_point.y, end_poin.x, end_poin.y);
                if (end_poin instanceof Tools.ActivePoint) {
                    end_poin.move(dp.x, dp.y);
                }
            };
            return ActiveLine;
        }(Tools.ActiveLineBase));
        Tools.ActiveLine = ActiveLine;
    })(Tools = Geoma.Tools || (Geoma.Tools = {}));
})(Geoma || (Geoma = {}));
var Geoma;
(function (Geoma) {
    var Tools;
    (function (Tools) {
        var Point = Geoma.Utils.Point;
        var BisectorLineCalculator = (function () {
            function BisectorLineCalculator(angle_indicator) {
                this._drawInfo = new Geoma.Utils.ModifiableProperty(function () {
                    var angle1 = angle_indicator.textAngle;
                    var angle2 = Math.PI + angle1;
                    return {
                        startPoint: Point.make(angle_indicator.commonPivot.x + BisectorLineCalculator._radius * Math.cos(angle1), angle_indicator.commonPivot.y + BisectorLineCalculator._radius * Math.sin(angle1)),
                        endPoint: Point.make(angle_indicator.commonPivot.x + BisectorLineCalculator._radius * Math.cos(angle2), angle_indicator.commonPivot.y + BisectorLineCalculator._radius * Math.sin(angle2))
                    };
                }, {
                    startPoint: Point.empty,
                    endPoint: Point.empty
                });
            }
            Object.defineProperty(BisectorLineCalculator.prototype, "drawInfo", {
                get: function () {
                    return this._drawInfo.value;
                },
                enumerable: false,
                configurable: true
            });
            BisectorLineCalculator._radius = 100;
            return BisectorLineCalculator;
        }());
        var BisectorLinePivot = (function (_super) {
            __extends(BisectorLinePivot, _super);
            function BisectorLinePivot(document, calculator, start) {
                var _this = this;
                if (start) {
                    _this = _super.call(this, document, function () { return calculator.drawInfo.startPoint.x; }, function () { return calculator.drawInfo.startPoint.y; }) || this;
                }
                else {
                    _this = _super.call(this, document, function () { return calculator.drawInfo.endPoint.x; }, function () { return calculator.drawInfo.endPoint.y; }) || this;
                }
                return _this;
            }
            return BisectorLinePivot;
        }(Tools.ActiveVirtualPoint));
        var BisectorLine = (function (_super) {
            __extends(BisectorLine, _super);
            function BisectorLine(angle_indicator, line_width, brush, selected_brush) {
                if (line_width === void 0) { line_width = Tools.CurrentTheme.BisectorLineWidth; }
                if (brush === void 0) { brush = Tools.CurrentTheme.BisectorBrush; }
                if (selected_brush === void 0) { selected_brush = Tools.CurrentTheme.BisectorSelectionBrush; }
                var _this = this;
                var calculator = new BisectorLineCalculator(angle_indicator);
                _this = _super.call(this, new BisectorLinePivot(angle_indicator.document, calculator, true), new BisectorLinePivot(angle_indicator.document, calculator, false), line_width, brush, selected_brush) || this;
                _this.points.splice(0, _this.points.length);
                _this.points.push(angle_indicator.commonPivot);
                _this._angleIndicator = angle_indicator;
                return _this;
            }
            BisectorLine.prototype.isMoved = function (receiptor) {
                return this._angleIndicator.isMoved(receiptor);
            };
            BisectorLine.prototype.mouseClick = function (event) {
                var _this = this;
                if (this.mouseHit(event)) {
                    var doc_4 = this.document;
                    if (doc_4.canShowMenu(this)) {
                        var x_3 = doc_4.mouseArea.mousePoint.x;
                        var y_3 = doc_4.mouseArea.mousePoint.y;
                        var menu = new Tools.Menu(doc_4, x_3, y_3);
                        var menu_item = menu.addMenuItem(Tools.Resources.string("Обозначить угол..."));
                        menu_item.onChecked.bind(this, function () { return doc_4.setAngleIndicatorState(_this, event); });
                        menu_item = menu.addMenuItem(Tools.Resources.string("Показать биссектрису угла..."));
                        menu_item.onChecked.bind(this, function () { return doc_4.setBisectorState(_this, event); });
                        menu_item = menu.addMenuItem(Tools.Resources.string("Добавить точку"));
                        menu_item.onChecked.bind(this, function () { return doc_4.addPoint(Point.make(x_3, y_3)); });
                        menu_item = menu.addMenuItem(Tools.Resources.string("Удалить биссектрису"));
                        menu_item.onChecked.bind(this, function () { return _this._angleIndicator.removeBisector(_this); });
                        menu.show();
                    }
                }
                _super.prototype.mouseClick.call(this, event);
            };
            return BisectorLine;
        }(Tools.ActiveLine));
        Tools.BisectorLine = BisectorLine;
    })(Tools = Geoma.Tools || (Geoma.Tools = {}));
})(Geoma || (Geoma = {}));
var Geoma;
(function (Geoma) {
    var Tools;
    (function (Tools) {
        var makeMod = Geoma.Utils.makeMod;
        var makeProp = Geoma.Utils.makeProp;
        var toInt = Geoma.Utils.toInt;
        var Point = Geoma.Utils.Point;
        var assert = Geoma.Utils.assert;
        var CircleLineKind;
        (function (CircleLineKind) {
            CircleLineKind[CircleLineKind["Radius"] = 0] = "Radius";
            CircleLineKind[CircleLineKind["Diameter"] = 1] = "Diameter";
        })(CircleLineKind = Tools.CircleLineKind || (Tools.CircleLineKind = {}));
        var ActiveCircleLine = (function (_super) {
            __extends(ActiveCircleLine, _super);
            function ActiveCircleLine(document, kind, point1, point2, line_width, brush, selected_brush) {
                if (line_width === void 0) { line_width = Tools.CurrentTheme.ActiveCircleWidth; }
                if (brush === void 0) { brush = Tools.CurrentTheme.ActiveCircleBrush; }
                if (selected_brush === void 0) { selected_brush = Tools.CurrentTheme.ActiveCircleSelectBrush; }
                var _this = this;
                assert(document);
                assert(point1);
                assert(point2);
                var stub = (function (_super) {
                    __extends(stub, _super);
                    function stub() {
                        return _super !== null && _super.apply(this, arguments) || this;
                    }
                    stub.prototype.innerDraw = function (__play_ground) {
                        throw new Error("Method not implemented.");
                    };
                    return stub;
                }(Geoma.Sprite.Sprite));
                _this = _super.call(this, document, new stub()) || this;
                _this._point1 = point1;
                _this._point2 = point2;
                _this.kind = kind;
                _this.lineWidth = makeProp(line_width, 1);
                _this.brush = makeProp(brush, "Black");
                _this.selectedBrush = makeProp(selected_brush, "Black");
                _this._radius = makeProp(makeMod(_this, function () {
                    var dx = _this._point1.x - _this._point2.x;
                    var dy = _this._point1.y - _this._point2.y;
                    var ret = Math.sqrt(dx * dx + dy * dy);
                    switch (_this.kind) {
                        case CircleLineKind.Radius:
                            return ret;
                        case CircleLineKind.Diameter:
                            return ret / 2;
                        default:
                            assert(false);
                    }
                }), 1);
                _this.addVisible(makeMod(_this, function (value) { return value && _this._point1.visible && _this._point2.visible; }));
                _this._mouseDownListener = _this.document.mouseArea.onMouseDown.bind(_this, _this.mouseDown);
                _this._mouseUpListener = _this.document.mouseArea.onMouseUp.bind(_this, _this.mouseUp);
                return _this;
            }
            Object.defineProperty(ActiveCircleLine.prototype, "center", {
                get: function () {
                    switch (this.kind) {
                        case CircleLineKind.Radius:
                            return this.point1;
                        case CircleLineKind.Diameter:
                            return {
                                x: (this.point1.x + this.point2.x) / 2,
                                y: (this.point1.y + this.point2.y) / 2
                            };
                        default:
                            assert(false);
                    }
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(ActiveCircleLine.prototype, "point1", {
                get: function () {
                    return this._point1;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(ActiveCircleLine.prototype, "point2", {
                get: function () {
                    return this._point2;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(ActiveCircleLine.prototype, "radius", {
                get: function () {
                    return this._radius.value;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(ActiveCircleLine.prototype, "name", {
                get: function () {
                    var prefix;
                    switch (this.kind) {
                        case CircleLineKind.Radius:
                            prefix = "R";
                            break;
                        case CircleLineKind.Diameter:
                            prefix = "D";
                            break;
                        default:
                            assert(false);
                    }
                    var name1 = this._point1.name;
                    var name2 = this._point2.name;
                    if (name1 < name2) {
                        return prefix + "(" + name1 + name2 + ")";
                    }
                    else {
                        return prefix + "(" + name2 + name1 + ")";
                    }
                },
                enumerable: false,
                configurable: true
            });
            ActiveCircleLine.prototype.dispose = function () {
                var _a;
                if (!this.disposed) {
                    (_a = this._transaction) === null || _a === void 0 ? void 0 : _a.rollback();
                    this._mouseDownListener.dispose();
                    this._mouseUpListener.dispose();
                    _super.prototype.dispose.call(this);
                }
            };
            ActiveCircleLine.prototype.isPivot = function (point) {
                return this._point1 == point || this._point2 == point;
            };
            ActiveCircleLine.prototype.isRelated = function (point) {
                if (this.isPivot(point)) {
                    return true;
                }
                else if (this._points) {
                    for (var _i = 0, _a = this._points; _i < _a.length; _i++) {
                        var p = _a[_i];
                        if (p == point) {
                            return true;
                        }
                    }
                }
                return false;
            };
            ActiveCircleLine.prototype.mouseHit = function (point) {
                return Tools.PointCircle.isIntersected(point, this, Tools.Thickness.Mouse);
            };
            ActiveCircleLine.prototype.addPoint = function (point) {
                assert(!this.isRelated(point));
                assert(this.mouseHit(point));
                if (!this._points) {
                    this._points = [];
                }
                this._points.push(point);
            };
            ActiveCircleLine.prototype.removePoint = function (point) {
                assert(this.isRelated(point));
                assert(this._points);
                var index = this._points.indexOf(point);
                assert(index >= 0);
                this._points.splice(index, 1);
                point.removeSegment(this);
            };
            ActiveCircleLine.prototype.serialize = function (context) {
                var data = [];
                data.push(this.kind.toString());
                data.push(context.points[this.point1.name].toString());
                data.push(context.points[this.point2.name].toString());
                if (this._points) {
                    for (var _i = 0, _a = this._points; _i < _a.length; _i++) {
                        var point = _a[_i];
                        data.push("p" + context.points[point.name]);
                    }
                }
                return data;
            };
            ActiveCircleLine.prototype.move = function (dx, dy) {
                this.point1.move(dx, dy);
                this.point2.move(dx, dy);
            };
            ActiveCircleLine.deserialize = function (context, data, index) {
                if (data.length > (index + 2)) {
                    var kind = toInt(data[index]);
                    var center = context.data.points.item(toInt(data[index + 1]));
                    var pivot = context.data.points.item(toInt(data[index + 2]));
                    switch (kind) {
                        case CircleLineKind.Radius:
                        case CircleLineKind.Diameter:
                            break;
                        default:
                            return null;
                    }
                    var circle = new ActiveCircleLine(context.document, kind, center, pivot);
                    for (var i = index + 3; i < data.length; i++) {
                        var chunck = data[i];
                        var p_index = toInt(chunck.substring(1));
                        var point = context.data.points.item(p_index);
                        assert(point instanceof Tools.ActiveCommonPoint);
                        point.addGraphLine(circle);
                        circle.addPoint(point);
                    }
                    return circle;
                }
                else {
                    return null;
                }
            };
            ActiveCircleLine.getX = function (y, x0, y0, r) {
                var dy = y - y0;
                if (dy > r) {
                    return null;
                }
                else {
                    return Math.sqrt(r * r - dy * dy) + x0;
                }
            };
            ActiveCircleLine.getY = function (x, x0, y0, r) {
                var dx = x - x0;
                if (dx > r) {
                    return null;
                }
                else {
                    return Math.sqrt(r * r - dx * dx) + y0;
                }
            };
            ActiveCircleLine.prototype.innerDraw = function (play_groun) {
                play_groun.context2d.beginPath();
                play_groun.context2d.strokeStyle = this.selected ? this.selectedBrush.value : this.brush.value;
                play_groun.context2d.lineWidth = this.lineWidth.value;
                var center = this.center;
                play_groun.context2d.arc(center.x, center.y, this.radius, 0, Math.PI * 2);
                play_groun.context2d.stroke();
            };
            ActiveCircleLine.prototype.mouseMove = function (event) {
                _super.prototype.mouseMove.call(this, event);
                if (this._dragStart) {
                    if (event.buttons != 0) {
                        var dpos = Point.sub(this._dragStart, event);
                        if (dpos.x != 0 || dpos.y != 0) {
                            if (!this._transaction) {
                                this._transaction = this.document.beginUndo(Tools.Resources.string("Перемещение окружности {0}", this.name));
                            }
                            this.move(dpos.x, dpos.y);
                        }
                        this._dragStart = event;
                        event.cancelBubble = true;
                    }
                    else {
                        this.mouseUp(event);
                    }
                }
                this.selected = this.mouseHit(event);
                _super.prototype.mouseMove.call(this, event);
            };
            ActiveCircleLine.prototype.mouseClick = function (event) {
                var _this = this;
                if (this.mouseHit(event)) {
                    var doc_5 = this.document;
                    if (doc_5.canShowMenu(this)) {
                        var x_4 = doc_5.mouseArea.mousePoint.x;
                        var y_4 = doc_5.mouseArea.mousePoint.y;
                        var menu = new Tools.Menu(doc_5, x_4, y_4);
                        var menu_item = menu.addMenuItem(Tools.Resources.string("Добавить точку"));
                        menu_item.onChecked.bind(this, function () { return doc_5.addPoint(Point.make(x_4, y_4)); });
                        menu_item = menu.addMenuItem(Tools.Resources.string("Удалить окружность {0}", this.name));
                        menu_item.onChecked.bind(this, function () { return doc_5.removeCircleLine(_this); });
                        menu.show();
                    }
                }
            };
            ActiveCircleLine.prototype.mouseDown = function (event) {
                if (this.mouseHit(event)) {
                    this._dragStart = event;
                }
            };
            ActiveCircleLine.prototype.mouseUp = function (__event) {
                var _a;
                if (this._dragStart) {
                    (_a = this._transaction) === null || _a === void 0 ? void 0 : _a.commit();
                    delete this._dragStart;
                    delete this._transaction;
                }
            };
            return ActiveCircleLine;
        }(Tools.DocumentSprite));
        Tools.ActiveCircleLine = ActiveCircleLine;
    })(Tools = Geoma.Tools || (Geoma.Tools = {}));
})(Geoma || (Geoma = {}));
var Geoma;
(function (Geoma) {
    var Tools;
    (function (Tools) {
        var makeMod = Geoma.Utils.makeMod;
        var makeProp = Geoma.Utils.makeProp;
        var toInt = Geoma.Utils.toInt;
        var Point = Geoma.Utils.Point;
        var assert = Geoma.Utils.assert;
        var ParametricLine = (function (_super) {
            __extends(ParametricLine, _super);
            function ParametricLine(document, line_width, brush, selected_brush, axes) {
                var _this = this;
                var stub = (function (_super) {
                    __extends(stub, _super);
                    function stub() {
                        return _super !== null && _super.apply(this, arguments) || this;
                    }
                    stub.prototype.innerDraw = function (__play_ground) {
                        throw new Error("Method not implemented.");
                    };
                    return stub;
                }(Geoma.Sprite.Sprite));
                _this = _super.call(this, document, new stub()) || this;
                _this.axes = axes;
                _this.axes.addLine(_this);
                _this.lineWidth = makeProp(line_width, 1);
                _this.brush = makeProp(brush, "Black");
                _this.selectedBrush = makeProp(selected_brush, "Black");
                _this._dx = 1;
                _this._args = {};
                _this._argX = NaN;
                _this._argY = NaN;
                _this._derivativeLevel = 0;
                _this._function = makeMod(_this, function () { return _this.document.alert('No any code'); });
                _this._mouseDownListener = document.mouseArea.onMouseDown.bind(_this, _this.mouseDown);
                _this._mouseUpListener = document.mouseArea.onMouseUp.bind(_this, _this.mouseUp);
                _this._screenSamples = [];
                _this._suppressModified = false;
                _this._isModified = new Geoma.Utils.Pulse();
                _this._id = _this.axes.axesId + "-" + ParametricLine._idSource.inc() + "-{47705e19-541a-4f59-b0c0-34edd1f6fefa}";
                return _this;
            }
            Object.defineProperty(ParametricLine.prototype, "dx", {
                get: function () {
                    return this._dx;
                },
                set: function (value) {
                    this._dx = value;
                    this.setModified();
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(ParametricLine.prototype, "code", {
                get: function () {
                    var _a;
                    return (_a = this._code) !== null && _a !== void 0 ? _a : new Geoma.Syntax.CodeLiteral(0);
                },
                set: function (value) {
                    this._code = value;
                    this._function = Geoma.Utils.makeEvaluator(this, this._code.code);
                    this._derivativeLevel = this._code.derivativeLevel;
                    this.setModified();
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(ParametricLine.prototype, "symmetric", {
                get: function () {
                    return this.code instanceof Geoma.Syntax.CodeUnary && this.code.function == "±";
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(ParametricLine.prototype, "derivativeLevel", {
                get: function () {
                    return this._derivativeLevel;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(ParametricLine.prototype, "points", {
                get: function () {
                    var _a;
                    return (_a = this._points) !== null && _a !== void 0 ? _a : null;
                },
                enumerable: false,
                configurable: true
            });
            ParametricLine.prototype.dispose = function () {
                var _a;
                if (!this.disposed) {
                    (_a = this._transaction) === null || _a === void 0 ? void 0 : _a.rollback();
                    this._mouseDownListener.dispose();
                    this._mouseUpListener.dispose();
                    if (this.selected) {
                        this.document.removeSelectedSprite(this);
                    }
                    for (var key in this._args) {
                        this._args[key].reset();
                    }
                    this.axes.removeLine(this);
                    _super.prototype.dispose.call(this);
                }
            };
            ParametricLine.prototype.screenY = function (screen_x) {
                var offset_screen_x = screen_x - this.document.mouseArea.offset.x;
                if (offset_screen_x >= 0 && offset_screen_x < this._screenSamples.length) {
                    return this._screenSamples[toInt(offset_screen_x)];
                }
                else {
                    for (var x = offset_screen_x - (this._derivativeLevel * 2); x < offset_screen_x; x++) {
                        this.getY(this.axes.fromScreenX(x));
                    }
                    return this.axes.toScreenY(this.getY(this.axes.fromScreenX(offset_screen_x)));
                }
            };
            ParametricLine.prototype.screenSymmetricY = function (screen_x) {
                assert(this.symmetric);
                return 2 * this.axes.y - this.screenY(screen_x);
            };
            ParametricLine.prototype.getFunction = function (name) {
                if (this._functions) {
                    return this._functions[name];
                }
                else {
                    return null;
                }
            };
            ParametricLine.prototype.addFunction = function (name, code) {
                if (!this._functions) {
                    this._functions = {};
                }
                this._functions[name] = Geoma.Utils.makeEvaluator(this, code);
                this.setModified();
            };
            ParametricLine.prototype.hasArg = function (name) {
                return name in this._args;
            };
            ParametricLine.prototype.addArg = function (name, arg) {
                assert(!this._args[name]);
                this._args[name] = makeProp(arg, NaN);
            };
            ParametricLine.prototype.arg = function (name) {
                switch (name) {
                    case "x":
                        return this._argX;
                    default:
                        assert(this._args[name]);
                        return this._args[name].value;
                }
            };
            ParametricLine.prototype.setArg = function (name, value) {
                switch (name) {
                    case "x":
                        throw assert(false);
                    default:
                        assert(this._args[name]);
                        this._args[name] = makeProp(value, NaN);
                        this.setModified();
                        break;
                }
            };
            ParametricLine.prototype.mouseHit = function (point) {
                return Tools.PointParametric.intersected(point, this, Tools.Thickness.Mouse);
            };
            ParametricLine.prototype.move = function (dx, dy) {
                this.axes.move(dx, dy);
            };
            ParametricLine.prototype.isMoved = function (receiptor) {
                return this.axes.isMoved(receiptor);
            };
            ParametricLine.prototype.isModified = function (receiptor) {
                if (this._isModified.get(receiptor)) {
                    return true;
                }
                else {
                    if (this.points) {
                        for (var _i = 0, _a = this.points; _i < _a.length; _i++) {
                            var point = _a[_i];
                            if (point.isMoved(receiptor)) {
                                return true;
                            }
                        }
                    }
                    return false;
                }
            };
            ParametricLine.prototype.setModified = function () {
                if (!this._suppressModified) {
                    this._isModified.set();
                }
            };
            ParametricLine.prototype.showExpressionEditor = function () {
                var _this = this;
                var dialog = new Tools.ExpressionDialog(this.document, makeMod(this, function () { return _this.document.mouseArea.offset.x + (_this.document.mouseArea.w / 2 - _this.document.mouseArea.w / 10) / _this.document.mouseArea.ratio; }), makeMod(this, function () { return _this.document.mouseArea.offset.y + (_this.document.mouseArea.h / 2 - _this.document.mouseArea.h / 10) / _this.document.mouseArea.ratio; }), this.code);
                dialog.onEnter.bind(this, function (event) {
                    if (event.detail) {
                        var expression_info_1 = event.detail;
                        Tools.UndoTransaction.Do(_this, Tools.Resources.string("Редактирование функции {0}", _this.code.text), function () { return _this.editCode(expression_info_1); });
                    }
                    _this.document.remove(dialog);
                    dialog.dispose();
                });
                this.document.push(dialog);
            };
            ParametricLine.prototype.isRelated = function (point) {
                if (this._points) {
                    for (var _i = 0, _a = this._points; _i < _a.length; _i++) {
                        var p = _a[_i];
                        if (p == point) {
                            return true;
                        }
                    }
                }
                return false;
            };
            ParametricLine.prototype.addPoint = function (point) {
                this._addPoint(point);
            };
            ParametricLine.prototype.removePoint = function (point) {
                assert(this.isRelated(point));
                assert(this._points);
                var index = this._points.indexOf(point);
                assert(index >= 0);
                this._points.splice(index, 1);
                if (point instanceof Tools.ActiveCommonPoint) {
                    point.removeSegment(this);
                }
            };
            ParametricLine.prototype.serialize = function (context) {
                var data = [];
                data.push("" + this.axes.axesId);
                if (this._points) {
                    for (var _i = 0, _a = this._points; _i < _a.length; _i++) {
                        var point = _a[_i];
                        data.push("p" + context.points[point.name]);
                    }
                }
                data.push("f");
                this.code.serialize(data);
                return data;
            };
            ParametricLine.deserialize = function (context, data, index) {
                if (data.length < (index + 2)) {
                    return null;
                }
                else {
                    var line_1 = new ParametricLine(context.document, function () { return Tools.CurrentTheme.ParametricLineWidth; }, function () { return Tools.CurrentTheme.ParametricLineBrush; }, function () { return Tools.CurrentTheme.ParametricLineSelectBrush; }, context.data.axes.item(toInt(data[index++])));
                    var points = new Array();
                    while (data[index].charAt(0) == "p") {
                        var chunck = data[index++];
                        var p_index = toInt(chunck.substring(1));
                        var point = context.data.points.item(p_index);
                        points.push(point);
                    }
                    if (data[index++] == "f") {
                        line_1.code = Geoma.Syntax.CodeElement.deserialize(data, index).code;
                    }
                    line_1.code.visitArguments(function (arg) {
                        if (!(arg instanceof Geoma.Syntax.CodeArgumentX)) {
                            var arg_name = arg.text;
                            if (!line_1.hasArg(arg_name)) {
                                var arg_modifier = context.document.getArgModifier(arg_name, line_1);
                                assert(arg_modifier);
                                line_1.addArg(arg_name, arg_modifier);
                            }
                        }
                    });
                    line_1.updateSamples(context.document.mouseArea);
                    for (var _i = 0, points_2 = points; _i < points_2.length; _i++) {
                        var point = points_2[_i];
                        if (point instanceof Tools.ActiveCommonPoint) {
                            if (!line_1.isRelated(point)) {
                                line_1._addPoint(point);
                                point.addGraphLine(line_1);
                            }
                        }
                    }
                    return line_1;
                }
            };
            ParametricLine.calcSamples = function (screen_box, dx, contains_derivative, adapter) {
                var needs_move = false;
                var last_sign = 0;
                var last_is_nan = true;
                var last_y = NaN;
                var samples_length = 0;
                var offscreen_top = -(screen_box.h - screen_box.top);
                var offscreen_bottom = (2 * screen_box.h) + screen_box.top;
                var minimum_dx = 1e-11;
                var line_to = function (x, y) {
                    adapter.lineTo(x, y, needs_move);
                    needs_move = false;
                    var integer_x = Math.floor(x) - screen_box.left;
                    assert(samples_length > integer_x);
                    adapter.setSample(integer_x, y);
                };
                var line_to_offscreen = function (x, last_sign, y) {
                    switch (last_sign) {
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
                    if (Math.sign(y) == -1) {
                        adapter.lineTo(x, offscreen_top, true);
                    }
                    else {
                        adapter.lineTo(x, offscreen_bottom, true);
                    }
                };
                var sign = function (x, y1, y2) {
                    if (x) {
                        var sign_1 = Math.sign(y2 - y1);
                        if (sign_1 == 0) {
                            return 0;
                        }
                        else if (sign_1 > 0) {
                            return 1;
                        }
                        else {
                            return -1;
                        }
                    }
                    else {
                        return 0;
                    }
                };
                var is_infinite = function (value) { return !isFinite(value) && !isNaN(value); };
                var right_nan = function (x) {
                    var local_dx = dx / 2;
                    var start_x = x - dx;
                    for (var x1 = start_x; x1 <= x; x1 += local_dx) {
                        var y1 = adapter.getScreenY(x1);
                        if (isNaN(y1)) {
                            x1 -= local_dx;
                            local_dx /= 2;
                            x1 -= local_dx;
                            if (local_dx <= minimum_dx) {
                                for (; x1 > start_x; x1 -= minimum_dx) {
                                    var y2 = adapter.getScreenY(x1);
                                    if (!isNaN(y2)) {
                                        needs_move = false;
                                        line_to(x1, y2);
                                        break;
                                    }
                                }
                                break;
                            }
                        }
                    }
                };
                var left_nan = function (x) {
                    var local_dx = dx / 2;
                    var end_x = x - dx;
                    for (var x1 = x; x1 >= end_x; x1 -= local_dx) {
                        var y1 = adapter.getScreenY(x1);
                        if (isNaN(y1)) {
                            x1 += local_dx;
                            local_dx /= 2;
                            x1 += local_dx;
                            if (local_dx <= minimum_dx) {
                                for (; x1 < x; x1 += minimum_dx) {
                                    var y2 = adapter.getScreenY(x1);
                                    if (!isNaN(y2)) {
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
                };
                for (var x = screen_box.left; x < screen_box.right; x += dx) {
                    var integer_x = (samples_length + screen_box.left) == Math.floor(x);
                    var y = adapter.getScreenY(x);
                    if (integer_x) {
                        adapter.addSample();
                        samples_length++;
                    }
                    if (isNaN(y)) {
                        if (!last_is_nan) {
                            last_is_nan = true;
                            if (!contains_derivative) {
                                right_nan.call(this, x);
                            }
                        }
                        needs_move = true;
                    }
                    else {
                        var offscreen_break = false;
                        var new_sign = sign(x, last_y, y);
                        if (last_sign == 0) {
                            last_sign = new_sign;
                        }
                        else if (last_sign != new_sign && !contains_derivative) {
                            var local_dx = dx / 2;
                            for (var x1 = x - dx; x1 <= x && local_dx > minimum_dx; x1 = (x1 < x) ? Math.min(x1 + local_dx, x) : (x1 + local_dx)) {
                                var y1 = adapter.getScreenY(x1);
                                if (is_infinite(y1)) {
                                    line_to_offscreen(x1, last_sign, y1);
                                    offscreen_break = true;
                                    break;
                                }
                                else if ((last_sign == 1 && last_y > y1) || (last_sign == -1 && last_y < y1)) {
                                    x1 -= local_dx;
                                    local_dx /= 2;
                                    x1 -= local_dx;
                                    if ((last_sign == 1 && y1 <= offscreen_top) || (last_sign == -1 && y1 >= offscreen_bottom)) {
                                        line_to_offscreen(x1, last_sign, y1);
                                        offscreen_break = true;
                                        break;
                                    }
                                }
                                else {
                                    last_y = y1;
                                }
                            }
                            last_sign = new_sign;
                        }
                        if (!offscreen_break && (needs_move || integer_x)) {
                            line_to(x, Geoma.Utils.limit(y, offscreen_top, offscreen_bottom));
                        }
                        if (last_is_nan && !contains_derivative) {
                            left_nan.call(this, x);
                        }
                        last_is_nan = false;
                    }
                    last_y = y;
                }
                assert(samples_length == screen_box.w, "Logical error");
            };
            ParametricLine.prototype.editCode = function (expression_info) {
                var last_args = this._args;
                this.code = expression_info.expression;
                this._args = {};
                this.document.realizeGraphArguments(this, expression_info.argValues);
                for (var key in this._args) {
                    if (key in last_args) {
                        this._args[key] = last_args[key];
                        delete last_args[key];
                    }
                }
                for (var key in last_args) {
                    last_args[key].reset();
                }
            };
            ParametricLine.prototype.updateSamples = function (mouse_area) {
                var draw_adapter = (function () {
                    function draw_adapter(owner) {
                        this.drawPath = new Path2D();
                        this.samples = new Array();
                        this.owner = owner;
                    }
                    draw_adapter.prototype.getScreenY = function (screen_x) {
                        return this.owner.axes.toScreenY(this.owner.getY(this.owner.axes.fromScreenX(screen_x)));
                    };
                    draw_adapter.prototype.lineTo = function (x, y, discontinuity) {
                        if (discontinuity) {
                            this.drawPath.moveTo(x, y);
                        }
                        else {
                            this.drawPath.lineTo(x, y);
                        }
                    };
                    draw_adapter.prototype.addSample = function () {
                        this.samples.push(NaN);
                    };
                    draw_adapter.prototype.setSample = function (screen_x, screen_y) {
                        this.samples[screen_x] = screen_y;
                    };
                    return draw_adapter;
                }());
                var screen_box = new Geoma.Utils.Box(mouse_area.offset.x, mouse_area.offset.y, mouse_area.w, mouse_area.h);
                var contains_derivative = this._derivativeLevel != 0;
                var adapter = new draw_adapter(this);
                this._suppressModified = true;
                ParametricLine.calcSamples(screen_box, this.dx, contains_derivative, adapter);
                this._suppressModified = false;
                assert(adapter.samples.length == this.document.mouseArea.w, "Logical error");
                this._drawPath = adapter.drawPath;
                this._screenSamples = adapter.samples;
            };
            ParametricLine.prototype.innerDraw = function (play_ground) {
                if (this.isModified(this._id) || !this._drawPath) {
                    this.updateSamples(play_ground);
                    assert(this._drawPath);
                }
                play_ground.context2d.strokeStyle = this.selected ? this.selectedBrush.value : this.brush.value;
                play_ground.context2d.lineWidth = this.lineWidth.value;
                play_ground.context2d.stroke(this._drawPath);
                if (this.symmetric) {
                    var current_transform = play_ground.context2d.getTransform();
                    play_ground.context2d.setTransform(current_transform.a, current_transform.b, current_transform.c, -current_transform.d, current_transform.e, current_transform.f + play_ground.ratio * 2 * this.axes.y);
                    play_ground.context2d.stroke(this._drawPath);
                    play_ground.context2d.setTransform(current_transform);
                }
            };
            ParametricLine.prototype.axesHit = function (event) {
                return this.axes.visible && this.axes.mouseHit(event);
            };
            ParametricLine.prototype.mouseClick = function (event) {
                var _this = this;
                if (this.mouseHit(event)) {
                    var doc_6 = this.document;
                    if (doc_6.canShowMenu(this)) {
                        var x_5 = doc_6.mouseArea.mousePoint.x;
                        var y_5 = doc_6.mouseArea.mousePoint.y;
                        var menu = new Tools.Menu(doc_6, x_5, y_5);
                        var menu_item = menu.addMenuItem(Tools.Resources.string("Точность..."));
                        menu_item.onChecked.bind(this, function () {
                            var title = Tools.Resources.string("Приращение аргумента x функции {0}", _this.code.text);
                            var dx = _this.document.promptNumber(title, _this.dx);
                            if (dx != undefined && dx != null) {
                                Tools.UndoTransaction.Do(_this, title, function () { return _this.dx = dx; });
                            }
                        });
                        menu_item = menu.addMenuItem(Tools.Resources.string("Масштаб по осям x/y..."));
                        menu_item.onChecked.bind(this.axes, this.axes.scaleDialog);
                        menu_item = menu.addMenuItem(Tools.Resources.string("Редактировать функцию f = {0} ...", this.code.text));
                        menu_item.onChecked.bind(this, this.showExpressionEditor);
                        menu_item = menu.addMenuItem(Tools.Resources.string("Добавить точку"));
                        menu_item.onChecked.bind(this, function () { return doc_6.addPoint(Point.make(x_5, y_5)); });
                        menu_item = menu.addMenuItem(Tools.Resources.string("Удалить график {0}", this.code.text));
                        menu_item.onChecked.bind(this, function () { return doc_6.removeParametricLine(_this); });
                        menu.show();
                    }
                }
                _super.prototype.mouseClick.call(this, event);
            };
            ParametricLine.prototype.mouseMove = function (event) {
                _super.prototype.mouseMove.call(this, event);
                this.selected = this.mouseHit(event);
                if (this._dragStart) {
                    if (event.buttons != 0) {
                        var dpos = Point.sub(this._dragStart, event);
                        if (dpos.x != 0 || dpos.y != 0) {
                            if (!this._transaction) {
                                this._transaction = this.document.beginUndo(Tools.Resources.string("Перемещение функции {0}", this.code.text));
                            }
                            this.move(dpos.x, dpos.y);
                        }
                        this._dragStart = event;
                        event.cancelBubble = true;
                    }
                    else {
                        this.mouseUp(event);
                    }
                }
            };
            ParametricLine.prototype.mouseDown = function (event) {
                if (this.mouseHit(event) || this.axesHit(event)) {
                    this._dragStart = event;
                }
            };
            ParametricLine.prototype.mouseUp = function (__event) {
                var _a;
                if (this._dragStart) {
                    (_a = this._transaction) === null || _a === void 0 ? void 0 : _a.commit();
                    delete this._dragStart;
                    delete this._transaction;
                }
            };
            ParametricLine.prototype.getY = function (x) {
                this._argX = x;
                this._argY = this._function();
                return this._argY;
            };
            ParametricLine.prototype._addPoint = function (point) {
                assert(!this.isRelated(point));
                if (!this._points) {
                    this._points = [];
                }
                this._points.push(point);
            };
            ParametricLine._idSource = new Geoma.Utils.ModuleInteger();
            return ParametricLine;
        }(Tools.DocumentSprite));
        Tools.ParametricLine = ParametricLine;
    })(Tools = Geoma.Tools || (Geoma.Tools = {}));
})(Geoma || (Geoma = {}));
var Geoma;
(function (Geoma) {
    var Tools;
    (function (Tools) {
        var makeMod = Geoma.Utils.makeMod;
        var makeProp = Geoma.Utils.makeProp;
        var Point = Geoma.Utils.Point;
        var assert = Geoma.Utils.assert;
        var Intersection = (function () {
            function Intersection(start_point) {
                this._lastDx = NaN;
                this._lastDy = NaN;
                this._disposed = false;
                this._isMoved = new Geoma.Utils.Pulse();
                this._startPoint = start_point;
            }
            Object.defineProperty(Intersection.prototype, "dx", {
                get: function () {
                    var dx = this.startPoint.x - this.point.x;
                    if (this._lastDx != dx) {
                        this._lastDx = dx;
                        this._isMoved.set();
                    }
                    return dx;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(Intersection.prototype, "dy", {
                get: function () {
                    var dy = this.startPoint.y - this.point.y;
                    if (this._lastDy != dy) {
                        this._lastDy = dy;
                        this._isMoved.set();
                    }
                    return dy;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(Intersection.prototype, "disposed", {
                get: function () {
                    return this._disposed;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(Intersection.prototype, "visible", {
                get: function () {
                    return !Point.isEmpty(this.point);
                },
                enumerable: false,
                configurable: true
            });
            Intersection.makePoint = function (point, line1, line2) {
                if (line2 == undefined) {
                    if (line1 instanceof Tools.ActiveLineBase) {
                        return PointLineSegment.intersection(point, line1.startPoint, line1.endPoint);
                    }
                    else if (line1 instanceof Tools.ActiveCircleLine) {
                        return PointCircle.intersection(point, line1);
                    }
                    else if (line1 instanceof Tools.ParametricLine) {
                        return PointParametric.intersection(point, line1);
                    }
                }
                else {
                    var make_helper = function (point, line1, line2) {
                        if (line1 instanceof Tools.ActiveLineBase) {
                            if (line2 instanceof Tools.ActiveLineBase) {
                                return LineLine.intersection(line1, line2);
                            }
                            else if (line2 instanceof Tools.ActiveCircleLine) {
                                var intersection = LineCircle.intersection(line1, line2);
                                return LineCircle.preferredIntersection(LineCircle.getPreference(point, intersection), intersection);
                            }
                            else if (line2 instanceof Tools.ParametricLine) {
                                var intersections = LineParametric.intersection(line1, line2);
                                var index = LineParametric.getPrefferedIndex(point, intersections);
                                if (index >= 0) {
                                    return intersections[index];
                                }
                            }
                        }
                        else if (line1 instanceof Tools.ParametricLine) {
                            if (line2 instanceof Tools.ParametricLine) {
                                var intersections = ParametricParametric.intersection(line1, line2);
                                var index = ParametricParametric.getPrefferedIndex(point, intersections);
                                if (index >= 0) {
                                    return intersections[index];
                                }
                            }
                        }
                        return null;
                    };
                    var ret = make_helper(point, line1, line2);
                    if (!ret && line2) {
                        ret = make_helper(point, line2, line1);
                    }
                    if (ret) {
                        return ret;
                    }
                }
                assert(false, "Not supported");
            };
            Intersection.makeIntersection = function (point, line1, line2) {
                if (line2 == undefined) {
                    if (line1 instanceof Tools.ActiveLineSegment) {
                        return new PointLineSegment(point, line1);
                    }
                    else if (line1 instanceof Tools.ActiveCircleLine) {
                        return new PointCircle(point, line1);
                    }
                    else if (line1 instanceof Tools.ParametricLine) {
                        return new PointParametric(point, line1);
                    }
                    else if (line1 instanceof Tools.ActiveLine) {
                        return new PointLine(point, line1);
                    }
                }
                else {
                    var make_helper = function (point, line1, line2) {
                        if (line1 instanceof Tools.ActiveLineBase) {
                            if (line2 instanceof Tools.ActiveLineBase) {
                                return new LineLine(point, line1, line2);
                            }
                            else if (line2 instanceof Tools.ActiveCircleLine) {
                                return new LineCircle(point, line1, line2);
                            }
                            else if (line2 instanceof Tools.ParametricLine) {
                                return new LineParametric(point, line1, line2);
                            }
                        }
                        else if (line1 instanceof Tools.ParametricLine) {
                            if (line2 instanceof Tools.ParametricLine) {
                                return new ParametricParametric(point, line1, line2);
                            }
                        }
                        return null;
                    };
                    var ret = make_helper(point, line1, line2);
                    if (!ret && line2) {
                        ret = make_helper(point, line2, line1);
                    }
                    if (ret) {
                        return ret;
                    }
                }
                assert(false, "Not supported");
            };
            Intersection.prototype.dispose = function () {
                this._disposed = true;
            };
            Intersection.prototype.move = function (__dx, __dy) {
                assert(false, "Not supported");
            };
            Intersection.prototype.isMoved = function (receiptor) {
                return this._isMoved.get(receiptor);
            };
            Object.defineProperty(Intersection.prototype, "startPoint", {
                get: function () {
                    return this._startPoint;
                },
                enumerable: false,
                configurable: true
            });
            return Intersection;
        }());
        Tools.Intersection = Intersection;
        var LocusType;
        (function (LocusType) {
            LocusType[LocusType["outerStart"] = 1] = "outerStart";
            LocusType[LocusType["innerStart"] = 2] = "innerStart";
            LocusType[LocusType["innerEnd"] = 3] = "innerEnd";
            LocusType[LocusType["outerEnd"] = 4] = "outerEnd";
        })(LocusType || (LocusType = {}));
        ;
        var PointLine = (function (_super) {
            __extends(PointLine, _super);
            function PointLine(point, line) {
                var _this = _super.call(this, PointLine.intersection(point, line.startPoint, line.coefficients)) || this;
                _this._line = line;
                _this.updateLocusInfo(point);
                _this._intersection = makeProp(makeMod(_this, function () {
                    var c = LineCircle.intersection(_this._line, {
                        center: _this._center,
                        radius: _this._locusRadius
                    });
                    assert(c.p1 && c.p2);
                    switch (_this._locus) {
                        case LocusType.outerStart:
                            if (_this.locus(c.p1) == LocusType.outerStart) {
                                return c.p1;
                            }
                            else {
                                return c.p2;
                            }
                        case LocusType.innerStart:
                            if (_this.locus(c.p1) == LocusType.outerStart) {
                                return c.p2;
                            }
                            else {
                                return c.p1;
                            }
                        case LocusType.innerEnd:
                            if (_this.locus(c.p1) == LocusType.outerEnd) {
                                return c.p2;
                            }
                            else {
                                return c.p1;
                            }
                        case LocusType.outerEnd:
                            if (_this.locus(c.p1) == LocusType.outerEnd) {
                                return c.p1;
                            }
                            else {
                                return c.p2;
                            }
                        default:
                            assert(false);
                    }
                }), Point.empty);
                return _this;
            }
            Object.defineProperty(PointLine.prototype, "point", {
                get: function () {
                    return this._intersection.value;
                },
                enumerable: false,
                configurable: true
            });
            PointLine.prototype.dispose = function () {
                if (!this.disposed) {
                    _super.prototype.dispose.call(this);
                    this._intersection.reset();
                }
            };
            PointLine.prototype.move = function (dx, dy) {
                this.updateLocusInfo(Point.sub(this.point, Point.make(dx, dy)));
            };
            PointLine.intersection = function (point, pivot_point, coefficient) {
                if (coefficient) {
                    return Point.make(point.x, Tools.ActiveLineBase.getY(point.x, coefficient));
                }
                else {
                    return Point.make(pivot_point.x, point.y);
                }
            };
            PointLine.intersected = function (point, pivot_point, coefficient, sensitivity) {
                assert(sensitivity >= 0);
                if (coefficient) {
                    var y = Tools.ActiveLineBase.getY(point.x, coefficient);
                    if (Math.abs(y - point.y) <= sensitivity) {
                        return true;
                    }
                    else {
                        var x = Tools.ActiveLineBase.getX(point.y, coefficient);
                        if (Math.abs(x - point.x) <= sensitivity) {
                            return true;
                        }
                        else {
                            return false;
                        }
                    }
                }
                else {
                    return Math.abs(point.x - pivot_point.x) <= sensitivity;
                }
            };
            PointLine.prototype.updateLocusInfo = function (point) {
                this._locus = this.locus(point);
                var dp = Point.sub(point, this._center);
                this._locusRadius = Math.sqrt(dp.x * dp.x + dp.y * dp.y);
            };
            PointLine.prototype.locus = function (point) {
                var line_length = this._line.length;
                var dp_start = Point.sub(this._line.startPoint, point);
                var start_length = Math.sqrt(dp_start.x * dp_start.x + dp_start.y * dp_start.y);
                var dp_end = Point.sub(this._line.endPoint, point);
                var end_length = Math.sqrt(dp_end.x * dp_end.x + dp_end.y * dp_end.y);
                if (start_length <= line_length && end_length <= line_length) {
                    if (start_length < end_length) {
                        return LocusType.innerStart;
                    }
                    else {
                        return LocusType.innerEnd;
                    }
                }
                else if (start_length < end_length) {
                    return LocusType.outerStart;
                }
                else {
                    return LocusType.outerEnd;
                }
            };
            Object.defineProperty(PointLine.prototype, "_center", {
                get: function () {
                    return (this._locus == LocusType.innerEnd || this._locus == LocusType.outerEnd) ? this._line.endPoint : this._line.startPoint;
                },
                enumerable: false,
                configurable: true
            });
            return PointLine;
        }(Intersection));
        Tools.PointLine = PointLine;
        var PointLineSegment = (function (_super) {
            __extends(PointLineSegment, _super);
            function PointLineSegment(point, line) {
                var _this = _super.call(this, PointLineSegment.intersection(point, line.startPoint, line.endPoint)) || this;
                _this._line = line;
                var dp = Point.sub(_this.startPoint, line.startPoint);
                var length = Math.sqrt(dp.x * dp.x + dp.y * dp.y);
                _this._startRatio = length / line.length;
                _this._intersection = makeProp(makeMod(_this, function () {
                    var _a, _b;
                    var c = LineCircle.intersection(_this._line, { center: _this._line.startPoint, radius: _this._line.length * _this._startRatio });
                    return (_b = (_a = c.p1) !== null && _a !== void 0 ? _a : c.p2) !== null && _b !== void 0 ? _b : Point.empty;
                }), Point.empty);
                return _this;
            }
            Object.defineProperty(PointLineSegment.prototype, "point", {
                get: function () {
                    return this._intersection.value;
                },
                enumerable: false,
                configurable: true
            });
            PointLineSegment.prototype.dispose = function () {
                if (!this.disposed) {
                    _super.prototype.dispose.call(this);
                    this._intersection.reset();
                }
            };
            PointLineSegment.prototype.move = function (dx, dy) {
                var new_pos = Point.sub(this.point, Point.make(dx, dy));
                var dp = Point.sub(new_pos, this._line.startPoint);
                var length = Math.sqrt(dp.x * dp.x + dp.y * dp.y);
                if (length < this._line.length) {
                    this._startRatio = length / this._line.length;
                }
            };
            PointLineSegment.intersection = function (point, line_start, line_end) {
                var c = Tools.ActiveLineBase.getCoefficients(line_start.x, line_start.y, line_end.x, line_end.y);
                if (c) {
                    return Point.make(point.x, Tools.ActiveLineBase.getY(point.x, c));
                }
                else {
                    return Point.make(line_start.x, Geoma.Utils.limit(point.y, line_start.y, line_end.y));
                }
            };
            PointLineSegment.intersected = function (point, line_start, line_end, sensitivity) {
                assert(sensitivity >= 0);
                if (Math.abs(line_start.x - line_end.x) <= sensitivity) {
                    return Math.abs(point.x - (line_start.x + line_end.x) / 2) <= sensitivity &&
                        Point.top(line_start, line_end) <= point.y &&
                        Point.bottom(line_start, line_end) >= point.y;
                }
                var coeff = Tools.ActiveLineBase.getCoefficients(line_start.x, line_start.y, line_end.x, line_end.y);
                if (coeff) {
                    if (Math.abs(coeff.k) <= 0.5) {
                        if (point.x >= Point.left(line_start, line_end) && point.x <= Point.right(line_start, line_end)) {
                            var y = Tools.ActiveLineBase.getY(point.x, coeff);
                            return Math.abs(y - point.y) <= sensitivity;
                        }
                        else {
                            return false;
                        }
                    }
                    else if (Point.top(line_start, line_end) <= point.y && Point.bottom(line_start, line_end) >= point.y) {
                        var x = Tools.ActiveLineBase.getX(point.y, coeff);
                        return Math.abs(x - point.x) <= sensitivity;
                    }
                }
                return false;
            };
            return PointLineSegment;
        }(Intersection));
        Tools.PointLineSegment = PointLineSegment;
        var LineLine = (function (_super) {
            __extends(LineLine, _super);
            function LineLine(__point, line1, line2) {
                var _this = _super.call(this, LineLine.intersection(line1, line2)) || this;
                _this._intersection = makeProp(function () {
                    return LineLine.intersection(line1, line2);
                }, Point.empty);
                return _this;
            }
            Object.defineProperty(LineLine.prototype, "point", {
                get: function () {
                    return this._intersection.value;
                },
                enumerable: false,
                configurable: true
            });
            LineLine.prototype.dispose = function () {
                if (!this.disposed) {
                    _super.prototype.dispose.call(this);
                    this._intersection.reset();
                }
            };
            LineLine.intersection = function (line1, line2) {
                return LineLine.intersection2(line1.startPoint, line1.endPoint, line2.startPoint, line2.endPoint);
            };
            LineLine.intersection2 = function (point11, point12, point21, point22) {
                var coeff1 = Tools.ActiveLineBase.getCoefficients(point11.x, point11.y, point12.x, point12.y);
                var coeff2 = Tools.ActiveLineBase.getCoefficients(point21.x, point21.y, point22.x, point22.y);
                var maxK = 1000;
                if (coeff1 && coeff2 && Math.abs(coeff1.k) < maxK && Math.abs(coeff2.k) < maxK) {
                    var dk = coeff1.k - coeff2.k;
                    if (dk) {
                        var x = (coeff2.b - coeff1.b) / dk;
                        return Point.make(x, Tools.ActiveLineBase.getY(x, coeff1));
                    }
                    else {
                        return Point.empty;
                    }
                }
                else if ((!coeff1 || Math.abs(coeff1.k) > maxK) && coeff2 && Math.abs(coeff2.k) < maxK) {
                    coeff1 = {
                        k: (point12.x - point11.x) / (point12.y - point11.y),
                        b: point12.x - point12.y * ((point12.x - point11.x) / (point12.y - point11.y))
                    };
                    var y = (coeff2.k * coeff1.b + coeff2.b) / (1 - coeff1.k * coeff2.k);
                    return Point.make(y * coeff1.k + coeff1.b, y);
                }
                else if ((!coeff2 || Math.abs(coeff2.k) > maxK) && coeff1 && Math.abs(coeff1.k) < maxK) {
                    coeff2 = {
                        k: (point22.x - point21.x) / (point22.y - point21.y),
                        b: point22.x - point22.y * ((point22.x - point21.x) / (point22.y - point21.y))
                    };
                    var y = (coeff1.k * coeff2.b + coeff1.b) / (1 - coeff1.k * coeff2.k);
                    return Point.make(y * coeff2.k + coeff2.b, y);
                }
                else {
                    coeff1 = {
                        k: (point12.x - point11.x) / (point12.y - point11.y),
                        b: point12.x - point12.y * ((point12.x - point11.x) / (point12.y - point11.y))
                    };
                    coeff2 = {
                        k: (point22.x - point21.x) / (point22.y - point21.y),
                        b: point22.x - point22.y * ((point22.x - point21.x) / (point22.y - point21.y))
                    };
                    var dk = coeff1.k - coeff2.k;
                    if (dk) {
                        var y = (coeff2.b - coeff1.b) / dk;
                        return Point.make(y * coeff1.k + coeff1.b, y);
                    }
                    else {
                        return Point.empty;
                    }
                }
            };
            return LineLine;
        }(Intersection));
        Tools.LineLine = LineLine;
        var PointCircle = (function (_super) {
            __extends(PointCircle, _super);
            function PointCircle(point, circle) {
                var _this = _super.call(this, PointCircle.intersection(point, circle)) || this;
                _this._circle = circle;
                _this._angle = Tools.ActiveLineBase.getAngle(circle.center.x, circle.center.y, point.x, point.y);
                _this._intersection = makeProp(makeMod(_this, function () {
                    return Point.add(Point.make(circle.radius * Math.cos(_this._angle), circle.radius * Math.sin(_this._angle)), circle.center);
                }), Point.empty);
                return _this;
            }
            Object.defineProperty(PointCircle.prototype, "point", {
                get: function () {
                    return this._intersection.value;
                },
                enumerable: false,
                configurable: true
            });
            PointCircle.prototype.dispose = function () {
                this._intersection.reset();
                _super.prototype.dispose.call(this);
            };
            PointCircle.prototype.move = function (dx, dy) {
                var point = Point.sub(this.point, Point.make(dx, dy));
                this._angle = Tools.ActiveLineBase.getAngle(this._circle.center.x, this._circle.center.y, point.x, point.y);
            };
            PointCircle.intersection = function (point, circle) {
                var angle = Tools.ActiveLineBase.getAngle(circle.center.x, circle.center.y, point.x, point.y);
                return Point.add(Point.make(circle.radius * Math.cos(angle), circle.radius * Math.sin(angle)), circle.center);
            };
            PointCircle.isIntersected = function (point, circle, sensitivity) {
                assert(sensitivity);
                var dp = Point.sub(point, circle.center);
                var radius = Math.sqrt(dp.x * dp.x + dp.y * dp.y);
                return Math.abs(radius - circle.radius) <= sensitivity;
            };
            return PointCircle;
        }(Intersection));
        Tools.PointCircle = PointCircle;
        var LineCircle = (function (_super) {
            __extends(LineCircle, _super);
            function LineCircle(point, line, circle) {
                var _this = _super.call(this, Point.make(point.x, point.y)) || this;
                var intersection = LineCircle.intersection(line, circle);
                _this._preference = LineCircle.getPreference(point, intersection);
                _this._intersection = makeProp(makeMod(_this, function () {
                    var intersection = LineCircle.intersection(line, circle);
                    return LineCircle.preferredIntersection(_this._preference, intersection);
                }), Point.empty);
                return _this;
            }
            Object.defineProperty(LineCircle.prototype, "point", {
                get: function () {
                    return this._intersection.value;
                },
                enumerable: false,
                configurable: true
            });
            LineCircle.intersection = function (line, circle) {
                var x0 = circle.center.x;
                var y0 = circle.center.y;
                var r = circle.radius;
                var coeff = line.coefficients;
                if (coeff) {
                    var k = coeff.k;
                    var b = coeff.b;
                    var r2 = r * r;
                    var k2 = k * k;
                    var kb = k * b;
                    var ky0 = k * y0;
                    var d = k2 * r2 - k2 * x0 * x0 - 2 * kb * x0 + 2 * ky0 * x0 - b * b + 2 * b * y0 - y0 * y0 + r2;
                    var ret = {};
                    if (d > 0) {
                        var k2_1 = k2 + 1;
                        var w = -kb + ky0 + x0;
                        {
                            var x = (Math.sqrt(d) + w) / k2_1;
                            var y = Tools.ActiveLineBase.getY(x, coeff);
                            var p1 = Point.make(x, y);
                            if (LineCircle.isPointLineIntersected(p1, line)) {
                                ret.p1 = p1;
                            }
                        }
                        {
                            var x = (w - Math.sqrt(d)) / k2_1;
                            var y = Tools.ActiveLineBase.getY(x, coeff);
                            var p2 = Point.make(x, y);
                            if (LineCircle.isPointLineIntersected(p2, line)) {
                                ret.p2 = p2;
                            }
                        }
                    }
                    return ret;
                }
                else {
                    var x1 = line.startPoint.x;
                    var dx = Math.abs(x1 - x0);
                    if (dx > r) {
                        return { p1: undefined, p2: undefined };
                    }
                    else {
                        var h = Math.sqrt(r * r - dx * dx);
                        var p1y = y0 + h;
                        var p2y = y0 - h;
                        var ret = {};
                        if (LineCircle.isPointLineIntersected(Point.make(x1, p1y), line)) {
                            ret.p1 = Point.make(x1, p1y);
                        }
                        if (LineCircle.isPointLineIntersected(Point.make(x1, p2y), line)) {
                            ret.p2 = Point.make(x1, p2y);
                        }
                        return ret;
                    }
                }
            };
            LineCircle.getPreference = function (point, intersection) {
                if (intersection.p2 == undefined) {
                    assert(intersection.p1);
                    return 1;
                }
                else if (intersection.p1 == undefined) {
                    assert(intersection.p2);
                    return 2;
                }
                else {
                    var dp1 = Point.sub(point, intersection.p1);
                    var dp2 = Point.sub(point, intersection.p2);
                    if ((dp1.x * dp1.x + dp1.y * dp1.y) > (dp2.x * dp2.x + dp2.y * dp2.y)) {
                        return 2;
                    }
                    else {
                        return 1;
                    }
                }
            };
            LineCircle.preferredIntersection = function (preference, intersection) {
                var ret;
                switch (preference) {
                    case 1:
                        ret = intersection.p1;
                        break;
                    case 2:
                        ret = intersection.p2;
                        break;
                }
                if (ret == undefined) {
                    return Point.empty;
                }
                else {
                    return ret;
                }
            };
            LineCircle.isPointLineIntersected = function (point, line) {
                if (line instanceof Tools.ActiveLineSegment) {
                    return PointLineSegment.intersected(point, line.startPoint, line.endPoint, Tools.Thickness.Calc);
                }
                else if (line instanceof Tools.ActiveLine) {
                    return PointLine.intersected(point, line.startPoint, line.coefficients, Tools.Thickness.Calc);
                }
                else {
                    return false;
                }
            };
            return LineCircle;
        }(Intersection));
        Tools.LineCircle = LineCircle;
        var PointParametric = (function (_super) {
            __extends(PointParametric, _super);
            function PointParametric(point, line) {
                var _this = _super.call(this, PointParametric.intersection(point, line)) || this;
                _this._line = line;
                _this._startX = _this._line.axes.fromScreenX(_this.startPoint.x);
                _this._startY = _this._line.axes.fromScreenY(_this.startPoint.y);
                _this._intersection = makeProp(makeMod(_this, function () {
                    var screen_x0 = _this._line.axes.toScreenX(_this._startX);
                    var screen_y1 = _this._line.screenY(screen_x0);
                    var p1 = PointParametric.intersectionMain(Point.make(screen_x0, screen_y1), _this._line);
                    if (_this._line.symmetric) {
                        var screen_y0 = _this._line.axes.toScreenY(_this._startY);
                        var screen_y2 = _this._line.screenSymmetricY(screen_x0);
                        var p2 = PointParametric.intersectionSymmetric(Point.make(screen_x0, screen_y2), _this._line);
                        var point_1 = Point.make(screen_x0, screen_y0);
                        if (Tools.ActiveLineBase.getLength(point_1, p1) < Tools.ActiveLineBase.getLength(point_1, p2)) {
                            return p1;
                        }
                        else {
                            return p2;
                        }
                    }
                    else {
                        return p1;
                    }
                }), Point.empty);
                return _this;
            }
            Object.defineProperty(PointParametric.prototype, "point", {
                get: function () {
                    return this._intersection.value;
                },
                enumerable: false,
                configurable: true
            });
            PointParametric.prototype.dispose = function () {
                this._intersection.reset();
                _super.prototype.dispose.call(this);
            };
            PointParametric.prototype.move = function (_dx, _dy) {
            };
            PointParametric.intersection = function (point, line) {
                var p1 = PointParametric.intersectionMain(point, line);
                if (line.symmetric) {
                    var p2 = PointParametric.intersectionSymmetric(point, line);
                    if (Tools.ActiveLineBase.getLength(point, p1) < Tools.ActiveLineBase.getLength(point, p2)) {
                        return p1;
                    }
                    else {
                        return p2;
                    }
                }
                else {
                    return p1;
                }
            };
            PointParametric.intersectionMain = function (point, line) {
                var y = line.screenY(point.x);
                return Point.make(point.x, y);
            };
            PointParametric.intersectionSymmetric = function (point, line) {
                var y = line.screenSymmetricY(point.x);
                return Point.make(point.x, y);
            };
            PointParametric.intersected = function (point, line, sensitivity) {
                assert(sensitivity);
                if (Math.abs(point.y - line.screenY(point.x)) <= sensitivity) {
                    return true;
                }
                else if (line.symmetric && Math.abs(point.y - line.screenSymmetricY(point.x)) <= sensitivity) {
                    return true;
                }
                else {
                    for (var x = Math.floor(point.x - sensitivity / 2); x < Math.ceil(point.x + sensitivity / 2);) {
                        var p1 = Point.make(x, line.screenY(x));
                        x++;
                        var p2 = Point.make(x, line.screenY(x));
                        if (PointLineSegment.intersected(point, p1, p2, sensitivity)) {
                            return true;
                        }
                    }
                    return false;
                }
            };
            return PointParametric;
        }(Intersection));
        Tools.PointParametric = PointParametric;
        var LineParametric = (function (_super) {
            __extends(LineParametric, _super);
            function LineParametric(point, line, parametric) {
                var _this = _super.call(this, Point.make(point.x, point.y)) || this;
                _this._id = FunctionFunction.createId();
                _this._line = line;
                _this._parametric = parametric;
                _this._update(true);
                _this._prefferedIntersection = FunctionFunction.getPrefferedIndex(point, _this.intersections);
                return _this;
            }
            Object.defineProperty(LineParametric.prototype, "point", {
                get: function () {
                    if (this.visible) {
                        return this.intersections[this._prefferedIntersection];
                    }
                    else {
                        return Point.empty;
                    }
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(LineParametric.prototype, "visible", {
                get: function () {
                    return this._prefferedIntersection >= 0 && this._prefferedIntersection < this.intersections.length;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(LineParametric.prototype, "intersections", {
                get: function () {
                    this._update();
                    assert(this._intersections);
                    return this._intersections;
                },
                enumerable: false,
                configurable: true
            });
            LineParametric.prototype.dispose = function () {
                var _a;
                _super.prototype.dispose.call(this);
                (_a = this._calculator) === null || _a === void 0 ? void 0 : _a.dispose();
            };
            LineParametric.getPrefferedIndex = function (point, intersections) {
                return FunctionFunction.getPrefferedIndex(point, intersections);
            };
            LineParametric.intersection = function (line, parametric) {
                var calculator = new LineParametric(Point.empty, line, parametric);
                var intersections = calculator.intersections;
                calculator.dispose();
                return intersections;
            };
            LineParametric.prototype._update = function (force) {
                var _a;
                var id = this._id;
                var update_calc = this._parametric.isMoved(id) || this._parametric.isModified(id) || force;
                if (update_calc) {
                    var calc = new FunctionFunction(this._parametric.code, LineParametric._lineFunction, this._parametric.axes, this._parametric);
                    calc.addArg(LineParametric._kName, NaN);
                    calc.addArg(LineParametric._bName, NaN);
                    (_a = this._calculator) === null || _a === void 0 ? void 0 : _a.dispose();
                    this._calculator = calc;
                }
                var update_coeff = this._line.isMoved(id) || force || update_calc;
                if (update_coeff) {
                    assert(this._calculator);
                    var axes = this._calculator.axes;
                    var coeff = Tools.ActiveLineBase.getCoefficients(axes.fromScreenX(this._line.startPoint.x), axes.fromScreenY(this._line.startPoint.y), axes.fromScreenX(this._line.endPoint.x), axes.fromScreenY(this._line.endPoint.y));
                    if (coeff) {
                        this._calculator.setArg(LineParametric._kName, coeff.k);
                        this._calculator.setArg(LineParametric._bName, coeff.b);
                    }
                    else {
                        var multiplier = 1e20;
                        var x = axes.fromScreenX(this._line.x);
                        this._calculator.setArg(LineParametric._kName, -multiplier);
                        this._calculator.setArg(LineParametric._bName, x * multiplier);
                    }
                    this._intersections = this._calculator.intersections;
                }
            };
            LineParametric._makeLineFunction = function () {
                var kx = new Geoma.Syntax.CodeBinary(new Geoma.Syntax.CodeArgument(LineParametric._kName), "*", new Geoma.Syntax.CodeArgumentX());
                return new Geoma.Syntax.CodeBinary(kx, "+", new Geoma.Syntax.CodeArgument(LineParametric._bName));
            };
            LineParametric._kName = "k-{C696237D-E444-468E-A8F7-7C780E599BBB}";
            LineParametric._bName = "b-{E131A6AE-285A-45E4-AEFC-D88EE4CF1BFC}";
            LineParametric._lineFunction = LineParametric._makeLineFunction();
            return LineParametric;
        }(Intersection));
        Tools.LineParametric = LineParametric;
        var ParametricParametric = (function (_super) {
            __extends(ParametricParametric, _super);
            function ParametricParametric(point, parametric1, parametric2) {
                var _this = _super.call(this, Point.make(point.x, point.y)) || this;
                _this._id = FunctionFunction.createId();
                assert(parametric1.axes === parametric2.axes);
                _this._parametric1 = parametric1;
                _this._parametric2 = parametric2;
                _this._update(true);
                _this._prefferedIntersection = FunctionFunction.getPrefferedIndex(point, _this.intersections);
                return _this;
            }
            Object.defineProperty(ParametricParametric.prototype, "point", {
                get: function () {
                    if (this.visible) {
                        return this.intersections[this._prefferedIntersection];
                    }
                    else {
                        return Point.empty;
                    }
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(ParametricParametric.prototype, "visible", {
                get: function () {
                    return this._prefferedIntersection >= 0 && this._prefferedIntersection < this.intersections.length;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(ParametricParametric.prototype, "intersections", {
                get: function () {
                    this._update();
                    assert(this._intersections);
                    return this._intersections;
                },
                enumerable: false,
                configurable: true
            });
            ParametricParametric.prototype.dispose = function () {
                var _a;
                _super.prototype.dispose.call(this);
                (_a = this._calculator) === null || _a === void 0 ? void 0 : _a.dispose();
            };
            ParametricParametric.getPrefferedIndex = function (point, intersections) {
                return FunctionFunction.getPrefferedIndex(point, intersections);
            };
            ParametricParametric.intersection = function (parametric1, parametric2) {
                var calculator = new ParametricParametric(Point.empty, parametric1, parametric2);
                var intersections = calculator.intersections;
                calculator.dispose();
                return intersections;
            };
            ParametricParametric.prototype._update = function (force) {
                var _a;
                var id = this._id;
                var update_calc = this._parametric1.isModified(id) || this._parametric2.isModified(id) || force;
                if (update_calc) {
                    var calc = new FunctionFunction(this._parametric1.code, this._parametric2.code, this._parametric1.axes, this._parametric1, this._parametric2);
                    (_a = this._calculator) === null || _a === void 0 ? void 0 : _a.dispose();
                    this._calculator = calc;
                }
                if (update_calc || this._parametric1.isMoved(id) || this._parametric2.isMoved(id)) {
                    assert(this._calculator);
                    this._intersections = this._calculator.intersections;
                }
            };
            return ParametricParametric;
        }(Intersection));
        Tools.ParametricParametric = ParametricParametric;
        var FunctionFunction = (function () {
            function FunctionFunction(function1, function2, axes, context1, context2) {
                var _this = this;
                this._intersectionsData = [];
                this._argX = NaN;
                this._lastPoint = Point.empty;
                this._args = {};
                this._function1 = Geoma.Utils.makeEvaluator(this, function1.code);
                this._function2 = Geoma.Utils.makeEvaluator(this, function2.code);
                this._context1 = context1;
                this._context2 = context2;
                this._axes = axes;
                var code = new Geoma.Syntax.CodeBinary(function1, "-", function2);
                var contains_derivative = code.derivativeLevel > 0;
                this._deltaFunction = Geoma.Utils.makeEvaluator(this, code.code);
                var samples_calculator = makeMod(this, function () {
                    var mouse_area = _this._axes.document.mouseArea;
                    var screen_box = new Geoma.Utils.Box(mouse_area.offset.x, mouse_area.offset.y, mouse_area.w, mouse_area.h);
                    _this._intersectionsData.splice(0);
                    _this._lastPoint = Point.empty;
                    Tools.ParametricLine.calcSamples(screen_box, 1, contains_derivative, _this);
                    return _this._intersectionsData;
                });
                this._intersections = makeProp(samples_calculator, []);
            }
            FunctionFunction.prototype.point = function (preffered_intersection) {
                if (this.visible(preffered_intersection)) {
                    return this.intersections[preffered_intersection];
                }
                else {
                    return Point.empty;
                }
            };
            FunctionFunction.prototype.visible = function (preffered_intersection) {
                return preffered_intersection >= 0 && preffered_intersection < this.intersections.length;
            };
            Object.defineProperty(FunctionFunction.prototype, "intersections", {
                get: function () {
                    return this._intersections.value;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(FunctionFunction.prototype, "axes", {
                get: function () {
                    return this._axes;
                },
                enumerable: false,
                configurable: true
            });
            FunctionFunction.prototype.dispose = function () {
                for (var key in this._args) {
                    this._args[key].reset();
                }
            };
            FunctionFunction.getPrefferedIndex = function (point, intersections) {
                var last_length = Infinity;
                var ret = -1;
                var i = 0;
                for (var _i = 0, intersections_1 = intersections; _i < intersections_1.length; _i++) {
                    var intersection = intersections_1[_i];
                    var length_2 = Tools.ActiveLineBase.getLength(point, intersection);
                    if (length_2 < last_length) {
                        ret = i;
                        last_length = length_2;
                    }
                    i++;
                }
                return ret;
            };
            FunctionFunction.intersection = function (parametric1, parametric2) {
                return (new ParametricParametric(Point.empty, parametric1, parametric2)).intersections;
            };
            FunctionFunction.createId = function () {
                return FunctionFunction._index.inc() + "-{4B5D04F4-A028-48D6-BB69-B9E857793D38}";
            };
            FunctionFunction.prototype.getFunction = function (_name) {
                throw new Error("Method not implemented.");
            };
            FunctionFunction.prototype.addFunction = function (_name, _code) {
                throw new Error("Method not implemented.");
            };
            FunctionFunction.prototype.arg = function (name) {
                switch (name) {
                    case "x":
                        return this._argX;
                    default:
                        assert(this.hasArg(name));
                        if (name in this._args) {
                            return this._args[name].value;
                        }
                        else if (this._context1.hasArg(name)) {
                            return this._context1.arg(name);
                        }
                        else {
                            assert(this._context2);
                            return this._context2.arg(name);
                        }
                }
            };
            FunctionFunction.prototype.hasArg = function (name) {
                var _a, _b;
                return name in this._args || this._context1.hasArg(name) || ((_b = (_a = this._context2) === null || _a === void 0 ? void 0 : _a.hasArg(name)) !== null && _b !== void 0 ? _b : false);
            };
            FunctionFunction.prototype.addArg = function (name, arg) {
                assert(!this.hasArg(name));
                this._args[name] = makeProp(arg, NaN);
            };
            FunctionFunction.prototype.setArg = function (name, value) {
                assert(name != "x");
                assert(name in this._args);
                this._args[name].value = value;
            };
            FunctionFunction.prototype.getScreenY = function (screen_x, func) {
                var axes = this._axes;
                var x = axes.fromScreenX(screen_x);
                this._argX = x;
                var screen_y = axes.toScreenY((func !== null && func !== void 0 ? func : this._deltaFunction)());
                return screen_y;
            };
            FunctionFunction.prototype.lineTo = function (screen_x, screen_y, discontinuity) {
                var next_point = Point.make(screen_x, screen_y);
                if (!discontinuity && !Point.isEmpty(this._lastPoint)) {
                    var axes = this._axes;
                    var x_axis_intersection = (this._lastPoint.y <= axes.y && next_point.y >= axes.y) ||
                        (this._lastPoint.y >= axes.y && next_point.y <= axes.y);
                    if (x_axis_intersection) {
                        var y1 = this.getScreenY(this._lastPoint.x, this._function1);
                        var y2 = this.getScreenY(this._lastPoint.x, this._function2);
                        var y3 = this.getScreenY(next_point.x, this._function1);
                        var y4 = this.getScreenY(next_point.x, this._function2);
                        var intersection = LineLine.intersection2(Point.make(this._lastPoint.x, y1), Point.make(next_point.x, y3), Point.make(this._lastPoint.x, y2), Point.make(next_point.x, y4));
                        this._intersectionsData.push(intersection);
                    }
                }
                this._lastPoint = next_point;
            };
            FunctionFunction.prototype.addSample = function () {
            };
            FunctionFunction.prototype.setSample = function (_screen_x, _screen_y) {
            };
            FunctionFunction._index = new Geoma.Utils.ModuleInteger();
            return FunctionFunction;
        }());
    })(Tools = Geoma.Tools || (Geoma.Tools = {}));
})(Geoma || (Geoma = {}));
var Geoma;
(function (Geoma) {
    var Tools;
    (function (Tools) {
        var makeMod = Geoma.Utils.makeMod;
        var makeProp = Geoma.Utils.makeProp;
        var toInt = Geoma.Utils.toInt;
        var Point = Geoma.Utils.Point;
        var assert = Geoma.Utils.assert;
        var AxesLines = (function (_super) {
            __extends(AxesLines, _super);
            function AxesLines(document, axes_number, x, y, kx, ky, line_width, brush, selected_brush) {
                var _this = this;
                var stub = (function (_super) {
                    __extends(stub, _super);
                    function stub() {
                        return _super !== null && _super.apply(this, arguments) || this;
                    }
                    stub.prototype.innerDraw = function (__play_ground) {
                        throw new Error("Method not implemented.");
                    };
                    return stub;
                }(Geoma.Sprite.Sprite));
                _this = _super.call(this, document, new stub(x, y)) || this;
                _this.axesId = axes_number;
                _this._lineWidth = makeProp(line_width, 1);
                _this._brush = makeProp(brush, "Black");
                _this._selectedBrush = makeProp(selected_brush, "Black");
                _this._kX = makeProp(kx, 1);
                _this._kY = makeProp(ky, 1);
                _this._showDegrees = makeProp(true);
                _this._lines = new Array();
                _this._dx = _this._dy = 0;
                _this._moved = new Geoma.Utils.Pulse();
                _this._beforeDrawListener = document.onBeforeDraw.bind(_this, _this.beforeDraw);
                _this._adorners = new Geoma.Sprite.Container();
                _this._adorners.alpha = 0.8;
                _this._adorners.addVisible(makeMod(_this, function () { return _this._adorners.length > 0 && document.canShowMenu(_this); }));
                _this.addX(makeMod(_this, function (value) { return value + _this._dx; }));
                _this.addY(makeMod(_this, function (value) { return value + _this._dy; }));
                return _this;
            }
            Object.defineProperty(AxesLines.prototype, "lineWidth", {
                get: function () {
                    return this._lineWidth.value;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(AxesLines.prototype, "brush", {
                get: function () {
                    return this._brush.value;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(AxesLines.prototype, "selectedBrush", {
                get: function () {
                    return this._selectedBrush.value;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(AxesLines.prototype, "kX", {
                get: function () {
                    return this._kX.value;
                },
                set: function (value) {
                    this._kX.value = value;
                    this.updateLines();
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(AxesLines.prototype, "kY", {
                get: function () {
                    return this._kY.value;
                },
                set: function (value) {
                    this._kY.value = value;
                    this.updateLines();
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(AxesLines.prototype, "showDegrees", {
                get: function () {
                    return this._showDegrees.value;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(AxesLines.prototype, "lines", {
                get: function () {
                    return this._lines;
                },
                enumerable: false,
                configurable: true
            });
            AxesLines.prototype.dispose = function () {
                if (!this.disposed) {
                    this._adorners.dispose();
                    this._beforeDrawListener.dispose();
                    _super.prototype.dispose.call(this);
                }
            };
            AxesLines.prototype.mouseHit = function (point) {
                if (Math.abs(point.y - this.y) <= Tools.Thickness.Mouse ||
                    Math.abs(point.x - this.x) <= Tools.Thickness.Mouse) {
                    return true;
                }
                else if (this._adorners.visible) {
                    var margins = AxesLines._adornerMargins + Tools.Thickness.Mouse;
                    return point.x >= (this._adorners.left - margins) &&
                        point.x <= (this._adorners.right + margins) &&
                        point.y >= (this._adorners.top - margins) &&
                        point.y <= (this._adorners.bottom + margins);
                }
                else {
                    return false;
                }
            };
            AxesLines.prototype.fromScreenX = function (screen_x) {
                return (screen_x - this.x) * this.kX;
            };
            AxesLines.prototype.fromScreenY = function (screen_y) {
                return (this.y - screen_y) * this.kY;
            };
            AxesLines.prototype.toScreenX = function (x) {
                return this.x + (x / this.kX);
            };
            AxesLines.prototype.toScreenY = function (y) {
                return this.y - (y / this.kY);
            };
            AxesLines.prototype.move = function (dx, dy) {
                this._dx -= dx;
                this._dy -= dy;
                var moved_point = new Set();
                for (var _i = 0, _a = this._lines; _i < _a.length; _i++) {
                    var line = _a[_i];
                    if (line.points) {
                        for (var _b = 0, _c = line.points; _b < _c.length; _b++) {
                            var p = _c[_b];
                            if (!moved_point.has(p.name) && p instanceof Tools.ActivePoint) {
                                p.move(dx, dy);
                                moved_point.add(p.name);
                            }
                        }
                    }
                }
                this._moved.set();
            };
            AxesLines.prototype.isMoved = function (receiptor) {
                return this._moved.get(receiptor);
            };
            AxesLines.prototype.serialize = function (__context) {
                var data = [];
                data.push("" + this.axesId);
                data.push("" + this.x);
                data.push("" + this.y);
                data.push("" + this.kX);
                data.push("" + this.kY);
                return data;
            };
            AxesLines.prototype.scaleDialog = function () {
                var _this = this;
                var scale;
                if (this.kX == this.kY) {
                    scale = 1 / this.kX;
                    if (scale > 1) {
                        scale = toInt(scale);
                    }
                }
                var title = Tools.Resources.string("Масштаб по осям x/y, %");
                var new_scale = this.document.promptNumber(title, scale);
                if (new_scale != undefined) {
                    return Tools.UndoTransaction.Do(this, title, function () {
                        _this.kX = 1 / new_scale;
                        _this.kY = 1 / new_scale;
                        return true;
                    });
                }
                else {
                    return false;
                }
            };
            AxesLines.prototype.addLine = function (line) {
                this._lines.push(line);
            };
            AxesLines.prototype.removeLine = function (line) {
                var index = this._lines.indexOf(line);
                assert(index != -1);
                this._lines.splice(index, 1);
            };
            AxesLines.deserialize = function (context, data, index) {
                if (data.length < (index + 5)) {
                    return null;
                }
                else {
                    var axes = new AxesLines(context.document, toInt(data[index++]), parseFloat(data[index++]), parseFloat(data[index++]), parseFloat(data[index++]), parseFloat(data[index++]), function () { return Tools.CurrentTheme.AxesWidth; }, function () { return Tools.CurrentTheme.AxesBrush; }, function () { return Tools.CurrentTheme.AxesSelectBrush; });
                    return axes;
                }
            };
            AxesLines.roundToDigit = function (value) {
                var k = 1;
                var ret = value;
                var mantiss = 0;
                if (value < 1) {
                    while (toInt(ret) == 0) {
                        ret *= 10;
                        k /= 10;
                        mantiss--;
                    }
                }
                else {
                    while (toInt(ret) > 10) {
                        ret /= 10;
                        k *= 10;
                        mantiss++;
                    }
                }
                return { value: toInt(ret) * k, mantiss: mantiss };
            };
            AxesLines.prototype.beforeDraw = function (__event) {
                if (this._lastX != this.x ||
                    this._lastY != this.y ||
                    this._lastKx != this.kX ||
                    this._lastKy != this.kY ||
                    this._lastW != this.document.mouseArea.w ||
                    this._lastH != this.document.mouseArea.h ||
                    this._lastOffsetX != this.document.mouseArea.offset.x ||
                    this._lastOffsetY != this.document.mouseArea.offset.y) {
                    this._lastX = this.x;
                    this._lastY = this.y;
                    this._lastKx = this.kX;
                    this._lastKy = this.kY;
                    this._lastW = this.document.mouseArea.w;
                    this._lastH = this.document.mouseArea.h;
                    this._lastOffsetX = this.document.mouseArea.offset.x;
                    this._lastOffsetY = this.document.mouseArea.offset.y;
                    this.updateLines();
                }
            };
            AxesLines.prototype.innerDraw = function (play_ground) {
                play_ground.context2d.beginPath();
                play_ground.context2d.moveTo(play_ground.offset.x, this.y);
                play_ground.context2d.lineTo(play_ground.right, this.y);
                play_ground.context2d.moveTo(this.x, play_ground.offset.y);
                play_ground.context2d.lineTo(this.x, play_ground.bottom);
                play_ground.context2d.strokeStyle = this.selected ? this.selectedBrush : this.brush;
                play_ground.context2d.lineWidth = this.lineWidth;
                if (this.showDegrees) {
                    var grade_x = AxesLines.roundToDigit(150 * this.kX);
                    var dx = grade_x.value / this.kX;
                    var proportional = this.kX == this.kY;
                    var grade_y = proportional ? grade_x : AxesLines.roundToDigit(150 * this.kY);
                    var dy = proportional ? dx : grade_y.value / this.kY;
                    play_ground.context2d.fillStyle = this.selected ? Tools.CurrentTheme.AxesTextSelectBrush : Tools.CurrentTheme.AxesTextBrush;
                    var style = Tools.CurrentTheme.AxesTextStyle;
                    if (style.direction) {
                        play_ground.context2d.direction = style.direction;
                    }
                    if (style.font) {
                        play_ground.context2d.font = style.font;
                    }
                    if (style.textAlign) {
                        play_ground.context2d.textAlign = style.textAlign;
                    }
                    if (style.textBaseline) {
                        play_ground.context2d.textBaseline = style.textBaseline;
                    }
                    var scale_bar_size = 10;
                    var get_digits = function (normalize_value) {
                        if (normalize_value.mantiss > 0) {
                            return 0;
                        }
                        else if ((-normalize_value.mantiss) <= 4) {
                            return -normalize_value.mantiss;
                        }
                        else {
                            return 0;
                        }
                    };
                    var is_exponential = function (normalize_value) {
                        if (normalize_value.mantiss > 0) {
                            if (normalize_value.value > 9999) {
                                return true;
                            }
                            else {
                                return false;
                            }
                        }
                        else {
                            return (-normalize_value.mantiss) > 4;
                        }
                    };
                    var bar_text_margin = 2;
                    {
                        var x_coord = -toInt((this.x - play_ground.offset.x) / dx);
                        var start_x = this.x + x_coord * dx;
                        x_coord *= grade_x.value;
                        var end_x = play_ground.right + 1;
                        var digits = get_digits(grade_x);
                        var exponential = is_exponential(grade_x);
                        var y1 = void 0, y2 = void 0, y3 = void 0;
                        var screen_y = this.y - play_ground.offset.y;
                        if (screen_y >= 0) {
                            if (screen_y < (play_ground.h - 2 * scale_bar_size)) {
                                y1 = this.y - scale_bar_size / 2;
                                y2 = this.y + scale_bar_size / 2;
                                y3 = this.y + scale_bar_size / 2 + bar_text_margin;
                            }
                            else {
                                y1 = play_ground.h - scale_bar_size + play_ground.offset.y;
                                y2 = play_ground.h + play_ground.offset.y;
                                y3 = y1 - scale_bar_size;
                            }
                        }
                        else {
                            y1 = play_ground.offset.y;
                            y2 = scale_bar_size + play_ground.offset.y;
                            y3 = scale_bar_size + bar_text_margin + play_ground.offset.y;
                        }
                        for (var x = start_x; x <= end_x; x += dx) {
                            play_ground.context2d.moveTo(x, y1);
                            play_ground.context2d.lineTo(x, y2);
                            play_ground.context2d.fillText(exponential ? x_coord.toExponential(digits) : x_coord.toFixed(digits), x, y3);
                            x_coord += grade_x.value;
                        }
                    }
                    {
                        var y_coord = toInt((this.y - play_ground.offset.y) / dy);
                        var start_y = this.y - y_coord * dy;
                        y_coord *= grade_y.value;
                        var end_y = play_ground.bottom + 1;
                        var digits = get_digits(grade_y);
                        var exponential = is_exponential(grade_y);
                        var x1 = void 0, x2 = void 0, x3 = void 0;
                        var screen_x = this.x - play_ground.offset.x;
                        if (screen_x >= 0) {
                            if (screen_x < (play_ground.w - 2 * scale_bar_size)) {
                                x1 = this.x - scale_bar_size / 2;
                                x2 = this.x + scale_bar_size / 2;
                                x3 = this.x + scale_bar_size / 2 + bar_text_margin;
                            }
                            else {
                                x1 = play_ground.w - scale_bar_size + play_ground.offset.x;
                                x2 = play_ground.w + play_ground.offset.x;
                                x3 = NaN;
                            }
                        }
                        else {
                            x1 = play_ground.offset.x;
                            x2 = scale_bar_size + play_ground.offset.x;
                            x3 = scale_bar_size + bar_text_margin + play_ground.offset.x;
                        }
                        for (var y = start_y; y <= end_y; y += dy) {
                            if (Math.abs(y - this.y) > dy / 2) {
                                var y_text = exponential ? y_coord.toExponential(digits) : y_coord.toFixed(digits);
                                play_ground.context2d.moveTo(x1, y);
                                play_ground.context2d.lineTo(x2, y);
                                if (isNaN(x3)) {
                                    var text_width = play_ground.context2d.measureText(y_text).width;
                                    play_ground.context2d.fillText(y_text, x1 - text_width - scale_bar_size, y);
                                }
                                else {
                                    play_ground.context2d.fillText(y_text, x3, y);
                                }
                            }
                            y_coord -= grade_y.value;
                        }
                    }
                }
                play_ground.context2d.stroke();
                this._adorners.draw(play_ground);
            };
            AxesLines.prototype.mouseMove = function (event) {
                var _this = this;
                var selected = this.mouseHit(event);
                if (this.selected) {
                    if (!selected) {
                        while (this._adorners.first) {
                            this._adorners.first.dispose();
                            this._adorners.remove(this._adorners.first);
                        }
                    }
                }
                else if (selected) {
                    var can_show_adorners = true;
                    for (var _i = 0, _a = this.document.selectedSprites; _i < _a.length; _i++) {
                        var sprite = _a[_i];
                        if (sprite instanceof Tools.ParametricLine && sprite.axes == this) {
                            can_show_adorners = false;
                            break;
                        }
                    }
                    if (can_show_adorners) {
                        var ZoomButton = (function (_super) {
                            __extends(ZoomButton, _super);
                            function ZoomButton(axes, x, y, text, x_multiplier, y_multiplier) {
                                var _this = _super.call(this, axes.document, x, y, text, 10, 10, true, 45) || this;
                                _this._axes = axes;
                                _this._x_multiplier = x_multiplier;
                                _this._y_multiplier = y_multiplier;
                                return _this;
                            }
                            ZoomButton.prototype.onClick = function () {
                                var _this = this;
                                assert(this._axes);
                                if (this._axes._adorners.visible) {
                                    return Tools.UndoTransaction.Do(this, Tools.Resources.string("Масштабирование осей"), function () {
                                        _this._axes.kX *= _this._x_multiplier;
                                        _this._axes.kY *= _this._y_multiplier;
                                        return true;
                                    });
                                }
                                else {
                                    return false;
                                }
                            };
                            return ZoomButton;
                        }(Tools.Button));
                        var x_6 = this.x;
                        var y_6 = this.y;
                        var mod_x = makeMod(this, function () { return event.x + AxesLines._adornerMargins + _this.x - x_6; });
                        var mod_y = makeMod(this, function () { return event.y - AxesLines._adornerMargins + _this.y - y_6; });
                        var multiplier = 1.5;
                        var plus_1 = new ZoomButton(this, mod_x, mod_y, "+", 1 / multiplier, 1 / multiplier);
                        var minus_1 = new ZoomButton(this, mod_x, function () { return plus_1.bottom; }, "-", multiplier, multiplier);
                        var x_plus_1 = new ZoomButton(this, function () { return plus_1.right; }, mod_y, "x+", 1 / multiplier, 1);
                        var x_minus_1 = new ZoomButton(this, function () { return minus_1.right; }, function () { return x_plus_1.bottom; }, "x-", multiplier, 1);
                        var y_plus_1 = new ZoomButton(this, function () { return x_plus_1.right; }, mod_y, "y+", 1, 1 / multiplier);
                        var y_minus = new ZoomButton(this, function () { return x_minus_1.right; }, function () { return y_plus_1.bottom; }, "y-", 1, multiplier);
                        this._adorners.push(plus_1);
                        this._adorners.push(minus_1);
                        this._adorners.push(x_plus_1);
                        this._adorners.push(x_minus_1);
                        this._adorners.push(y_plus_1);
                        this._adorners.push(y_minus);
                    }
                }
                this.selected = selected;
                _super.prototype.mouseMove.call(this, event);
            };
            AxesLines.prototype.mouseClick = function (event) {
                var _this = this;
                if (this.mouseHit(event)) {
                    var doc_7 = this.document;
                    if (doc_7.canShowMenu(this)) {
                        var x_7 = doc_7.mouseArea.mousePoint.x;
                        var y_7 = doc_7.mouseArea.mousePoint.y;
                        var menu = new Tools.Menu(doc_7, x_7, y_7);
                        var menu_item = menu.addMenuItem(Tools.Resources.string("Масштаб по осям x/y..."));
                        menu_item.onChecked.bind(this, this.scaleDialog);
                        menu_item = menu.addMenuItem(Tools.Resources.string("Создать функцию..."));
                        menu_item.onChecked.bind(this, function () { return _this.document.addParametricLine(Point.make(x_7, y_7), _this); });
                        if (this.lines.length == 1) {
                            var line = this.lines[0];
                            menu_item = menu.addMenuItem(Tools.Resources.string("Редактировать функцию f = {0} ...", line.code.text));
                            menu_item.onChecked.bind(line, line.showExpressionEditor);
                        }
                        else if (this.lines.length > 1) {
                            var group = menu.addMenuGroup(Tools.Resources.string("Редактировать функцию"));
                            for (var _i = 0, _a = this.lines; _i < _a.length; _i++) {
                                var line = _a[_i];
                                menu_item = group.addMenuItem("f = " + line.code.text + " ...");
                                menu_item.onChecked.bind(line, line.showExpressionEditor);
                            }
                        }
                        menu_item = menu.addMenuItem(Tools.Resources.string("Удалить координатную плоскость"));
                        menu_item.onChecked.bind(this, function () { return doc_7.removeAxes(_this); });
                        menu.show();
                    }
                }
                _super.prototype.mouseClick.call(this, event);
            };
            AxesLines.prototype.updateLines = function () {
                for (var _i = 0, _a = this.lines; _i < _a.length; _i++) {
                    var line = _a[_i];
                    line.setModified();
                }
            };
            AxesLines._adornerMargins = 10;
            return AxesLines;
        }(Tools.DocumentSprite));
        Tools.AxesLines = AxesLines;
    })(Tools = Geoma.Tools || (Geoma.Tools = {}));
})(Geoma || (Geoma = {}));
var OperatorPrecedence;
(function (OperatorPrecedence) {
    OperatorPrecedence[OperatorPrecedence["First"] = 0] = "First";
    OperatorPrecedence[OperatorPrecedence["Second"] = 1] = "Second";
    OperatorPrecedence[OperatorPrecedence["Third"] = 2] = "Third";
})(OperatorPrecedence || (OperatorPrecedence = {}));
var Extensions = (function () {
    function Extensions() {
    }
    Extensions.split = function (value) {
        var separators = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            separators[_i - 1] = arguments[_i];
        }
        var split = [];
        var lastIndex = 0;
        for (var index = 0; index < value.length; index++) {
            for (var index2 = 0; index2 < separators.length; index2++) {
                if (index + separators[index2].length <= value.length) {
                    var substr = value.substr(index, separators[index2].length);
                    if (substr == separators[index2]) {
                        if (lastIndex != index) {
                            split.push(value.substring(lastIndex, index));
                        }
                        lastIndex = index + 1;
                    }
                }
            }
        }
        if (lastIndex < value.length) {
            split.push(value.substring(lastIndex));
        }
        return split;
    };
    Extensions.replaceAll = function (searchValue, replaceValue, value) {
        var index = value.indexOf(searchValue);
        while (index != -1) {
            value = Extensions.replace(value, index, index + searchValue.length, replaceValue);
            index = value.indexOf(searchValue);
        }
        return value;
    };
    Extensions.replace = function (value, start, end, replaceValue) {
        return value.substring(0, start) + replaceValue + value.substr(end);
    };
    Extensions.asBoolean = function (value) {
        if (typeof value == "boolean") {
            return value;
        }
        else {
            throw new Error("Unable to cast " + typeof value + " to boolean");
        }
    };
    Extensions.asNumber = function (value) {
        if (typeof value == "number") {
            return value;
        }
        else {
            throw new Error("Unable to cast " + typeof value + " to number");
        }
    };
    return Extensions;
}());
var Operand = (function () {
    function Operand(value) {
        this.Value = value;
    }
    return Operand;
}());
var Parameter = (function () {
    function Parameter(name, value) {
        this.Name = name;
        this.Value = value;
    }
    return Parameter;
}());
var Operator = (function () {
    function Operator(value, operatorLevel) {
        this.Value = value;
        this.OperatorLevel = operatorLevel;
    }
    return Operator;
}());
var BinaryOperation = (function () {
    function BinaryOperation(firstOperand, secondOperand, oper) {
        this.FirstOperand = firstOperand;
        this.SecondOperand = secondOperand;
        this.Operator = oper;
    }
    return BinaryOperation;
}());
var UnaryOperation = (function () {
    function UnaryOperation(argument, func) {
        this.Arguments = argument;
        this.Func = func;
    }
    return UnaryOperation;
}());
var ArgumentArray = (function () {
    function ArgumentArray(argument) {
        this.Arguments = argument;
    }
    Object.defineProperty(ArgumentArray.prototype, "Length", {
        get: function () {
            return this.Arguments.length;
        },
        enumerable: false,
        configurable: true
    });
    return ArgumentArray;
}());
var MathFunction = (function () {
    function MathFunction(type, argsCount, func) {
        this.Type = type;
        this.ArgumentsCount = argsCount;
        this.Func = func;
    }
    return MathFunction;
}());
var MathParser = (function () {
    function MathParser() {
    }
    MathParser.IsBasicOperator = function (value) {
        var result = false;
        MathParser.Operators.forEach(function (oper) {
            if (!result) {
                result = oper.Value == value;
            }
        });
        return result;
    };
    MathParser.CalculateOperators = function (expression, operands) {
        var split = Extensions.split(expression, MathParser.OperandKey);
        var calculate = function (oper) {
            var sign = 1;
            for (var index = oper.length - 1; !MathParser.IsBasicOperator(oper); index--) {
                if (oper[index] == '-') {
                    sign = -sign;
                    oper = oper.substr(0, oper.length - 1);
                }
                else {
                    throw new Error("Incorrect operator: " + oper);
                }
            }
            return oper[0].toString() + (sign == -1 ? "-" : "");
        };
        for (var token = 0; token < split.length; token++) {
            if (!isNaN(Number(split[token]))) {
                split[token] = "" + MathParser.OperandKey + parseInt(split[token]) + MathParser.OperandKey;
            }
            else {
                var oper = calculate(split[token]);
                var operandIndex = parseInt(split[token + 1]);
                if (token == 0) {
                    split[token] = "";
                    if (oper == "-") {
                        operands[operandIndex] = new Operand(new UnaryOperation(new ArgumentArray([operands[operandIndex]]), MathParser.NegativeFunction));
                    }
                    else if (oper != "--") {
                        throw new Error("Can't parse operator: " + split[token]);
                    }
                }
                else {
                    if (!MathParser.IsBasicOperator(split[token])) {
                        split[token] = oper[0].toString();
                        if (oper.length > 1 && oper[1] == '-') {
                            operands[operandIndex] = new Operand(new UnaryOperation(new ArgumentArray([operands[operandIndex]]), MathParser.NegativeFunction));
                        }
                    }
                }
            }
        }
        return { operands: operands, expression: split.join("") };
    };
    MathParser.GetOperands = function (expression, parameters, addedOperands) {
        var operands = [];
        if (addedOperands != null) {
            operands = operands.concat(addedOperands);
        }
        var lastIndex = 0;
        var operators = [];
        MathParser.Operators.forEach(function (oper) {
            operators.push(oper.Value);
        });
        var addOperand = function (start, end) {
            var operand = expression.substring(start, end);
            if (operand.length > 0) {
                if (operand[0].toString() == MathParser.OperandKey && operand[operand.length - 1].toString() == MathParser.OperandKey) {
                    return start + operand.length;
                }
                else {
                    var replaceValue = "" + MathParser.OperandKey + operands.length + MathParser.OperandKey;
                    expression = Extensions.replace(expression, lastIndex, end, replaceValue);
                    operands.push(MathParser.ParseOperand(operand, parameters, operands));
                    return start + replaceValue.length;
                }
            }
            else {
                return -1;
            }
        };
        var _loop_1 = function (index) {
            var currentOperator = "";
            operators.forEach(function (oper) {
                if (index + oper.length <= expression.length && oper.length > currentOperator.length) {
                    var subExpression = expression.substr(index, oper.length);
                    if (subExpression == oper) {
                        currentOperator = oper;
                    }
                }
            });
            if (currentOperator != "") {
                var currentIndex = addOperand(lastIndex, index);
                index = currentIndex == -1 ? index : currentIndex;
                lastIndex = index + currentOperator.length;
            }
            out_index_1 = index;
        };
        var out_index_1;
        for (var index = 0; index < expression.length; index++) {
            _loop_1(index);
            index = out_index_1;
        }
        addOperand(lastIndex, expression.length);
        return { operands: operands, expression: expression };
    };
    MathParser.GroupBinaryOperations = function (expression, operands, level) {
        var split = Extensions.split(expression, MathParser.OperandKey);
        var operators = [];
        MathParser.Operators.forEach(function (oper) {
            if (level == oper.OperatorLevel) {
                operators.push(oper);
            }
        });
        var _loop_2 = function (token) {
            var currentOperator;
            operators.forEach(function (oper) {
                if (oper.Value == split[token]) {
                    currentOperator = oper;
                }
            });
            if (currentOperator !== undefined) {
                var firstOperandIndex = parseInt(split[token - 1]);
                var secondOperandIndex = parseInt(split[token + 1]);
                var expressionToReplace = "" + MathParser.OperandKey + firstOperandIndex + MathParser.OperandKey + currentOperator.Value + MathParser.OperandKey + secondOperandIndex + MathParser.OperandKey;
                operands.push(new Operand(new BinaryOperation(operands[firstOperandIndex], operands[secondOperandIndex], currentOperator)));
                expression = Extensions.replaceAll(expressionToReplace, "" + MathParser.OperandKey + (operands.length - 1) + MathParser.OperandKey, expression);
                token = 1;
                split = Extensions.split(expression, MathParser.OperandKey);
            }
            else {
                token++;
            }
            out_token_1 = token;
        };
        var out_token_1;
        for (var token = 1; token < split.length - 1;) {
            _loop_2(token);
            token = out_token_1;
        }
        return { operands: operands, expression: expression };
    };
    MathParser.SplitExpression = function (expression, parameters, operands) {
        var calculatedOperands = MathParser.GetOperands(expression, parameters, operands);
        var calculatedOperators = MathParser.CalculateOperators(calculatedOperands.expression, calculatedOperands.operands);
        var thirdLevel = MathParser.GroupBinaryOperations(calculatedOperators.expression, calculatedOperators.operands, OperatorPrecedence.Third);
        var secondLevel = MathParser.GroupBinaryOperations(thirdLevel.expression, thirdLevel.operands, OperatorPrecedence.Second);
        var firstLevel = MathParser.GroupBinaryOperations(secondLevel.expression, secondLevel.operands, OperatorPrecedence.First);
        return firstLevel.operands[MathParser.ParseOperandIndex(firstLevel.expression)];
    };
    MathParser.ParseOperand = function (operand, parameters, addedOperands) {
        var allParameters = MathParser.GetParameters(parameters);
        if (!isNaN(Number(operand))) {
            return new Operand(parseFloat(operand));
        }
        else if (operand[0].toString() == MathParser.OperandKey && operand[operand.length - 1].toString() == MathParser.OperandKey) {
            if (!addedOperands) {
                throw new Error("addedOperands is not defined");
            }
            return addedOperands[MathParser.ParseOperandIndex(operand)];
        }
        else if (allParameters.has(operand)) {
            return new Operand(allParameters.get(operand));
        }
        else if (operand.indexOf(MathParser.Enumerator) != -1) {
            var args = Extensions.split(operand, MathParser.Enumerator);
            var operands = [];
            for (var index = 0; index < args.length; index++) {
                operands.push(MathParser.SplitExpression(args[index], parameters, addedOperands));
            }
            return new Operand(new ArgumentArray(operands));
        }
        else {
            var returnValue = void 0;
            var suitableFunctions_1 = [];
            MathParser.Functions.forEach(function (func) {
                if (func.Type.length < operand.length && operand.substr(0, func.Type.length) == func.Type) {
                    suitableFunctions_1.push(func);
                }
            });
            if (suitableFunctions_1.length == 0) {
                if (!operand.includes(MathParser.OperandKey)) {
                    return new Operand(new Parameter(operand, 0));
                }
                else {
                    throw new Error("Function wasn't found");
                }
            }
            var mostSuitableFunction_1 = suitableFunctions_1[0];
            suitableFunctions_1.forEach(function (func) {
                if (mostSuitableFunction_1) {
                    if (func.Type.length > mostSuitableFunction_1.Type.length) {
                        mostSuitableFunction_1 = func;
                    }
                }
            });
            var innerExpression = operand.substr(mostSuitableFunction_1.Type.length, operand.length - mostSuitableFunction_1.Type.length);
            var value = MathParser.ParseOperand(innerExpression, parameters, addedOperands);
            if (value.Value instanceof ArgumentArray) {
                if (value.Value.Length != mostSuitableFunction_1.ArgumentsCount) {
                    throw new Error("Function doesn't take " + value.Value.Length + " arguments");
                }
                else {
                    returnValue = new Operand(new UnaryOperation(value.Value, mostSuitableFunction_1));
                }
            }
            else if (1 != mostSuitableFunction_1.ArgumentsCount) {
                throw new Error("Function doesn't take 1 argument");
            }
            else {
                returnValue = new Operand(new UnaryOperation(new ArgumentArray([value]), mostSuitableFunction_1));
            }
            return returnValue;
        }
    };
    MathParser.GetParameters = function (parameters) {
        var output = new Map();
        MathParser.Constants.forEach(function (constant) {
            output.set(constant.Name, constant);
        });
        if (parameters != null) {
            parameters.forEach(function (parameter) {
                if (!output.has(parameter.Name)) {
                    output.set(parameter.Name, parameter);
                }
                else {
                    throw new Error("Double parameter " + parameter.Name + " declaration");
                }
            });
        }
        return output;
    };
    MathParser.ParseOperandIndex = function (operand) {
        return parseInt(Extensions.replaceAll(MathParser.OperandKey, "", operand));
    };
    MathParser.OpenBraces = function (expression, parameters) {
        var operands = [];
        for (; expression.indexOf("(") != -1;) {
            var expressionLast = expression;
            var maxBracesCount = 0;
            var bracesCount = 0;
            var currentOpenIndex = 0;
            var openIndex = -1;
            var closeIndex = -1;
            for (var index = 0; index < expression.length; index++) {
                if (expression[index] == '(') {
                    bracesCount++;
                    currentOpenIndex = index;
                }
                if (expression[index] == ')') {
                    if (bracesCount > maxBracesCount) {
                        openIndex = currentOpenIndex;
                        closeIndex = index;
                        maxBracesCount = bracesCount;
                    }
                    bracesCount = 0;
                }
            }
            var expressionToEvaluate = expression.substr(openIndex + 1, closeIndex - (openIndex + 1));
            var expressionToReplace = "(" + expressionToEvaluate + ")";
            if (expressionToEvaluate.indexOf(MathParser.Enumerator) != -1) {
                var resultOperand = MathParser.ParseOperand(expressionToEvaluate, parameters, operands);
                operands.push(resultOperand);
            }
            else {
                var resultOperand = MathParser.SplitExpression(expressionToEvaluate, parameters, operands);
                operands.push(resultOperand);
            }
            expression = Extensions.replaceAll(expressionToReplace, "" + MathParser.OperandKey + (operands.length - 1) + MathParser.OperandKey, expression);
            if (expressionLast == expression) {
                throw new Error("Can't open braces in: " + expression);
            }
        }
        return { operands: operands, expression: expression };
    };
    MathParser.Parse = function (expression, parameters) {
        expression = expression.replace(/\s/gi, "").replace(/\,/gi, ".");
        var openedBraces = MathParser.OpenBraces(expression, parameters);
        return MathParser.SplitExpression(openedBraces.expression, parameters, openedBraces.operands);
    };
    MathParser.Evaluate = function (operation) {
        var firstOperand = MathParser.EvaluateOperand(operation.FirstOperand);
        var secondOperand = MathParser.EvaluateOperand(operation.SecondOperand);
        switch (operation.Operator.Value) {
            case "-":
                return Extensions.asNumber(firstOperand) - Extensions.asNumber(secondOperand);
            case "+":
                return Extensions.asNumber(firstOperand) + Extensions.asNumber(secondOperand);
            case "*":
                return Extensions.asNumber(firstOperand) * Extensions.asNumber(secondOperand);
            case "/":
                return Extensions.asNumber(firstOperand) / Extensions.asNumber(secondOperand);
            case "%":
                return Extensions.asNumber(firstOperand) % Extensions.asNumber(secondOperand);
            case "^":
                return Math.pow(Extensions.asNumber(firstOperand), Extensions.asNumber(secondOperand));
            case "&":
                return Extensions.asBoolean(firstOperand) && Extensions.asBoolean(secondOperand);
            case "|":
                return Extensions.asBoolean(firstOperand) || Extensions.asBoolean(secondOperand);
            case ">":
                return Extensions.asNumber(firstOperand) > Extensions.asNumber(secondOperand);
            case "<":
                return Extensions.asNumber(firstOperand) < Extensions.asNumber(secondOperand);
            case "ge":
            case ">=":
                return Extensions.asNumber(firstOperand) >= Extensions.asNumber(secondOperand);
            case "le":
            case "<=":
                return Extensions.asNumber(firstOperand) <= Extensions.asNumber(secondOperand);
            case "==":
                return Extensions.asNumber(firstOperand) == Extensions.asNumber(secondOperand);
            case "!=":
                return Extensions.asNumber(firstOperand) != Extensions.asNumber(secondOperand);
            default:
                throw new Error("Unknown operator: " + operation.Operator.Value);
        }
    };
    MathParser.EvaluateOperand = function (operand) {
        if (typeof operand.Value == "number" || typeof operand.Value == "boolean") {
            return operand.Value;
        }
        else if (operand.Value instanceof Parameter) {
            return operand.Value.Value;
        }
        else if (operand.Value instanceof UnaryOperation) {
            var evaluatedArguments = [];
            for (var index = 0; index < operand.Value.Func.ArgumentsCount; index++) {
                evaluatedArguments.push(MathParser.EvaluateOperand(operand.Value.Arguments.Arguments[index]));
            }
            var unaryResult = operand.Value.Func.Func(evaluatedArguments);
            return unaryResult;
        }
        else if (operand.Value instanceof BinaryOperation) {
            var binaryResult = MathParser.Evaluate(operand.Value);
            return binaryResult;
        }
        else {
            throw new Error("Unknown function");
        }
    };
    MathParser.ArgumentsToLatex = function (args) {
        var innerFunction = "";
        for (var index = 0; index < args.Length; index++) {
            innerFunction += MathParser.OperandToLatexFormula(args.Arguments[index]);
            if (index < args.Length - 1) {
                innerFunction += MathParser.Enumerator;
            }
        }
        return innerFunction;
    };
    MathParser.OperandToLatexFormula = function (operand) {
        var output = "";
        if (typeof operand.Value == "number" || typeof operand.Value == "boolean") {
            output += operand.Value.toString();
        }
        else if (operand.Value instanceof Parameter) {
            switch (operand.Value.Name) {
                case "pi":
                    output += "\pi";
                    break;
                case "infinity":
                    output += "\infty";
                    break;
                default:
                    output += operand.Value.Name;
                    break;
            }
        }
        else if (operand.Value instanceof UnaryOperation) {
            var innerFunction = MathParser.ArgumentsToLatex(operand.Value.Arguments);
            switch (operand.Value.Func.Type) {
                case "negative":
                    var argumentValue = operand.Value.Arguments.Arguments[0].Value;
                    if (typeof argumentValue == "number" || typeof operand.Value == "boolean" || argumentValue instanceof Parameter || argumentValue instanceof UnaryOperation) {
                        output += "-" + innerFunction + "";
                    }
                    else {
                        output += "-(" + innerFunction + ")";
                    }
                    break;
                case "sqrt":
                    output += "\\sqrt{" + innerFunction + "}";
                    break;
                case "cbrt":
                    output += "\\sqrt[3]{" + innerFunction + "}";
                    break;
                case "rad":
                    output += innerFunction;
                    break;
                case "deg":
                    output += "{" + innerFunction + "}" + "^{\\circ}";
                    break;
                case "ln":
                    output += "\\log_e{(" + innerFunction + ")}";
                    break;
                case "log":
                    output += "\\log_{" + MathParser.OperandToLatexFormula(operand.Value.Arguments.Arguments[1]) + "}{(" + MathParser.OperandToLatexFormula(operand.Value.Arguments.Arguments[0]) + ")}";
                    break;
                case "rand":
                    output += "rand(" + innerFunction + ")";
                    break;
                case "root":
                    output += "\\sqrt[" + MathParser.OperandToLatexFormula(operand.Value.Arguments.Arguments[1]) + "]{" + MathParser.OperandToLatexFormula(operand.Value.Arguments.Arguments[0]) + "}";
                    break;
                case "!":
                    output += "not \\;(" + innerFunction + ")";
                    break;
                case "acos":
                    output += "\\arccos{(" + innerFunction + ")}";
                    break;
                case "asin":
                    output += "\\arcsin{(" + innerFunction + ")}";
                    break;
                case "atan":
                    output += "\\arctan{(" + innerFunction + ")}";
                    break;
                case "acot":
                    output += "\\arctan{(\\frac{1}{" + innerFunction + "})}";
                    break;
                case "acosh":
                    output += "\\cosh^{-1}{(" + innerFunction + ")}";
                    break;
                case "asinh":
                    output += "\\sinh^{-1}1{(" + innerFunction + ")}";
                    break;
                case "atanh":
                    output += "\\tanh^{-1}{(" + innerFunction + ")}";
                    break;
                case "acoth":
                    output += "\\tanh^{-1}{(\\frac{1}{" + innerFunction + "})}";
                    break;
                case "exp":
                    output += "e^{" + innerFunction + "}";
                    break;
                case "floor":
                    output += "⌊" + innerFunction + "⌋";
                    break;
                case "round":
                    output += "round(" + innerFunction + ")";
                    break;
                case "ceil":
                    output += "⌈" + innerFunction + "⌉";
                    break;
                case "abs":
                    output += "|" + innerFunction + "|";
                    break;
                case "f'":
                    output += "\\frac{d}{dx}(" + innerFunction + ")";
                    break;
                case "fact":
                    output += innerFunction + "!";
                    break;
                case "sign":
                    output += "sgn(" + innerFunction + ")";
                    break;
                default:
                    output += "\\" + operand.Value.Func.Type + "{" + innerFunction + "}";
                    break;
            }
        }
        else if (operand.Value instanceof BinaryOperation) {
            output += MathParser.BinaryOperationToLatexFormula(operand.Value);
        }
        else {
            return "";
        }
        return output;
    };
    MathParser.BinaryOperationToLatexFormula = function (operation) {
        var output = "";
        var firstOperand = MathParser.OperandToLatexFormula(operation.FirstOperand);
        var secondOperand = MathParser.OperandToLatexFormula(operation.SecondOperand);
        if (operation.FirstOperand.Value instanceof BinaryOperation) {
            var firstOperation = operation.FirstOperand.Value;
            if ((firstOperation.Operator.OperatorLevel < operation.Operator.OperatorLevel || operation.Operator.Value == "-") && operation.Operator.Value != "/") {
                firstOperand = "(" + firstOperand + ")";
            }
        }
        if (operation.SecondOperand.Value instanceof BinaryOperation) {
            var secondOperation = operation.SecondOperand.Value;
            if ((secondOperation.Operator.OperatorLevel < operation.Operator.OperatorLevel || operation.Operator.Value == "-") && operation.Operator.Value != "^" && operation.Operator.Value != "/") {
                secondOperand = "(" + secondOperand + ")";
            }
        }
        switch (operation.Operator.Value) {
            case "*":
                output += firstOperand + " \\cdot " + secondOperand;
                break;
            case "/":
                output += "\\frac{" + firstOperand + "}{" + secondOperand + "}";
                break;
            case ">=":
                output += firstOperand + "\\geq" + secondOperand;
                break;
            case "<=":
                output += firstOperand + "\\leq" + secondOperand;
                break;
            case "==":
                output += firstOperand + "\\equiv" + secondOperand;
                break;
            case "!=":
                output += firstOperand + "\\neq" + secondOperand;
                break;
            case "&":
                output += firstOperand + "\\; and \\;" + secondOperand;
                break;
            case "|":
                output += firstOperand + "\\; or \\;" + secondOperand;
                break;
            case "^":
                var powerAfrer = function () {
                    output += "{" + firstOperand + "}^{" + secondOperand + "}";
                };
                var powerBefore = function () {
                    var funct = operation.FirstOperand.Value;
                    output += "\\" + funct.Func.Type + "^" + MathParser.OperandToLatexFormula(operation.SecondOperand) + "{(" + MathParser.ArgumentsToLatex(funct.Arguments) + ")}";
                };
                if (operation.FirstOperand.Value instanceof UnaryOperation) {
                    var func = (operation.FirstOperand.Value).Func;
                    switch (func.Type) {
                        case "cos":
                            powerBefore();
                            break;
                        case "sin":
                            powerBefore();
                            break;
                        case "tan":
                            powerBefore();
                            break;
                        case "cot":
                            powerBefore();
                            break;
                        case "acos":
                            powerBefore();
                            break;
                        case "asin":
                            powerBefore();
                            break;
                        case "atan":
                            powerBefore();
                            break;
                        case "acot":
                            powerBefore();
                            break;
                        default:
                            powerAfrer();
                            break;
                    }
                }
                else {
                    powerAfrer();
                }
                break;
            default:
                output += firstOperand + " " + operation.Operator.Value + " " + secondOperand;
                break;
        }
        return output;
    };
    MathParser.Operators = [
        new Operator("+", OperatorPrecedence.First),
        new Operator("-", OperatorPrecedence.First),
        new Operator("|", OperatorPrecedence.First),
        new Operator("&", OperatorPrecedence.First),
        new Operator("*", OperatorPrecedence.Second),
        new Operator("%", OperatorPrecedence.Second),
        new Operator("/", OperatorPrecedence.Second),
        new Operator(">", OperatorPrecedence.Second),
        new Operator("<", OperatorPrecedence.Second),
        new Operator(">=", OperatorPrecedence.Second),
        new Operator("<=", OperatorPrecedence.Second),
        new Operator("==", OperatorPrecedence.Second),
        new Operator("!=", OperatorPrecedence.Second),
        new Operator("^", OperatorPrecedence.Third),
    ];
    MathParser.OperandKey = "#";
    MathParser.Enumerator = ";";
    MathParser.Constants = [new Parameter("pi", Math.PI), new Parameter("e", Math.E), new Parameter("false", false), new Parameter("true", true), new Parameter("infinity", Number.POSITIVE_INFINITY)];
    MathParser.NegativeFunction = new MathFunction("negative", 1, function (value) { return -Extensions.asNumber(value[0]); });
    MathParser.Functions = [
        new MathFunction("rad", 1, function (value) { return Extensions.asNumber(value[0]) / 180.0 * Math.PI; }),
        new MathFunction("deg", 1, function (value) { return Extensions.asNumber(value[0]) * 180.0 / Math.PI; }),
        new MathFunction("cos", 1, function (value) { return Math.cos(Extensions.asNumber(value[0])); }),
        new MathFunction("sin", 1, function (value) { return Math.sin(Extensions.asNumber(value[0])); }),
        new MathFunction("tan", 1, function (value) { return Math.sin(Extensions.asNumber(value[0])) / Math.cos(Extensions.asNumber(value[0])); }),
        new MathFunction("cot", 1, function (value) { return Math.cos(Extensions.asNumber(value[0])) / Math.sin(Extensions.asNumber(value[0])); }),
        new MathFunction("cosh", 1, function (value) { return Math.cosh(Extensions.asNumber(value[0])); }),
        new MathFunction("sinh", 1, function (value) { return Math.sinh(Extensions.asNumber(value[0])); }),
        new MathFunction("tanh", 1, function (value) { return Math.sinh(Extensions.asNumber(value[0])) / Math.cosh(Extensions.asNumber(value[0])); }),
        new MathFunction("coth", 1, function (value) { return Math.cosh(Extensions.asNumber(value[0])) / Math.sinh(Extensions.asNumber(value[0])); }),
        new MathFunction("acos", 1, function (value) { return Math.acos(Extensions.asNumber(value[0])); }),
        new MathFunction("asin", 1, function (value) { return Math.asin(Extensions.asNumber(value[0])); }),
        new MathFunction("atan", 1, function (value) { return Math.atan(Extensions.asNumber(value[0])); }),
        new MathFunction("acot", 1, function (value) { return Math.atan(1 / Extensions.asNumber(value[0])); }),
        new MathFunction("acosh", 1, function (value) { return Math.acosh(Extensions.asNumber(value[0])); }),
        new MathFunction("asinh", 1, function (value) { return Math.asinh(Extensions.asNumber(value[0])); }),
        new MathFunction("atanh", 1, function (value) { return Math.atanh(Extensions.asNumber(value[0])); }),
        new MathFunction("acoth", 1, function (value) { return Math.atanh(1 / Extensions.asNumber(value[0])); }),
        new MathFunction("sqrt", 1, function (value) { return Math.sqrt(Extensions.asNumber(value[0])); }),
        new MathFunction("cbrt", 1, function (value) { return Math.pow(Extensions.asNumber(value[0]), 1.0 / 3.0); }),
        new MathFunction("ln", 1, function (value) { return Math.log(Extensions.asNumber(value[0])); }),
        new MathFunction("abs", 1, function (value) { return Math.abs(Extensions.asNumber(value[0])); }),
        new MathFunction("sign", 1, function (value) { return Math.sign(Extensions.asNumber(value[0])); }),
        new MathFunction("exp", 1, function (value) { return Math.exp(Extensions.asNumber(value[0])); }),
        new MathFunction("floor", 1, function (value) { return Math.floor(Extensions.asNumber(value[0])); }),
        new MathFunction("ceil", 1, function (value) { return Math.ceil(Extensions.asNumber(value[0])); }),
        new MathFunction("round", 1, function (value) { return Math.round(Extensions.asNumber(value[0])); }),
        new MathFunction("!", 1, function (value) { return !Extensions.asBoolean(value[0]); }),
        new MathFunction("fact", 1, function (value) { var result = 1; for (var i = 1; i <= Extensions.asNumber(value[0]); i++) {
            result *= i;
        } return result; }),
        new MathFunction("f'", 1, function () { throw new Error("Not implemented"); }),
        new MathFunction("rand", 2, function (value) { return Math.random() * (Extensions.asNumber(value[1]) - Extensions.asNumber(value[0])) + Extensions.asNumber(value[0]); }),
        new MathFunction("log", 2, function (value) { return Math.log(Extensions.asNumber(value[0])) / Math.log(Extensions.asNumber(value[1])); }),
        new MathFunction("root", 2, function (value) { return Math.pow(Extensions.asNumber(value[0]), 1 / Extensions.asNumber(value[1])); })
    ];
    return MathParser;
}());
var UnitTests = (function () {
    function UnitTests() {
    }
    UnitTests.DisplayResult = function (received, expected, passed, type) {
        if (passed) {
            console.log("%c Test " + type + " passed. Received: " + received + ", expected: " + expected + " ", 'background: #0a0; color: #fff');
        }
        else {
            console.log("%c Test " + type + " failed. Received: " + received + ", expected: " + expected + " ", 'background: #a00; color: #fff');
        }
    };
    UnitTests.DeclareTestCase = function (testCase) {
        UnitTests.TestCases.push(testCase);
    };
    UnitTests.AreEqual = function (expression, expected) {
        var compared = UnitTests.EvaluateHelper(expression);
        var passed;
        if (typeof compared == "number" && typeof expected == "number") {
            passed = expected - UnitTests.Delta <= compared && expected + UnitTests.Delta >= compared;
        }
        else {
            passed = compared == expected;
        }
        UnitTests.DisplayResult(compared.toString(), expected.toString(), passed, "\"" + expression + "\"");
    };
    UnitTests.AreUnequal = function (expression, expected) {
        var compared = UnitTests.EvaluateHelper(expression);
        var passed;
        if (typeof compared == "number" && typeof expected == "number") {
            passed = !(expected - UnitTests.Delta <= compared && expected + UnitTests.Delta >= compared);
        }
        else {
            passed = compared != expected;
        }
        UnitTests.DisplayResult(compared.toString(), expected.toString(), passed, "\"" + expression + "\"");
    };
    UnitTests.ThrowError = function (expression) {
        try {
            var result = UnitTests.EvaluateHelper(expression);
            UnitTests.DisplayResult(result.toString(), "Error", false, "\"" + expression + "\"");
        }
        catch (_a) {
            UnitTests.DisplayResult("Error", "Error", true, "\"" + expression + "\"");
        }
    };
    UnitTests.IsTrue = function (expression) {
        UnitTests.DisplayResult(expression ? "true" : "false", "true", expression, "\"is true\"");
    };
    UnitTests.EvaluateHelper = function (expression) {
        var evaluated = MathParser.EvaluateOperand(MathParser.Parse(expression));
        return evaluated;
    };
    UnitTests.RunTests = function () {
        UnitTests.TestCases.forEach(function (testCase) {
            testCase();
        });
    };
    UnitTests.TestCases = [];
    UnitTests.Delta = 0.01;
    return UnitTests;
}());
function Evaluate() {
    var input = document.getElementById('inp');
    var result = document.getElementById('res');
    var expression = document.getElementById('expression');
    if (input && result && expression) {
        result.innerHTML = UnitTests.EvaluateHelper(input.value).toString();
        expression.innerHTML = "$" + MathParser.OperandToLatexFormula(MathParser.Parse(input.value)) + "$";
    }
}
UnitTests.DeclareTestCase(function () {
    UnitTests.AreEqual("cos(3550/20)*20+100", Math.cos(3550 / 20.0) * 20 + 100);
});
UnitTests.DeclareTestCase(function () {
    UnitTests.AreEqual("4^(2*5^(1/2)+4)*2^(-3-4*5^(1/2))+(6^(3^(1/2))*7^(3^(1/2)))/(42^(3^(1/2)-1))+(-12)/((sin(131/180*3,1415926535897932384626433832795))^2+(sin(221/180*3,1415926535897932384626433832795))^2)+44*sqrt(3)*tan(-480/180*3,1415926535897932384626433832795)*46*tan(7/180*3,1415926535897932384626433832795)*tan(83/180*3,1415926535897932384626433832795)", 6134.0);
});
UnitTests.DeclareTestCase(function () {
    UnitTests.AreEqual("4^(2*5^(1/2)+4)*2^(-3-4*5^(1/2))+(6^(3^(1/2))*7^(3^(1/2)))/(42^(3^(1/2)-1))+(-12)/((sin(131/180*pi))^2+(sin(221/180*pi))^2)+44*sqrt(3)*tan(-480/180*pi)*46*tan(7/180*pi)*tan(83/180*pi)", 6134.0);
});
UnitTests.DeclareTestCase(function () {
    UnitTests.AreEqual("46*tan(7/180*3,1415926535897932384626433832795)*tan(83/180*3,1415926535897932384626433832795)", 46.0);
});
UnitTests.DeclareTestCase(function () {
    UnitTests.AreEqual("(-12)/((sin(131/180*3,1415926535897932384626433832795))^2+(sin(221/180*3,1415926535897932384626433832795))^2)", -12.0);
});
UnitTests.DeclareTestCase(function () {
    UnitTests.AreEqual("(6^(3^(1/2))*7^(3^(1/2)))/(42^(3^(1/2)-1))", 42.0);
});
UnitTests.DeclareTestCase(function () {
    UnitTests.AreEqual("4 ^ (2 * 5 ^ (1 / 2) + 4) * 2 ^ (-3 - 4 * 5 ^ (1 / 2))", 32.0);
});
UnitTests.DeclareTestCase(function () {
    UnitTests.AreEqual("cos(rad(sin(rad(deg(rad(30))))))", Math.cos(Math.sin(Math.PI / 6) / 180 * Math.PI));
});
UnitTests.DeclareTestCase(function () {
    UnitTests.AreEqual("deg(acos(cos(asin(sin(rad(30))))))", 30.0);
});
UnitTests.DeclareTestCase(function () {
    UnitTests.AreEqual("log(10^6;root(10^4;10+10))", 30.0);
});
UnitTests.DeclareTestCase(function () {
    UnitTests.AreEqual("log(10^6;root(10+10;10^4))", 46117.3);
});
UnitTests.DeclareTestCase(function () {
    UnitTests.AreUnequal("2+2", 5);
});
UnitTests.DeclareTestCase(function () {
    var expression = "sdgphjsdioghiosdnhiosd";
    var operand = MathParser.Parse(expression);
    UnitTests.IsTrue((operand.Value) instanceof Parameter);
    UnitTests.IsTrue((operand.Value).Name == expression);
});
UnitTests.DeclareTestCase(function () {
    UnitTests.ThrowError("sdgphjsdioghiosdnhiosd(0)");
});
UnitTests.DeclareTestCase(function () {
    UnitTests.AreEqual("3+-4", -1);
});
UnitTests.DeclareTestCase(function () {
    UnitTests.AreEqual("-2+3", 1);
});
UnitTests.DeclareTestCase(function () {
    UnitTests.ThrowError("1&3");
});
UnitTests.DeclareTestCase(function () {
    UnitTests.ThrowError("!(1)");
});
UnitTests.DeclareTestCase(function () {
    UnitTests.AreEqual("cossinlnraddeg(pi/2)", 0.9);
});
UnitTests.DeclareTestCase(function () {
    UnitTests.AreEqual("sincos(-2)", -0.4);
});
UnitTests.DeclareTestCase(function () {
    UnitTests.AreEqual("root(root(2;cossinlnraddeg(pi/2));log(pi;e))", 1.95);
});
UnitTests.DeclareTestCase(function () {
    UnitTests.AreEqual("sinh(10)", Math.sinh(10));
});
UnitTests.DeclareTestCase(function () {
    UnitTests.AreEqual("(e^10-e^(-10))/2", Math.sinh(10));
});
UnitTests.DeclareTestCase(function () {
    UnitTests.ThrowError("sinhh(10)");
});
var Geoma;
(function (Geoma) {
    var Tools;
    (function (Tools) {
        var makeMod = Geoma.Utils.makeMod;
        var assert = Geoma.Utils.assert;
        var MulticastEvent = Geoma.Utils.MulticastEvent;
        var CodeArgument = Geoma.Syntax.CodeArgument;
        var CodeArgumentX = Geoma.Syntax.CodeArgumentX;
        var CodeLiteral = Geoma.Syntax.CodeLiteral;
        var CodeBinary = Geoma.Syntax.CodeBinary;
        var CodeUnary = Geoma.Syntax.CodeUnary;
        var paramaterNames = "abcdfhgiklmnoprstu";
        var MenuButton = (function (_super) {
            __extends(MenuButton, _super);
            function MenuButton(document, x, y, text, textBrush, horizontal_padding, vertical_padding) {
                if (horizontal_padding === void 0) { horizontal_padding = 2; }
                if (vertical_padding === void 0) { vertical_padding = 10; }
                var _this = _super.call(this, document, x, y, text, horizontal_padding, vertical_padding, true) || this;
                if (textBrush) {
                    _this.foregroundBrush.reset(textBrush);
                }
                return _this;
            }
            MenuButton.prototype.onClick = function () {
                if (this.document.canShowMenu(this)) {
                    var menu = new Tools.Menu(this.document, this.middleX, this.bottom);
                    this.onShowMenu(menu);
                    menu.show();
                }
                return true;
            };
            return MenuButton;
        }(Tools.Button));
        var CodePresenter = (function (_super) {
            __extends(CodePresenter, _super);
            function CodePresenter(document) {
                return _super.call(this, document, new Geoma.Sprite.Container()) || this;
            }
            CodePresenter.hPadding = 5;
            CodePresenter.vPadding = 5;
            return CodePresenter;
        }(Tools.DocumentSprite));
        var CodeLabel = (function (_super) {
            __extends(CodeLabel, _super);
            function CodeLabel(document, x, y, text, horizontal_padding, vertical_padding) {
                if (horizontal_padding === void 0) { horizontal_padding = 10; }
                if (vertical_padding === void 0) { vertical_padding = 10; }
                var _this = _super.call(this, document, x, y, text, horizontal_padding, vertical_padding, true) || this;
                _this._labelSelected = false;
                return _this;
            }
            Object.defineProperty(CodeLabel.prototype, "selected", {
                get: function () {
                    return this._labelSelected || (this._pairedLabel != undefined && this._pairedLabel._labelSelected);
                },
                enumerable: false,
                configurable: true
            });
            CodeLabel.prototype.addPairedLabel = function (label) {
                this._pairedLabel = label;
            };
            CodeLabel.prototype.mouseMove = function (event) {
                this._labelSelected = this.mouseHit(event);
            };
            CodeLabel.prototype.onClick = function () {
                return false;
            };
            return CodeLabel;
        }(Tools.Button));
        var CodeArgumentPresenter = (function (_super) {
            __extends(CodeArgumentPresenter, _super);
            function CodeArgumentPresenter(document, x, y) {
                var _this = _super.call(this, document) || this;
                var ArgButton = (function (_super) {
                    __extends(ArgButton, _super);
                    function ArgButton(owner, x, y) {
                        var _this = _super.call(this, owner.document, x, y, function () { return owner.codeElement.text; }) || this;
                        _this._owner = owner;
                        return _this;
                    }
                    ArgButton.prototype.onShowMenu = function (menu) {
                        var _this = this;
                        var item = menu.addMenuItem("x");
                        item.onChecked.bind(this, function () { return _this._owner._codeElement = new CodeArgumentX(); });
                        item = menu.addMenuItem("123");
                        item.onChecked.bind(this, function () {
                            var number = _this.document.promptNumber("");
                            if (number != null) {
                                _this._owner._codeElement = new CodeLiteral(number);
                            }
                        });
                        var group = menu.addMenuGroup("abc");
                        var stripe;
                        var _loop_3 = function (i) {
                            if (i % 6 == 0) {
                                stripe = group.addMenuStrip();
                            }
                            var index = i;
                            var arg_name = paramaterNames.charAt(index);
                            var menu_item = stripe.addMenuItem(" " + arg_name + " ");
                            menu_item.onChecked.bind(this_1, function () { return _this._owner._codeElement = new CodeArgument(arg_name); });
                        };
                        var this_1 = this;
                        for (var i = 0; i < paramaterNames.length; i++) {
                            _loop_3(i);
                        }
                    };
                    return ArgButton;
                }(MenuButton));
                _this._codeElement = new CodeArgumentX();
                _this.item.push(new ArgButton(_this, x, y));
                return _this;
            }
            Object.defineProperty(CodeArgumentPresenter.prototype, "codeElement", {
                get: function () {
                    return this._codeElement;
                },
                set: function (value) {
                    this._codeElement = value;
                },
                enumerable: false,
                configurable: true
            });
            return CodeArgumentPresenter;
        }(CodePresenter));
        var CodeUnaryPresenter = (function (_super) {
            __extends(CodeUnaryPresenter, _super);
            function CodeUnaryPresenter(document, x, y, func) {
                if (func === void 0) { func = "sin"; }
                var _this = _super.call(this, document) || this;
                var UnaryButton = (function (_super) {
                    __extends(UnaryButton, _super);
                    function UnaryButton(owner, x, y) {
                        var _this = _super.call(this, owner.document, x, y, function () { return owner._function; }) || this;
                        _this._owner = owner;
                        return _this;
                    }
                    UnaryButton.prototype.onShowMenu = function (menu) {
                        var groups = {};
                        groups["Trig"] = ["sin", "cos", "tan", "arcsin", "arccos", "arctan"];
                        groups["Hyper"] = ["sinh", "cosh", "tanh", "arcsinh", "arccosh", "arctanh"];
                        groups["Log"] = ["ln", "log2", "log10"];
                        groups["Roots"] = ["√", "∛", "∜",];
                        groups["Int"] = ["round", "ceil", "floor"];
                        var misc = ["exp", "neg", "sign", "abs", "!", "f'"];
                        for (var group_name in groups) {
                            var group = menu.addMenuGroup(group_name);
                            for (var _i = 0, _a = groups[group_name]; _i < _a.length; _i++) {
                                var unary_function = _a[_i];
                                this.addMenu(group, unary_function);
                            }
                        }
                        for (var _b = 0, misc_1 = misc; _b < misc_1.length; _b++) {
                            var unary_function = misc_1[_b];
                            this.addMenu(menu, unary_function);
                        }
                    };
                    UnaryButton.prototype.addMenu = function (root, unary_function) {
                        var _this = this;
                        var name = new CodeUnary(unary_function, new CodeArgumentX()).text;
                        var menu = root.addMenuItem(name);
                        menu.onChecked.bind(this, function () { return _this._owner._function = unary_function; });
                        menu.addW(function (value) { return Math.max(20, value); });
                    };
                    return UnaryButton;
                }(MenuButton));
                var button = new UnaryButton(_this, x, y);
                var left_bracket = new CodeLabel(document, function () { return button.right; }, function () { return button.y; }, "(", 0);
                var placeholder = new CodePlaceholder(document, function () { return left_bracket.right; }, y, false);
                var right_bracket = new CodeLabel(document, function () { return placeholder.right; }, function () { return placeholder.y; }, ")", 0);
                left_bracket.addPairedLabel(right_bracket);
                right_bracket.addPairedLabel(left_bracket);
                _this._function = func;
                _this.item.push(button);
                _this.item.push(left_bracket);
                _this.item.push(placeholder);
                _this.item.push(right_bracket);
                return _this;
            }
            Object.defineProperty(CodeUnaryPresenter.prototype, "codeElement", {
                get: function () {
                    return new CodeUnary(this._function, this.placeholder.codeElement);
                },
                set: function (value) {
                    this._function = value.function;
                    this.placeholder.codeElement = value.operand;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(CodeUnaryPresenter.prototype, "placeholder", {
                get: function () {
                    assert(this.item.length == 4);
                    var placeholder = this.item.item(2);
                    assert(placeholder instanceof CodePlaceholder);
                    return placeholder;
                },
                enumerable: false,
                configurable: true
            });
            return CodeUnaryPresenter;
        }(CodePresenter));
        var CodeBinaryPresenter = (function (_super) {
            __extends(CodeBinaryPresenter, _super);
            function CodeBinaryPresenter(document, x, y) {
                var _this = _super.call(this, document) || this;
                var BinaryButton = (function (_super) {
                    __extends(BinaryButton, _super);
                    function BinaryButton(owner, x, y) {
                        var _this = _super.call(this, owner.document, x, y, function () { return " " + owner._function + " "; }) || this;
                        _this._owner = owner;
                        return _this;
                    }
                    BinaryButton.prototype.onShowMenu = function (menu) {
                        var _this = this;
                        var functions = ["pow", "n√", "+", "-", "*", "÷"];
                        var _loop_4 = function (binary_function) {
                            menu.addMenuItem(binary_function).onChecked.bind(this_2, function () { return _this._owner._function = binary_function; });
                        };
                        var this_2 = this;
                        for (var _i = 0, functions_1 = functions; _i < functions_1.length; _i++) {
                            var binary_function = functions_1[_i];
                            _loop_4(binary_function);
                        }
                    };
                    return BinaryButton;
                }(MenuButton));
                var left_bracket = new CodeLabel(document, x, y, "(", 0);
                var operand1 = new CodePlaceholder(document, function () { return left_bracket.right; }, y, false);
                var button = new BinaryButton(_this, function () { return operand1.right; }, function () { return operand1.y; });
                var operand2 = new CodePlaceholder(document, function () { return button.right; }, function () { return button.y; }, false);
                var right_bracket = new CodeLabel(document, function () { return operand2.right; }, function () { return operand2.y; }, ")", 0);
                left_bracket.addPairedLabel(right_bracket);
                right_bracket.addPairedLabel(left_bracket);
                _this._function = "+";
                _this.item.push(left_bracket);
                _this.item.push(operand1);
                _this.item.push(button);
                _this.item.push(operand2);
                _this.item.push(right_bracket);
                return _this;
            }
            Object.defineProperty(CodeBinaryPresenter.prototype, "codeElement", {
                get: function () {
                    assert(this.item.length == 5);
                    var operand1 = this.item.item(1);
                    var operand2 = this.item.item(3);
                    assert(operand1 instanceof CodePlaceholder);
                    assert(operand2 instanceof CodePlaceholder);
                    return new CodeBinary(operand1.codeElement, this._function, operand2.codeElement);
                },
                set: function (value) {
                    this._function = value.function;
                    this.placeholder1.codeElement = value.operand1;
                    this.placeholder2.codeElement = value.operand2;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(CodeBinaryPresenter.prototype, "placeholder1", {
                get: function () {
                    assert(this.item.length == 5);
                    var placeholder = this.item.item(1);
                    assert(placeholder instanceof CodePlaceholder);
                    return placeholder;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(CodeBinaryPresenter.prototype, "placeholder2", {
                get: function () {
                    assert(this.item.length == 5);
                    var placeholder = this.item.item(3);
                    assert(placeholder instanceof CodePlaceholder);
                    return placeholder;
                },
                enumerable: false,
                configurable: true
            });
            return CodeBinaryPresenter;
        }(CodePresenter));
        var CodePlaceholder = (function (_super) {
            __extends(CodePlaceholder, _super);
            function CodePlaceholder(document, x, y, symmetric) {
                var _this = _super.call(this, document) || this;
                var PlaceholderButton = (function (_super) {
                    __extends(PlaceholderButton, _super);
                    function PlaceholderButton(owner, x, y) {
                        var _this = _super.call(this, owner.document, x, y, "\u2193", "DarkGray", 1) || this;
                        _this._owner = owner;
                        return _this;
                    }
                    PlaceholderButton.prototype.onShowMenu = function (menu) {
                        var _this = this;
                        var x_mod = makeMod(this, function () { return _this.right; });
                        var y_mod = makeMod(this, function () { return _this.top; });
                        if (symmetric) {
                            var symmetric_func_1 = "\u00B1";
                            var item_1 = menu.addMenuItem(symmetric_func_1);
                            var presenter_1 = new CodeUnaryPresenter(document, x_mod, y_mod, symmetric_func_1);
                            item_1.onChecked.bind(this, function () {
                                if (_this._owner.codeElement instanceof CodeUnary && _this._owner.codeElement.function == symmetric_func_1) {
                                    if (_this._owner.codeElement.operand instanceof CodeArgument) {
                                        presenter_1 = new CodeArgumentPresenter(document, x_mod, y_mod);
                                        presenter_1.codeElement = _this._owner.codeElement.operand;
                                    }
                                    else if (_this._owner.codeElement.operand instanceof CodeUnary) {
                                        presenter_1 = new CodeUnaryPresenter(document, x_mod, y_mod);
                                        presenter_1.codeElement = _this._owner.codeElement.operand;
                                    }
                                    else {
                                        assert(_this._owner.codeElement.operand instanceof CodeBinary);
                                        presenter_1 = new CodeBinaryPresenter(document, x_mod, y_mod);
                                        presenter_1.codeElement = _this._owner.codeElement.operand;
                                    }
                                }
                                else {
                                    var expression = new CodeUnary(symmetric_func_1, _this._owner.codeElement);
                                    presenter_1.codeElement = expression;
                                }
                                _this._owner.setPresenter(presenter_1);
                            });
                        }
                        var item = menu.addMenuItem("{arg}");
                        item.onChecked.bind(this, function () { return _this._owner.setPresenter(new CodeArgumentPresenter(document, x_mod, y_mod)); });
                        item = menu.addMenuItem("f(u)");
                        item.onChecked.bind(this, function () { return _this._owner.setPresenter(new CodeUnaryPresenter(document, x_mod, y_mod)); });
                        item = menu.addMenuItem("f(u, v)");
                        item.onChecked.bind(this, function () { return _this._owner.setPresenter(new CodeBinaryPresenter(document, x_mod, y_mod)); });
                        item = menu.addMenuItem("\u03C8{ f() }");
                        item.onChecked.bind(this, function () {
                            var expression = new CodeUnary("sin", _this._owner.codeElement);
                            var presenter = new CodeUnaryPresenter(document, x_mod, y_mod);
                            presenter.codeElement = expression;
                            _this._owner.setPresenter(presenter);
                        });
                        item = menu.addMenuItem("\u03C8{ f(), v }");
                        item.onChecked.bind(this, function () {
                            var expression = new CodeBinary(_this._owner.codeElement, "+", new CodeArgumentX());
                            var presenter = new CodeBinaryPresenter(document, x_mod, y_mod);
                            presenter.codeElement = expression;
                            _this._owner.setPresenter(presenter);
                        });
                        item = menu.addMenuItem("\u03C8{ u, f() }");
                        item.onChecked.bind(this, function () {
                            var expression = new CodeBinary(new CodeArgumentX(), "+", _this._owner.codeElement);
                            var presenter = new CodeBinaryPresenter(document, x_mod, y_mod);
                            presenter.codeElement = expression;
                            _this._owner.setPresenter(presenter);
                        });
                    };
                    return PlaceholderButton;
                }(MenuButton));
                var button = new PlaceholderButton(_this, x, y);
                _this._codePresenter = new CodeArgumentPresenter(document, function () { return button.right; }, function () { return button.top; });
                _this.item.push(button);
                _this.item.push(_this._codePresenter);
                return _this;
            }
            Object.defineProperty(CodePlaceholder.prototype, "codeElement", {
                get: function () {
                    return this._codePresenter.codeElement;
                },
                set: function (value) {
                    var button = this.item.first;
                    var x_mod = function () { return button.right; };
                    var y_mod = function () { return button.top; };
                    if (value instanceof CodeArgumentX || value instanceof CodeArgument || value instanceof CodeLiteral) {
                        var presenter = new CodeArgumentPresenter(this.document, x_mod, y_mod);
                        presenter.codeElement = value;
                        this.setPresenter(presenter);
                    }
                    else if (value instanceof CodeUnary) {
                        var presenter = new CodeUnaryPresenter(this.document, x_mod, y_mod);
                        presenter.codeElement = value;
                        this.setPresenter(presenter);
                    }
                    else if (value instanceof CodeBinary) {
                        var presenter = new CodeBinaryPresenter(this.document, x_mod, y_mod);
                        presenter.codeElement = value;
                        this.setPresenter(presenter);
                    }
                    else {
                        assert(false);
                    }
                },
                enumerable: false,
                configurable: true
            });
            CodePlaceholder.prototype.setPresenter = function (presenter) {
                this.item.remove(this._codePresenter);
                this._codePresenter.dispose();
                this._codePresenter = presenter;
                this.item.push(this._codePresenter);
            };
            return CodePlaceholder;
        }(CodePresenter));
        var ExpressionDialog = (function (_super) {
            __extends(ExpressionDialog, _super);
            function ExpressionDialog(document, x, y, expression) {
                var _this = _super.call(this, document, new Geoma.Sprite.Container(), true) || this;
                _this._padding = 10;
                var OkButton = (function (_super) {
                    __extends(OkButton, _super);
                    function OkButton(editor, x, y) {
                        var _this = _super.call(this, editor.document, x, y, "OK", 5, 5, true) || this;
                        _this._editor = editor;
                        _this.addVisible(function () { return !editor._parseError; });
                        return _this;
                    }
                    OkButton.prototype.onClick = function () {
                        this._editor.emitOnEnter();
                        return false;
                    };
                    return OkButton;
                }(Tools.Button));
                var CancelButton = (function (_super) {
                    __extends(CancelButton, _super);
                    function CancelButton(editor, x, y) {
                        var _this = _super.call(this, editor.document, x, y, "Cancel", 5, 5, true) || this;
                        _this._editor = editor;
                        return _this;
                    }
                    CancelButton.prototype.onClick = function () {
                        this._editor.onEnter.emitEvent(new CustomEvent("ExpressionEditorEvent", { cancelable: false, detail: undefined }));
                        return false;
                    };
                    return CancelButton;
                }(Tools.Button));
                var EditButton = (function (_super) {
                    __extends(EditButton, _super);
                    function EditButton(editor, x, y) {
                        var _this = _super.call(this, editor.document, x, y, Tools.Resources.string("⌨⇆🖰"), 5, 5, true) || this;
                        _this._editor = editor;
                        return _this;
                    }
                    EditButton.prototype.onClick = function () {
                        this._editor._code.visible = !this._editor._code.visible;
                        if (!this._editor._code.visible) {
                            text_editor.text = this._editor._code.codeElement.text;
                        }
                        else {
                            delete this._editor._parseError;
                        }
                        return true;
                    };
                    return EditButton;
                }(Tools.Button));
                var background = new Geoma.Sprite.Rectangle(x, y, 1, 1, function () { return Tools.CurrentTheme.FormulaEditorBackgroundBrush; });
                var x_mod = makeMod(_this, function () { return background.x + _this._padding; });
                var y_mod = makeMod(_this, function () { return (text_editor.visible ? text_editor : visual_editor).bottom + _this._padding; });
                var text_editor = new Geoma.Sprite.TextInput(x_mod, makeMod(_this, function () { return background.y + _this._padding; }), makeMod(_this, function () { return background.w - 2 * _this._padding; }), 30, expression === null || expression === void 0 ? void 0 : expression.text, function () { return Tools.CurrentTheme.FormulaInputTextBrush; }, function () { return Tools.CurrentTheme.FormulaInputTextStyle; }, function () { return Tools.CurrentTheme.FormulaInputTextBackgroundBrush; });
                var visual_editor = new CodePlaceholder(document, x_mod, makeMod(_this, function () { return background.y + _this._padding; }), true);
                visual_editor.visible = false;
                text_editor.addVisible(function () { return !visual_editor.visible; });
                text_editor.onKeyPress.bind(_this, function (event) {
                    _this.parse(text_editor.text);
                    var enter_key_code = 13;
                    if (event.keyCode == enter_key_code) {
                        _this.emitOnEnter();
                    }
                    return true;
                });
                var plain_text = new Geoma.Sprite.Text(x_mod, y_mod, 0, 0, function () { return Tools.CurrentTheme.FormulaSampleTextBrush; }, function () { return Tools.CurrentTheme.FormulaSampleTextStyle; }, makeMod(_this, function () { var _a; return _this._code.visible ? _this._plainText : ((_a = _this._parseError) !== null && _a !== void 0 ? _a : _this._plainText); }));
                plain_text.addVisible(Geoma.Utils.makeMod(_this, function () { return document.latexEngine.disabled || !!_this._parseError; }));
                var latex = new Geoma.Sprite.LatexContainer(document.latexEngine, makeMod(_this, function () { return _this._latex; }), x_mod, y_mod, 1.2);
                latex.addVisible(function () { return !plain_text.visible; });
                y_mod = makeMod(_this, function () { return Math.max(plain_text.bottom, latex.bottom) + _this._padding; });
                var calc_x;
                var calc_width;
                var ok = new OkButton(_this, x_mod, y_mod);
                var cancel = new CancelButton(_this, makeMod(_this, function () { return ok.right + _this._padding; }), y_mod);
                var edit = new EditButton(_this, makeMod(_this, function () { return cancel.right + _this._padding; }), y_mod);
                var width_calculator = makeMod(_this, function () {
                    var w1 = (visual_editor.visible ? visual_editor.w : text_editor.textWidth) + 2 * _this._padding;
                    var w2 = plain_text.visible ? plain_text.w + 2 * _this._padding : 0;
                    var w3 = ok.w + cancel.w + edit.w + 4 * _this._padding;
                    var w4 = (plain_text.visible ? plain_text.w : latex.w) + 2 * _this._padding;
                    calc_width = Math.max(w1, w2, w3, w4);
                    return calc_width;
                });
                var x_calculator = function (value) {
                    if (!calc_width || !calc_x) {
                        calc_x = value;
                    }
                    else if ((calc_x + calc_width) > document.mouseArea.w) {
                        calc_x = (document.mouseArea.w - calc_width) / 2;
                    }
                    return Math.max(document.mouseArea.x, calc_x);
                };
                background.addX(x_calculator);
                background.addW(width_calculator);
                background.addH(makeMod(_this, function () { return edit.bottom - background.top + _this._padding; }));
                _this.onEnter = new MulticastEvent();
                _this._code = visual_editor;
                _this.item.push(background);
                _this.item.push(text_editor);
                _this.item.push(visual_editor);
                _this.item.push(plain_text);
                _this.item.push(latex);
                _this.item.push(ok);
                _this.item.push(cancel);
                _this.item.push(edit);
                if (expression) {
                    visual_editor.codeElement = expression;
                }
                _this._mouseDownBinder = document.mouseArea.onMouseDown.bind(_this, _this.mouseHandle);
                _this._mouseUpBinder = document.mouseArea.onMouseDown.bind(_this, _this.mouseHandle);
                return _this;
            }
            ExpressionDialog.prototype.dispose = function () {
                if (!this.disposed) {
                    this._mouseDownBinder.dispose();
                    this._mouseUpBinder.dispose();
                    _super.prototype.dispose.call(this);
                }
            };
            ExpressionDialog.prototype.mouseHandle = function (event) {
                event.cancelBubble = true;
            };
            ExpressionDialog.prototype.mouseMove = function (event) {
                this.mouseHandle(event);
                _super.prototype.mouseMove.call(this, event);
            };
            ExpressionDialog.prototype.parse = function (text_expression) {
                try {
                    this._argValues = new Map();
                    var operand = MathParser.Parse(text_expression);
                    var expression = this.expressionConverter(operand);
                    this._code.codeElement = expression;
                    delete this._parseError;
                    return true;
                }
                catch (error) {
                    this._parseError = Tools.Resources.string("Ошибка выражения: {0}", "" + error);
                    return false;
                }
            };
            ExpressionDialog.prototype.emitOnEnter = function () {
                var result = {
                    expression: this._code.codeElement,
                    argValues: this._argValues
                };
                this.onEnter.emitEvent(new CustomEvent("ExpressionEditorEvent", { cancelable: false, detail: result }));
            };
            Object.defineProperty(ExpressionDialog.prototype, "_plainText", {
                get: function () {
                    var text = this._code.codeElement.text;
                    if (text.length > 0 && text.charAt(0) == "(") {
                        return "y = " + text.substr(1, text.length - 2);
                    }
                    else {
                        return "y = " + text;
                    }
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(ExpressionDialog.prototype, "_latex", {
                get: function () {
                    try {
                        var latex_markup = "{\\color{" + Tools.CurrentTheme.FormulaSampleTextBrush + "} y=" +
                            MathParser.OperandToLatexFormula(MathParser.Parse(this._code.codeElement.math)) + "}";
                        return latex_markup;
                    }
                    catch (error) {
                        return "{\\color{red}" + error + "}";
                    }
                },
                enumerable: false,
                configurable: true
            });
            ExpressionDialog.prototype.expressionConverter = function (operand) {
                var expression = operand.Value;
                if (expression instanceof Parameter) {
                    if (expression.Name == "x") {
                        return new CodeArgumentX();
                    }
                    else {
                        var value = typeof expression.Value == "boolean" ? (expression.Value ? 1 : 0) : expression.Value;
                        assert(this._argValues);
                        this._argValues.set(expression.Name, value);
                        return new CodeArgument(expression.Name);
                    }
                }
                else if (expression instanceof UnaryOperation) {
                    var function_type = expression.Func.Type;
                    switch (function_type) {
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
                            throw new Error(Tools.Resources.string("Неподдерживаемый тип функции: {0}", function_type));
                    }
                }
                else if (expression instanceof BinaryOperation) {
                    var operator_type = expression.Operator.Value;
                    switch (operator_type) {
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
                            throw new Error(Tools.Resources.string("Неподдерживаемый тип оператора: {0}", operator_type));
                    }
                }
                else if (typeof expression == "number") {
                    return new CodeLiteral(expression);
                }
                else if (typeof expression == "boolean") {
                    return new CodeLiteral(expression ? 1 : 0);
                }
                else {
                    throw new Error(Tools.Resources.string("Неподдерживаемый тип операнда: {0}", expression.constructor.name));
                }
            };
            return ExpressionDialog;
        }(Tools.DocumentSprite));
        Tools.ExpressionDialog = ExpressionDialog;
    })(Tools = Geoma.Tools || (Geoma.Tools = {}));
})(Geoma || (Geoma = {}));
var Geoma;
(function (Geoma) {
    var Tools;
    (function (Tools) {
        var makeMod = Geoma.Utils.makeMod;
        var ArgumentHandleButton = (function (_super) {
            __extends(ArgumentHandleButton, _super);
            function ArgumentHandleButton(document, x, arg_name, value) {
                var _this = _super.call(this, document, x, 0, arg_name) || this;
                _this.bottomArgIndex = -1;
                _this._value = value;
                _this.item.name = arg_name;
                _this.addX(makeMod(_this, _this.calcX));
                _this.addY(makeMod(_this, _this.calcY));
                _this.addText(makeMod(_this, function (value) { return value + (" = " + _this._value); }));
                return _this;
            }
            Object.defineProperty(ArgumentHandleButton.prototype, "value", {
                get: function () {
                    return this._value;
                },
                set: function (value) {
                    var _this = this;
                    var transaction_name = Tools.Resources.string("Установить {0} = {1}", this.name, "" + value);
                    Tools.UndoTransaction.Do(this, transaction_name, function () {
                        _this._value = value;
                        for (var i = 0; i < _this.document.parametrics.length; i++) {
                            var line = _this.document.parametrics.item(i);
                            Geoma.Utils.assert(line instanceof Tools.ParametricLine);
                            if (line.hasArg(_this.name)) {
                                line.setModified();
                            }
                        }
                    });
                },
                enumerable: false,
                configurable: true
            });
            ArgumentHandleButton.prototype.serialize = function (__context) {
                var data = [];
                data.push("" + this.name);
                data.push("v");
                data.push("" + this._value);
                return data;
            };
            ArgumentHandleButton.deserialize = function (context, data, index) {
                if (data.length < (index + 3)) {
                    return null;
                }
                else {
                    var name_2 = data[index++];
                    switch (data[index++]) {
                        case "v":
                            var value = parseFloat(data[index++]);
                            return new ArgumentHandleButton(context.document, 0, name_2, value);
                        default:
                            return null;
                    }
                }
            };
            Object.defineProperty(ArgumentHandleButton.prototype, "isAddornersSelected", {
                get: function () {
                    return this._adorners !== undefined && this._adorners.mouseHit(this.document.mouseArea.mousePoint);
                },
                enumerable: false,
                configurable: true
            });
            ArgumentHandleButton.prototype.onClick = function () {
                if (!this.isAddornersSelected) {
                    var result = this.document.promptNumber("Значение", this._value);
                    if (result !== null) {
                        this.value = result;
                    }
                }
                return false;
            };
            ArgumentHandleButton.prototype.mouseMove = function (event) {
                _super.prototype.mouseMove.call(this, event);
                if (this.selected) {
                    if (!this._adorners) {
                        Geoma.Utils.assert(this.item.last);
                        var adorner_1 = (function (_super) {
                            __extends(adorner, _super);
                            function adorner(owner, x, text, direction) {
                                var _this = _super.call(this, owner.document, x, owner.y, text) || this;
                                _this._lastTicks = 0;
                                _this._accelerator = adorner._defaultAcceleration;
                                _this._direction = 0;
                                _this._direction = direction;
                                _this._owner = owner;
                                return _this;
                            }
                            adorner.prototype.dispose = function () {
                                if (this._transaction) {
                                    this._transaction.rollback();
                                    delete this._transaction;
                                }
                                _super.prototype.dispose.call(this);
                            };
                            adorner.prototype.calcDeltaValue = function () {
                                var value = this._owner._value;
                                if (Math.abs(value) < adorner._deltaValueThreshold) {
                                    return this._direction * 2 * adorner._deltaValueThreshold;
                                }
                                else {
                                    var value_magnitude = Geoma.Utils.toInt(Math.log10(Math.abs(value)));
                                    var delta_value = (Math.pow(10, (value_magnitude - 1))) * this._direction;
                                    return delta_value;
                                }
                            };
                            adorner.prototype.onClick = function () {
                                var delta_value = this.calcDeltaValue();
                                this._owner.value += delta_value;
                                if (this._transaction) {
                                    this._transaction.commit();
                                    delete this._transaction;
                                }
                                delete this._startTicks;
                                return true;
                            };
                            adorner.prototype.innerDraw = function (play_ground) {
                                _super.prototype.innerDraw.call(this, play_ground);
                                if (this._owner.isPressed && this.mouseHit(play_ground.mousePoint)) {
                                    if (this._startTicks === undefined) {
                                        var transaction_name = Tools.Resources.string("Установить {0} = {1}", this.name, "++");
                                        this._transaction = this.document.beginUndo(transaction_name);
                                        this._accelerator = adorner._defaultAcceleration;
                                        this._startTicks = Tools.Document.ticks;
                                        this._lastTicks = Tools.Document.ticks;
                                    }
                                    var dt = Tools.Document.ticks - this._startTicks;
                                    if (dt >= Tools.CurrentTheme.TapDelayTime) {
                                        if (dt >= Tools.CurrentTheme.TapActivateTime) {
                                            var velocity = adorner._defaultVelocity / Math.max(1, Geoma.Utils.toInt(this._accelerator));
                                            if ((Tools.Document.ticks - this._lastTicks) >= velocity) {
                                                this._lastTicks = Tools.Document.ticks;
                                                this._owner.value += this.calcDeltaValue();
                                            }
                                            this._accelerator += adorner._defaultAcceleration;
                                        }
                                    }
                                }
                            };
                            adorner._deltaValueThreshold = 0.001;
                            adorner._defaultVelocity = 1000;
                            adorner._defaultAcceleration = 0.3;
                            return adorner;
                        }(Tools.Button));
                        this._adorners = new Tools.Container();
                        var dec_adorner_1 = new adorner_1(this, this.right, "-", -1);
                        var inc_adorner = new adorner_1(this, function () { return dec_adorner_1.right; }, "+", 1);
                        this._adorners.push(inc_adorner);
                        this._adorners.push(dec_adorner_1);
                        this.item.push(this._adorners);
                    }
                }
                else if (this._adorners) {
                    this.item.remove(this._adorners);
                    this._adorners.dispose();
                    delete this._adorners;
                }
            };
            ArgumentHandleButton.prototype.calcX = function (value) {
                return value + Tools.CurrentTheme.PropertyLeftMargin + this.document.mouseArea.offset.x;
            };
            ArgumentHandleButton.prototype.calcY = function () {
                if (this.bottomArgIndex == -1) {
                    return this.document.toolsBottom + this.document.mouseArea.offset.y;
                }
                else {
                    return this.document.args.item(this.bottomArgIndex).bottom + Tools.CurrentTheme.PropertyVerticalPadding;
                }
            };
            return ArgumentHandleButton;
        }(Tools.Button));
        Tools.ArgumentHandleButton = ArgumentHandleButton;
    })(Tools = Geoma.Tools || (Geoma.Tools = {}));
})(Geoma || (Geoma = {}));
var Geoma;
(function (Geoma) {
    var Tools;
    (function (Tools) {
        var toFixed = Geoma.Utils.toFixed;
        var toDeg = Geoma.Utils.toDeg;
        var Properties = (function (_super) {
            __extends(Properties, _super);
            function Properties(document, x, y) {
                var _this = _super.call(this) || this;
                _this.push(new Geoma.Sprite.MultiLineText(x, y, 2));
                _this._document = document;
                return _this;
            }
            Properties.prototype.innerDraw = function (play_ground) {
                var text = this.first;
                var points = new Array();
                var segments = new Array();
                var lines = new Array();
                var angles = new Array();
                var circles = new Array();
                var parametric_lines = new Array();
                var empty_line = { brush: Tools.CurrentTheme.PropertyTextBrush, style: Tools.CurrentTheme.PropertyTextStyle, text: "" };
                for (var i = 0; i < this._document.points.length; ++i) {
                    var point = this._document.points.item(i);
                    points.push(point);
                }
                for (var i = 0; i < this._document.lines.length; ++i) {
                    var line = this._document.lines.item(i);
                    if (line instanceof Tools.ActiveLineSegment) {
                        segments.push(line);
                    }
                    else {
                        lines.push(line);
                    }
                }
                for (var i = 0; i < this._document.angles.length; ++i) {
                    angles.push(this._document.angles.item(i));
                }
                for (var i = 0; i < this._document.circles.length; ++i) {
                    circles.push(this._document.circles.item(i));
                }
                for (var i = 0; i < this._document.parametrics.length; ++i) {
                    parametric_lines.push(this._document.parametrics.item(i));
                }
                points.sort(this._nameCollator);
                segments.sort(this._nameCollator);
                lines.sort(this._nameCollator);
                angles.sort(this._nameCollator);
                circles.sort(this._nameCollator);
                parametric_lines.sort(this._nameCollator);
                text.textLines.splice(0);
                for (var _i = 0, points_3 = points; _i < points_3.length; _i++) {
                    var point = points_3[_i];
                    text.textLines.push({
                        brush: this._getBrush(point),
                        style: Tools.CurrentTheme.PropertyTextStyle,
                        text: Tools.Resources.string("Точка({0}: x={1}; y={2})", point.name, this._toFixed(point.x), this._toFixed(point.y))
                    });
                }
                if (points.length) {
                    text.textLines.push(empty_line);
                }
                for (var _a = 0, segments_1 = segments; _a < segments_1.length; _a++) {
                    var segment = segments_1[_a];
                    text.textLines.push({
                        brush: this._getBrush(segment),
                        style: Tools.CurrentTheme.PropertyTextStyle,
                        text: Tools.Resources.string("Отрезок({0}: l={1}; α={2}°)", segment.name, this._toFixed(segment.length), this._getAngle(segment))
                    });
                }
                if (segments.length) {
                    text.textLines.push(empty_line);
                }
                for (var _b = 0, lines_1 = lines; _b < lines_1.length; _b++) {
                    var line = lines_1[_b];
                    text.textLines.push({
                        brush: this._getBrush(line),
                        style: Tools.CurrentTheme.PropertyTextStyle,
                        text: Tools.Resources.string("Линия({0}: α={1}°)", line.name, this._getAngle(line))
                    });
                }
                if (lines.length) {
                    text.textLines.push(empty_line);
                }
                for (var _c = 0, circles_1 = circles; _c < circles_1.length; _c++) {
                    var circle = circles_1[_c];
                    text.textLines.push({
                        brush: this._getBrush(circle),
                        style: Tools.CurrentTheme.PropertyTextStyle,
                        text: Tools.Resources.string("Окружность({0}: Ø={1})", circle.name, this._toFixed(circle.radius * 2))
                    });
                }
                if (circles.length) {
                    text.textLines.push(empty_line);
                }
                for (var _d = 0, parametric_lines_1 = parametric_lines; _d < parametric_lines_1.length; _d++) {
                    var parametric_line = parametric_lines_1[_d];
                    text.textLines.push({
                        brush: this._getBrush(parametric_line),
                        style: Tools.CurrentTheme.PropertyTextStyle,
                        text: Tools.Resources.string("Функция(f={0})", parametric_line.code.text)
                    });
                }
                if (parametric_lines.length) {
                    text.textLines.push(empty_line);
                }
                for (var _e = 0, angles_1 = angles; _e < angles_1.length; _e++) {
                    var angle = angles_1[_e];
                    text.textLines.push({
                        brush: this._getBrush(angle),
                        style: Tools.CurrentTheme.PropertyTextStyle,
                        text: Tools.Resources.string("Угол({0}: {1}={2}°)", angle.realName, angle.realName != angle.name ? angle.name : "α", this._toFixed(toDeg(angle.angle)))
                    });
                }
                _super.prototype.innerDraw.call(this, play_ground);
            };
            Properties.prototype._toFixed = function (value) {
                return toFixed(value, Tools.CurrentTheme.CoordinatesPrecision);
            };
            Properties.prototype._getAngle = function (line) {
                return toFixed(toDeg((Math.PI - line.angle) % Math.PI), Tools.CurrentTheme.CoordinatesPrecision);
            };
            Properties.prototype._getBrush = function (sprite) {
                return sprite.selected ? Tools.CurrentTheme.PropertySelectedTextBrush : Tools.CurrentTheme.PropertyTextBrush;
            };
            Properties.prototype._nameCollator = function (s1, s2) {
                return s1.name.localeCompare(s2.name, undefined, Properties._nameCollatorOptions);
            };
            Properties._nameCollatorOptions = {
                numeric: true,
                ignorePunctuation: true
            };
            return Properties;
        }(Tools.Container));
        Tools.Properties = Properties;
    })(Tools = Geoma.Tools || (Geoma.Tools = {}));
})(Geoma || (Geoma = {}));
var Geoma;
(function (Geoma) {
    var Tools;
    (function (Tools) {
        var makeMod = Geoma.Utils.makeMod;
        var toInt = Geoma.Utils.toInt;
        var Point = Geoma.Utils.Point;
        var assert = Geoma.Utils.assert;
        var MulticastEvent = Geoma.Utils.MulticastEvent;
        var DocumentData = (function () {
            function DocumentData() {
                this.points = new Tools.Container();
                this.lines = new Tools.Container();
                this.angles = new Tools.Container();
                this.circles = new Tools.Container();
                this.parametric = new Tools.Container();
                this.axes = new Tools.Container();
                this.args = new Tools.Container();
            }
            DocumentData.prototype.dispose = function (container) {
                this.points.dispose();
                this.lines.dispose();
                this.angles.dispose();
                this.circles.dispose();
                this.parametric.dispose();
                this.axes.dispose();
                this.args.dispose();
                if (container) {
                    container.remove(this.parametric);
                    container.remove(this.axes);
                    container.remove(this.circles);
                    container.remove(this.lines);
                    container.remove(this.angles);
                    container.remove(this.points);
                    container.remove(this.args);
                }
            };
            DocumentData.prototype.initialize = function (container) {
                container.push(this.parametric);
                container.push(this.axes);
                container.push(this.circles);
                container.push(this.lines);
                container.push(this.angles);
                container.push(this.points);
                container.push(this.args);
            };
            return DocumentData;
        }());
        var UndoTransaction = (function () {
            function UndoTransaction(document, name, snapshot, offset) {
                this.document = document;
                this.name = name;
                this.startSnapshot = snapshot;
                this.mouseAreaOffset = offset;
            }
            UndoTransaction.Do = function (sprite, name, processor) {
                var transaction = sprite.document.beginUndo(name);
                try {
                    var result = processor.bind(sprite)();
                    transaction.commit();
                    return result;
                }
                catch (error) {
                    transaction.rollback();
                    throw error;
                }
            };
            return UndoTransaction;
        }());
        Tools.UndoTransaction = UndoTransaction;
        var Document = (function (_super) {
            __extends(Document, _super);
            function Document(mouse_area) {
                var _this = _super.call(this) || this;
                _this._latexEngine = new Geoma.Latex.LatexEngine();
                _this._selectedSprites = new Array();
                _this._undoStack = new Array();
                _this._preventShowMenu = false;
                _this._currentUndoPosition = 0;
                Geoma.Utils.InitializeCalcRevision();
                _this._mouseArea = mouse_area;
                _this._tools = new Geoma.Sprite.Container();
                _this._data = new DocumentData();
                _this._groupNo = 0;
                _this._background = new Tools.Background(_this);
                _this._data.initialize(_this);
                var tap_tool = new Tools.TapTool(_this, function () { return Tools.CurrentTheme.TapDelayTime; }, function () { return Tools.CurrentTheme.TapActivateTime; }, function () { return Tools.CurrentTheme.TapLineWidth; }, function () { return Tools.CurrentTheme.TapRadius; }, function () { return Tools.CurrentTheme.TapBrush; });
                tap_tool.onActivate.bind(_this, _this.onTap);
                _this.push(tap_tool);
                var tool_radius = 20;
                var tool_line_width = 5;
                var tool_y = 40;
                var tool_padding = 10;
                var point_tool = new Tools.PointTool(_this, 40, tool_y, tool_radius, tool_line_width);
                _this._tools.push(point_tool);
                var file_tool = new Tools.FileTool(_this, 0, tool_y, tool_radius, tool_line_width);
                _this._tools.push(file_tool);
                var undo_tool = new Tools.UndoTool(_this, 0, tool_y, tool_radius, tool_line_width);
                _this._tools.push(undo_tool);
                var redo_tool = new Tools.RedoTool(_this, 0, tool_y, tool_radius, tool_line_width);
                _this._tools.push(redo_tool);
                var settings_tool = new Tools.SettingsTool(_this, 0, tool_y, tool_radius, tool_line_width);
                _this._tools.push(settings_tool);
                var max_w = function () { return Math.max(point_tool.w, file_tool.w, undo_tool.w, redo_tool.w) + tool_padding; };
                file_tool.addX(function (value) { return value + point_tool.x + max_w() * 1; });
                undo_tool.addX(function (value) { return value + point_tool.x + max_w() * 2; });
                redo_tool.addX(function (value) { return value + point_tool.x + max_w() * 3; });
                settings_tool.addX(function (value) { return value + point_tool.x + max_w() * 4; });
                var doc_name = new Geoma.Sprite.Text(0, tool_y, 0, 0, function () { return Tools.CurrentTheme.MenuItemTextBrush; }, function () { return Tools.CurrentTheme.MenuItemTextStyle; }, makeMod(_this, function () { return _this.name; }));
                doc_name.addX(makeMod(_this, function () { return Math.max(_this.mouseArea.x + _this.mouseArea.offset.x + _this.mouseArea.w - doc_name.w - tool_padding, settings_tool.right + tool_padding); }));
                _this._tools.push(doc_name);
                var tools_separator = new Geoma.Sprite.Polyline(0, _this.toolsBottom, 1, function () { return Tools.CurrentTheme.ToolSeparatorBrush; });
                tools_separator.addPolygon(new Geoma.Polygon.Line(Point.make(0, 0), Point.make(8000, 0)));
                _this._tools.push(tools_separator);
                _this._mouseClickBinder = mouse_area.onMouseClick.bind(_this, _this.mouseClick, true);
                var save_data = document.location.hash;
                if (save_data != null && save_data.length && save_data[0] == "#") {
                    var data = decodeURI(save_data.substring(1));
                    _this.open(data);
                }
                return _this;
            }
            Object.defineProperty(Document.prototype, "toolsBottom", {
                get: function () {
                    return this._tools.bottom + 10;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(Document.prototype, "mouseArea", {
                get: function () {
                    return this._mouseArea;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(Document.prototype, "points", {
                get: function () {
                    return this._data.points;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(Document.prototype, "lines", {
                get: function () {
                    return this._data.lines;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(Document.prototype, "angles", {
                get: function () {
                    return this._data.angles;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(Document.prototype, "args", {
                get: function () {
                    return this._data.args;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(Document.prototype, "circles", {
                get: function () {
                    return this._data.circles;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(Document.prototype, "parametrics", {
                get: function () {
                    return this._data.parametric;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(Document.prototype, "onBeforeDraw", {
                get: function () {
                    if (!this._onBeforeDraw) {
                        this._onBeforeDraw = new MulticastEvent();
                    }
                    return this._onBeforeDraw;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(Document.prototype, "selectedSprites", {
                get: function () {
                    return this._selectedSprites;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(Document.prototype, "latexEngine", {
                get: function () {
                    return this._latexEngine;
                },
                enumerable: false,
                configurable: true
            });
            Document.prototype.alert = function (message) {
                window.alert(message);
            };
            Document.prototype.addToolTip = function (message) {
                var _this = this;
                if (this._tooltip) {
                    this._tooltip.dispose();
                    delete this._tooltip;
                }
                this._tooltip = new Tools.Tooltip(function () { return _this._mouseArea.mousePoint.x; }, function () { return _this._mouseArea.mousePoint.y; }, message);
            };
            Document.prototype.canShowMenu = function (sprite) {
                return sprite.visible && !this._contextMenu && !this._state && this._selectedSprites.indexOf(sprite) != -1 && !this._preventShowMenu;
            };
            Document.prototype.showMenu = function (menu) {
                this._contextMenu = menu;
            };
            Document.prototype.closeMenu = function (menu) {
                if (this._contextMenu == menu) {
                    this._contextMenu.dispose();
                    delete this._contextMenu;
                }
            };
            Document.prototype.dispose = function () {
                if (!this.disposed) {
                    this._mouseClickBinder.dispose();
                    _super.prototype.dispose.call(this);
                }
            };
            Document.prototype.getGroup = function (point) {
                var ret = new Array(point);
                if (point instanceof Tools.ActiveCommonPoint) {
                    var group_no = point.groupNo;
                    for (var i = 0; i < this._data.points.length; i++) {
                        var p = this._data.points.item(i);
                        if (p != point && p instanceof Tools.ActiveCommonPoint && p.groupNo == group_no) {
                            ret.push(p);
                        }
                    }
                }
                return ret;
            };
            Document.prototype.getPoint = function (point) {
                for (var i = 0; i < this._data.points.length; i++) {
                    if (this._data.points.item(i).mouseHit(point)) {
                        return this._data.points.item(i);
                    }
                }
                return null;
            };
            Document.prototype.getLineSegment = function (p1, p2) {
                return this.getLine([Tools.ActiveLineSegment], p1, p2);
            };
            Document.prototype.getActiveLine = function (p1, p2) {
                return this.getLine([Tools.ActiveLine], p1, p2);
            };
            Document.prototype.getLine = function (lineCtors, p1, p2) {
                if (!p2) {
                    for (var i = 0; i < this._data.lines.length; i++) {
                        var line = this._data.lines.item(i);
                        if (line.mouseHit(p1) && Geoma.Utils.isInstanceOfAny(lineCtors, line)) {
                            return line;
                        }
                    }
                    for (var i = 0; i < this._data.angles.length; i++) {
                        var bisector = this._data.angles.item(i).bisector;
                        if ((bisector === null || bisector === void 0 ? void 0 : bisector.mouseHit(p1)) && Geoma.Utils.isInstanceOfAny(lineCtors, bisector)) {
                            return bisector;
                        }
                    }
                }
                else {
                    for (var i = 0; i < this._data.lines.length; i++) {
                        var line = this._data.lines.item(i);
                        if (line.isPivot(p1) && line.isPivot(p2) && Geoma.Utils.isInstanceOfAny(lineCtors, line)) {
                            return line;
                        }
                    }
                    for (var i = 0; i < this._data.angles.length; i++) {
                        var bisector = this._data.angles.item(i).bisector;
                        if ((bisector === null || bisector === void 0 ? void 0 : bisector.mouseHit(p1)) && Geoma.Utils.isInstanceOfAny(lineCtors, bisector)) {
                            return bisector;
                        }
                    }
                }
                return null;
            };
            Document.prototype.removeAngle = function (angle, force) {
                if (force === void 0) { force = false; }
                if (!angle.disposed) {
                    var transaction = this.beginUndo(Tools.Resources.string("Удалить индикатор угла {0}", angle.name));
                    try {
                        if (angle.bisector && !force) {
                            angle.enabled = false;
                        }
                        else if (!angle.disposed) {
                            this._data.angles.remove(angle);
                            angle.dispose();
                        }
                        transaction.commit();
                    }
                    catch (error) {
                        transaction.rollback();
                        throw error;
                    }
                }
            };
            Document.prototype.getEngleIndicatorOrder = function (indicator) {
                var ret = 0;
                for (var i = 0; i < this._data.angles.length; i++) {
                    var sibling_indicator = this._data.angles.item(i);
                    if (sibling_indicator == indicator) {
                        break;
                    }
                    else if (indicator.commonPivot == sibling_indicator.commonPivot) {
                        ret++;
                    }
                }
                return ret;
            };
            Document.prototype.getAngleIndicators = function (point) {
                var ret = [];
                for (var i = 0; i < this._data.angles.length; i++) {
                    var indicator = this._data.angles.item(i);
                    if (indicator.commonPivot == point) {
                        ret.push(indicator);
                    }
                }
                return ret;
            };
            Document.prototype.getArgModifier = function (arg_name, parametric_line) {
                var point_prop = this._tryGetPointProperty(arg_name, parametric_line);
                if (point_prop) {
                    return point_prop;
                }
                else {
                    var _loop_5 = function (i) {
                        if (this_3._data.args.item(i).name == arg_name) {
                            var handle_1 = this_3._data.args.item(i);
                            return { value: function () { return handle_1.value; } };
                        }
                    };
                    var this_3 = this;
                    for (var i = 0; i < this._data.args.length; i++) {
                        var state_1 = _loop_5(i);
                        if (typeof state_1 === "object")
                            return state_1.value;
                    }
                    return null;
                }
            };
            Document.prototype.removePoint = function (point) {
                if (!point.disposed) {
                    var transaction = this.beginUndo(Tools.Resources.string("Удаление точки {0}", point.name));
                    try {
                        point.dispose();
                        this._data.points.remove(point);
                        for (var i = 0; i < this._data.lines.length; i++) {
                            var line = this._data.lines.item(i);
                            if (line.isPivot(point)) {
                                if (line instanceof Tools.ActiveLineSegment || line instanceof Tools.ActiveLine) {
                                    this.removeLine(line);
                                }
                                else {
                                    assert(false, "TODO");
                                }
                                i--;
                            }
                        }
                        for (var i = 0; i < this._data.circles.length; i++) {
                            var circle = this._data.circles.item(i);
                            if (circle.isPivot(point)) {
                                this.removeCircleLine(circle);
                                i--;
                            }
                        }
                        for (var i = 0; i < this._data.angles.length; i++) {
                            var angle = this._data.angles.item(i);
                            if (angle.isRelated(point)) {
                                this.removeAngle(angle, true);
                                i--;
                            }
                        }
                        for (var i = 0; i < this._data.parametric.length; i++) {
                            var parametric = this._data.parametric.item(i);
                            if (parametric.isRelated(point)) {
                                parametric.removePoint(point);
                            }
                        }
                        transaction.commit();
                    }
                    catch (error) {
                        transaction.rollback();
                        throw error;
                    }
                }
            };
            Document.prototype.removeLine = function (line) {
                if (!line.disposed) {
                    var undo_message = line instanceof Tools.ActiveLineSegment ?
                        Tools.Resources.string("Удаление сегмента {0}", line.name) :
                        Tools.Resources.string("Удаление линии {0}", line.name);
                    var transaction = this.beginUndo(undo_message);
                    try {
                        assert(line.startPoint instanceof Tools.ActivePoint);
                        assert(line.endPoint instanceof Tools.ActivePoint);
                        this._data.lines.remove(line);
                        line.dispose();
                        if (this.canRemovePoint(line.startPoint)) {
                            this.removePoint(line.startPoint);
                        }
                        if (this.canRemovePoint(line.endPoint)) {
                            this.removePoint(line.endPoint);
                        }
                        for (var i = 0; i < this._data.angles.length; i++) {
                            var angle = this._data.angles.item(i);
                            if (angle.isRelated(line)) {
                                this.removeAngle(angle, true);
                                i--;
                            }
                        }
                        transaction.commit();
                    }
                    catch (error) {
                        transaction.rollback();
                        throw error;
                    }
                }
            };
            Document.prototype.removeCircleLine = function (circle) {
                if (!circle.disposed) {
                    var transaction = this.beginUndo(Tools.Resources.string("Удалить окружность {0}", circle.name));
                    try {
                        this._data.circles.remove(circle);
                        circle.dispose();
                        if (this.canRemovePoint(circle.point1)) {
                            this.removePoint(circle.point1);
                        }
                        if (this.canRemovePoint(circle.point2)) {
                            this.removePoint(circle.point2);
                        }
                        transaction.commit();
                    }
                    catch (error) {
                        transaction.rollback();
                        throw error;
                    }
                }
            };
            Document.prototype.removeAxes = function (axes) {
                for (var i = 0; !axes.disposed && i < this._data.parametric.length; i++) {
                    var line = this._data.parametric.item(i);
                    if (line.axes == axes) {
                        this.removeParametricLine(line);
                        i--;
                    }
                }
            };
            Document.prototype.removeParametricLine = function (parametric_line) {
                var _this = this;
                if (!parametric_line.disposed) {
                    var transaction = this.beginUndo(Tools.Resources.string("Удалить график {0}", parametric_line.code.text));
                    try {
                        var current_parametric_args = new Set();
                        parametric_line.code.visitArguments(Document._makeVisitor(current_parametric_args));
                        this._data.parametric.remove(parametric_line);
                        parametric_line.dispose();
                        var axes = parametric_line.axes;
                        if (axes.lines.length == 0) {
                            this._data.axes.remove(axes);
                            axes.dispose();
                        }
                        var used_args_1 = new Set();
                        for (var i = 0; i < this._data.parametric.length; i++) {
                            this._data.parametric.item(i).code.visitArguments(Document._makeVisitor(used_args_1));
                        }
                        current_parametric_args.forEach(function (arg_name) {
                            if (!used_args_1.has(arg_name)) {
                                _this._removeArgHandle(arg_name);
                            }
                        });
                        transaction.commit();
                    }
                    catch (error) {
                        transaction.rollback();
                        throw error;
                    }
                }
            };
            Document.prototype.setLineSegmentState = function (point) {
                this.addToolTip(Tools.Resources.string("Выберите вторую точку"));
                this._state = { action: "line segment", activeItem: point, pitchPoint: point };
            };
            Document.prototype.setAngleIndicatorState = function (segment, pitch_point) {
                var _this = this;
                this._tooltip = new Tools.Tooltip(function () { return _this._mouseArea.mousePoint.x; }, function () { return _this._mouseArea.mousePoint.y; }, Tools.Resources.string("Выберите вторую прямую"));
                this._state = { action: "angle indicator", activeItem: segment, pitchPoint: pitch_point };
            };
            Document.prototype.setBisectorState = function (segment, pitch_point) {
                var _this = this;
                this._tooltip = new Tools.Tooltip(function () { return _this._mouseArea.mousePoint.x; }, function () { return _this._mouseArea.mousePoint.y; }, Tools.Resources.string("Выберите вторую прямую"));
                this._state = { action: "bisector", activeItem: segment, pitchPoint: pitch_point };
            };
            Document.prototype.setParallelLineState = function (segment) {
                this.addToolTip(Tools.Resources.string("Выберите || прямую"));
                this._state = { action: "parallel", activeItem: segment };
            };
            Document.prototype.setPerpendicularLineState = function (segment) {
                this.addToolTip(Tools.Resources.string("Выберите ⟂ прямую"));
                this._state = { action: "perpendicular", activeItem: segment };
            };
            Document.prototype.setCirclRadiusState = function (point) {
                this.addToolTip(Tools.Resources.string("Выберите вторую точку"));
                this._state = { action: "circle radius", activeItem: point, pitchPoint: point };
            };
            Document.prototype.setCirclDiameterState = function (point) {
                this.addToolTip(Tools.Resources.string("Выберите вторую точку"));
                this._state = { action: "circle diameter", activeItem: point, pitchPoint: point };
            };
            Document.prototype.setLineState = function (point) {
                this.addToolTip(Tools.Resources.string("Выберите вторую точку"));
                this._state = { action: "line", activeItem: point, pitchPoint: point };
            };
            Document.prototype.addParametricLine = function (point, axes) {
                var _this = this;
                var dialog = new Tools.ExpressionDialog(this, makeMod(this, function () { return _this.mouseArea.offset.x + (_this.mouseArea.w / 2 - _this.mouseArea.w / 10) / _this.mouseArea.ratio; }), makeMod(this, function () { return _this.mouseArea.offset.y + (_this.mouseArea.h / 2 - _this.mouseArea.h / 10) / _this.mouseArea.ratio; }));
                dialog.onEnter.bind(this, function (event) {
                    if (event.detail) {
                        var transaction = _this.beginUndo("Добавление функции");
                        try {
                            var new_axes = !axes;
                            axes = axes !== null && axes !== void 0 ? axes : new Tools.AxesLines(_this, _this._data.axes.length, point.x, point.y, 0.02, 0.02, function () { return Tools.CurrentTheme.AxesWidth; }, function () { return Tools.CurrentTheme.AxesBrush; }, function () { return Tools.CurrentTheme.AxesSelectBrush; });
                            var line = new Tools.ParametricLine(_this, function () { return Tools.CurrentTheme.ParametricLineWidth; }, function () { return Tools.CurrentTheme.ParametricLineBrush; }, function () { return Tools.CurrentTheme.ParametricLineSelectBrush; }, axes);
                            line.code = event.detail.expression;
                            if (new_axes) {
                                _this._data.axes.push(axes);
                            }
                            _this.realizeGraphArguments(line, event.detail.argValues);
                            _this._data.parametric.push(line);
                            transaction.commit();
                        }
                        catch (error) {
                            transaction.rollback();
                            throw error;
                        }
                    }
                    _this.remove(dialog);
                    dialog.dispose();
                });
                this.push(dialog);
            };
            Document.prototype.addPoint = function (point) {
                var lines = new Array();
                for (var i = 0; i < this._data.lines.length; i++) {
                    var line = this._data.lines.item(i);
                    if (line.mouseHit(point) && !line.isPartOf) {
                        lines.push(line);
                        line.selected = true;
                    }
                }
                for (var i = 0; i < this._data.circles.length; i++) {
                    var circle = this._data.circles.item(i);
                    if (circle.mouseHit(point)) {
                        lines.push(circle);
                        circle.selected = true;
                    }
                }
                for (var i = 0; i < this._data.parametric.length; i++) {
                    var graph = this._data.parametric.item(i);
                    if (graph.mouseHit(point)) {
                        lines.push(graph);
                        graph.selected = true;
                    }
                }
                for (var i = 0; i < this._data.angles.length; i++) {
                    var angle = this._data.angles.item(i);
                    if (angle.bisector && angle.bisector.mouseHit(point)) {
                        lines.push(angle.bisector);
                        angle.bisector.selected = true;
                    }
                }
                this._groupNo++;
                if (lines.length == 0) {
                    var transaction = this.beginUndo(Tools.Resources.string("Добавление точки"));
                    try {
                        var p = new Tools.ActivePoint(this, point.x, point.y);
                        p.setName(this.nextPointName());
                        p.selected = true;
                        this._addPoint(p);
                        transaction.commit();
                        return p;
                    }
                    catch (error) {
                        transaction.rollback();
                        throw error;
                    }
                }
                else if (lines.length == 1) {
                    var transaction = this.beginUndo(Tools.Resources.string("Добавление точки"));
                    try {
                        var line = lines[0];
                        var intersection = Tools.Intersection.makePoint(point, line);
                        var p = new Tools.ActiveCommonPoint(this, intersection.x, intersection.y, this._groupNo);
                        assert(line.mouseHit(p));
                        line.addPoint(p);
                        p.addGraphLine(line);
                        p.setName(this.nextPointName());
                        p.selected = true;
                        this._addPoint(p);
                        transaction.commit();
                        return p;
                    }
                    catch (error) {
                        transaction.rollback();
                        throw error;
                    }
                }
                else if (lines.length > 1) {
                    var transaction = this.beginUndo(Tools.Resources.string("Добавление точки"));
                    try {
                        var start_index = this._data.points.length;
                        for (var i = 0; i < lines.length; i++) {
                            var line1 = lines[i];
                            for (var j = i + 1; j < lines.length; j++) {
                                var line2 = lines[j];
                                var intersection = Tools.Intersection.makePoint(point, line1, line2);
                                var p = new Tools.ActiveCommonPoint(this, intersection.x, intersection.y, this._groupNo);
                                assert(line1.mouseHit(p));
                                assert(line2.mouseHit(p));
                                line1.addPoint(p);
                                p.addGraphLine(line1);
                                line2.addPoint(p);
                                p.addGraphLine(line2);
                                p.setName(this.nextPointName());
                                p.selected = true;
                                this._addPoint(p);
                            }
                        }
                        this.addGroupVisibility(start_index, this._data.points.length);
                        transaction.commit();
                    }
                    catch (error) {
                        transaction.rollback();
                        throw error;
                    }
                }
                return null;
            };
            Document.prototype.onOffProperties = function () {
                var _this = this;
                var property_name = "{5ECB60E4-4092-45AB-86C1-FBA76AD7ECB0}";
                for (var i = 0; i < this.length; i++) {
                    if (this.item(i).name == property_name) {
                        this.remove(this.item(i));
                        return false;
                    }
                }
                var properties = new Tools.Properties(this, makeMod(this, function (value) { return value + Tools.CurrentTheme.PropertyLeftMargin + _this.mouseArea.offset.x; }), makeMod(this, function (value) { return value + (_this._data.args.last ?
                    (_this._data.args.last.bottom + Tools.CurrentTheme.PropertyVerticalPadding) :
                    (_this.toolsBottom + _this.mouseArea.offset.y)); }));
                properties.name = property_name;
                this.push(properties);
                return true;
            };
            Document.prototype.new = function () {
                this._mouseArea.setOffset(0, 0);
                this._data.dispose(this);
                this._data = new DocumentData();
                this._data.initialize(this);
                this.name = "";
            };
            Document.prototype.save = function () {
                var info_separator = Document._infoSeparatorV2;
                var ret = [];
                ret.push("v" + Document.actualSerializationVersion);
                var context = {
                    points: {},
                    lines: {}
                };
                var join_data = function (data) { return Geoma.Utils.SerializeHelper.joinData(data, info_separator); };
                for (var i = 0; i < this._data.points.length; i++) {
                    var point = this._data.points.item(i);
                    var tag = point instanceof Tools.ActiveCommonPoint ? "cp" : "p";
                    ret.push("" + tag + info_separator + join_data(point.serialize(context)));
                    context.points[point.name] = i;
                }
                for (var i = 0; i < this._data.lines.length; i++) {
                    var line = this._data.lines.item(i);
                    if (line instanceof Tools.ActiveLineSegment) {
                        ret.push("l" + info_separator + join_data(line.serialize(context)));
                    }
                    else if (line instanceof Tools.ActiveLine) {
                        ret.push("ll" + info_separator + join_data(line.serialize(context)));
                    }
                    else {
                        assert(false, "Logical error");
                    }
                    context.lines[line.name] = i;
                }
                for (var i = 0; i < this._data.angles.length; i++) {
                    var angle = this._data.angles.item(i);
                    ret.push("a" + info_separator + join_data(angle.serialize(context)));
                }
                for (var i = 0; i < this._data.circles.length; i++) {
                    var circle = this._data.circles.item(i);
                    ret.push("c" + info_separator + join_data(circle.serialize(context)));
                }
                for (var i = 0; i < this._data.axes.length; i++) {
                    var axes = this._data.axes.item(i);
                    ret.push("ax" + info_separator + join_data(axes.serialize(context)));
                }
                for (var i = 0; i < this._data.args.length; i++) {
                    var arg = this._data.args.item(i);
                    ret.push("ar" + info_separator + join_data(arg.serialize(context)));
                }
                for (var i = 0; i < this._data.parametric.length; i++) {
                    var line = this._data.parametric.item(i);
                    ret.push("pl" + info_separator + join_data(line.serialize(context)));
                }
                if (ret.length > 1) {
                    return Geoma.Utils.SerializeHelper.joinData(ret, Document._chunkSeparator);
                }
                else {
                    return "";
                }
            };
            Document.prototype.open = function (data) {
                var groups = {};
                var old_data = this._data;
                var info_separator = Document._infoSeparatorV1;
                var serialization_version = Document.serializationVersion1;
                if (data.length > 2 && data.charAt(0) == "v") {
                    var end_version_index = data.indexOf(Document._chunkSeparator);
                    var version = data.substring(1, end_version_index);
                    if (toInt(version) == Document.actualSerializationVersion) {
                        serialization_version = toInt(version);
                        info_separator = Document._infoSeparatorV2;
                        data = data.substr(end_version_index + 1);
                    }
                }
                else if (data.length == 0) {
                    return;
                }
                var context = {
                    document: this,
                    data: new DocumentData(),
                    version: serialization_version
                };
                this._data = context.data;
                try {
                    var chunks = Geoma.Utils.SerializeHelper.splitData(data, Document._chunkSeparator);
                    var error = new Error(Tools.Resources.string("Невозможно восстановить данные"));
                    for (var _i = 0, chunks_1 = chunks; _i < chunks_1.length; _i++) {
                        var chunk = chunks_1[_i];
                        var info = Geoma.Utils.SerializeHelper.splitData(chunk, info_separator);
                        if (info.length < 1) {
                            throw error;
                        }
                        switch (info[0]) {
                            case "cp":
                                {
                                    var point = Tools.ActiveCommonPoint.deserialize(context, info, 1);
                                    if (point) {
                                        this._addPoint(point);
                                        this._groupNo = Math.max(this._groupNo, point.groupNo);
                                        if (!groups[point.groupNo]) {
                                            groups[point.groupNo] =
                                                {
                                                    start_index: this._data.points.length - 1,
                                                    end_index: this._data.points.length
                                                };
                                        }
                                        else {
                                            groups[point.groupNo].end_index = this._data.points.length;
                                        }
                                    }
                                    else {
                                        throw error;
                                    }
                                }
                                break;
                            case "p":
                                {
                                    var point = Tools.ActivePoint.deserialize(context, info, 1);
                                    if (point) {
                                        this._addPoint(point);
                                    }
                                    else {
                                        throw error;
                                    }
                                }
                                break;
                            case "l":
                                {
                                    var line = Tools.ActiveLineSegment.deserialize(context, info, 1);
                                    if (line) {
                                        this._data.lines.push(line);
                                    }
                                    else {
                                        throw error;
                                    }
                                }
                                break;
                            case "ll":
                                {
                                    var line = Tools.ActiveLine.deserialize(context, info, 1);
                                    if (line) {
                                        this._data.lines.push(line);
                                    }
                                    else {
                                        throw error;
                                    }
                                }
                                break;
                            case "a":
                                {
                                    var angle = Tools.AngleIndicator.deserialize(context, info, 1);
                                    if (angle) {
                                        this._data.angles.push(angle);
                                    }
                                    else {
                                        throw error;
                                    }
                                }
                                break;
                            case "c":
                                {
                                    var circle = Tools.ActiveCircleLine.deserialize(context, info, 1);
                                    if (circle) {
                                        this._data.circles.push(circle);
                                    }
                                    else {
                                        throw error;
                                    }
                                }
                                break;
                            case "ax":
                                {
                                    var axes = Tools.AxesLines.deserialize(context, info, 1);
                                    if (axes) {
                                        this._data.axes.push(axes);
                                    }
                                    else {
                                        throw error;
                                    }
                                }
                                break;
                            case "pl":
                                {
                                    var line = Tools.ParametricLine.deserialize(context, info, 1);
                                    if (line) {
                                        this._data.parametric.push(line);
                                    }
                                    else {
                                        throw error;
                                    }
                                }
                                break;
                            case "ar":
                                {
                                    var arg = Tools.ArgumentHandleButton.deserialize(context, info, 1);
                                    if (arg) {
                                        this._data.args.push(arg);
                                    }
                                    else {
                                        throw error;
                                    }
                                }
                                break;
                            default:
                                throw error;
                        }
                    }
                    this._arrangeArgHandles();
                }
                catch (ex) {
                    this._data.dispose();
                    this._data = old_data;
                    if (ex instanceof Object) {
                        this.alert(ex.toString());
                    }
                    return;
                }
                this._data = old_data;
                old_data.dispose(this);
                this._data = context.data;
                this._data.initialize(this);
                this._groupNo = 0;
                for (var group_id in groups) {
                    var group_no = toInt(group_id);
                    this._groupNo = Math.max(this._groupNo, group_no);
                    this.addGroupVisibility(groups[group_no].start_index, groups[group_no].end_index);
                }
                this._mouseArea.setOffset(0, 0);
            };
            Document.prototype.copyToClipboard = function (data) {
                return navigator.clipboard.writeText(data);
            };
            Document.prototype.prompt = function (message, default_value) {
                return window.prompt(message, default_value);
            };
            Document.prototype.promptNumber = function (message, default_value) {
                var number_text = this.prompt(Tools.Resources.string("{0}\r\nВведите число", message), default_value === null || default_value === void 0 ? void 0 : default_value.toString());
                if (number_text) {
                    var number = parseFloat(number_text);
                    if (number_text == "" + number) {
                        return number;
                    }
                    else {
                        this.alert(Tools.Resources.string("Значение '{0}' не является числом", number_text));
                    }
                }
                return default_value == undefined ? null : default_value;
            };
            Document.prototype.addSelectedSprite = function (sprite) {
                assert(this._selectedSprites.indexOf(sprite) == -1);
                this._selectedSprites.push(sprite);
            };
            Document.prototype.removeSelectedSprite = function (sprite) {
                var index = this._selectedSprites.indexOf(sprite);
                if (index >= 0) {
                    this._selectedSprites.splice(index, 1);
                }
            };
            Document.prototype.beginUndo = function (action_name) {
                var UndoTransactionImpl = (function (_super) {
                    __extends(UndoTransactionImpl, _super);
                    function UndoTransactionImpl() {
                        var _this = _super !== null && _super.apply(this, arguments) || this;
                        _this._undoLevel = 0;
                        _this._rollingBack = false;
                        return _this;
                    }
                    UndoTransactionImpl.prototype.commit = function () {
                        this._undoLevel--;
                        assert(this._undoLevel >= 0);
                        if (this._undoLevel == 0) {
                            if (this._rollingBack) {
                                this._undoLevel++;
                                this.rollback();
                            }
                            else {
                                if (this.document._currentUndoPosition < this.document._undoStack.length) {
                                    this.document._undoStack.splice(this.document._currentUndoPosition);
                                }
                                this.document._undoStack.push({
                                    text: this.name,
                                    snapshot: this.startSnapshot,
                                    offset: this.mouseAreaOffset
                                });
                                if (this.document._undoStack.length > Document._maximalUndoStackSize) {
                                    this.document._undoStack.splice(0, 1);
                                }
                                this.document._currentUndoPosition = this.document._undoStack.length;
                                delete this.document._currentTransaction;
                                Tools.FileTool.saveLastState(this.document.save());
                            }
                        }
                    };
                    UndoTransactionImpl.prototype.rollback = function () {
                        this._undoLevel--;
                        this._rollingBack = true;
                        assert(this._undoLevel >= 0);
                        if (this._undoLevel == 0) {
                            this.document.open(this.startSnapshot);
                            delete this.document._currentTransaction;
                        }
                    };
                    UndoTransactionImpl.prototype.upLevel = function () {
                        this._undoLevel++;
                    };
                    return UndoTransactionImpl;
                }(UndoTransaction));
                if (!this._currentTransaction) {
                    this._currentTransaction = new UndoTransactionImpl(this, action_name, this.save(), this.mouseArea.offset);
                }
                this._currentTransaction.upLevel();
                return this._currentTransaction;
            };
            Document.prototype.canUndo = function () {
                return this._undoStack.length > 0 && this._currentUndoPosition != 0;
            };
            Document.prototype.canRedo = function () {
                return this._undoStack.length > 0 && this._currentUndoPosition < (this._undoStack.length - 1);
            };
            Document.prototype.undo = function () {
                assert(this.canUndo());
                if (this._currentUndoPosition == this._undoStack.length) {
                    this._undoStack.push({
                        text: this._undoStack[this._undoStack.length - 1].text,
                        snapshot: this.save(),
                        offset: this.mouseArea.offset
                    });
                }
                this._currentUndoPosition--;
                var undo_info = this._undoStack[this._currentUndoPosition];
                this.open(undo_info.snapshot);
                this.mouseArea.setOffset(undo_info.offset.x, undo_info.offset.y);
            };
            Document.prototype.redo = function () {
                assert(this.canRedo());
                this._currentUndoPosition++;
                var undo_info = this._undoStack[this._currentUndoPosition];
                this.open(undo_info.snapshot);
                this.mouseArea.setOffset(undo_info.offset.x, undo_info.offset.y);
            };
            Document.prototype.realizeGraphArguments = function (parametric_line, arg_values) {
                var _this = this;
                var current_parametric_args = new Set();
                parametric_line.code.visitArguments(Document._makeVisitor(current_parametric_args));
                var used_args = new Set(current_parametric_args);
                for (var i = 0; i < this._data.parametric.length; i++) {
                    this._data.parametric.item(i).code.visitArguments(Document._makeVisitor(used_args));
                }
                current_parametric_args.forEach((function (arg_name) {
                    var _a, _b;
                    if (!parametric_line.hasArg(arg_name)) {
                        var arg_modifier = (_a = _this.getArgModifier(arg_name, parametric_line)) !== null && _a !== void 0 ? _a : _this._addArgHandle(arg_name, (_b = arg_values === null || arg_values === void 0 ? void 0 : arg_values.get(arg_name)) !== null && _b !== void 0 ? _b : 1);
                        parametric_line.addArg(arg_name, arg_modifier);
                    }
                }).bind(this));
                var unused_arg_handlers = new Array();
                for (var i = 0; i < this._data.args.length; i++) {
                    var arg_handler = this._data.args.item(i);
                    if (!used_args.has(arg_handler.name)) {
                        unused_arg_handlers.push(arg_handler.name);
                    }
                }
                for (var _i = 0, unused_arg_handlers_1 = unused_arg_handlers; _i < unused_arg_handlers_1.length; _i++) {
                    var unused_arg_handler = unused_arg_handlers_1[_i];
                    this._removeArgHandle(unused_arg_handler);
                }
            };
            Object.defineProperty(Document, "ticks", {
                get: function () {
                    return new Date().getTime();
                },
                enumerable: false,
                configurable: true
            });
            Document.forceCloseMenu = function (move_tool) {
                var _a;
                assert(move_tool.document.contains(move_tool));
                (_a = move_tool.document._contextMenu) === null || _a === void 0 ? void 0 : _a.close();
            };
            Document.prototype.innerDraw = function (play_ground) {
                Geoma.Utils.UpdateCalcRevision();
                if (this._onBeforeDraw) {
                    this._onBeforeDraw.emitEvent(new CustomEvent("BeforeDrawEvent"));
                }
                var current_transform = play_ground.context2d.getTransform();
                var matrix = DOMMatrix.fromMatrix(current_transform);
                matrix.a *= play_ground.ratio;
                matrix.d *= play_ground.ratio;
                play_ground.context2d.setTransform(matrix);
                this._background.draw(play_ground);
                this._tools.draw(play_ground);
                matrix.e -= this._mouseArea.offset.x * play_ground.ratio;
                matrix.f -= this._mouseArea.offset.y * play_ground.ratio;
                play_ground.context2d.setTransform(matrix);
                _super.prototype.innerDraw.call(this, play_ground);
                if (this._contextMenu) {
                    this._contextMenu.draw(play_ground);
                }
                if (this._state && this._state.activeItem) {
                    this._state.activeItem.draw(play_ground);
                }
                if (this._tooltip) {
                    this._tooltip.draw(play_ground);
                }
                play_ground.context2d.setTransform(current_transform);
                this._preventShowMenu = false;
            };
            Document.prototype.mouseClick = function (event) {
                var _a, _b, _c;
                if (this._tooltip) {
                    this._tooltip.dispose();
                    delete this._tooltip;
                }
                if (this._state) {
                    var transaction = void 0;
                    try {
                        switch (this._state.action) {
                            case "line segment":
                                {
                                    transaction = this.beginUndo(Tools.Resources.string("Добавление сегмента"));
                                    var end_point = (_a = this.getPoint(event)) !== null && _a !== void 0 ? _a : this.addPoint(event);
                                    assert(end_point);
                                    this.execLineSegmentState(end_point);
                                }
                                break;
                            case "angle indicator":
                                {
                                    var other_segment = this.getLineSegment(event);
                                    if (other_segment) {
                                        transaction = this.beginUndo(Tools.Resources.string("Отобразить угол"));
                                        this.execAngleIndicatorState(other_segment, event);
                                    }
                                    else {
                                        var other_line = this.getActiveLine(event);
                                        if (other_line) {
                                            transaction = this.beginUndo(Tools.Resources.string("Отобразить угол"));
                                            this.execAngleIndicatorState(other_line, event);
                                        }
                                    }
                                }
                                break;
                            case "bisector":
                                {
                                    var other_segment = this.getLineSegment(event);
                                    if (other_segment) {
                                        transaction = this.beginUndo(Tools.Resources.string("Показать биссектрисы углов"));
                                        this.execBisectorState(other_segment, event);
                                    }
                                    else {
                                        var other_line = this.getActiveLine(event);
                                        if (other_line) {
                                            transaction = this.beginUndo(Tools.Resources.string("Показать биссектрисы углов"));
                                            this.execBisectorState(other_line, event);
                                        }
                                    }
                                }
                                break;
                            case "parallel":
                                {
                                    var other_segment = this.getLine([Tools.ActiveLineSegment, Tools.ActiveLine], event);
                                    if (other_segment) {
                                        transaction = this.beginUndo(Tools.Resources.string("Сделать ||"));
                                        this.execParallelLineState(other_segment);
                                    }
                                }
                                break;
                            case "perpendicular":
                                {
                                    var other_segment = this.getLineSegment(event);
                                    if (other_segment) {
                                        transaction = this.beginUndo(Tools.Resources.string("Сделать ⟂"));
                                        this.execPerpendicularLineState(other_segment);
                                    }
                                }
                                break;
                            case "circle radius":
                            case "circle diameter":
                                {
                                    transaction = this.beginUndo(Tools.Resources.string("Добавление окружности"));
                                    var end_point = (_b = this.getPoint(event)) !== null && _b !== void 0 ? _b : this.addPoint(event);
                                    assert(end_point);
                                    var radius = this._state.action == "circle radius";
                                    this.execCircleState(end_point, radius ? Tools.CircleLineKind.Radius : Tools.CircleLineKind.Diameter);
                                }
                                break;
                            case "line":
                                {
                                    transaction = this.beginUndo(Tools.Resources.string("Добавление линии"));
                                    var end_point = (_c = this.getPoint(event)) !== null && _c !== void 0 ? _c : this.addPoint(event);
                                    assert(end_point);
                                    this.execLineState(end_point);
                                }
                                break;
                            default:
                                assert(false);
                        }
                        delete this._state;
                        this._preventShowMenu = true;
                        transaction === null || transaction === void 0 ? void 0 : transaction.commit();
                    }
                    catch (ex) {
                        transaction === null || transaction === void 0 ? void 0 : transaction.rollback();
                        delete this._state;
                        window.alert(ex);
                    }
                }
            };
            Document.prototype.execLineSegmentState = function (end_point) {
                assert(this._state && this._state.activeItem instanceof Tools.ActivePoint);
                var start_point = this._state.activeItem;
                if (!this.getPoint(start_point)) {
                    var p = this.addPoint(start_point);
                    assert(p);
                    start_point = p;
                }
                if (start_point == end_point) {
                    throw Error(Tools.Resources.string("Нельзя провести линию к той же точке!"));
                }
                else {
                    for (var i = 0; i < this._data.lines.length; i++) {
                        var line = this._data.lines.item(i);
                        if (line.isRelated(start_point) && line.isRelated(end_point)) {
                            throw Error(Tools.Resources.string("Отрезок {0} уже проведен!", line.name));
                        }
                    }
                }
                this._addLineSegment(start_point, end_point);
            };
            Document.prototype.execAngleIndicatorState = function (segment2, sel_point2) {
                assert(this._state && this._state.activeItem instanceof Tools.ActiveLineBase);
                var segment1 = this._state.activeItem;
                var common_point;
                for (var _i = 0, _a = segment1.points; _i < _a.length; _i++) {
                    var start_point = _a[_i];
                    for (var _b = 0, _c = segment2.points; _b < _c.length; _b++) {
                        var end_point = _c[_b];
                        if (start_point == end_point) {
                            common_point = start_point;
                            break;
                        }
                    }
                    if (common_point) {
                        break;
                    }
                }
                if (common_point) {
                    var p1 = void 0;
                    var p2 = void 0;
                    for (var _d = 0, _e = segment1.getNearestPoints(this._state.pitchPoint); _d < _e.length; _d++) {
                        var p = _e[_d];
                        if (p != common_point) {
                            if (!p1 || Tools.ActiveLineBase.getLength(common_point, p1) > Tools.ActiveLineBase.getLength(common_point, p)) {
                                p1 = p;
                            }
                        }
                    }
                    if (!p1) {
                        assert(this._state.pitchPoint);
                        var new_point = this.addPoint(this._state.pitchPoint);
                        assert(new_point);
                        p1 = new_point;
                    }
                    for (var _f = 0, _g = segment2.getNearestPoints(sel_point2); _f < _g.length; _f++) {
                        var p = _g[_f];
                        if (p != common_point) {
                            if (!p2 || Tools.ActiveLineBase.getLength(common_point, p2) > Tools.ActiveLineBase.getLength(common_point, p)) {
                                p2 = p;
                            }
                        }
                    }
                    if (!p2) {
                        var new_point = this.addPoint(sel_point2);
                        assert(new_point);
                        p2 = new_point;
                    }
                    for (var _h = 0, _j = this.getAngleIndicators(common_point); _h < _j.length; _h++) {
                        var angle = _j[_h];
                        if (angle.isRelated(p1) && angle.isRelated(p2)) {
                            if (angle.enabled) {
                                throw Error(Tools.Resources.string("Угол {0} уже обозначен.", Tools.AngleIndicator.getAngleName(common_point, p1, p2)));
                            }
                            else {
                                angle.enabled = true;
                                return angle;
                            }
                        }
                    }
                    if (common_point == p1 || common_point == p2 || p1 == p2) {
                        throw Error(Tools.Resources.string("Угол может быть обозначен только между различными прямыми, имеющими одну общую точку."));
                    }
                    else {
                        return this._addAngleIndicator(common_point, p1, p2);
                    }
                }
                else {
                    throw Error(Tools.Resources.string("Угол может быть обозначен только между различными прямыми, имеющими одну общую точку."));
                }
            };
            Document.prototype.execBisectorState = function (other_line, select_point) {
                var _a;
                assert((_a = this._state) === null || _a === void 0 ? void 0 : _a.activeItem);
                var one_line = this._state.activeItem;
                for (var i = 0; i < this._data.angles.length; i++) {
                    var angle_1 = this._data.angles.item(i);
                    if (angle_1.isRelated(one_line) && angle_1.isRelated(other_line)) {
                        if (angle_1.bisector) {
                            throw Error(Tools.Resources.string("Биссектриса угла {0} уже проведена.", angle_1.name));
                        }
                        else {
                            angle_1.addBisector();
                        }
                        return;
                    }
                }
                var angle = this.execAngleIndicatorState(other_line, select_point);
                angle.addBisector();
                angle.enabled = false;
            };
            Document.prototype.execParallelLineState = function (other_line) {
                assert(this._state && this._state.activeItem instanceof Tools.ActiveLineBase);
                assert(other_line.startPoint instanceof Tools.ActivePointBase && other_line.endPoint instanceof Tools.ActivePointBase);
                if (this._state.activeItem.isRelated(other_line.startPoint) || this._state.activeItem.isRelated(other_line.endPoint)) {
                    this.alert(Tools.Resources.string("Отрезки {0} и {1} имеют общую точку и не могут стать ||.", this._state.activeItem.name, other_line.name));
                }
                else {
                    this._state.activeItem.setParallelTo(other_line);
                }
            };
            Document.prototype.execPerpendicularLineState = function (other_segment) {
                assert(this._state && this._state.activeItem instanceof Tools.ActiveLineSegment);
                var segment = this._state.activeItem;
                if (!segment.isRelated(other_segment.start) && !segment.isRelated(other_segment.end)) {
                    this.alert(Tools.Resources.string("Отрезки {0} и {1} не имеют общей точки и не могут стать ⟂.", segment.name, other_segment.name));
                }
                else {
                    segment.setPerpendicularTo(other_segment);
                }
            };
            Document.prototype.execCircleState = function (pivot_point, kind) {
                assert(this._state && this._state.activeItem instanceof Tools.ActivePoint);
                var center_point = this._state.activeItem;
                if (!this.getPoint(center_point)) {
                    var p = this.addPoint(center_point);
                    assert(p);
                    center_point = p;
                }
                if (center_point == pivot_point) {
                    throw Error(Tools.Resources.string("Нельзя провести окружность к той же точке!"));
                }
                else {
                    for (var i = 0; i < this._data.circles.length; i++) {
                        var circle = this._data.circles.item(i);
                        if (circle.kind == kind) {
                            switch (kind) {
                                case Tools.CircleLineKind.Diameter:
                                    if ((circle.point1 == center_point && circle.point2 == pivot_point) || (circle.point1 == pivot_point && circle.point2 == center_point)) {
                                        throw Error(Tools.Resources.string("Окружность {0} уже проведена!", circle.name));
                                    }
                                    break;
                                case Tools.CircleLineKind.Radius:
                                    if (circle.point1 == center_point && circle.point2 == pivot_point) {
                                        throw Error(Tools.Resources.string("Окружность {0} уже проведена!", circle.name));
                                    }
                                    break;
                                default:
                                    assert(false);
                            }
                        }
                    }
                }
                this._addCircle(kind, center_point, pivot_point);
            };
            Document.prototype.execLineState = function (end_point) {
                assert(this._state && this._state.activeItem instanceof Tools.ActivePoint);
                var start_point = this._state.activeItem;
                if (!this.getPoint(start_point)) {
                    var p = this.addPoint(start_point);
                    assert(p);
                    start_point = p;
                }
                if (start_point == end_point) {
                    throw Error(Tools.Resources.string("Нельзя провести линию к той же точке!"));
                }
                else {
                    for (var i = 0; i < this._data.lines.length; i++) {
                        var line = this._data.lines.item(i);
                        if (line instanceof Tools.ActiveLine && line.isRelated(start_point) && line.isRelated(end_point)) {
                            throw Error(Tools.Resources.string("Линия {0} уже проведена!", line.name));
                        }
                    }
                }
                this._addLine(start_point, end_point);
            };
            Document.prototype.addGroupVisibility = function (start_index, end_index) {
                var group_no = -1;
                var groups = new Array();
                for (var i = start_index; i < end_index; i++) {
                    var p = this._data.points.item(i);
                    if (group_no == -1) {
                        group_no = p.groupNo;
                    }
                    assert(group_no == p.groupNo);
                    groups.push(p);
                }
                var _loop_6 = function (i) {
                    var point = this_4._data.points.item(i);
                    if (point instanceof Tools.ActiveCommonPoint) {
                        point.addGroupVisibility(function (value) {
                            for (var _i = 0, groups_1 = groups; _i < groups_1.length; _i++) {
                                var sibling_point = groups_1[_i];
                                if (point == sibling_point) {
                                    break;
                                }
                                else if (!sibling_point.disposed &&
                                    sibling_point.visible &&
                                    point.mouseHit(sibling_point)) {
                                    return false;
                                }
                            }
                            return value;
                        });
                    }
                };
                var this_4 = this;
                for (var i = start_index + 1; i < end_index; i++) {
                    _loop_6(i);
                }
            };
            Document.prototype.canRemovePoint = function (point) {
                for (var i = 0; i < this._data.lines.length; i++) {
                    if (this._data.lines.item(i).isRelated(point)) {
                        return false;
                    }
                }
                for (var i = 0; i < this._data.circles.length; i++) {
                    if (this._data.circles.item(i).isRelated(point)) {
                        return false;
                    }
                }
                return true;
            };
            Document.getName = function (index, pattern) {
                var name_index = toInt(index / pattern.length);
                var name = pattern.charAt(index % pattern.length);
                return name_index ? "" + name + name_index : name;
            };
            Document.prototype.nextPointName = function () {
                var name;
                for (var i = 0;; i++) {
                    name = Document.getName(i, Document._pointNames);
                    var unique_name = true;
                    for (var j = 0; j < this._data.points.length; j++) {
                        if (this._data.points.item(j).name == name) {
                            unique_name = false;
                            break;
                        }
                    }
                    if (unique_name) {
                        break;
                    }
                }
                return name;
            };
            Document.prototype.onTap = function () {
                Tools.PointTool.showMenu(this);
                var move_tool = new Tools.MoveTool(this);
                this.push(move_tool);
            };
            Document.prototype._addPoint = function (point) {
                this._data.points.push(point);
            };
            Document.prototype._addLineSegment = function (start_point, end_point, line_width, brush) {
                var segment = new Tools.ActiveLineSegment(start_point, end_point, line_width, brush);
                this._data.lines.push(segment);
                return segment;
            };
            Document.prototype._addAngleIndicator = function (p0, p1, p2) {
                var indicator = new Tools.AngleIndicator(this, p0, p1, p2);
                this._data.angles.push(indicator);
                return indicator;
            };
            Document.prototype._addCircle = function (kind, start_point, end_point, line_width, brush) {
                var circle = new Tools.ActiveCircleLine(this, kind, start_point, end_point, line_width, brush);
                this._data.circles.push(circle);
                return circle;
            };
            Document.prototype._addLine = function (start_point, end_point, line_width, brush) {
                var line = new Tools.ActiveLine(start_point, end_point, line_width, brush);
                this._data.lines.push(line);
                return line;
            };
            Document.prototype._addArgHandle = function (arg_name, value) {
                for (var i = 0; i < this._data.args.length; i++) {
                    assert(this._data.args.item(i).name != arg_name);
                }
                var handle = new Tools.ArgumentHandleButton(this, 0, arg_name, value);
                this._data.args.push(handle);
                this._arrangeArgHandles();
                return function () { return handle.value; };
            };
            Document.prototype._removeArgHandle = function (arg_name) {
                for (var i = 0; i < this._data.args.length; i++) {
                    var arg_handle = this._data.args.item(i);
                    if (arg_handle.name == arg_name) {
                        this._data.args.remove(arg_handle);
                        arg_handle.dispose();
                        this._arrangeArgHandles();
                        return;
                    }
                }
                assert(false, "logical error");
            };
            Document.prototype._arrangeArgHandles = function () {
                var args = new Array();
                for (var i = 0; i < this._data.args.length; i++) {
                    args.push({ handle: this._data.args.item(i), index: i });
                }
                args.sort(function (a, b) { return a.handle.name < b.handle.name ? -1 : 1; });
                var last_index = -1;
                for (var _i = 0, args_1 = args; _i < args_1.length; _i++) {
                    var arg = args_1[_i];
                    arg.handle.bottomArgIndex = last_index;
                    last_index = arg.index;
                }
            };
            Document.prototype._tryGetPointProperty = function (arg_name, parametric_line) {
                var _this = this;
                var m = arg_name.match(new RegExp("^[" + Document._pointNames + "][1-9]?(_[xy])?"));
                if (m) {
                    assert(m.length == 2);
                    if (m[0] == arg_name && m[1].length) {
                        var point_coord = m[1];
                        var point_name_1 = m[0].substring(0, m[0].indexOf(point_coord));
                        var _loop_7 = function (i) {
                            var point = this_5.points.item(i);
                            assert(point instanceof Tools.ActivePointBase);
                            if (point.name == point_name_1) {
                                var point_index_1 = i;
                                var get_point_1 = (function () {
                                    if (point_index_1 < _this.points.length) {
                                        var point_2 = _this.points.item(point_index_1);
                                        if (point_2.name == point_name_1) {
                                            return point_2;
                                        }
                                    }
                                    return null;
                                }).bind(this_5);
                                switch (point_coord) {
                                    case "_x":
                                        if (!parametric_line.isRelated(point)) {
                                            parametric_line.addPoint(point);
                                        }
                                        return { value: function () { var _a, _b; return parametric_line.axes.fromScreenX((_b = (_a = get_point_1()) === null || _a === void 0 ? void 0 : _a.x) !== null && _b !== void 0 ? _b : NaN); } };
                                    case "_y":
                                        if (!parametric_line.isRelated(point)) {
                                            parametric_line.addPoint(point);
                                        }
                                        return { value: function () { var _a, _b; return parametric_line.axes.fromScreenY((_b = (_a = get_point_1()) === null || _a === void 0 ? void 0 : _a.y) !== null && _b !== void 0 ? _b : NaN); } };
                                    default:
                                        throw new Error("Unexpected point parameter: " + arg_name);
                                }
                            }
                        };
                        var this_5 = this;
                        for (var i = 0; i < this.points.length; i++) {
                            var state_2 = _loop_7(i);
                            if (typeof state_2 === "object")
                                return state_2.value;
                        }
                        throw new Error("Undefined identifier " + arg_name);
                    }
                }
                return null;
            };
            Document._makeVisitor = function (set) {
                return function (arg) {
                    if (!(arg instanceof Geoma.Syntax.CodeArgumentX)) {
                        set.add(arg.text);
                    }
                };
            };
            Document.serializationVersion1 = 1;
            Document.actualSerializationVersion = 2;
            Document._pointNames = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            Document._chunkSeparator = ";";
            Document._infoSeparatorV1 = "|";
            Document._infoSeparatorV2 = "-";
            Document._maximalUndoStackSize = 200;
            return Document;
        }(Geoma.Sprite.Container));
        Tools.Document = Document;
    })(Tools = Geoma.Tools || (Geoma.Tools = {}));
})(Geoma || (Geoma = {}));
var playGround;
var mainDocument;
var GeomaApplicationVersion = 0;
var GeomaFeatureVersion = 5;
var GeomaFixVersion = 7;
window.onload = function () {
    document.title = document.title + " v" + GeomaApplicationVersion + "." + GeomaFeatureVersion + "." + GeomaFixVersion;
    var canvas = document.getElementById('playArea');
    playGround = new Geoma.PlayGround(canvas);
    mainDocument = new Geoma.Tools.Document(playGround);
    window.requestAnimationFrame(drawAll);
};
window.onresize = function () {
    playGround.invalidate();
};
function drawAll(__time) {
    mainDocument.draw(playGround);
    window.requestAnimationFrame(drawAll);
}
function updateAllLatexEngines() {
    Geoma.Utils.assert(mainDocument);
    mainDocument.latexEngine.mathContainerUpdate();
}
function disableAllLatexEngines() {
    Geoma.Utils.assert(mainDocument);
    mainDocument.latexEngine.disabled = true;
}
var Geoma;
(function (Geoma) {
    var Tools;
    (function (Tools) {
        var makeMod = Geoma.Utils.makeMod;
        var toInt = Geoma.Utils.toInt;
        var assert = Geoma.Utils.assert;
        var AngleDirection;
        (function (AngleDirection) {
            AngleDirection[AngleDirection["clockwise"] = 0] = "clockwise";
            AngleDirection[AngleDirection["anticlockwise"] = 1] = "anticlockwise";
        })(AngleDirection = Tools.AngleDirection || (Tools.AngleDirection = {}));
        var AngleIndicator = (function (_super) {
            __extends(AngleIndicator, _super);
            function AngleIndicator(document, p0, p1, p2) {
                var _this = this;
                assert(p0 != p1 && p0 != p2 && p1 != p2);
                _this = _super.call(this, document, new Geoma.Sprite.Container()) || this;
                _this.enabled = true;
                _this.commonPivot = p0;
                _this._p1 = p1;
                _this._p2 = p2;
                _this.addVisible(makeMod(_this, function (value) { return value && _this.commonPivot.visible && _this._p1.visible && _this._p2.visible; }));
                _this._selectionRadius = Geoma.Utils.makeProp(makeMod(_this, function () { return 30 + 15 * _this.document.getEngleIndicatorOrder(_this); }), 30);
                _this._angle = new Geoma.Utils.ModifiableProperty(makeMod(_this, function () { return Tools.ActiveLineSegment.getAngle(_this.commonPivot.x, _this.commonPivot.y, _this._p1.x, _this._p1.y, _this._p2.x, _this._p2.y); }), 0);
                _this._startAngle = new Geoma.Utils.ModifiableProperty(makeMod(_this, function () { return Tools.ActiveLineSegment.getAngle(_this.commonPivot.x, _this.commonPivot.y, _this._p1.x, _this._p1.y); }), 0);
                _this._endAngle = new Geoma.Utils.ModifiableProperty(makeMod(_this, function () { return Tools.ActiveLineSegment.getAngle(_this.commonPivot.x, _this.commonPivot.y, _this._p2.x, _this._p2.y); }), 0);
                _this._textAngle = new Geoma.Utils.ModifiableProperty(makeMod(_this, function () {
                    switch (_this.angleDirection) {
                        case AngleDirection.clockwise:
                            return _this.startAngle + _this.angle / 2;
                        default:
                            return _this.startAngle - _this.angle / 2;
                    }
                }), 0);
                _this._angleDirection = new Geoma.Utils.ModifiableProperty(makeMod(_this, function () { return AngleIndicator.angleDifDirection(_this.startAngle, _this.endAngle); }), AngleDirection.clockwise);
                var text = new Geoma.Sprite.Text(makeMod(_this, function () { return Math.cos(_this.textAngle) * _this.radius + _this.commonPivot.x; }), makeMod(_this, function () { return Math.sin(_this.textAngle) * _this.radius + _this.commonPivot.y; }), undefined, undefined, makeMod(_this, function () { return _this.selected ? Tools.CurrentTheme.AngleNameSelectBrush : Tools.CurrentTheme.AngleNameBrush; }), function () { return Tools.CurrentTheme.AngleNameStyle; }, makeMod(_this, function () { return _this._angleName ? _this._angleName : Geoma.Utils.toFixed(Geoma.Utils.toDeg(_this.angle), Tools.CurrentTheme.AngleIndicatorPrecision) + "\u00B0"; }));
                text.strokeBrush.addModifier(function () { return Tools.CurrentTheme.AngleIndicatorStrokeBrush; });
                text.strokeWidth.addModifier(function () { return Tools.CurrentTheme.AngleIndicatorStrokeWidth; });
                _this.item.push(text);
                return _this;
            }
            Object.defineProperty(AngleIndicator.prototype, "angle", {
                get: function () {
                    return this._angle.value;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(AngleIndicator.prototype, "textAngle", {
                get: function () {
                    return this._textAngle.value;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(AngleIndicator.prototype, "startAngle", {
                get: function () {
                    return this._startAngle.value;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(AngleIndicator.prototype, "endAngle", {
                get: function () {
                    return this._endAngle.value;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(AngleIndicator.prototype, "angleDirection", {
                get: function () {
                    return this._angleDirection.value;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(AngleIndicator.prototype, "name", {
                get: function () {
                    var _a;
                    return (_a = this._angleName) !== null && _a !== void 0 ? _a : this.realName;
                },
                set: function (name) {
                    assert(!this._angleName);
                    this._angleName = name;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(AngleIndicator.prototype, "realName", {
                get: function () {
                    return AngleIndicator.getAngleName(this.commonPivot, this._p1, this._p2);
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(AngleIndicator.prototype, "center", {
                get: function () {
                    return this.commonPivot;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(AngleIndicator.prototype, "radius", {
                get: function () {
                    return this._selectionRadius.value;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(AngleIndicator.prototype, "bisector", {
                get: function () {
                    return this._bisector ? this._bisector : null;
                },
                enumerable: false,
                configurable: true
            });
            AngleIndicator.prototype.isMoved = function (receiptor) {
                return this.commonPivot.isMoved(receiptor) || this._p1.isMoved(receiptor) || this._p2.isMoved(receiptor);
            };
            AngleIndicator.prototype.isRelated = function (sprite) {
                if (sprite instanceof Tools.ActivePointBase) {
                    return this.commonPivot == sprite || this._p1 == sprite || this._p2 == sprite;
                }
                else if (sprite instanceof Tools.ActiveLineBase) {
                    return sprite.isRelated(this.commonPivot) && (sprite.isRelated(this._p1) || sprite.isRelated(this._p2));
                }
                else {
                    assert(false, "TODO");
                }
            };
            AngleIndicator.prototype.dispose = function () {
                _super.prototype.dispose.call(this);
                if (this._bisector) {
                    this._removeBisector(this._bisector);
                }
            };
            AngleIndicator.prototype.addBisector = function () {
                Tools.UndoTransaction.Do(this, Tools.Resources.string("Показать биссектрисы углов"), this._addBisector);
            };
            AngleIndicator.prototype.removeBisector = function (bisector) {
                var _this = this;
                Tools.UndoTransaction.Do(this, Tools.Resources.string("Удалить биссектрису"), function () { return _this._removeBisector(bisector); });
            };
            AngleIndicator.prototype.serialize = function (context) {
                var data = [];
                data.push(context.points[this.commonPivot.name].toString());
                data.push(context.points[this._p1.name].toString());
                data.push(context.points[this._p2.name].toString());
                if (this.bisector) {
                    data.push("b" + (this.bisector.points.length - 1));
                    for (var _i = 0, _a = this.bisector.points; _i < _a.length; _i++) {
                        var p = _a[_i];
                        if (p != this.commonPivot) {
                            data.push(context.points[p.name].toString());
                        }
                    }
                }
                if (!this.enabled) {
                    data.push("d");
                }
                if (this._angleName) {
                    data.push("n" + AngleIndicator._anglesNames.indexOf(this._angleName));
                }
                return data;
            };
            AngleIndicator.angleDifDirection = function (start_angle, end_angle) {
                var anticlockwise = false;
                if (start_angle < Math.PI) {
                    if (end_angle > Math.PI) {
                        anticlockwise = (end_angle - start_angle) > Math.PI;
                    }
                    else {
                        anticlockwise = end_angle < start_angle;
                    }
                }
                else {
                    if (end_angle > Math.PI) {
                        anticlockwise = end_angle < start_angle;
                    }
                    else {
                        anticlockwise = (start_angle - end_angle) < Math.PI;
                    }
                }
                return anticlockwise ? AngleDirection.anticlockwise : AngleDirection.clockwise;
            };
            AngleIndicator.deserialize = function (context, data, index) {
                if (data.length < (index + 3)) {
                    return null;
                }
                else {
                    var p0 = context.data.points.item(toInt(data[index++]));
                    var p1 = context.data.points.item(toInt(data[index++]));
                    var p2 = context.data.points.item(toInt(data[index++]));
                    var angle = new AngleIndicator(context.document, p0, p1, p2);
                    for (; index < data.length; index++) {
                        var chunck = data[index];
                        assert(chunck.length);
                        var prefix = chunck.charAt(0);
                        switch (prefix) {
                            case 'b':
                                var bisector = angle._addBisector();
                                var common_points = toInt(chunck.substring(1));
                                for (var i = 0; i < common_points; i++) {
                                    index++;
                                    if (index >= data.length) {
                                        return null;
                                    }
                                    else {
                                        var p = context.data.points.item(toInt(data[index]));
                                        assert(p instanceof Tools.ActiveCommonPoint);
                                        p.addGraphLine(bisector);
                                        bisector.addPoint(p);
                                    }
                                }
                                break;
                            case 'd':
                                angle.enabled = false;
                                break;
                            case 'n':
                                var p_index = toInt(chunck.substring(1));
                                if (p_index >= 0 && p_index < AngleIndicator._anglesNames.length) {
                                    angle._angleName = AngleIndicator._anglesNames.charAt(p_index);
                                }
                                break;
                            default:
                                assert(false);
                        }
                    }
                    return angle;
                }
            };
            AngleIndicator.getAngleName = function (p0, p1, p2) {
                if (p1.name < p2.name) {
                    return "\u2220" + AngleIndicator._getName(p1) + AngleIndicator._getName(p0) + AngleIndicator._getName(p2);
                }
                else {
                    return "\u2220" + AngleIndicator._getName(p2) + AngleIndicator._getName(p0) + AngleIndicator._getName(p1);
                }
            };
            AngleIndicator.prototype.canSelect = function (event) {
                var dx = event.x - this.commonPivot.x;
                var dy = event.y - this.commonPivot.y;
                return this.enabled && (dx * dx + dy * dy) <= (this.radius * this.radius);
            };
            AngleIndicator.prototype.innerDraw = function (play_ground) {
                var _this = this;
                if (this._bisector) {
                    this._bisector.draw(play_ground);
                }
                if (this.enabled) {
                    var x_8 = this.commonPivot.x;
                    var y_8 = this.commonPivot.y;
                    var select_brush_alpha = 0.3;
                    var selection_border = function () {
                        play_ground.context2d.beginPath();
                        play_ground.context2d.strokeStyle = Tools.CurrentTheme.AngleIndicatorBrush;
                        play_ground.context2d.lineWidth = Tools.CurrentTheme.AngleIndicatorLineWidth;
                        play_ground.context2d.arc(x_8, y_8, _this.radius, _this.startAngle, _this.endAngle, _this.angleDirection != AngleDirection.anticlockwise);
                        play_ground.context2d.stroke();
                        play_ground.context2d.closePath();
                    };
                    play_ground.context2d.beginPath();
                    if (Math.abs(Math.round(Geoma.Utils.toDeg(this.angle)) - 90) < 0.01) {
                        var p1 = Tools.ActiveLineBase.getPoint(this.commonPivot, this._p1, this.radius);
                        var p2 = Tools.ActiveLineBase.getPoint(this.commonPivot, this._p2, this.radius);
                        if (this.selected) {
                            var global_alpha = play_ground.context2d.globalAlpha;
                            play_ground.context2d.globalAlpha = select_brush_alpha;
                            play_ground.context2d.beginPath();
                            play_ground.context2d.fillStyle = Tools.CurrentTheme.AngleIndicatorSelectionBrush;
                            play_ground.context2d.moveTo(p1.x, p1.y);
                            play_ground.context2d.lineTo(p1.x + p2.x - x_8, p1.y + p2.y - y_8);
                            play_ground.context2d.lineTo(p2.x, p2.y);
                            play_ground.context2d.lineTo(x_8, y_8);
                            play_ground.context2d.fill();
                            selection_border.apply(this);
                            play_ground.context2d.globalAlpha = global_alpha;
                            play_ground.context2d.closePath();
                        }
                        play_ground.context2d.beginPath();
                        play_ground.context2d.strokeStyle = Tools.CurrentTheme.AngleIndicatorBrush;
                        play_ground.context2d.lineWidth = Tools.CurrentTheme.AngleIndicatorLineWidth;
                        play_ground.context2d.moveTo(p1.x, p1.y);
                        play_ground.context2d.lineTo(p1.x + p2.x - x_8, p1.y + p2.y - y_8);
                        play_ground.context2d.lineTo(p2.x, p2.y);
                        play_ground.context2d.stroke();
                    }
                    else {
                        if (this.selected) {
                            var global_alpha = play_ground.context2d.globalAlpha;
                            play_ground.context2d.globalAlpha = select_brush_alpha;
                            play_ground.context2d.fillStyle = Tools.CurrentTheme.AngleIndicatorSelectionBrush;
                            play_ground.context2d.arc(this.commonPivot.x, this.commonPivot.y, this.radius, this.startAngle, this.endAngle, this.angleDirection == AngleDirection.anticlockwise);
                            play_ground.context2d.lineTo(this.commonPivot.x, this.commonPivot.y);
                            play_ground.context2d.fill();
                            play_ground.context2d.closePath();
                            selection_border.apply(this);
                            play_ground.context2d.globalAlpha = global_alpha;
                            play_ground.context2d.beginPath();
                        }
                        play_ground.context2d.strokeStyle = Tools.CurrentTheme.AngleIndicatorBrush;
                        play_ground.context2d.lineWidth = Tools.CurrentTheme.AngleIndicatorLineWidth;
                        play_ground.context2d.arc(this.commonPivot.x, this.commonPivot.y, this.radius, this.startAngle, this.endAngle, this.angleDirection == AngleDirection.anticlockwise);
                        play_ground.context2d.stroke();
                    }
                    _super.prototype.innerDraw.call(this, play_ground);
                }
            };
            AngleIndicator.prototype.mouseMove = function (event) {
                var can_select = this.canSelect(event);
                if (can_select) {
                    for (var _i = 0, _a = this.document.getAngleIndicators(this.commonPivot); _i < _a.length; _i++) {
                        var indicator = _a[_i];
                        if (indicator != this && indicator.canSelect(event) && indicator.radius < this.radius) {
                            can_select = false;
                            break;
                        }
                    }
                }
                this.selected = can_select;
                _super.prototype.mouseMove.call(this, event);
            };
            AngleIndicator.prototype.mouseClick = function (event) {
                var _this = this;
                var doc = this.document;
                if (doc.canShowMenu(this)) {
                    var x = doc.mouseArea.mousePoint.x;
                    var y = doc.mouseArea.mousePoint.y;
                    var menu = new Tools.Menu(doc, x, y);
                    var menu_item = menu.addMenuItem(Tools.Resources.string("Показать биссектрисы углов"));
                    menu_item.onChecked.bind(this, this.addBisector);
                    menu_item.enabled.addModifier(makeMod(this, function () { return !_this._bisector; }));
                    var set_name_1 = function (index) {
                        var name = AngleIndicator._anglesNames.charAt(index);
                        Tools.UndoTransaction.Do(_this, Tools.Resources.string("Название угла ({0})", name), function () { return _this._angleName = name; });
                    };
                    if (this._angleName) {
                        menu_item = menu.addMenuItem(Tools.Resources.string("Имя по умолчанию ({0})", this.realName));
                        menu_item.onChecked.bind(this, function () {
                            Tools.UndoTransaction.Do(_this, Tools.Resources.string("Название угла ({0})", _this.realName), function () { return _this._angleName = undefined; });
                        });
                    }
                    var custom_name = menu.addMenuGroup(Tools.Resources.string("Настраиваемое имя"));
                    var stripe = void 0;
                    var _loop_8 = function (i) {
                        if (i % 6 == 0) {
                            stripe = custom_name.addMenuStrip();
                        }
                        var index = i;
                        var menu_item_1 = stripe.addMenuItem(" " + AngleIndicator._anglesNames.charAt(index) + " ");
                        menu_item_1.onChecked.bind(this_6, function () { return set_name_1(index); });
                    };
                    var this_6 = this;
                    for (var i = 0; i < AngleIndicator._anglesNames.length; i++) {
                        _loop_8(i);
                    }
                    menu_item = menu.addMenuItem(Tools.Resources.string("Удалить индикатор угла {0}", this.name));
                    menu_item.onChecked.bind(this, function () { return _this.document.removeAngle(_this); });
                    menu.show();
                }
                _super.prototype.mouseClick.call(this, event);
            };
            AngleIndicator.prototype._addBisector = function () {
                assert(!this._bisector);
                this._bisector = new Tools.BisectorLine(this);
                return this._bisector;
            };
            AngleIndicator.prototype._removeBisector = function (bisector) {
                assert(this._bisector == bisector);
                this._bisector.dispose();
                delete this._bisector;
                if (!this.enabled) {
                    this.document.removeAngle(this);
                }
            };
            AngleIndicator._getName = function (point) {
                return point.name;
            };
            AngleIndicator._anglesNames = "αβγδεζηθικλμνξορστυyφχψω";
            return AngleIndicator;
        }(Tools.DocumentSprite));
        Tools.AngleIndicator = AngleIndicator;
    })(Tools = Geoma.Tools || (Geoma.Tools = {}));
})(Geoma || (Geoma = {}));
var Geoma;
(function (Geoma) {
    var Tools;
    (function (Tools) {
        var Background = (function (_super) {
            __extends(Background, _super);
            function Background(document) {
                return _super.call(this, 0, 0, function () { return document.mouseArea.w; }, function () { return document.mouseArea.h; }, function () { return Tools.CurrentTheme.BackgroundBrush; }) || this;
            }
            return Background;
        }(Geoma.Sprite.Rectangle));
        Tools.Background = Background;
    })(Tools = Geoma.Tools || (Geoma.Tools = {}));
})(Geoma || (Geoma = {}));
var Geoma;
(function (Geoma) {
    var Test;
    (function (Test) {
        var TestUtils = (function () {
            function TestUtils() {
            }
            TestUtils.testCaseName = function (fixture, test_name) {
                return TestUtils.fixtureName(fixture) + "." + test_name;
            };
            TestUtils.printSuccess = function (text) {
                console.log("%c " + text, 'background: #0a0; color: #fff');
            };
            TestUtils.printError = function (text) {
                console.log("%c " + text, 'background: #a00; color: #fff');
            };
            TestUtils.printGlobal = function (text) {
                TestUtils.printSuccess("[==========] " + text);
            };
            TestUtils.printGroup = function (text) {
                TestUtils.printSuccess("[----------] " + text);
            };
            TestUtils.printRun = function (text) {
                TestUtils.printSuccess("[ RUN      ] " + text);
            };
            TestUtils.printOk = function (text) {
                TestUtils.printSuccess("[       OK ] " + text);
            };
            TestUtils.printPassed = function (text) {
                TestUtils.printSuccess("[  PASSED  ] " + text);
            };
            TestUtils.printFailed = function (text) {
                TestUtils.printError("[  FAILED  ] " + text);
            };
            TestUtils.addTest = function (fixture, test_name) {
                var test_names = TestUtils._tests[TestUtils.fixtureName(fixture)];
                if (!test_names) {
                    test_names = TestUtils._tests[TestUtils.fixtureName(fixture)] = new Map();
                }
                var test_case_name = TestUtils.testCaseName(fixture, test_name);
                Geoma.Utils.assert(!test_names.has(test_name), "Duplicate test name: " + test_case_name);
                test_names.set(test_name, fixture);
                return test_case_name;
            };
            TestUtils.runAll = function () {
                var tests_count = 0;
                var test_fixtures_count = 0;
                for (var fixture_name in TestUtils._tests) {
                    var fixture = TestUtils._tests[fixture_name];
                    test_fixtures_count++;
                    tests_count += fixture.size;
                }
                var s_end = function (count) { return count > 1 ? "s" : ""; };
                TestUtils.printGlobal("Runinig " + tests_count + " test" + s_end(tests_count) + " from " + test_fixtures_count + " test case" + s_end(test_fixtures_count) + ".");
                var failed_tests = new Array();
                var _loop_9 = function (fixture_name) {
                    var fixture = TestUtils._tests[fixture_name];
                    TestUtils.printGroup(fixture.size + " test" + s_end(fixture.size) + " from " + fixture_name);
                    var passed = 0;
                    fixture.forEach(function (fixture, test_name) {
                        if (fixture.run()) {
                            passed++;
                        }
                        else {
                            failed_tests.push(TestUtils.testCaseName(fixture, test_name));
                        }
                    });
                    TestUtils.printGroup(passed + " test" + s_end(passed) + " from " + fixture_name + ".");
                };
                for (var fixture_name in TestUtils._tests) {
                    _loop_9(fixture_name);
                }
                TestUtils.printGlobal(tests_count + " test" + s_end(tests_count) + " from " + test_fixtures_count + " test case" + s_end(test_fixtures_count) + " ran.");
                TestUtils.printPassed(tests_count - failed_tests.length + " test" + s_end(tests_count - failed_tests.length));
                if (failed_tests.length) {
                    TestUtils.printFailed(failed_tests.length + " test" + s_end(failed_tests.length) + ", listed below.");
                    for (var _i = 0, failed_tests_1 = failed_tests; _i < failed_tests_1.length; _i++) {
                        var failed_test = failed_tests_1[_i];
                        TestUtils.printFailed(failed_test);
                    }
                    return false;
                }
                else {
                    return true;
                }
            };
            TestUtils.fixtureName = function (fixture) {
                return fixture.constructor.name;
            };
            TestUtils._tests = {};
            return TestUtils;
        }());
        var TestFixture = (function () {
            function TestFixture(test_name, test_case) {
                var _this = this;
                this._error = false;
                var test_case_name = TestUtils.addTest(this, test_name);
                this.run = (function () {
                    TestUtils.printRun(test_case_name);
                    try {
                        test_case();
                        if (_this._error) {
                            throw new Error();
                        }
                        else {
                            TestUtils.printOk(test_case_name);
                            return true;
                        }
                    }
                    catch (error) {
                        if (error instanceof Error && error.message) {
                            TestUtils.printError(" " + error.message);
                        }
                        else {
                            TestUtils.printError(" Unexpected error");
                        }
                        TestUtils.printFailed(test_case_name);
                        return false;
                    }
                }).bind(this);
            }
            return TestFixture;
        }());
        Test.TestFixture = TestFixture;
        var TestFixtureTests = (function (_super) {
            __extends(TestFixtureTests, _super);
            function TestFixtureTests() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            return TestFixtureTests;
        }(TestFixture));
        new TestFixtureTests("SuccessPass", function () {
        });
        new TestFixtureTests("ThrowError", function () {
            throw new Error("test fixture test error");
        });
        new TestFixtureTests("ThrowNonError", function () {
            throw "test fixture test error";
        });
    })(Test = Geoma.Test || (Geoma.Test = {}));
})(Geoma || (Geoma = {}));
//# sourceMappingURL=geoma.js.map