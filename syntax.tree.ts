/// <reference path="utils.ts" />
/// <reference path="sprites.ts" />
/// <reference path="interfaces.ts" />
/// <reference path="tools.resources.ts" />

const factorialCache: Array<number> = [];

function factorial(value: number): number
{
	if (!factorialCache.length)
	{
		factorialCache.push(1);
		for (let i = 1; i <= 170; i++)
		{
			factorialCache.push(factorialCache[factorialCache.length - 1] * i);
		}
	}
	if (value > 170)
	{
		return Infinity;
	}
	else if (value >= 0)
	{
		return factorialCache[Geoma.Utils.toInt(value)];
	}
	else
	{
		return NaN;
	}
}

function derivative(id: string, context: Geoma.ICodeEvaluatorContext, code: string): number
{
	const f = context.getFunction(id);
	if (f)
	{
		const last_x = context.arg(`${id}_x`);
		const last_y = context.arg(`${id}_y`);
		const current_x = context.arg(`x`);
		const current_y = f(current_x);
		context.setArg(`${id}_x`, current_x);
		context.setArg(`${id}_y`, current_y);
		if (last_x < current_x)
		{
			return (current_y - last_y) / (current_x - last_x);
		}
		else
		{
			return NaN;
		}
	}
	else
	{
		context.addFunction(id, code);
		const f = context.getFunction(id);
		Geoma.Utils.assert(f);
		const current_x = context.arg(`x`);
		const current_y = f(current_x);
		context.addArg(`${id}_x`, current_x);
		context.addArg(`${id}_y`, current_y);
		return NaN;
	}
}

function nthRoot(value: number, degree: number): number
{
	if (degree > 0 && degree == Math.trunc(degree) && degree % 2)
	{
		return Math.sign(value) * Math.pow(Math.abs(value), 1.0 / degree);
	}
	else
	{
		return Math.pow(value, 1.0 / degree);
	}
}

module Geoma.Syntax
{
	import assert = Utils.assert;

	type DeserializedCode = { code: CodeElement, index: number };
	function defaultVisitor (_: CodeArgument): void { }

	export abstract class CodeElement
	{
		public abstract get code(): string;
		public abstract get text(): string;
		public abstract get math(): string;
		public get derivativeLevel(): number
		{
			return this.getDerivativeLevel(0);
		}

		public visitArguments(visitor: typeof defaultVisitor): void
		{
			if (this instanceof Syntax.CodeArgument && !(this instanceof CodeArgumentX))
			{
				visitor(this);
			}
			else if (this instanceof CodeUnary)
			{
				this.operand.visitArguments(visitor);
			}
			else if (this instanceof CodeBinary)
			{
				this.operand1.visitArguments(visitor);
				this.operand2.visitArguments(visitor);
			}
		}
		public serialize(data: Array<string>): void
		{
			if (this instanceof CodeLiteral)
			{
				data.push(`+l`);
				data.push(this.text);
			}
			else if (this instanceof CodeArgumentX)
			{
				data.push(`+x`);
			}
			else if (this instanceof CodeArgument)
			{
				data.push(`+a`);
				data.push(this.text);
			}
			else if (this instanceof CodeUnary)
			{
				data.push(`+u`);
				data.push(this.function);
				this.operand.serialize(data);
			}
			else if (this instanceof CodeBinary)
			{
				data.push(`+b`);
				data.push(this.function);
				this.operand1.serialize(data);
				this.operand2.serialize(data);
			}
		}
		public static deserialize(data: Array<string>, i: number): DeserializedCode
		{
			if (i >= data.length)
			{
				throw CodeElement.error;
			}
			switch (data[i])
			{
				case `+l`:
					i++;
					if (i >= data.length)
					{
						throw CodeElement.error;
					}
					const value = parseFloat(data[i]);
					if (data[i] != `${value}`)
					{
						throw CodeElement.error;
					}
					return { code: new CodeLiteral(value), index: i + 1 };
				case `+x`:
					return { code: new CodeArgumentX(), index: i + 1 };
				case `+a`:
					i++;
					if (i >= data.length)
					{
						throw CodeElement.error;
					}
					return { code: new CodeArgument(data[i]), index: i + 1 };
				case `+u`:
					i++;
					if (i >= data.length)
					{
						throw CodeElement.error;
					}
					const unary_function = data[i] as UnaryFunctions;
					const operand = CodeElement.deserialize(data, i + 1);
					return { code: new CodeUnary(unary_function, operand.code), index: operand.index };
				case `+b`:
					i++;
					if (i >= data.length)
					{
						throw CodeElement.error;
					}
					const binary_function = data[i] as BinaryFunctions;
					const operand1 = CodeElement.deserialize(data, i + 1);
					const operand2 = CodeElement.deserialize(data, operand1.index);
					return { code: new CodeBinary(operand1.code, binary_function, operand2.code), index: operand2.index };
				default:
					throw CodeElement.error;
			}
		}

