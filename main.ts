﻿/// <reference path="utils.ts" />
/// <reference path="sprites.ts" />
/// <reference path="polygons.ts" />
/// <reference path="interfaces.ts" />
/// <reference path="play_ground.ts" />
/// <reference path="tools.document.ts" />

let playGround: Geoma.PlayGround;
let mainDocument: Geoma.Tools.Document;

const GeomaApplicationVersion: number = 0;
const GeomaFeatureVersion: number = 6;
const GeomaFixVersion: number = 1;

window.onload = () =>
{
    document.title = `${document.title} v${GeomaApplicationVersion}.${GeomaFeatureVersion}.${GeomaFixVersion}`;
    let canvas = document.getElementById('playArea');
    playGround = new Geoma.PlayGround(canvas as HTMLCanvasElement);
    mainDocument = new Geoma.Tools.Document(playGround);
    window.requestAnimationFrame(drawAll);
};

window.onresize = () =>
{
    playGround.invalidate();
}

function drawAll(__time: number)
{
    mainDocument.draw(playGround);
    window.requestAnimationFrame(drawAll);
}

function updateAllLatexEngines()
{
    Geoma.Utils.assert(mainDocument);
    mainDocument.latexEngine.mathContainerUpdate();
}

function disableAllLatexEngines()
{
    Geoma.Utils.assert(mainDocument);
    mainDocument.latexEngine.disabled = true;
}
