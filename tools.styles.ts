/// <reference path="utils.ts" />
/// <reference path="sprites.ts" />

module Geoma.Tools
{
    import Brush = Sprite.Brush;
    type TextStyle = CanvasTextDrawingStyles;

    class ThicknessHelper
    {
        public readonly Calc: number = 0.1;
        public get Mouse(): number
        {
            return this._mouseThickness;
        }
        public setMouseThickness(value: number)
        {
            this._mouseThickness = Math.max(ThicknessHelper._minimalMouseThickness, value);
        }

        private static _minimalMouseThickness: number = 5;
        private _mouseThickness: number = ThicknessHelper._minimalMouseThickness;
    }

    class DefaultThemeStyle
    {
        readonly name: string = "DefaultTheme";

        readonly ButtonBackgroundBrush: Brush = "#117777";
        readonly ButtonSelectedBrush: Sprite.Brush = "#0011EF";
        readonly ButtonItemTextBrush: Sprite.Brush = "#EFFFFF";
        readonly ButtonDisabledItemTextBrush: Sprite.Brush = "Gray";
        readonly ButtonSelectedItemTextBrush: Sprite.Brush = "#FFFF00";
        readonly ButtonItemTextStyle: CanvasTextDrawingStyles = {
            font: "18px Arial", textBaseline: "hanging", direction: "inherit", textAlign: "left"
        };

        readonly TapDelayTime: number = 100;
        readonly TapActivateTime: number = 500;
        readonly TapLineWidth: number = 10;
        readonly TapRadius: number = 20;
        readonly TapBrush: Sprite.Brush = "Lime";

        readonly AxesWidth: number = 0.5;
        readonly AxesBrush: Sprite.Brush = "DarkTurquoise";
        readonly AxesSelectBrush: Sprite.Brush = "Lime";
        readonly AxesTextBrush: Sprite.Brush = "DarkTurquoise";
        readonly AxesTextSelectBrush: Sprite.Brush = "Lime";
        readonly AxesTextStyle: CanvasTextDrawingStyles = {
            font: "12px Arial", textBaseline: "top", direction: "inherit", textAlign: "left"
        };

        readonly ActiveLineWidth: number = 2;
        readonly ActiveLineBrush: Sprite.Brush = "SandyBrown";
        readonly ActiveLineSelectBrush: Sprite.Brush = "Lime";

        readonly ActiveCircleWidth: number = 2;
        readonly ActiveCircleBrush: Sprite.Brush = "SandyBrown";
        readonly ActiveCircleSelectBrush: Sprite.Brush = "Lime";

        readonly TooltipStyle: CanvasTextDrawingStyles = {
            font: "18px Arial", textBaseline: "top", direction: "inherit", textAlign: "left"
        };
        readonly TooltipBackground: Sprite.Brush = "LemonChiffon";
        readonly TooltipForeground: Sprite.Brush = "DarkSlateGray";

        readonly MenuBackgroundBrush: Brush = "#117777";
        readonly MenuSelectedItemBrush: Sprite.Brush = "#0011EF";
        readonly MenuItemTextBrush: Sprite.Brush = "#EFFFFF";
        readonly MenuDisabledItemTextBrush: Sprite.Brush = "Gray";
        readonly MenuSelectedItemTextBrush: Sprite.Brush = "#FFFF00";
        readonly MenuItemTextStyle: CanvasTextDrawingStyles = {
            font: "18px Arial", textBaseline: "hanging", direction: "inherit", textAlign: "left"
        };

        readonly AngleNameBrush: Sprite.Brush = "#EFFFFF";
        readonly AngleNameSelectBrush: Sprite.Brush = "Lime";
        readonly AngleNameStyle: CanvasTextDrawingStyles = {
            font: "14px Arial", textBaseline: "middle", direction: "inherit", textAlign: "left"
        };

