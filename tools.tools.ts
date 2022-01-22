/// <reference path="utils.ts" />
/// <reference path="sprites.ts" />
/// <reference path="polygons.ts" />
/// <reference path="interfaces.ts" />
/// <reference path="play_ground.ts" />
/// <reference path="tools.core.ts" />
/// <reference path="tools.styles.ts" />
/// <reference path="tools.document.ts" />
/// <reference path="tools.point.base.ts" />
/// <reference path="tools.resources.ts" />

module Geoma.Tools
{
    import makeMod = Utils.makeMod;
    import makeProp = Utils.makeProp;
    import Point = Utils.Point;
    import assert = Utils.assert;
    import MulticastEvent = Utils.MulticastEvent;
    import property = Utils.ModifiableProperty;
    import binding = Utils.binding;

    abstract class ToolBase extends ActivePointBase
    {
        constructor(document: Document, x: number, y: number, radius: number, line_width: number, name: binding<string>, enabled: property<boolean> = new property<boolean>(true))
        {
            super(
                document,
                x,
                y,
                radius,
                line_width,
                () => enabled.value ? CurrentTheme.ToolBrush : CurrentTheme.ToolDisabledBrush,
                () => enabled.value ? CurrentTheme.ToolLineBrush : CurrentTheme.ToolDisabledLineBrush,
                () => enabled.value ? CurrentTheme.ToolSelectLineBrush : CurrentTheme.ToolDisabledLineBrush
            );
            if (document.mouseArea instanceof PlayGround && !document.mouseArea.touchInterface)
            {
                this.setName(name, () => CurrentTheme.ToolNameBrush, () => CurrentTheme.ToolNameStyle);
            }
        }

        public mouseHit(point: IPoint): boolean
        {
            return super.mouseHit(Point.sub(point, this.document.mouseArea.offset));
        }
        public isMoved(_receiptor: string): boolean
        {
            return false;
        }

        protected enabled: boolean = true;
    }

    export class PointTool extends ToolBase
    {
        constructor(document: Document, x: number, y: number, radius: number = 5, line_width: number = 2)
        {
            super(document, x, y, radius, line_width, () => Resources.string("Создать"));

            const icon_line_width = 2;
            const ds = ((radius * 5) / 6) - icon_line_width - (line_width / 2);
            const dsw = ds / 3;
            const plus_line = new Polygon.Line(
                Point.make(-ds, -dsw),
                Point.make(-dsw, -dsw),
                Point.make(-dsw, -ds),
                Point.make(dsw, -ds),
                Point.make(dsw, -dsw),
                Point.make(ds, -dsw),
                Point.make(ds, dsw),
                Point.make(dsw, dsw),
                Point.make(dsw, ds),
                Point.make(-dsw, ds),
                Point.make(-dsw, dsw),
                Point.make(-ds, dsw),
                Point.make(-ds, -dsw - (icon_line_width / 2))
            );
            const plus = new Sprite.Polyline(x - icon_line_width / 2, y - icon_line_width / 2, icon_line_width, makeMod(this, () => this.lineBrush));
            plus.addPolygon(plus_line);
            this.item.push(plus);
        }

        public get picked(): boolean
        {
            return this._picked;
        }
        public static showMenu(document: Document): void
        {
            const x = document.mouseArea.mousePoint.x;
            const y = document.mouseArea.mousePoint.y;
            const menu = new Menu(document, x, y);

            let menu_item = menu.addMenuItem(Resources.string("Создать точку"))
            menu_item.onChecked.bind(this, () => document.addPoint(Point.make(x, y)));

            menu_item = menu.addMenuItem(Resources.string("Создать линию..."));
            menu_item.onChecked.bind(this, () => document.setLineState(new ActivePoint(document, x, y)));

            menu_item = menu.addMenuItem(Resources.string("Создать отрезок..."));
            menu_item.onChecked.bind(this, () => document.setLineSegmentState(new ActivePoint(document, x, y)));

            menu_item = menu.addMenuItem(Resources.string("Создать окружность из центра..."));
            menu_item.onChecked.bind(this, () => document.setCirclRadiusState(new ActivePoint(document, x, y)));

            menu_item = menu.addMenuItem(Resources.string("Создать окружность на диаметре..."));
            menu_item.onChecked.bind(this, () => document.setCirclDiameterState(new ActivePoint(document, x, y)));

            menu_item = menu.addMenuItem(Resources.string("Создать функцию..."));
            menu_item.onChecked.bind(this, () => document.addParametricLine(Point.make(x, y)));

            menu.show();
        }

