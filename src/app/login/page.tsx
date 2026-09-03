"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, Lock, Mail, ArrowRight, CheckCircle, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    setTimeout(() => {
      setLoading(false);
      
      // Save authenticated user in localStorage
      const userSession = {
        email,
        fullName: fullName || email.split("@")[0],
        authenticatedAt: new Date().toISOString(),
      };
      localStorage.setItem("cb_authenticated_user", JSON.stringify(userSession));

      setMessage({
        type: "success",
        text: isSignUp ? "Account created successfully! Redirecting to Dashboard..." : "Authentication successful! Redirecting...",
      });

      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#080b11]">
      <div className="glass-card max-w-md w-full p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-indigo-600/20 rounded-full blur-3xl"></div>

        <div className="text-center mb-8 relative">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-emerald-400 p-0.5 mx-auto mb-3 shadow-lg shadow-blue-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Activity className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Coinbase Quant Bot</h1>
          <p className="text-xs text-slate-400 mt-1">
            {isSignUp ? "Create your Quant Trader Account" : "Secure Sign In to Automated Trading Portal"}
          </p>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-xl text-xs font-medium flex items-center gap-2 border ${
              message.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-rose-500/10 border-rose-500/30 text-rose-400"
            }`}
          >
            <CheckCircle className="w-4 h-4 shrink-0" />
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 relative">
          {isSignUp && (
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Full Name</label>
              <div className="relative">
                <ShieldCheck className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jose Jimenez"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white outline-none transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="josejimenezmorales@hotmail.com"
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer mt-2"
          >
            {loading ? "Authenticating..." : isSignUp ? "Create Account & Access" : "Access Dashboard"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-slate-400">
            {isSignUp ? "Already have an account?" : "Need a new account?"}
          </span>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setMessage(null);
            }}
            className="text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
          >
            {isSignUp ? "Sign In" : "Register Account"}
          </button>
        </div>
      </div>
    </div>
  );
}
