/// <reference path="utils.ts" />
/// <reference path="sprites.ts" />
/// <reference path="polygons.ts" />
/// <reference path="interfaces.ts" />
/// <reference path="play_ground.ts" />
/// <reference path="tools.core.ts" />
/// <reference path="tools.styles.ts" />
/// <reference path="tools.document.ts" />
/// <reference path="tools.point.base.ts" />

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
        constructor(document: Document, x: number, y: number, radius: number, line_width: number, name: string)
        {
            super(document, x, y, radius, line_width, () => CurrentTheme.ToolBrush, () => CurrentTheme.ToolLineBrush, () => CurrentTheme.ToolSelectLineBrush);
            this.setName(name, () => CurrentTheme.ToolNameBrush, () => CurrentTheme.ToolNameStyle);
        }
    }

    export class PointTool extends ToolBase
    {
        constructor(document: Document, x: number, y: number, radius: number = 5, line_width: number = 2)
        {
            super(document, x, y, radius, line_width, "Создать");
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

            let menu_item = menu.addMenuItem("Создать точку")
            menu_item.onChecked.bind(this, () => document.addPoint(Point.make(x, y)));

            menu_item = menu.addMenuItem("Создать отрезок...");
            menu_item.onChecked.bind(this, () => document.setLineSegmentState(new ActivePoint(document, x, y)));
            menu_item.enabled.addModifier(makeMod(this, () => document.points.length > 0));

            menu_item = menu.addMenuItem("Создать функцию...");
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
            super(document, x, y, radius, line_width, "Файл");
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

                const open_group = menu.addMenuGroup("Открыть");

                let menu_item = menu.addMenuItem("Сохранить...");
                menu_item.onChecked.bind(this, this.saveCommand);

                menu_item = menu.addMenuItem("Копировать");
                menu_item.onChecked.bind(this, this.copyCommand);

                const delete_group = menu.addMenuGroup("Удалить");

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
                this.document.alert(`Файла ${event.detail.tooltip} больше нет`);
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
            const save_name = this.document.prompt(`Введите имя документа`);
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
            if (window.prompt(`Скопируйте текст ссылки`, data) != null)
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
    }

    export class SettingsTool extends ToolBase
    {
        constructor(document: Document, x: number, y: number, radius: number = 5, line_width: number = 2)
        {
            super(document, x, y, radius, line_width, "Настройки");
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
            }
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
                const menu_group = menu.addMenuGroup("Тема");

                let menu_item = menu_group.addMenuItem("Голубая");
                menu_item.onChecked.bind(this, () => this.setTheme(BlueTheme));

                menu_item = menu_group.addMenuItem("По умолчанию");
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

        private static readonly _settingsVersion: number = 1;
    }
}