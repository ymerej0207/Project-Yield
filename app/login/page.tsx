"use client";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Sparkles } from "lucide-react";

export default function LoginPage() {
  const [mode,setMode]=useState<"login"|"signup">("login");
  const [email,setEmail]=useState(""),[password,setPassword]=useState(""),[message,setMessage]=useState("");
  async function submit(e:FormEvent){
    e.preventDefault(); setMessage("");
    const supabase=createClient();
    if(!supabase){setMessage("Add your Supabase environment variables first.");return}
    const result=mode==="login"
      ? await supabase.auth.signInWithPassword({email,password})
      : await supabase.auth.signUp({email,password});
    if(result.error){setMessage(result.error.message);return}
    if(mode==="signup"&&!result.data.session){setMessage("Check your email to confirm your account.");return}
    location.href="/";
  }
  return <main className="auth-shell">
    <section className="auth-card">
      <div className="brand auth-brand"><div className="brandmark">PY</div><div><strong>PROJECT YIELD</strong><span>CREATOR OS</span></div></div>
      <div className="auth-kicker"><Sparkles/> CREATOR OPERATIONS</div>
      <h1>{mode==="login"?"Welcome back.":"Build your yield."}</h1>
      <p>Products, content, deadlines and money in one place.</p>
      <form onSubmit={submit}>
        <label>Email<input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></label>
        <label>Password<input type="password" required minLength={6} value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••"/></label>
        {message&&<div className="auth-message">{message}</div>}
        <button className="primary full">{mode==="login"?"Sign in":"Create account"}</button>
      </form>
      <button className="auth-switch" onClick={()=>setMode(mode==="login"?"signup":"login")}>
        {mode==="login"?"New to Project Yield? Create an account":"Already have an account? Sign in"}
      </button>
    </section>
  </main>
}
