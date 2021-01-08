"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
                    this._listeners.splice(index, 1);
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
        var Pulse = (function () {
            function Pulse() {
                this._revision = 0;
                this._receiptors = {};
            }
            Pulse.prototype.set = function () {
                this._revision = toInt(this._revision + 1) % 1000000;
            };
            Pulse.prototype.get = function (receiptor) {
                if (this._receiptors[receiptor] == null) {
                    this._receiptors[receiptor] = this._revision;
                    return this._revision != 0;
                }
                else {
                    var ret = this._receiptors[receiptor] != this._revision;
                    this._receiptors[receiptor] = this._revision;
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
                return ~~value;
            }
        }
        Utils.toInt = toInt;
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
    })(Utils = Geoma.Utils || (Geoma.Utils = {}));
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
            _this._mousePoint = Point.make(0, 0);
            _this._downPoint = Point.make(0, 0);
            assert(canvas);
            _this._canvas = canvas;
            _this._canvas.onmousemove = _this.onMouseMove.connect();
            _this._canvas.onmousedown = _this.onMouseDown.connect();
            _this._canvas.onmouseup = _this.onMouseUp.connect();
            _this.invalidate();
            _this.addW(function () { return _this._canvas.width; });
            _this.addH(function () { return _this._canvas.height; });
            var context2d = _this._canvas.getContext("2d");
            assert(context2d);
            _this._context2d = context2d;
            _this.onMouseMove.bind(_this, function (event) { _this._mousePoint = event; });
            _this.onMouseDown.bind(_this, function (event) { _this._downPoint = event; });
            _this.onMouseUp.bind(_this, function (event) {
                var click_tolerance = 1;
                if (_this._downPoint && Math.abs(_this._downPoint.x - event.x) <= click_tolerance && Math.abs(_this._downPoint.y - event.y) <= click_tolerance) {
                    _this.onMouseClick.emitEvent(event);
                }
            });
            return _this;
        }
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
        PlayGround.prototype.invalidate = function () {
            var parent = this._canvas.parentElement;
            if (parent) {
                this._canvas.width = parent.clientWidth;
                this._canvas.height = parent.clientHeight;
            }
        };
        PlayGround.prototype.getPosition = function (el) {
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
        var Line = (function () {
            function Line(start, end) {
                this.path = new Path2D();
                assert(start);
                assert(end);
                this.path.moveTo(start.x, start.y);
                this.path.lineTo(end.x, end.y);
                this.box = new Box(Math.min(start.x, end.x), Math.min(start.y, start.y), Math.abs(end.x - start.x), Math.abs(end.y - start.y));
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
                    return this._visible.value;
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
            Dragable.prototype.mouseUp = function (event) {
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
        var PolySprite = (function (_super) {
            __extends(PolySprite, _super);
            function PolySprite(x, y, line_width, brush) {
                var _this = _super.call(this, x, y) || this;
                _this.lineWidth = makeProp(line_width, 1);
                _this.brush = makeProp(brush, DefaultBrush);
                return _this;
            }
            PolySprite.prototype.addPolygon = function (polygon) {
                if (!this._path) {
                    this._path = new Path2D();
                }
                this._path.addPath(polygon.path);
                var dw = this.deltaLineWidth;
                this.addW((function (value) { return Math.max(value, polygon.box.right) + dw; }).bind(this));
                this.addH((function (value) { return Math.max(value, polygon.box.bottom) + dw; }).bind(this));
            };
            PolySprite.prototype.isPointHit = function (play_ground, point) {
                assert(this._path);
                play_ground.context2d.beginPath();
                var current_transform = play_ground.context2d.getTransform();
                play_ground.context2d.setTransform(current_transform.a, current_transform.b, current_transform.c, current_transform.d, current_transform.e + this.x, current_transform.f + this.y);
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
                play_ground.context2d.setTransform(current_transform.a, current_transform.b, current_transform.c, current_transform.d, toInt(current_transform.e + this.x + dw), toInt(current_transform.f + this.y + dw));
                this.onDraw(play_ground, this._path);
                play_ground.context2d.setTransform(current_transform);
            };
            PolySprite.prototype.reset = function () {
                delete this._path;
            };
            Object.defineProperty(PolySprite.prototype, "deltaLineWidth", {
                get: function () {
                    return this.lineWidth.value ? (this.lineWidth.value / 2) : 0;
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
            Debug.dot = function (play_groun, x, y) {
                play_groun.context2d.beginPath();
                play_groun.context2d.moveTo(x, y);
                play_groun.context2d.fillStyle = "Red";
                play_groun.context2d.arc(x, y, 5, 0, Math.PI * 2);
                play_groun.context2d.closePath();
                play_groun.context2d.fill();
            };
            return Debug;
        }());
        Sprite_1.Debug = Debug;
    })(Sprite = Geoma.Sprite || (Geoma.Sprite = {}));
})(Geoma || (Geoma = {}));
var Geoma;
(function (Geoma) {
    var Tools;
    (function (Tools) {
        var makeProp = Geoma.Utils.makeProp;
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
            DocumentSprite.prototype.mouseClick = function (event) {
            };
            DocumentSprite.prototype.mouseMove = function (event) {
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
        var TapIndicator = (function (_super) {
            __extends(TapIndicator, _super);
            function TapIndicator(document, delay_time, activate_time, line_width, radius, brush) {
                var _this = this;
                var stub = (function (_super) {
                    __extends(stub, _super);
                    function stub() {
                        return _super !== null && _super.apply(this, arguments) || this;
                    }
                    stub.prototype.innerDraw = function (play_ground) {
                        throw new Error("Method not implemented.");
                    };
                    return stub;
                }(Geoma.Sprite.Sprite));
                _this = _super.call(this, document, new stub()) || this;
                _this._mouseUp = makeProp(false);
                _this._delayTime = makeProp(delay_time, 0);
                _this._activateTime = makeProp(activate_time, 0);
                _this._lineWidth = makeProp(line_width, 0);
                _this._radius = makeProp(radius, 0);
                _this._brush = makeProp(brush, "Black");
                _this._startTicks = Tools.Document.getTicks();
                _this._activated = false;
                return _this;
            }
            Object.defineProperty(TapIndicator.prototype, "activated", {
                get: function () {
                    return this._activated;
                },
                enumerable: false,
                configurable: true
            });
            TapIndicator.prototype.innerDraw = function (play_ground) {
                var dt = Math.abs(this._startTicks - Tools.Document.getTicks()) - this._delayTime.value;
                if (dt > 0) {
                    var point = play_ground.mousePoint;
                    play_ground.context2d.beginPath();
                    play_ground.context2d.strokeStyle = this._brush.value;
                    play_ground.context2d.lineWidth = this._lineWidth.value;
                    play_ground.context2d.shadowColor = Tools.CurrentTheme.TapShadowColor;
                    play_ground.context2d.shadowBlur = Tools.CurrentTheme.TapShadowBlure;
                    var duration = this._activateTime.value - this._delayTime.value;
                    var radius = Math.cos(Math.PI * dt / duration - Math.PI / 2) * this._radius.value;
                    if (dt >= duration) {
                        if (!this._mouseUp.value) {
                            this._activated = true;
                        }
                        play_ground.context2d.shadowColor = "rgba(0,0,0,0)";
                        play_ground.context2d.shadowBlur = 0;
                        return;
                    }
                    play_ground.context2d.arc(point.x, point.y, radius, 0, Math.PI * 2, false);
                    play_ground.context2d.lineWidth = 2;
                    play_ground.context2d.stroke();
                    play_ground.context2d.shadowColor = "rgba(0,0,0,0)";
                    play_ground.context2d.shadowBlur = 0;
                }
            };
            return TapIndicator;
        }(DocumentSprite));
        Tools.TapIndicator = TapIndicator;
    })(Tools = Geoma.Tools || (Geoma.Tools = {}));
})(Geoma || (Geoma = {}));
var Geoma;
(function (Geoma) {
    var Tools;
    (function (Tools) {
        var DefaultThemeStyle = (function () {
            function DefaultThemeStyle() {
                this.name = "DefaultTheme";
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
                this.ActiveLineBrush = "SandyBrown";
                this.ActiveLineSelectBrush = "Lime";
                this.ActiveLineMouseThickness = 5;
                this.ActiveLineCaclThickness = 0.1;
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
                this.AngleIndicatorPrecision = 0;
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
                this.FormulaSampleTextBrush = "SandyBrown";
                this.FormulaSampleTextStyle = {
                    font: "12px Consolas", textBaseline: "hanging", direction: "inherit", textAlign: "left"
                };
            }
            return DefaultThemeStyle;
        }());
        var BlueThemeStyle = (function () {
            function BlueThemeStyle() {
                this.name = "BlueTheme";
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
                this.ActiveLineBrush = "DarkSlateGray";
                this.ActiveLineSelectBrush = "OrangeRed";
                this.ActiveLineMouseThickness = 5;
                this.ActiveLineCaclThickness = 0.1;
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
                this.AngleIndicatorPrecision = 0;
                this.BisectorBrush = "DarkSlateGray";
                this.BisectorSelectionBrush = "OrangeRed";
                this.BisectorLineWidth = 1;
                this.FormulaEditorBackgroundBrush = "PeachPuff";
                this.FormulaSampleTextBrush = "Gray";
                this.FormulaSampleTextStyle = {
                    font: "12px Consolas", textBaseline: "hanging", direction: "inherit", textAlign: "left"
                };
            }
            return BlueThemeStyle;
        }());
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
                _this._line = new Geoma.Sprite.Polyline(x - radius, y - radius, line_width, makeMod(_this, function () { return _this.selected ? select_line_brush_prop.value : line_brush_prop.value; }));
                _this._line.addPolygon(ellipse);
                _this.item.push(bg);
                _this.item.push(_this._line);
                return _this;
            }
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
            Object.defineProperty(ActivePointBase.prototype, "right", {
                get: function () {
                    return this.item.last.right;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(ActivePointBase.prototype, "bottom", {
                get: function () {
                    return this._line.bottom;
                },
                enumerable: false,
                configurable: true
            });
            ActivePointBase.prototype.setName = function (value, brush, style) {
                assert(!this.name);
                assert(value);
                var name_text = new Geoma.Sprite.Text(this.right + 5, this.y, 0, 0, brush, style, value);
                this.item.push(name_text);
                this.item.name = value;
            };
            ActivePointBase.prototype.serialize = function (context) {
                assert(false);
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
                expander.addX(function () { return _this.first.right - expander.w - 5; });
                _this.item.push(expander);
                _this._subMenu = new Menu(_this.document, makeMod(_this, function () { return _this.right; }), makeMod(_this, function () { return _this.top - _this._subMenu.padding; }));
                _this._subMenu.addVisible(makeMod(_this, function () { return _this.selected; }));
                return _this;
            }
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
                    _super.prototype.dispose.call(this);
                }
            };
            MenuGroup.prototype.innerDraw = function (play_ground) {
                _super.prototype.innerDraw.call(this, play_ground);
                this._subMenu.draw(play_ground);
            };
            MenuGroup.prototype.mouseClick = function (event) {
                this.mouseMove(event);
                _super.prototype.mouseClick.call(this, event);
            };
            MenuGroup.prototype.mouseMove = function (event) {
                _super.prototype.mouseMove.call(this, event);
                if (this.enabled.value) {
                    this.selected = this.selected || (this._subMenu.visible && this._subMenu.mouseHit(event));
                }
            };
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
            function Menu(document, x, y) {
                var _this = _super.call(this, document, new Tools.Container()) || this;
                _this.padding = 3;
                _this._hasGroupExpander = false;
                _this._dx = 0;
                _this._dy = 0;
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
                return _this;
            }
            Object.defineProperty(Menu.prototype, "clientW", {
                get: function () {
                    assert(false, "Logical error");
                    return 0;
                },
                enumerable: false,
                configurable: true
            });
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
                this.document.closeMenu(this);
            };
            Menu.prototype.mouseClick = function (event) {
                if (this.visible) {
                    if (this.mouseHit(event)) {
                        event.cancelBubble = true;
                    }
                    else {
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
                }
                _super.prototype.mouseClick.call(this, event);
            };
            Menu.prototype.mouseMove = function (event) {
                if (this.visible && this.mouseHit(event)) {
                    event.cancelBubble = true;
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
                if (this.bottom > play_ground.bottom) {
                    this._dy = this.bottom - play_ground.bottom + 10;
                }
                if (this.right > play_ground.right) {
                    this._dx = this.right - play_ground.right + 10;
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
        var Point = Geoma.Utils.Point;
        var ToolBase = (function (_super) {
            __extends(ToolBase, _super);
            function ToolBase(document, x, y, radius, line_width, name) {
                var _this = _super.call(this, document, x, y, radius, line_width, function () { return Tools.CurrentTheme.ToolBrush; }, function () { return Tools.CurrentTheme.ToolLineBrush; }, function () { return Tools.CurrentTheme.ToolSelectLineBrush; }) || this;
                _this.setName(name, function () { return Tools.CurrentTheme.ToolNameBrush; }, function () { return Tools.CurrentTheme.ToolNameStyle; });
                return _this;
            }
            return ToolBase;
        }(Tools.ActivePointBase));
        var PointTool = (function (_super) {
            __extends(PointTool, _super);
            function PointTool(document, x, y, radius, line_width) {
                if (radius === void 0) { radius = 5; }
                if (line_width === void 0) { line_width = 2; }
                var _this = _super.call(this, document, x, y, radius, line_width, "Создать") || this;
                _this._picked = false;
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
                var menu_item = menu.addMenuItem("Создать точку");
                menu_item.onChecked.bind(this, function () { return document.addPoint(Point.make(x, y)); });
                menu_item = menu.addMenuItem("Создать отрезок...");
                menu_item.onChecked.bind(this, function () { return document.setLineSegmentState(new Tools.ActivePoint(document, x, y)); });
                menu_item.enabled.addModifier(makeMod(this, function () { return document.points.length > 0; }));
                menu_item = menu.addMenuItem("Создать функцию...");
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
                return _super.call(this, document, x, y, radius, line_width, "Файл") || this;
            }
            Object.defineProperty(FileTool, "LocalStorageKeys", {
                get: function () {
                    var names = [];
                    for (var i = 0; i < window.localStorage.length; i++) {
                        var doc_name = window.localStorage.key(i);
                        if (doc_name != null) {
                            names.push(doc_name);
                        }
                    }
                    names.sort(Geoma.Utils.CompareCaseInsensitive);
                    return names;
                },
                enumerable: false,
                configurable: true
            });
            FileTool.prototype.mouseClick = function (event) {
                if (this.mouseHit(event) && this.document.canShowMenu(this)) {
                    var x = this.boundingBox.right;
                    var y = this.boundingBox.bottom;
                    var menu = new Tools.Menu(this.document, x, y);
                    var open_group = menu.addMenuGroup("Открыть");
                    var menu_item = menu.addMenuItem("Сохранить...");
                    menu_item.onChecked.bind(this, this.saveCommand);
                    menu_item = menu.addMenuItem("Копировать");
                    menu_item.onChecked.bind(this, this.copyCommand);
                    var delete_group = menu.addMenuGroup("Удалить");
                    for (var _i = 0, _a = FileTool.LocalStorageKeys; _i < _a.length; _i++) {
                        var name_1 = _a[_i];
                        if (name_1 == SettingsTool.settingsKey) {
                            continue;
                        }
                        menu_item = open_group.addMenuItem(name_1);
                        menu_item.onChecked.bind(this, this.openCommand);
                        menu_item = delete_group.addMenuItem(name_1);
                        menu_item.onChecked.bind(this, this.removeCommand);
                    }
                    menu.show();
                }
            };
            FileTool.prototype.openCommand = function (event) {
                var data = window.localStorage.getItem(event.detail.tooltip);
                if (data && data.length) {
                    this.document.open(data);
                    this.document.name = event.detail.tooltip;
                }
                else {
                    this.document.alert("\u0424\u0430\u0439\u043B\u0430 " + event.detail.tooltip + " \u0431\u043E\u043B\u044C\u0448\u0435 \u043D\u0435\u0442");
                    this.removeCommand(event);
                }
            };
            FileTool.prototype.removeCommand = function (event) {
                window.localStorage.removeItem(event.detail.tooltip);
            };
            FileTool.prototype.saveCommand = function () {
                var data = this.document.save();
                var save_name = this.document.prompt("\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u0438\u043C\u044F \u0434\u043E\u043A\u0443\u043C\u0435\u043D\u0442\u0430");
                if (save_name != null) {
                    window.localStorage.setItem(save_name, data);
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
                if (window.prompt("\u0421\u043A\u043E\u043F\u0438\u0440\u0443\u0439\u0442\u0435 \u0442\u0435\u043A\u0441\u0442 \u0441\u0441\u044B\u043B\u043A\u0438", data) != null) {
                    this.document.copyToClipboard(data).catch(function (error) {
                        _this.document.alert(error.message);
                    });
                }
            };
            return FileTool;
        }(ToolBase));
        Tools.FileTool = FileTool;
        var SettingsTool = (function (_super) {
            __extends(SettingsTool, _super);
            function SettingsTool(document, x, y, radius, line_width) {
                if (radius === void 0) { radius = 5; }
                if (line_width === void 0) { line_width = 2; }
                var _this = _super.call(this, document, x, y, radius, line_width, "Настройки") || this;
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
                }
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
                    var x = this.boundingBox.right;
                    var y = this.boundingBox.bottom;
                    var menu = new Tools.Menu(this.document, x, y);
                    var menu_group = menu.addMenuGroup("Тема");
                    var menu_item = menu_group.addMenuItem("Голубая");
                    menu_item.onChecked.bind(this, function () { return _this.setTheme(Tools.BlueTheme); });
                    menu_item = menu_group.addMenuItem("По умолчанию");
                    menu_item.onChecked.bind(this, function () { return _this.setTheme(Tools.DefaultTheme); });
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
            SettingsTool.settingsKey = "{7EB35B62-34AA-4F82-A0EC-283197A8E04E}";
            SettingsTool._settingsVersion = 1;
            return SettingsTool;
        }(ToolBase));
        Tools.SettingsTool = SettingsTool;
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
                _this._mouseDownListener = _this.document.mouseArea.onMouseDown.bind(_this, _this.mouseDown);
                _this._mouseUpListener = _this.document.mouseArea.onMouseUp.bind(_this, _this.mouseUp);
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
            Button.prototype.dispose = function () {
                if (!this.disposed) {
                    this._mouseDownListener.dispose();
                    this._mouseUpListener.dispose();
                    _super.prototype.dispose.call(this);
                }
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
            Button.prototype.mouseUp = function (event) {
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
                    stub.prototype.innerDraw = function (play_ground) {
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
                var x0 = args[0], y0 = args[1], x1 = args[2], y1 = args[3];
                if (args.length == 4) {
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
                else if (args.length == 6) {
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
                else {
                    assert(false);
                }
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
            ActiveLineBase.prototype.mouseHit = function (point) {
                return this.visible && Tools.PointLine.intersected(point, this._startPoint, this._endPoint, Tools.CurrentTheme.ActiveLineMouseThickness);
            };
            ActiveLineBase.prototype.setLength = function (value, fix_point) {
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
            ActiveLineBase.prototype.setAngle = function (value, pivot_point) {
                assert(false, "Not implemented yet");
            };
            ActiveLineBase.prototype.through = function (p) {
                assert(this.belongs(p));
                if (!Tools.PointLine.intersected(p, this.startPoint, this.endPoint, Tools.CurrentTheme.ActiveLineCaclThickness)) {
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
            ActiveLineBase.prototype.addPoint = function (point) {
                assert(false, "Not implemented yet");
            };
            ActiveLineBase.prototype.removePoint = function (point) {
                assert(false, "Not implemented yet");
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
        var toInt = Geoma.Utils.toInt;
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
            ActivePoint.prototype.moved = function (receiptor) {
                return this._moved.get(receiptor);
            };
            ActivePoint.prototype.dispose = function () {
                if (!this.disposed) {
                    this._mouseDownListener.dispose();
                    this._mouseUpListener.dispose();
                    _super.prototype.dispose.call(this);
                }
            };
            ActivePoint.prototype.move = function (dx, dy) {
                this._dx -= dx;
                this._dy -= dy;
                this._moved.set();
            };
            ActivePoint.prototype.serialize = function (context) {
                var data = [];
                data.push(this.x.toFixed(2));
                data.push(this.y.toFixed(2));
                data.push(this.name);
                return data;
            };
            ActivePoint.prototype.setName = function (value, brush, style) {
                if (brush === void 0) { brush = function () { return Tools.CurrentTheme.AdornerNameBrush; }; }
                if (style === void 0) { style = function () { return Tools.CurrentTheme.AdornerNameStyle; }; }
                _super.prototype.setName.call(this, value, brush, style);
                var text = this.item.last;
                text.strokeBrush.value = Tools.CurrentTheme.AdornerStrokeBrush;
                text.strokeWidth.value = Tools.CurrentTheme.AdornerStrokeWidth;
                text.addX(makeMod(this, this.dxModifier));
                text.addY(makeMod(this, this.dyModifier));
            };
            ActivePoint.deserialize = function (context, data, index) {
                if (data.length > (index + 2)) {
                    var point = new ActivePoint(context.document, toInt(data[index]), toInt(data[index + 1]));
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
                        var menu_item = menu.addMenuItem("Провести отрезок...");
                        menu_item.onChecked.bind(this, function () { return doc_1.setLineSegmentState(_this); });
                        menu_item = menu.addMenuItem("Провести окружность из центра...");
                        menu_item.onChecked.bind(this, function () { return doc_1.setCirclRadiusState(_this); });
                        menu_item = menu.addMenuItem("Провести окружность на диаметре...");
                        menu_item.onChecked.bind(this, function () { return doc_1.setCirclDiameterState(_this); });
                        menu_item = menu.addMenuItem("Удалить точку");
                        menu_item.onChecked.bind(this, function () { return doc_1.removePoint(_this); });
                        menu.show();
                    }
                }
            };
            ActivePoint.prototype.mouseMove = function (event) {
                if (this._dragStart && event.buttons != 0) {
                    var dpos = Point.sub(this._dragStart, event);
                    if (dpos.x != 0 || dpos.y != 0) {
                        this.move(dpos.x, dpos.y);
                    }
                    this._dragStart = event;
                    event.cancelBubble = true;
                }
                _super.prototype.mouseMove.call(this, event);
            };
            ActivePoint.prototype.mouseDown = function (event) {
                if (this.mouseHit(event)) {
                    this._dragStart = event;
                }
            };
            ActivePoint.prototype.mouseUp = function (event) {
                if (this._dragStart) {
                    delete this._dragStart;
                }
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
            ActiveCommonPoint.prototype.dispose = function () {
                if (!this.disposed) {
                    _super.prototype.dispose.call(this);
                    if (this._intersection) {
                        this._intersection.dispose();
                        delete this._intersection;
                    }
                    for (var i = 0; i < this.document.points.length; i++) {
                        var point = this.document.points.item(i);
                        if (!point.disposed &&
                            point instanceof ActiveCommonPoint &&
                            point.groupNo == this.groupNo &&
                            point.mouseHit(this)) {
                            this.document.removePoint(point);
                            break;
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
            ActiveCommonPoint.prototype.addSegment = function (segment) {
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
                    this.addSegment(line);
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
                    var point = new ActiveCommonPoint(context.document, toInt(data[index]), toInt(data[index + 1]), group_no);
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
                if (line_width === void 0) { line_width = Tools.CurrentTheme.ActiveLineWidth; }
                if (brush === void 0) { brush = Tools.CurrentTheme.ActiveLineBrush; }
                if (selected_brush === void 0) { selected_brush = Tools.CurrentTheme.ActiveLineSelectBrush; }
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
                    var p1 = this.start;
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
            Object.defineProperty(ActiveLineSegment.prototype, "moved", {
                get: function () {
                    return this.start.moved(this.name) || this.end.moved(this.name);
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
            ActiveLineSegment.prototype.belongs = function (p1) {
                if (this.startPoint == p1 || this.endPoint == p1) {
                    return true;
                }
                else if (this._points) {
                    for (var _i = 0, _a = this._points; _i < _a.length; _i++) {
                        var point = _a[_i];
                        if (p1 == point) {
                            return true;
                        }
                    }
                }
                return false;
            };
            ActiveLineSegment.prototype.setParallelTo = function (other_segment) {
                var parallel_line = other_segment;
                var q1 = this.quadrant;
                var q2 = parallel_line.quadrant;
                switch (q2) {
                    case 1:
                        switch (q1) {
                            case 1:
                            case 2:
                                this.setAngle(parallel_line.angle);
                                break;
                            case 3:
                            case 4:
                                this.setAngle(parallel_line.angle - Math.PI);
                                break;
                        }
                        break;
                    case 2:
                        switch (q1) {
                            case 1:
                            case 2:
                                this.setAngle(parallel_line.angle);
                                break;
                            case 3:
                            case 4:
                                this.setAngle(parallel_line.angle, this.end);
                                break;
                        }
                        break;
                    case 3:
                        switch (q1) {
                            case 1:
                            case 2:
                                this.setAngle(parallel_line.angle, this.end);
                                break;
                            case 3:
                            case 4:
                                this.setAngle(parallel_line.angle - Math.PI, this.end);
                                break;
                        }
                        break;
                    case 4:
                        switch (q1) {
                            case 1:
                            case 2:
                                this.setAngle(parallel_line.angle, this.end);
                                break;
                            case 3:
                            case 4:
                                this.setAngle(parallel_line.angle - Math.PI, this.end);
                                break;
                        }
                        break;
                }
            };
            ActiveLineSegment.prototype.setPerpendicularTo = function (other_segment) {
                var perpendicular_line = other_segment;
                var common_point = other_segment.belongs(this.start) ? this.start : this.end;
                assert(other_segment.belongs(common_point));
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
                var start, end;
                if (pivot_point) {
                    start = pivot_point;
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
                var l = this.length;
                var x1 = start.x + Math.cos(value) * l;
                var y1 = start.y + Math.sin(value) * l;
                end.move(end.x - x1, end.y - y1);
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
                if (!this.disposed) {
                    this._mouseDownListener.dispose();
                    this._mouseUpListener.dispose();
                    if (this._beforeDrawListener) {
                        this._beforeDrawListener.dispose();
                    }
                    if (this._points) {
                        for (var _i = 0, _a = this._points; _i < _a.length; _i++) {
                            var point = _a[_i];
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
                assert(!this.belongs(point));
                assert(this.mouseHit(point));
                if (!this._points) {
                    this._points = [];
                }
                this._points.push(point);
            };
            ActiveLineSegment.prototype.removePoint = function (point) {
                assert(this.belongs(point));
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
                            point.addSegment(line);
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
                if (this._dragStart && event.buttons != 0) {
                    var dpos = Point.sub(this._dragStart, event);
                    if (dpos.x != 0 || dpos.y != 0) {
                        this.move(dpos.x, dpos.y);
                    }
                    this._dragStart = event;
                    event.cancelBubble = true;
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
                        var exists_other_segments = makeMod(this, function () { return doc_2.lineSegments.length > 1; });
                        var menu_item = menu.addMenuItem("Обозначить угол...");
                        menu_item.onChecked.bind(this, function () { return doc_2.setAngleIndicatorState(_this, event); });
                        menu_item.enabled.addModifier(exists_other_segments);
                        menu_item = menu.addMenuItem("Показать биссектрису угла...");
                        menu_item.onChecked.bind(this, function () { return doc_2.setBisectorState(_this, event); });
                        menu_item.enabled.addModifier(exists_other_segments);
                        menu_item = menu.addMenuItem("Задать размер...");
                        menu_item.onChecked.bind(this, function () {
                            var value = _this.document.prompt("\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u0440\u0430\u0437\u043C\u0435\u0440 \u0432 \u043F\u0438\u043A\u0441\u0435\u043B\u044F\u0445", Geoma.Utils.toInt(_this.length).toString());
                            if (value != null) {
                                var length_1 = Geoma.Utils.toInt(toInt(value));
                                if (length_1) {
                                    _this.setLength(length_1);
                                }
                                else {
                                    _this.document.alert("\u0412\u0432\u0435\u0434\u0435\u043D \u043D\u0435\u0434\u043E\u043F\u0443\u0441\u0442\u0438\u043C\u044B\u0439 \u0440\u0430\u0437\u043C\u0435\u0440 " + value);
                                }
                            }
                        });
                        menu_item.enabled.addModifier(makeMod(this, function () { return !_this.fixedLength; }));
                        menu_item = menu.addMenuItem(makeMod(this, function () { return _this.fixedLength ? "\u0418\u0437\u043C\u0435\u043D\u044F\u0435\u043C\u044B\u0439 \u0440\u0430\u0437\u043C\u0435\u0440" : "\u0424\u0438\u043A\u0441\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0439 \u0440\u0430\u0437\u043C\u0435\u0440"; }));
                        menu_item.onChecked.bind(this, this.fixedLength ? this.makeFree : this.makeFixed);
                        menu_item = menu.addMenuItem("Сделать ||...");
                        menu_item.onChecked.bind(this, function () { return doc_2.setParallelLineState(_this); });
                        menu_item.enabled.addModifier(exists_other_segments);
                        menu_item = menu.addMenuItem("Сделать ⟂...");
                        menu_item.onChecked.bind(this, function () { return doc_2.setPerpendicularLineState(_this); });
                        menu_item.enabled.addModifier(exists_other_segments);
                        menu_item = menu.addMenuItem("Добавить точку");
                        menu_item.onChecked.bind(this, function () { return doc_2.addPoint(Point.make(x_1, y_1)); });
                        menu_item = menu.addMenuItem("\u0423\u0434\u0430\u043B\u0438\u0442\u044C \u043F\u0440\u044F\u043C\u0443\u044E " + this.name);
                        menu_item.onChecked.bind(this, function () { return doc_2.removeLineSegment(_this); });
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
            ActiveLineSegment.prototype.mouseUp = function (event) {
                if (this._dragStart) {
                    delete this._dragStart;
                }
            };
            ActiveLineSegment.prototype.beforeDraw = function (event) {
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
        var assert = Geoma.Utils.assert;
        var BisectorLine = (function (_super) {
            __extends(BisectorLine, _super);
            function BisectorLine(angle_indicator, line_width, brush, selected_brush) {
                if (line_width === void 0) { line_width = Tools.CurrentTheme.BisectorLineWidth; }
                if (brush === void 0) { brush = Tools.CurrentTheme.BisectorBrush; }
                if (selected_brush === void 0) { selected_brush = Tools.CurrentTheme.BisectorSelectionBrush; }
                var _this = this;
                var pivot = (function () {
                    function pivot(angle_indicator, start) {
                        this._angleIndicator = angle_indicator;
                        this._start = start;
                    }
                    Object.defineProperty(pivot.prototype, "x", {
                        get: function () {
                            var i = this._angleIndicator;
                            var a = this._start ? i.bisectorAngle : i.bisectorAngle - Math.PI;
                            var x = i.commonPivot.x;
                            var w = i.document.mouseArea.w;
                            var h = i.document.mouseArea.h;
                            var r = Math.sqrt(w * w + h * h);
                            return Math.cos(a) * r + x;
                        },
                        enumerable: false,
                        configurable: true
                    });
                    Object.defineProperty(pivot.prototype, "y", {
                        get: function () {
                            var i = this._angleIndicator;
                            var a = this._start ? i.bisectorAngle : i.bisectorAngle - Math.PI;
                            var y = i.commonPivot.y;
                            var w = i.document.mouseArea.w;
                            var h = i.document.mouseArea.h;
                            var r = Math.sqrt(w * w + h * h);
                            return Math.sin(a) * r + y;
                        },
                        enumerable: false,
                        configurable: true
                    });
                    return pivot;
                }());
                _this = _super.call(this, angle_indicator.document, new pivot(angle_indicator, true), new pivot(angle_indicator, false), line_width, brush, selected_brush) || this;
                _this._angleIndicator = angle_indicator;
                return _this;
            }
            Object.defineProperty(BisectorLine.prototype, "moved", {
                get: function () {
                    return this._angleIndicator.segment1.moved || this._angleIndicator.segment2.moved;
                },
                enumerable: false,
                configurable: true
            });
            BisectorLine.prototype.move = function (dx, dy) {
                assert(false, "Not implemented yet");
            };
            BisectorLine.prototype.belongs = function (p1) {
                return this._angleIndicator.commonPivot == p1;
            };
            BisectorLine.prototype.mouseClick = function (event) {
                var _this = this;
                if (this.mouseHit(event)) {
                    var doc = this.document;
                    if (doc.canShowMenu(this)) {
                        var x = doc.mouseArea.mousePoint.x;
                        var y = doc.mouseArea.mousePoint.y;
                        var menu = new Tools.Menu(doc, x, y);
                        var menu_item = menu.addMenuItem("Удалить биссектрису");
                        menu_item.onChecked.bind(this, function () { return _this._angleIndicator.removeBisector(_this); });
                        menu.show();
                    }
                }
                _super.prototype.mouseClick.call(this, event);
            };
            return BisectorLine;
        }(Tools.ActiveLineBase));
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
                    stub.prototype.innerDraw = function (play_ground) {
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
                if (!this.disposed) {
                    this._mouseDownListener.dispose();
                    this._mouseUpListener.dispose();
                    _super.prototype.dispose.call(this);
                }
            };
            ActiveCircleLine.prototype.isPivot = function (point) {
                return this._point1 == point || this._point2 == point;
            };
            ActiveCircleLine.prototype.belongs = function (point) {
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
                return Tools.PointCircle.isIntersected(point, this, Tools.CurrentTheme.ActiveLineMouseThickness);
            };
            ActiveCircleLine.prototype.addPoint = function (point) {
                assert(!this.belongs(point));
                assert(this.mouseHit(point));
                if (!this._points) {
                    this._points = [];
                }
                this._points.push(point);
            };
            ActiveCircleLine.prototype.removePoint = function (point) {
                assert(this.belongs(point));
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
                        point.addSegment(circle);
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
                if (this._dragStart && event.buttons != 0) {
                    var dpos = Point.sub(this._dragStart, event);
                    if (dpos.x != 0 || dpos.y != 0) {
                        this.move(dpos.x, dpos.y);
                    }
                    this._dragStart = event;
                    event.cancelBubble = true;
                }
                this.selected = this.mouseHit(event);
                _super.prototype.mouseMove.call(this, event);
            };
            ActiveCircleLine.prototype.mouseClick = function (event) {
                var _this = this;
                if (this.mouseHit(event)) {
                    var doc_3 = this.document;
                    if (doc_3.canShowMenu(this)) {
                        var x_2 = doc_3.mouseArea.mousePoint.x;
                        var y_2 = doc_3.mouseArea.mousePoint.y;
                        var menu = new Tools.Menu(doc_3, x_2, y_2);
                        var menu_item = menu.addMenuItem("\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0442\u043E\u0447\u043A\u0443");
                        menu_item.onChecked.bind(this, function () { return doc_3.addPoint(Point.make(x_2, y_2)); });
                        menu_item = menu.addMenuItem("\u0423\u0434\u0430\u043B\u0438\u0442\u044C \u043E\u043A\u0440\u0443\u0436\u043D\u043E\u0441\u0442\u044C " + this.name);
                        menu_item.onChecked.bind(this, function () { return doc_3.removeCircleLine(_this); });
                        menu.show();
                    }
                }
            };
            ActiveCircleLine.prototype.mouseDown = function (event) {
                if (this.mouseHit(event)) {
                    this._dragStart = event;
                }
            };
            ActiveCircleLine.prototype.mouseUp = function (event) {
                if (this._dragStart) {
                    delete this._dragStart;
                }
            };
            return ActiveCircleLine;
        }(Tools.DocumentSprite));
        Tools.ActiveCircleLine = ActiveCircleLine;
    })(Tools = Geoma.Tools || (Geoma.Tools = {}));
})(Geoma || (Geoma = {}));
var factorialCache = [];
function factorial(value) {
    if (!factorialCache.length) {
        factorialCache.push(1);
        for (var i = 1; i <= 100; i++) {
            factorialCache.push(factorialCache[factorialCache.length - 1] * i);
        }
    }
    if (value > 100) {
        return Infinity;
    }
    else if (value >= 0) {
        return factorialCache[Geoma.Utils.toInt(value)];
    }
    else {
        return NaN;
    }
}
function derivative(id, line, code) {
    var f = line.getFunction(id);
    if (f) {
        var last_x = line.arg(id + "_x");
        var last_y = line.arg(id + "_y");
        var current_x = line.arg("x");
        var current_y = f(current_x);
        line.setArg(id + "_x", current_x);
        line.setArg(id + "_y", current_y);
        if (last_x < current_x) {
            return (current_y - last_y) / (current_x - last_x);
        }
        else {
            return NaN;
        }
    }
    else {
        line.addFunction(id, code);
        var f_1 = line.getFunction(id);
        Geoma.Utils.assert(f_1);
        var current_x = line.arg("x");
        var current_y = f_1(current_x);
        line.addArg(id + "_x", current_x);
        line.addArg(id + "_y", current_y);
        return NaN;
    }
}
var Geoma;
(function (Geoma) {
    var Tools;
    (function (Tools) {
        var makeMod = Geoma.Utils.makeMod;
        var makeProp = Geoma.Utils.makeProp;
        var toInt = Geoma.Utils.toInt;
        var Point = Geoma.Utils.Point;
        var assert = Geoma.Utils.assert;
        var CodeElement = (function () {
            function CodeElement() {
            }
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
            CodeElement.error = new Error("Невозможно восстановить данные");
            return CodeElement;
        }());
        Tools.CodeElement = CodeElement;
        var CodeDefinitionElement = (function (_super) {
            __extends(CodeDefinitionElement, _super);
            function CodeDefinitionElement() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            return CodeDefinitionElement;
        }(CodeElement));
        Tools.CodeDefinitionElement = CodeDefinitionElement;
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
                    return "" + this._argName;
                },
                enumerable: false,
                configurable: true
            });
            return CodeArgument;
        }(CodeDefinitionElement));
        Tools.CodeArgument = CodeArgument;
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
            return CodeLiteral;
        }(CodeDefinitionElement));
        Tools.CodeLiteral = CodeLiteral;
        var CodeArgumentX = (function (_super) {
            __extends(CodeArgumentX, _super);
            function CodeArgumentX() {
                return _super.call(this, "x") || this;
            }
            return CodeArgumentX;
        }(CodeArgument));
        Tools.CodeArgumentX = CodeArgumentX;
        Math.sinh;
        Math.cosh;
        Math.tanh;
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
                    if (this._operand instanceof CodeBlock) {
                        return "" + this._function + this._operand.text;
                    }
                    else if (this._operand.text.length > 0 && this._operand.text.charAt(0) == "(") {
                        return "" + this._function + this._operand.text;
                    }
                    else {
                        return this._function + "(" + this._operand.text + ")";
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
            CodeUnary._functionNo = 1;
            return CodeUnary;
        }(CodeElement));
        Tools.CodeUnary = CodeUnary;
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
                            return "Math.pow(" + this._operand2.code + ", 1.0 / " + this._operand1.code + ")";
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
                    switch (this._function) {
                        case "pow":
                            return "(" + this._operand1.text + " ^ " + this._operand2.text + ")";
                        case "n√":
                            return "(" + this._operand1.text + "\u221A " + this._operand2.text + ")";
                        case "+":
                            return "(" + this._operand1.text + " + " + this._operand2.text + ")";
                        case "-":
                            return "(" + this._operand1.text + " - " + this._operand2.text + ")";
                        case "*":
                            return "(" + this._operand1.text + " * " + this._operand2.text + ")";
                        case "÷":
                            return "(" + this._operand1.text + " / " + this._operand2.text + ")";
                        default:
                            assert(false, "Math function " + this._function + " not supported");
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
            return CodeBinary;
        }(CodeElement));
        Tools.CodeBinary = CodeBinary;
        var CodeBlock = (function (_super) {
            __extends(CodeBlock, _super);
            function CodeBlock(element) {
                var _this = _super.call(this) || this;
                _this._element = element;
                return _this;
            }
            Object.defineProperty(CodeBlock.prototype, "code", {
                get: function () {
                    return "(" + this._element.code + ")";
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(CodeBlock.prototype, "text", {
                get: function () {
                    return "(" + this._element.text + ")";
                },
                enumerable: false,
                configurable: true
            });
            return CodeBlock;
        }(CodeElement));
        Tools.CodeBlock = CodeBlock;
        var ParametricLine = (function (_super) {
            __extends(ParametricLine, _super);
            function ParametricLine(document, line_width, brush, selected_brush, axes) {
                var _this = this;
                var stub = (function (_super) {
                    __extends(stub, _super);
                    function stub() {
                        return _super !== null && _super.apply(this, arguments) || this;
                    }
                    stub.prototype.innerDraw = function (play_ground) {
                        throw new Error("Method not implemented.");
                    };
                    return stub;
                }(Geoma.Sprite.Sprite));
                _this = _super.call(this, document, new stub()) || this;
                _this.axes = axes;
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
                return _this;
            }
            Object.defineProperty(ParametricLine.prototype, "dx", {
                get: function () {
                    return this._dx;
                },
                set: function (value) {
                    this._dx = value;
                    delete this._drawPath;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(ParametricLine.prototype, "code", {
                get: function () {
                    var _a;
                    return (_a = this._code) !== null && _a !== void 0 ? _a : new CodeLiteral(0);
                },
                set: function (value) {
                    this._code = value;
                    this._function = Geoma.Utils.makeEvaluator(this, this._code.code);
                    this._derivativeLevel = ParametricLine.derivativeLevel(this._code);
                    delete this._drawPath;
                },
                enumerable: false,
                configurable: true
            });
            ParametricLine.prototype.dispose = function () {
                if (!this.disposed) {
                    this._mouseDownListener.dispose();
                    this._mouseUpListener.dispose();
                    if (this.selected) {
                        this.document.removeSelectedSprite(this);
                    }
                    _super.prototype.dispose.call(this);
                }
            };
            ParametricLine.prototype.screenY = function (screen_x) {
                if (screen_x >= 0 && screen_x < this._screenSamples.length) {
                    return this._screenSamples[toInt(screen_x)];
                }
                else {
                    for (var x = screen_x - (this._derivativeLevel * 2); x < screen_x; x++) {
                        this.getY(this.axes.fromScreenX(x));
                    }
                    return this.axes.toScreenY(this.getY(this.axes.fromScreenX(screen_x)));
                }
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
                delete this._drawPath;
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
                        assert(false);
                        break;
                    default:
                        assert(this._args[name]);
                        this._args[name].value = value;
                        delete this._drawPath;
                        break;
                }
            };
            ParametricLine.prototype.mouseHit = function (point) {
                return Tools.PointParametric.intersected(point, this, Tools.CurrentTheme.ActiveLineMouseThickness);
            };
            ParametricLine.prototype.move = function (dx, dy) {
                this.axes.move(dx, dy);
            };
            ParametricLine.prototype.moved = function (receiptor) {
                return this.axes.moved(receiptor);
            };
            ParametricLine.prototype.showExpressionEditor = function () {
                var _this = this;
                var dialog = new Tools.ExpressionDialog(this.document, makeMod(this, function () { return _this.document.mouseArea.x + _this.document.mouseArea.w / 2 - _this.document.mouseArea.w / 10; }), makeMod(this, function () { return _this.document.mouseArea.y + _this.document.mouseArea.h / 2 - _this.document.mouseArea.h / 10; }), this.code);
                dialog.onEnter.bind(this, function (event) {
                    if (event.detail) {
                        _this.code = event.detail;
                    }
                    _this.document.remove(dialog);
                    dialog.dispose();
                });
                this.document.push(dialog);
            };
            ParametricLine.prototype.belongs = function (point) {
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
                assert(!this.belongs(point));
                assert(this.mouseHit(point));
                if (!this._points) {
                    this._points = [];
                }
                this._points.push(point);
            };
            ParametricLine.prototype.removePoint = function (point) {
                assert(this.belongs(point));
                assert(this._points);
                var index = this._points.indexOf(point);
                assert(index >= 0);
                this._points.splice(index, 1);
                point.removeSegment(this);
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
                    var line = new ParametricLine(context.document, function () { return Tools.CurrentTheme.ActiveLineWidth; }, function () { return Tools.CurrentTheme.ActiveLineBrush; }, function () { return Tools.CurrentTheme.ActiveLineSelectBrush; }, context.data.axes.item(toInt(data[index++])));
                    var points = new Array();
                    while (data[index].charAt(0) == "p") {
                        var chunck = data[index++];
                        var p_index = toInt(chunck.substring(1));
                        var point = context.data.points.item(p_index);
                        assert(point instanceof Tools.ActiveCommonPoint);
                        points.push(point);
                    }
                    if (data[index++] == "f") {
                        line.code = CodeElement.deserialize(data, index).code;
                    }
                    if (points.length) {
                        line.updateSamples(context.document.mouseArea.h);
                        for (var _i = 0, points_1 = points; _i < points_1.length; _i++) {
                            var point = points_1[_i];
                            point.addSegment(line);
                            line.addPoint(point);
                        }
                    }
                    return line;
                }
            };
            ParametricLine.derivativeLevel = function (element, level) {
                if (level === void 0) { level = 0; }
                if (element instanceof CodeUnary) {
                    if (element.function == "f'") {
                        return ParametricLine.derivativeLevel(element.operand, level + 1);
                    }
                    else {
                        return ParametricLine.derivativeLevel(element.operand, level);
                    }
                }
                else if (element instanceof CodeBinary) {
                    var result1 = ParametricLine.derivativeLevel(element.operand1, level);
                    var result2 = ParametricLine.derivativeLevel(element.operand2, level);
                    return Math.max(result1, result2);
                }
                else {
                    return level;
                }
            };
            ParametricLine.prototype.updateSamples = function (height) {
                var _this = this;
                var needs_move = false;
                var draw_path = new Path2D();
                var samples = new Array();
                var dx = this.dx;
                var minimum_dx = 1e-11;
                var offscreen_top = -height;
                var offscreen_bottom = 2 * height;
                var line_to = function (x, y) {
                    if (needs_move) {
                        needs_move = false;
                        draw_path.moveTo(x, y);
                    }
                    else {
                        draw_path.lineTo(x, y);
                    }
                    var integer_x = toInt(x);
                    assert(samples.length > integer_x);
                    samples[integer_x] = y;
                };
                var contains_derivative = this._derivativeLevel != 0;
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
                        draw_path.moveTo(x, offscreen_top);
                    }
                    else {
                        draw_path.moveTo(x, offscreen_bottom);
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
                        var y1 = _this.axes.toScreenY(_this.getY(_this.axes.fromScreenX(x1)));
                        if (isNaN(y1)) {
                            x1 -= local_dx;
                            local_dx /= 2;
                            x1 -= local_dx;
                            if (local_dx <= minimum_dx) {
                                for (; x1 > start_x; x1 -= local_dx) {
                                    var y2 = _this.axes.toScreenY(_this.getY(_this.axes.fromScreenX(x1)));
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
                        var y1 = _this.axes.toScreenY(_this.getY(_this.axes.fromScreenX(x1)));
                        if (isNaN(y1)) {
                            x1 += local_dx;
                            local_dx /= 2;
                            x1 += local_dx;
                            if (local_dx <= minimum_dx) {
                                for (; x1 < x; x1 += local_dx) {
                                    var y2 = _this.axes.toScreenY(_this.getY(_this.axes.fromScreenX(x1)));
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
                var last_sign = 0;
                var last_is_nan = true;
                var last_y = NaN;
                for (var x = 0; x < this.document.mouseArea.w; x += dx) {
                    var integer_x = samples.length == Math.floor(x);
                    var y = this.axes.toScreenY(this.getY(this.axes.fromScreenX(x)));
                    if (integer_x) {
                        samples.push(NaN);
                    }
                    if (isNaN(y)) {
                        if (!last_is_nan) {
                            last_is_nan = true;
                            if (!contains_derivative) {
                                right_nan(x);
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
                                var y1 = this.axes.toScreenY(this.getY(this.axes.fromScreenX(x1)));
                                if (is_infinite(y1)) {
                                    line_to_offscreen(x, last_sign, y1);
                                    offscreen_break = true;
                                    break;
                                }
                                else if ((last_sign == 1 && last_y > y1) || (last_sign == -1 && last_y < y1)) {
                                    x1 -= local_dx;
                                    local_dx /= 2;
                                    x1 -= local_dx;
                                    if ((last_sign == 1 && y1 <= offscreen_top) || (last_sign == -1 && y1 >= offscreen_bottom)) {
                                        line_to_offscreen(x, last_sign, y1);
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
                            left_nan(x);
                        }
                        last_is_nan = false;
                    }
                    last_y = y;
                }
                assert(samples.length == this.document.mouseArea.w, "Logical error");
                this._drawPath = draw_path;
                this._screenSamples = samples;
            };
            ParametricLine.prototype.innerDraw = function (play_ground) {
                if (this.axes.needsCalc.get(this.code.text) || !this._drawPath) {
                    this.updateSamples(play_ground.h);
                    assert(this._drawPath);
                }
                play_ground.context2d.strokeStyle = this.selected ? this.selectedBrush.value : this.brush.value;
                play_ground.context2d.lineWidth = this.lineWidth.value;
                play_ground.context2d.stroke(this._drawPath);
            };
            ParametricLine.prototype.axesHit = function (event) {
                return this.axes.visible && this.axes.mouseHit(event);
            };
            ParametricLine.prototype.mouseClick = function (event) {
                var _this = this;
                if (this.mouseHit(event)) {
                    var doc_4 = this.document;
                    if (doc_4.canShowMenu(this)) {
                        var x_3 = doc_4.mouseArea.mousePoint.x;
                        var y_3 = doc_4.mouseArea.mousePoint.y;
                        var menu = new Tools.Menu(doc_4, x_3, y_3);
                        var menu_item = menu.addMenuItem("\u0422\u043E\u0447\u043D\u043E\u0441\u0442\u044C...");
                        menu_item.onChecked.bind(this, function () {
                            var dx = _this.document.promptNumber("\u041F\u0440\u0438\u0440\u0430\u0449\u0435\u043D\u0438\u0435 \u0430\u0440\u0433\u0443\u043C\u0435\u043D\u0442\u0430 x \u0444\u0443\u043D\u043A\u0446\u0438\u0438 " + _this.code.text, _this.dx);
                            if (dx != undefined && dx != null) {
                                _this.dx = dx;
                            }
                        });
                        menu_item = menu.addMenuItem("Масштаб по осям x/y...");
                        menu_item.onChecked.bind(this.axes, this.axes.scaleDialog);
                        menu_item = menu.addMenuItem("\u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0444\u0443\u043D\u043A\u0446\u0438\u044E f = " + this.code.text + " ...");
                        menu_item.onChecked.bind(this, this.showExpressionEditor);
                        menu_item = menu.addMenuItem("\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0442\u043E\u0447\u043A\u0443");
                        menu_item.onChecked.bind(this, function () { return doc_4.addPoint(Point.make(x_3, y_3)); });
                        menu_item = menu.addMenuItem("\u0423\u0434\u0430\u043B\u0438\u0442\u044C \u043F\u0440\u044F\u043C\u0443\u044E " + this.name);
                        menu_item.onChecked.bind(this, function () { return doc_4.removeParametricLine(_this); });
                        menu.show();
                    }
                }
                _super.prototype.mouseClick.call(this, event);
            };
            ParametricLine.prototype.mouseMove = function (event) {
                _super.prototype.mouseMove.call(this, event);
                this.selected = this.mouseHit(event);
                if (this._dragStart && event.buttons != 0) {
                    var dpos = Point.sub(this._dragStart, event);
                    if (dpos.x != 0 || dpos.y != 0) {
                        this.move(dpos.x, dpos.y);
                    }
                    this._dragStart = event;
                    event.cancelBubble = true;
                }
            };
            ParametricLine.prototype.mouseDown = function (event) {
                if (this.mouseHit(event) || this.axesHit(event)) {
                    this._dragStart = event;
                }
            };
            ParametricLine.prototype.mouseUp = function (event) {
                if (this._dragStart) {
                    delete this._dragStart;
                }
            };
            ParametricLine.prototype.getY = function (x) {
                this._argX = x;
                this._argY = this._function();
                return this._argY;
            };
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
                this._disposed = false;
                this._startPoint = start_point;
            }
            Object.defineProperty(Intersection.prototype, "dx", {
                get: function () {
                    return this.startPoint.x - this.point.x;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(Intersection.prototype, "dy", {
                get: function () {
                    return this.startPoint.y - this.point.y;
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
                        return PointLine.intersection(point, line1.startPoint, line1.endPoint);
                    }
                    else if (line1 instanceof Tools.ActiveCircleLine) {
                        return PointCircle.intersection(point, line1);
                    }
                    else if (line1 instanceof Tools.ParametricLine) {
                        return PointParametric.intersection(point, line1);
                    }
                }
                else if (line1 instanceof Tools.ActiveLineBase) {
                    if (line2 instanceof Tools.ActiveLineBase) {
                        return LineLine.intersection(line1, line2);
                    }
                    else if (line2 instanceof Tools.ActiveCircleLine) {
                        var intersection = LineCircle.intersection(line1, line2);
                        return LineCircle.preferredIntersection(LineCircle.getPreference(point, intersection), intersection);
                    }
                }
                else if (line1 instanceof Tools.ActiveCircleLine) {
                    if (line2 instanceof Tools.ActiveLineBase) {
                        var intersection = LineCircle.intersection(line2, line1);
                        return LineCircle.preferredIntersection(LineCircle.getPreference(point, intersection), intersection);
                    }
                }
                assert(false, "Not supported");
            };
            Intersection.makeIntersection = function (point, line1, line2) {
                if (line2 == undefined) {
                    if (line1 instanceof Tools.ActiveLineSegment) {
                        return new PointLine(point, line1);
                    }
                    else if (line1 instanceof Tools.ActiveCircleLine) {
                        return new PointCircle(point, line1);
                    }
                    else if (line1 instanceof Tools.ParametricLine) {
                        return new PointParametric(point, line1);
                    }
                }
                else if (line1 instanceof Tools.ActiveLineBase) {
                    if (line2 instanceof Tools.ActiveLineSegment) {
                        return new LineLine(point, line1, line2);
                    }
                    else if (line2 instanceof Tools.ActiveCircleLine) {
                        return new LineCircle(point, line1, line2);
                    }
                }
                else if (line1 instanceof Tools.ActiveCircleLine) {
                    if (line2 instanceof Tools.ActiveLineSegment) {
                        return new LineCircle(point, line2, line1);
                    }
                }
                assert(false, "Not supported");
            };
            Intersection.prototype.dispose = function () {
                this._disposed = true;
            };
            Intersection.prototype.move = function (dx, dy) {
                assert(false, "Not supported");
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
        var PointLine = (function (_super) {
            __extends(PointLine, _super);
            function PointLine(point, line) {
                var _this = _super.call(this, PointLine.intersection(point, line.startPoint, line.endPoint)) || this;
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
                var new_pos = Point.sub(this.point, Point.make(dx, dy));
                var dp = Point.sub(new_pos, this._line.startPoint);
                var length = Math.sqrt(dp.x * dp.x + dp.y * dp.y);
                if (length < this._line.length) {
                    this._startRatio = length / this._line.length;
                }
            };
            PointLine.intersection = function (point, line_start, line_end) {
                var c = Tools.ActiveLineBase.getCoefficients(line_start.x, line_start.y, line_end.x, line_end.y);
                if (c) {
                    return Point.make(point.x, Tools.ActiveLineBase.getY(point.x, c));
                }
                else {
                    return Point.make(line_start.x, Geoma.Utils.limit(point.y, line_start.y, line_end.y));
                }
            };
            PointLine.intersected = function (point, line_start, line_end, sensitivity) {
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
            return PointLine;
        }(Intersection));
        Tools.PointLine = PointLine;
        var LineLine = (function (_super) {
            __extends(LineLine, _super);
            function LineLine(point, line1, line2) {
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
                var coeff1 = line1.coefficients;
                var coeff2 = line2.coefficients;
                if (coeff1 && coeff2) {
                    var dk = coeff1.k - coeff2.k;
                    if (dk) {
                        var x = (coeff2.b - coeff1.b) / dk;
                        return Point.make(x, Tools.ActiveLineBase.getY(x, coeff1));
                    }
                    else {
                        assert(false, "todo");
                    }
                }
                else if (coeff1) {
                    return Point.make(line2.startPoint.x, Tools.ActiveLineBase.getY(line2.startPoint.x, coeff1));
                }
                else if (coeff2) {
                    return Point.make(line1.startPoint.x, Tools.ActiveLineBase.getY(line1.startPoint.x, coeff2));
                }
                else {
                    return Point.make(line1.startPoint.x, line1.startPoint.y);
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
                            if (PointLine.intersected(p1, line.startPoint, line.endPoint, Tools.CurrentTheme.ActiveLineCaclThickness)) {
                                ret.p1 = p1;
                            }
                        }
                        {
                            var x = (w - Math.sqrt(d)) / k2_1;
                            var y = Tools.ActiveLineBase.getY(x, coeff);
                            var p2 = Point.make(x, y);
                            if (PointLine.intersected(p2, line.startPoint, line.endPoint, Tools.CurrentTheme.ActiveLineCaclThickness)) {
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
                        if (PointLine.intersected(Point.make(x1, p1y), line.startPoint, line.endPoint, Tools.CurrentTheme.ActiveLineCaclThickness)) {
                            ret.p1 = Point.make(x1, p1y);
                        }
                        if (PointLine.intersected(Point.make(x1, p2y), line.startPoint, line.endPoint, Tools.CurrentTheme.ActiveLineCaclThickness)) {
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
            return LineCircle;
        }(Intersection));
        Tools.LineCircle = LineCircle;
        var PointParametric = (function (_super) {
            __extends(PointParametric, _super);
            function PointParametric(point, line) {
                var _this = _super.call(this, PointParametric.intersection(point, line)) || this;
                _this._line = line;
                _this._startX = line.axes.fromScreenX(_this.startPoint.x);
                _this._intersection = makeProp(makeMod(_this, function () {
                    var x = _this._line.axes.toScreenX(_this._startX);
                    var y = _this._line.screenY(x);
                    return PointParametric.intersection(Point.make(x, y), _this._line);
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
            PointParametric.prototype.move = function (dx, dy) {
                var x = this._line.axes.toScreenX(this._startX) - dx;
                this._startX = this._line.axes.fromScreenX(x);
            };
            PointParametric.intersection = function (point, line) {
                var y = line.screenY(point.x);
                return Point.make(point.x, y);
            };
            PointParametric.intersected = function (point, line, sensitivity) {
                assert(sensitivity);
                var y = line.screenY(point.x);
                if (Math.abs(point.y - y) <= sensitivity) {
                    return true;
                }
                else {
                    for (var x = Math.floor(point.x - sensitivity / 2); x < Math.ceil(point.x + sensitivity / 2);) {
                        var p1 = Point.make(x, line.screenY(x));
                        x++;
                        var p2 = Point.make(x, line.screenY(x));
                        if (PointLine.intersected(point, p1, p2, sensitivity)) {
                            return true;
                        }
                    }
                    return false;
                }
            };
            return PointParametric;
        }(Intersection));
        Tools.PointParametric = PointParametric;
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
                    stub.prototype.innerDraw = function (play_ground) {
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
                _this._needsCalc = new Geoma.Utils.Pulse();
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
            Object.defineProperty(AxesLines.prototype, "needsCalc", {
                get: function () {
                    return this._needsCalc;
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
                if (Math.abs(point.y - this.y) <= Tools.CurrentTheme.ActiveLineMouseThickness ||
                    Math.abs(point.x - this.x) <= Tools.CurrentTheme.ActiveLineMouseThickness) {
                    return true;
                }
                else if (this._adorners.visible) {
                    var margins = AxesLines._adornerMargins + Tools.CurrentTheme.ActiveLineMouseThickness;
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
                this._moved.set();
            };
            AxesLines.prototype.moved = function (receiptor) {
                return this._moved.get(receiptor);
            };
            AxesLines.prototype.serialize = function (context) {
                var data = [];
                data.push("" + this.axesId);
                data.push("" + this.x.toFixed(2));
                data.push("" + this.y.toFixed(2));
                data.push("" + this.kX);
                data.push("" + this.kY);
                return data;
            };
            AxesLines.prototype.scaleDialog = function () {
                var scale;
                if (this.kX == this.kY) {
                    scale = 1 / this.kX;
                    if (scale > 1) {
                        scale = toInt(scale);
                    }
                }
                var new_scale = this.document.promptNumber("\u041C\u0430\u0441\u0448\u0442\u0430\u0431 \u043F\u043E \u043E\u0441\u044F\u043C x/y, %", scale);
                if (new_scale != undefined) {
                    this.kX = 1 / new_scale;
                    this.kY = 1 / new_scale;
                    return true;
                }
                else {
                    return false;
                }
            };
            AxesLines.deserialize = function (context, data, index) {
                if (data.length < (index + 5)) {
                    return null;
                }
                else {
                    var axes = new AxesLines(context.document, toInt(data[index++]), toInt(data[index++]), toInt(data[index++]), parseFloat(data[index++]), parseFloat(data[index++]), function () { return Tools.CurrentTheme.AxesWidth; }, function () { return Tools.CurrentTheme.AxesBrush; }, function () { return Tools.CurrentTheme.AxesSelectBrush; });
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
            AxesLines.prototype.beforeDraw = function (event) {
                if (this._lastX != this.x ||
                    this._lastY != this.y ||
                    this._lastKx != this.kX ||
                    this._lastKy != this.kY ||
                    this._lastW != this.document.mouseArea.w ||
                    this._lastH != this.document.mouseArea.h) {
                    this._lastX = this.x;
                    this._lastY = this.y;
                    this._lastKx = this.kX;
                    this._lastKy = this.kY;
                    this._lastW = this.document.mouseArea.w;
                    this._lastH = this.document.mouseArea.h;
                    this._needsCalc.set();
                }
            };
            AxesLines.prototype.innerDraw = function (play_ground) {
                play_ground.context2d.beginPath();
                play_ground.context2d.moveTo(0, this.y);
                play_ground.context2d.lineTo(play_ground.right, this.y);
                play_ground.context2d.moveTo(this.x, 0);
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
                    var bar_text_margin = 2;
                    {
                        var x_coord = -toInt(this.x / dx);
                        var start_x = this.x + x_coord * dx;
                        x_coord *= grade_x.value;
                        var end_x = play_ground.w + 1;
                        var digits = Math.abs(grade_x.mantiss);
                        var y1 = void 0, y2 = void 0, y3 = void 0;
                        if (this.y >= 0) {
                            if (this.y < (play_ground.h - 2 * scale_bar_size)) {
                                y1 = this.y - scale_bar_size / 2;
                                y2 = this.y + scale_bar_size / 2;
                                y3 = this.y + scale_bar_size / 2 + bar_text_margin;
                            }
                            else {
                                y1 = play_ground.h - scale_bar_size;
                                y2 = play_ground.h;
                                y3 = y1 - scale_bar_size;
                            }
                        }
                        else {
                            y1 = 0;
                            y2 = scale_bar_size;
                            y3 = scale_bar_size + bar_text_margin;
                        }
                        for (var x = start_x; x <= end_x; x += dx) {
                            play_ground.context2d.moveTo(x, y1);
                            play_ground.context2d.lineTo(x, y2);
                            play_ground.context2d.fillText(x_coord.toFixed(digits), x, y3);
                            x_coord += grade_x.value;
                        }
                    }
                    {
                        var y_coord = toInt(this.y / dy);
                        var start_y = this.y - y_coord * dy;
                        y_coord *= grade_y.value;
                        var end_y = play_ground.h + 1;
                        var digits = Math.abs(grade_y.mantiss);
                        var x1 = void 0, x2 = void 0, x3 = void 0;
                        if (this.x >= 0) {
                            if (this.x < (play_ground.w - 2 * scale_bar_size)) {
                                x1 = this.x - scale_bar_size / 2;
                                x2 = this.x + scale_bar_size / 2;
                                x3 = this.x + scale_bar_size / 2 + bar_text_margin;
                            }
                            else {
                                x1 = play_ground.w - scale_bar_size;
                                x2 = play_ground.w;
                                x3 = NaN;
                            }
                        }
                        else {
                            x1 = 0;
                            x2 = scale_bar_size;
                            x3 = scale_bar_size + bar_text_margin;
                        }
                        for (var y = start_y; y <= end_y; y += dy) {
                            if (Math.abs(y - this.y) > dy / 2) {
                                var y_text = y_coord.toFixed(digits);
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
                                assert(this._axes);
                                if (this._axes._adorners.visible) {
                                    this._axes.kX *= this._x_multiplier;
                                    this._axes.kY *= this._y_multiplier;
                                    return true;
                                }
                                else {
                                    return false;
                                }
                            };
                            return ZoomButton;
                        }(Tools.Button));
                        var x_4 = this.x;
                        var y_4 = this.y;
                        var mod_x = makeMod(this, function () { return event.x + AxesLines._adornerMargins + _this.x - x_4; });
                        var mod_y = makeMod(this, function () { return event.y - AxesLines._adornerMargins + _this.y - y_4; });
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
                    var doc_5 = this.document;
                    if (doc_5.canShowMenu(this)) {
                        var x_5 = doc_5.mouseArea.mousePoint.x;
                        var y_5 = doc_5.mouseArea.mousePoint.y;
                        var menu = new Tools.Menu(doc_5, x_5, y_5);
                        var menu_item = menu.addMenuItem("Масштаб по осям x/y...");
                        menu_item.onChecked.bind(this, this.scaleDialog);
                        menu_item = menu.addMenuItem("Создать функцию...");
                        menu_item.onChecked.bind(this, function () { return _this.document.addParametricLine(Point.make(x_5, y_5), _this); });
                        var lines = this.document.getParametricLines(this);
                        if (lines.length == 1) {
                            var line = lines[0];
                            menu_item = menu.addMenuItem("\u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0444\u0443\u043D\u043A\u0446\u0438\u044E f = " + line.code.text + " ...");
                            menu_item.onChecked.bind(line, line.showExpressionEditor);
                        }
                        else if (lines.length > 1) {
                            var group = menu.addMenuGroup("Редактировать функцию");
                            for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
                                var line = lines_1[_i];
                                menu_item = group.addMenuItem("f = " + line.code.text + " ...");
                                menu_item.onChecked.bind(line, line.showExpressionEditor);
                            }
                        }
                        menu_item = menu.addMenuItem("\u0423\u0434\u0430\u043B\u0438\u0442\u044C \u043A\u043E\u043E\u0440\u0434\u0438\u043D\u0430\u0442\u043D\u0443\u044E \u043F\u043B\u043E\u0441\u043A\u043E\u0441\u0442\u044C");
                        menu_item.onChecked.bind(this, function () { return doc_5.removeAxes(_this); });
                        menu.show();
                    }
                }
                _super.prototype.mouseClick.call(this, event);
            };
            AxesLines._adornerMargins = 10;
            return AxesLines;
        }(Tools.DocumentSprite));
        Tools.AxesLines = AxesLines;
    })(Tools = Geoma.Tools || (Geoma.Tools = {}));
})(Geoma || (Geoma = {}));
var Geoma;
(function (Geoma) {
    var Tools;
    (function (Tools) {
        var makeMod = Geoma.Utils.makeMod;
        var assert = Geoma.Utils.assert;
        var MulticastEvent = Geoma.Utils.MulticastEvent;
        var MenuButton = (function (_super) {
            __extends(MenuButton, _super);
            function MenuButton(document, x, y, text, textBrush, horizontal_padding, vertical_padding) {
                if (horizontal_padding === void 0) { horizontal_padding = 10; }
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
                        item.onChecked.bind(this, function () { return _this._owner._codeElement = new Tools.CodeArgumentX(); });
                        item = menu.addMenuItem("123");
                        item.onChecked.bind(this, function () {
                            var number = _this.document.promptNumber("\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u0447\u0438\u0441\u043B\u043E");
                            if (number) {
                                _this._owner._codeElement = new Tools.CodeLiteral(number);
                            }
                        });
                        var group = menu.addMenuGroup("abc");
                        var stripe;
                        for (var i = 0; i < ArgButton._paramaterNames.length; i++) {
                            if (i % 6 == 0) {
                                stripe = group.addMenuStrip();
                            }
                            var index = i;
                            var menu_item = stripe.addMenuItem(" " + ArgButton._paramaterNames.charAt(index) + " ");
                            menu_item.onChecked.bind(this, function (item) { return _this._owner._codeElement = new Tools.CodeArgument(item.detail.tooltip); });
                        }
                    };
                    ArgButton._paramaterNames = "abcdefhgiklmnoprst";
                    return ArgButton;
                }(MenuButton));
                _this._codeElement = new Tools.CodeArgumentX();
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
            function CodeUnaryPresenter(document, x, y) {
                var _this = _super.call(this, document) || this;
                var UnaryButton = (function (_super) {
                    __extends(UnaryButton, _super);
                    function UnaryButton(owner, x, y) {
                        var _this = _super.call(this, owner.document, x, y, function () { return owner._function; }) || this;
                        _this._owner = owner;
                        return _this;
                    }
                    UnaryButton.prototype.onShowMenu = function (menu) {
                        var _this = this;
                        var functions = ["sin", "cos", "tan",
                            "arcsin", "arccos", "arctan",
                            "ln", "log2", "log10",
                            "exp", "√", "∛", "∜", "sign", "abs",
                            "sinh", "cosh", "tanh",
                            "arcsinh", "arccosh", "arctanh",
                            "!", "f'"];
                        var _loop_1 = function (unary_function) {
                            menu.addMenuItem(unary_function).onChecked.bind(this_1, function () { return _this._owner._function = unary_function; });
                        };
                        var this_1 = this;
                        for (var _i = 0, functions_1 = functions; _i < functions_1.length; _i++) {
                            var unary_function = functions_1[_i];
                            _loop_1(unary_function);
                        }
                    };
                    return UnaryButton;
                }(MenuButton));
                var button = new UnaryButton(_this, x, y);
                var left_bracket = new CodeLabel(document, function () { return button.right; }, function () { return button.y; }, "(", 0);
                var placeholder = new CodePlaceholder(document, function () { return left_bracket.right; }, y);
                var right_bracket = new CodeLabel(document, function () { return placeholder.right; }, function () { return placeholder.y; }, ")", 0);
                left_bracket.addPairedLabel(right_bracket);
                right_bracket.addPairedLabel(left_bracket);
                _this._function = "sin";
                _this.item.push(button);
                _this.item.push(left_bracket);
                _this.item.push(placeholder);
                _this.item.push(right_bracket);
                return _this;
            }
            Object.defineProperty(CodeUnaryPresenter.prototype, "codeElement", {
                get: function () {
                    return new Tools.CodeUnary(this._function, this.placeholder.codeElement);
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
                        var _loop_2 = function (binary_function) {
                            menu.addMenuItem(binary_function).onChecked.bind(this_2, function () { return _this._owner._function = binary_function; });
                        };
                        var this_2 = this;
                        for (var _i = 0, functions_2 = functions; _i < functions_2.length; _i++) {
                            var binary_function = functions_2[_i];
                            _loop_2(binary_function);
                        }
                    };
                    return BinaryButton;
                }(MenuButton));
                var left_bracket = new CodeLabel(document, x, y, "(", 0);
                var operand1 = new CodePlaceholder(document, function () { return left_bracket.right; }, y);
                var button = new BinaryButton(_this, function () { return operand1.right; }, function () { return operand1.y; });
                var operand2 = new CodePlaceholder(document, function () { return button.right; }, function () { return button.y; });
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
                    return new Tools.CodeBinary(operand1.codeElement, this._function, operand2.codeElement);
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
            function CodePlaceholder(document, x, y) {
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
                        var item = menu.addMenuItem("{arg}");
                        item.onChecked.bind(this, function () { return _this._owner.setPresenter(new CodeArgumentPresenter(document, x_mod, y_mod)); });
                        item = menu.addMenuItem("f(u)");
                        item.onChecked.bind(this, function () { return _this._owner.setPresenter(new CodeUnaryPresenter(document, x_mod, y_mod)); });
                        item = menu.addMenuItem("f(u, v)");
                        item.onChecked.bind(this, function () { return _this._owner.setPresenter(new CodeBinaryPresenter(document, x_mod, y_mod)); });
                        item = menu.addMenuItem("\u03C8{ f() }");
                        item.onChecked.bind(this, function () {
                            var expression = new Tools.CodeUnary("sin", _this._owner.codeElement);
                            var presenter = new CodeUnaryPresenter(document, x_mod, y_mod);
                            presenter.codeElement = expression;
                            _this._owner.setPresenter(presenter);
                        });
                        item = menu.addMenuItem("\u03C8{ f(), v }");
                        item.onChecked.bind(this, function () {
                            var expression = new Tools.CodeBinary(_this._owner.codeElement, "+", new Tools.CodeArgumentX());
                            var presenter = new CodeBinaryPresenter(document, x_mod, y_mod);
                            presenter.codeElement = expression;
                            _this._owner.setPresenter(presenter);
                        });
                        item = menu.addMenuItem("\u03C8{ u, f() }");
                        item.onChecked.bind(this, function () {
                            var expression = new Tools.CodeBinary(new Tools.CodeArgumentX(), "+", _this._owner.codeElement);
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
                    if (value instanceof Tools.CodeArgumentX || value instanceof Tools.CodeArgument || value instanceof Tools.CodeLiteral) {
                        var presenter = new CodeArgumentPresenter(this.document, x_mod, y_mod);
                        presenter.codeElement = value;
                        this.setPresenter(presenter);
                    }
                    else if (value instanceof Tools.CodeUnary) {
                        var presenter = new CodeUnaryPresenter(this.document, x_mod, y_mod);
                        presenter.codeElement = value;
                        this.setPresenter(presenter);
                    }
                    else if (value instanceof Tools.CodeBinary) {
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
                        return _this;
                    }
                    OkButton.prototype.onClick = function () {
                        this._editor.onEnter.emitEvent(new CustomEvent("ExpressionEditorEvent", { cancelable: false, detail: this._editor._code.codeElement }));
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
                var background = new Geoma.Sprite.Rectangle(x, y, 1, 1, function () { return Tools.CurrentTheme.FormulaEditorBackgroundBrush; });
                var x_mod = makeMod(_this, function () { return background.x + _this._padding; });
                var code = new CodePlaceholder(document, x_mod, makeMod(_this, function () { return background.y + _this._padding; }));
                var text = new Geoma.Sprite.Text(x_mod, makeMod(_this, function () { return code.bottom + _this._padding; }), 0, 0, function () { return Tools.CurrentTheme.FormulaSampleTextBrush; }, function () { return Tools.CurrentTheme.FormulaSampleTextStyle; }, function () {
                    var text = code.codeElement.text;
                    if (text.length > 0 && text.charAt(0) == "(") {
                        return "y = " + text.substr(1, text.length - 2);
                    }
                    else {
                        return "y = " + text;
                    }
                });
                var y_mod = makeMod(_this, function () { return text.bottom + _this._padding; });
                var ok = new OkButton(_this, x_mod, y_mod);
                var cancel = new CancelButton(_this, makeMod(_this, function () { return ok.right + _this._padding; }), y_mod);
                background.addW(makeMod(_this, function () { return Math.max(code.right, cancel.right) - background.left + _this._padding; }));
                background.addH(makeMod(_this, function () { return cancel.bottom - background.top + _this._padding; }));
                _this.onEnter = new MulticastEvent();
                _this._code = code;
                _this.item.push(background);
                _this.item.push(code);
                _this.item.push(text);
                _this.item.push(ok);
                _this.item.push(cancel);
                if (expression) {
                    code.codeElement = expression;
                }
                return _this;
            }
            ExpressionDialog.prototype.mouseMove = function (event) {
                if (this.mouseHit(event)) {
                    event.cancelBubble = true;
                }
                _super.prototype.mouseMove.call(this, event);
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
            }
            DocumentData.prototype.dispose = function (container) {
                this.points.dispose();
                this.lines.dispose();
                this.angles.dispose();
                this.circles.dispose();
                this.parametric.dispose();
                this.axes.dispose();
                if (container) {
                    container.remove(this.parametric);
                    container.remove(this.axes);
                    container.remove(this.circles);
                    container.remove(this.lines);
                    container.remove(this.angles);
                    container.remove(this.points);
                }
            };
            DocumentData.prototype.initialize = function (container) {
                container.push(this.parametric);
                container.push(this.axes);
                container.push(this.circles);
                container.push(this.lines);
                container.push(this.angles);
                container.push(this.points);
            };
            return DocumentData;
        }());
        var Document = (function (_super) {
            __extends(Document, _super);
            function Document(mouse_area) {
                var _this = _super.call(this) || this;
                _this._selectedSprites = new Array();
                Geoma.Utils.InitializeCalcRevision();
                _this._mouseArea = mouse_area;
                _this._tools = new Geoma.Sprite.Container();
                _this._data = new DocumentData();
                _this._groupNo = 0;
                _this.push(new Tools.Background(_this));
                _this._data.initialize(_this);
                _this.push(_this._tools);
                var tool_radius = 20;
                var tool_line_width = 5;
                var tool_y = 40;
                var tool_padding = 10;
                _this._pointTool = new Tools.PointTool(_this, 40, tool_y, tool_radius, tool_line_width);
                _this._tools.push(_this._pointTool);
                var file_tool = new Tools.FileTool(_this, 0, tool_y, tool_radius, tool_line_width);
                file_tool.addX(makeMod(_this, function (value) { return value + _this._pointTool.right + tool_radius + tool_padding; }));
                _this._tools.push(file_tool);
                var settings_tool = new Tools.SettingsTool(_this, 0, tool_y, tool_radius, tool_line_width);
                settings_tool.addX(makeMod(_this, function (value) { return value + _this.mouseArea.w / 2; }));
                _this._tools.push(settings_tool);
                var doc_name = new Geoma.Sprite.Text(0, tool_y, 0, 0, function () { return Tools.CurrentTheme.MenuItemTextBrush; }, function () { return Tools.CurrentTheme.MenuItemTextStyle; }, makeMod(_this, function () { return _this.name; }));
                doc_name.addX(makeMod(_this, function () { return Math.max(_this.mouseArea.x + _this.mouseArea.w - doc_name.w - tool_padding, settings_tool.right + tool_padding); }));
                _this._tools.push(doc_name);
                var tools_separator = new Geoma.Sprite.Polyline(0, _this._tools.bottom + 10, 1, function () { return Tools.CurrentTheme.ToolSeparatorBrush; });
                tools_separator.addPolygon(new Geoma.Polygon.Line(Point.make(0, 0), Point.make(8000, 0)));
                _this._tools.push(tools_separator);
                _this._mouseClickBinder = mouse_area.onMouseClick.bind(_this, _this.mouseClick, true);
                _this._mouseDownBinder = mouse_area.onMouseDown.bind(_this, _this.mouseDown, true);
                _this._mouseUpBinder = mouse_area.onMouseUp.bind(_this, _this.mouseUp, true);
                var save_data = document.location.hash;
                if (save_data != null && save_data.length && save_data[0] == "#") {
                    var data = decodeURI(save_data.substring(1));
                    _this.open(data);
                }
                return _this;
            }
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
            Object.defineProperty(Document.prototype, "lineSegments", {
                get: function () {
                    return this._data.lines;
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
            Document.prototype.alert = function (message) {
                window.alert(message);
            };
            Document.prototype.mouseClick = function (event) {
                var _a, _b;
                if (this._tooltip) {
                    this._tooltip.dispose();
                    delete this._tooltip;
                }
                if (this._state) {
                    try {
                        switch (this._state.action) {
                            case "line segment":
                                {
                                    var end_point = (_a = this.getPoint(event)) !== null && _a !== void 0 ? _a : this.addPoint(event);
                                    assert(end_point);
                                    this.execLineSegmentState(end_point);
                                }
                                break;
                            case "angle indicator":
                                {
                                    var other_segment = this.getLineSegment(event);
                                    if (other_segment) {
                                        this.execAngleIndicatorState(other_segment, event);
                                    }
                                }
                                break;
                            case "bisector":
                                {
                                    var other_segment = this.getLineSegment(event);
                                    if (other_segment) {
                                        this.execBisectorState(other_segment, event);
                                    }
                                }
                                break;
                            case "parallel":
                                {
                                    var other_segment = this.getLineSegment(event);
                                    if (other_segment) {
                                        this.execParallelLineState(other_segment);
                                    }
                                }
                                break;
                            case "perpendicular":
                                {
                                    var other_segment = this.getLineSegment(event);
                                    if (other_segment) {
                                        this.execPerpendicularLineState(other_segment);
                                    }
                                }
                                break;
                            case "circle radius":
                            case "circle diameter":
                                {
                                    var end_point = (_b = this.getPoint(event)) !== null && _b !== void 0 ? _b : this.addPoint(event);
                                    assert(end_point);
                                    var radius = this._state.action == "circle radius";
                                    this.execCircleState(end_point, radius ? Tools.CircleLineKind.Radius : Tools.CircleLineKind.Diameter);
                                }
                                break;
                            default:
                                assert(false);
                        }
                        event.cancelBubble = true;
                        delete this._state;
                    }
                    catch (ex) {
                        delete this._state;
                        window.alert(ex);
                    }
                }
            };
            Document.prototype.mouseDown = function (event) {
                if (this._tapTool) {
                    this._tools.remove(this._tapTool);
                    delete this._tapTool;
                }
                if (event.y > this._tools.bottom && this._selectedSprites.length == 0) {
                    this._tapTool = new Tools.TapIndicator(this, Tools.CurrentTheme.TapDelayTime, Tools.CurrentTheme.TapActivateTime, Tools.CurrentTheme.TapLineWidth, Tools.CurrentTheme.TapRadius, Tools.CurrentTheme.TapBrush);
                    this._tools.push(this._tapTool);
                }
            };
            Document.prototype.mouseUp = function (event) {
                if (this._tapTool) {
                    this._tapTool._mouseUp.value = true;
                }
            };
            Document.prototype.canShowMenu = function (sprite) {
                return !this._contextMenu && !this._state && this._selectedSprites.indexOf(sprite) != -1;
            };
            Document.prototype.showMenu = function (menu) {
                this._contextMenu = menu;
            };
            Document.prototype.closeMenu = function (menu) {
                if (this._contextMenu) {
                    this._contextMenu.dispose();
                    delete this._contextMenu;
                }
            };
            Document.prototype.dispose = function () {
                if (!this.disposed) {
                    this._mouseClickBinder.dispose();
                    this._mouseDownBinder.dispose();
                    this._mouseUpBinder.dispose();
                    _super.prototype.dispose.call(this);
                }
            };
            Document.prototype.getParametricLines = function (axes) {
                var ret = new Array();
                for (var i = 0; i < this._data.parametric.length; i++) {
                    var line = this._data.parametric.item(i);
                    if (line.axes == axes) {
                        ret.push(line);
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
            Document.prototype.getLineSegment = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                if (args.length == 1) {
                    for (var i = 0; i < this._data.lines.length; i++) {
                        var segment = this._data.lines.item(i);
                        if (segment.mouseHit(args[0])) {
                            return segment;
                        }
                    }
                }
                else if (args.length == 2) {
                    var p1 = args[0];
                    var p2 = args[1];
                    for (var i = 0; i < this._data.lines.length; i++) {
                        var segment = this._data.lines.item(i);
                        if (segment.isPivot(p1) && segment.isPivot(p2)) {
                            return segment;
                        }
                    }
                }
                return null;
            };
            Document.prototype.removeAngle = function (angle, force) {
                if (force === void 0) { force = false; }
                if (angle.hasBisector && !force) {
                    angle.enabled = false;
                }
                else if (!angle.disposed) {
                    this._data.angles.remove(angle);
                    angle.dispose();
                }
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
            Document.prototype.removePoint = function (point) {
                if (!point.disposed) {
                    point.dispose();
                    this._data.points.remove(point);
                    for (var i = 0; i < this._data.lines.length; i++) {
                        var segment = this._data.lines.item(i);
                        if (segment.isPivot(point)) {
                            this.removeLineSegment(segment);
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
                }
            };
            Document.prototype.removeLineSegment = function (segment) {
                if (!segment.disposed) {
                    this._data.lines.remove(segment);
                    segment.dispose();
                    if (this.canRemovePoint(segment.start)) {
                        this.removePoint(segment.start);
                    }
                    if (this.canRemovePoint(segment.end)) {
                        this.removePoint(segment.end);
                    }
                    for (var i = 0; i < this._data.angles.length; i++) {
                        var angle = this._data.angles.item(i);
                        if (angle.isRelated(segment)) {
                            this.removeAngle(angle, true);
                            i--;
                        }
                    }
                }
            };
            Document.prototype.removeCircleLine = function (circle) {
                if (!circle.disposed) {
                    this._data.circles.remove(circle);
                    circle.dispose();
                    if (this.canRemovePoint(circle.point1)) {
                        this.removePoint(circle.point1);
                    }
                    if (this.canRemovePoint(circle.point2)) {
                        this.removePoint(circle.point2);
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
                if (!parametric_line.disposed) {
                    this._data.parametric.remove(parametric_line);
                    parametric_line.dispose();
                    var axes = parametric_line.axes;
                    if (this.getParametricLines(axes).length == 0) {
                        this._data.axes.remove(axes);
                        axes.dispose();
                    }
                }
            };
            Document.prototype.setLineSegmentState = function (point) {
                var _this = this;
                this._tooltip = new Tools.Tooltip(function () { return _this._mouseArea.mousePoint.x; }, function () { return _this._mouseArea.mousePoint.y; }, "Выберите вторую точку");
                this._state = { action: "line segment", activeItem: point, pitchPoint: point };
            };
            Document.prototype.setAngleIndicatorState = function (segment, pitch_point) {
                var _this = this;
                this._tooltip = new Tools.Tooltip(function () { return _this._mouseArea.mousePoint.x; }, function () { return _this._mouseArea.mousePoint.y; }, "Выберите вторую прямую");
                this._state = { action: "angle indicator", activeItem: segment, pitchPoint: pitch_point };
            };
            Document.prototype.setBisectorState = function (segment, pitch_point) {
                var _this = this;
                this._tooltip = new Tools.Tooltip(function () { return _this._mouseArea.mousePoint.x; }, function () { return _this._mouseArea.mousePoint.y; }, "Выберите вторую прямую");
                this._state = { action: "bisector", activeItem: segment, pitchPoint: pitch_point };
            };
            Document.prototype.setParallelLineState = function (segment) {
                var _this = this;
                this._tooltip = new Tools.Tooltip(function () { return _this._mouseArea.mousePoint.x; }, function () { return _this._mouseArea.mousePoint.y; }, "Выберите || прямую");
                this._state = { action: "parallel", activeItem: segment };
            };
            Document.prototype.setPerpendicularLineState = function (segment) {
                var _this = this;
                this._tooltip = new Tools.Tooltip(function () { return _this._mouseArea.mousePoint.x; }, function () { return _this._mouseArea.mousePoint.y; }, "Выберите ⟂ прямую");
                this._state = { action: "perpendicular", activeItem: segment };
            };
            Document.prototype.setCirclRadiusState = function (point) {
                var _this = this;
                this._tooltip = new Tools.Tooltip(function () { return _this._mouseArea.mousePoint.x; }, function () { return _this._mouseArea.mousePoint.y; }, "Выберите вторую точку");
                this._state = { action: "circle radius", activeItem: point, pitchPoint: point };
            };
            Document.prototype.setCirclDiameterState = function (point) {
                var _this = this;
                this._tooltip = new Tools.Tooltip(function () { return _this._mouseArea.mousePoint.x; }, function () { return _this._mouseArea.mousePoint.y; }, "Выберите вторую точку");
                this._state = { action: "circle diameter", activeItem: point, pitchPoint: point };
            };
            Document.prototype.addParametricLine = function (point, axes) {
                var _this = this;
                var dialog = new Tools.ExpressionDialog(this, makeMod(this, function () { return _this.mouseArea.x + _this.mouseArea.w / 2 - _this.mouseArea.w / 10; }), makeMod(this, function () { return _this.mouseArea.y + _this.mouseArea.h / 2 - _this.mouseArea.h / 10; }));
                dialog.onEnter.bind(this, function (event) {
                    if (event.detail) {
                        var new_axes = !axes;
                        axes = axes !== null && axes !== void 0 ? axes : new Tools.AxesLines(_this, _this._data.axes.length, point.x, point.y, 0.02, 0.02, function () { return Tools.CurrentTheme.AxesWidth; }, function () { return Tools.CurrentTheme.AxesBrush; }, function () { return Tools.CurrentTheme.AxesSelectBrush; });
                        var line = new Tools.ParametricLine(_this, function () { return Tools.CurrentTheme.ActiveLineWidth; }, function () { return Tools.CurrentTheme.ActiveLineBrush; }, function () { return Tools.CurrentTheme.ActiveLineSelectBrush; }, axes);
                        line.code = event.detail;
                        if (new_axes) {
                            _this._data.axes.push(axes);
                        }
                        _this._data.parametric.push(line);
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
                    if (line.mouseHit(point)) {
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
                this._groupNo++;
                if (lines.length == 0) {
                    var p = new Tools.ActivePoint(this, point.x, point.y);
                    p.setName(this.nextPointName());
                    p.selected = true;
                    this._addPoint(p);
                    return p;
                }
                else if (lines.length == 1) {
                    var line = lines[0];
                    var intersection = Tools.Intersection.makePoint(point, line);
                    var p = new Tools.ActiveCommonPoint(this, intersection.x, intersection.y, this._groupNo);
                    line.addPoint(p);
                    p.addSegment(line);
                    p.setName(this.nextPointName());
                    p.selected = true;
                    this._addPoint(p);
                    return p;
                }
                else if (lines.length > 1) {
                    var start_index = this._data.points.length;
                    for (var i = 0; i < lines.length; i++) {
                        var line1 = lines[i];
                        for (var j = i + 1; j < lines.length; j++) {
                            var line2 = lines[j];
                            var intersection = Tools.Intersection.makePoint(point, line1, line2);
                            var p = new Tools.ActiveCommonPoint(this, intersection.x, intersection.y, this._groupNo);
                            line1.addPoint(p);
                            p.addSegment(line1);
                            line2.addPoint(p);
                            p.addSegment(line2);
                            p.setName(this.nextPointName());
                            p.selected = true;
                            this._addPoint(p);
                        }
                    }
                    this.addGroupVisibility(start_index, this._data.points.length);
                }
                return null;
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
                    ret.push("l" + info_separator + join_data(line.serialize(context)));
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
                for (var i = 0; i < this._data.parametric.length; i++) {
                    var line = this._data.parametric.item(i);
                    ret.push("pl" + info_separator + join_data(line.serialize(context)));
                }
                return Geoma.Utils.SerializeHelper.joinData(ret, Document._chunkSeparator);
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
                var context = {
                    document: this,
                    data: new DocumentData(),
                    version: serialization_version
                };
                this._data = context.data;
                try {
                    var chunks = Geoma.Utils.SerializeHelper.splitData(data, Document._chunkSeparator);
                    var error = new Error("Невозможно восстановить данные");
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
                            default:
                                throw error;
                        }
                    }
                }
                catch (ex) {
                    this._data.dispose();
                    this._data = old_data;
                    this.alert(ex.toString());
                    return;
                }
                this._data = old_data;
                old_data.dispose(this);
                this.remove(this._tools);
                this._data = context.data;
                this._data.initialize(this);
                this.push(this._tools);
                this._groupNo = 0;
                for (var group_id in groups) {
                    var group_no = toInt(group_id);
                    this._groupNo = Math.max(this._groupNo, group_no);
                    this.addGroupVisibility(groups[group_no].start_index, groups[group_no].end_index);
                }
            };
            Document.prototype.copyToClipboard = function (data) {
                return navigator.clipboard.writeText(data);
            };
            Document.prototype.prompt = function (message, default_value) {
                return window.prompt(message, default_value);
            };
            Document.prototype.promptNumber = function (message, default_value) {
                var number_text = this.prompt(message + "\r\n\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u0447\u0438\u0441\u043B\u043E", default_value === null || default_value === void 0 ? void 0 : default_value.toString());
                if (number_text) {
                    var number = parseFloat(number_text);
                    if (number_text == "" + number) {
                        return number;
                    }
                    else {
                        this.alert("\u0417\u043D\u0430\u0447\u0435\u043D\u0438\u0435 '" + number_text + "' \u043D\u0435 \u044F\u0432\u043B\u044F\u0435\u0442\u0441\u044F \u0447\u0438\u0441\u043B\u043E\u043C");
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
            Document.getTicks = function () {
                return new Date().getTime();
            };
            Document.prototype.innerDraw = function (play_ground) {
                Geoma.Utils.UpdateCalcRevision();
                if (this._onBeforeDraw) {
                    this._onBeforeDraw.emitEvent(new CustomEvent("BeforeDrawEvent"));
                }
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
                if (this._tapTool && this._tapTool.activated) {
                    this._tools.remove(this._tapTool);
                    this._tapTool.dispose();
                    delete this._tapTool;
                    Tools.PointTool.showMenu(this);
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
                var can_add_line = true;
                if (start_point == end_point) {
                    this.alert("Нельзя провести линию к той же точке!");
                    can_add_line = false;
                }
                else {
                    for (var i = 0; i < this._data.lines.length; i++) {
                        var line = this._data.lines.item(i);
                        if (line.belongs(start_point) && line.belongs(end_point)) {
                            this.alert("\u041B\u0438\u043D\u0438\u044F " + line.name + " \u0443\u0436\u0435 \u043F\u0440\u043E\u0432\u0435\u0434\u0435\u043D\u0430!");
                            can_add_line = false;
                            break;
                        }
                    }
                }
                if (can_add_line) {
                    this._addLineSegment(start_point, end_point);
                }
            };
            Document.prototype.execAngleIndicatorState = function (other_segment, select_point) {
                var _a, _b, _c, _d;
                assert(this._state && this._state.activeItem instanceof Tools.ActiveLineSegment);
                var segment = this._state.activeItem;
                var common_point;
                for (var _i = 0, _e = other_segment.points; _i < _e.length; _i++) {
                    var point = _e[_i];
                    if (segment.belongs(point)) {
                        common_point = point;
                        break;
                    }
                }
                if (common_point) {
                    if (segment == other_segment) {
                        this.alert("\u0423\u0433\u043E\u043B \u043C\u043E\u0436\u0435\u0442 \u0431\u044B\u0442\u044C \u043E\u0431\u043E\u0437\u043D\u0430\u0447\u0435\u043D \u0442\u043E\u043B\u044C\u043A\u043E \u043C\u0435\u0436\u0434\u0443 \u0440\u0430\u0437\u043B\u0438\u0447\u043D\u044B\u043C\u0438 \u043F\u0440\u044F\u043C\u044B\u043C\u0438, \u0438\u043C\u0435\u044E\u0449\u0438\u043C\u0438 \u043E\u0434\u043D\u0443 \u043E\u0431\u0449\u0443\u044E \u0442\u043E\u0447\u043A\u0443.");
                    }
                    else {
                        for (var i = 0; i < this._data.angles.length; i++) {
                            var angle = this._data.angles.item(i);
                            if ((angle.segment1 == segment && angle.segment2 == other_segment) ||
                                (angle.segment1 == other_segment && angle.segment2 == segment)) {
                                if (!angle.enabled) {
                                    angle.enabled = true;
                                    return angle;
                                }
                                else {
                                    this.alert("\u0423\u0433\u043E\u043B \u043C\u0435\u0436\u0434\u0443 \u043F\u0440\u044F\u043C\u044B\u043C\u0438 " + segment.name + " \u0438 " + other_segment.name + " \u0443\u0436\u0435 \u043E\u0431\u043E\u0437\u043D\u0430\u0447\u0435\u043D.");
                                    return null;
                                }
                            }
                        }
                        if (common_point instanceof Tools.ActiveCommonPoint) {
                            assert(this._state.pitchPoint);
                            var intersect = Tools.PointLine.intersected(this._state.pitchPoint, segment.start, common_point, Tools.CurrentTheme.ActiveLineMouseThickness);
                            if (intersect) {
                                segment = (_a = this.getLineSegment(segment.start, common_point)) !== null && _a !== void 0 ? _a : this._addLineSegment(segment.start, common_point);
                            }
                            else {
                                intersect = Tools.PointLine.intersected(this._state.pitchPoint, common_point, segment.end, Tools.CurrentTheme.ActiveLineMouseThickness);
                                if (intersect) {
                                    segment = (_b = this.getLineSegment(common_point, segment.end)) !== null && _b !== void 0 ? _b : this._addLineSegment(common_point, segment.end);
                                }
                                else {
                                    return null;
                                }
                            }
                            intersect = Tools.PointLine.intersected(select_point, other_segment.start, common_point, Tools.CurrentTheme.ActiveLineMouseThickness);
                            if (intersect) {
                                other_segment = (_c = this.getLineSegment(other_segment.start, common_point)) !== null && _c !== void 0 ? _c : this._addLineSegment(other_segment.start, common_point);
                            }
                            else {
                                intersect = Tools.PointLine.intersected(select_point, common_point, other_segment.end, Tools.CurrentTheme.ActiveLineMouseThickness);
                                if (intersect) {
                                    other_segment = (_d = this.getLineSegment(common_point, other_segment.end)) !== null && _d !== void 0 ? _d : this._addLineSegment(common_point, other_segment.end);
                                }
                                else {
                                    return null;
                                }
                            }
                        }
                        return this._addAngleIndicator(segment, other_segment);
                    }
                }
                else {
                    this.alert("\u041E\u0442\u0440\u0435\u0437\u043A\u0438 " + segment.name + " \u0438 " + other_segment.name + " \u043D\u0435 \u0441\u043E\u0434\u0435\u0440\u0436\u0430\u0442 \u043E\u0431\u0449\u0438\u0445 \u0442\u043E\u0447\u0435\u043A");
                }
                return null;
            };
            Document.prototype.execBisectorState = function (other_segment, select_point) {
                assert(this._state && this._state.activeItem instanceof Tools.ActiveLineSegment);
                var segment = this._state.activeItem;
                for (var i = 0; i < this._data.angles.length; i++) {
                    var angle_1 = this._data.angles.item(i);
                    if (angle_1.isRelated(segment) && angle_1.isRelated(other_segment)) {
                        if (angle_1.hasBisector) {
                            this.alert("\u0411\u0438\u0441\u0441\u0435\u043A\u0442\u0440\u0438\u0441\u0430 \u0443\u0433\u043B\u0430 " + angle_1.name + " \u0443\u0436\u0435 \u043F\u0440\u043E\u0432\u0435\u0434\u0435\u043D\u0430.");
                        }
                        else {
                            angle_1.addBisector();
                        }
                        return;
                    }
                }
                var angle = this.execAngleIndicatorState(other_segment, select_point);
                if (angle) {
                    angle.addBisector();
                    angle.enabled = false;
                }
            };
            Document.prototype.execParallelLineState = function (other_segment) {
                assert(this._state && this._state.activeItem instanceof Tools.ActiveLineSegment);
                var segment = this._state.activeItem;
                if (segment.belongs(other_segment.start) || segment.belongs(other_segment.end)) {
                    this.alert("\u041E\u0442\u0440\u0435\u0437\u043A\u0438 " + segment.name + " \u0438 " + other_segment.name + " \u0438\u043C\u0435\u044E\u0442 \u043E\u0431\u0449\u0443\u044E \u0442\u043E\u0447\u043A\u0443 \u0438 \u043D\u0435 \u043C\u043E\u0433\u0443\u0442 \u0441\u0442\u0430\u0442\u044C ||.");
                }
                else {
                    segment.setParallelTo(other_segment);
                }
            };
            Document.prototype.execPerpendicularLineState = function (other_segment) {
                assert(this._state && this._state.activeItem instanceof Tools.ActiveLineSegment);
                var segment = this._state.activeItem;
                if (!segment.belongs(other_segment.start) && !segment.belongs(other_segment.end)) {
                    this.alert("\u041E\u0442\u0440\u0435\u0437\u043A\u0438 " + segment.name + " \u0438 " + other_segment.name + " \u043D\u0435 \u0438\u043C\u0435\u044E\u0442 \u043E\u0431\u0449\u0435\u0439 \u0442\u043E\u0447\u043A\u0438 \u0438 \u043D\u0435 \u043C\u043E\u0433\u0443\u0442 \u0441\u0442\u0430\u0442\u044C \u27C2.");
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
                var can_add_circle = true;
                if (center_point == pivot_point) {
                    this.alert("Нельзя провести окружность к той же точке!");
                    can_add_circle = false;
                }
                else {
                    for (var i = 0; i < this._data.circles.length; i++) {
                        var circle = this._data.circles.item(i);
                        if (circle.kind == kind && circle.point1 == center_point && circle.point2 == pivot_point) {
                            this.alert("\u041E\u043A\u0440\u0443\u0436\u043D\u043E\u0441\u0442\u044C " + circle.name + " \u0443\u0436\u0435 \u043F\u0440\u043E\u0432\u0435\u0434\u0435\u043D\u0430!");
                            can_add_circle = false;
                            break;
                        }
                    }
                }
                if (can_add_circle) {
                    this._addCircle(kind, center_point, pivot_point);
                }
            };
            Document.prototype.addGroupVisibility = function (start_index, end_index) {
                var group_no = -1;
                var groups = new Array();
                for (var i = start_index; i < end_index; i++) {
                    var current_index = i;
                    var p = this._data.points.item(i);
                    if (group_no == -1) {
                        group_no = p.groupNo;
                    }
                    assert(group_no == p.groupNo);
                    groups.push(p);
                }
                var _loop_3 = function (i) {
                    var point = this_3._data.points.item(i);
                    point.addVisible(function (value) {
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
                };
                var this_3 = this;
                for (var i = start_index + 1; i < end_index; i++) {
                    _loop_3(i);
                }
            };
            Document.prototype.canRemovePoint = function (point) {
                for (var i = 0; i < this._data.lines.length; i++) {
                    if (this._data.lines.item(i).belongs(point)) {
                        return false;
                    }
                }
                for (var i = 0; i < this._data.circles.length; i++) {
                    if (this._data.circles.item(i).belongs(point)) {
                        return false;
                    }
                }
                return true;
            };
            Document.getName = function (index, pattern) {
                var name = pattern.charAt(index % pattern.length);
                for (var j = 0; j < toInt(index / pattern.length); j++) {
                    name += "'";
                }
                return name;
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
            Document.prototype._addPoint = function (point) {
                this._data.points.push(point);
            };
            Document.prototype._addLineSegment = function (start_point, end_point, line_width, brush) {
                var segment = new Tools.ActiveLineSegment(start_point, end_point, line_width, brush);
                this._data.lines.push(segment);
                return segment;
            };
            Document.prototype._addAngleIndicator = function (line1, line2) {
                var indicator = new Tools.AngleIndicator(this, line1, line2);
                this._data.angles.push(indicator);
                return indicator;
            };
            Document.prototype._addCircle = function (kind, start_point, end_point, line_width, brush) {
                var circle = new Tools.ActiveCircleLine(this, kind, start_point, end_point, line_width, brush);
                this._data.circles.push(circle);
                return circle;
            };
            Document.serializationVersion1 = 1;
            Document.actualSerializationVersion = 2;
            Document._pointNames = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            Document._chunkSeparator = ";";
            Document._infoSeparatorV1 = "|";
            Document._infoSeparatorV2 = "-";
            return Document;
        }(Geoma.Sprite.Container));
        Tools.Document = Document;
    })(Tools = Geoma.Tools || (Geoma.Tools = {}));
})(Geoma || (Geoma = {}));
var playGround;
var mainDocument;
window.onload = function () {
    var canvas = document.getElementById('playArea');
    playGround = new Geoma.PlayGround(canvas);
    mainDocument = new Geoma.Tools.Document(playGround);
    window.requestAnimationFrame(drawAll);
};
window.onresize = function () {
    playGround.invalidate();
};
function drawAll(time) {
    mainDocument.draw(playGround);
    window.requestAnimationFrame(drawAll);
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
            function AngleIndicator(document, s1, s2) {
                var _this = _super.call(this, document, new Geoma.Sprite.Container()) || this;
                _this.segment1 = s1;
                _this.segment2 = s2;
                _this.enabled = true;
                if (s1.start == s2.start) {
                    _this.commonPivot = s1.start;
                    _this._p1 = s1.end;
                    _this._p2 = s2.end;
                }
                else if (s1.start == s2.end) {
                    _this.commonPivot = s1.start;
                    _this._p1 = s1.end;
                    _this._p2 = s2.start;
                }
                else if (s1.end == s2.start) {
                    _this.commonPivot = s1.end;
                    _this._p1 = s1.start;
                    _this._p2 = s2.end;
                }
                else {
                    _this.commonPivot = s1.end;
                    _this._p1 = s1.start;
                    _this._p2 = s2.start;
                }
                assert(_this.commonPivot != _this._p1 && _this.commonPivot != _this._p2 && _this._p1 != _this._p2);
                assert(s2.belongs(_this.commonPivot));
                _this.addVisible(makeMod(_this, function (value) { return value && _this.commonPivot.visible; }));
                var indicators = _this.document.getAngleIndicators(_this.commonPivot).length;
                _this._selectionRadius = 30 + 15 * indicators;
                _this._angle = new Geoma.Utils.ModifiableProperty(makeMod(_this, function () { return Tools.ActiveLineSegment.getAngle(_this.commonPivot.x, _this.commonPivot.y, _this._p1.x, _this._p1.y, _this._p2.x, _this._p2.y); }), 0);
                _this._startAngle = new Geoma.Utils.ModifiableProperty(makeMod(_this, function () { return Tools.ActiveLineSegment.getAngle(_this.commonPivot.x, _this.commonPivot.y, _this._p1.x, _this._p1.y); }), 0);
                _this._endAngle = new Geoma.Utils.ModifiableProperty(makeMod(_this, function () { return Tools.ActiveLineSegment.getAngle(_this.commonPivot.x, _this.commonPivot.y, _this._p2.x, _this._p2.y); }), 0);
                _this._textAngle = new Geoma.Utils.ModifiableProperty(makeMod(_this, function () {
                    var anticlockwise = _this._angleDirection.value;
                    if (anticlockwise) {
                        return _this._startAngle.value - _this.angle / 2;
                    }
                    else {
                        return _this._startAngle.value + _this.angle / 2;
                    }
                }), 0);
                _this._angleDirection = new Geoma.Utils.ModifiableProperty(makeMod(_this, function () { return AngleIndicator.angleDifDirection(_this._startAngle.value, _this._endAngle.value); }), AngleDirection.clockwise);
                _this._bisectorAngle = new Geoma.Utils.ModifiableProperty(makeMod(_this, function () { return (_this._startAngle.value + _this._endAngle.value) / 2; }), 0);
                var text = new Geoma.Sprite.Text(makeMod(_this, function () { return Math.cos(_this._textAngle.value) * _this._selectionRadius + _this.commonPivot.x; }), makeMod(_this, function () { return Math.sin(_this._textAngle.value) * _this._selectionRadius + _this.commonPivot.y; }), undefined, undefined, makeMod(_this, function () { return _this.selected ? Tools.CurrentTheme.AngleNameSelectBrush : Tools.CurrentTheme.AngleNameBrush; }), function () { return Tools.CurrentTheme.AngleNameStyle; }, makeMod(_this, function () { return _this._angleName ? _this._angleName : Geoma.Utils.toDeg(_this.angle).toFixed(Tools.CurrentTheme.AngleIndicatorPrecision) + "\u00B0"; }));
                text.strokeBrush.addModifier(function () { return Tools.CurrentTheme.AngleIndicatorStrokeBrush; });
                text.strokeWidth.addModifier(function () { return Tools.CurrentTheme.AngleIndicatorStrokeWidth; });
                var visible_mod = makeMod(_this, function () { return _this.selected; });
                var x_mod = makeMod(_this, function () { return _this.commonPivot.x - _this._selectionRadius; });
                var y_mod = makeMod(_this, function () { return _this.commonPivot.y - _this._selectionRadius; });
                var ellipse = new Geoma.Polygon.Ellipse(Geoma.Utils.Point.make(_this._selectionRadius, _this._selectionRadius), _this._selectionRadius, _this._selectionRadius, 0, 2 * Math.PI);
                var selection_back = new Geoma.Sprite.Polyshape(x_mod, y_mod, undefined, function () { return Tools.CurrentTheme.AngleIndicatorSelectionBrush; });
                selection_back.alpha = 0.1;
                selection_back.addVisible(visible_mod);
                selection_back.addPolygon(ellipse);
                var selection_border = new Geoma.Sprite.Polyline(x_mod, y_mod, 1, function () { return Tools.CurrentTheme.AngleIndicatorSelectionBorderBrush; });
                selection_border.addVisible(visible_mod);
                selection_border.addPolygon(ellipse);
                _this.item.push(selection_back);
                _this.item.push(selection_border);
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
            Object.defineProperty(AngleIndicator.prototype, "bisectorAngle", {
                get: function () {
                    return this._bisectorAngle.value;
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
            Object.defineProperty(AngleIndicator.prototype, "hasBisector", {
                get: function () {
                    return this._bisector != null;
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
                    return this._selectionRadius;
                },
                enumerable: false,
                configurable: true
            });
            AngleIndicator.prototype.isRelated = function (sprite) {
                return this.commonPivot == sprite || this.segment1 == sprite || this.segment2 == sprite;
            };
            AngleIndicator.prototype.dispose = function () {
                _super.prototype.dispose.call(this);
                if (this._bisector) {
                    this.removeBisector(this._bisector);
                }
            };
            AngleIndicator.prototype.addBisector = function () {
                assert(!this._bisector);
                this._bisector = new Tools.BisectorLine(this);
            };
            AngleIndicator.prototype.removeBisector = function (bisector) {
                assert(this._bisector == bisector);
                this._bisector.dispose();
                delete this._bisector;
                if (!this.enabled) {
                    this.document.removeAngle(this);
                }
            };
            AngleIndicator.prototype.serialize = function (context) {
                var data = [];
                data.push(context.lines[this.segment1.name].toString());
                data.push(context.lines[this.segment2.name].toString());
                if (this.hasBisector) {
                    data.push("b");
                }
                if (!this.enabled) {
                    data.push("d");
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
                if (data.length < (index + 1)) {
                    return null;
                }
                else {
                    var line1 = context.data.lines.item(toInt(data[index]));
                    var line2 = context.data.lines.item(toInt(data[index + 1]));
                    var angle = new AngleIndicator(context.document, line1, line2);
                    for (var i = index + 2; i < data.length; i++) {
                        switch (data[i]) {
                            case 'b':
                                angle.addBisector();
                                break;
                            case 'd':
                                angle.enabled = false;
                                break;
                            default:
                                return null;
                        }
                    }
                    return angle;
                }
            };
            Object.defineProperty(AngleIndicator.prototype, "realName", {
                get: function () {
                    if (this._p1.name < this._p2.name) {
                        return "\u2220" + this._p1.name + this.commonPivot.name + this._p2.name;
                    }
                    else {
                        return "\u2220" + this._p2.name + this.commonPivot.name + this._p1.name;
                    }
                },
                enumerable: false,
                configurable: true
            });
            AngleIndicator.prototype.canSelect = function (event) {
                var dx = event.x - this.commonPivot.x;
                var dy = event.y - this.commonPivot.y;
                return this.enabled && (dx * dx + dy * dy) <= (this._selectionRadius * this._selectionRadius);
            };
            AngleIndicator.prototype.innerDraw = function (play_ground) {
                var _a, _b;
                if (this._bisector) {
                    this._bisector.draw(play_ground);
                }
                if (this.enabled) {
                    var x = this.commonPivot.x;
                    var y = this.commonPivot.y;
                    play_ground.context2d.beginPath();
                    if (Math.abs(Math.round(Geoma.Utils.toDeg(this._angle.value)) - 90) < 0.01) {
                        var i1 = Tools.LineCircle.intersection(this.segment1, this);
                        var i2 = Tools.LineCircle.intersection(this.segment2, this);
                        var p1 = (_a = i1.p1) !== null && _a !== void 0 ? _a : i1.p2;
                        var p2 = (_b = i2.p1) !== null && _b !== void 0 ? _b : i2.p2;
                        if (p1 && p2) {
                            if (this.selected) {
                                play_ground.context2d.beginPath();
                                play_ground.context2d.fillStyle = Tools.CurrentTheme.AngleIndicatorSelectionBrush;
                                play_ground.context2d.moveTo(p1.x, p1.y);
                                play_ground.context2d.lineTo(p1.x + p2.x - x, p1.y + p2.y - y);
                                play_ground.context2d.lineTo(p2.x, p2.y);
                                play_ground.context2d.lineTo(x, y);
                                play_ground.context2d.closePath();
                                play_ground.context2d.fill();
                            }
                            else {
                                play_ground.context2d.beginPath();
                                play_ground.context2d.strokeStyle = Tools.CurrentTheme.AngleIndicatorBrush;
                                play_ground.context2d.lineWidth = Tools.CurrentTheme.AngleIndicatorLineWidth;
                                play_ground.context2d.moveTo(p1.x, p1.y);
                                play_ground.context2d.lineTo(p1.x + p2.x - x, p1.y + p2.y - y);
                                play_ground.context2d.lineTo(p2.x, p2.y);
                                play_ground.context2d.stroke();
                            }
                        }
                    }
                    else if (this.selected) {
                        play_ground.context2d.fillStyle = Tools.CurrentTheme.AngleIndicatorSelectionBrush;
                        play_ground.context2d.arc(this.commonPivot.x, this.commonPivot.y, this._selectionRadius, this._startAngle.value, this._endAngle.value, this._angleDirection.value == AngleDirection.anticlockwise);
                        play_ground.context2d.lineTo(this.commonPivot.x, this.commonPivot.y);
                        play_ground.context2d.fill();
                    }
                    else {
                        play_ground.context2d.strokeStyle = Tools.CurrentTheme.AngleIndicatorBrush;
                        play_ground.context2d.lineWidth = Tools.CurrentTheme.AngleIndicatorLineWidth;
                        play_ground.context2d.arc(this.commonPivot.x, this.commonPivot.y, this._selectionRadius, this._startAngle.value, this._endAngle.value, this._angleDirection.value == AngleDirection.anticlockwise);
                        play_ground.context2d.stroke();
                    }
                    _super.prototype.innerDraw.call(this, play_ground);
                }
            };
            AngleIndicator.prototype.mouseMove = function (event) {
                var can_select = this.canSelect(event);
                if (can_select) {
                    var min_sel_radius = this._selectionRadius;
                    for (var _i = 0, _a = this.document.getAngleIndicators(this.commonPivot); _i < _a.length; _i++) {
                        var indicator = _a[_i];
                        if (indicator != this && indicator.canSelect(event) && indicator._selectionRadius < min_sel_radius) {
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
                    var menu_item = menu.addMenuItem("\u041F\u043E\u043A\u0430\u0437\u0430\u0442\u044C \u0431\u0438\u0441\u0441\u0435\u043A\u0442\u0440\u0438\u0441\u044B \u0443\u0433\u043B\u043E\u0432");
                    menu_item.onChecked.bind(this, this.addBisector);
                    menu_item.enabled.addModifier(makeMod(this, function () { return !_this._bisector; }));
                    var set_name_1 = function (index) { return _this._angleName = AngleIndicator._anglesNames.charAt(index); };
                    if (this._angleName) {
                        menu_item = menu.addMenuItem("\u041F\u043E \u0443\u043C\u043E\u043B\u0447\u0430\u043D\u0438\u044E (" + this.realName + ")");
                        menu_item.onChecked.bind(this, function () { return _this._angleName = undefined; });
                    }
                    var custom_name = menu.addMenuGroup("Настраиваемое имя");
                    var stripe = void 0;
                    var _loop_4 = function (i) {
                        if (i % 6 == 0) {
                            stripe = custom_name.addMenuStrip();
                        }
                        var index = i;
                        var menu_item_1 = stripe.addMenuItem(" " + AngleIndicator._anglesNames.charAt(index) + " ");
                        menu_item_1.onChecked.bind(this_4, function () { return set_name_1(index); });
                    };
                    var this_4 = this;
                    for (var i = 0; i < AngleIndicator._anglesNames.length; i++) {
                        _loop_4(i);
                    }
                    menu_item = menu.addMenuItem("\u0423\u0434\u0430\u043B\u0438\u0442\u044C \u0438\u043D\u0434\u0438\u043A\u0430\u0442\u043E\u0440 \u0443\u0433\u043B\u0430 " + this.name);
                    menu_item.onChecked.bind(this, function () { return doc.removeAngle(_this); });
                    menu.show();
                }
                _super.prototype.mouseClick.call(this, event);
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
                return _super.call(this, function () { return document.mouseArea.x; }, function () { return document.mouseArea.y; }, function () { return document.mouseArea.w; }, function () { return document.mouseArea.h; }, function () { return Tools.CurrentTheme.BackgroundBrush; }) || this;
            }
            return Background;
        }(Geoma.Sprite.Rectangle));
        Tools.Background = Background;
    })(Tools = Geoma.Tools || (Geoma.Tools = {}));
})(Geoma || (Geoma = {}));
//# sourceMappingURL=geoma.js.map