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

    export class Background extends Sprite.Rectangle
    {
        constructor(document: Document)
        {
            super(
                () => document.mouseArea.x,
                () => document.mouseArea.y,
                () => document.mouseArea.w * document.mouseArea.ratio,
                () => document.mouseArea.h * document.mouseArea.ratio,
                () => CurrentTheme.BackgroundBrush
            );
        }
    }
}