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
export { ERROR_CODES, ErrorCode, ErrorContext, ModifierError, NotationParseError, RandsumError, RollError, ValidationError };
