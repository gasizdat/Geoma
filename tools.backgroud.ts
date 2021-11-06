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
    export class Background extends Sprite.Rectangle
    {
        constructor(document: Document)
        {
            super(
                0,
                0,
                () => document.mouseArea.w,
                () => document.mouseArea.h,
                () => CurrentTheme.BackgroundBrush
            );
        }
    }
}