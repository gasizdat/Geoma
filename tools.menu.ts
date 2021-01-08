/// <reference path="utils.ts" />
/// <reference path="sprites.ts" />
/// <reference path="polygons.ts" />
/// <reference path="interfaces.ts" />
/// <reference path="play_ground.ts" />
/// <reference path="tools.document.ts" />
/// <reference path="tools.core.ts" />
/// <reference path="tools.styles.ts" />
/// <reference path="tools.point.base.ts" />

module Geoma.Tools
{
    import makeMod = Utils.makeMod;
    import makeProp = Utils.makeProp;
    import toInt = Utils.toInt;
    import Point = Utils.Point;
    import assert = Utils.assert;
    import MulticastEvent = Utils.MulticastEvent;
    import modifier = Utils.modifier;
    import property = Utils.ModifiableProperty;
    import Box = Utils.Box;
    import binding = Utils.binding;
    import Debug = Sprite.Debug;

    abstract class MenuElementBase<TSprite extends Sprite.Container> extends DocumentSprite<TSprite>
    {
        constructor(document: Document, sprite: TSprite)
        {
            super(document, sprite, true);
        }

        public abstract get clientW(): number;

        protected get first(): Sprite.Sprite
        {
            assert(this.item.first);
            return this.item.first;
        }
        protected get last(): Sprite.Sprite
        {
            assert(this.item.last);
            return this.item.last;
        }
    }

    export interface IMenuGroup
    {
        addMenuItem(text: binding<string>): MenuItem;
        addMenuGroup(text: binding<string>): IMenuGroup;
        addMenuStrip(): MenuStrip;
    }

    export class MenuItem extends MenuElementBase<Sprite.Container>
    {
        constructor(menu: Menu, x: binding<number>, y: binding<number>, width: binding<number> | undefined, text: binding<string>)
        {
            super(menu.document, new Sprite.Container());
            this.enabled = new property<boolean>(true);
            const tooltip = new Sprite.Text(
                x,
                y,
                0,
                0,
                makeMod(this, () => this.selected ? CurrentTheme.MenuSelectedItemTextBrush : (this.enabled.value ? CurrentTheme.MenuItemTextBrush : CurrentTheme.MenuDisabledItemTextBrush)),
                CurrentTheme.MenuItemTextStyle,
                text
            );
            tooltip.addX(makeMod(this, (value: number) => value + this._menu.padding));
            tooltip.addY(makeMod(this, (value: number) => value + this._menu.padding));

            const rect = new Sprite.Rectangle(
                x,
                y,
                (width == undefined) ? () => this.clientW : width,
                () => Math.ceil(tooltip.h) + this._menu.padding * 2,
                CurrentTheme.MenuSelectedItemBrush
            );
            rect.addVisible(makeMod(this, () => this.selected));

            this.item.push(rect);
            this.item.push(tooltip);
            this.onChecked = new MulticastEvent<CustomEvent<MenuItem>>();
            this.addVisible((value: boolean) => value && menu.visible);
            this._menu = menu;
            
        }
        public get clientW(): number
        {
            return this.last.w + this._menu.padding * 2;
        }
        public readonly enabled: property<boolean>;
        public readonly onChecked: MulticastEvent<CustomEvent<MenuItem>>;

        public get tooltip(): string
        {
            return (this.item.last as Sprite.Text).text.value;
        }

        protected mouseClick(event: MouseEvent): void
        {
            if (this.visible && this.enabled.value && this.mouseHit(event))
            {
                event.cancelBubble = true;
                this.enabled.value = false;
                this.selected = false;
                if (this.onChecked)
                {
                    this.onChecked.emitEvent(new CustomEvent<MenuItem>("MenuEvent", { cancelable: false, detail: this }));
                }
                this._menu.close();
            }
            super.mouseClick(event);
        }
        protected mouseMove(event: MouseEvent): void
        {
            if (this.enabled.value)
            {
                this.selected = this.mouseHit(event);
            }
            super.mouseMove(event);
        }

        private _menu: Menu;
    }

    class MenuGroup extends MenuItem implements IMenuGroup
    {
        constructor(menu: Menu, x: binding<number>, y: binding<number>, width: binding<number>, text: binding<string>)
        {
            super(menu, x, y, width, text);
            const tooltip = this.last as Sprite.Text;
            const expander = new Sprite.Text(
                0,
                () => tooltip.y,
                0,
                20,
                () => tooltip.brush.value,
                () => tooltip.style.value,
                "►"
            );
            expander.addX(() => this.first.right - expander.w - 5);
            this.item.push(expander);
            this._subMenu = new Menu(this.document, makeMod(this, () => this.right), makeMod(this, () => this.top - this._subMenu.padding));
            this._subMenu.addVisible(makeMod(this, () => this.selected));
        }

        public addMenuItem(text: binding<string>): MenuItem
        {
            return this._subMenu.addMenuItem(text);
        }
        public addMenuGroup(text: binding<string>): IMenuGroup 
        {
            return this._subMenu.addMenuGroup(text);
        }
        public addMenuStrip(): MenuStrip 
        {
            return this._subMenu.addMenuStrip();
        }
        public dispose(): void
        {
            if (!this.disposed)
            {
                this._subMenu.dispose();
                super.dispose();
            }
        }

