import React from "react";
import Image from "next/image";
// import  { SiN8N }  from "react-icons/si";
// import { RiNextjsLine } from "react-icons/ri";

// const CardContentProps = [
//   {
//     icon: "/images/formacao/descomplica.png",
//     title: "Engenharia de Software - Universidade Descomplica.com",
//     description:
//       "Curso focado em desenvolvimento de software, abordando desde fundamentos de programação até práticas avançadas de engenharia.",
//   },
//   {
//     icon: "/images/formacao/anhanguera.png",
//     title: "Análise e Desenvolvimento de Sistemas - Anhanguera Educacional",
//     description:
//       "Formação abrangente em análise e desenvolvimento de sistemas, preparando para atuar em diversas áreas da tecnologia da informação.",
//   },
//   {
//     icon: "/images/formacao/senai.png",
//     title: "Técnico em Automação Insdustrial - SENAI",
//     description:
//       "Curso técnico voltado para a automação de processos industriais, com ênfase em sistemas de controle e instrumentação.",
//   },
// ];

export default function TrainingCard() {
  return (
    <div
      className="w-full border border-zinc-300 transition duration-300
        bg-gradient-to-tr from-white/10 via-black/10 to-white/10 rounded-2xl "
    >
      {[
        {
          icon: "/images/formacao/descomplica.png",
          title: "Engenharia de Software - Universidade Descomplica.com",
          description:
            "Curso focado em desenvolvimento de software, abordando desde fundamentos de programação até práticas avançadas de engenharia.",
        },
        {
          icon: "/images/formacao/anhanguera.png",
          title:
            "Análise e Desenvolvimento de Sistemas - Anhanguera Educacional",
          description:
            "Formação abrangente em análise e desenvolvimento de sistemas, preparando para atuar em diversas áreas da tecnologia da informação.",
        },
        {
          icon: "/images/formacao/senai.png",
          title: "Técnico em Automação Insdustrial - SENAI",
          description:
            "Curso técnico voltado para a automação de processos industriais, com ênfase em sistemas de controle e instrumentação.",
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
          </div>
        </div>
      ))}
    </div>
  );
}