        protected mouseClick(event: MouseEvent): void
        {
            if (this._picked)
            {
                this._picked = false;
                if (this.document.canShowMenu(this))
                {
                    PointTool.showMenu(this.document);
                }
            }
            else
            {
                this._picked = this.selected && this.mouseHit(event);
                if (this.picked)
                {
                    this.document.addToolTip(Resources.string("Выберите место"));
                }
            }
        }
        protected mouseMove(event: MouseEvent): void
        {
            super.mouseMove(event);
            this.selected = this.selected || this.picked;
        }

        private _picked: boolean = false;
    }

    export class FileTool extends ToolBase
    {
        constructor(document: Document, x: number, y: number, radius: number = 5, line_width: number = 2)
        {
            super(document, x, y, radius, line_width, () => Resources.string("Файл"));

            const icon_line_width = 2;
            const file_point = Point.make(x - radius + icon_line_width + line_width / 2, y - radius + icon_line_width + line_width / 2);
            const file = new Sprite.Polyshape(file_point.x, file_point.y, icon_line_width, makeMod(this, () => this.lineBrush), 0.3);
            file.addPolygon(new Polygon.CustomPath(file_point, "M83.012,17.5c0-0.527-0.271-0.99-0.682-1.258L66.477,2.637c-0.15-0.129-0.324-0.211-0.505-0.271C65.709,2.141,65.373,2,65,2 H18.5C17.671,2,17,2.671,17,3.5v93c0,0.828,0.671,1.5,1.5,1.5h63c0.828,0,1.5-0.672,1.5-1.5V18c0-0.067-0.011-0.13-0.02-0.195 C83.001,17.707,83.012,17.604,83.012,17.5z M20,95V5h44v12.5c0,0.829,0.672,1.5,1.5,1.5H80v76H20z"));
            file.addPolygon(new Polygon.CustomPath(file_point, "M69,31H31c-0.552,0-1-0.448-1-1s0.448-1,1-1h38c0.553,0,1,0.448,1,1S69.553,31,69,31z"));
            file.addPolygon(new Polygon.CustomPath(file_point, "M69,45H31c-0.552,0-1-0.448-1-1s0.448-1,1-1h38c0.553,0,1,0.448,1,1S69.553,45,69,45z"));
            file.addPolygon(new Polygon.CustomPath(file_point, "M69,57H31c-0.552,0-1-0.447-1-1s0.448-1,1-1h38c0.553,0,1,0.447,1,1S69.553,57,69,57z"));
            file.addPolygon(new Polygon.CustomPath(file_point, "M69,71H31c-0.552,0-1-0.447-1-1s0.448-1,1-1h38c0.553,0,1,0.447,1,1S69.553,71,69,71z"));
            this.item.push(file);
        }

        public static get LocalStorageKeys(): Array<string>
        {
            const names: Array<string> = [];
            let has_autosave = false;
            for (let i = 0; i < window.localStorage.length; i++)
            {
                const doc_name = window.localStorage.key(i);
                if (doc_name != null)
                {
                    if (FileTool._autosavedDocumentName == doc_name)
                    {
                        has_autosave = true;
                    }
                    else
                    {
                        names.push(doc_name);
                    }
                }
            }
            names.sort(Utils.CompareCaseInsensitive);
            if (has_autosave)
            {
                names.splice(0, 0, FileTool._autosavedDocumentName);
            }
            return names;
        }
        public static saveLastState(data: string)
        {
            window.localStorage.setItem(FileTool._autosavedDocumentName, data);
        }

