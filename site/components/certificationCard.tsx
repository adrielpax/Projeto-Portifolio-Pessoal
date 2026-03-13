import React from "react";
import Image from "next/image";
import { Button } from "./ui/button";
import { BadgeCheck } from "lucide-react";

export default function CertificationCards() {
  return (
    <div
      className="w-full border border-zinc-300 transition duration-300
        bg-gradient-to-tr from-white/10 via-black/10 to-white/10 rounded-2xl "
    >
      {[
        {
          icon: "/images/formacao/vercel.png",
          title: "Certificado pela propria Vercel em NEXT JS App Router Fundamentals",
          description:
            "Curso official da Vercel Learn em vercel.com que ensina todos os fundamentos de desenvolvimento experiente com NextJS em Streaming loading, fetch de dados, client e server components, e mais estruturação com React",
        },
        {
          icon: "/images/formacao/vercel.png",
          title: "Certificado pela propria Vercel em React Fundamentals",
          description:
            "Curso official da Vercel Learn em vercel.com que ensina todos os fundamentos React JS framework do facebook",
        },
      ].map((card, index) => (
        <div
          key={index}
          className="flex flex-col md:flex-row gap-4 items-center
            p-4 group hover:bg-white/5 transition duration-300 border-b 
            border-zinc-300 last:border-b-0 group-hover:border-${card.color}"
        >
          <Image
            src={card.icon}
            alt={card.title}
            objectFit="cover"
            width={104}
            height={104}
            className={`text-8xl rounded-full text-xs border-3
                border-white p-4 flex items-center justify-center bg-white/5
                group-hover:scale-105 transition-transform duration-300 shadow-lg shadow`}
          />

          <div className="flex flex-col">
            <h3 className="text-zinc-600 font-bold text-lg mb-2">
              {card.title}
            </h3>
            <p
              className="text-gray-500 text-sm leading-relaxed
                    text-left "
            >
              {card.description}
            </p>
          <Button className="max-w-56 my-4 rounded-full 
          bg-gradient-to-tr from-amber-500 to-amber-700 ring-1
          shadow-lg shadow-amber-500"><BadgeCheck/> Certificado </Button>
          </div>

        </div>
      ))}
    </div>
  );
}
