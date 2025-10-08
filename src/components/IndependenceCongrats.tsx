"use client";

import { useEffect, useState } from "react";
import AppModal from "./AppModal";

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
		} catch {
			// ignore storage errors
		}
	}, []);

	if (!isMounted || !isVisible) return null;

	return (
		<AppModal
			isOpen={isVisible}
			onClose={() => setIsVisible(false)}
			maxWidth="lg"
		>
			<div className="text-center relative">
				<div className="text-sm tracking-widest font-bold text-accent mb-2">1-SENTABR</div>
				<h2 className="text-3xl md:text-4xl font-extrabold mb-3 text-primary">Mustaqillik kuni muborak!</h2>
				<p className="text-neutral mb-6">Erkin savol berishda davom etaylik. Bayramingiz muborak!</p>
				<button
					className="btn px-5 py-3"
					onClick={() => setIsVisible(false)}
				>
					Rahmat!
				</button>
				
				{/* Decorative flags */}
				<div className="absolute -top-5 -left-5 w-14 h-14 rounded-xl rotate-[-8deg] shadow-md overflow-hidden">
					<div className="w-full h-1/3 bg-primary" />
					<div className="w-full h-1/3 bg-white" />
					<div className="w-full h-1/3 bg-secondary" />
				</div>
				<div className="absolute -bottom-5 -right-5 w-14 h-14 rounded-xl rotate-[12deg] shadow-md overflow-hidden">
					<div className="w-full h-1/3 bg-primary" />
					<div className="w-full h-1/3 bg-white" />
					<div className="w-full h-1/3 bg-secondary" />
				</div>
			</div>
		</AppModal>
	);
}

/* Tailwind keyframes (using utility classes via globals.css). If not present, ensure similar classes exist:
   .animate-fade-in { animation: fade-in 300ms ease-out both; }
   .animate-scale-in { animation: scale-in 300ms ease-out both; }
   .animate-bounce-slow{ animation: bounce 2.2s infinite; }
   .animate-bounce-slower{ animation: bounce 2.6s infinite; }
   .animate-bounce-slowest{ animation: bounce 3s infinite; }
*/