        protected mouseClick(event: MouseEvent): void
        {
            if (this.mouseHit(event) && this.document.canShowMenu(this))
            {
                const menu = new Menu(this.document, this.x + this.document.mouseArea.offset.x, this.bottom + this.document.mouseArea.offset.y);

                let menu_item = menu.addMenuItem(Resources.string("Новый"));
                menu_item.onChecked.bind(this.document, this.document.new);

                const open_group = menu.addMenuGroup(Resources.string("Открыть"));

                menu_item = menu.addMenuItem(Resources.string("Сохранить"));
                menu_item.onChecked.bind(this, this.saveCommand);
                menu_item.enabled.addModifier(makeMod(this, () => this.document.name != ""));

                menu_item = menu.addMenuItem(Resources.string("Сохранить как..."));
                menu_item.onChecked.bind(this, this.saveCommandAs);

                menu_item = menu.addMenuItem(Resources.string("Копировать"));
                menu_item.onChecked.bind(this, this.copyCommand);

                const delete_group = menu.addMenuGroup(Resources.string("Удалить"));

                for (const name of FileTool.LocalStorageKeys)
                {
                    if (name == SettingsTool.settingsKey)
                    {
                        continue;
                    }
                    else if (name == FileTool._autosavedDocumentName)
                    {
                        menu_item = open_group.addMenuItem(Resources.string("Автоматическое сохранение"));
                        menu_item.onChecked.bind(this, (event: CustomEvent<MenuItem>) => this.openCommand(event, FileTool._autosavedDocumentName));

                        menu_item = delete_group.addMenuItem(Resources.string("Автоматическое сохранение"));
                        menu_item.onChecked.bind(this, (event: CustomEvent<MenuItem>) => this.removeCommand(event, FileTool._autosavedDocumentName));
                    }
                    else
                    {
                        menu_item = open_group.addMenuItem(name);
                        menu_item.onChecked.bind(this, this.openCommand);

                        menu_item = delete_group.addMenuItem(name);
                        menu_item.onChecked.bind(this, this.removeCommand);
                    }
                }

                menu.show();
            }
        }
        protected openCommand(event: CustomEvent<MenuItem>, file_name?: string): void
        {
            const data = window.localStorage.getItem(file_name ?? event.detail.tooltip);
            if (data && data.length)
            {
                this.document.open(data);
                this.document.name = event.detail.tooltip;
            }
            else
            {
                this.document.alert(Resources.string("Файла {0} больше нет", event.detail.tooltip));
                this.removeCommand(event);
            }
        }
        protected removeCommand(event: CustomEvent<MenuItem>, file_name?: string): void
        {
            window.localStorage.removeItem(file_name ?? event.detail.tooltip);
        }
        protected saveCommand(): void
        {
            assert(this.document.name);
            const data = this.document.save();
            window.localStorage.setItem(this.document.name, data);
        }
        protected saveCommandAs(): void
        {
            const data = this.document.save();
            const save_name = this.document.prompt(Resources.string("Введите имя документа"));
            if (save_name != null)
            {
                window.localStorage.setItem(save_name, data);
                this.document.name = save_name;
            }
        }
        protected copyCommand(): void
        {
            let data = this.document.save();
            let href = document.location.href;
            const index = href.indexOf(document.location.hash);
            if (index > 0)
            {
                href = href.substr(0, index);
            }
            data = encodeURI(`${href}#${data}`);
            if (window.prompt(Resources.string("Постоянная ссылка на документ"), data) != null)
            {
                this.document.copyToClipboard(data).catch((error: Error) =>
                {
                    this.document.alert(error.message);
                });
            }
        }

        private static readonly _autosavedDocumentName: string = "{44ED56BE-46A8-4C51-8726-E1D6B4696A38}";
    }

    interface Settings
    {
        version: number;
        themeName?: string;
        languageId?: UiLanguage;
        showProperties?: boolean;
    }