        readonly AngleIndicatorLineWidth: number = 1;
        readonly AngleIndicatorBrush: Sprite.Brush = "DarkTurquoise";
        readonly AngleIndicatorSelectionBrush: Sprite.Brush = "DarkTurquoise";
        readonly AngleIndicatorSelectionBorderBrush: Sprite.Brush = "DarkTurquoise";
        readonly AngleIndicatorStrokeBrush: Brush = "White";
        readonly AngleIndicatorStrokeWidth: number = 0;
        readonly AngleIndicatorPrecision: number = 0;

        readonly BisectorBrush: Sprite.Brush = "DarkTurquoise";
        readonly BisectorSelectionBrush: Sprite.Brush = "Lime";
        readonly BisectorLineWidth: number = 1;

        readonly BackgroundBrush: Brush = "SteelBlue";

        readonly TapShadowColor: string = "Lime";
        readonly TapShadowBlure: number = 15;

        readonly ToolNameBrush: Brush = "#EFFFFF";
        readonly ToolNameStyle: TextStyle = {
            font: "18px Arial", textBaseline: "middle", direction: "inherit", textAlign: "left"
        };
        readonly ToolBrush: Brush = "#0011dd";
        readonly ToolLineBrush: Brush = "#dd11cc";
        readonly ToolSelectLineBrush: Brush = "Lime";
        readonly ToolSeparatorBrush: Sprite.Brush = "PowderBlue";

        readonly AdornerNameBrush: Brush = "#EFFFFF";
        readonly AdornerNameStyle: TextStyle = {
            font: "18px Arial", textBaseline: "middle", direction: "inherit", textAlign: "left"
        };
        readonly AdornerBrush: Brush = "#0011dd";
        readonly AdornerLineBrush: Brush = "#dd11cc";
        readonly AdornerSelectLineBrush: Brush = "Lime";
        readonly AdornerStrokeBrush: Brush = "White";
        readonly AdornerStrokeWidth: number = 0;

        readonly FormulaEditorBackgroundBrush: Brush = "#117777";
        readonly FormulaSampleTextBrush: Brush = "SandyBrown";
        readonly FormulaSampleTextStyle: CanvasTextDrawingStyles = {
            font: "12px Consolas", textBaseline: "hanging", direction: "inherit", textAlign: "left"
        };
    }

    export interface IThemeStyle extends DefaultThemeStyle
    {
    }

    class BlueThemeStyle implements IThemeStyle
    {
        readonly name: string = "BlueTheme";

        readonly ButtonBackgroundBrush: Brush = "LightSkyBlue";
        readonly ButtonSelectedBrush: Sprite.Brush = "SteelBlue";
        readonly ButtonItemTextBrush: Sprite.Brush = "DarkSlateGray";
        readonly ButtonDisabledItemTextBrush: Sprite.Brush = "Gray";
        readonly ButtonSelectedItemTextBrush: Sprite.Brush = "AliceBlue";
        readonly ButtonItemTextStyle: CanvasTextDrawingStyles = {
            font: "18px Arial", textBaseline: "hanging", direction: "inherit", textAlign: "left"
        };

        readonly AxesWidth: number = 0.5;
        readonly AxesBrush: Sprite.Brush = "DarkTurquoise";
        readonly AxesSelectBrush: Sprite.Brush = "Lime";
        readonly AxesTextBrush: Sprite.Brush = "DarkTurquoise";
        readonly AxesTextSelectBrush: Sprite.Brush = "Lime";
        readonly AxesTextStyle: CanvasTextDrawingStyles = {
            font: "12px Arial", textBaseline: "top", direction: "inherit", textAlign: "left"
        };

        readonly BackgroundBrush: Brush = "Seashell";

        readonly TapDelayTime: number = 100;
        readonly TapActivateTime: number = 500;
        readonly TapLineWidth: number = 10;
        readonly TapRadius: number = 20;
        readonly TapBrush: Brush = "Lime";
        readonly TapShadowColor: string = "Lime";
        readonly TapShadowBlure: number = 15;

