/// <reference path="utils.ts" />
/// <reference path="interfaces.ts" />
/// <reference path="play_ground.ts" />

module Geoma.Polygon
{
    import getArg = Utils.getArg;
    import toInt = Utils.toInt;
    import Point = Utils.Point;
    import assert = Utils.assert;
    import binding = Utils.binding;
    import Event = Utils.MulticastEvent;
    import Box = Utils.Box;

    export class Ellipse implements IPolygon
    {
        path: Path2D = new Path2D();
        box: Box;

        constructor(pivote: IPoint, radius_x: number, radius_y: number, start_angle: number, end_angle: number, anticlockwise?: boolean)
        {
            assert(pivote);
            this.path.ellipse(pivote.x, pivote.y, radius_x, radius_y, 0, start_angle, end_angle, anticlockwise);
            this.box = new Box(pivote.x - radius_x, pivote.y - radius_y, radius_x * 2, radius_y * 2);
        }
    }

    export class Arc implements IPolygon
    {
        path: Path2D = new Path2D();
        box: Box;

        constructor(pivote: IPoint, radius: number, start_angle: number, end_angle: number, anticlockwise?: boolean)
        {
            assert(pivote);
            this.path.arc(pivote.x, pivote.y, radius, start_angle, end_angle, anticlockwise);
            this.box = new Box(pivote.x - radius, pivote.y - radius, radius * 2, radius * 2);
        }
    }

    export class Line implements IPolygon
    {
        path: Path2D = new Path2D();
        box: Box;

        constructor(start: IPoint, end: IPoint)
        {
            assert(start);
            assert(end);
            this.path.moveTo(start.x, start.y);
            this.path.lineTo(end.x, end.y);
            this.box = new Box(
                Math.min(start.x, end.x),
                Math.min(start.y, start.y),
                Math.abs(end.x - start.x),
                Math.abs(end.y - start.y)
            );
        }
    }

    export class Rectangle implements IPolygon
    {
        path: Path2D = new Path2D();
        box: Utils.Box;

        constructor(box: Box)
        {
            assert(box);
            this.path.rect(box.x, box.y, box.w, box.h);
            this.box = box;
        }
    }
}