        protected innerDraw(play_ground: PlayGround): void
        {
            super.innerDraw(play_ground);
            this._subMenu.draw(play_ground);
        }
        protected mouseClick(event: MouseEvent): void
        {
            this.mouseMove(event);
            super.mouseClick(event);
        }
        protected mouseMove(event: MouseEvent): void
        {
            super.mouseMove(event);
            if (this.enabled.value)
            {
                this.selected = this.selected || (this._subMenu.visible && this._subMenu.mouseHit(event));
            }
        }

        private _subMenu: Menu;
    }

    export class MenuStrip extends MenuElementBase<Sprite.Container>
    {
        constructor(menu: Menu, x: binding<number>, y: binding<number>)
        {
            super(menu.document, new Sprite.Container());
            this._menu = menu;
            this._startX = makeProp(x, 0);
            this._startY = makeProp(y, 0);
        }

        public get clientW(): number
        {
            return this.last.right - this.x;
        }

        public addMenuItem(text: binding<string>): MenuItem
        {
            const index = this.item.length - 1;
            const ret = new MenuItem(
                this._menu,
                makeMod(this, () => (index >= 0) ? this.item.item(index).right + this._menu.padding : this._startX.value),
                makeMod(this, () => this._startY.value),
                undefined,
                text
            );
            this.item.push(ret);
            return ret;
        }

        private _menu: Menu;
        private _startX: property<number>;
        private _startY: property<number>;
    }

    export class Menu extends MenuElementBase<Container<MenuElementBase<Sprite.Container>>> implements IMenuGroup
    {
        constructor(document: Document, x: binding<number>, y: binding<number>)
        {
            super(document, new Container<MenuItem>());
            this.item.push(new Sprite.Rectangle(
                x,
                y,
                makeMod(this, () =>
                {
                    if (this.item.length > 1)
                    {
                        return this._clientWidth.value + this.padding * 2;
                    }
                    else
                    {
                        return 0;
                    }
                }),
                makeMod(this, () =>
                {
                    if (this.item.length > 1)
                    {
                        return this.last.bottom - this.y + this.padding;
                    }
                    else
                    {
                        return 0;
                    }
                }),
                CurrentTheme.MenuBackgroundBrush
            ));
            this.item.addX(makeMod(this, (value: number) => value - this._dx));
            this.item.addY(makeMod(this, (value: number) => value - this._dy));
            this._clientWidth = makeProp(makeMod(this, this.maxClientWidth), 0);
        }

        public get clientW(): number
        {
            assert(false, "Logical error");
            return 0;
        }
        public padding: number = 3;

        public addMenuItem(text: binding<string>): MenuItem
        {
            const index = this.item.length - 1;
            const ret = new MenuItem(
                this,
                makeMod(this, () => this.first.x + this.padding),
                makeMod(this, () => index ? (this.item.item(index).bottom + 1): (this.first.y + this.padding)),
                makeMod(this, () => this._clientWidth.value),
                text
            );
            this.item.push(ret);
            return ret;
        }
        public addMenuGroup(text: binding<string>): IMenuGroup
        {
            const index = this.item.length - 1;
            const ret = new MenuGroup(
                this,
                makeMod(this, () => this.first.x + this.padding),
                makeMod(this, () => index ? this.item.item(index).bottom : (this.first.y + this.padding)),
                makeMod(this, () => this._clientWidth.value),
                text
            );
            this.item.push(ret);
            this._hasGroupExpander = true;
            return ret;
        }
        public addMenuStrip(): MenuStrip
        {
            const index = this.item.length - 1;
            const ret = new MenuStrip(
                this,
                makeMod(this, () => this.first.x + this.padding),
                makeMod(this, () => index ? this.item.item(index).bottom : (this.first.y + this.padding))
            );
            this.item.push(ret);
            return ret;
        }
        public show(): void
        {
            this.document.showMenu(this);
        }
        public close(): void
        {
            this.document.closeMenu(this);
        }

        protected mouseClick(event: MouseEvent): void
        {
            if (this.visible)
            {
                if (this.mouseHit(event))
                {
                    event.cancelBubble = true;
                }
                else
                {
                    let close_menu: boolean = true;
                    for (let i = 0; i < this.item.length; i++)
                    {
                        if (this.item.item(i).selected)
                        {
                            close_menu = false;
                            break;
                        }
                    }
                    if (close_menu)
                    {
                        this.close();
                    }
                }
            }
            super.mouseClick(event);
        }
        protected mouseMove(event: MouseEvent): void
        {
            if (this.visible && this.mouseHit(event))
            {
                event.cancelBubble = true;
            }
            super.mouseMove(event);
        }
        protected maxClientWidth(): number
        {
            let w = 0;
            for (let i = 1; i < this.item.length; i++)
            {
                const menu_item = this.item.item(i);
                w = Math.max(w, menu_item.clientW);
            }
            if (this._hasGroupExpander)
            {
                w += 70;
            }
            return w;
        }
        protected innerDraw(play_ground: PlayGround): void
        {
            super.innerDraw(play_ground);
            if (this.bottom > play_ground.bottom)
            {
                this._dy = this.bottom - play_ground.bottom + 10;
            }
            if (this.right > play_ground.right)
            {
                this._dx = this.right - play_ground.right + 10;
            }
        }

        private _hasGroupExpander: boolean = false;
        private _dx: number = 0;
        private _dy: number = 0;
        private _clientWidth: property<number>;
    }
}