    export class SettingsTool extends ToolBase
    {
        constructor(document: Document, x: number, y: number, radius: number = 5, line_width: number = 2)
        {
            super(document, x, y, radius, line_width, ()=> Resources.string("Настройки"));
            const settings = this.settings;
            if (settings.version == SettingsTool._settingsVersion)
            {
                switch (settings.themeName)
                {
                    case "DefaultTheme":
                        CurrentTheme = DefaultTheme;
                        break;
                    case "BlueTheme":
                        CurrentTheme = BlueTheme;
                        break;
                    default:
                        CurrentTheme = DefaultTheme;
                        break;
                }
                Resources.language = settings.languageId ?? UiLanguage.enUs;
                if (settings.showProperties)
                {
                    this.document.onOffProperties();
                }
            }
            const icon_line_width = 2;
            const gear_point = Point.make(x - radius + icon_line_width + line_width / 2, y - radius + icon_line_width + line_width / 2);
            const gear = new Sprite.Polyshape(gear_point.x, gear_point.y, icon_line_width, makeMod(this, () => this.lineBrush), 0.1);
            //gear.addPolygon(new Polygon.CustomPath(gear_point, "m150.057,105.1c-24.789,0 -44.955,20.167 -44.955,44.955s20.166,44.955 44.955,44.955c24.789,0 44.955,-20.167 44.955,-44.955s-20.167,-44.955 -44.955,-44.955zm0,73.26c-15.607,0 -28.305,-12.697 -28.305,-28.305s12.697,-28.305 28.305,-28.305c15.608,0 28.305,12.697 28.305,28.305s-12.699,28.305 -28.305,28.305z"));
            gear.addPolygon(new Polygon.CustomPath(gear_point, "m297.365,183.342l-25.458,-22.983l0,-20.608l25.457,-22.981c2.614,-2.361 3.461,-6.112 2.112,-9.366l-13.605,-32.846c-1.348,-3.253 -4.588,-5.305 -8.115,-5.128l-34.252,1.749l-14.571,-14.571l1.749,-34.251c0.18,-3.518 -1.874,-6.769 -5.128,-8.116l-32.847,-13.606c-3.253,-1.35 -7.005,-0.501 -9.365,2.111l-22.984,25.458l-20.606,0l-22.982,-25.458c-2.361,-2.613 -6.112,-3.458 -9.365,-2.111l-32.846,13.605c-3.255,1.348 -5.308,4.599 -5.128,8.116l1.75,34.251l-14.572,14.571l-34.252,-1.749c-3.506,-0.188 -6.768,1.874 -8.115,5.128l-13.607,32.846c-1.348,3.255 -0.502,7.005 2.112,9.366l25.457,22.981l0,20.608l-25.455,22.983c-2.614,2.361 -3.461,6.112 -2.112,9.366l13.605,32.846c1.348,3.255 4.603,5.321 8.115,5.128l34.252,-1.749l14.572,14.571l-1.75,34.251c-0.18,3.518 1.874,6.769 5.128,8.116l32.846,13.606c3.255,1.352 7.005,0.502 9.365,-2.111l22.984,-25.458l20.606,0l22.984,25.458c1.613,1.785 3.873,2.746 6.182,2.746c1.071,0 2.152,-0.208 3.183,-0.634l32.846,-13.606c3.255,-1.348 5.308,-4.599 5.128,-8.116l-1.749,-34.251l14.571,-14.571l34.252,1.749c3.506,0.178 6.768,-1.874 8.115,-5.128l13.605,-32.846c1.348,-3.255 0.502,-7.005 -2.112,-9.366zm-24.628,30.412l-32.079,-1.639c-2.351,-0.127 -4.646,0.764 -6.311,2.428l-19.804,19.804c-1.666,1.666 -2.547,3.958 -2.428,6.311l1.638,32.079l-21.99,9.109l-21.525,-23.843c-1.578,-1.747 -3.824,-2.746 -6.179,-2.746l-28.006,0c-2.355,0 -4.601,0.998 -6.179,2.746l-21.525,23.843l-21.99,-9.109l1.639,-32.079c0.12,-2.353 -0.763,-4.646 -2.429,-6.311l-19.803,-19.804c-1.665,-1.665 -3.955,-2.55 -6.311,-2.428l-32.079,1.639l-9.109,-21.99l23.842,-21.525c1.748,-1.58 2.746,-3.824 2.746,-6.179l0,-28.008c0,-2.355 -0.998,-4.601 -2.746,-6.179l-23.842,-21.525l9.109,-21.99l32.079,1.639c2.354,0.124 4.646,-0.763 6.311,-2.428l19.803,-19.803c1.666,-1.666 2.549,-3.958 2.429,-6.313l-1.639,-32.079l21.99,-9.109l21.525,23.842c1.578,1.747 3.824,2.746 6.179,2.746l28.006,0c2.355,0 4.601,-0.998 6.179,-2.746l21.525,-23.842l21.99,9.109l-1.638,32.079c-0.12,2.353 0.761,4.645 2.428,6.313l19.804,19.803c1.666,1.665 3.959,2.564 6.311,2.428l32.079,-1.639l9.109,21.99l-23.843,21.525c-1.748,1.58 -2.746,3.824 -2.746,6.179l0,28.008c0,2.355 0.998,4.601 2.746,6.179l23.843,21.525l-9.109,21.99z"));
            gear.addPolygon(new Polygon.CustomPath(gear_point, "m150.057,71.357c-43.394,0 -78.698,35.305 -78.698,78.698c0,43.394 35.304,78.698 78.698,78.698c43.394,0 78.698,-35.305 78.698,-78.698c-0.001,-43.394 -35.305,-78.698 -78.698,-78.698zm0,140.746c-34.214,0 -62.048,-27.834 -62.048,-62.048c0,-34.214 27.834,-62.048 62.048,-62.048c34.214,0 62.048,27.834 62.048,62.048c0,34.214 -27.836,62.048 -62.048,62.048z"));
            this.item.push(gear);
        }

