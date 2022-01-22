module Geoma.Latex
{
	type drawingData = { formula: string, ctx: CanvasRenderingContext2D, x: number, y: number, scale: number };

	export class LatexEngine
	{
		public disabled: boolean = false;

		public getRenderedImage(formula: string): HTMLImageElement | undefined
		{
			return this.existingFormulas.get(formula);
		}

		public mathContainerUpdate()
		{
			let container = document.getElementById("mathContainer");
			if (container)
			{
				let select = container.querySelector("svg");

				if (select)
				{
					let data = select.outerHTML;

					let DOMURL = window.URL || window.webkitURL || window;

					let img = new Image();
					let svg = new Blob([data], {
						type: 'image/svg+xml;charset=utf-8'
					});
					var url = DOMURL.createObjectURL(svg);

					img.onload = (() =>
					{
						if (this.queue.length)
						{
							this.existingFormulas.set(this.queue[0].formula, img);

							this.drawImageFromQueue();
						}
					}).bind(this);

					img.src = url;
				}
			}
		}

		public drawLatex(formula: string, x: number, y: number, scale: number, ctx: CanvasRenderingContext2D)
		{
			this.queue.push({ formula: formula, x: x, y: y, ctx: ctx, scale: scale });

			if (this.queue.length == 1)
			{
				this.drawLatexFromQueue();
			}
		}

		private drawImageFromQueue()
		{
			let imgData = this.queue[0];

			let img = this.existingFormulas.get(imgData.formula)!;

			imgData.ctx.save();
			imgData.ctx.transform(1, 0, 0, 1, 0, 0);
			imgData.ctx.drawImage(img, imgData.x, imgData.y, img.width * imgData.scale, img.height * imgData.scale);
			imgData.ctx.restore();

			this.queue.shift();
			this.drawLatexFromQueue();
		}

		private drawLatexFromQueue()
		{
			if (this.queue.length)
			{
				let container = document.getElementById("mathContainer");

				let imgData = this.queue[0];

				if (container)
				{
					if (!this.existingFormulas.has(imgData.formula))
					{
						container.innerHTML = "$" + imgData.formula + "$";
					}
					else
					{
						this.drawImageFromQueue();
					}
				}
			}
		}

		private queue: drawingData[] = [];

		private existingFormulas = new Map<string, HTMLImageElement>();
	}
}