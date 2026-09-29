export async function ensureLinearBFont(): Promise<void> {
 const loaded = await document.fonts.load('96px "LinearB"', "𐀀𐀒𐀴");
 if (!loaded.length) throw new Error("Linear B font did not load");
 await document.fonts.ready;
}
