import React, { useState, useEffect, useMemo } from 'react';
import {
  Shield,
  Key,
  Lock,
  Unlock,
  DollarSign,
  TrendingUp,
  Users,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Download,
  Plus,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
  Send,
  Trash2,
  Eye,
  EyeOff,
  X,
  CreditCard,
  QrCode,
  Sparkles,
  Phone,
  Mail,
  Calendar,
  AlertCircle
} from 'lucide-react';

const ROOT_PASSWORD_KEY = 'serenamente_root_password';
const ROOT_SESSION_KEY = 'serenamente_root_session';
const DEFAULT_ROOT_PASSWORD = 'root2026';

export default function AdminRootDashboard({ isOpen, onClose }) {
  // Estado de Autenticação Root
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Dados do Dashboard
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState({
    totalReceived: 0,
    totalPending: 0,
    totalOverdue: 0,
    countReceived: 0,
    countPending: 0,
    countOverdue: 0,
    totalSubscribers: 0,
    mrrEstimate: 0
  });
  const [payments, setPayments] = useState([]);
  const [customers, setCustomers] = useState([]);

  // Filtros e Busca
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, RECEIVED, PENDING, OVERDUE
  const [planFilter, setPlanFilter] = useState('ALL'); // ALL, MENSAL, ANUAL, VITALICIO
  const [methodFilter, setMethodFilter] = useState('ALL'); // ALL, PIX, CREDIT_CARD, BOLETO

  // Modais Secundários
  const [isNewChargeOpen, setIsNewChargeOpen] = useState(false);
  const [selectedPix, setSelectedPix] = useState(null); // { payload, encodedImage, paymentId, value }
  const [copiedId, setCopiedId] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });

  // Formulário de Nova Cobrança
  const [newChargeForm, setNewChargeForm] = useState({
    name: '',
    email: '',
    cpfCnpj: '',
    phone: '',
    planType: 'mensal', // mensal, anual, vitalicio, custom
    value: 9.90,
    billingType: 'PIX',
    description: 'Plano Mensal SerenaMente - R$ 9,90'
  });

  // 1. Verificar se já está autenticado na sessão ao abrir
  useEffect(() => {
    if (isOpen) {
      const session = sessionStorage.getItem(ROOT_SESSION_KEY);
      if (session === 'authenticated') {
        setIsAuthenticated(true);
        fetchDashboardData();
      } else {
        setIsAuthenticated(false);
      }
    }
  }, [isOpen]);

  // Obter senha root configurada
  const getStoredRootPassword = () => {
    return localStorage.getItem(ROOT_PASSWORD_KEY) || DEFAULT_ROOT_PASSWORD;
  };

  // Login Root
  const handleRootLogin = (e) => {
    e.preventDefault();
    const correctPassword = getStoredRootPassword();

    if (passwordInput === correctPassword) {
      sessionStorage.setItem(ROOT_SESSION_KEY, 'authenticated');
      setIsAuthenticated(true);
      setAuthError('');
      setPasswordInput('');
      fetchDashboardData();
    } else {
      setAuthError('Chave Master incorreta. Verifique e tente novamente.');
    }
  };

  // Logout Root
  const handleRootLogout = () => {
    sessionStorage.removeItem(ROOT_SESSION_KEY);
    setIsAuthenticated(false);
  };

  // Buscar dados da API
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin-subscriptions');
      const data = await res.json();

      if (data.success) {
        setMetrics(data.metrics || {});
        setPayments(data.payments || []);
        setCustomers(data.customers || []);
      } else {
        showFeedback('Erro ao carregar dados do Asaas', 'error');
      }
    } catch (err) {
      console.error('Falha ao conectar com a API:', err);
      showFeedback('Falha de conexão com o servidor', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Exibir mensagem temporária de feedback
  const showFeedback = (text, type = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage({ text: '', type: '' }), 4000);
  };

  // 2. Ações: Confirmar Recebimento Manual
  const handleConfirmPayment = async (payment) => {
    if (!window.confirm(`Deseja confirmar o recebimento de R$ ${payment.value} de ${payment.customerName}?`)) return;

    setActionLoading(payment.id);
    try {
      const res = await fetch('/api/admin-subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'confirm_payment',
          paymentId: payment.id,
          chargeData: { value: payment.value }
        })
      });
      const data = await res.json();
      if (data.success) {
        showFeedback(`Pagamento de ${payment.customerName} confirmado com sucesso!`);
        fetchDashboardData();
      } else {
        showFeedback(data.error || 'Erro ao confirmar pagamento', 'error');
      }
    } catch (err) {
      showFeedback('Erro de comunicação', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // 3. Ações: Cancelar Cobrança
  const handleDeletePayment = async (payment) => {
    if (!window.confirm(`Tem certeza que deseja cancelar a cobrança ${payment.id} de ${payment.customerName}?`)) return;

    setActionLoading(payment.id);
    try {
      const res = await fetch('/api/admin-subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_payment',
          paymentId: payment.id
        })
      });
      const data = await res.json();
      if (data.success) {
        showFeedback('Cobrança cancelada com sucesso!');
        fetchDashboardData();
      } else {
        showFeedback(data.error || 'Erro ao cancelar cobrança', 'error');
      }
    } catch (err) {
      showFeedback('Erro de comunicação', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // 4. Ações: Ver QR Code Pix
  const handleOpenPixQr = async (payment) => {
    setActionLoading(payment.id);
    try {
      const res = await fetch('/api/admin-subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_pix_qr',
          paymentId: payment.id
        })
      });
      const data = await res.json();
      if (data.success && data.pix) {
        setSelectedPix({
          paymentId: payment.id,
          customerName: payment.customerName,
          value: payment.value,
          payload: data.pix.payload,
          encodedImage: data.pix.encodedImage,
          expirationDate: data.pix.expirationDate
        });
      } else {
        showFeedback('QR Code Pix indisponível para esta cobrança', 'error');
      }
    } catch (err) {
      showFeedback('Erro ao consultar Pix', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // 5. Ações: Criar Nova Cobrança no Asaas
  const handleCreateCharge = async (e) => {
    e.preventDefault();
    setActionLoading('new-charge');

    try {
      const res = await fetch('/api/admin-subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_payment',
          chargeData: newChargeForm
        })
      });
      const data = await res.json();

      if (data.success) {
        showFeedback('Nova cobrança gerada com sucesso no Asaas!');
        setIsNewChargeOpen(false);
        // Reset form
        setNewChargeForm({
          name: '',
          email: '',
          cpfCnpj: '',
          phone: '',
          planType: 'mensal',
          value: 9.90,
          billingType: 'PIX',
          description: 'Plano Mensal SerenaMente - R$ 9,90'
        });
        fetchDashboardData();
      } else {
        showFeedback(data.error || 'Falha ao criar cobrança', 'error');
      }
    } catch (err) {
      showFeedback('Erro ao conectar com o Asaas', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // 6. Enviar Lembrete no WhatsApp
  const handleSendWhatsApp = (payment) => {
    const phone = (payment.customerPhone || '').replace(/\D/g, '');
    const cleanPhone = phone.startsWith('55') ? phone : `55${phone}`;

    const text = encodeURIComponent(
      `Olá, ${payment.customerName}! 🌸\n` +
      `Aqui é da equipe de acolhimento do SerenaMente.\n\n` +
      `Passando para lembrar da sua assinatura do ${payment.planName} no valor de R$ ${Number(payment.value).toFixed(2).replace('.', ',')}.\n\n` +
      `Você pode acessar sua fatura e efetuar o pagamento seguro no link oficial:\n${payment.invoiceUrl || 'https://www.asaas.com'}\n\n` +
      `Se precisar de qualquer ajuda ou suporte, estamos sempre aqui com você!`
    );

    const waUrl = phone.length >= 10 
      ? `https://wa.me/${cleanPhone}?text=${text}`
      : `https://wa.me/?text=${text}`;

    window.open(waUrl, '_blank');
  };

  // 7. Copiar Texto / Chave Pix
  const handleCopyText = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // 8. Exportar Relatório CSV
  const handleExportCSV = () => {
    if (payments.length === 0) {
      showFeedback('Não há dados para exportar', 'error');
      return;
    }

    const headers = [
      'ID Cobranca',
      'Nome do Cliente',
      'Email',
      'Telefone',
      'CPF/CNPJ',
      'Plano',
      'Valor (R$)',
      'Forma de Pagamento',
      'Status',
      'Vencimento',
      'Data de Pagamento',
      'Link da Fatura'
    ];

    const rows = filteredPayments.map(p => [
      `"${p.id}"`,
      `"${p.customerName || ''}"`,
      `"${p.customerEmail || ''}"`,
      `"${p.customerPhone || ''}"`,
      `"${p.customerCpfCnpj || ''}"`,
      `"${p.planName || ''}"`,
      `"${Number(p.value).toFixed(2).replace('.', ',')}"`,
      `"${p.billingType || ''}"`,
      `"${p.status || ''}"`,
      `"${p.dueDate || ''}"`,
      `"${p.paymentDate || ''}"`,
      `"${p.invoiceUrl || ''}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mensalidades-serenamente-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showFeedback('Planilha CSV exportada com sucesso!');
  };

  // Filtragem dos Pagamentos
  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      // Busca por texto
      const search = searchQuery.toLowerCase();
      const matchSearch =
        !searchQuery ||
        (p.customerName && p.customerName.toLowerCase().includes(search)) ||
        (p.customerEmail && p.customerEmail.toLowerCase().includes(search)) ||
        (p.customerCpfCnpj && p.customerCpfCnpj.includes(search)) ||
        (p.id && p.id.toLowerCase().includes(search)) ||
        (p.planName && p.planName.toLowerCase().includes(search));

      // Filtro por Status
      const matchStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'RECEIVED' && (p.status === 'RECEIVED' || p.status === 'CONFIRMED')) ||
        (statusFilter === 'PENDING' && p.status === 'PENDING') ||
        (statusFilter === 'OVERDUE' && p.status === 'OVERDUE');

      // Filtro por Método
      const matchMethod = methodFilter === 'ALL' || p.billingType === methodFilter;

      // Filtro por Plano
      const matchPlan =
        planFilter === 'ALL' ||
        (planFilter === 'MENSAL' && (p.planName.includes('Mensal') || Number(p.value) === 9.9)) ||
        (planFilter === 'ANUAL' && (p.planName.includes('Anual') || Number(p.value) === 97)) ||
        (planFilter === 'VITALICIO' && (p.planName.includes('Vitalício') || Number(p.value) === 147));

      return matchSearch && matchStatus && matchMethod && matchPlan;
    });
  }, [payments, searchQuery, statusFilter, methodFilter, planFilter]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      
      {/* TELA DE AUTENTICAÇÃO ROOT */}
      {!isAuthenticated ? (
        <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 overflow-hidden text-center">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-teal-500 p-0.5 mx-auto mb-4 shadow-xl shadow-purple-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[22px] flex items-center justify-center">
              <Shield className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>

          <span className="text-[10px] uppercase font-extrabold tracking-widest px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            Acesso Restrito
          </span>

          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-3">
            Painel Root SerenaMente
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6">
            Digite sua chave master de administração para acessar o controle de mensalidades e assinantes.
          </p>

          <form onSubmit={handleRootLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Chave Master / Senha Root
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => { setPasswordInput(e.target.value); setAuthError(''); }}
                  placeholder="Digite a senha master..."
                  autoFocus
                  required
                  className="w-full pl-10 pr-10 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {authError && (
                <p className="text-xs text-rose-500 font-medium mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {authError}
                </p>
              )}
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Voltar
              </button>
              <button
                type="submit"
                className="w-2/3 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs shadow-lg shadow-purple-500/25 transition-all flex items-center justify-center gap-1.5"
              >
                <Unlock className="w-4 h-4" />
                <span>Entrar no Painel</span>
              </button>
            </div>

            <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 pt-2">
              Dica: A senha padrão inicial de fábrica é <code className="font-mono text-purple-600 dark:text-purple-400">root2026</code>
            </p>
          </form>
        </div>
      ) : (
        /* PAINEL ROOT PRINCIPAL */
        <div className="relative w-full max-w-6xl max-h-[92vh] bg-white dark:bg-slate-900 rounded-3xl sm:rounded-4xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-fadeIn">
          
          {/* TOPO / HEADER DO PAINEL */}
          <div className="px-5 sm:px-8 py-4 sm:py-5 bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-900/40 shrink-0">
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-500 p-0.5 shadow-lg shadow-purple-500/30 flex items-center justify-center shrink-0">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <Shield className="w-5 h-5 text-purple-300" />
                </div>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">
                    Painel Root SerenaMente
                  </h2>
                  <span className="text-[9px] uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded-full bg-purple-500/30 border border-purple-400/40 text-purple-200">
                    Admin Master
                  </span>
                </div>
                <div className="flex items-center space-x-3 text-xs text-slate-300 mt-0.5">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Asaas Produção Conectado
                  </span>
                  <span>•</span>
                  <span>{payments.length} mensalidades registradas</span>
                </div>
              </div>
            </div>

            {/* Ações do Topo */}
            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={fetchDashboardData}
                disabled={loading}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-1.5"
                title="Atualizar dados do Asaas"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Atualizar</span>
              </button>

              <button
                onClick={() => setIsNewChargeOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 text-white text-xs font-extrabold shadow-md shadow-emerald-500/25 transition-all flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nova Cobrança</span>
              </button>

              <button
                onClick={handleRootLogout}
                className="p-2 rounded-xl bg-white/10 hover:bg-rose-500/30 text-slate-300 hover:text-white transition-colors"
                title="Sair do Root / Bloquear"
              >
                <Lock className="w-4 h-4" />
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
                title="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* MENSAGEM TEMPORÁRIA DE FEEDBACK */}
          {statusMessage.text && (
            <div className={`px-6 py-2.5 text-xs font-bold text-center transition-all ${
              statusMessage.type === 'error' 
                ? 'bg-rose-500 text-white' 
                : 'bg-emerald-500 text-white'
            }`}>
              {statusMessage.text}
            </div>
          )}

          {/* CORPO DO PAINEL (SCROLL) */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-slate-50/50 dark:bg-slate-900/50">
            
            {/* CARDS DE MÉTRICAS (KPIs) */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
              
              {/* Card 1: Faturamento Recebido */}
              <div className="p-4 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Recebido</span>
                  <div className="w-7 h-7 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                  R$ {metrics.totalReceived.toFixed(2).replace('.', ',')}
                </div>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                  {metrics.countReceived} pagamentos confirmados
                </p>
              </div>

              {/* Card 2: MRR Estimado */}
              <div className="p-4 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Recorrência (MRR)</span>
                  <div className="w-7 h-7 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                  R$ {metrics.mrrEstimate.toFixed(2).replace('.', ',')}<span className="text-xs font-normal text-slate-400">/mês</span>
                </div>
                <p className="text-[10px] text-purple-600 dark:text-purple-400 font-bold">
                  Base R$ 9,90/mês
                </p>
              </div>

              {/* Card 3: Total de Assinantes */}
              <div className="p-4 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Clientes Asaas</span>
                  <div className="w-7 h-7 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                  {metrics.totalSubscribers}
                </div>
                <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">
                  Base de usuários cadastrados
                </p>
              </div>

              {/* Card 4: Pendentes */}
              <div className="p-4 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Aguardando Pix</span>
                  <div className="w-7 h-7 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                  R$ {metrics.totalPending.toFixed(2).replace('.', ',')}
                </div>
                <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                  {metrics.countPending} faturas em aberto
                </p>
              </div>

              {/* Card 5: Atrasadas */}
              <div className="col-span-2 lg:col-span-1 p-4 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Atrasadas</span>
                  <div className="w-7 h-7 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-lg sm:text-xl font-extrabold text-rose-600 dark:text-rose-400">
                  R$ {metrics.totalOverdue.toFixed(2).replace('.', ',')}
                </div>
                <p className="text-[10px] text-rose-600 font-bold">
                  {metrics.countOverdue} faturas vencidas
                </p>
              </div>
            </div>

            {/* BARRA DE FILTROS E BUSCA */}
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              
              {/* Campo de Busca */}
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por nome, e-mail, CPF ou ID da cobrança..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              </div>

              {/* Filtros em Linha */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Filtro Status */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold focus:outline-none"
                >
                  <option value="ALL">Status: Todos</option>
                  <option value="RECEIVED">🟢 Pagos / Recebidos</option>
                  <option value="PENDING">🟡 Aguardando Pagamento</option>
                  <option value="OVERDUE">🔴 Atrasados</option>
                </select>

                {/* Filtro Plano */}
                <select
                  value={planFilter}
                  onChange={(e) => setPlanFilter(e.target.value)}
                  className="px-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold focus:outline-none"
                >
                  <option value="ALL">Planos: Todos</option>
                  <option value="MENSAL">Mensal (R$ 9,90)</option>
                  <option value="ANUAL">Anual (R$ 97,00)</option>
                  <option value="VITALICIO">Vitalício (R$ 147,00)</option>
                </select>

                {/* Filtro Método */}
                <select
                  value={methodFilter}
                  onChange={(e) => setMethodFilter(e.target.value)}
                  className="px-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold focus:outline-none"
                >
                  <option value="ALL">Método: Todos</option>
                  <option value="PIX">PIX</option>
                  <option value="CREDIT_CARD">Cartão de Crédito</option>
                  <option value="BOLETO">Boleto Bancário</option>
                </select>

                {/* Botão Exportar CSV */}
                <button
                  onClick={handleExportCSV}
                  className="px-3 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5"
                  title="Baixar planilha Excel / CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>CSV</span>
                </button>
              </div>
            </div>

            {/* TABELA DE MENSALIDADES */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-700/60 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                      <th className="py-3.5 px-4">Assinante / Usuário</th>
                      <th className="py-3.5 px-3">Plano</th>
                      <th className="py-3.5 px-3">Valor</th>
                      <th className="py-3.5 px-3">Forma</th>
                      <th className="py-3.5 px-3">Vencimento</th>
                      <th className="py-3.5 px-3">Status</th>
                      <th className="py-3.5 px-4 text-right">Ações Rápidas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/40 text-xs">
                    {filteredPayments.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400">
                          {loading ? (
                            <div className="flex flex-col items-center justify-center space-y-2">
                              <RefreshCw className="w-6 h-6 animate-spin text-purple-500" />
                              <span>Carregando mensalidades do Asaas...</span>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <p className="font-bold text-slate-600 dark:text-slate-300">Nenhuma mensalidade encontrada</p>
                              <p className="text-[11px]">Tente ajustar os filtros ou clique em "Nova Cobrança" para registrar um assinante.</p>
                            </div>
                          )}
                        </td>
                      </tr>
                    ) : (
                      filteredPayments.map((payment) => {
                        const isPaid = payment.status === 'RECEIVED' || payment.status === 'CONFIRMED';
                        const isOverdue = payment.status === 'OVERDUE';
                        const isPending = payment.status === 'PENDING';

                        return (
                          <tr key={payment.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
                            
                            {/* Assinante */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center space-x-2.5">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                                  {(payment.customerName || 'U').charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-bold text-slate-900 dark:text-white truncate">
                                    {payment.customerName}
                                  </div>
                                  <div className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                                    <span>{payment.customerEmail}</span>
                                    {payment.customerPhone !== '—' && (
                                      <>
                                        <span>•</span>
                                        <span>{payment.customerPhone}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Plano */}
                            <td className="py-3.5 px-3">
                              <span className="font-semibold text-slate-700 dark:text-slate-200">
                                {payment.planName}
                              </span>
                            </td>

                            {/* Valor */}
                            <td className="py-3.5 px-3">
                              <span className="font-extrabold text-slate-900 dark:text-white">
                                R$ {Number(payment.value).toFixed(2).replace('.', ',')}
                              </span>
                            </td>

                            {/* Forma */}
                            <td className="py-3.5 px-3">
                              <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700/60 font-bold text-[10px] text-slate-600 dark:text-slate-300">
                                {payment.billingType}
                              </span>
                            </td>

                            {/* Vencimento */}
                            <td className="py-3.5 px-3">
                              <div className="font-medium text-slate-600 dark:text-slate-300">
                                {payment.dueDate ? payment.dueDate.split('-').reverse().join('/') : '—'}
                              </div>
                              {isOverdue && (
                                <span className="text-[10px] text-rose-500 font-extrabold">Vencida</span>
                              )}
                            </td>

                            {/* Status */}
                            <td className="py-3.5 px-3">
                              {isPaid && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 font-extrabold text-[10px]">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Pago
                                </span>
                              )}
                              {isPending && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 font-extrabold text-[10px]">
                                  <Clock className="w-3 h-3" />
                                  Aguardando
                                </span>
                              )}
                              {isOverdue && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 font-extrabold text-[10px]">
                                  <AlertTriangle className="w-3 h-3" />
                                  Atrasado
                                </span>
                              )}
                              {!isPaid && !isPending && !isOverdue && (
                                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-[10px]">
                                  {payment.status}
                                </span>
                              )}
                            </td>

                            {/* Ações */}
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end space-x-1.5">
                                
                                {/* WhatsApp Lembrete */}
                                <button
                                  onClick={() => handleSendWhatsApp(payment)}
                                  className="p-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 transition-colors"
                                  title="Enviar Lembrete no WhatsApp"
                                >
                                  <Send className="w-3.5 h-3.5" />
                                </button>

                                {/* Ver QR Code Pix */}
                                {payment.billingType === 'PIX' && !isPaid && (
                                  <button
                                    onClick={() => handleOpenPixQr(payment)}
                                    disabled={actionLoading === payment.id}
                                    className="p-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 hover:bg-purple-100 transition-colors"
                                    title="Ver QR Code Pix & Código Copia e Cola"
                                  >
                                    <QrCode className="w-3.5 h-3.5" />
                                  </button>
                                )}

                                {/* Link Oficial Asaas */}
                                {payment.invoiceUrl && (
                                  <a
                                    href={payment.invoiceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 transition-colors"
                                    title="Abrir fatura oficial no Asaas"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </a>
                                )}

                                {/* Confirmar Manualmente */}
                                {!isPaid && (
                                  <button
                                    onClick={() => handleConfirmPayment(payment)}
                                    disabled={actionLoading === payment.id}
                                    className="p-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 hover:bg-teal-100 transition-colors"
                                    title="Marcar como Pago / Recebido Manualmente"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                )}

                                {/* Excluir / Cancelar */}
                                <button
                                  onClick={() => handleDeletePayment(payment)}
                                  disabled={actionLoading === payment.id}
                                  className="p-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-colors"
                                  title="Cancelar Cobrança"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* RODAPÉ DO PAINEL */}
          <div className="px-6 py-3 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between shrink-0">
            <span className="flex items-center gap-1.5 font-medium">
              <Shield className="w-3.5 h-3.5 text-purple-500" />
              Sessão Root Segura • Modo Administrador Ativo
            </span>
            <span className="text-[11px]">
              Exibindo <strong>{filteredPayments.length}</strong> de <strong>{payments.length}</strong> mensalidades
            </span>
          </div>
        </div>
      )}

      {/* MODAL: NOVA COBRANÇA / NOVO ASSINANTE */}
      {isNewChargeOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Lançar Nova Cobrança no Asaas
                  </h3>
                  <p className="text-[11px] text-slate-400">Gere mensalidades ou assinaturas em tempo real</p>
                </div>
              </div>
              <button
                onClick={() => setIsNewChargeOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCharge} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nome Completo do Assinante *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: João Silva"
                  value={newChargeForm.name}
                  onChange={(e) => setNewChargeForm({ ...newChargeForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    E-mail do Assinante *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="cliente@email.com"
                    value={newChargeForm.email}
                    onChange={(e) => setNewChargeForm({ ...newChargeForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    WhatsApp / Telefone
                  </label>
                  <input
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={newChargeForm.phone}
                    onChange={(e) => setNewChargeForm({ ...newChargeForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  CPF ou CNPJ
                </label>
                <input
                  type="text"
                  placeholder="000.000.000-00"
                  value={newChargeForm.cpfCnpj}
                  onChange={(e) => setNewChargeForm({ ...newChargeForm, cpfCnpj: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Seleção de Plano */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setNewChargeForm({
                    ...newChargeForm,
                    planType: 'mensal',
                    value: 9.90,
                    description: 'Plano Mensal SerenaMente - R$ 9,90'
                  })}
                  className={`p-2.5 rounded-2xl border text-center transition-all ${
                    newChargeForm.planType === 'mensal'
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-extrabold'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <p className="text-[10px] uppercase font-bold">Mensal</p>
                  <p className="text-sm font-extrabold">R$ 9,90</p>
                </button>

                <button
                  type="button"
                  onClick={() => setNewChargeForm({
                    ...newChargeForm,
                    planType: 'anual',
                    value: 97.00,
                    description: 'Plano Anual SerenaMente - R$ 97,00'
                  })}
                  className={`p-2.5 rounded-2xl border text-center transition-all ${
                    newChargeForm.planType === 'anual'
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-extrabold'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <p className="text-[10px] uppercase font-bold">Anual</p>
                  <p className="text-sm font-extrabold">R$ 97,00</p>
                </button>

                <button
                  type="button"
                  onClick={() => setNewChargeForm({
                    ...newChargeForm,
                    planType: 'vitalicio',
                    value: 147.00,
                    description: 'Plano Vitalício SerenaMente - R$ 147,00'
                  })}
                  className={`p-2.5 rounded-2xl border text-center transition-all ${
                    newChargeForm.planType === 'vitalicio'
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-extrabold'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <p className="text-[10px] uppercase font-bold">Vitalício</p>
                  <p className="text-sm font-extrabold">R$ 147,00</p>
                </button>
              </div>

              {/* Forma de Pagamento */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Forma de Cobrança
                </label>
                <div className="flex gap-2">
                  {['PIX', 'CREDIT_CARD', 'BOLETO'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setNewChargeForm({ ...newChargeForm, billingType: type })}
                      className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-all ${
                        newChargeForm.billingType === type
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewChargeOpen(false)}
                  className="w-1/3 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === 'new-charge'}
                  className="w-2/3 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5"
                >
                  {actionLoading === 'new-charge' ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Gerar no Asaas Agora</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: QR CODE PIX & CÓDIGO COPIA E COLA */}
      {selectedPix && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 text-center space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300">
                PIX Oficial Asaas
              </span>
              <button
                onClick={() => setSelectedPix(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                {selectedPix.customerName}
              </h4>
              <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                R$ {Number(selectedPix.value).toFixed(2).replace('.', ',')}
              </p>
            </div>

            {/* Imagem do QR Code */}
            {selectedPix.encodedImage ? (
              <div className="w-48 h-48 mx-auto p-2 bg-white rounded-2xl shadow-inner border border-slate-200 flex items-center justify-center">
                <img
                  src={`data:image/png;base64,${selectedPix.encodedImage}`}
                  alt="QR Code Pix"
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="w-48 h-48 mx-auto p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-xs text-slate-400">
                QR Code não disponível
              </div>
            )}

            {/* Pix Copia e Cola */}
            {selectedPix.payload && (
              <div className="space-y-1.5 text-left">
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400">
                  Código Pix Copia e Cola:
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    readOnly
                    value={selectedPix.payload}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-mono text-slate-700 dark:text-slate-300"
                  />
                  <button
                    onClick={() => handleCopyText(selectedPix.payload, 'pix-payload')}
                    className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all flex items-center gap-1"
                  >
                    {copiedId === 'pix-payload' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={() => setSelectedPix(null)}
              className="w-full py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 font-bold text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
