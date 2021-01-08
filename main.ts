/// <reference path="utils.ts" />
/// <reference path="sprites.ts" />
/// <reference path="polygons.ts" />
/// <reference path="interfaces.ts" />
/// <reference path="play_ground.ts" />
/// <reference path="tools.document.ts" />

class DrawLiner
{
    private ground: Geoma.PlayGround;
    constructor(ground: Geoma.PlayGround)
    {
        this.ground = ground;
        this.ground.onMouseMove.bind(this, this.onMouseMove);
        this.ground.onMouseDown.bind(this, this.onMouseDown);
        this.ground.onMouseUp.bind(this, this.onMouseUp);
    }
    onMouseMove(event: MouseEvent): boolean 
    {
        this.ground.context2d.fillStyle = "#f7f800";
        this.ground.context2d.fillRect(event.x, event.y, 1, 1);
        return true;
    }
    onMouseDown(event: MouseEvent): boolean
    {
        return true;
    }
    onMouseUp(event: MouseEvent): boolean
    {
        return true;
    }
}

let framesCount: number;
let fps: number;
let lastTime: number;
let play_ground: Geoma.PlayGround;
let sprites: Geoma.Sprite.Container;
let drawingSprites: number;
let poly: Geoma.Sprite.Polyline;

let w = 0;
let dw = -1;
const InfoStyle: CanvasTextDrawingStyles = {
    font: "18px Arial", textBaseline: "top", direction: "inherit", textAlign: "left"
};
function test(sprites: Geoma.Sprite.Container)
{
    let draw_liner = new DrawLiner(play_ground);

    let background = new Geoma.Sprite.Rectangle(0, 0, () => play_ground.w, () => play_ground.h, "SteelBlue");
    sprites.push(background);


    let sprite: Geoma.Sprite.Sprite;
    /*sprite = new Geoma.Sprite.Dragable(play_ground, new Geoma.Sprite.Rectangle(300, 600, 150, 70, "#fefefe"));
    sprites.push(sprite);

    sprite = new Geoma.Sprite.Dragable(play_ground, new Geoma.Sprite.Rectangle(100, 200, 200, 90, "#00f7f8"));
    sprites.push(sprite);*/

    let custom_sprite = new Geoma.Sprite.Container();
    sprite = new Geoma.Sprite.Rectangle(100, 600, 100, 50, "Gainsboro");
    custom_sprite.push(sprite);
    sprite = new Geoma.Sprite.Text(100, 600, 300, 50, "#ffff00", InfoStyle, "custom text", true);
    sprite.addX((value: number) =>
    {
        return value + w;
    });
    custom_sprite.push(sprite);
    let drag_sprite = new Geoma.Sprite.Dragable(play_ground, custom_sprite);
    drag_sprite.selectStyle = "#ccee55";

    sprites.push(drag_sprite);

    poly = new Geoma.Sprite.Polyline(200, 200, 1, "#ee1111");
    poly.lineWidth.addModifier(() => w);

    poly.addPolygon(new Geoma.Polygon.Rectangle(new Geoma.Utils.Box(5, 5, 15, 35)));
    poly.addPolygon(new Geoma.Polygon.Arc(Geoma.Utils.Point.make(70, 70), 35, Geoma.Utils.toRad(10), Geoma.Utils.toRad(300)));
    poly.addPolygon(new Geoma.Polygon.Rectangle(new Geoma.Utils.Box(40, 70, 44, 77)));
    poly.addPolygon(new Geoma.Polygon.Ellipse(Geoma.Utils.Point.make(10, 10), 25, 50, 0, 2 * Math.PI));
    let drag_sprite2 = new Geoma.Sprite.Dragable(play_ground, poly);
    drag_sprite2.selectStyle = "#ccee55";
    sprites.push(drag_sprite2);

    let ellipse = new Geoma.Polygon.Ellipse(Geoma.Utils.Point.make(30, 35), 30, 35, 0, 2 * Math.PI);

    let poly1 = new Geoma.Sprite.Polyline(400, 100, 4, "#ef00ef");
    poly1.addPolygon(ellipse);
    poly1.addPolygon(new Geoma.Polygon.Line(Geoma.Utils.Point.make(45, 45), Geoma.Utils.Point.make(65, 65)));

    let poly2 = new Geoma.Sprite.Polyshape(400, 100, 3, "#1122ee");
    poly2.addPolygon(ellipse);

    custom_sprite = new Geoma.Sprite.Container();
    custom_sprite.push(poly2);
    custom_sprite.push(poly1);

    sprites.push(custom_sprite);
    
    let custom_sprite2 = new Geoma.Sprite.Container();
    
    for (let i = 0; i < 10000; i++)
    {
        sprite = new Geoma.Sprite.Rectangle(100 + i * 1.001, 100 + i * 1.002, 30, 20, "#00ff00");
        sprite.addX((value: number) => value + w);
        sprite.addY((value: number) => value + w);
        custom_sprite2.push(sprite);
    }
    drag_sprite = new Geoma.Sprite.Dragable(play_ground, custom_sprite2);
    drag_sprite.selectStyle = "#ccee55";
    sprites.push(drag_sprite);
    

}

window.onload = () =>
{
    framesCount = 0;
    fps = 0;
    lastTime = 0;
    let canvas = document.getElementById('playArea');
    play_ground = new Geoma.PlayGround(canvas as HTMLCanvasElement);

    sprites = new Geoma.Sprite.Container();

    //test(sprites);

    let doc = new Geoma.Tools.Document(play_ground);
    sprites.push(doc);

    let debug_info: Geoma.Sprite.Sprite = new Geoma.Sprite.Text(0, 0, undefined, 25, "#00ffff", InfoStyle,
        () => `width: ${play_ground.w}, height: ${play_ground.h}, draws: ${drawingSprites}, ` +
            `(x: ${play_ground.mousePoint.x}, y: ${play_ground.mousePoint.y}),\tfps: ${fps}`);
    let info = debug_info;
    debug_info.addX(() => play_ground.right - info.w - 20);
    sprites.push(debug_info);


    window.requestAnimationFrame(drawAll);
};

window.onresize = () =>
{
    Geoma.Utils.assert(play_ground);
    play_ground.invalidate();
}

function foo(): Function
{
    return function () { return 42; };
}

function drawAll(time: number)
{
    if (w > 10 || w < 0)
    {
        dw = -dw;
    }
    w += 0.1 * dw;

    framesCount++;
    if ((time - lastTime) >= 1000)
    {
        fps = framesCount;
        framesCount = 0;
        lastTime = time;
    }
    drawingSprites = Geoma.PlayGround.drawingSprites;
    Geoma.PlayGround.drawingSprites = 0;
    sprites.draw(play_ground);
    window.requestAnimationFrame(drawAll);
}

