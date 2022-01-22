/// <reference path="utils.ts" />
/// <reference path="sprites.ts" />
/// <reference path="polygons.ts" />
/// <reference path="interfaces.ts" />
/// <reference path="play_ground.ts" />
/// <reference path="tools.core.ts" />
/// <reference path="tools.document.ts" />
/// <reference path="tools.menu.ts" />
/// <reference path="tools.tools.ts" />
/// <reference path="tools.styles.ts" />
/// <reference path="tools.point.base.ts" />
/// <reference path="tools.point.active.ts" />
/// <reference path="tools.line.base.ts" />
/// <reference path="tools.intersections.ts" />

module Geoma.Tools
{
    import makeMod = Utils.makeMod;
    import toInt = Utils.toInt;
    import assert = Utils.assert;

    export class ActiveCommonPoint extends ActivePoint
    {
        constructor(document: Document, x: number, y: number, group_no: number, radius: number = 5, line_width: number = 2)
        {
            super(document, x, y, radius, line_width);
            this.groupNo = group_no;
        }

        public get hidden(): boolean
        {
            return this._groupVisibility?.value === false;
        }
        public readonly groupNo: number;

        public dispose(): void
        {
            if (!this.disposed)
            {
                super.dispose();
                delete this._groupVisibility;
                if (this._intersection)
                {
                    this._intersection.dispose();
                    delete this._intersection;
                }
                for (const point of this.document.getGroup(this))
                {
                    if (!point.disposed && point.mouseHit(this))
                    {
                        this.document.removePoint(point as ActivePoint);
                    }
                }

                if (this._line2)
                {
                    this._line2.removePoint(this);
                    this._line2 = undefined;
                }
                if (this._line1)
                {
                    this._line1.removePoint(this);
                    this._line1 = undefined;
                }
            }
        }
        public addGraphLine(segment: GraphLine): void
        {
            assert(!this._line2);
            this._intersection?.dispose();
            this.resetVisible();
            if (!this._line1)
            {
                this._line1 = segment;
                this._intersection = Intersection.makeIntersection(this, this._line1);
                this.addVisible(makeMod(this, () =>
                    this._line1 !== undefined &&
                    this._intersection != undefined &&
                    this._intersection.visible &&
                    this._line1.mouseHit(this._intersection.point)
                ));
            }
            else
            {
                this._line2 = segment;
                this._intersection = Intersection.makeIntersection(this, this._line1, this._line2);
                this.addVisible(makeMod(this, () =>
                    this._line1 !== undefined &&
                    this._line2 !== undefined &&
                    this._intersection != undefined &&
                    this._intersection.visible &&
                    this._line1.mouseHit(this._intersection.point) &&
                    this._line2.mouseHit(this._intersection.point)
                ));
            }
        }
        public removeSegment(segment: GraphLine): void
        {
            let line: GraphLine | undefined;
            if (this._line1 == segment)
            {
                if (this._line2)
                {
                    line = this._line2;
                }
            }
            else if (this._line2 == segment)
            {
                if (this._line1)
                {
                    line = this._line1;
                }
            }
            else
            {
                assert(false);
            }
            this._line1 = this._line2 = undefined;

            if (line)
            {
                this.addGraphLine(line);
            }
            else
            {
                this.document.removePoint(this);
            }
        }
        public serialize(context: SerializationContext): Array<string>
        {
            const data = super.serialize(context);
            data.push(this.groupNo.toString());
            return data;
        }
        public move(dx: number, dy: number): void
        {
            if (this._line1 && !this._line2)
            {
                this._intersection!.move(dx, dy);
            }
        }
        public isMoved(receiptor: string): boolean
        {
            return super.isMoved(receiptor) || (this._intersection?.isMoved(receiptor) ?? false);
        }
        public addGroupVisibility(visibility_modifier: Utils.modifier<boolean>): void
        {
            if (!this._groupVisibility)
            {
                this._groupVisibility = new Utils.ModifiableProperty<boolean>(true);
            }
            this._groupVisibility.addModifier(visibility_modifier);
        }
        public static deserialize(context: DesializationContext, data: Array<string>, index: number): ActiveCommonPoint | null
        {
            if (data.length > (index + 2))
            {
                let group_no = -1;
                if (context.version > Document.serializationVersion1)
                {
                    if (data.length > (index + 3))
                    {
                        group_no = toInt(data[index + 3]);
                    }
                    else
                    {
                        return null;
                    }
                }
                const point = new ActiveCommonPoint(context.document, parseFloat(data[index]), parseFloat(data[index + 1]), group_no);
                point.setName(data[index + 2]);
                return point;
            }
            else
            {
                return null;
            }
        }

        protected dxModifier(value: number): number
        {
            if (this._intersection)
            {
                return value - this._intersection.dx;
            }
            else
            {
                return super.dxModifier(value);
            }
        }
        protected dyModifier(value: number): number
        {
            if (this._intersection)
            {
                return value - this._intersection.dy;
            }
            else
            {
                return super.dyModifier(value);
            }
        }
        protected innerDraw(play_ground: PlayGround): void
        {
            if (!this.hidden)
            {
                super.innerDraw(play_ground);
            }
        }

        private _line1?: GraphLine;
        private _line2?: GraphLine;
        private _intersection?: Intersection;
        private _groupVisibility?: Utils.ModifiableProperty<boolean>;
    }
}