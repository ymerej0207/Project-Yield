import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const text=(v:unknown)=>typeof v==="string"?v.trim():"";
const absolute=(value:string,base:string)=>{try{return value?new URL(value,base).toString():""}catch{return value}};
function meta(html:string,key:string){
 const tags=html.match(/<meta\s+[^>]*>/gi)||[];
 for(const tag of tags){
  const prop=tag.match(/(?:property|name)=["']([^"']+)["']/i)?.[1]?.toLowerCase();
  if(prop===key.toLowerCase()) return tag.match(/content=["']([^"']*)["']/i)?.[1]||"";
 }
 return "";
}
function jsonLd(html:string){
 const blocks=[...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
 const walk=(x:any):any=>{if(!x)return null;if(Array.isArray(x)){for(const y of x){const r=walk(y);if(r)return r}return null}if(typeof x==="object"){if(String(x["@type"]||"").toLowerCase()==="product")return x;if(x["@graph"]){const r=walk(x["@graph"]);if(r)return r}for(const y of Object.values(x)){const r=walk(y);if(r)return r}}return null};
 for(const b of blocks){try{const r=walk(JSON.parse(b[1]));if(r)return r}catch{}}
 return null;
}
export async function POST(req:Request){
 const s=await createClient();const {data:{user}}=await s.auth.getUser();if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});
 const {url}=await req.json();let u:URL;try{u=new URL(url)}catch{return NextResponse.json({error:"Enter a valid product URL."},{status:400})}
 if(!["http:","https:"].includes(u.protocol))return NextResponse.json({error:"Only public http/https product links are supported."},{status:400});
 try{
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),8000);
  const r=await fetch(u.toString(),{redirect:"follow",signal:controller.signal,headers:{"user-agent":"Mozilla/5.0 (compatible; ProjectYield/1.4; +product-metadata)",accept:"text/html,application/xhtml+xml"},cache:"no-store"});clearTimeout(timer);
  if(!r.ok)throw new Error(`Site returned ${r.status}`);const html=(await r.text()).slice(0,2500000);const p=jsonLd(html);
  const offer=Array.isArray(p?.offers)?p.offers[0]:p?.offers;const img=Array.isArray(p?.image)?p.image[0]:p?.image;const brand=typeof p?.brand==="object"?p.brand?.name:p?.brand;
  const title=text(p?.name)||meta(html,"og:title")||text(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]);
  const description=text(p?.description)||meta(html,"og:description")||meta(html,"description");
  const image=absolute(text(img)||meta(html,"og:image"),r.url||u.toString());
  const price=Number(offer?.price||offer?.lowPrice||meta(html,"product:price:amount"))||null;
  const canonical=absolute(text(html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1]),r.url||u.toString())||r.url||u.toString();
  if(!title&&!description&&!image)return NextResponse.json({ok:false,blocked:true,message:"This site did not expose usable public product metadata. You can still enter the product manually."});
  return NextResponse.json({ok:true,product:{title,description,image,brand:text(brand),model:text(p?.model)||text(p?.mpn),category:text(p?.category),price,canonical}});
 }catch(e:any){return NextResponse.json({ok:false,blocked:true,message:"That site blocked or did not expose product metadata. Manual entry still works.",detail:e?.message||"Fetch failed"})}
}
