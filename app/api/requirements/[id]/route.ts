import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
export async function PATCH(req:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params,s=await createClient(); const {data:{user}}=await s.auth.getUser();
 if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});
 const {complete}=await req.json();
 const {data,error}=await s.from("content_requirements").update({status:complete?"complete":"needed",posted_at:complete?new Date().toISOString():null})
 .eq("id",id).select("*,products!inner(user_id)").eq("products.user_id",user.id).single();
 return NextResponse.json(error?{error:error.message}:{requirement:data},{status:error?400:200});
}
