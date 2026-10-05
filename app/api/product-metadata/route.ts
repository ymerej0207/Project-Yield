import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const text=(v:unknown)=>typeof v==="string"?v.trim():"";
const absolute=(value:string,base:string)=>{try{return value?new URL(value,base).toString():""}catch{return value}};
const num=(v:any)=>{if(v==null)return null;const n=Number(String(v).replace(/[^0-9.]/g,""));return Number.isFinite(n)&&n>0&&n<1000000?n:null};
function meta(html:string,key:string){const tags=html.match(/<meta\s+[^>]*>/gi)||[];for(const tag of tags){const prop=tag.match(/(?:property|name|itemprop)=["']([^"']+)["']/i)?.[1]?.toLowerCase();if(prop===key.toLowerCase())return tag.match(/content=["']([^"']*)["']/i)?.[1]||""}return ""}
function jsonLd(html:string){const blocks=[...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];const walk=(x:any):any=>{if(!x)return null;if(Array.isArray(x)){for(const y of x){const r=walk(y);if(r)return r}return null}if(typeof x==="object"){if(String(x["@type"]||"").toLowerCase()==="product")return x;if(x["@graph"]){const r=walk(x["@graph"]);if(r)return r}for(const y of Object.values(x)){const r=walk(y);if(r)return r}}return null};for(const b of blocks){try{const r=walk(JSON.parse(b[1]));if(r)return r}catch{}}return null}
function allMatches(html:string,re:RegExp){const out:number[]=[];for(const m of html.matchAll(re)){const n=num(m[1]);if(n!=null)out.push(n)}return out}
function deepPrices(html:string,offer:any){
 const candidates:{value:number;kind:"current"|"listed";source:string;score:number}[]=[];
 const add=(v:any,kind:"current"|"listed",source:string,score:number)=>{const n=num(v);if(n!=null)candidates.push({value:n,kind,source,score})};
 add(offer?.price,"current","JSON-LD offer.price",100);add(offer?.lowPrice,"current","JSON-LD offer.lowPrice",98);add(offer?.highPrice,"current","JSON-LD offer.highPrice",95);
 add(meta(html,"product:price:amount"),"current","product:price meta",94);add(meta(html,"og:price:amount"),"current","Open Graph price",93);
 const patterns:[RegExp,"current"|"listed",string,number][]=[
  [/["'](?:sale_price|salePrice|discount_price|discountPrice|current_price|currentPrice|final_price|finalPrice|sku_price|skuPrice|price)["']\s*:\s*["']?\$?([0-9]+(?:\.[0-9]{1,2})?)/gi,"current","embedded product state",88],
  [/["'](?:formatted_price|formattedPrice|price_text|priceText)["']\s*:\s*["'][^0-9$]*\$?([0-9]+(?:\.[0-9]{1,2})?)/gi,"current","formatted embedded price",86],
  [/["'](?:original_price|originalPrice|list_price|listPrice|market_price|marketPrice|retail_price|retailPrice|compare_at_price|compareAtPrice|msrp)["']\s*:\s*["']?\$?([0-9]+(?:\.[0-9]{1,2})?)/gi,"listed","embedded list/MSRP state",90]
 ];
 for(const [re,kind,source,score] of patterns)for(const v of allMatches(html,re))add(v,kind,source,score);
 // Last-resort visible-price patterns. Keep score low because promo/shipping numbers may exist.
 for(const v of allMatches(html,/(?:sale price|current price|now|our price)[^$]{0,50}\$([0-9]+(?:\.[0-9]{1,2})?)/gi))add(v,"current","visible price text",55);
 for(const v of allMatches(html,/(?:list price|regular price|was|msrp)[^$]{0,50}\$([0-9]+(?:\.[0-9]{1,2})?)/gi))add(v,"listed","visible list price text",58);
 const dedupe=(kind:"current"|"listed")=>candidates.filter(x=>x.kind===kind).sort((a,b)=>b.score-a.score);
 const current=dedupe("current")[0]||null,listed=dedupe("listed")[0]||null;
 // If only one trustworthy price exists, it is both the known listed/current reference.
 return {currentPrice:current?.value??listed?.value??null,listedPrice:listed?.value??current?.value??null,priceSource:current?.source||listed?.source||null,debug:candidates.slice(0,12)};
}
export async function POST(req:Request){
 const s=await createClient();const {data:{user}}=await s.auth.getUser();if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});
 const {url}=await req.json();let u:URL;try{u=new URL(url)}catch{return NextResponse.json({error:"Enter a valid product URL."},{status:400})}if(!["http:","https:"].includes(u.protocol))return NextResponse.json({error:"Only public http/https product links are supported."},{status:400});
 try{const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),10000);const r=await fetch(u.toString(),{redirect:"follow",signal:controller.signal,headers:{"user-agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/154.0.0.0 Safari/537.36",accept:"text/html,application/xhtml+xml"},cache:"no-store"});clearTimeout(timer);if(!r.ok)throw new Error(`Site returned ${r.status}`);const html=(await r.text()).slice(0,5000000);const p=jsonLd(html);const offer=Array.isArray(p?.offers)?p.offers[0]:p?.offers;const img=Array.isArray(p?.image)?p.image[0]:p?.image;const brand=typeof p?.brand==="object"?p.brand?.name:p?.brand;const title=text(p?.name)||meta(html,"og:title")||text(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]);const description=text(p?.description)||meta(html,"og:description")||meta(html,"description");const image=absolute(text(img)||meta(html,"og:image"),r.url||u.toString());const prices=deepPrices(html,offer);const canonical=absolute(text(html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1]),r.url||u.toString())||r.url||u.toString();if(!title&&!description&&!image)return NextResponse.json({ok:false,blocked:true,message:"This site did not expose usable public product metadata. You can still enter the product manually."});return NextResponse.json({ok:true,product:{title,description,image,brand:text(brand),model:text(p?.model)||text(p?.mpn),category:text(p?.category),price:prices.currentPrice,currentPrice:prices.currentPrice,listedPrice:prices.listedPrice,priceSource:prices.priceSource,canonical}})}catch(e:any){return NextResponse.json({ok:false,blocked:true,message:"That site blocked or did not expose product metadata. Manual entry still works.",detail:e?.message||"Fetch failed"})}
}