		protected getDerivativeLevel(level: number): number
		{
			if (this instanceof Syntax.CodeUnary)
			{
				if (this.function == "f'")
				{
					return this.operand.getDerivativeLevel(level + 1);
				}
				else
				{
					return this.operand.getDerivativeLevel(level);
				}
			}
			else if (this instanceof Syntax.CodeBinary)
			{
				const level1 = this.operand1.getDerivativeLevel(level);
				const level2 = this.operand2.getDerivativeLevel(level);
				return Math.max(level1, level2);
			}
			else
			{
				return level;
			}
		}

		private static readonly error = new Error(Tools.Resources.string("Невозможно восстановить данные"));
	}

	export abstract class CodeDefinitionElement extends CodeElement
	{
	}

	export class CodeArgument extends CodeDefinitionElement
	{
		constructor(arg_name: string)
		{
			super();
			this._argName = arg_name;
		}

		public get code(): string
		{
			return `this.arg('${this._argName}')`;
		}
		public get text(): string
		{
			return this._argName;
		}
		public get math(): string
		{
			return this.text;
		}

		private readonly _argName: string;
	}

	export class CodeLiteral extends CodeDefinitionElement
	{
		constructor(value: number)
		{
			super();
			this._value = value;
		}

		public get code(): string
		{
			return `${this._value}`;
		}
		public get text(): string
		{
			return `${this._value}`;
		}
		public get math(): string
		{
			return this.text;
		}

		private readonly _value: number;
	}

	export class CodeArgumentX extends CodeArgument
	{
		constructor()
		{
			super("x");
		}
	}

	export type UnaryFunctions =
		"±" | "sin" | "cos" | "tan" |
		"arcsin" | "arccos" | "arctan" |
		"ln" | "log2" | "log10" |
		"exp" | "√" | "∛" | "∜" | "sign" | "abs" |
		"sinh" | "cosh" | "tanh" |
		"arcsinh" | "arccosh" | "arctanh" |
		"!" | "f'" | "round" | "ceil" | "floor" | "neg";

	export class CodeUnary extends CodeElement
	{
		constructor(_function: UnaryFunctions, operand: CodeElement)
		{
			super();
			this._function = _function;
			this._operand = operand;
		}

		public get code(): string
		{
			let math_function: string;
			switch (this._function)
			{
				case "±":
					return `${this._operand.code}`;
				case "arccos":
					math_function = "Math.acos";
					break;
				case "arcsin":
					math_function = "Math.asin";
					break;
				case "arctan":
					math_function = "Math.atan";
					break;
				case "sin":
					math_function = "Math.sin";
					break;
				case "cos":
					math_function = "Math.cos";
					break;
				case "tan":
					math_function = "Math.tan";
					break;
				case "ln":
					math_function = "Math.log";
					break;
				case "log2":
					math_function = "Math.log2";
					break;
				case "log10":
					math_function = "Math.log10";
					break;
				case "exp":
					math_function = "Math.exp";
					break;
				case "√":
					math_function = "Math.sqrt";
					break;
				case "∛":
					return `Math.cbrt(${this._operand.code})`;
				case "∜":
					return `Math.sqrt(Math.sqrt(${this._operand.code}))`;
				case "sign":
					math_function = "Math.sign";
					break;
				case "abs":
					math_function = "Math.abs";
					break;
				case "sinh":
					math_function = "Math.sinh";
					break;
				case "cosh":
					math_function = "Math.cosh";
					break;
				case "tanh":
					math_function = "Math.tanh";
					break;
				case "arcsinh":
					math_function = "Math.asinh";
					break;
				case "arccosh":
					math_function = "Math.acosh";
					break;
				case "arctanh":
					math_function = "Math.atanh";
					break;
				case "!":
					math_function = "factorial";
					break;
				case "f'":
					const code = this._operand.code.replaceAll(`\\`, `\\\\`).replaceAll(`"`, `\\"`);
					return `derivative(${CodeUnary._functionNo++}, this, "${code}")`;
				case "round":
					math_function = "Math.round";
					break;
				case "ceil":
					math_function = "Math.ceil";
					break;
				case "floor":
					math_function = "Math.floor";
					break;
				case "neg":
					math_function = "-";
					break;
				default:
					assert(false, `Math function ${this._function} not supported`);
			}
			return `${math_function}(${this._operand.code})`;
		}
		public get text(): string
		{
			return this.toText(this._operand.text);
		}
		public get math(): string
		{
			switch (this._function)
			{
				case "log2":
					return `log(${this._operand.math}; 2)`;
				case "log10":
					return `log(${this._operand.math}; 10)`;
				case "√":
					return `sqrt(${this._operand.math})`;
				case "∛":
					return `cbrt(${this._operand.math})`;
				case "∜":
					return `root(${this._operand.math}, 4)`;
				case "abs":
					return `abs(${this._operand.math})`;
				case "round":
					return `round(${this._operand.math})`;
				case "ceil":
					return `ceil(${this._operand.math})`;
				case "floor":
					return `floor(${this._operand.math})`;
				case "!":
					return `fact(${this._operand.math})`;
				default:
					return this.toText(this._operand.math);
			}
		}
		public get function(): UnaryFunctions
		{
			return this._function;
		}
		public get operand(): CodeElement
		{
			return this._operand;
		}

