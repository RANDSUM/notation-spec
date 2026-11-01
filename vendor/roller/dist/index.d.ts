/**
* Centralized error codes for all RANDSUM errors.
* Use these constants instead of raw strings for consistency.
*/
declare const ERROR_CODES: {
	/** Invalid dice notation syntax */
	readonly INVALID_NOTATION: "INVALID_NOTATION";
	/** Error applying a modifier */
	readonly MODIFIER_ERROR: "MODIFIER_ERROR";
	/** Input validation failed */
	readonly VALIDATION_ERROR: "VALIDATION_ERROR";
	/** General roll execution error */
	readonly ROLL_ERROR: "ROLL_ERROR";
};
/**
* Closed literal union of every RANDSUM error code.
*
* The union is exhaustive: it contains only the codes declared in
* {@link ERROR_CODES}, so consumers can `switch` over an `ErrorCode` and have
* TypeScript verify every case is handled.
*/
type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
/**
* Optional structured context for a RANDSUM error.
*
* Populated by throw sites that know additional details about the failure.
* Consumers may read any of these fields to present richer diagnostics
* (e.g. highlight the offending character in an input, show which option
* field failed validation, log the raw value that triggered the error).
*
* All fields are optional — throw sites only include what they know.
*/
interface ErrorContext {
	/** Dotted path to the offending option field, e.g. `'quantity'`, `'modifiers.drop.lowest'`. */
	readonly path?: string;
	/** The offending value (kept as `unknown` so callers type-narrow before use). */
	readonly value?: unknown;
	/** The notation string associated with the failure, when relevant. */
	readonly notation?: string;
	/** Zero-indexed character offset in the notation string, when known. */
	readonly position?: number;
}
/**
* Base error class for all RANDSUM errors.
* All custom errors in the RANDSUM ecosystem should extend this class.
*
* The class is generic over its `code` type. The roller's own errors use the
* closed {@link ErrorCode} union (so consumers can switch exhaustively), while
* downstream packages that extend `RandsumError` may specialize `Code` with
* their own literal union (e.g. `@randsum/games`'s `SchemaError`). `Code`
* defaults to `string` so a bare `extends RandsumError` can still carry an
* arbitrary code — the honest base type, since a caught `RandsumError` may be
* any subclass.
*/
declare class RandsumError<Code extends string = string> extends Error {
	readonly code: Code;
	readonly context: ErrorContext | undefined;
	constructor(message: string, code: Code, context?: ErrorContext);
}
/**
* Error thrown when a string is not valid dice notation.
*/
declare class NotationParseError extends RandsumError<ErrorCode> {
	readonly suggestion: string | undefined;
	constructor(notation: string, reason: string, suggestion?: string, context?: ErrorContext);
}
declare class ModifierError extends RandsumError<ErrorCode> {
	constructor(modifierType: string, reason: string, context?: ErrorContext);
}
declare class ValidationError extends RandsumError<ErrorCode> {
	constructor(message: string, context?: ErrorContext);
}
declare class RollError extends RandsumError<ErrorCode> {
	constructor(message: string, context?: ErrorContext);
}
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
* The die-type of a parsed pool. `standard` covers ordinary NdS (and percentile,
* which is d100); the remaining kinds are the special dice whose face semantics
* must survive parsing.
*/
type ParsedDieType = "standard" | "percentile" | "fate" | "custom" | "draw" | "geometric" | "zeroBias";
/**
* The result of parsing a dice notation string.
* Similar to RollOptions but with sides always numeric and
* quantity/arithmetic always present.
*/
interface ParsedNotationOptions {
	/** Number of dice to roll */
	quantity: number;
	/** How this roll combines with others */
	arithmetic: "add" | "subtract";
	/** Number of sides on each die */
	sides: number;
	/** Modifiers to apply to the roll */
	modifiers?: ModifierOptions;
	/** Annotation label (e.g., [fire]) */
	label?: string;
	/**
	* The die-type of this pool. Present for special dice (fate, custom faces,
	* draw, geometric, zero-bias, percentile) so their semantics are not lost when
	* a notation string is parsed to options; absent (or 'standard') for plain NdS.
	*/
	dieType?: ParsedDieType;
	/** Fate/Fudge variant: 1 (dF, -1..+1) or 2 (dF.2, -2..+2). Only for `dieType: 'fate'`. */
	fateVariant?: 1 | 2;
	/** Raw custom face values (e.g. from `d{fire,ice}`). Only for `dieType: 'custom'`. */
	customFaces?: readonly string[];
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
* Successful validation result.
*/
interface ValidValidationResult {
	/** Indicates successful validation */
	valid: true;
	/** Original input as DiceNotation */
	argument: DiceNotation;
	/** Human-readable descriptions for each roll */
	description: string[][];
	/** Parsed roll options for each roll */
	options: ParsedNotationOptions[];
	/** Notation strings for each roll */
	notation: DiceNotation[];
	/** No error on success */
	error: null;
}
/**
* Error information from validation.
*/
interface ValidationErrorInfo {
	/** Description of what's wrong */
	message: string;
	/** The input that failed validation */
	argument: string;
	/**
	* Zero-based character offset where parsing failed (the position of the first
	* unexpected/invalid token). Populated by the single-pass parser.
	*/
	position?: number;
	/**
	* Which check failed: `INVALID_NOTATION` when the string is not notation (or
	* breaks a repeat limit), otherwise the code of the error `roll()` would throw
	* for it, such as `MODIFIER_ERROR` for `2d6L3`.
	*/
	code?: ErrorCode;
}
/**
* Failed validation result.
*/
interface InvalidValidationResult {
	/** Indicates failed validation */
	valid: false;
	/** Original input string */
	argument: string;
	/** Error information */
	error: ValidationErrorInfo;
}
/**
* Result of notation validation.
*/
type ValidationResult = ValidValidationResult | InvalidValidationResult;
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
* Geometric die notation: roll dN again while it shows N, summing every roll.
* `g6` rolls a d6, and again on each 6; the result is the sum of the rolls.
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
* Type for custom random number generators.
* Must return a number in the range [0, 1).
*/
type RandomFn = () => number;
/**
* Configuration options for roll execution.
*/
interface RollConfig {
	/**
	* Custom random function (default: Math.random). Every call must return a
	* number in [0, 1), as Math.random does. The roller does not check: a value
	* outside that range yields faces the die does not have (a d6 showing 31).
	*/
	randomFn?: RandomFn;
}
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
	/** Geometric die: each die rolls again while it shows its maximum, summing every roll */
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
* Result from the roll() function.
*
* Contains all roll records, individual results, and the combined total.
*
* @template T - Type for custom dice faces
*
* @example
* ```ts
* const result = roll("4d6L")
* result.total   // => Sum of kept dice
* result.values  // => Array of individual die values
* result.rolls   // => Full roll records with history
* ```
*/
interface RollerRollResult<T = string> {
	/** Individual roll records */
	rolls: RollRecord<T>[];
	/**
	* Aggregate values — a flat array of individual die results.
	*
	* Numeric pools contribute their actual numbers (`number`); custom-faced
	* pools (`sides: T[]`) contribute their actual face values (`T`).
	*/
	values: (number | T)[];
	/** Combined total of all rolls */
	total: number;
}
/**
* Rolls dice according to RANDSUM notation.
*
* Accepts multiple roll arguments and an optional configuration object. Each argument
* can be a dice notation string, a number (sides), or a roll options object.
*
* Throws on invalid input (bad notation, nonsensical options).
*
* @typeParam T - Type for custom dice faces. Defaults to `string`.
*   - For standard numeric dice (notation strings or numbers), `values` contains
*     the actual numeric roll values (e.g., `[5, 3, 6]`).
*   - For custom faces (options with `sides: T[]`), `values` contains the actual
*     face values of type T.
*
* @param args - One or more roll arguments (notation strings, numbers, or options objects),
*               optionally followed by a RollConfig object
* @returns Roll result containing individual rolls, total, values array, and error (if any)
*
* @example Number (1 die, sides = number)
* ```ts
* const result = roll(20) // 1d20
* ```
*
* @example Notation string
* ```ts
* const result = roll("2d6")
* result.total // => Sum of 2d6
* result.values // => [3, 5] - numeric roll values
* ```
*
* @example Options object
* ```ts
* const result = roll({ sides: 6, quantity: 4, modifiers: { drop: { lowest: 1 } } }) // same as 4d6L
* ```
*
* @example Percentile die (d%)
* ```ts
* const result = roll('d%')  // equivalent to roll('1d100')
* result.total // => 1-100
* ```
*
* @example Fate/Fudge dice (dF)
* ```ts
* const result = roll('4dF')   // 4 standard Fate dice (faces: -1, 0, 1)
* const wide = roll('4dF.2')   // 4 wide Fate dice (faces: -2, -1, 0, 1, 2)
* result.total // => -4 to +4
* ```
*
* @example Custom faces
* ```ts
* const result = roll({ sides: ['+', '+', ' ', ' ', '-', '-'], quantity: 4 })
* result.values // => ["+", "-", " ", "+"] - actual face values
* ```
*
* @example With custom RNG
* ```ts
* const seeded = createSeededRandom(42)
* const result = roll("1d20", { randomFn: seeded })
* ```
*
* ## Config object must be last
*
* The optional `RollConfig` must be the **last** argument. If placed earlier,
* it is treated as a roll argument and will fail validation.
*
* ```ts
* roll('1d20', { randomFn: seeded })     // ✅ config is last
* roll({ randomFn: seeded }, '1d20')     // ❌ config treated as roll arg → error
* ```
*
* @example Multiple rolls
* ```ts
* const result = roll("1d20+5", "2d6+3")
* // Returns combined total of both rolls
* ```
*
* @example Error handling
* ```ts
* try {
*   const result = roll("invalid notation")
* } catch (e) {
*   e.message // => "Invalid dice notation: ..."
* }
* ```
*/
declare function roll<T = string>(...args: RollArgument<T>[]): RollerRollResult<T>;
declare function roll<T = string>(...args: [...RollArgument<T>[], RollConfig]): RollerRollResult<T>;
/**
* Type guard that checks if a value is valid dice notation.
*
* Acceptance is decided by the single cursor parser (`parseNotation`): the string
* must lex cleanly and satisfy the grammar (begins with a pool, no unknown tokens,
* positive-integer magnitudes, at most one Count-family modifier). This is the
* same pass that drives tokenize, validateNotation, notationToOptions and roll —
* there is no separate strip-and-check regex system anymore.
*
* @param argument - Value to check
* @returns True if argument is valid dice notation, false otherwise
*
* @example
* ```ts
* if (isDiceNotation("4d6L")) {
*   // TypeScript knows this is DiceNotation here
* }
* ```
*/
declare function isDiceNotation(argument: unknown): argument is DiceNotation;
/**
* Validates a string as DiceNotation, throwing if invalid.
*
* @param input - String to validate
* @returns The input narrowed to DiceNotation
* @throws NotationParseError if input is not valid dice notation
*/
declare function notation(input: string): DiceNotation;
/**
* Validates dice notation and returns parsed information.
*
* Both validity and error position come from the single cursor parser, so an
* invalid result reports the real character offset where parsing failed
* (`error.position`) instead of a generic message.
*
* @param notation - String to validate as dice notation
* @returns ValidationResult with valid flag and error (if invalid)
*/
declare function validateNotation(notation: string): ValidationResult;
declare function validateInteger(value: number, name: string): asserts value is number;
declare function validateRange(value: number, min: number, max: number, name: string): void;
declare function validateNonNegative(value: number, name: string): void;
declare function validateFinite(value: number, name: string): void;
interface Token {
	readonly text: string;
	readonly key: string;
	readonly category: TokenCategory;
	readonly start: number;
	readonly end: number;
	readonly description: string;
}
/**
* Tokenize a notation string into positioned tokens.
*
* This is a direct view over the single cursor lexer (`scan`): the lexer produces
* the positioned token stream, and this function only attaches human-readable
* descriptions. There is no separate pattern table here anymore.
*/
declare function tokenize(notation: string): readonly Token[];
/** The RDN faceted category of a modifier lexeme. */
type ModifierCategory = "Core" | "Special" | "Order" | "Clamp" | "Map" | "Filter" | "Substitute" | "Generate" | "Accumulate" | "Scale" | "Reinterpret" | "Dispatch";
type TokenCategory = ModifierCategory | "unknown";
/**
* Parse a notation string into one options object per pool. Throws
* `NotationParseError` on invalid notation; check with `isDiceNotation` first
* to branch instead.
*/
declare function notationToOptions(notationString: string): ParsedNotationOptions[];
/**
* Converts roll options to RANDSUM dice notation string.
*
* @template T - Type for custom dice faces
* @param options - Roll options to convert
* @returns Dice notation string (e.g., "4d6L", "2d20H+5")
* @throws NotationParseError if generated notation is invalid
*/
declare function optionsToNotation<T = string>(options: RollOptions<T>): DiceNotation;
/**
* The special-die discriminants a parsed pool may carry. Present only when the
* options came from `notationToOptions` for a special die; absent for plain
* `RollOptions`. Read so that `validateNotation` describes a special die with its
* own semantics (e.g. `4dF` -> "Roll 4dF") instead of a generic sides count —
* matching the description `roll()` emits for the same notation, so the two public
* surfaces stay unified.
*/
type SpecialDiscriminants = Partial<Pick<ParsedNotationOptions, "dieType" | "fateVariant" | "customFaces">>;
/**
* Converts roll options to a human-readable description.
*
* @template T - Type for custom dice faces
* @param options - Roll options to describe
* @returns Array of description strings
*/
declare function optionsToDescription<T = string>(options: RollOptions<T> & SpecialDiscriminants): string[];
/**
* Convert modifier options to a notation string suffix.
* Uses schema-only iteration (no behavior code imported).
*/
declare function modifiersToNotation(modifiers: ModifierOptions | undefined): string;
/**
* Convert modifier options to an array of human-readable description strings.
* Uses schema-only iteration (no behavior code imported).
*/
declare function modifiersToDescription(modifiers: ModifierOptions | undefined): string[];
/**
* Detects common typos in dice notation.
*
* @param notation - Invalid notation to check
* @returns Suggested correction, or undefined if no suggestion
*/
declare function suggestNotationFix(notation: string): string | undefined;
export { ComparisonOptions, CountOptions, CustomFacesNotation, DiceNotation, DrawDieNotation, DropOptions, ERROR_CODES, ErrorCode, ErrorContext, FateDieNotation, GeometricDieNotation, KeepOptions, ModifierCategory, ModifierError, ModifierOptions, NotationParseError, PercentileDie, RandomFn, RandsumError, ReplaceOptions, RerollOptions, RollArgument, RollConfig, RollError, RollOptions, RollRecord, RollerRollResult, Token, TokenCategory, UniqueOptions, ValidationError, ValidationErrorInfo, ValidationResult, ZeroBiasNotation, isDiceNotation, modifiersToDescription, modifiersToNotation, notation, notationToOptions, optionsToDescription, optionsToNotation, roll, suggestNotationFix, tokenize, validateFinite, validateInteger, validateNonNegative, validateNotation, validateRange };
