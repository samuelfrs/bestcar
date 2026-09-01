"use client";

import { useState, useEffect, useCallback } from 'react';
import { Vehicle } from '@/types';
import { useRouter } from 'next/navigation';
import { getUsers, createUser, deleteUser, logoutAction, getCurrentUserAction } from './actions';
import { getVehicles, saveVehicle, deleteVehicle } from '@/app/actions/vehicles';
import { getLeads, deleteLead, type LeadWithVehicle } from '@/app/actions/leads';

type AppUser = {
  id: string;
  email?: string;
  name?: string;
  role: string;
  created_at: string;
};

export default function AdminDashboard() {
  const router = useRouter();

  // Auth Context
  const [userRole, setUserRole] = useState<'admin' | 'moderador' | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Tabs
  const [activeTab, setActiveTab] = useState<'vehicles' | 'leads' | 'users'>('vehicles');
  
  // Leads & Vehicles State
  const [leads, setLeads] = useState<LeadWithVehicle[]>([]);
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(false);

  // Users State
  const [users, setUsers] = useState<AppUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('moderador');
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [userActionMsg, setUserActionMsg] = useState('');

  // Vehicle Modal Form State
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [status, setStatus] = useState('disponível');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const refreshLeads = useCallback(async () => {
    setIsLoadingLeads(true);
    const { data, error } = await getLeads();
    if (!error && data) setLeads(data);
    setIsLoadingLeads(false);
  }, []);

  const refreshVehicles = useCallback(async () => {
    setIsLoadingVehicles(true);
    const { data, error } = await getVehicles();
    if (!error && data) setVehicles(data);
    setIsLoadingVehicles(false);
  }, []);

  const refreshUsersList = useCallback(async () => {
    setIsLoadingUsers(true);
    const res = await getUsers();
    if (res.error) alert(res.error);
    else if (res.users) setUsers(res.users);
    setIsLoadingUsers(false);
  }, []);

  useEffect(() => {
    let isMounted = true;
    getCurrentUserAction().then(({ user }) => {
      if (!isMounted) return;
      if (!user) {
        router.push('/admin/login');
        return;
      }
      setUserEmail(user.email);
      setUserRole(user.role);
    });

    return () => {
      isMounted = false;
    };
  }, [router]);

  useEffect(() => {
    let isMounted = true;

    if (activeTab === 'leads') {
      getLeads().then(({ data, error }) => {
        if (!isMounted) return;
        if (!error && data) setLeads(data);
        setIsLoadingLeads(false);
      });
    } else if (activeTab === 'vehicles') {
      getVehicles().then(({ data, error }) => {
        if (!isMounted) return;
        if (!error && data) setVehicles(data);
        setIsLoadingVehicles(false);
      });
    } else if (activeTab === 'users' && userRole === 'admin') {
      getUsers().then((res) => {
        if (!isMounted) return;
        if (res.error) alert(res.error);
        else if (res.users) setUsers(res.users);
        setIsLoadingUsers(false);
      });
    }

    return () => {
      isMounted = false;
    };
  }, [activeTab, userRole]);

  const handleLogout = async () => {
    await logoutAction();
    router.push('/admin/login');
    router.refresh();
  };

  // --- LEADS ---
  const handleDeleteLead = async (id: string, name: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir o lead ${name}?`)) return;
    const res = await deleteLead(id);
    if (res?.error) alert('Erro ao excluir: ' + res.error);
    else { setSuccessMsg(`Lead removido com sucesso.`); refreshLeads(); setTimeout(() => setSuccessMsg(''), 4000); }
  };

  // --- VEHICLES ---
  const openNewVehicleModal = () => {
    setEditingVehicleId(null); setBrand(''); setModel(''); setYear(''); setPrice(''); setImageUrl(''); setStatus('disponível');
    setErrorMsg(''); setIsVehicleModalOpen(true);
  };

  const openEditVehicleModal = (v: Vehicle) => {
    setEditingVehicleId(v.id); setBrand(v.brand); setModel(v.model); setYear(v.year.toString()); setPrice(v.price.toString());
    setImageUrl(v.image_url || ''); setStatus(v.status); setErrorMsg(''); setIsVehicleModalOpen(true);
  };

  const handleDeleteVehicle = async (id: string, name: string) => {
    if (!window.confirm(`Tem certeza que deseja deletar o veículo ${name}?`)) return;
    const res = await deleteVehicle(id);
    if (res?.error) alert('Erro ao excluir: ' + res.error);
    else { setSuccessMsg(`Removido com sucesso.`); refreshVehicles(); setTimeout(() => setSuccessMsg(''), 4000); }
  };

  const handleSaveVehicle = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true); setErrorMsg('');
    const payload = { 
      id: editingVehicleId, 
      brand, 
      model, 
      year: parseInt(year), 
      price: parseFloat(price), 
      status, 
      image_url: imageUrl || null 
    };

    if (isNaN(payload.year) || isNaN(payload.price)) {
      setErrorMsg('Ano e Preço numéricos inválidos.'); setIsSubmitting(false); return;
    }

    const res = await saveVehicle(payload);

    if (res?.error) setErrorMsg('Erro: ' + res.error);
    else {
      setSuccessMsg(`Salvo com sucesso!`); setIsVehicleModalOpen(false); refreshVehicles();
      setTimeout(() => setSuccessMsg(''), 4000);
    }
    setIsSubmitting(false);
  };

  // --- USERS ---
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newUserPassword.length < 6) { setUserActionMsg("A senha deve ter pelo menos 6 caracteres."); return; }
    
    setIsCreatingUser(true); setUserActionMsg('');
    const res = await createUser(newUserEmail, newUserRole, newUserName, newUserPassword);
    
    if (res.error) {
       setUserActionMsg(res.error);
    } else {
       setUserActionMsg(`Usuário ${res.user?.email} criado com sucesso! O acesso já está liberado.`);
       setNewUserEmail(''); setNewUserName(''); setNewUserPassword('');
       refreshUsersList();
    }
    setIsCreatingUser(false);
  };

  const handleDeleteUser = async (id: string, email: string) => {
     if (!window.confirm(`Remover definitivamente o acesso de ${email}?`)) return;
     setUserActionMsg('Removendo...');
     const res = await deleteUser(id);
     if (res.error) setUserActionMsg(res.error);
     else { setUserActionMsg('Usuário removido!'); refreshUsersList(); }
     setTimeout(() => setUserActionMsg(''), 5000);
  };

  if (!userRole) {
    return <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white">Carregando painel...</div>;
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50 flex flex-col md:flex-row font-sans">
      <aside className="w-full md:w-72 bg-neutral-900/50 backdrop-blur-xl border-r border-neutral-800 flex flex-col flex-shrink-0 z-10">
        <div className="p-8 border-b border-neutral-800">
          <div className="inline-block mb-3 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-black tracking-widest uppercase">
            {userRole === 'admin' ? 'Administrador' : 'Moderador'}
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">BestCar</h2>
          <p className="text-neutral-500 text-xs truncate max-w-full">{userEmail}</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setActiveTab('vehicles')} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all text-left text-sm font-semibold ${activeTab === 'vehicles' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:bg-neutral-800/50 hover:text-white'}`}>Veículos</button>
          <button onClick={() => setActiveTab('leads')} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all text-left text-sm font-semibold ${activeTab === 'leads' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:bg-neutral-800/50 hover:text-white'}`}>Leads</button>
          
          {userRole === 'admin' && (
            <button onClick={() => setActiveTab('users')} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all text-left text-sm font-semibold ${activeTab === 'users' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:bg-neutral-800/50 hover:text-white'}`}>Contas da Equipe</button>
          )}
        </nav>

        <div className="p-4 border-t border-neutral-800">
          <button onClick={handleLogout} className="w-full py-3 flex items-center justify-center gap-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all text-sm font-bold">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Sair do Sistema
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-12 overflow-y-auto w-full relative z-0">
        <div className="max-w-6xl mx-auto">
          
          {successMsg && (
            <div className="mb-8 bg-emerald-500/10 text-emerald-400 px-5 py-4 rounded-2xl text-sm font-semibold flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
              {successMsg}
            </div>
          )}

          {activeTab === 'vehicles' && (
            <section className="space-y-8 animate-in fade-in duration-500">
               <div className="flex justify-between items-end gap-4">
                  <header>
                    <h1 className="text-4xl font-bold text-white tracking-tight">Estoque de Veículos</h1>
                  </header>
                  <button onClick={openNewVehicleModal} className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 text-white font-bold rounded-xl transition-all">
                    + Adicionar
                  </button>
               </div>
               
               <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 overflow-hidden">
                 {isLoadingVehicles ? <div className="py-20 text-center text-neutral-500">Carregando...</div> : vehicles.length === 0 ? <div className="py-20 text-center text-neutral-500">Nenhum veículo no estoque.</div> : (
                   <div className="overflow-x-auto pb-4">
                     <table className="w-full text-left border-collapse min-w-[600px]">
                      <thead>
                        <tr className="border-b border-neutral-800">
                          <th className="pb-4 font-bold text-neutral-500 uppercase tracking-widest text-xs">Veículo</th>
                          <th className="pb-4 font-bold text-neutral-500 uppercase tracking-widest text-xs">Ano & Preço</th>
                          <th className="pb-4 font-bold text-neutral-500 uppercase tracking-widest text-xs">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800/50">
                        {vehicles.map(v => (
                          <tr key={v.id} className="hover:bg-neutral-800/30">
                            <td className="py-4 flex items-center gap-4">
                              <div className="w-16 h-12 bg-neutral-800/50 border border-neutral-700/50 rounded-lg overflow-hidden shrink-0 relative flex items-center justify-center">
                                {v.image_url ? (
                                  /* eslint-disable-next-line @next/next/no-img-element */
                                  <img src={v.image_url} alt={v.model} className="w-full h-full object-cover" />
                                ) : (
                                  <svg className="w-5 h-5 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                )}
                              </div>
                              <div>
                                <span className="text-white font-bold">{v.brand} {v.model}</span>
                                <br />
                                <span className={`text-[10px] mt-1 inline-block px-2 py-0.5 rounded-full uppercase tracking-widest font-bold ${v.status === 'disponível' ? 'bg-emerald-500/20 text-emerald-400' : v.status === 'reservado' ? 'bg-amber-500/20 text-amber-500' : 'bg-red-500/20 text-red-500'}`}>{v.status}</span>
                              </div>
                            </td>
                            <td className="py-4 font-medium text-neutral-400">{v.year} - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v.price)}</td>
                            <td className="py-4">
                              <div className="flex items-center gap-3">
                                <button onClick={() => openEditVehicleModal(v)} className="text-neutral-400 hover:text-white transition-colors font-semibold">Editar</button>
                                <button onClick={() => handleDeleteVehicle(v.id, v.model)} className="text-red-500 hover:text-red-400 transition-colors font-semibold">Excluir</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                     </table>
                   </div>
                 )}
               </div>
            </section>
          )}

          {activeTab === 'leads' && (
            <section className="space-y-8 animate-in fade-in duration-500">
               <header><h1 className="text-4xl font-bold text-white tracking-tight">Leads</h1></header>
               <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 overflow-hidden">
                 {isLoadingLeads ? <div className="py-20 text-center text-neutral-500">Carregando...</div> : leads.length === 0 ? <div className="py-20 text-center text-neutral-500">Sem leads.</div> : (
                   <div className="overflow-x-auto pb-4">
                     <table className="w-full text-left border-collapse min-w-[500px]">
                        <thead><tr className="border-b border-neutral-800"><th className="pb-4 font-bold text-neutral-500 uppercase tracking-widest text-xs">Lead</th><th className="pb-4 font-bold text-neutral-500 uppercase tracking-widest text-xs">Veículo de Interesse</th><th className="pb-4 font-bold text-neutral-500 uppercase tracking-widest text-xs">Ações</th></tr></thead>
                        <tbody className="divide-y divide-neutral-800/50">
                          {leads.map(l => (
                            <tr key={l.id} className="hover:bg-neutral-800/30">
                              <td className="py-4 font-bold text-white">{l.customer_name}<br /><span className="text-emerald-400 text-sm font-mono mt-1 block">{l.customer_phone}</span></td>
                              <td className="py-4 text-neutral-300">{l.vehicles ? `${l.vehicles.brand} ${l.vehicles.model}` : "Desconhecido"}</td>
                              <td className="py-4">
                                <button onClick={() => handleDeleteLead(l.id, l.customer_name)} className="text-red-500 hover:text-red-400 transition-colors font-semibold text-sm">Excluir</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                     </table>
                   </div>
                 )}
               </div>
            </section>
          )}

          {activeTab === 'users' && userRole === 'admin' && (
            <section className="space-y-8 animate-in fade-in duration-500">
              <header>
                <h1 className="text-4xl font-bold text-white tracking-tight">Equipe</h1>
                <p className="text-neutral-400 mt-2">Crie novos moderadores ou adicione parceiros administrativos.</p>
              </header>

              <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 md:p-10">
                 <h2 className="text-xl font-bold text-white mb-6">Criar Novo Acesso</h2>
                 
                 {userActionMsg && (
                    <div className="mb-6 bg-blue-500/10 border border-blue-500/20 text-blue-400 px-5 py-4 rounded-xl text-sm whitespace-pre-line leading-relaxed">
                      {userActionMsg}
                    </div>
                  )}

                 <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div>
                      <label className="block text-xs font-bold text-neutral-400 uppercase mb-2">Nome</label>
                      <input type="text" required value={newUserName} onChange={e => setNewUserName(e.target.value)} className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:ring-2" placeholder="Ex: Jorge" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-400 uppercase mb-2">E-mail</label>
                      <input type="email" required value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:ring-2" placeholder="nome@empresa.com" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-400 uppercase mb-2">Senha</label>
                      <input type="text" required value={newUserPassword} onChange={e => setNewUserPassword(e.target.value)} className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:ring-2" placeholder="Min. 6 caracteres" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-400 uppercase mb-2">Perfil</label>
                      <select value={newUserRole} onChange={e => setNewUserRole(e.target.value)} className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl px-4 py-3 text-white appearance-none pr-8">
                        <option value="moderador">Moderador</option>
                        <option value="admin">Administrador</option>
                      </select>
                    </div>
                    <div className="md:col-span-2 lg:col-span-4 flex justify-end mt-2">
                      <button type="submit" disabled={isCreatingUser} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all disabled:opacity-50">
                         {isCreatingUser ? 'Adicionando...' : 'Cadastrar na Equipe'}
                      </button>
                    </div>
                 </form>

                 <div className="mt-14 pt-8 border-t border-neutral-800">
                    <h3 className="text-xl font-bold text-white mb-6">Contas Ativas</h3>
                    {isLoadingUsers ? <p className="text-neutral-500">Buscando contas...</p> : (
                       <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead><tr className="border-b border-neutral-800">
                            <th className="pb-4 font-bold text-neutral-500 uppercase tracking-widest text-xs">Usuário</th>
                            <th className="pb-4 font-bold text-neutral-500 uppercase tracking-widest text-xs">Acesso</th>
                            <th className="pb-4 font-bold text-neutral-500 uppercase tracking-widest text-xs">Ações</th></tr></thead>
                          <tbody className="divide-y divide-neutral-800/50">
                            {users.map((u) => (
                              <tr key={u.id} className="hover:bg-neutral-800/30">
                                <td className="py-4 font-medium text-white flex flex-col">
                                   <span>{u.name}</span>
                                   <span className="text-neutral-500 text-xs font-normal">{u.email}</span>
                                </td>
                                <td className="py-4">
                                  <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${u.role === 'admin' ? 'bg-blue-500/20 text-blue-400' : 'bg-neutral-800 text-neutral-400'}`}>{u.role}</span>
                                </td>
                                <td className="py-4">
                                  {u.email !== userEmail && (
                                     <button onClick={() => handleDeleteUser(u.id, u.email || '')} className="text-red-500 hover:text-red-400 text-sm font-bold transition-colors">Excluir Acesso</button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                 </div>
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Vehicle Form Modal */}
      {isVehicleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !isSubmitting && setIsVehicleModalOpen(false)} />
          <div className="relative bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-2xl p-6 md:p-8">
            <h3 className="text-2xl font-bold text-white mb-6">{editingVehicleId ? 'Editar Veículo' : 'Novo Veículo'}</h3>
            {errorMsg && <div className="mb-6 bg-red-500/10 text-red-500 px-4 py-3 rounded-xl text-sm font-medium">{errorMsg}</div>}
            
            <form onSubmit={handleSaveVehicle} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {['Marca', 'Modelo', 'Ano'].map((label, i) => (
                  <div key={label}>
                    <label className="block text-xs font-bold text-neutral-400 uppercase mb-2">{label}</label>
                    <input required type={label === 'Ano' ? 'number' : 'text'} value={i===0?brand:i===1?model:year} onChange={e => i===0?setBrand(e.target.value):i===1?setModel(e.target.value):setYear(e.target.value)} className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl px-4 py-3 text-white" />
                  </div>
                ))}
                <div>
                   <label className="block text-xs font-bold text-neutral-400 uppercase mb-2">Preço Numérico</label>
                   <input required type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl px-4 py-3 text-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase mb-2">Status</label>
                  <select value={status} onChange={e => setStatus(e.target.value)} className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl px-4 py-3 text-white">
                     <option value="disponível">Disponível</option><option value="vendido">Vendido</option><option value="reservado">Reservado</option>
                  </select>
                </div>
                <div>
                   <label className="block text-xs font-bold text-neutral-400 uppercase mb-2">URL Fotografia</label>
                   <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl px-4 py-3 text-white" />
                </div>
              </div>
              <div className="pt-4 border-t border-neutral-800 flex justify-end gap-3">
                 <button type="button" onClick={() => setIsVehicleModalOpen(false)} className="px-6 py-3 bg-neutral-800 text-white font-bold rounded-xl transition-all">Cancelar</button>
                 <button type="submit" disabled={isSubmitting} className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl transition-all">{isSubmitting?'Salvando...':'Salvar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
