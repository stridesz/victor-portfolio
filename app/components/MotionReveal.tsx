"use client";
import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
export function MotionReveal({ children, className, delay=0 }: { children:ReactNode; className?:string; delay?:number }) { const reduce=useReducedMotion(); return <motion.div className={["motion-reveal",className].filter(Boolean).join(" ")} initial={reduce?false:{opacity:0,y:20}} whileInView={reduce?undefined:{opacity:1,y:0}} viewport={{once:true,amount:.18}} transition={{duration:.55,delay,ease:[.16,1,.3,1]}}>{children}</motion.div>; }
