import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(){
  const s=await createClient();
  const {data:{user}}=await s.auth.getUser();
  if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});
  const {data,error}=await s.from("products").select("*,content_requirements(*)").eq("archived",false).order("received_at",{ascending:false});
  return NextResponse.json(error?{error:error.message}:{products:data},{status:error?400:200});
}
export async function POST(req:Request){
  const s=await createClient(); const {data:{user}}=await s.auth.getUser();
  if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});
  const b=await req.json();
  const {data:p,error}=await s.from("products").insert({
    user_id:user.id,name:b.name,source:b.source,due_at:b.due_at||null,status:"Received",
    product_value:Number(b.product_value)||0,compensation:Number(b.compensation)||0,
    affiliate_earnings:Number(b.affiliate_earnings)||0,image_url:b.image_url||null,notes:b.notes||null
  }).select().single();
  if(error)return NextResponse.json({error:error.message},{status:400});
  if(Array.isArray(b.requirements)&&b.requirements.length)
    await s.from("content_requirements").insert(b.requirements.map((platform:string)=>({product_id:p.id,platform,status:"needed"})));
  await s.from("product_events").insert({product_id:p.id,event_type:"received"});
  return NextResponse.json({product:p});
}