		private toText(operand: string): string
		{
			switch (this.function)
			{
				case "abs":
					return `|${operand}|`;
				case "round":
					return `[${operand}]`;
				case "ceil":
					return `⎾${operand}⏋`;
				case "floor":
					return `⎿${operand}⏌`;
				case "!":
					return `${operand}!`;
				case "neg":
					return `-(${operand})`;
			}

			if (operand.length > 0 && operand.charAt(0) == `(`)
			{
				return `${this._function}${operand}`;
			}
			else
			{
				return `${this._function}(${operand})`;
			}
		}

		private readonly _function: UnaryFunctions;
		private readonly _operand: CodeElement;
		private static _functionNo: number = 1;
	}

	export type BinaryFunctions = "pow" | "n√" | "+" | "-" | "*" | "÷";

	export class CodeBinary extends CodeElement
	{
		constructor(operand1: CodeElement, _function: BinaryFunctions, operand2: CodeElement)
		{
			super();
			this._function = _function;
			this._operand1 = operand1;
			this._operand2 = operand2;
		}

		public get code(): string
		{
			switch (this._function)
			{
				case "pow":
					return `Math.pow(${this._operand1.code}, ${this._operand2.code})`;
				case "n√":
					return `nthRoot(${this._operand2.code}, ${this._operand1.code})`;
				case "+":
					return `(${this._operand1.code} + ${this._operand2.code})`;
				case "-":
					return `(${this._operand1.code} - ${this._operand2.code})`;
				case "*":
					return `(${this._operand1.code} * ${this._operand2.code})`;
				case "÷":
					return `(${this._operand1.code} / ${this._operand2.code})`;
				default:
					assert(false, `Math function ${this._function} not supported`);
			}
		}
		public get text(): string
		{
			return this.toText(this._operand1.text, this._operand2.text);
		}
		public get math(): string
		{
			switch (this._function)
			{
				case "n√":
					return `root(${this._operand2.math}; ${this._operand1.math})`;
				default:
					return this.toText(this._operand1.math, this._operand2.math);
			}
		}
		public get function(): BinaryFunctions
		{
			return this._function;
		}
		public get operand1(): CodeElement
		{
			return this._operand1;
		}
		public get operand2(): CodeElement
		{
			return this._operand2;
		}

		protected toText(operand1: string, operand2: string): string
		{
			switch (this._function)
			{
				case "pow":
					return `(${operand1} ^ ${operand2})`;
				case "n√":
					return `(${operand1}√ ${operand2})`;
				case "+":
					return `(${operand1} + ${operand2})`;
				case "-":
					return `(${operand1} - ${operand2})`;
				case "*":
					return `(${operand1} * ${operand2})`;
				case "÷":
					return `(${operand1} / ${operand2})`;
				default:
					assert(false, `Math function ${this._function} not supported`);
			}
		}

		private readonly _function: BinaryFunctions;
		private readonly _operand1: CodeElement;
		private readonly _operand2: CodeElement;
	}
}