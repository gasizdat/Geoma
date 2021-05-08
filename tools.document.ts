﻿/// <reference path="utils.ts" />
/// <reference path="sprites.ts" />
/// <reference path="polygons.ts" />
/// <reference path="interfaces.ts" />
/// <reference path="play_ground.ts" />
/// <reference path="tools.core.ts" />
/// <reference path="tools.menu.ts" />
/// <reference path="tools.tools.ts" />
/// <reference path="tools.styles.ts" />
/// <reference path="tools.resources.ts" />
/// <reference path="tools.axes.lines.ts" />
/// <reference path="tools.point.active.ts" />
/// <reference path="tools.point.common.ts" />
/// <reference path="tools.line.segment.ts" />
/// <reference path="tools.line.bisector.ts" />
/// <reference path="tools.intersections.ts" />
/// <reference path="tools.parametric.line.ts" />
/// <reference path="tools.formula.editor.ts" />
/// <reference path="tools.line.ts" />

module Geoma.Tools
{
    import makeMod = Utils.makeMod;
    import toInt = Utils.toInt;
    import Point = Utils.Point;
    import assert = Utils.assert;
    import MulticastEvent = Utils.MulticastEvent;
    import modifier = Utils.modifier;
    import property = Utils.ModifiableProperty;
    import Box = Utils.Box;
    import binding = Utils.binding;
    import Debug = Sprite.Debug;

        
    type DocState =
        {
            action: "line segment" | "angle indicator" | "bisector" | "parallel" | "perpendicular" | "circle radius" | "circle diameter" | "line";
            activeItem: ActivePoint | ActiveLineBase;
            pitchPoint?: IPoint;
        }


    export interface BeforeDrawEvent extends Event
    {
    }

    export interface SerializationContext
    {
        points: Record<string, number>;
        lines: Record<string, number>;
    }

    export interface DesializationContext
    {
        readonly document: Document;
        readonly data: DocumentData;
        readonly version: number;
    }

    class DocumentData
    {
        public readonly points = new Container<ActivePoint>();
        public readonly lines = new Container<ActiveLineBase>();
        public readonly angles = new Container<AngleIndicator>();
        public readonly circles = new Container<ActiveCircleLine>();
        public readonly parametric = new Container<ParametricLine>();
        public readonly axes = new Container<AxesLines>();

        public dispose(container?: Sprite.Container)
        {
            this.points.dispose();
            this.lines.dispose();
            this.angles.dispose();
            this.circles.dispose();
            this.parametric.dispose();
            this.axes.dispose();

            if (container)
            {
                container.remove(this.parametric);
                container.remove(this.axes);
                container.remove(this.circles);
                container.remove(this.lines);
                container.remove(this.angles);
                container.remove(this.points);
            }
        }

        public initialize(container: Sprite.Container)
        {
            container.push(this.parametric);
            container.push(this.axes);
            container.push(this.circles);
            container.push(this.lines);
            container.push(this.angles);
            container.push(this.points);
        }
    }

    export abstract class UndoTransaction
    {
        constructor(document: Document, name: string, snapshot: string, offset: IPoint)
        {
            this.document = document;
            this.name = name;
            this.startSnapshot = snapshot;
            this.mouseAreaOffset = offset;
        }

        public readonly document: Document;
        public readonly name: string;
        public readonly startSnapshot: string;
        public readonly mouseAreaOffset: IPoint;

        public static Do<T, TSprite extends Sprite.Sprite>(sprite: DocumentSprite<TSprite>, name: string, processor: () => T): T
        {
            const transaction = sprite.document.beginUndo(name);
            try
            {
                const result = processor.bind(sprite)();
                transaction.commit();
                return result;
            }
            catch (error)
            {
                transaction.rollback();
                throw error;
            }
        }

        abstract commit(): void;
        abstract rollback(): void;
    }

    type UndoInfo = {
        text: string,
        snapshot: string,
        offset: IPoint
    };

    export class Document extends Sprite.Container
    {
        constructor(mouse_area: IMouseArea)
        {
            super();

            Utils.InitializeCalcRevision();

            this._mouseArea = mouse_area;
            this._tools = new Sprite.Container();
            this._data = new DocumentData();
            this._groupNo = 0;
            this._background = new Background(this);

            this._data.initialize(this);

            const tap_tool = new TapTool(
                this,
                () => CurrentTheme.TapDelayTime,
                () => CurrentTheme.TapActivateTime,
                () => CurrentTheme.TapLineWidth,
                () => CurrentTheme.TapRadius,
                () => CurrentTheme.TapBrush
            );
            tap_tool.onActivate.bind(this, this.onTap);
            this.push(tap_tool);

            const tool_radius = 20;
            const tool_line_width = 5;
            const tool_y = 40;
            const tool_padding = 10;

            const point_tool = new PointTool(this, 40, tool_y, tool_radius, tool_line_width);
            this._tools.push(point_tool);

            const file_tool = new FileTool(this, 0, tool_y, tool_radius, tool_line_width);
            this._tools.push(file_tool);

            const undo_tool = new UndoTool(this, 0, tool_y, tool_radius, tool_line_width);
            this._tools.push(undo_tool);

            const redo_tool = new RedoTool(this, 0, tool_y, tool_radius, tool_line_width);
            this._tools.push(redo_tool);

            const settings_tool = new SettingsTool(this, 0, tool_y, tool_radius, tool_line_width);
            this._tools.push(settings_tool);

            const max_w = () => Math.max(point_tool.w, file_tool.w, undo_tool.w, redo_tool.w/*, settings_tool.w*/) + tool_padding;

            file_tool.addX((value: number) => value + point_tool.x + max_w() * 1);
            undo_tool.addX((value: number) => value + point_tool.x + max_w() * 2);
            redo_tool.addX((value: number) => value + point_tool.x + max_w() * 3);
            settings_tool.addX((value: number) => value + point_tool.x + max_w() * 4);

            const doc_name = new Sprite.Text(0, tool_y, 0, 0, () => CurrentTheme.MenuItemTextBrush, () => CurrentTheme.MenuItemTextStyle, makeMod(this, () => this.name));
            doc_name.addX(makeMod(this, () => Math.max(this.mouseArea.x + this.mouseArea.offset.x + this.mouseArea.w - doc_name.w - tool_padding, settings_tool.right + tool_padding)));
            this._tools.push(doc_name);

            const tools_separator = new Sprite.Polyline(0, this._tools.bottom + 10, 1, () => CurrentTheme.ToolSeparatorBrush);
            tools_separator.addPolygon(new Polygon.Line(Point.make(0, 0), Point.make(8000, 0)));
            this._tools.push(tools_separator);

            this._mouseClickBinder = mouse_area.onMouseClick.bind(this, this.mouseClick, true);
            const save_data = document.location.hash;
            if (save_data != null && save_data.length && save_data[0] == "#")
            {
                const data = decodeURI(save_data.substring(1));
                this.open(data);
            }
        }

