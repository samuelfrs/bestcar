"use client";

import { useState } from 'react';
import { Vehicle } from '@/types';
import { supabase } from '@/lib/supabase';

interface VehicleCardProps {
  car: Vehicle;
}

export default function VehicleCard({ car }: VehicleCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const { error: insertError } = await supabase
      .from('leads')
      .insert([
        { 
          vehicle_id: car.id, 
          customer_name: name, 
          customer_phone: phone 
        }
      ]);

    if (insertError) {
      setError('Ocorreu um erro ao enviar seu contato. Tente novamente.');
      setIsSubmitting(false);
    } else {
      setSuccess(true);
      setIsSubmitting(false);
      setName('');
      setPhone('');
      
      // Fecha o modal após 2.5 segundos
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccess(false);
      }, 2500);
    }
  };

  return (
    <>
      <div className="group relative flex flex-col bg-black border border-neutral-800 hover:border-emerald-500 transition-colors duration-300 h-full overflow-hidden">
        
        {/* Decorative corner accent - Brutalist */}
        <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none z-10">
          <div className="absolute top-0 right-0 w-full h-[2px] bg-emerald-500 scale-x-0 origin-right transition-transform duration-300 group-hover:scale-x-100"></div>
          <div className="absolute top-0 right-0 w-[2px] h-full bg-emerald-500 scale-y-0 origin-top transition-transform duration-300 group-hover:scale-y-100"></div>
        </div>

        {/* Image Area - Sharp borders */}
        <div className="relative aspect-[4/3] w-full bg-neutral-950 overflow-hidden border-b border-neutral-800 group-hover:border-emerald-500/50 transition-colors">
          {car.image_url ? (
            <img 
              src={car.image_url} 
              alt={`${car.brand} ${car.model}`}
              className="object-cover w-full h-full grayscale-[20%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-out"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-800 bg-[repeating-linear-gradient(45deg,rgba(0,0,0,1),rgba(0,0,0,1)_10px,rgba(20,20,20,1)_10px,rgba(20,20,20,1)_20px)] relative">
              <span className="font-mono text-xs font-bold text-neutral-600 uppercase tracking-[0.2em] border border-neutral-800 px-3 py-1 bg-black">SYS.IMG_N/A</span>
            </div>
          )}
          
          {/* Status badge - Tech style */}
          {car.status.toLowerCase() !== 'disponível' && (
            <div className="absolute top-3 left-3 bg-red-600/10 text-red-500 border-l-2 border-red-500 text-[10px] font-mono font-bold px-2 py-1 uppercase tracking-widest backdrop-blur-md">
              [{car.status}]
            </div>
          )}
          
          {/* Scanner overlay effect on hover */}
          <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none mix-blend-overlay" />
        </div>

        {/* Content Area */}
        <div className="flex flex-col flex-grow p-5 md:p-6 bg-neutral-950/50 relative z-10">
          <div className="space-y-1 mb-4">
            <p className="text-[10px] font-mono font-bold text-emerald-500 uppercase tracking-[0.2em]">::{car.brand}</p>
            <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter leading-none group-hover:text-emerald-400 transition-colors duration-300">
              {car.model}
            </h3>
          </div>
          
          <div className="flex items-center gap-2 mb-auto">
            <span className="inline-flex items-center px-2 py-1 bg-neutral-900 border border-neutral-800 text-neutral-400 font-mono text-[10px] uppercase tracking-widest">
              ANO_{car.year}
            </span>
          </div>

          <div className="mt-6 pt-5 border-t border-neutral-900 flex flex-col gap-4">
            <div>
              <p className="font-mono text-[9px] text-neutral-600 font-bold mb-1 uppercase tracking-widest block">Valor Ref.</p>
              <p className="text-2xl font-black text-white tracking-tighter shadow-emerald-500/20 drop-shadow-md">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(car.price)}
              </p>
            </div>
            
            <button 
              onClick={() => setIsModalOpen(true)}
              disabled={car.status.toLowerCase() !== 'disponível'}
              className="relative w-full py-3 overflow-hidden bg-neutral-900 text-neutral-300 hover:text-black font-mono font-bold text-xs tracking-widest uppercase transition-all duration-300 border border-neutral-800 hover:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed group/btn"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Tenho Interesse
                <svg className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-emerald-500 scale-x-0 origin-left group-hover/btn:scale-x-100 transition-transform duration-300 ease-out z-0"></div>
            </button>
          </div>
        </div>
      </div>

      {/* Modal Overlay - Brutalist Version */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/90 backdrop-blur-md transition-opacity" 
            onClick={() => !isSubmitting && setIsModalOpen(false)}
          />
          
          <div className="relative bg-neutral-950 border-2 border-neutral-800 w-full max-w-md p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] transform transition-all before:absolute before:inset-0 before:pointer-events-none before:bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.05),transparent_50%)] pointer-events-auto">
            {/* Cyberpunk corner details */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-emerald-500/50"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-emerald-500/50"></div>

            <button 
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
              className="absolute top-5 right-5 text-neutral-600 hover:text-emerald-500 transition-colors disabled:opacity-50"
              aria-label="Cerrar modal"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {success ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 border-2 border-emerald-500 text-emerald-500 flex items-center justify-center mx-auto mb-6 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-black text-white tracking-tighter uppercase mb-2">Enviado</h3>
                <p className="text-neutral-500 font-mono text-xs uppercase tracking-widest">
                  Processo concluído. Nossa equipe assumirá o protocolo em breve.
                </p>
              </div>
            ) : (
              <div>
                <p className="font-mono text-[10px] font-bold text-emerald-500 tracking-widest uppercase mb-1">:: Contato</p>
                <h3 className="text-3xl font-black text-white tracking-tighter uppercase mb-6 leading-none block">
                  {car.brand}<br />
                  <span className="text-neutral-500">{car.model}</span>
                </h3>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="name" className="block text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-widest mb-2">
                      Seu Nome <span className="text-emerald-500">*</span>
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={isSubmitting}
                      className="w-full bg-black border border-neutral-800 text-white px-4 py-3 font-mono text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-neutral-800 rounded-none"
                      placeholder="NOME COMPLETO"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-widest mb-2">
                      WhatsApp <span className="text-emerald-500">*</span>
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={isSubmitting}
                      className="w-full bg-black border border-neutral-800 text-white px-4 py-3 font-mono text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-neutral-800 rounded-none"
                      placeholder="(00) 00000-0000"
                    />
                  </div>

                  {error && (
                    <div className="bg-red-500/10 border-l-2 border-red-500 p-3 text-red-500 font-mono text-xs flex items-start gap-2 uppercase tracking-wide">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>ERR: {error}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="relative w-full py-4 mt-4 overflow-hidden bg-neutral-900 border border-neutral-800 hover:border-emerald-500 text-white font-mono font-bold text-sm tracking-widest uppercase transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group/submit flex justify-center items-center"
                  >
                    <div className="absolute inset-0 bg-emerald-500 scale-y-0 origin-bottom group-hover/submit:scale-y-100 transition-transform duration-300 ease-in-out z-0"></div>
                    <span className="relative z-10 group-hover/submit:text-black transition-colors flex items-center gap-2">
                      {isSubmitting ? (
                        <>
                          Proc...
                          <span className="block w-2 h-2 bg-white animate-ping"></span>
                        </>
                      ) : (
                        <>
                          Enviar
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </>
                      )}
                    </span>
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
