"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Media } from "./Media";
import type { Lang } from "@/lib/i18n";

type Props = { lang: Lang; video: string | null; poster: string | null; subject: string };

/**
 * Tam ekran açılış. Video varsa sessiz, yavaş döngü olarak oynar (ses hiçbir zaman açılmaz);
 * hareket azaltma açıkken yalnızca poster görünür. Video yokken koyu yer tutucu.
 */
export function HeroMedia({ lang, video, poster, subject }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [videoOk, setVideoOk] = useState(true);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const dim = useTransform(scrollYProgress, [0, 1], [0, 0.6]);

  useEffect(() => {
    if (reduce) setVideoOk(false);
  }, [reduce]);

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden">
      <motion.div className="absolute inset-0 scale-[1.06]" style={reduce ? undefined : { y }}>
        {video && videoOk ? (
          <video
            className="absolute inset-0 h-full w-full object-cover"
            src={video}
            poster={poster ?? undefined}
            muted
            loop
            playsInline
            autoPlay
            preload="metadata"
            aria-hidden="true"
            tabIndex={-1}
            onError={() => setVideoOk(false)}
          />
        ) : (
          <Media
            lang={lang}
            shot="video"
            subject={subject}
            src={poster ?? undefined}
            colors={["#6e3a24", "#3a2c22"]}
            className="absolute inset-0"
            zoom={false}
            cursor={false}
            priority
            labelPosition="top-right"
          />
        )}
      </motion.div>
      <motion.div className="absolute inset-0 bg-gece" style={{ opacity: reduce ? 0 : dim }} aria-hidden="true" />
    </div>
  );
}
