/** The RDN faceted category of a modifier token. */
type ModifierCategory = "Core" | "Special" | "Order" | "Clamp" | "Map" | "Filter" | "Substitute" | "Generate" | "Accumulate" | "Scale" | "Reinterpret" | "Dispatch";
type TokenCategory = ModifierCategory | "unknown";
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
export { Token, TokenCategory, tokenize };
