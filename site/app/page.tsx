import CardMy from "@/components/card";
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { BadgeCheck, Github, Linkedin } from "lucide-react";
import TrainingCard from "@/components/trainingCard";
import CertificationCards from "@/components/certificationCard";
import Skills from "@/components/skills";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import BootSequence from "@/components/bootSequence";

export default function Home() {

  return (
    <div
      className="bg-gradient-to-tr gap-12
  from-white to-white flex flex-col mx-auto
    max-w-[1200px] my-8 pb-9"
    >
      <CardMy
        className="flex flex-col md:flex-row items-stretch justify-center mx-4 md:mx-16
      md:px-6 md:py-5 border-zinc-500/20 rounded-xl"
      >
        <Tooltip>
          <div
            className="relative w-56 h-56 md:min-w-74 md:min-h-74 rounded-full border-2 ring-4
      ring-white border-zinc-800/20"
          >
            <TooltipTrigger asChild>
              <Image
                src={"/images/profile.png"}
                className="relative rounded-full"
                fill
                objectFit="cover"
                objectPosition="top"
                alt={"profileimage"}
              />
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Adriel L. | Analista de Sistemas</p>
            </TooltipContent>
          </div>
        </Tooltip>

        <div className="flex flex-col justify-start px-4 py-5">
          <h2 className="flex items-center gap-2 scroll-m-20 pb-2 text-3xl text-zinc-800 font-semibold tracking-tight first:mt-0">
            {"Adriel Silva."}
            <BadgeCheck className="text-blue-500" />
          </h2>
          <h3 className="scroll-m-20 pb-2 text-xl text-zinc-600 font-semibold tracking-tight first:mt-0">
            Analista e Desenvolvedor de Sistemas e Soluções em Technologia
          </h3>

          <p className="leading-7 [&:not(:first-child)]:mt-2 text-zinc-500">
            Analista de Sistemas Jr | Automação Industrial | CLP | CRMs |
            goHighLevel | N8N e Automação de processos.
          </p>
          <blockquote className="mt-4 italic text-sm text-zinc-400">
            Betim, Minas Gerais, Brasil
          </blockquote>
          <div className="flex gap-2 flex-wrap w-full py-3 mt-4">
            <Button variant="outline" size="lg">
              {" "}
              <Github /> Github
            </Button>
            <Button variant="outline" size="lg">
              <Linkedin /> Linkedin
            </Button>
            <Button size="lg">Quer entrar em contato ?</Button>
          </div>
        </div>
      </CardMy>
      <CardMy
        className="flex flex-col items-stretch justify-center mx-4 md:mx-16
      md:px-6 md:py-5 border-zinc-500/20 rounded-xl"
      >
        <h3
          className="scroll-m-20 text-xl
         text-zinc-600 font-semibold tracking-tight first:mt-0"
        >
          Projetos Campeões
        </h3>

        <div
          className="flex flex-col border border-yellow-500 transition duration-300
        bg-gradient-to-tr from-amber-500/10 via-amber-100/10 to-yellow-500/10 
        max-w-md self-center rounded-2xl"
        >
          {[
            {
              icon: "/images/trofeus/meu-barbeiro.png",
              title: "Meu Barbeiro App",
              descriptiton:
                "Fundador do meu barbeiro um web app que automatiza as trocas de mensagens dos barbeiros, otimizando tempo e agendamentos.",
              ProtectionText:
                "   ! O projeto é pantentiado e tem seus direitos reservados de imagem e technologia intelectual. qualquer uso ou copia, serão tomadas medidas de acordo com as leis: Lei do Software (Lei nº 9.609/98), Direito Autoral (Lei nº 9.610/98), Registro no INPI (Instituto Nacional da Propriedade Industrial).",
            },
            {
              icon: "/images/loading.tsx",
              title: "Projeto Exper",
              descriptiton:
                "Fundador do meu Projeto Exper, uma tentativa empreendedora de prestação de serviços e venda de produtos que trazem soluções reais para negocios reais com tecnologia de ponta desde a automação a paginas de conversção e trafego dentro do ecossistema web e digital.",
              ProtectionText:
                "   ! O projeto é pantentiado e tem seus direitos reservados de imagem e technologia intelectual. qualquer uso ou copia, serão tomadas medidas de acordo com as leis: Lei do Software (Lei nº 9.609/98), Direito Autoral (Lei nº 9.610/98), Registro no INPI (Instituto Nacional da Propriedade Industrial).",
            },
          ].map((item, index) => (
            <div
              key={index}
              className="flex flex-col gap-4 justify-center items-center
                  p-4 group hover:bg-white/5 transition duration-300 border-b 
                  border-zinc-300 last:border-b-0 text-center"
            >
              <Image
                src={item.icon}
                alt={item.title}
                objectFit="cover"
                width={120}
                height={120}
                className={`text-8xl rounded-full text-xs border-3 z-10
                    border-amber-400 p-1 flex items-center justify-center bg-amber-400/5
                    group-hover:scale-105 transition-transform duration-300 shadow-lg shadow-amber-400`}
              />
              {/* <div className="absolute top-16 w-30 h-30 bg-amber-500 -z-10 rounded-full animate-ping"></div> */}
              <h2 className="flex items-center gap-2 scroll-m-20 pb-2 text-3xl text-zinc-800 font-semibold tracking-tight first:mt-0">
                {item.title}
              </h2>
              <h3 className="scroll-m-20 text-justify max-w-md pb-2 text-xl text-zinc-600 font-semibold tracking-tight first:mt-0">
                {item.descriptiton}
              </h3>
              <blockquote className="italic text-justify text-sm text-zinc-400 mb-4">
                {item.ProtectionText}
              </blockquote>
              <a href="" className="cursor-pointer">
                <Button className="rounded-full cursor-pointer  
                hover:bg-blue-600 bg-blue-500 ring-1 px-6 py-6 shadow-blue-400 shadow-lg">
                  Confira mais Clicando Aqui !
                </Button>
              </a>
            </div>
          ))}
        </div>
      </CardMy>

      <CardMy
        className="flex flex-col items-stretch justify-center mx-4 md:mx-16
      md:px-6 md:py-5 border-zinc-500/20 rounded-xl"
      >
        <h3 className="scroll-m-20 pb-2 text-xl text-zinc-600 font-semibold tracking-tight first:mt-0">
          Formação Academica
        </h3>
        <blockquote className="italic text-sm text-zinc-400 mb-4">
          Algumas formações podem estar em andamento
        </blockquote>
        <TrainingCard />
      </CardMy>

      <CardMy
        className="flex flex-col items-stretch justify-center mx-4 md:mx-16
      md:px-6 md:py-5 border-zinc-500/20 rounded-xl"
      >
        <h3 className="scroll-m-20 text-xl text-zinc-600 font-semibold tracking-tight first:mt-0">
          Minhas Habilidades
        </h3>
        <blockquote className="italic text-sm text-zinc-400 mb-4">
          Habilidades em{" "}
          <span
            className="bg-amber-200 px-1 rounded-full
          text-amber-800"
          >
            dourado
          </span>{" "}
          são certificadas officialmente.
        </blockquote>
        <Skills />
      </CardMy>

      <CardMy
        className="flex flex-col items-stretch justify-center mx-4 md:mx-16
      md:px-6 md:py-5 border-zinc-500/20 rounded-xl"
      >
        <h3 className="scroll-m-20 pb-2 text-xl text-zinc-600 font-semibold tracking-tight first:mt-0">
          Certificações Tecnicas & Officiais
        </h3>
        <CertificationCards />
      </CardMy>

      <CardMy
        className="flex flex-col items-stretch justify-center mx-4 md:mx-16
      md:px-6 md:py-5 border-zinc-500/20 rounded-xl"
      >
        <h3 className="scroll-m-20 text-xl text-zinc-600 font-semibold tracking-tight first:mt-0">
          Principais Projetos
        </h3>
        {[{}].map((item, index) => {
          return (
            <Card key={index} className="relative mx-auto w-full max-w-sm pt-0">
              <div className="absolute inset-0 z-30 aspect-video bg-black/35" />
              <Image
                src="/images/loading.gif"
                alt="Event cover"
                unoptimized
                width={384}
                height={226}
                className="relative z-20 aspect-video w-full object-cover brightness-60 grayscale dark:brightness-40"
              />
              <CardHeader>
                <CardAction>
                  <Badge variant="secondary">Featured</Badge>
                </CardAction>
                <CardTitle>Design systems meetup</CardTitle>
                <CardDescription>
                  A practical talk on component APIs, accessibility, and
                  shipping faster.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button className="w-full">View Event</Button>
              </CardFooter>
            </Card>
          );
        })}
      </CardMy>
    </div>
  );
}
