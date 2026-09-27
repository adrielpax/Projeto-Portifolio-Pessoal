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

import Link from "next/link";
import ReadMoreButton from "@/components/readmore";

export default function Home() {
  return (
    <div
      className="bg-linear-to-tr gap-12
      from-white to-white flex flex-col mx-auto max-w-[600px] my-8 pb-9 px"
    >
      <CardMy
        className="flex flex-col items-start justify-center mx-2 
         border-zinc-500/20 rounded-xl px-4"
      >
        <div className="flex flex-row gap-3 mb-2">
          <Tooltip>
            <div
              className="relative flex flex-row min-w-26 h-26 md:w-32 md:h-32 rounded-full border-2 ring-4
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
          <div>
            <h2
              className="flex items-start mt-4 gap-0.5 mb-2 scroll-m-20 text-base text-zinc-800 
            font-semibold tracking-tight first:mt-0"
            >
              {"Adriel Silva"}
            </h2>
            <h3 className="scroll-m-20 pb-0.5 text-sm text-zinc-600 font-semibold tracking-tight first:mt-0">
              Desenvolvedor Full-Stack & Especialista em Automação.
            </h3>
            <p className="text-xs text-zinc-500 mb-4">
              Sistemas de informação - UNA
            </p>
          </div>

          {/* <BadgeCheck className="text-blue-500  h-4 w-4" /> */}
        </div>

        <div className="flex flex-col justify-start py-1 mb-2">
          <blockquote className=" italic text-xs text-zinc-400">
            Betim, Minas Gerais, Brasil
          </blockquote>
          <p className=" [&:not(:first-child)]:mt-0.5 text-xs text-zinc-500">
            Construindo plataformas SaaS, MVPs e sistemas que escalam negócios.
          </p>
        </div>

        <div className="flex gap-2 flex-wrap w-full">
          <Link href="https://tally.so/r/kdAMVM">
            <Button
              size="sm"
              className="rounded-lg cursor-pointer px-3 py-4 ring ring-white
              bg-gradient-to-tr hover:shadow-md shadow-amber-500 from-amber-600 to-amber-500 text-xs"
            >
              Entrar em Contato
            </Button>
          </Link>
          <Link href="https://github.com/adrielpax" target="_blank">
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg cursor-pointer px-3 py-4 text-xs"
            >
              {" "}
              <Github />
            </Button>
          </Link>

          <Link href="https://linkedin.com/in/adriel-lucas" target="_blank">
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg cursor-pointer px-3 py-4 text-xs"
            >
              <Linkedin />
            </Button>
          </Link>
        </div>
        
     
      </CardMy>

      {/* Habilidades */}
      {/* <CardMy
          className="flex flex-col items-stretch justify-center mx-4 md:mx-16
          md:px-6 md:py-5 border-zinc-500/20 rounded-xl"
        >
        <blockquote className="italic text-sm text-zinc-400 mb-4">
        Habilidades em{" "}
            <span
              className="bg-amber-200 px-1 rounded-full
            text-amber-800"
            >
              dourado
            </span>{" "}
            são certificadas officialmente.
            <br /> outras habilidades são desenvolvidas 100% atraves de projetos
            e auto-aprendizado !
          </blockquote>
      
        </CardMy> */}
      {/* Formações */}
      {/* <CardMy
        className="flex flex-col items-stretch justify-center mx-4 md:mx-16
      md:px-6 md:py-5 border-zinc-500/20 rounded-xl"
      >
        <h3 className="scroll-m-20 text-xl text-zinc-600 font-semibold tracking-tight first:mt-0">
          Formação Academica
        </h3>
        <blockquote className="italic text-sm text-zinc-400 mb-4">
          Algumas formações podem estar em andamento... <br /> apenas formações
          relevantes e de longo prazo em constante atualização !
        </blockquote>
        <TrainingCard />
      </CardMy> */}

      {/* champions projects */}
      {/* <CardMy
        className="flex flex-col items-stretch justify-center mx-4 md:mx-16
      md:px-6 md:py-5 border-zinc-500/20 rounded-xl"
      >
        <h3
          className="scroll-m-20 text-xl
         text-zinc-600 font-semibold tracking-tight first:mt-0 mb-4"
        >
          Projetos Campeões
        </h3>
        <blockquote className="italic text-sm text-zinc-400 mb-4">
          Alguns projetos ainda podem estar em desenvolvimento,
          <br /> porem são projetos feitos por mim automonamente e com uso real
          no mercado !
        </blockquote>

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
             
              <h2 className="flex items-center gap-2 scroll-m-20 pb-2 text-3xl text-zinc-800 font-semibold tracking-tight first:mt-0">
                {item.title}
              </h2>
              <h3 className="scroll-m-20 text-justify max-w-md pb-2 text-xl text-zinc-600 font-semibold tracking-tight first:mt-0">
                {item.descriptiton}
              </h3>
              <blockquote className="italic text-justify text-sm text-zinc-400 mb-4">
                {item.ProtectionText}
              </blockquote>
              <a
                href="https://barberboost.vercel.app/"
                className="cursor-pointer"
              >
                <Button
                  className="rounded-full cursor-pointer  
                hover:scale-105 bg-gradient-to-tr from-amber-400 to-amber-500 ring 
                px-6 py-6 shadow-amber-400 shadow-lg"
                >
                  Saiba mais Clicando Aqui !
                </Button>
              </a>
            </div>
          ))}
        </div>
      </CardMy> */}

      {/* Projetos */}
      {/* <CardMy
        className="flex flex-col items-stretch justify-center mx-4 md:mx-16
      md:px-6 md:py-5 border-zinc-500/20 rounded-xl"
      >
        <h3 className="scroll-m-20 text-xl text-zinc-600 font-semibold tracking-tight first:mt-0 mb-4">
          Principais Projetos
        </h3>
        <blockquote className="italic text-sm text-zinc-400 mb-4">
          Alguns projetos podem estar em desenvolvimento !
        </blockquote>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[
            {
              featured: "Projeto on-line",
              title: "loja virtual para Sheu Brigadeiros Gourmet",
              description:
                "Loja vitual que fiz para minha namorada para colocar demandas reais de doces e brigadeiros gourmet na sua loja virtual alem de toda a renovação de maketing e logo e midias digitais.",
              link: "https://sheyla-brigadeiros-site.vercel.app/?fbclid=PAZXh0bgNhZW0CMTEAc3J0YwZhcHBfaWQMMjU2MjgxMDQwNTU4AAGnaJol5tXeY2fDQgPqXqxABZMHkp72-Cr8dImMm8cm36xxpxWXo9qPEPVJYZI_aem_G4yfG3HFFQNWjqNZgUljfA",
              page: "",
              image: "/images/projects/sheu-site.png",
            },
            {
              featured: "Projeto on-line",
              title: "loja virtual Precinho Rei",
              description:
                "A loja virtual precinho rei e um ecommerce que eu desenvolvi em nextjs tambem buscando mesclar o melhor em interfaces da amazon, shopee e mercado pago o que eu gostava nas plataformas, esse projeto no futuro não so sera minha loja virtual mas será whitelabel e usavel !",
              link: "https://precinhorei.vercel.app/",
              page: "",
              image: "/images/projects/precinho-rei.png",
            },
          ].map((item, index) => {
            return (
              <Card
                key={index}
                className="relative mx-auto w-full max-w-sm pt-0 group z-30"
              >
                <div className="absolute inset-0 " />
                <Image
                  src={item.image}
                  alt={item.title}
                  unoptimized
                  width={384}
                  height={400}
                  className="relative z-20 aspect-video w-full object-cover group-hover:scale-110 transition-all easy-in-out duration-300"
                />
                <CardHeader>
                  <CardAction></CardAction>
                  <Badge variant="secondary">{item.featured}</Badge>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription className="z-30">
                    <ReadMoreButton text={item.description} />
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button className="w-full hover:bg-blue-500 z-50 rounded-full ">
                    <Link href={item.link} target="_blank">
                      Descobrir mais
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </CardMy> */}

      {/* certificações */}
      {/* <CardMy
        className="flex flex-col items-stretch justify-center mx-4 md:mx-16
        md:px-6 md:py-5 border-zinc-500/20 rounded-xl"
      >
        <h3 className="scroll-m-20 pb-2 text-xl text-zinc-600 font-semibold tracking-tight first:mt-0">
          Certificações Tecnicas & Officiais
        </h3>
        <blockquote className="italic text-sm text-zinc-400 mb-4">
          Essas certificações são para apredizados especificos
          <br /> consolidando e validando conhecimentos em ferramantas e
          technologias.
        </blockquote>
        <CertificationCards />
      </CardMy> */}
    </div>
  );
}
