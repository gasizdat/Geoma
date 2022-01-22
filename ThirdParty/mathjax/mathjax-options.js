window.MathJax = {
	tex: {
		inlineMath: [['$', '$'], ['\\(', '\\)']],
		packages: { '[+]': ['color'] }
	},

	loader: { load: ["input/tex", "output/svg", "[tex]/color"] },
};

function updateMathJax()
{
	if (MathJax.typeset === undefined)
	{
		disableAllLatexEngines();
	}
	else
	{
		elementToObserve = window.document.getElementById('mathContainer');
		observer = new MutationObserver(function (mutationsList, observer)
		{
			let containsFormula = false;
			for (let index = 0; index < window.MathJax.config.tex.inlineMath.length;index++)
			{
				if (!containsFormula)
				{
					containsFormula = elementToObserve.innerHTML.indexOf(window.MathJax.config.tex.inlineMath[index][0]) != -1;
				}				
			}

			if (MathJax.typeset !== undefined && containsFormula)
			{
				MathJax.typeset();
				updateAllLatexEngines();
			}
		});
		observer.observe(elementToObserve, { characterData: false, childList: true, attributes: false });
	}
}

window.addEventListener("load", updateMathJax);