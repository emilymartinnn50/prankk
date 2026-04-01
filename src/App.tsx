/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, FormEvent, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, GraduationCap, CheckCircle2, PartyPopper, Users, X, RefreshCw, Trash2, Copy, Check } from 'lucide-react';

export default function App() {
  const [step, setStep] = useState<'form' | 'processing' | 'reveal' | 'admin'>('form');
  const [formData, setFormData] = useState({ name: '', rollNumber: '' });
  const [adminClicks, setAdminClicks] = useState(0);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchSubmissions = async () => {
    setLoadingSubmissions(true);
    try {
      const res = await fetch('/api/submissions');
      const data = await res.json();
      // Store original index for deletion
      const dataWithIndex = data.map((item: any, index: number) => ({ ...item, originalIndex: index }));
      setSubmissions(dataWithIndex.reverse()); // Show newest first
    } catch (err) {
      console.error("Failed to fetch submissions:", err);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm("Are you sure you want to delete ALL submissions? This cannot be undone.")) return;
    try {
      await fetch('/api/submissions', { method: 'DELETE' });
      setSubmissions([]);
    } catch (err) {
      console.error("Failed to delete all submissions:", err);
    }
  };

  const handleDeleteIndividual = async (originalIndex: number) => {
    try {
      await fetch(`/api/submissions/${originalIndex}`, { method: 'DELETE' });
      // Refresh list
      fetchSubmissions();
    } catch (err) {
      console.error("Failed to delete submission:", err);
    }
  };

  const handleCopyAll = () => {
    if (submissions.length === 0) return;
    const text = submissions.map(s => `Name: ${s.name}, Roll: ${s.rollNumber}, Time: ${new Date(s.timestamp).toLocaleString()}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAdminAccess = () => {
    const newCount = adminClicks + 1;
    setAdminClicks(newCount);
    if (newCount >= 5) {
      setStep('admin');
      fetchSubmissions();
      setAdminClicks(0);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.rollNumber) return;
    
    setStep('processing');

    // Submit to backend
    try {
      await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          timestamp: new Date().toISOString()
        })
      });
    } catch (err) {
      console.error("Failed to log submission:", err);
    }

    setTimeout(() => {
      setStep('reveal');
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      <AnimatePresence mode="wait">
        {step === 'form' && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
          >
            <div className="bg-red-600 p-5 sm:p-6 text-white flex items-center gap-3">
              <AlertTriangle className="w-7 h-7 sm:w-8 sm:h-8" />
              <div>
                <h1 className="text-lg sm:text-xl font-bold uppercase tracking-tight">Urgent Notice</h1>
                <p className="text-[10px] sm:text-xs opacity-90">Office of the Registrar</p>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-4 sm:mb-6 text-slate-600">
                <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-[10px] sm:text-sm font-semibold uppercase tracking-widest">University Administration</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-slate-800 leading-tight">
                Campus Closure & Holiday Declaration
              </h2>
              
              <p className="text-slate-600 mb-4 sm:mb-6 text-xs sm:text-sm leading-relaxed">
                Due to unforeseen structural maintenance and administrative upgrades, the University will remain closed for all students for a period of <span className="font-bold text-red-600">2 weeks</span> starting from tomorrow.
              </p>

              <div className="bg-slate-100 p-3 sm:p-4 rounded-lg mb-6 sm:mb-8 border-l-4 border-red-500">
                <p className="text-[10px] text-slate-500 font-medium uppercase mb-1">Action Required</p>
                <p className="text-xs sm:text-sm text-slate-700">
                  Please confirm your details below to receive your digital holiday pass and online assignment schedule.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Full Name</label>
                  <input
                    required
                    type="text"
                    placeholder="Enter your name"
                    className="w-full px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl border border-slate-200 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Roll Number</label>
                  <input
                    required
                    type="text"
                    placeholder="Enter your roll number"
                    className="w-full px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl border border-slate-200 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                    value={formData.rollNumber}
                    onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-slate-900 text-white font-bold py-3.5 sm:py-4 rounded-xl hover:bg-slate-800 transition-colors shadow-lg active:scale-[0.98] text-sm sm:text-base"
                >
                  Confirm & Get Holiday Pass
                </button>
              </form>
            </div>
            <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
              <button 
                onClick={handleAdminAccess}
                className="text-[10px] text-slate-400 uppercase tracking-tighter hover:text-slate-500 transition-colors"
              >
                © 2026 University Administrative Portal • Secure Connection
              </button>
            </div>
          </motion.div>
        )}

        {step === 'processing' && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="text-center space-y-6 w-full max-w-sm px-4"
          >
            <div className="relative w-24 h-24 mx-auto">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-full h-full border-4 border-slate-100 border-t-slate-900 rounded-full"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900 rounded-full scale-75 shadow-lg">
                <span className="text-3xl" role="img" aria-label="April Fool">😂</span>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Processing Registration...</h3>
              <p className="text-slate-500 text-sm">Verifying Roll Number: {formData.rollNumber}</p>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden shadow-inner">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 3 }}
                className="h-full bg-slate-900"
              />
            </div>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest animate-pulse">
              Connecting to University Database...
            </p>
          </motion.div>
        )}

        {step === 'reveal' && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            className="text-center p-6 sm:p-8 bg-white rounded-3xl shadow-2xl border-4 border-yellow-400 w-full max-w-sm sm:max-w-md relative overflow-hidden"
          >
            <div className="mb-4 sm:mb-6 relative">
              <motion.img
                src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6Z3R6Z3R6Z3R6Z3R6Z3R6Z3R6Z3R6Z3R6Z3R6Z3R6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/lszAB3TzFtRa8/giphy.gif"
                alt="Laughing"
                className="w-32 h-32 sm:w-48 sm:h-48 mx-auto rounded-full border-4 border-yellow-400 object-cover"
                referrerPolicy="no-referrer"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-4 border-dashed border-yellow-400 rounded-full pointer-events-none"
              />
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-black text-red-600 mb-3 sm:mb-4 italic tracking-tighter">
              APRIL FOOL!
            </h1>
            
            <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
              <p className="text-xl sm:text-2xl font-bold text-slate-800">
                Dear {formData.name},
              </p>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                There is <span className="font-bold text-slate-900 underline decoration-red-500">NO HOLIDAY</span>. 
                College is open tomorrow at <span className="text-red-600 font-bold">9:30 AM</span> sharp. 
                Don't forget your assignments! 😂
              </p>
            </div>

            <div className="bg-yellow-50 p-3 sm:p-4 rounded-2xl border-2 border-dashed border-yellow-300">
              <p className="text-xs sm:text-sm font-medium text-yellow-700 italic">
                "Padhai likhai karo, IAS-YAS bano!"
              </p>
            </div>

            <button
              onClick={() => setStep('form')}
              className="mt-6 sm:mt-8 text-slate-400 hover:text-slate-600 text-xs sm:text-sm font-medium transition-colors"
            >
              Prank someone else?
            </button>

            {/* Confetti-like elements */}
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ y: -20, x: Math.random() * 400 - 200, opacity: 0 }}
                animate={{ 
                  y: 600, 
                  opacity: [0, 1, 1, 0],
                  rotate: 360 
                }}
                transition={{ 
                  duration: 2 + Math.random() * 2, 
                  repeat: Infinity,
                  delay: Math.random() * 2
                }}
                className={`absolute w-3 h-3 rounded-sm ${
                  ['bg-red-400', 'bg-blue-400', 'bg-yellow-400', 'bg-green-400'][i % 4]
                }`}
                style={{ top: -20, left: '50%' }}
              />
            ))}
          </motion.div>
        )}

        {step === 'admin' && (
          <motion.div
            key="admin"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
          >
            <div className="bg-slate-900 p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6" />
                <h1 className="text-xl font-bold">Prank Victims List</h1>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleCopyAll}
                  title="Copy All"
                  className="p-2 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2 text-xs font-bold"
                >
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy All'}
                </button>
                <button 
                  onClick={handleDeleteAll}
                  title="Delete All"
                  className="p-2 hover:bg-red-900 rounded-lg transition-colors flex items-center gap-2 text-xs font-bold text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All
                </button>
                <button 
                  onClick={fetchSubmissions}
                  className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                  disabled={loadingSubmissions}
                >
                  <RefreshCw className={`w-5 h-5 ${loadingSubmissions ? 'animate-spin' : ''}`} />
                </button>
                <button 
                  onClick={() => setStep('form')}
                  className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {submissions.length === 0 ? (
                <div className="text-center py-12 text-slate-400 space-y-4">
                  <span className="text-6xl block" role="img" aria-label="Empty">📭</span>
                  <p className="font-medium">No victims yet. Share the link to start pranking! 🤡</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {submissions.map((sub, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 group">
                      <div className="flex-1">
                        <p className="font-bold text-slate-800">{sub.name}</p>
                        <p className="text-xs text-slate-500">Roll: {sub.rollNumber}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-[10px] text-slate-400 uppercase font-bold">
                            {new Date(sub.timestamp).toLocaleTimeString()}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {new Date(sub.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                        <button 
                          onClick={() => handleDeleteIndividual(sub.originalIndex)}
                          className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
              <p className="text-xs text-slate-500">
                Total Victims: <span className="font-bold text-slate-900">{submissions.length}</span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
