/// <reference path="utils.ts" />
/// <reference path="sprites.ts" />
/// <reference path="polygons.ts" />
/// <reference path="interfaces.ts" />
/// <reference path="play_ground.ts" />
/// <reference path="tools.document.ts" />

let playGround: Geoma.PlayGround;
let mainDocument: Geoma.Tools.Document;

window.onload = () =>
{
    let canvas = document.getElementById('playArea');
    playGround = new Geoma.PlayGround(canvas as HTMLCanvasElement);
    mainDocument = new Geoma.Tools.Document(playGround);
    window.requestAnimationFrame(drawAll);
};

window.onresize = () =>
{
    playGround.invalidate();
}

function drawAll(time: number)
{
    mainDocument.draw(playGround);
    window.requestAnimationFrame(drawAll);
}

