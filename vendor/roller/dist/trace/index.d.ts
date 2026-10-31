interface ComparisonOptions {
	/** Threshold for "greater than" comparisons (strict: roll > N) */
	greaterThan?: number;
	/** Threshold for "greater than or equal to" comparisons (roll >= N) */
	greaterThanOrEqual?: number;
	/** Threshold for "less than" comparisons (strict: roll < N) */
	lessThan?: number;
	/** Threshold for "less than or equal to" comparisons (roll <= N) */
	lessThanOrEqual?: number;
	/** Exact values to match */
	exact?: number[];
}
interface DropOptions extends ComparisonOptions {
	/** Number of highest dice to drop */
	highest?: number;
	/** Number of lowest dice to drop */
	lowest?: number;
}
interface KeepOptions {
	/** Number of highest dice to keep */
	highest?: number;
	/** Number of lowest dice to keep */
	lowest?: number;
}
interface RerollOptions extends ComparisonOptions {
	/** Maximum number of dice rerolled */
	max?: number;
	/** Reroll each matching die once and keep the new result (`ro{..}`) */
	once?: boolean;
}
interface ReplaceOptions {
	/** Value or comparison to match for replacement */
	from: number | ComparisonOptions;
	/** Value to replace matched rolls with */
	to: number;
}
interface UniqueOptions {
	/** Values that are allowed to repeat */
	notUnique: number[];
}
interface CountOptions extends ComparisonOptions {
	/** If true, below-threshold count subtracts from above-threshold count */
	deduct?: boolean;
}
type ModifierConfig = number | number[] | boolean | "asc" | "desc" | ComparisonOptions | CountOptions | DropOptions | KeepOptions | ReplaceOptions | ReplaceOptions[] | RerollOptions | UniqueOptions;
interface ModifierOptions {
	/** Cap roll values to a range */
	cap?: ComparisonOptions;
	/** Drop dice from the result */
	drop?: DropOptions;
	/** Keep dice from the result (complement to drop) */
	keep?: KeepOptions;
	/** Replace specific values */
	replace?: ReplaceOptions | ReplaceOptions[];
	/** Reroll dice matching conditions */
	reroll?: RerollOptions;
	/** Ensure unique values (true or options) */
	unique?: boolean | UniqueOptions;
	/** Exploding dice: add a die on max value, and again while new dice explode */
	explode?: boolean | ComparisonOptions;
	/** Compounding exploding: add to triggering die instead of creating new dice */
	compound?: boolean | number | ComparisonOptions;
	/** Penetrating exploding: subtract 1 from each subsequent explosion */
	penetrate?: boolean | number | ComparisonOptions;
	/** Count dice matching conditions instead of summing */
	count?: CountOptions;
	/** Multiply dice result (before +/- arithmetic) */
	multiply?: number;
	/** Add a fixed value to the total */
	plus?: number;
	/** Subtract a fixed value from the total */
	minus?: number;
	/** Sort the rolls array (display-only, does not affect total) */
	sort?: "asc" | "desc";
	/** Integer divide the total (truncates toward zero) */
	integerDivide?: number;
	/** Modulo the total */
	modulo?: number;
	/** Wild die: compound on max, remove wild + highest on 1 (D6 System) */
	wildDie?: boolean;
	/** Multiply final total (after all other modifiers) */
	multiplyTotal?: number;
	/** Explode through a sequence of die sizes */
	explodeSequence?: number[];
}
/**
* Template literal type for dice notation strings.
*
* The quantity is optional (`d20` is accepted as an alias for `1d20`, per
* RDN §4.1), so the leading number may be omitted.
*/
type DiceNotation = `${number | ""}${"d" | "D"}${number}${ModifierSuffix}`;
/**
* Configuration options for a dice roll.
*
* @template T - Type for custom dice faces (defaults to string)
*/
interface RollOptions<T = string> {
	/** Number of dice to roll (default: 1) */
	quantity?: number;
	/** How this roll combines with others: 'add' or 'subtract' (default: 'add') */
	arithmetic?: "add" | "subtract";
	/** Number of sides, or array of custom face values */
	sides: number | T[];
	/** Modifiers to apply to the roll (drop, reroll, explode, etc.) */
	modifiers?: ModifierOptions;
	/**
	* Optional identifier for this roll in multi-roll expressions.
	* Default keys are auto-generated as "Roll 1", "Roll 2", etc.
	*/
	key?: string | undefined;
	/**
	* Optional annotation label for this roll (e.g. `"fire"` from `2d6[fire]`).
	* Carried through to the roll record; does not affect the numeric result.
	*/
	label?: string | undefined;
}
/**
* String literal type for percentile dice (d%).
* Equivalent to rolling 1d100.
*/
type PercentileDie = "d%" | "D%" | `${number}${"d" | "D"}%`;
/**
* Fate/Fudge dice notation variants.
*
* - `dF` / `dF.1` — standard Fudge die: faces [-1, 0, 1]
* - `dF.2` — extended Fudge die: faces [-2, -1, 0, 1, 2]
*
* Case-insensitive (dF and DF are equivalent).
*/
type FateDieLiteral = "dF" | "DF" | "df" | "Df" | "dF.1" | "DF.1" | "df.1" | "Df.1" | "dF.2" | "DF.2" | "df.2" | "Df.2";
/**
* Fate/Fudge dice notation with optional quantity prefix.
* Matches patterns like `dF`, `4dF`, `dF.1`, `4dF.2`, etc.
*/
type FateDieNotation = FateDieLiteral | `${number}${FateDieLiteral}`;
/**
* Zero-bias dice notation.
* `zN` rolls a dN with faces 0 to N-1 instead of 1 to N.
* Supports optional quantity prefix: `4z6` = four zero-biased d6s.
*
* Case-insensitive (z6 and Z6 are equivalent).
*/
type ZeroBiasNotation = `${number | ""}${"z" | "Z"}${number}`;
/**
* Custom faces dice notation.
* `d{2,3,5,7}` rolls a die with explicit numeric face values [2,3,5,7].
* `d{fire,ice,lightning}` rolls a die with string face values.
* Mixed faces like `d{1,fire,3}` are treated as all strings.
* Supports optional quantity prefix: `3d{1,1,2,2,3,3}`.
* Numeric faces can include 0 and negative numbers: `d{-1,0,1}`.
*
* Case-insensitive on the `d`.
*/
type CustomFacesNotation = `${"d" | "D"}{${string}}` | `${number}${"d" | "D"}{${string}}`;
/**
* Draw die notation — sampling without replacement.
* `DD6` draws from a d6 pool (faces 1-6, no repeats until exhausted).
* Supports quantity prefix: `3DD6` draws 3 unique values.
*
* Case-insensitive: DD, dd, Dd, dD all work.
*/
type DrawDieNotation = `${"dd" | "DD" | "Dd" | "dD"}${number}` | `${number}${"dd" | "DD" | "Dd" | "dD"}${number}`;
/**
* Geometric die notation — roll until first 1, count attempts.
* `g6` rolls d6 repeatedly until a 1 appears, result is the attempt count.
* Supports quantity prefix: `3g6` performs 3 independent geometric rolls.
*
* Case-insensitive: g6 and G6 are equivalent.
*/
type GeometricDieNotation = `${"g" | "G"}${number}` | `${number}${"g" | "G"}${number}`;
/**
* Valid input types for the roll() function.
*
* @template T - Type for custom dice faces
*
* @example
* ```ts
* roll(20)              // number - d20
* roll("4d6L")          // notation string
* roll({ sides: 6, quantity: 4 })  // options object
* roll("d%")            // percentile (1d100)
* roll("4dF")           // four Fate/Fudge dice
* roll("z6")            // zero-bias d6 (0-5)
* roll("d{2,3,5,7}")    // custom faces
* roll("DD6")           // draw die (no replacement)
* ```
*/
type RollArgument<T = string> = RollOptions<T> | DiceNotation | FateDieNotation | PercentileDie | ZeroBiasNotation | CustomFacesNotation | DrawDieNotation | GeometricDieNotation | number;
/**
* Record of a single modifier's effect on the dice pool.
*
* `added` and `removed` represent the frequency difference between
* the dice pool before and after this modifier ran — values that
* appear more frequently in the new pool go to `added`, less frequently to `removed`.
*
* @example
* ```ts
* // Roll [3, 5, 2, 6], drop lowest 1 (removes 2):
* // log = { modifier: 'drop', options: { lowest: 1 }, added: [], removed: [2] }
*
* // Roll [1, 4, 4, 6], reroll 1 (becomes 3):
* // log = { modifier: 'reroll', options: {...}, added: [3], removed: [1] }
*
* // Roll [2, 4, 6], explode on 6 (adds a 5):
* // log = { modifier: 'explode', options: true, added: [5], removed: [] }
* ```
*/
interface ModifierLog {
	/** Name of the modifier that was applied */
	modifier: string;
	/** Configuration used for this modifier */
	options: ModifierConfig | undefined;
	/** Values that were added by this modifier */
	added: number[];
	/** Values that were removed by this modifier */
	removed: number[];
	/** Paired replacements for modifiers that do 1:1 substitution (e.g. unique, reroll, replace) */
	replacements?: readonly {
		readonly from: number;
		readonly to: number;
	}[];
}
/**
* Intermediate state during modifier processing.
*/
interface NumericRollBonus {
	/** Current roll values */
	rolls: number[];
	/** History of modifier applications */
	logs: ModifierLog[];
}
/**
* Fully resolved parameters for a single roll.
*
* Contains all information needed to execute and describe the roll.
*
* @template T - Type for custom dice faces
*/
interface RollParams<T = string> extends Required<Omit<RollOptions<T>, "sides" | "label">> {
	/** Numeric sides (always resolved to number) */
	sides: number;
	/** Custom face values if using non-numeric dice */
	faces?: T[];
	/** Numeric face values for dice with non-standard faces (e.g. Fate: [-1,0,1], zero-bias: [0,1,2,...]) */
	numericFaces?: readonly number[];
	/** Draw without replacement (DD notation) */
	draw?: true;
	/** Geometric die — roll until 1, count attempts */
	geometric?: true;
	/** Original input argument */
	argument: RollArgument<T>;
	/** Human-readable description of the roll */
	description: string[];
	/** Dice notation string */
	notation: DiceNotation;
	/** Annotation label (e.g., "fire" from [fire]) */
	label?: string;
}
/**
* Complete record of a single roll execution.
*
* Contains the input parameters, raw rolls, modifier history,
* and final computed results.
*
* @template T - Type for custom dice faces
*/
interface RollRecord<T = string> {
	/** Original input argument */
	argument: RollParams<T>["argument"];
	/** Dice notation string */
	notation: RollParams<T>["notation"];
	/** Human-readable description */
	description: RollParams<T>["description"];
	/** Full roll parameters */
	parameters: RollParams<T>;
	/** Die results after modifiers */
	rolls: number[];
	/** Original rolls before modifiers */
	initialRolls: number[];
	/** Logs from each modifier application */
	modifierLogs: NumericRollBonus["logs"];
	/** Total including arithmetic modifiers */
	appliedTotal: number;
	/** Custom face results (for non-numeric dice) */
	customResults?: T[];
	/** Annotation label (e.g., "fire" from [fire]) */
	label?: string;
	/** Final total for this roll */
	total: number;
}
/**
* The subset of RollRecord fields required by traceRoll.
* Accepts any object that has at least these fields.
*/
type TraceableRollRecord = Pick<RollRecord, "initialRolls" | "rolls" | "modifierLogs" | "appliedTotal" | "total">;
type RollTraceStep = {
	kind: "rolls";
	label: string;
	unchanged: readonly number[];
	removed: readonly number[];
	added: readonly number[];
	replacements?: readonly {
		readonly from: number;
		readonly to: number;
	}[];
} | {
	kind: "divider";
} | {
	kind: "arithmetic";
	label: string;
	display: string;
} | {
	kind: "finalRolls";
	rolls: readonly number[];
	arithmeticDelta: number;
};
declare function formatAsMath(rolls: readonly number[], delta?: number): string;
declare function traceRoll(record: TraceableRollRecord): readonly RollTraceStep[];
export { RollTraceStep, TraceableRollRecord, formatAsMath, traceRoll };
