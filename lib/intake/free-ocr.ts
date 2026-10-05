export type ExpectedProduct={id:string;name:string;brand?:string|null;barcode?:string|null};
const toks=(s:string)=>new Set(s.toLowerCase().replace(/[^a-z0-9\s]/g," ").split(/\s+/).filter(x=>x.length>2));
export function matchExpectedProducts(text:string,products:ExpectedProduct[]){
 const got=toks(text);return products.map(product=>{const want=toks(`${product.brand||""} ${product.name}`);const overlap=[...want].filter(x=>got.has(x)).length;return{product,score:want.size?overlap/want.size:0}}).sort((a,b)=>b.score-a.score)
}
export async function detectBarcode(file:File){
 const Ctor=(globalThis as any).BarcodeDetector;if(!Ctor)return "";
 const detector=new Ctor({formats:["ean_13","ean_8","upc_a","upc_e","code_128"]});
 const bitmap=await createImageBitmap(file);try{const hits=await detector.detect(bitmap);return hits?.[0]?.rawValue||""}finally{bitmap.close()}
}
/* Text OCR is intentionally provider-free. This module exposes matching now and
   uses native browser barcode detection when available. A local WASM OCR engine
   can be added later without changing the product matching contract. */
