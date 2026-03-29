import { supabase } from '@/lib/supabase';
import { Vehicle } from '@/types';
import VehicleCard from '@/components/VehicleCard';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const { data: vehicles, error } = await supabase
    .from('vehicles')
    .select('*')
    .order('created_at', { ascending: false });

  // Fallback in case of error
  const cars = (vehicles as Vehicle[]) || [];

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-50 px-6 py-12 md:px-12 md:py-20 font-sans">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Header Section */}
        <header className="space-y-4 text-center md:text-left">
          <div className="inline-block mb-2">
            <span className="bg-neutral-800 text-neutral-300 px-3 py-1 rounded-full text-xs font-semibold tracking-widest uppercase shadow-sm border border-neutral-700">
              Concessionária Digital
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-200 to-neutral-500">
            BestCar Motors
          </h1>
          <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mt-4 leading-relaxed">
            Descubra a seleção mais exclusiva de veículos premium. Encontre a próxima grande conquista da sua garagem hoje mesmo.
          </p>
        </header>

        {/* Content Section */}
        {cars.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 px-6 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-2xl relative overflow-hidden">
            {/* Ambient Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-neutral-800/10 to-transparent pointer-events-none" />
            
            <div className="bg-neutral-800/80 p-6 rounded-full mb-8 ring-1 ring-white/10 shadow-inner">
              <svg className="w-12 h-12 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h2 className="text-3xl font-semibold text-white text-center mb-3 tracking-tight">Estoque Vazio</h2>
            <p className="text-neutral-400 text-center text-lg max-w-md">
              Nosso estoque está sendo atualizado. Volte em breve!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 items-stretch pt-4">
            {cars.map((car) => (
              <VehicleCard key={car.id} car={car} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
