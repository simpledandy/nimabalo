"use client";

import { useEffect, useState } from "react";

function getTodayKey(): string {
	const now = new Date();
	const y = now.getFullYear();
	const m = String(now.getMonth() + 1).padStart(2, "0");
	const d = String(now.getDate()).padStart(2, "0");
	return `${y}-${m}-${d}`;
}

export default function IndependenceCongrats() {
	const [isVisible, setIsVisible] = useState(false);
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);
		const now = new Date();
		// Show only on September 1st
		const isIndependenceDay = now.getMonth() === 8 && now.getDate() === 1;
		if (!isIndependenceDay) return;

		try {
			const key = `independence-shown-${getTodayKey()}`;
			const shown = typeof window !== "undefined" ? window.localStorage.getItem(key) : null;
			if (!shown) {
				setIsVisible(true);
				window.localStorage.setItem(key, "1");
			}
		} catch (_) {
			// ignore storage errors
		}
	}, []);

	if (!isMounted || !isVisible) return null;

	return (
		<div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
			{/* Backdrop */}
			<div className="absolute inset-0 bg-gradient-to-b from-sky-900/60 to-sky-700/60 backdrop-blur-sm animate-fade-in" />
			{/* Fireworks-like confetti circles */}
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<div className="absolute w-3 h-3 bg-amber-300 rounded-full animate-bounce-slow left-[15%] top-[20%]" />
				<div className="absolute w-2 h-2 bg-rose-300 rounded-full animate-bounce-slower left-[70%] top-[25%]" />
				<div className="absolute w-4 h-4 bg-emerald-300 rounded-full animate-bounce-slowest left-[40%] top-[10%]" />
				<div className="absolute w-2.5 h-2.5 bg-sky-300 rounded-full animate-bounce-slow right-[15%] bottom-[20%]" />
				<div className="absolute w-3.5 h-3.5 bg-fuchsia-300 rounded-full animate-bounce-slower right-[35%] bottom-[10%]" />
			</div>
			{/* Card */}
			<div className="relative mx-auto max-w-lg w-full">
				<div className="relative bg-white rounded-2xl shadow-2xl px-8 py-10 text-center animate-scale-in">
					<div className="text-sm tracking-widest font-bold text-sky-600 mb-2">1-SENTABR</div>
					<h2 className="text-3xl md:text-4xl font-extrabold mb-3" style={{color:'#0C4A6E'}}>Mustaqillik kuni muborak!</h2>
					<p className="text-sky-700/80 mb-6">Erkin savol berishda davom etaylik. Bayramingiz muborak!</p>
					<button
						className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold shadow-md transition-all"
						onClick={() => setIsVisible(false)}
					>
						Rahmat!
					</button>

					{/* Decorative flags */}
					<div className="absolute -top-5 -left-5 w-14 h-14 rounded-xl rotate-[-8deg] shadow-md overflow-hidden">
						<div className="w-full h-1/3 bg-sky-500" />
						<div className="w-full h-1/3 bg-white" />
						<div className="w-full h-1/3 bg-emerald-500" />
					</div>
					<div className="absolute -bottom-5 -right-5 w-14 h-14 rounded-xl rotate-[12deg] shadow-md overflow-hidden">
						<div className="w-full h-1/3 bg-sky-500" />
						<div className="w-full h-1/3 bg-white" />
						<div className="w-full h-1/3 bg-emerald-500" />
					</div>
				</div>
			</div>
		</div>
	);
}

/* Tailwind keyframes (using utility classes via globals.css). If not present, ensure similar classes exist:
   .animate-fade-in { animation: fade-in 300ms ease-out both; }
   .animate-scale-in { animation: scale-in 300ms ease-out both; }
   .animate-bounce-slow{ animation: bounce 2.2s infinite; }
   .animate-bounce-slower{ animation: bounce 2.6s infinite; }
   .animate-bounce-slowest{ animation: bounce 3s infinite; }
*/


