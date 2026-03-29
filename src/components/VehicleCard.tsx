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
      <div className="group relative flex flex-col rounded-3xl bg-neutral-900 border border-neutral-800 overflow-hidden shadow-lg hover:shadow-2xl hover:border-neutral-700 transition-all duration-300 hover:-translate-y-2 h-full">
        {/* Image Area */}
        <div className="relative aspect-[4/3] w-full bg-neutral-800 overflow-hidden">
          {car.image_url ? (
            <img 
              src={car.image_url} 
              alt={`${car.brand} ${car.model}`}
              className="object-cover w-full h-full transition-transform duration-700 ease-out group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-600 bg-gradient-to-br from-neutral-800 to-neutral-900 relative">
              <svg className="w-16 h-16 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="absolute bottom-4 left-4 text-xs font-semibold text-neutral-500 uppercase tracking-widest backdrop-blur-sm bg-neutral-900/50 px-2 py-1 rounded-md">Sem Imagem</span>
            </div>
          )}
          
          {/* Status badge */}
          {car.status.toLowerCase() !== 'disponível' && (
            <div className="absolute top-4 right-4 bg-red-600/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm border border-red-500/50">
              {car.status}
            </div>
          )}
          
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </div>

        {/* Content Area */}
        <div className="flex flex-col flex-grow p-6 space-y-5">
          <div className="space-y-1.5">
            <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">{car.brand}</p>
            <h3 className="text-xl font-bold text-neutral-100 line-clamp-1 group-hover:text-emerald-400 transition-colors duration-300">
              {car.model}
            </h3>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-neutral-800/80 text-neutral-300 border border-neutral-700">
              Ano: {car.year}
            </span>
          </div>

          <div className="mt-auto pt-5 border-t border-neutral-800 flex flex-col gap-4">
            <div>
              <p className="text-xs text-neutral-500 font-bold pb-1.5 uppercase tracking-wider">Valor Sugerido</p>
              <p className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-br from-emerald-400 to-teal-500">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(car.price)}
              </p>
            </div>
            
            <button 
              onClick={() => setIsModalOpen(true)}
              disabled={car.status.toLowerCase() !== 'disponível'}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold rounded-xl text-sm transition-all duration-300 shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Tenho Interesse
            </button>
          </div>
        </div>
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
            onClick={() => !isSubmitting && setIsModalOpen(false)}
          />
          
          <div className="relative bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-md p-8 shadow-2xl transform transition-all">
            <button 
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
              className="absolute top-5 right-5 text-neutral-500 hover:text-white transition-colors disabled:opacity-50"
              aria-label="Cerrar modal"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {success ? (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white tracking-tight mb-2">Contato enviado com sucesso!</h3>
                <p className="text-neutral-400 text-sm">
                  Nossa equipe já recebeu seus dados e entrará em contato em breve pelo WhatsApp.
                </p>
              </div>
            ) : (
              <div>
                <h3 className="text-2xl font-bold text-white tracking-tight mb-1">Tenho Interesse</h3>
                <p className="text-neutral-400 mb-6 text-sm">
                  Deixe seus dados e nossa equipe entrará em contato sobre o <strong className="text-emerald-400 font-medium">{car.brand} {car.model}</strong>.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-xs font-semibold text-neutral-300 uppercase tracking-wide mb-2">
                      Nome completo
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={isSubmitting}
                      className="w-full bg-neutral-800/80 border border-neutral-700 text-white rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder:text-neutral-500 shadow-inner"
                      placeholder="Seu nome completo"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-xs font-semibold text-neutral-300 uppercase tracking-wide mb-2">
                      WhatsApp
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={isSubmitting}
                      className="w-full bg-neutral-800/80 border border-neutral-700 text-white rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder:text-neutral-500 shadow-inner"
                      placeholder="(DD) 90000-0000"
                    />
                  </div>

                  {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-500 text-sm flex items-start gap-2">
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 mt-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] disabled:opacity-70 disabled:cursor-not-allowed group flex justify-center items-center"
                  >
                    {isSubmitting ? (
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      "Enviar Contato"
                    )}
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