        public get mouseArea(): IMouseArea
        {
            return this._mouseArea;
        }
        public get points(): Sprite.Container
        {
            return this._data.points;
        }
        public get lineSegments(): Sprite.Container
        {
            return this._data.lines;
        }
        public get onBeforeDraw(): MulticastEvent<BeforeDrawEvent>
        {
            if (!this._onBeforeDraw)
            {
                this._onBeforeDraw = new MulticastEvent<BeforeDrawEvent>();
            }
            return this._onBeforeDraw;
        }
        public get selectedSprites(): ReadonlyArray<Sprite.Sprite>
        {
            return this._selectedSprites;
        }

        public alert(message: string): void
        {
            window.alert(message);
        }
        public addToolTip(message: binding<string>): void
        {
            if (this._tooltip)
            {
                this._tooltip.dispose();
                delete this._tooltip;
            }
            this._tooltip = new Tooltip(() => this._mouseArea.mousePoint.x, () => this._mouseArea.mousePoint.y, message);
        }
        public canShowMenu(sprite: Sprite.Sprite): boolean
        {
            return sprite.visible && !this._contextMenu && !this._state && this._selectedSprites.indexOf(sprite) != -1 && !this._preventShowMenu;
        }
        public showMenu(menu: Menu): void
        {
            this._contextMenu = menu;
        }
        public closeMenu(menu: Menu): void
        {
            if (this._contextMenu == menu)
            {
                this._contextMenu.dispose();
                delete this._contextMenu;
            }
        }
        public dispose(): void
        {
            if (!this.disposed)
            {
                this._mouseClickBinder.dispose();
                super.dispose();
            }
        }
        public getParametricLines(axes: AxesLines): Array<ParametricLine>
        {
            const ret = new Array<ParametricLine>();
            for (let i = 0; i < this._data.parametric.length; i++)
            {
                const line = this._data.parametric.item(i);
                if (line.axes == axes)
                {
                    ret.push(line);
                }
            }
            return ret;
        }
        public getPoint(point: IPoint): ActivePoint | null
        {
            for (let i = 0; i < this._data.points.length; i++)
            {
                if (this._data.points.item(i).mouseHit(point))
                {
                    return this._data.points.item(i);
                }
            }
            return null;
        }
        public getLineSegment(p1: IPoint, p2?: IPoint): ActiveLineSegment | null
        {
            return this.getLine<ActiveLineSegment>([ActiveLineSegment], p1, p2);
        }
        public getLine<TLine extends ActiveLineBase>(lineCtors: { new(...args: any[]): TLine }[], p1: IPoint, p2?: IPoint): TLine | null
        {
            if (!p2)
            {
                for (let i = 0; i < this._data.lines.length; i++)
                {
                    const line = this._data.lines.item(i);
                    if (line.mouseHit(p1))
                    {
                        for (let i = 0; i < lineCtors.length; i++)
                        {
                            if (line instanceof lineCtors[i])
                            {
                                return line;
                            }
                        }
                    }
                }
            }
            else
            {
                for (let i = 0; i < this._data.lines.length; i++)
                {
                    const line = this._data.lines.item(i);
                    if (line.isPivot(p1) && line.isPivot(p2))
                    {
                        for (let i = 0; i < lineCtors.length; i++)
                        {
                            if (line instanceof lineCtors[i])
                            {
                                return line;
                            }
                        }
                    }
                }
            }
            return null;
        }
        public removeAngle(angle: AngleIndicator, force: boolean = false): void
        {
            if (!angle.disposed)
            {
                const transaction = this.beginUndo(Resources.string("Удалить индикатор угла {0}", angle.name));
                try
                {
                    if (angle.hasBisector && !force)
                    {
                        angle.enabled = false;
                    }
                    else if (!angle.disposed)
                    {
                        this._data.angles.remove(angle);
                        angle.dispose();
                    }
                    transaction.commit();
                }
                catch (error)
                {
                    transaction.rollback();
                    throw error;
                }
            }
        }
        public getAngleIndicators(point: ActivePoint): Array<AngleIndicator>
        {
            const ret: Array<AngleIndicator> = [];
            for (let i = 0; i < this._data.angles.length; i++)
            {
                const indicator = this._data.angles.item(i);
                if (indicator.commonPivot == point)
                {
                    ret.push(indicator);
                }
            }
            return ret;
        }
        public removePoint(point: ActivePoint): void
        {
            if (!point.disposed)
            {
                const transaction = this.beginUndo(Resources.string("Удаление точки {0}", point.name));
                try
                {
                    point.dispose();
                    this._data.points.remove(point);
                    for (let i = 0; i < this._data.lines.length; i++)
                    {
                        const line = this._data.lines.item(i);
                        if (line.isPivot(point))
                        {
                            if (line instanceof ActiveLineSegment)
                            {
                                this.removeLineSegment(line);
                            }
                            else
                            {
                                assert(false, "TODO");
                            }
                            i--;
                        }
                    }
                    for (let i = 0; i < this._data.circles.length; i++)
                    {
                        const circle = this._data.circles.item(i);
                        if (circle.isPivot(point))
                        {
                            this.removeCircleLine(circle);
                            i--;
                        }
                    }
                    for (let i = 0; i < this._data.angles.length; i++)
                    {
                        const angle = this._data.angles.item(i);
                        if (angle.isRelated(point))
                        {
                            this.removeAngle(angle, true);
                            i--;
                        }
                    }
                    transaction.commit();
                }
                catch (error)
                {
                    transaction.rollback();
                    throw error;
                }
            }
        }
        public removeLine(line: ActiveLine): void
        {
            if (!line.disposed)
            {
                assert(line.startPoint instanceof ActivePoint);
                assert(line.endPoint instanceof ActivePoint);
                this._data.lines.remove(line);
                line.dispose();
                if (this.canRemovePoint(line.startPoint))
                {
                    this.removePoint(line.startPoint);
                }
                if (this.canRemovePoint(line.endPoint))
                {
                    this.removePoint(line.endPoint);
                }

                for (let i = 0; i < this._data.angles.length; i++)
                {
                    const angle = this._data.angles.item(i);
                    if (angle.isRelated(line))
                    {
                        this.removeAngle(angle, true);
                        i--;
                    }
                }
            }
        }
        public removeLineSegment(segment: ActiveLineSegment): void
        {
            if (!segment.disposed)
            {
                const transaction = this.beginUndo(Resources.string("Удаление сегмента {0}", segment.name));
                try
                {
                    this._data.lines.remove(segment);
                    segment.dispose();
                    if (this.canRemovePoint(segment.start))
                    {
                        this.removePoint(segment.start);
                    }
                    if (this.canRemovePoint(segment.end))
                    {
                        this.removePoint(segment.end);
                    }

                    for (let i = 0; i < this._data.angles.length; i++)
                    {
                        const angle = this._data.angles.item(i);
                        if (angle.isRelated(segment))
                        {
                            this.removeAngle(angle, true);
                            i--;
                        }
                    }
                    transaction.commit();
                }
                catch (error)
                {
                    transaction.rollback();
                    throw error;
                }
            }
        }
        public removeCircleLine(circle: ActiveCircleLine): void
        {
            if (!circle.disposed)
            {
                const transaction = this.beginUndo(Resources.string("Удалить окружность {0}", circle.name));
                try
                {
                    this._data.circles.remove(circle);
                    circle.dispose();
                    if (this.canRemovePoint(circle.point1))
                    {
                        this.removePoint(circle.point1);
                    }
                    if (this.canRemovePoint(circle.point2))
                    {
                        this.removePoint(circle.point2);
                    }
                    transaction.commit();
                }
                catch (error)
                {
                    transaction.rollback();
                    throw error;
                }
            }
        }
        public removeAxes(axes: AxesLines): void
        {
            for (let i = 0; !axes.disposed && i < this._data.parametric.length; i++)
            {
                const line = this._data.parametric.item(i);
                if (line.axes == axes)
                {
                    this.removeParametricLine(line);
                    i--;
                }
            }
        }
        public removeParametricLine(parametric_line: ParametricLine): void
        {
            if (!parametric_line.disposed)
            {
                const transaction = this.beginUndo(Resources.string("Удалить график {0}", parametric_line.code.text));
                try
                {
                    this._data.parametric.remove(parametric_line);
                    parametric_line.dispose();
                    const axes = parametric_line.axes;
                    if (this.getParametricLines(axes).length == 0)
                    {
                        this._data.axes.remove(axes);
                        axes.dispose();
                    }
                    transaction.commit();
                }
                catch (error)
                {
                    transaction.rollback();
                    throw error;
                }
            }
        }
        public setLineSegmentState(point: ActivePoint): void
        {
            this.addToolTip(Resources.string("Выберите вторую точку"));
            this._state = { action: "line segment", activeItem: point, pitchPoint: point };
        }
        public setAngleIndicatorState(segment: ActiveLineSegment, pitch_point: IPoint): void
        {
            this._tooltip = new Tooltip(() => this._mouseArea.mousePoint.x, () => this._mouseArea.mousePoint.y, Resources.string("Выберите вторую прямую"));
            this._state = { action: "angle indicator", activeItem: segment, pitchPoint: pitch_point };
        }
        public setBisectorState(segment: ActiveLineSegment, pitch_point: IPoint): void
        {
            this._tooltip = new Tooltip(() => this._mouseArea.mousePoint.x, () => this._mouseArea.mousePoint.y, Resources.string("Выберите вторую прямую"));
            this._state = { action: "bisector", activeItem: segment, pitchPoint: pitch_point };
        }
        public setParallelLineState(segment: ActiveLineBase): void
        {
            this.addToolTip(Resources.string("Выберите || прямую"));
            this._state = { action: "parallel", activeItem: segment };
        }
        public setPerpendicularLineState(segment: ActiveLineSegment): void
        {
            this.addToolTip(Resources.string("Выберите ⟂ прямую"));
            this._state = { action: "perpendicular", activeItem: segment };
        }
        public setCirclRadiusState(point: ActivePoint): void
        {
            this.addToolTip(Resources.string("Выберите вторую точку"));
            this._state = { action: "circle radius", activeItem: point, pitchPoint: point };
        }
        public setCirclDiameterState(point: ActivePoint): void
        {
            this.addToolTip(Resources.string("Выберите вторую точку"));
            this._state = { action: "circle diameter", activeItem: point, pitchPoint: point };
        }
        public setLineState(point: ActivePoint): void
        {
            this.addToolTip(Resources.string("Выберите вторую точку"));
            this._state = { action: "line", activeItem: point, pitchPoint: point };
        }
        public addParametricLine(point: IPoint, axes?: AxesLines): void
        {
            const dialog = new ExpressionDialog(
                this,
                makeMod(this, () => (this.mouseArea.offset.x + this.mouseArea.w / 2 - this.mouseArea.w / 10) / this.mouseArea.ratio),
                makeMod(this, () => (this.mouseArea.offset.y + this.mouseArea.h / 2 - this.mouseArea.h / 10) / this.mouseArea.ratio)
            );
            dialog.onEnter.bind(this, (event: CustomEvent<CodeElement | undefined>) => 
            {
                if (event.detail)
                {
                    const transaction = this.beginUndo("Добавление функции");
                    try
                    {
                        const new_axes = !axes;
                        axes = axes ?? new AxesLines(
                            this,
                            this._data.axes.length,
                            point.x,
                            point.y,
                            0.02,
                            0.02,
                            () => CurrentTheme.AxesWidth,
                            () => CurrentTheme.AxesBrush,
                            () => CurrentTheme.AxesSelectBrush,
                        );
                        const line = new ParametricLine(
                            this,
                            () => CurrentTheme.ParametricLineWidth,
                            () => CurrentTheme.ParametricLineBrush,
                            () => CurrentTheme.ParametricLineSelectBrush,
                            axes
                        );
                        line.code = event.detail;
                        if (new_axes)
                        {
                            this._data.axes.push(axes);
                        }
                        this._data.parametric.push(line);
                        transaction.commit();
                    }
                    catch (error)
                    {
                        transaction.rollback();
                        throw error;
                    }
                }
				this.remove(dialog);
				dialog.dispose();
            });
            this.push(dialog);
        }
        public addPoint(point: IPoint): ActivePoint | null
        {
            const lines = new Array<GraphLine>();
            for (let i = 0; i < this._data.lines.length; i++)
            {
                const line = this._data.lines.item(i);
                if (line.mouseHit(point) && !line.isPartOf)
                {
                    lines.push(line);
                    line.selected = true;
                }
            }
            for (let i = 0; i < this._data.circles.length; i++)
            {
                const circle = this._data.circles.item(i);
                if (circle.mouseHit(point))
                {
                    lines.push(circle);
                    circle.selected = true;
                }
            }
            for (let i = 0; i < this._data.parametric.length; i++)
            {
                const graph = this._data.parametric.item(i);
                if (graph.mouseHit(point))
                {
                    lines.push(graph);
                    graph.selected = true;
                }
            }
            this._groupNo++;
            if (lines.length == 0)
            {
                const transaction = this.beginUndo(Resources.string("Добавление точки"));
                try
                {
                    const p = new ActivePoint(this, point.x, point.y);
                    p.setName(this.nextPointName());
                    p.selected = true;
                    this._addPoint(p);
                    transaction.commit();
                    return p;
                }
                catch (error)
                {
                    transaction.rollback();
                    throw error;
                }
            }
            else if (lines.length == 1)
            {
                const transaction = this.beginUndo(Resources.string("Добавление точки"));
                try
                {
                    const line = lines[0];
                    const intersection: IPoint = Intersection.makePoint(point, line);
                    const p = new ActiveCommonPoint(this, intersection.x, intersection.y, this._groupNo);
                    line.addPoint(p);
                    p.addGraphLine(line);
                    p.setName(this.nextPointName());
                    p.selected = true;
                    this._addPoint(p);
                    transaction.commit();
                    return p;
                }
                catch (error)
                {
                    transaction.rollback();
                    throw error;
                }
            }
            else if (lines.length > 1)
            {
                const transaction = this.beginUndo(Resources.string("Добавление точки"));
                try
                {
                    const start_index = this._data.points.length;
                    for (let i = 0; i < lines.length; i++)
                    {
                        const line1 = lines[i];
                        for (let j = i + 1; j < lines.length; j++)
                        {
                            const line2 = lines[j];
                            const intersection = Intersection.makePoint(point, line1, line2);
                            const p = new ActiveCommonPoint(this, intersection.x, intersection.y, this._groupNo);
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
                catch (error)
                {
                    transaction.rollback();
                    throw error;
                }
            }
            return null;
        }
        public new(): void
        {
            this._mouseArea.setOffset(0, 0);
            this._data.dispose(this);
            this._data = new DocumentData();
            this._data.initialize(this);
            this.name = "";
        }
        public save(): string
        {
            const info_separator = Document._infoSeparatorV2;
            const ret: Array<string> = [];
            ret.push(`v${Document.actualSerializationVersion}`);
            const context: SerializationContext =
            {
                points: {},
                lines: {}
            };
            const join_data = (data: Array<string>): string => Utils.SerializeHelper.joinData(data, info_separator);
            for (let i = 0; i < this._data.points.length; i++)
            {
                const point = this._data.points.item(i);
                const tag = point instanceof ActiveCommonPoint ? `cp` : `p`;
                ret.push(`${tag}${info_separator}${join_data(point.serialize(context))}`);
                context.points[point.name] = i;
            }
            for (let i = 0; i < this._data.lines.length; i++)
            {
                const line = this._data.lines.item(i);
                if (line instanceof ActiveLineSegment)
                {
                    ret.push(`l${info_separator}${join_data(line.serialize(context))}`);
                }
                else if (line instanceof ActiveLine)
                {
                    ret.push(`ll${info_separator}${join_data(line.serialize(context))}`);
                }
                else
                {
                    assert(false, "Logical error");
                }
                context.lines[line.name] = i;
            }
            for (let i = 0; i < this._data.angles.length; i++)
            {
                const angle = this._data.angles.item(i);
                ret.push(`a${info_separator}${join_data(angle.serialize(context))}`);
            }
            for (let i = 0; i < this._data.circles.length; i++)
            {
                const circle = this._data.circles.item(i);
                ret.push(`c${info_separator}${join_data(circle.serialize(context))}`);
            }
            for (let i = 0; i < this._data.axes.length; i++)
            {
                const axes = this._data.axes.item(i);
                ret.push(`ax${info_separator}${join_data(axes.serialize(context))}`);
            }
            for (let i = 0; i < this._data.parametric.length; i++)
            {
                const line = this._data.parametric.item(i);
                ret.push(`pl${info_separator}${join_data(line.serialize(context))}`);
            }
            if (ret.length > 1)
            {
                return Utils.SerializeHelper.joinData(ret, Document._chunkSeparator);
            }
            else
            {
                return "";
            }
        }
        public open(data: string): void
        {
            const groups: Record<number, { start_index: number, end_index: number }> = {};
            const old_data = this._data;
            let info_separator: string = Document._infoSeparatorV1;
            let serialization_version = Document.serializationVersion1;
            if (data.length > 2 && data.charAt(0) == "v")
            {
                const end_version_index = data.indexOf(Document._chunkSeparator);
                const version = data.substring(1, end_version_index);
                if (toInt(version) == Document.actualSerializationVersion)
                {
                    serialization_version = toInt(version);
                    info_separator = Document._infoSeparatorV2;
                    data = data.substr(end_version_index + 1);
                }
            }
            else if (data.length == 0)
            {
                return;
            }

            const context: DesializationContext =
            {
                document: this,
                data: new DocumentData(),
                version: serialization_version
            };

            this._data = context.data;

            try
            {
                const chunks = Utils.SerializeHelper.splitData(data, Document._chunkSeparator);
                const error = new Error(Resources.string("Невозможно восстановить данные"));
                for (const chunk of chunks)
                {
                    const info = Utils.SerializeHelper.splitData(chunk, info_separator);

                    if (info.length < 1)
                    {
                        throw error;
                    }
                    switch (info[0])
                    {
                        case "cp":
                            {
                                const point = ActiveCommonPoint.deserialize(context, info, 1);
                                if (point)
                                {
                                    this._addPoint(point);
                                    this._groupNo = Math.max(this._groupNo, point.groupNo);
                                    if (!groups[point.groupNo])
                                    {
                                        groups[point.groupNo] =
                                        {
                                            start_index: this._data.points.length - 1,
                                            end_index: this._data.points.length
                                        };
                                    }
                                    else
                                    {
                                        groups[point.groupNo].end_index = this._data.points.length;
                                    }
                                }
                                else
                                {
                                    throw error;
                                }
                            }
                            break;
                        case "p":
                            {
                                const point = ActivePoint.deserialize(context, info, 1);
                                if (point)
                                {
                                    this._addPoint(point);
                                }
                                else
                                {
                                    throw error;
                                }
                            }
                            break;
                        case "l":
                            {
                                const line = ActiveLineSegment.deserialize(context, info, 1);
                                if (line)
                                {
                                    this._data.lines.push(line);
                                }
                                else
                                {
                                    throw error;
                                }
                            }
                            break;
                        case "ll":
                            {
                                const line = ActiveLine.deserialize(context, info, 1);
                                if (line)
                                {
                                    this._data.lines.push(line);
                                }
                                else
                                {
                                    throw error;
                                }
                            }
                            break;
                        case "a":
                            {
                                const angle = AngleIndicator.deserialize(context, info, 1);
                                if (angle)
                                {
                                    this._data.angles.push(angle);
                                }
                                else
                                {
                                    throw error;
                                }
                            }
                            break;
                        case "c":
                            {
                                const circle = ActiveCircleLine.deserialize(context, info, 1);
                                if (circle)
                                {
                                    this._data.circles.push(circle);
                                }
                                else
                                {
                                    throw error;
                                }
                            }
                            break;
                        case "ax":
                            {
                                const axes = AxesLines.deserialize(context, info, 1);
                                if (axes)
                                {
                                    this._data.axes.push(axes);
                                }
                                else
                                {
                                    throw error;
                                }
                            }
                            break;
                        case "pl":
                            {
                                const line = ParametricLine.deserialize(context, info, 1);
                                if (line)
                                {
                                    this._data.parametric.push(line);
                                }
                                else
                                {
                                    throw error;
                                }
                            }
                            break;
                        default:
                            throw error;
                    }
                }
            }
            catch (ex)
            {
                this._data.dispose();
                this._data = old_data;
                this.alert(ex.toString());
                return;
            }

            this._data = old_data;
            old_data.dispose(this);
            this._data = context.data;
            this._data.initialize(this);

            this._groupNo = 0;
            for (const group_id in groups)
            {
                const group_no = toInt(group_id);
                this._groupNo = Math.max(this._groupNo, group_no);
                this.addGroupVisibility(groups[group_no].start_index, groups[group_no].end_index);
            }
            this._mouseArea.setOffset(0, 0);
        }
        public copyToClipboard(data: string): Promise<void>
        {
            return navigator.clipboard.writeText(data);
        }
        public prompt(message: string, default_value?: string): string | null
        {
            return window.prompt(message, default_value);
        }
        public promptNumber(message: string, default_value?: number): number | null
        {
            const number_text = this.prompt(Resources.string("{0}\r\nВведите число", message), default_value?.toString());
            if (number_text)
            {
                const number = parseFloat(number_text);
                if (number_text == `${number}`)
                {
                    return number;
                }
                else
                {
                    this.alert(Resources.string("Значение '{0}' не является числом", number_text));
                }
            }
            return default_value == undefined ? null : default_value;
        }
        public addSelectedSprite(sprite: Sprite.Sprite): void
        {
            assert(this._selectedSprites.indexOf(sprite) == -1);
            this._selectedSprites.push(sprite);
        }
        public removeSelectedSprite(sprite: Sprite.Sprite): void
        {
            const index = this._selectedSprites.indexOf(sprite);
            //assert(index >= 0);
            //TODO not accurate
            if (index >= 0)
            {
                this._selectedSprites.splice(index, 1);
            }
        }
        public beginUndo(action_name: string): UndoTransaction
        {
            class UndoTransactionImpl extends UndoTransaction
            {
                commit(): void
                {
                    this._undoLevel--;
                    assert(this._undoLevel >= 0);
                    if (this._undoLevel == 0)
                    {
                        if (this._rollingBack)
                        {
                            this._undoLevel++;
                            this.rollback();
                        }
                        else
                        {
                            if (this.document._currentUndoPosition < this.document._undoStack.length)
                            {
                                this.document._undoStack.splice(this.document._currentUndoPosition);
                            }
                            this.document._undoStack.push({
                                text: this.name,
                                snapshot: this.startSnapshot,
                                offset: this.mouseAreaOffset
                            });
                            if (this.document._undoStack.length > Document._maximalUndoStackSize)
                            {
                                this.document._undoStack.splice(0, 1);
                            }
                            this.document._currentUndoPosition = this.document._undoStack.length;
                            delete this.document._currentTransaction;
                            FileTool.saveLastState(this.document.save());
                        }
                    }
                }
                rollback(): void
                {
                    this._undoLevel--;
                    this._rollingBack = true;
                    assert(this._undoLevel >= 0);
                    if (this._undoLevel == 0)
                    {
                        this.document.open(this.startSnapshot);
                        delete this.document._currentTransaction;
                    }
                }
                public upLevel(): void
                {
                    this._undoLevel++;
                }

                private _undoLevel: number = 0;
                private _rollingBack: boolean = false;
            }

            if (!this._currentTransaction)
            {
                this._currentTransaction = new UndoTransactionImpl(this, action_name, this.save(), this.mouseArea.offset);
            }

            (this._currentTransaction as UndoTransactionImpl).upLevel();
            return this._currentTransaction;
        }
        public canUndo(): boolean
        {
            return this._undoStack.length > 0 && this._currentUndoPosition != 0;
        }
        public canRedo(): boolean
        {
            return this._undoStack.length > 0 && this._currentUndoPosition < (this._undoStack.length - 1);
        }
        public undo(): void
        {
            assert(this.canUndo());
            if (this._currentUndoPosition == this._undoStack.length)
            {
                this._undoStack.push({
                    text: this._undoStack[this._undoStack.length - 1].text,
                    snapshot: this.save(),
                    offset: this.mouseArea.offset
                });
            }
            this._currentUndoPosition--;
            const undo_info = this._undoStack[this._currentUndoPosition];
            this.open(undo_info.snapshot);
            this.mouseArea.setOffset(undo_info.offset.x, undo_info.offset.y);
        }
        public redo(): void
        {
            assert(this.canRedo());
            this._currentUndoPosition++;
            const undo_info = this._undoStack[this._currentUndoPosition];
            this.open(undo_info.snapshot);
            this.mouseArea.setOffset(undo_info.offset.x, undo_info.offset.y);
        }
        public static getTicks(): number
        {
            return new Date().getTime();
        }
        public static forceCloseMenu(move_tool: MoveTool): void
        {
            assert(move_tool.document.contains(move_tool));
            move_tool.document._contextMenu?.close();
        }

        public static readonly serializationVersion1: number = 1;
        public static readonly actualSerializationVersion: number = 2;

        protected innerDraw(play_ground: PlayGround): void
        {
            Utils.UpdateCalcRevision();
            if (this._onBeforeDraw)
            {
                this._onBeforeDraw.emitEvent(new CustomEvent<BeforeDrawEvent>("BeforeDrawEvent"));
            }


            const current_transform = play_ground.context2d.getTransform();
            const matrix = DOMMatrix.fromMatrix(current_transform);            

            matrix.a *= play_ground.ratio;
            matrix.d *= play_ground.ratio;
            play_ground.context2d.setTransform(matrix);
            this._background.draw(play_ground);
            this._tools.draw(play_ground);

            matrix.e -= this._mouseArea.offset.x * play_ground.ratio;
            matrix.f -= this._mouseArea.offset.y * play_ground.ratio;
            play_ground.context2d.setTransform(matrix);
            super.innerDraw(play_ground);

            if (this._contextMenu)
            {
                this._contextMenu.draw(play_ground);
            }
            if (this._state && this._state.activeItem)
            {
                this._state.activeItem.draw(play_ground);
            }
            if (this._tooltip)
            {
                this._tooltip.draw(play_ground);
            }

            play_ground.context2d.setTransform(current_transform);
            this._preventShowMenu = false;
        }
        protected mouseClick(event: MouseEvent): void
        {
            if (this._tooltip)
            {
                this._tooltip.dispose();
                delete this._tooltip;
            }

            if (this._state)
            {
                let transaction: UndoTransaction | undefined;
                try
                {
                    switch (this._state.action)
                    {
                        case "line segment":
                            {
                                transaction = this.beginUndo(Resources.string("Добавление сегмента"));
                                const end_point = this.getPoint(event) ?? this.addPoint(event);
                                assert(end_point);
                                this.execLineSegmentState(end_point);
                            }
                            break;
                        case "angle indicator":
                            {
                                const other_segment = this.getLineSegment(event);
                                if (other_segment)
                                {
                                    transaction = this.beginUndo(Resources.string("Отобразить угол"));
                                    this.execAngleIndicatorState(other_segment, event);
                                }
                            }
                            break;
                        case "bisector":
                            {
                                const other_segment = this.getLineSegment(event);
                                if (other_segment)
                                {
                                    transaction = this.beginUndo(Resources.string("Показать биссектрисы углов"));
                                    this.execBisectorState(other_segment, event);
                                }
                            }
                            break;
                        case "parallel":
                            {
                                const other_segment = this.getLine<ActiveLineBase>([ActiveLineSegment, ActiveLine], event);
                                if (other_segment)
                                {
                                    transaction = this.beginUndo(Resources.string("Сделать ||"));
                                    this.execParallelLineState(other_segment);
                                }
                            }
                            break;
                        case "perpendicular":
                            {
                                const other_segment = this.getLineSegment(event);
                                if (other_segment)
                                {
                                    transaction = this.beginUndo(Resources.string("Сделать ⟂"));
                                    this.execPerpendicularLineState(other_segment);
                                }
                            }
                            break;
                        case "circle radius":
                        case "circle diameter":
                            {
                                transaction = this.beginUndo(Resources.string("Добавление окружности"));
                                const end_point = this.getPoint(event) ?? this.addPoint(event);
                                assert(end_point);
                                const radius = this._state.action == "circle radius";
                                this.execCircleState(end_point, radius ? CircleLineKind.Radius : CircleLineKind.Diameter);
                            }
                            break;
                        case "line":
                            {
                                transaction = this.beginUndo(Resources.string("Добавление линии"));
                                const end_point = this.getPoint(event) ?? this.addPoint(event);
                                assert(end_point);
                                this.execLineState(end_point);
                            }
                            break;
                        default:
                            assert(false);
                    }
                    delete this._state;
                    this._preventShowMenu = true;
                    transaction?.commit();
                }
                catch (ex)
                {
                    transaction?.rollback();
                    delete this._state;
                    window.alert(ex);
                }
            }
        }
        protected execLineSegmentState(end_point: ActivePoint): void
        {
            assert(this._state && this._state.activeItem instanceof ActivePoint);
            let start_point = this._state.activeItem as ActivePoint;
            if (!this.getPoint(start_point))
            {
                const p = this.addPoint(start_point);
                assert(p);
                start_point = p;
            }
            if (start_point == end_point)
            {
                throw Error(Resources.string("Нельзя провести линию к той же точке!"));
            }
            else
            {
                for (let i = 0; i < this._data.lines.length; i++)
                {
                    const line = this._data.lines.item(i);
                    if (line.belongs(start_point) && line.belongs(end_point))
                    {
                        throw Error(Resources.string("Отрезок {0} уже проведен!", line.name));
                    }
                }
            }

            this._addLineSegment(start_point, end_point);
        }
        protected execAngleIndicatorState(other_segment: ActiveLineSegment, select_point: IPoint): AngleIndicator
        {
            assert(this._state && this._state.activeItem instanceof ActiveLineSegment);
            let segment = this._state.activeItem as ActiveLineSegment;
            let common_point: ActivePointBase | undefined;
            for (const point of other_segment.points)
            {
                if (segment.belongs(point))
                {
                    common_point = point;
                    break;
                }
            }
            if (common_point)
            {
                if (segment == other_segment)
                {
                    throw Error(Resources.string("Угол может быть обозначен только между различными прямыми, имеющими одну общую точку."));
                }
                else
                {
                    for (let i = 0; i < this._data.angles.length; i++)
                    {
                        const angle = this._data.angles.item(i);
                        if ((angle.segment1 == segment && angle.segment2 == other_segment) ||
                            (angle.segment1 == other_segment && angle.segment2 == segment))
                        {
                            if (!angle.enabled)
                            {
                                angle.enabled = true;
                                return angle;
                            }
                            else
                            {
                                throw Error(Resources.string("Угол между прямыми {0} и {1} уже обозначен.", segment.name, other_segment.name));
                            }
                        }
                    }
                    if (common_point instanceof ActiveCommonPoint)
                    {
                        assert(this._state.pitchPoint);
                        let intersect = PointLineSegment.intersected(
                            this._state.pitchPoint,
                            segment.start,
                            common_point,
                            Thickness.Mouse
                        );
                        if (intersect)
                        {
                            segment = this.getLineSegment(segment.start, common_point) ??
                                this._addLineSegment(segment.start, common_point);
                        }
                        else
                        {
                            intersect = PointLineSegment.intersected(
                                this._state.pitchPoint,
                                common_point,
                                segment.end,
                                Thickness.Mouse
                            );
                            if (intersect)
                            {
                                segment = this.getLineSegment(common_point, segment.end) ??
                                    this._addLineSegment(common_point, segment.end);
                            }
                            else
                            {
                                throw Error(Resources.string("Угол может быть обозначен только между различными прямыми, имеющими одну общую точку."));
                            }
                        }

                        intersect = PointLineSegment.intersected(
                            select_point,
                            other_segment.start,
                            common_point,
                            Thickness.Mouse
                        );
                        if (intersect)
                        {
                            other_segment = this.getLineSegment(other_segment.start, common_point) ??
                                this._addLineSegment(other_segment.start, common_point);
                        }
                        else
                        {
                            intersect = PointLineSegment.intersected(
                                select_point,
                                common_point,
                                other_segment.end,
                                Thickness.Mouse
                            );
                            if (intersect)
                            {
                                other_segment = this.getLineSegment(common_point, other_segment.end) ??
                                    this._addLineSegment(common_point, other_segment.end);
                            }
                            else
                            {
                                throw Error(Resources.string("Угол может быть обозначен только между различными прямыми, имеющими одну общую точку."));
                            }
                        }
                    }
                    return this._addAngleIndicator(segment, other_segment);
                }
            }
            else
            {
                throw Error(Resources.string("Отрезки {0} и {1} не содержат общих точек", segment.name, other_segment.name));
            }
        }
        protected execBisectorState(other_segment: ActiveLineSegment, select_point: IPoint): void
        {
            assert(this._state && this._state.activeItem instanceof ActiveLineSegment);
            const segment = this._state.activeItem as ActiveLineSegment;
            for (let i = 0; i < this._data.angles.length; i++)
            {
                const angle = this._data.angles.item(i);
                if (angle.isRelated(segment) && angle.isRelated(other_segment))
                {
                    if (angle.hasBisector)
                    {
                        throw Error(Resources.string("Биссектриса угла {0} уже проведена.", angle.name));
                    }
                    else
                    {
                        angle.addBisector();
                    }
                    return;
                }
            }
            const angle = this.execAngleIndicatorState(other_segment, select_point);
            angle.addBisector();
            angle.enabled = false;
        }
        protected execParallelLineState(other_line: ActiveLineBase): void
        {
            assert(this._state && this._state.activeItem instanceof ActiveLineBase);
            assert(other_line.startPoint instanceof ActivePointBase && other_line.endPoint instanceof ActivePointBase);
            if (this._state.activeItem.belongs(other_line.startPoint) || this._state.activeItem.belongs(other_line.endPoint))
            {
                this.alert(Resources.string("Отрезки {0} и {1} имеют общую точку и не могут стать ||.", this._state.activeItem.name, other_line.name));
            }
            else
            {
                this._state.activeItem.setParallelTo(other_line);
            }
        }
        protected execPerpendicularLineState(other_segment: ActiveLineSegment): void
        {
            assert(this._state && this._state.activeItem instanceof ActiveLineSegment);
            const segment = this._state.activeItem as ActiveLineSegment;
            if (!segment.belongs(other_segment.start) && !segment.belongs(other_segment.end))
            {
                this.alert(Resources.string("Отрезки {0} и {1} не имеют общей точки и не могут стать ⟂.", segment.name, other_segment.name));
            }
            else
            {
                segment.setPerpendicularTo(other_segment);
            }
        }
        protected execCircleState(pivot_point: ActivePoint, kind: CircleLineKind): void
        {
            assert(this._state && this._state.activeItem instanceof ActivePoint);
            let center_point = this._state.activeItem as ActivePoint;
            if (!this.getPoint(center_point))
            {
                const p = this.addPoint(center_point);
                assert(p);
                center_point = p;
            }
            if (center_point == pivot_point)
            {
                throw Error(Resources.string("Нельзя провести окружность к той же точке!"));
            }
            else
            {
                for (let i = 0; i < this._data.circles.length; i++)
                {
                    const circle = this._data.circles.item(i);
                    if (circle.kind == kind)
                    {
                        switch (kind)
                        {
                            case CircleLineKind.Diameter:
                                if ((circle.point1 == center_point && circle.point2 == pivot_point) || (circle.point1 == pivot_point && circle.point2 == center_point))
                                {
                                    throw Error(Resources.string("Окружность {0} уже проведена!", circle.name));
                                }
                                break;
                            case CircleLineKind.Radius:
                                if (circle.point1 == center_point && circle.point2 == pivot_point)
                                {
                                    throw Error(Resources.string("Окружность {0} уже проведена!", circle.name));
                                }
                                break;
                            default:
                                assert(false);
                        }
                    }
                }
            }

            this._addCircle(kind, center_point, pivot_point);
        }
        protected execLineState(end_point: ActivePoint): void
        {
            assert(this._state && this._state.activeItem instanceof ActivePoint);
            let start_point = this._state.activeItem as ActivePoint;
            if (!this.getPoint(start_point))
            {
                const p = this.addPoint(start_point);
                assert(p);
                start_point = p;
            }
            if (start_point == end_point)
            {
                throw Error(Resources.string("Нельзя провести линию к той же точке!"));
            }
            else
            {
                for (let i = 0; i < this._data.lines.length; i++)
                {
                    const line = this._data.lines.item(i);
                    if (line instanceof ActiveLine && line.belongs(start_point) && line.belongs(end_point))
                    {
                        throw Error(Resources.string("Линия {0} уже проведена!", line.name));
                    }
                }
            }

            this._addLine(start_point, end_point);
        }
        protected addGroupVisibility(start_index: number, end_index: number): void
        {
            let group_no: number = -1;
            const groups = new Array<ActiveCommonPoint>();
            for (let i = start_index; i < end_index; i++)
            {
                const current_index = i;
                const p = this._data.points.item(i) as ActiveCommonPoint;
                if (group_no == -1)
                {
                    group_no = p.groupNo;
                }
                assert(group_no == p.groupNo);
                groups.push(p);
            }
            for (let i = start_index + 1; i < end_index; i++)
            {
                //must be a constant, because it's must closure unique references to each point
                const point = this._data.points.item(i);
                point.addVisible((value: boolean) =>
                {
                    for (const sibling_point of groups)
                    {
                        if (point == sibling_point)
                        {
                            break;
                        }
                        else if (!sibling_point.disposed &&
                            sibling_point.visible &&
                            point.mouseHit(sibling_point)
                        )
                        {
                            return false;
                        }
                    }
                    return value;
                });
            }
        }
        protected canRemovePoint(point: ActivePoint): boolean
        {
            for (let i = 0; i < this._data.lines.length; i++)
            {
                if (this._data.lines.item(i).belongs(point))
                {
                    return false;
                }
            }
            for (let i = 0; i < this._data.circles.length; i++)
            {
                if (this._data.circles.item(i).belongs(point))
                {
                    return false;
                }
            }

            return true;
        }
        protected static getName(index: number, pattern: string): string
        {
            let name = pattern.charAt(index % pattern.length);
            for (let j = 0; j < toInt(index / pattern.length); j++)
            {
                name += "'";
            }
            return name;
        }
        protected nextPointName(): string
        {
            let name: string;
            //TODO O(n*(n+1) / 2) ~ O(n^2)
            for (let i = 0; ; i++)
            {
                name = Document.getName(i, Document._pointNames);
                let unique_name = true;
                for (let j = 0; j < this._data.points.length; j++)
                {
                    if (this._data.points.item(j).name == name)
                    {
                        unique_name = false;
                        break;
                    }
                }
                if (unique_name)
                {
                    break;
                }
            }
            return name;
        }
        protected onTap(): void
        {
            PointTool.showMenu(this);
            const move_tool = new MoveTool(this);
            this.push(move_tool);
        }

        private _addPoint(point: ActivePoint): void
        {
            this._data.points.push(point);
        }
        private _addLineSegment(start_point: ActivePoint, end_point: ActivePoint, line_width?: binding<number>, brush?: binding<Sprite.Brush>): ActiveLineSegment
        {
            const segment = new ActiveLineSegment(start_point, end_point, line_width, brush);
            this._data.lines.push(segment);
            return segment;
        }
        private _addAngleIndicator(line1: ActiveLineSegment, line2: ActiveLineSegment): AngleIndicator
        {
            const indicator = new AngleIndicator(this, line1, line2);
            this._data.angles.push(indicator);
            return indicator;
        }
        private _addCircle(kind: CircleLineKind, start_point: ActivePoint, end_point: ActivePoint, line_width?: binding<number>, brush?: binding<Sprite.Brush>): ActiveCircleLine
        {
            const circle = new ActiveCircleLine(this, kind, start_point, end_point, line_width, brush);
            this._data.circles.push(circle);
            return circle;
        }
        private _addLine(start_point: ActivePoint, end_point: ActivePoint, line_width?: binding<number>, brush?: binding<Sprite.Brush>): ActiveLine
        {
            const line = new ActiveLine(start_point, end_point, line_width, brush);
            this._data.lines.push(line);
            return line;
        }

        private readonly _selectedSprites = new Array<Sprite.Sprite>();
        private readonly _background: Background;
        private readonly _tools: Sprite.Container;
        private _data: DocumentData;
        private _tooltip?: Sprite.Sprite;
        private _contextMenu?: Menu;
        private readonly _mouseArea: IMouseArea;
        private _state?: DocState;
        private readonly _mouseClickBinder: IEventListener<MouseEvent>;
        private _onBeforeDraw?: MulticastEvent<BeforeDrawEvent>;
        private _groupNo: number;
        private _preventShowMenu: boolean = false;
        private _currentTransaction?: UndoTransaction;
        private readonly _undoStack = new Array<UndoInfo>();
        private _currentUndoPosition: number = 0;

        private static readonly _pointNames: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        private static readonly _chunkSeparator: string = ";";
        private static readonly _infoSeparatorV1: string = "|";
        private static readonly _infoSeparatorV2: string = "-";
        private static readonly _maximalUndoStackSize: number = 200;
    }
}