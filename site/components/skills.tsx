import React from "react";
import Image from "next/image";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BadgeCheck } from "lucide-react";

function Skills() {
  return (
    <div
      className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border border-zinc-300 transition duration-300
        bg-gradient-to-tr text-center from-white/10 via-black/10 to-white/10 rounded-2xl"
    >
       {[
                   {
                     icon: "/images/skills/n8n.png",
                     title: "N8N",
                     description:
                       "Automação e integração de aplicativos por meio de APIs",
                   },
                   {
                     icon: "/images/skills/docker.jpg",
                     title: "Docker",
                     description:
                       "Conteinerização de aplicativos e aplicações simplificando e segurando o Desenvolvimento.",
                   },
                   {
                     icon: "/images/skills/nextjs.jpeg",
                     title: "Next JS",
                     description:
                       "Desenvolvimento de Sistemas e interfaces com o maior framework que impulsiona o React",
                     certified: true,
                   },
                   {
                     icon: "/images/skills/git.png",
                     title: "git",
                     description: "git bash e linhas de comandos para versionamento",
                   },
                   {
                     icon: "/images/skills/github.png",
                     title: "github",
                     description:
                       "Plataforma de versionamento e historico de codigo",
                   },
                   {
                     icon: "/images/skills/javascript.png",
                     title: "Javascript",
                     description: "Linguagem de programação da WEB",
                   },
                   {
                     icon: "/images/skills/make.jpeg",
                     title: "make",
                     description:
                       "Platafoma de automação e integração de dados e apps",
                   },
                   {
                     icon: "/images/skills/nodejs.jpeg",
                     title: "Node",
                     description:
                       "runtime - executar e rodar javascript fora da web e navegadores",
                   },
                   {
                     icon: "/images/skills/postgresql.png",
                     title: "PostgreSql",
                     description:
                       "Banco de dados e logica de estruturação com conceitos SQL, instruções e de leitura, filtro, busca e registro de dados em SQL.",
                   },
                   {
                     icon: "/images/skills/css.png",
                     title: "CSS3",
                     description:
                       "Estrutura de Estilisação padrao, e desenvolvimento aplicado.",
                   },
                   {
                     icon: "/images/skills/html5.png",
                     title: "HTML5",
                     description:
                       "Estrutura e Desenvolvimento voltado para WEB e interfaces",
                   },
                 ].map((card, index) => (
                   <div
                     key={index}
                     className="flex flex-col md:flex-row gap-4 items-center
                     p-4 group hover:bg-white/5 transition duration-300  
                     border-zinc-300 last:border-b-0 group-hover:border-${card.color}"
                   >
                     {card.certified ? (
                       <>
                         <Tooltip>
                           <TooltipTrigger asChild>
                             <Image
                               src={card.icon}
                               alt={card.title}
                               objectFit="cover"
                               width={80}
                               height={80}
                               className={`text-8xl rounded-full text-xs border-3 shadow-amber-300 shadow-md
                             border-amber-300 p-1 flex items-center justify-center bg-amber-300/40
                             group-hover:scale-105 transition-transform duration-300 `}
                             />
                           </TooltipTrigger>
                           <TooltipContent side="bottom">
                             <p className="flex items-center gap-2">
                               {" "}
                               <BadgeCheck />
                               Certificado Official em {card.title}
                             </p>
                           </TooltipContent>
                         </Tooltip>
                       </>
                     ) : (
                       <Image
                         src={card.icon}
                         alt={card.title}
                         objectFit="cover"
                         width={80}
                         height={80}
                         className={`text-8xl rounded-full text-xs border-3
                      p-1 flex items-center justify-center bg-white/5
                     group-hover:scale-105 transition-transform duration-300 shadow-lg shadow`}
                       />
                     )}
     
                     {/* <div className="flex flex-col">
                       <h3 className="text-zinc-600 font-bold text-lg mb-2 lg:text-left">
                         {card.title}
                       </h3>
     
                       <p
                         className="text-gray-500 text-sm leading-relaxed
                         text-center lg:text-left"
                       >
                         {card.description}
                       </p>
                     </div> */}
                   </div>
                 ))}
             
    </div>
  );
}

export default Skills;
