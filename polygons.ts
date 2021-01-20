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

    export class CustomPath implements IPolygon
    {
        path: Path2D = new Path2D();
        box: Box;

        constructor(pivote: IPoint, path_string: string)
        {
            assert(pivote);
            this.path = new Path2D(path_string);
            this.box = new Box(pivote.x, pivote.y);
        }
    }

    export class Line implements IPolygon
    {
        path: Path2D = new Path2D();
        box: Box;

        constructor(...points: IPoint[])
        {
            assert(points.length >= 2);

            this.path.moveTo(points[0].x, points[0].y);
            this.box = new Box(points[0].x, points[0].y);

            for (const point of points)
            {
                this.path.lineTo(point.x, point.y);
                if (this.box.x > point.x)
                {
                    this.box.x = point.x;
                }
                if (this.box.y > point.y)
                {
                    this.box.y = point.y;
                }

                const w = point.x - this.box.x;
                const h = point.y - this.box.y;
                if (this.box.w < w)
                {
                    this.box.w = w;
                }
                if (this.box.h < h)
                {
                    this.box.h = h;
                }
            }
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