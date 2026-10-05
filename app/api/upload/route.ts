import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
export async function POST(req:Request){
 const s=await createClient(); const {data:{user}}=await s.auth.getUser();
 if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});
 const form=await req.formData(),file=form.get("file");
 if(!(file instanceof File))return NextResponse.json({error:"Missing file"},{status:400});
 const ext=file.name.split(".").pop()||"jpg",path=`${user.id}/${crypto.randomUUID()}.${ext}`;
 const {error}=await s.storage.from("product-images").upload(path,file,{upsert:false});
 if(error)return NextResponse.json({error:error.message},{status:400});
 const {data}=s.storage.from("product-images").getPublicUrl(path);
 return NextResponse.json({url:data.publicUrl,path});
}
