import React from "react";

function CardMy({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`
      border px-3 py-4 rounded-md shadow-lg 
      bg-gradient-to-tr from-zinc-800/5  to-zinc-800/5 backdrop-blur-lg
      hover:shadow-sm hover:to-white/20
      transition-all easy-in-out duration-300
      ${className}`}
    >
      {children}
    </div>
  );
}

export default CardMy;