        readonly ActiveLineWidth: number = 2;
        readonly ActiveLineBrush: Brush = "DarkSlateGray";
        readonly ActiveLineSelectBrush: Brush = "OrangeRed";

        readonly ActiveCircleWidth: number = 2;
        readonly ActiveCircleBrush: Brush = "DarkSlateGray";
        readonly ActiveCircleSelectBrush: Brush = "OrangeRed";

        readonly ToolNameBrush: Brush = "SteelBlue";
        readonly ToolNameStyle: TextStyle = {
            font: "18px Arial", textBaseline: "middle", direction: "inherit", textAlign: "left"
        };
        readonly ToolBrush: Brush = "LightSkyBlue";
        readonly ToolLineBrush: Brush = "DarkSlateGray";
        readonly ToolSelectLineBrush: Brush = "OrangeRed";

        readonly TooltipStyle: TextStyle = {
            font: "18px Arial", textBaseline: "top", direction: "inherit", textAlign: "left"
        };
        readonly TooltipBackground: Brush = "LemonChiffon";
        readonly TooltipForeground: Brush = "DarkSlateGray";
        readonly ToolSeparatorBrush: Sprite.Brush = "SteelBlue";

        readonly MenuBackgroundBrush: Brush = "LightSkyBlue";
        readonly MenuSelectedItemBrush: Brush = "SteelBlue";
        readonly MenuItemTextBrush: Brush = "DarkSlateGray";
        readonly MenuDisabledItemTextBrush: Brush = "Gray";
        readonly MenuSelectedItemTextBrush: Brush = "AliceBlue";
        readonly MenuItemTextStyle: TextStyle = {
            font: "18px Arial", textBaseline: "hanging", direction: "inherit", textAlign: "left"
        };

        readonly AdornerNameBrush: Brush = "SteelBlue";
        readonly AdornerNameStyle: TextStyle = {
            font: "18px Arial", textBaseline: "middle", direction: "inherit", textAlign: "left"
        };
        readonly AdornerBrush: Brush = "LightSkyBlue";
        readonly AdornerLineBrush: Brush = "DarkSlateGray";
        readonly AdornerSelectLineBrush: Brush = "OrangeRed";
        readonly AdornerStrokeBrush: Brush = "White";
        readonly AdornerStrokeWidth: number = 2;

        readonly AngleNameBrush: Brush = "SteelBlue";
        readonly AngleNameSelectBrush: Brush = "OrangeRed";
        readonly AngleNameStyle: TextStyle = {
            font: "14px Arial", textBaseline: "middle", direction: "inherit", textAlign: "left"
        };

        readonly AngleIndicatorLineWidth: number = 1;
        readonly AngleIndicatorBrush: Brush = "DarkSlateGray";
        readonly AngleIndicatorSelectionBrush: Brush = "LightSkyBlue";
        readonly AngleIndicatorSelectionBorderBrush: Brush = "DarkSlateGray";
        readonly AngleIndicatorStrokeBrush: Brush = "White";
        readonly AngleIndicatorStrokeWidth: number = 2;
        readonly AngleIndicatorPrecision: number = 0;

        readonly BisectorBrush: Brush = "DarkSlateGray";
        readonly BisectorSelectionBrush: Brush = "OrangeRed";
        readonly BisectorLineWidth: number = 1;

        readonly FormulaEditorBackgroundBrush: Brush = "PeachPuff";
        readonly FormulaSampleTextBrush: Brush = "Gray";
        readonly FormulaSampleTextStyle: CanvasTextDrawingStyles = {
            font: "12px Consolas", textBaseline: "hanging", direction: "inherit", textAlign: "left"
        };
    }

    export const Thickness: ThicknessHelper = new ThicknessHelper();
    export const DefaultTheme: IThemeStyle = new DefaultThemeStyle();
    export const BlueTheme: IThemeStyle = new BlueThemeStyle();
    export let CurrentTheme: IThemeStyle = DefaultTheme;
}