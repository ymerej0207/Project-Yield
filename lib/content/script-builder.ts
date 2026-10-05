export type Platform="TikTok"|"Amazon"|"Instagram Reel"|"YouTube Short";
export type Duration=30|60|90|120;
export function googleProductSearchUrl(title:string){return`https://www.google.com/search?tbm=shop&q=${encodeURIComponent(title)}`}
export function buildScript(x:{productName:string;brand?:string;description?:string;details?:string[];platform:Platform;seconds:Duration;creatorVoice?:string;speakingWpm?:number}){
 const wpm=Math.max(80,Math.min(240,x.speakingWpm||145)),target=Math.round(wpm*x.seconds/60),name=[x.brand,x.productName].filter(Boolean).join(" ");
 const hooks=[`Okay, here's what you actually need to know about ${name}.`,`I've got ${name} in front of me, so let's get into what matters.`,`If you've been looking at ${name}, here's the quick breakdown.`];
 const facts=[x.description,...(x.details||[])].filter(Boolean) as string[];
 const trans=["What stood out first is","The useful part is","Another thing worth knowing is","In actual use"];
 let script=`${hooks[(name.length+x.seconds)%hooks.length]} ${facts.slice(0,Math.max(2,Math.ceil(x.seconds/30)+1)).map((f,i)=>`${trans[i%trans.length]} ${f.replace(/[.]+$/,"")}.`).join(" ")} ${x.platform==="Amazon"?"Those are the details I'd want before deciding if it fits what I need.":"That's the quick version, and the saved product link is there if you want the full details."}`;
 const words=script.trim().split(/\s+/);if(words.length>target+20)script=words.slice(0,target).join(" ")+".";
 return{script,targetWords:target,estimatedSeconds:Math.round(script.split(/\s+/).length/wpm*60)}
}