        public get settings(): Settings
        {
            const settings_data = window.localStorage.getItem(SettingsTool.settingsKey);
            if (settings_data)
            {
                return JSON.parse(settings_data) as Settings;
            }
            const settings: Settings =
            {
                version: SettingsTool._settingsVersion,
                themeName: "DefaultTheme"
            }
            return settings;
        }
        public set settings(value: Settings)
        {
            window.localStorage.setItem(SettingsTool.settingsKey, JSON.stringify(value));
        }

        public static readonly settingsKey: string = "{7EB35B62-34AA-4F82-A0EC-283197A8E04E}";

        protected mouseClick(event: MouseEvent): void
        {
            if (this.mouseHit(event) && this.document.canShowMenu(this))
            {
                const menu = new Menu(this.document, this.x + this.document.mouseArea.offset.x, this.bottom + this.document.mouseArea.offset.y);

                const language_group = menu.addMenuGroup("Язык (Language)");

                let menu_item = language_group.addMenuItem("Русский");
                menu_item.onChecked.bind(this, () => this.setLanguage(UiLanguage.ruRu));

                menu_item = language_group.addMenuItem("English (US)");
                menu_item.onChecked.bind(this, () => this.setLanguage(UiLanguage.enUs));

                const theme_group = menu.addMenuGroup(Resources.string("Тема"));

                menu_item = theme_group.addMenuItem(Resources.string("Светлая"));
                menu_item.onChecked.bind(this, () => this.setTheme(BlueTheme));

                menu_item = theme_group.addMenuItem(Resources.string("Тёмная"));
                menu_item.onChecked.bind(this, () => this.setTheme(DefaultTheme));

                menu_item = menu.addMenuItem(Resources.string("Свойства"));
                menu_item.onChecked.bind(this, () => this.onOffProperties());

                menu.show();
            }
        }
        protected setTheme(theme: IThemeStyle): void
        {
            const data = this.document.save();
            CurrentTheme = theme;
            const settings = this.settings;
            settings.themeName = theme.name;
            this.settings = settings;
            this.document.open(data);
        }

        protected setLanguage(language: UiLanguage): void
        {
            Resources.language = language;
            const settings = this.settings;
            settings.languageId = language;
            this.settings = settings;
        }

        protected onOffProperties(): void
        {
            const settings = this.settings;
            settings.showProperties = this.document.onOffProperties();
            this.settings = settings;
        }

        private static readonly _settingsVersion: number = 1;
    }

