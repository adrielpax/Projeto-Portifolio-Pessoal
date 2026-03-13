"use client"

import { BootSequenceProps } from '@/types';
import { useEffect, useState } from 'react';


const BootSequence: React.FC<BootSequenceProps> = ({ onFinish }) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);

  const bootSteps: string[] = [
    'Loading kernel modules... [OK]',
    'Initializing network interface... [OK]', 
    'Starting web services... [OK]',
    'Loading portfolio data... [OK]',
    'System ready!'
  ];

  useEffect(() => {
    // Start progress animation
    const progressTimer = setTimeout(() => {
      setProgress(100);
    }, 500);

    // Show boot steps sequentially
    const stepTimers = bootSteps.map((_, index) => 
      setTimeout(() => {
        setCurrentStep(index + 1);
        
        // Finish boot sequence after last step
        if (index === bootSteps.length - 1) {
          setTimeout(onFinish, 1000);
        }
      }, 1500 + (index * 800))
    );

    return () => {
      clearTimeout(progressTimer);
      stepTimers.forEach(timer => clearTimeout(timer));
    };
  }, [onFinish, bootSteps.length]);

  return (
    <div className="fixed inset-0 z-50 bg-black text-cyan-500 flex items-center justify-center font-mono">
      <div className="w-full max-w-2xl p-8">
        {/* Title */}
        <div className="mb-8">
          <div className="text-2xl mb-4 animate-pulse">
            SISTEMA INICIALIZANDO...
          </div>
        </div>
        
        {/* Boot Steps */}
        <div className="space-y-2 text-sm mb-6">
          {bootSteps.map((step, index) => (
            <div 
              key={index}
              className={`transition-opacity duration-300 ${
                index < currentStep ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {step}
            </div>
          ))}
        </div>
        
        {/* Progress Bar */}
        <div className="mt-6">
          <div className="bg-gray-800 rounded-full h-2">
            <div 
              className="bg-cyan-500 h-2 rounded-full transition-all duration-3000 ease-in-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BootSequence;