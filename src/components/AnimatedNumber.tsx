import { useEffect } from "react";
import { animate, useMotionValue, useTransform, motion } from "framer-motion";

interface Props {
  value: number;
  prefix?: string;
  suffix?: string;
}

export function AnimatedNumber({ value, prefix = "", suffix = "" }: Props) {
  const mv = useMotionValue(value);
  const text = useTransform(mv, (v) => `${prefix}${Math.round(v)}${suffix}`);
  useEffect(() => {
    const controls = animate(mv, value, { duration: 0.8, ease: "easeOut" });
    return controls.stop;
  }, [value, mv]);
  return <motion.span>{text}</motion.span>;
}