    export class UndoTool extends ToolBase
    {
        constructor(document: Document, x: number, y: number, radius: number = 5, line_width: number = 2)
        {
            super(document, x, y, radius, line_width, () => Resources.string("Отмена"), new property<boolean>(() => document.canUndo(), false));
            
            const icon_line_width = 2;
            const undo_point = Point.make(x - radius + icon_line_width + line_width / 2 + 2, y - radius + icon_line_width + line_width / 2 + 2);
            const undo_icon = new Sprite.Polyshape(undo_point.x, undo_point.y, icon_line_width, makeMod(this, () => this.lineBrush), 1);
            undo_icon.addPolygon(new Polygon.CustomPath(undo_point, "m17.026,22.957c10.957-11.421-2.326-20.865-10.384-13.309l2.464,2.352h-9.106v-8.947l2.232,2.229c14.794-13.203,31.51,7.051,14.794,17.675z"));
            this.item.push(undo_icon);
        }
        protected mouseClick(event: MouseEvent): void
        {
            if (this.mouseHit(event) && this.document.canUndo())
            {
                this.document.undo();
            }
        }
    }

    export class RedoTool extends ToolBase
    {
        constructor(document: Document, x: number, y: number, radius: number = 5, line_width: number = 2)
        {
            super(document, x, y, radius, line_width, () => Resources.string("Повтор"), new property<boolean>(() => document.canRedo(), false));

            const icon_line_width = 2;
            const redo_point = Point.make(x - radius + icon_line_width + line_width / 2 + 2, y - radius + icon_line_width + line_width / 2 + 2);
            const redo_icon = new Sprite.Polyshape(redo_point.x, redo_point.y, icon_line_width, makeMod(this, () => this.lineBrush), 1);
            redo_icon.addPolygon(new Polygon.CustomPath(redo_point, "m6.974,22.957c-10.957-11.421,2.326-20.865,10.384-13.309l-2.464,2.352h9.106v-8.947l-2.232,2.229c-14.794-13.203-31.51,7.051-14.794,17.675z"));
            this.item.push(redo_icon);
        }
        protected mouseClick(event: MouseEvent): void
        {
            if (this.mouseHit(event) && this.document.canRedo())
            {
                this.document.redo();
            }
        }
    }

    export class TapTool extends DocumentSprite<Sprite.Sprite>
    {
        constructor(
            document: Document,
            delay_time: binding<number>,
            activate_time: binding<number>,
            line_width: binding<number>,
            radius: binding<number>,
            brush: binding<Sprite.Brush>
        )
        {
            class stub extends Sprite.Sprite
            {
                protected innerDraw(__play_ground: PlayGround): void
                {
                    throw new Error("Method not implemented.");
                }
            }
            super(document, new stub());

            this._mouseDownListener = this.document.mouseArea.onMouseDown.bind(this, this.mouseDown);
            this._delayTime = makeProp(delay_time, 0);
            this._activateTime = makeProp(activate_time, 0);
            this._lineWidth = makeProp(line_width, 0);
            this._radius = makeProp(radius, 0);
            this._brush = makeProp(brush, "Black");
            this.visible = false;
            this.onActivate = new MulticastEvent<CustomEvent<IPoint>>();
        }

        public readonly onActivate: MulticastEvent<CustomEvent<IPoint>>;

        public dispose(): void
        {
            if (!this.disposed)
            {
                this._mouseDownListener.dispose();
                this._mouseUpListener?.dispose();
                super.dispose();
            }
        }

