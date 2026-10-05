import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
export async function PATCH(req:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params,s=await createClient(); const {data:{user}}=await s.auth.getUser();
 if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});
 const b=await req.json(), allowed=["name","source","due_at","status","product_value","compensation","affiliate_earnings","notes","image_url","archived","lifecycle_state","expected_at","received_at","source_url","reference_url","product_description","brand","model","category","barcode","content_workspace"];
 const update=Object.fromEntries(Object.entries(b).filter(([k])=>allowed.includes(k)));
 update.updated_at=new Date().toISOString();
 const {data,error}=await s.from("products").update(update).eq("id",id).eq("user_id",user.id).select().single();
 return NextResponse.json(error?{error:error.message}:{product:data},{status:error?400:200});
}
export async function DELETE(_:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params,s=await createClient(); const {data:{user}}=await s.auth.getUser();
 if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});
 const {error}=await s.from("products").delete().eq("id",id).eq("user_id",user.id);
 return NextResponse.json(error?{error:error.message}:{ok:true},{status:error?400:200});
}
