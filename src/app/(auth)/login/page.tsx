'use client';

import { authenticate } from '@/app/actions/auth';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Wallet, Mail, Lock, ArrowRight } from 'lucide-react';

export default function LoginPage() {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 relative overflow-hidden selection:bg-blue-500/30">
            {/* Background Pattern */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-blue-500/5 rounded-full blur-3xl" />
                <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] bg-cyan-500/5 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md p-4">
                {/* Card */}
                <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="p-8 pb-0 text-center">
                        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 mb-6 group">
                            <Wallet className="w-8 h-8 text-white group-hover:scale-110 transition-transform duration-300" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">
                            Control Gastos
                        </h1>
                        <p className="text-slate-400 text-sm">
                            Gestiona tus finanzas personales de forma inteligente
                        </p>
                    </div>

                    <div className="p-8">
                        <LoginForm />
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-slate-600 text-xs mt-8">
                    &copy; {new Date().getFullYear()} Control Gastos. Todos los derechos reservados.
                </p>
            </div>
        </div>
    );
}

function LoginForm() {
    const [errorMessage, dispatch, isPending] = useActionState(authenticate, undefined);

    return (
        <form action={dispatch} className="space-y-5">
            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-300 ml-1" htmlFor="username">
                        Usuario
                    </label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                        </div>
                        <input
                            className="block w-full rounded-xl border border-white/10 bg-slate-950/50 py-3 pl-10 text-sm text-white placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                            id="username"
                            type="text"
                            name="username"
                            placeholder="Nombre de usuario"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-300 ml-1" htmlFor="password">
                        Contraseña
                    </label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                        </div>
                        <input
                            className="block w-full rounded-xl border border-white/10 bg-slate-950/50 py-3 pl-10 text-sm text-white placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                            id="password"
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            required
                            minLength={6}
                        />
                    </div>
                </div>
            </div>

            <LoginButton />

            <div
                className="flex h-6 items-end space-x-1"
                aria-live="polite"
                aria-atomic="true"
            >
                {errorMessage && (
                    <p className="text-xs text-red-400 bg-red-500/10 px-3 py-1 rounded-lg w-full text-center border border-red-500/20">
                        {errorMessage}
                    </p>
                )}
            </div>
        </form>
    );
}

function LoginButton() {
    const { pending } = useFormStatus();

    return (
        <button
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white p-3 rounded-xl font-medium shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
            aria-disabled={pending}
            disabled={pending}
        >
            {pending ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            {!pending && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
        </button>
    );
}
