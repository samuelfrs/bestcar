import { getVehicles } from '@/app/actions/vehicles';
import { Vehicle } from '@/types';
import VehicleCard from '@/components/VehicleCard';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const { data: vehicles } = await getVehicles();

  // Fallback in case of error
  const cars = (vehicles as Vehicle[]) || [];

  return (
    <main className="min-h-screen bg-black font-sans selection:bg-emerald-500 selection:text-black">
      {/* 100vh Hero Section - Brutalist/Scanner Vibe */}
      <section className="relative w-full h-screen flex flex-col justify-center px-6 md:px-12 overflow-hidden border-b border-neutral-900">
        {/* Background Cyber/Geometric grid & Glow */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          {/* Stark grid lines */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]"></div>
          {/* Subtle toxic/neon green radial glow in the corner */}
          <div className="absolute top-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-emerald-600/10 blur-[120px]"></div>
        </div>

        <div className="relative z-10 max-w-7xl w-full mx-auto flex flex-col items-start gap-6">
          <div className="border-l-4 border-emerald-500 pl-4 py-1">
            <span className="text-emerald-500 font-mono text-sm md:text-md uppercase tracking-[0.3em] font-bold">
              SYS.01 // Concessionária Digital
            </span>
          </div>

          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white uppercase tracking-tighter leading-[0.85]">
            Best<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">Car</span>
            <span className="text-neutral-600">.</span>
          </h1>

          <p className="text-neutral-400 text-lg md:text-2xl max-w-2xl font-medium mt-4 border-l border-neutral-800 pl-6 py-2">
            Máquinas de alta performance entregues na sua garagem. Exclusividade, torque e design implacável.
          </p>

          <a href="#estoque" className="group mt-12 inline-flex items-center gap-4 bg-emerald-500 text-black px-8 py-4 font-bold uppercase tracking-widest text-sm hover:bg-emerald-400 transition-colors relative overflow-hidden">
            <span className="relative z-10">Acessar Frota</span>
            <svg className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
          </a>
        </div>

        {/* Scroll indicator - Brutalist style */}
        <div className="absolute bottom-12 left-6 md:left-12 flex items-center gap-4 text-neutral-600 font-mono text-xs uppercase tracking-widest hidden sm:flex">
          <span>Scroll</span>
          <div className="w-12 h-[1px] bg-neutral-800 relative overflow-hidden">
            <div className="absolute inset-0 bg-emerald-500 w-full animate-[pulse_2s_ease-in-out_infinite] origin-left scale-x-50"></div>
          </div>
        </div>
      </section>

      {/* Grid Section */}
      <section id="estoque" className="w-full bg-neutral-950 py-24 px-6 md:px-12 relative">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex items-end justify-between mb-16 border-b border-neutral-800 pb-6">
            <div>
              <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight">Estoque <span className="text-emerald-500">Ativo</span></h2>
              <p className="text-neutral-500 font-mono text-sm mt-3 uppercase tracking-widest border-l-2 border-emerald-500 pl-3">
                [{cars.length} máquinas catalogadas]
              </p>
            </div>
          </div>

          {cars.length === 0 ? (
            <div className="w-full flex flex-col items-center justify-center py-32 border border-neutral-800 border-dashed bg-black relative overflow-hidden group">
              <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.02)_10px,rgba(255,255,255,0.02)_20px)] pointer-events-none"></div>
              <div className="w-20 h-20 border-2 border-neutral-800 text-neutral-600 flex items-center justify-center mb-6 group-hover:border-emerald-500 group-hover:text-emerald-500 transition-colors z-10">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white tracking-widest uppercase mb-2 z-10">Sem Datasets</h2>
              <p className="text-neutral-500 font-mono text-sm z-10">O sistema não encontrou equipamentos no momento.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
              {cars.map((car) => (
                <VehicleCard key={car.id} car={car} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
