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
/** The RDN faceted category of a modifier token. */
type ModifierCategory = "Core" | "Special" | "Order" | "Clamp" | "Map" | "Filter" | "Substitute" | "Generate" | "Accumulate" | "Scale" | "Reinterpret" | "Dispatch";
interface NotationDoc {
	readonly key: string;
	readonly category: ModifierCategory;
	readonly title: string;
	readonly description: string;
	readonly displayBase: string;
	readonly color: string;
	readonly colorLight: string;
	readonly forms: readonly {
		readonly notation: string;
		readonly note: string;
	}[];
	readonly comparisons?: readonly {
		readonly operator: string;
		readonly note: string;
	}[];
	readonly examples: readonly {
		readonly description: string;
		readonly notation: string;
		readonly options?: RollOptions<string | number>;
	}[];
}
declare const NOTATION_DOCS: Readonly<Record<string, NotationDoc>>;
declare const MODIFIER_DOCS: Readonly<Record<string, NotationDoc>>;
declare const DICE_DOCS: Readonly<Record<string, NotationDoc>>;
export { DICE_DOCS, MODIFIER_DOCS, ModifierCategory, NOTATION_DOCS, NotationDoc };
