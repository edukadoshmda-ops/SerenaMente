import React, { useState } from 'react';
import { X, Heart, QrCode, Copy, Check, Sparkles, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';

const PLANOS = [
  { id: 'mensal', valor: 9.90, label: 'Acolhimento Mensal', desc: 'De R$ 19,90 por R$ 9,90 - Apoio mensal contínuo' },
  { id: 'anual', valor: 97.00, label: 'Transformação Anual ⭐', desc: 'R$ 97,00 (ou até 12x de R$ 9,70 no cartão) • 60% OFF' },
  { id: 'vitalicio', valor: 147.00, label: 'Acesso Vitalício + Bônus', desc: 'R$ 147,00 (ou até 12x de R$ 14,70 no cartão) • Para sempre' },
];

export default function ApoioPixModal({ isOpen, onClose, user }) {
  const [selectedPlan, setSelectedPlan] = useState('mensal');
  const [customValue, setCustomValue] = useState('9.90');
  const [name, setName] = useState(user?.name || '');
  const [cpf, setCpf] = useState('');
  const [loading, setLoading] = useState(false);
  const [pixData, setPixData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan.id);
    setCustomValue(plan.valor.toFixed(2));
    setPixData(null);
    setError('');
  };

  const handleGeneratePix = async (e) => {
    e.preventDefault();
    setError('');

    const cleanCpf = cpf.replace(/\D/g, '');
    if (cleanCpf.length < 11) {
      setError('Por favor, informe um CPF válido (exigência do Banco Central para gerar Pix).');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/create-pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim() || 'Apoiador SerenaMente',
          email: user?.email || 'apoiador@serenamente.app',
          cpfCnpj: cleanCpf,
          value: parseFloat(customValue),
          description: `Apoio SerenaMente - R$ ${customValue}`
        })
      });

      const data = await response.json();

      if (data.payload || data.encodedImage) {
        setPixData(data);
      } else {
        setError(data.error || 'Não foi possível gerar o Pix. Verifique os dados.');
      }
    } catch (err) {
      setError('Erro de conexão ao gerar Pix. O servidor pode estar em deploy.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (pixData?.payload) {
      navigator.clipboard.writeText(pixData.payload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-xl animate-fadeIn">
      <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-t-4xl sm:rounded-4xl p-5 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
              <Heart className="w-5 h-5 fill-rose-500/20" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100">
                Apoiar o SerenaMente via Pix
              </h3>
              <p className="text-xs text-slate-400">Ajude a manter este refúgio 100% gratuito e acolhedor</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-2xl text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Se já gerou o Pix */}
        {pixData ? (
          <div className="space-y-4 text-center py-2 animate-fadeIn">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Pix de R$ {parseFloat(pixData.value).toFixed(2)} Gerado!</span>
            </div>

            {/* Imagem do QR Code */}
            {pixData.encodedImage && (
              <div className="flex justify-center p-3 bg-white rounded-3xl border border-slate-200 max-w-[220px] mx-auto shadow-md">
                <img
                  src={`data:image/png;base64,${pixData.encodedImage}`}
                  alt="QR Code Pix"
                  className="w-full h-auto rounded-2xl"
                />
              </div>
            )}

            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              Abra o app do seu banco, escolha <strong>Pix</strong> e escaneie o QR Code ou copie o código abaixo:
            </p>

            {/* Botão Copia e Cola */}
            <div className="space-y-2">
              <button
                onClick={handleCopy}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2 transition-all active:scale-95"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Código Pix Copiado com Sucesso!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copiar Chave Pix (Copia e Cola)</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setPixData(null)}
                className="text-xs font-semibold text-slate-400 hover:text-slate-600 pt-1"
              >
                ← Escolher outro valor
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-[11px] text-slate-400 flex items-center justify-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Pagamento seguro processado pelo Asaas Pagamentos S.A.</span>
            </div>
          </div>
        ) : (
          /* Formulário de Seleção de Valor */
          <form onSubmit={handleGeneratePix} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                Escolha o valor do seu carinho
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {PLANOS.map((p) => {
                  const isSelected = selectedPlan === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectPlan(p)}
                      className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-300 dark:bg-rose-950/40 dark:border-rose-700 text-rose-900 dark:text-rose-200 shadow-sm'
                          : 'border-slate-200 dark:border-slate-700 hover:border-rose-300 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className="text-sm font-black text-rose-600 dark:text-rose-400">
                        R$ {p.valor.toFixed(2)}
                      </span>
                      <span className="text-xs font-bold leading-tight mt-1">{p.label}</span>
                      <span className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{p.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {error && (
              <div className="p-3 text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 rounded-2xl">
                {error}
              </div>
            )}

            {/* Campos Nome e CPF */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Seu Nome
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nome completo"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Seu CPF (Exigido p/ Pix)
                </label>
                <input
                  type="text"
                  required
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-rose-500/20 flex items-center justify-center space-x-2 transition-all active:scale-95 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Gerando Pix no Asaas...</span>
                </>
              ) : (
                <>
                  <QrCode className="w-4 h-4" />
                  <span>Gerar QR Code Pix de R$ {parseFloat(customValue).toFixed(2)}</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
