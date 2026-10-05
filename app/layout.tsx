import type { Metadata, Viewport } from "next";
import "./globals.css";
export const metadata:Metadata={title:"Project Yield",description:"Creator operations built around what makes money.",manifest:"/manifest.webmanifest",appleWebApp:{capable:true,title:"Project Yield",statusBarStyle:"black-translucent"}};
export const viewport:Viewport={themeColor:"#090909",width:"device-width",initialScale:1,viewportFit:"cover"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}