        protected innerDraw(play_ground: PlayGround): void
        {
            assert(this._startTicks);
            assert(this._downPoint);
            const elapsed_time = Document.ticks - this._startTicks;
            const active_time = elapsed_time - this._delayTime.value;
            if (active_time >= 0)
            {
                const duration = this._activateTime.value - this._delayTime.value;
                const radius = Math.cos(Math.PI * active_time / duration - Math.PI / 2) * this._radius.value;
                if (active_time >= duration)
                {
                    this.tryActivate(play_ground.mousePoint);
                }
                else
                {
                    const shadow_color = play_ground.context2d.shadowColor;
                    const shadow_blur = play_ground.context2d.shadowBlur;
                    const point = this._downPoint;
                    play_ground.context2d.beginPath();
                    play_ground.context2d.strokeStyle = this._brush.value;
                    play_ground.context2d.lineWidth = this._lineWidth.value;
                    play_ground.context2d.shadowColor = CurrentTheme.TapShadowColor;
                    play_ground.context2d.shadowBlur = CurrentTheme.TapShadowBlure;
                    play_ground.context2d.arc(point.x, point.y, radius, 0, Math.PI * 2, false);
                    play_ground.context2d.lineWidth = 2;
                    play_ground.context2d.stroke();
                    play_ground.context2d.shadowColor = shadow_color;
                    play_ground.context2d.shadowBlur = shadow_blur;
                }
            }
        }
        protected mouseDown(event: MouseEvent): void
        {
            if (this.document.selectedSprites.length == 0)
            {
                assert(!this._mouseUpListener);
                this._mouseUpListener = this.document.mouseArea.onMouseUp.bind(this, this.mouseUp, true);
                this._downPoint = event;
                this._startTicks = Document.ticks;
                this.visible = true;
                this.selected = true;
            }
        }
        protected mouseUp(__event: MouseEvent): void
        {
            this.visible = false;
            this.selected = false;
            assert(this._mouseUpListener);
            this._mouseUpListener.dispose();
            delete this._mouseUpListener;
        }
        protected tryActivate(point: IPoint): void
        {
            if (this._downPoint && this.document.selectedSprites.length == 1 && this.document.canShowMenu(this))
            {
                const dp = Point.sub(this._downPoint, point);
                if ((dp.x * dp.x + dp.y * dp.y) <= (Thickness.Mouse * Thickness.Mouse))
                {
                    this.onActivate.emitEvent(new CustomEvent<IPoint>("ontap", { detail: point }));
                }
            }
            this.selected = false;
            this.visible = false;
            assert(this._mouseUpListener);
            this._mouseUpListener.dispose();
            delete this._mouseUpListener;
        }

        private readonly _mouseDownListener: IEventListener<MouseEvent>;
        private _mouseUpListener?: IEventListener<MouseEvent>;
        private _downPoint?: IPoint;
        private _delayTime: property<number>;
        private _activateTime: property<number>;
        private _lineWidth: property<number>;
        private _radius: property<number>;
        private _brush: property<Sprite.Brush>;
        private _startTicks?: number;
    }

    export class MoveTool extends DocumentSprite<Container<Sprite.Sprite>>
    {
        constructor(document: Document)
        {
            super(document, new Container<Sprite.Sprite>(), true);
            this._position = Point.make(document.mouseArea.mousePoint.x, document.mouseArea.mousePoint.y - MoveTool._IconSize - Thickness.Mouse - 1);
            const x = makeMod(this, () => this._position.x);
            const y = makeMod(this, () => this._position.y);
            const icon_path = new Polygon.CustomPath(
                Point.make(MoveTool._IconSize, MoveTool._IconSize),
                "M500,10C229.8,10,10,229.8,10,500c0,270.2,219.8,490,490,490s490-219.8,490-490C990,229.8,770.2,10,500,10z M500,930.7C262.5,930.7,69.3,737.5,69.3,500C69.3,262.5,262.5,69.3,500,69.3c237.5,0,430.7,193.2,430.7,430.7C930.7,737.5,737.5,930.7,500,930.7z M541.9,500l100.6,100.6l6.2-40.7l58.6,8.9L689,689l-120.2,18.3l-8.9-58.6l40.7-6.2L500,541.9L398.9,643l37.8,5.8l-8.9,58.6l-120.1-18.3l-18.3-120.2L348,560l6.6,43.5L458.1,500L354.6,396.5l-6.6,43.5l-58.6-8.9L307.6,311l120.2-18.3l8.9,58.6l-37.7,5.7l101,101l100.6-100.6l-40.7-6.2l8.9-58.6L689,311l18.3,120.2l-58.6,8.9l-6.2-40.7L541.9,500z"
            );
            const icon_stroke = new Sprite.Polyline(x, y, CurrentTheme.TapLineWidth, CurrentTheme.TapBrush, MoveTool._IconSize / 1000);
            icon_stroke.addPolygon(icon_path);
            icon_stroke.addVisible(makeMod(this, () => !this._startDrag && !this.mouseHit(this.document.mouseArea.mousePoint)));
            const icon = new Sprite.Polyshape(x, y, CurrentTheme.TapLineWidth, CurrentTheme.TapBrush, MoveTool._IconSize / 1000);
            icon.addPolygon(icon_path);
            icon.addVisible(() => !icon_stroke.visible);

            this.item.push(icon_stroke);
            this.item.push(icon);
            this._touchInterface = document.mouseArea instanceof PlayGround && document.mouseArea.touchInterface;
            if (this._touchInterface)
            {
                const stop_icon_path = new Polygon.CustomPath(
                Point.make(MoveTool._IconSize, MoveTool._IconSize),
                    "M90.914,5.296c6.927-7.034,18.188-7.065,25.154-0.068 c6.961,6.995,6.991,18.369,0.068,25.397L85.743,61.452l30.425,30.855c6.866,6.978,6.773,18.28-0.208,25.247 c-6.983,6.964-18.21,6.946-25.074-0.031L60.669,86.881L30.395,117.58c-6.927,7.034-18.188,7.065-25.154,0.068 c-6.961-6.995-6.992-18.369-0.068-25.397l30.393-30.827L5.142,30.568c-6.867-6.978-6.773-18.28,0.208-25.247 c6.983-6.963,18.21-6.946,25.074,0.031l30.217,30.643L90.914,5.296L90.914,5.296z"
                );
                const stop_move_icon = new Sprite.Polyshape(x, y, CurrentTheme.TapLineWidth, "Red", MoveTool._IconSize / 500);
                stop_move_icon.addX((value) => value + MoveTool._IconSize);
                stop_move_icon.addPolygon(stop_icon_path);
                this.item.push(stop_move_icon);
            }

            this._mouseDownListener = document.mouseArea.onMouseDown.bind(this, this.mouseDown, true);
            this._mouseUpListener = document.mouseArea.onMouseUp.bind(this, this.mouseUp, true);
            
        }

