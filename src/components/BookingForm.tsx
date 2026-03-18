import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

export default function BookingForm() {
    const formTopRef = useRef<HTMLDivElement>(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form Fields
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [zipCode, setZipCode] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (isSuccess && formTopRef.current) {
            formTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [isSuccess]);

    const validateForm = () => {
        return !!(firstName && lastName && email && phone && zipCode);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm() || isSubmitting) return;

        setIsSubmitting(true);
        setErrorMessage('');

        try {
            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ firstName, lastName, email, phone, zipCode }),
            });

            if (!response.ok) {
                const data = await response.json().catch(() => null);
                throw new Error(data?.error || 'Unable to submit your request right now.');
            }

            setIsSuccess(true);
        } catch (error: any) {
            setErrorMessage(
                error?.message || 'Unable to submit your request right now.',
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div ref={formTopRef} className="bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col h-full border border-secondary/5 font-sans relative min-h-[500px]">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20 opacity-50"></div>

            <AnimatePresence mode="wait">
                {isSuccess ? (
                    <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex-grow flex flex-col items-center justify-center text-center p-6 h-full">
                        <div className="relative mb-4">
                            <div className="text-6xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary/10 select-none pointer-events-none whitespace-nowrap" style={{ fontFamily: '"Permanent Marker", cursive' }}>Yay!</div>
                            <div className="relative z-10 bg-green-50 rounded-full p-4 inline-block mx-auto shadow-sm">
                                <CheckCircle2 className="w-12 h-12 text-primary" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-secondary mb-2">Quote Request Sent!</h2>
                        <p className="text-slate-500 mb-6 font-medium">Thanks {firstName}, we'll be in touch within 10 minutes.</p>
                        <button onClick={() => window.location.reload()} className="bg-primary text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:opacity-90 transition-all">Done</button>
                    </motion.div>
                ) : (
                    <motion.div key="form" exit={{ opacity: 0, y: -10 }} className="p-6 md:p-8 flex-grow flex flex-col">
                        <div className="mb-8 text-center md:text-left">
                            <h3 className="text-2xl md:text-3xl font-bold text-secondary">Get a Free Quote</h3>
                            <p className="text-slate-500 mt-2 font-medium">We'll be in touch within 10 minutes.</p>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4 flex-grow">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First Name" className="w-full p-4 rounded-xl bg-slate/5 border-2 border-transparent focus:border-primary/20 focus:bg-white focus:ring-0 transition-all outline-none" />
                                <input type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last Name" className="w-full p-4 rounded-xl bg-slate/5 border-2 border-transparent focus:border-primary/20 focus:bg-white focus:ring-0 transition-all outline-none" />
                                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email Address" className="w-full p-4 rounded-xl bg-slate/5 border-2 border-transparent focus:border-primary/20 focus:bg-white focus:ring-0 transition-all md:col-span-2 outline-none" />
                                <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone Number" className="w-full p-4 rounded-xl bg-slate/5 border-2 border-transparent focus:border-primary/20 focus:bg-white focus:ring-0 transition-all outline-none" />
                                <input type="text" required value={zipCode} onChange={(e) => setZipCode(e.target.value)} placeholder="Zip Code" className="w-full p-4 rounded-xl bg-slate/5 border-2 border-transparent focus:border-primary/20 focus:bg-white focus:ring-0 transition-all outline-none" />
                            </div>
                            {errorMessage && (
                                <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                                    {errorMessage}
                                </p>
                            )}
                            <div className="mt-8">
                                <button type="submit" disabled={isSubmitting || !validateForm()} className="w-full bg-primary text-white py-4 rounded-xl font-bold shadow-lg shadow-primary/20 disabled:opacity-50 disabled:shadow-none hover:bg-primary/90 transition-all transform active:scale-[0.98] text-lg">
                                    {isSubmitting ? 'Submitting...' : 'Submit'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
