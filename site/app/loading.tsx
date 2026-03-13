import BootSequence from "@/components/bootSequence";

const loading = () => {


  return (
    <div className="fixed inset-0 z-40 bg-black flex items-center justify-center transition-opacity duration-500">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-blue-500 font-mono text-sm">Carregando sistema...</p>
      </div>
    </div>
  );
};

export default loading;