        public dispose(): void
        {
            if (!this.disposed)
            {
                this._transaction?.rollback();
                this._mouseDownListener.dispose();
                this._mouseUpListener.dispose();
                super.dispose();
                this.document.remove(this);
            }
        }

        protected get isActive(): boolean
        {
            return this.item.last?.visible == true;
        }
        protected innerDraw(play_ground: PlayGround): void
        {
            super.innerDraw(play_ground);
        }
        protected mouseMove(event: MouseEvent): void
        {
            super.mouseMove(event);
            if (this._startDrag)
            {
                if (event.buttons > 0)
                {
                    if (this._touchInterface && this.mouseHit(event) && event.x >= this.middleX)
                    {
                        this.endDrag();
                    }
                    else
                    {
                        this.selected = true;
                        const dp = Point.add(Point.sub(this._startDrag, event), this.document.mouseArea.offset);
                        if (!this._transaction)
                        {
                            this._transaction = this.document.beginUndo(Resources.string("Перемещение страницы"));
                        }
                        this.document.mouseArea.setOffset(dp.x, dp.y);
                    }
                }
                else
                {
                    this.selected = false;
                    this._position = Point.sub(event, Point.make(MoveTool._IconSize / 2, MoveTool._IconSize / 2));
                }
            }
            event.cancelBubble = this.isActive;
        }
        protected mouseDown(event: MouseEvent): void
        {
            if (this.mouseHit(event))
            {
                this._startDrag = event;
                Document.forceCloseMenu(this);
            }
            else
            {
                this.dispose();
            }
            event.cancelBubble = this.isActive;
        }
        protected mouseUp(event: MouseEvent): void
        {
            if (this._startDrag && !this.selected)
            {
                const dp = Point.sub(this._startDrag, event);
                if ((dp.x * dp.x + dp.y * dp.y) <= (Thickness.Mouse * Thickness.Mouse))
                {
                    this.endDrag();
                }
            }
            event.cancelBubble = this.isActive;
        }
        protected endDrag(): void
        {
            this._transaction?.commit();
            delete this._transaction;
            this.dispose();
        }

        private _startDrag?: IPoint;
        private _mouseDownListener: IEventListener<MouseEvent>;
        private _mouseUpListener: IEventListener<MouseEvent>;
        private _position: IPoint;
        private _transaction?: UndoTransaction;
        private readonly _touchInterface: boolean;
        static readonly _IconSize: number = 40;
    }

}