﻿/// <reference path="utils.ts" />
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
    import toInt = Utils.toInt;
    import Point = Utils.Point;
    import assert = Utils.assert;
    import MulticastEvent = Utils.MulticastEvent;
    import modifier = Utils.modifier;
    import property = Utils.ModifiableProperty;
    import Box = Utils.Box;
    import binding = Utils.binding;
    import Debug = Sprite.Debug;

    abstract class ToolBase extends ActivePointBase
    {
        constructor(document: Document, x: number, y: number, radius: number, line_width: number, name: binding<string>)
        {
            super(document, x, y, radius, line_width, () => CurrentTheme.ToolBrush, () => CurrentTheme.ToolLineBrush, () => CurrentTheme.ToolSelectLineBrush);
            this.setName(name, () => CurrentTheme.ToolNameBrush, () => CurrentTheme.ToolNameStyle);
        }
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
            const file = new Geoma.Sprite.Polyshape(file_point.x, file_point.y, icon_line_width, makeMod(this, () => this.lineBrush), 0.3);
            file.addPolygon(new Geoma.Polygon.CustomPath(file_point, "M83.012,17.5c0-0.527-0.271-0.99-0.682-1.258L66.477,2.637c-0.15-0.129-0.324-0.211-0.505-0.271C65.709,2.141,65.373,2,65,2 H18.5C17.671,2,17,2.671,17,3.5v93c0,0.828,0.671,1.5,1.5,1.5h63c0.828,0,1.5-0.672,1.5-1.5V18c0-0.067-0.011-0.13-0.02-0.195 C83.001,17.707,83.012,17.604,83.012,17.5z M20,95V5h44v12.5c0,0.829,0.672,1.5,1.5,1.5H80v76H20z"));
            file.addPolygon(new Geoma.Polygon.CustomPath(file_point, "M69,31H31c-0.552,0-1-0.448-1-1s0.448-1,1-1h38c0.553,0,1,0.448,1,1S69.553,31,69,31z"));
            file.addPolygon(new Geoma.Polygon.CustomPath(file_point, "M69,45H31c-0.552,0-1-0.448-1-1s0.448-1,1-1h38c0.553,0,1,0.448,1,1S69.553,45,69,45z"));
            file.addPolygon(new Geoma.Polygon.CustomPath(file_point, "M69,57H31c-0.552,0-1-0.447-1-1s0.448-1,1-1h38c0.553,0,1,0.447,1,1S69.553,57,69,57z"));
            file.addPolygon(new Geoma.Polygon.CustomPath(file_point, "M69,71H31c-0.552,0-1-0.447-1-1s0.448-1,1-1h38c0.553,0,1,0.447,1,1S69.553,71,69,71z"));
            this.item.push(file);
        }

        public static get LocalStorageKeys(): Array<string>
        {
            const names: Array<string> = [];
            for (let i = 0; i < window.localStorage.length; i++)
            {
                const doc_name = window.localStorage.key(i);
                if (doc_name != null)
                {
                    names.push(doc_name);
                }
            }
            names.sort(Utils.CompareCaseInsensitive);
            return names;
        }

        protected mouseClick(event: MouseEvent): void
        {
            if (this.mouseHit(event) && this.document.canShowMenu(this))
            {
                const x = this.boundingBox.right;
                const y = this.boundingBox.bottom;
                const menu = new Menu(this.document, x, y);

                let menu_item = menu.addMenuItem(Resources.string("Новый"));
                menu_item.onChecked.bind(this.document, this.document.newDocument);

                const open_group = menu.addMenuGroup(Resources.string("Открыть"));

                menu_item = menu.addMenuItem(Resources.string("Сохранить..."));
                menu_item.onChecked.bind(this, this.saveCommand);

                menu_item = menu.addMenuItem(Resources.string("Копировать"));
                menu_item.onChecked.bind(this, this.copyCommand);

                const delete_group = menu.addMenuGroup(Resources.string("Удалить"));

                for (const name of FileTool.LocalStorageKeys)
                {
                    if (name == SettingsTool.settingsKey)
                    {
                        continue;
                    }
                    menu_item = open_group.addMenuItem(name);
                    menu_item.onChecked.bind(this, this.openCommand);

                    menu_item = delete_group.addMenuItem(name);
                    menu_item.onChecked.bind(this, this.removeCommand);
                }

                menu.show();
            }
        }
        protected openCommand(event: CustomEvent<MenuItem>): void
        {
            const data = window.localStorage.getItem(event.detail.tooltip);
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
        protected removeCommand(event: CustomEvent<MenuItem>): void
        {
            window.localStorage.removeItem(event.detail.tooltip);
        }
        protected saveCommand(): void
        {
            const data = this.document.save();
            const save_name = this.document.prompt(Resources.string("Введите имя документа"));
            if (save_name != null)
            {
                window.localStorage.setItem(save_name, data);
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
    }

    interface Settings
    {
        version: number;
        themeName?: string;
        languageId?: UiLanguage;
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
            }
            const icon_line_width = 2;
            const gear_point = Point.make(x - radius + icon_line_width + line_width / 2, y - radius + icon_line_width + line_width / 2);
            const gear = new Geoma.Sprite.Polyshape(gear_point.x, gear_point.y, icon_line_width, makeMod(this, () => this.lineBrush), 0.1);
            //gear.addPolygon(new Geoma.Polygon.CustomPath(gear_point, "m150.057,105.1c-24.789,0 -44.955,20.167 -44.955,44.955s20.166,44.955 44.955,44.955c24.789,0 44.955,-20.167 44.955,-44.955s-20.167,-44.955 -44.955,-44.955zm0,73.26c-15.607,0 -28.305,-12.697 -28.305,-28.305s12.697,-28.305 28.305,-28.305c15.608,0 28.305,12.697 28.305,28.305s-12.699,28.305 -28.305,28.305z"));
            gear.addPolygon(new Geoma.Polygon.CustomPath(gear_point, "m297.365,183.342l-25.458,-22.983l0,-20.608l25.457,-22.981c2.614,-2.361 3.461,-6.112 2.112,-9.366l-13.605,-32.846c-1.348,-3.253 -4.588,-5.305 -8.115,-5.128l-34.252,1.749l-14.571,-14.571l1.749,-34.251c0.18,-3.518 -1.874,-6.769 -5.128,-8.116l-32.847,-13.606c-3.253,-1.35 -7.005,-0.501 -9.365,2.111l-22.984,25.458l-20.606,0l-22.982,-25.458c-2.361,-2.613 -6.112,-3.458 -9.365,-2.111l-32.846,13.605c-3.255,1.348 -5.308,4.599 -5.128,8.116l1.75,34.251l-14.572,14.571l-34.252,-1.749c-3.506,-0.188 -6.768,1.874 -8.115,5.128l-13.607,32.846c-1.348,3.255 -0.502,7.005 2.112,9.366l25.457,22.981l0,20.608l-25.455,22.983c-2.614,2.361 -3.461,6.112 -2.112,9.366l13.605,32.846c1.348,3.255 4.603,5.321 8.115,5.128l34.252,-1.749l14.572,14.571l-1.75,34.251c-0.18,3.518 1.874,6.769 5.128,8.116l32.846,13.606c3.255,1.352 7.005,0.502 9.365,-2.111l22.984,-25.458l20.606,0l22.984,25.458c1.613,1.785 3.873,2.746 6.182,2.746c1.071,0 2.152,-0.208 3.183,-0.634l32.846,-13.606c3.255,-1.348 5.308,-4.599 5.128,-8.116l-1.749,-34.251l14.571,-14.571l34.252,1.749c3.506,0.178 6.768,-1.874 8.115,-5.128l13.605,-32.846c1.348,-3.255 0.502,-7.005 -2.112,-9.366zm-24.628,30.412l-32.079,-1.639c-2.351,-0.127 -4.646,0.764 -6.311,2.428l-19.804,19.804c-1.666,1.666 -2.547,3.958 -2.428,6.311l1.638,32.079l-21.99,9.109l-21.525,-23.843c-1.578,-1.747 -3.824,-2.746 -6.179,-2.746l-28.006,0c-2.355,0 -4.601,0.998 -6.179,2.746l-21.525,23.843l-21.99,-9.109l1.639,-32.079c0.12,-2.353 -0.763,-4.646 -2.429,-6.311l-19.803,-19.804c-1.665,-1.665 -3.955,-2.55 -6.311,-2.428l-32.079,1.639l-9.109,-21.99l23.842,-21.525c1.748,-1.58 2.746,-3.824 2.746,-6.179l0,-28.008c0,-2.355 -0.998,-4.601 -2.746,-6.179l-23.842,-21.525l9.109,-21.99l32.079,1.639c2.354,0.124 4.646,-0.763 6.311,-2.428l19.803,-19.803c1.666,-1.666 2.549,-3.958 2.429,-6.313l-1.639,-32.079l21.99,-9.109l21.525,23.842c1.578,1.747 3.824,2.746 6.179,2.746l28.006,0c2.355,0 4.601,-0.998 6.179,-2.746l21.525,-23.842l21.99,9.109l-1.638,32.079c-0.12,2.353 0.761,4.645 2.428,6.313l19.804,19.803c1.666,1.665 3.959,2.564 6.311,2.428l32.079,-1.639l9.109,21.99l-23.843,21.525c-1.748,1.58 -2.746,3.824 -2.746,6.179l0,28.008c0,2.355 0.998,4.601 2.746,6.179l23.843,21.525l-9.109,21.99z"));
            gear.addPolygon(new Geoma.Polygon.CustomPath(gear_point, "m150.057,71.357c-43.394,0 -78.698,35.305 -78.698,78.698c0,43.394 35.304,78.698 78.698,78.698c43.394,0 78.698,-35.305 78.698,-78.698c-0.001,-43.394 -35.305,-78.698 -78.698,-78.698zm0,140.746c-34.214,0 -62.048,-27.834 -62.048,-62.048c0,-34.214 27.834,-62.048 62.048,-62.048c34.214,0 62.048,27.834 62.048,62.048c0,34.214 -27.836,62.048 -62.048,62.048z"));
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
                const x = this.boundingBox.right;
                const y = this.boundingBox.bottom;
                const menu = new Menu(this.document, x, y);

                const language_group = menu.addMenuGroup("Язык (Language)");

                let menu_item = language_group.addMenuItem("Русский");
                menu_item.onChecked.bind(this, () => Resources.language = UiLanguage.ruRu);

                menu_item = language_group.addMenuItem("English (US)");
                menu_item.onChecked.bind(this, () => Resources.language = UiLanguage.enUs);

                const theme_group = menu.addMenuGroup(Resources.string("Тема"));

                menu_item = theme_group.addMenuItem(Resources.string("Светлая"));
                menu_item.onChecked.bind(this, () => this.setTheme(BlueTheme));

                menu_item = theme_group.addMenuItem(Resources.string("Тёмная"));
                menu_item.onChecked.bind(this, () => this.setTheme(DefaultTheme));

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

        private static readonly _settingsVersion: number = 1;
    }
}