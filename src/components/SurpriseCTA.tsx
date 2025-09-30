"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { strings } from '@/lib/strings';

const surprises = strings.surprise.surprises.map(surprise => ({
	...surprise,
	cta: { label: surprise.cta, href: "/auth" }
}));

export default function SurpriseCTA() {
	const [open, setOpen] = useState(false);
	const [mounted, setMounted] = useState(false);
	const surprise = useMemo(() => surprises[Math.floor(Math.random() * surprises.length)], []);

	useEffect(() => { setMounted(true); }, []);

	return (
		<>
			<button className="btn-secondary text-base sm:text-lg text-center px-4 py-2 sm:px-6 sm:py-3" onClick={() => setOpen(true)}>
				<span className="hidden sm:inline">{strings.surpriseCTA.button}</span>
				<span className="sm:hidden">{strings.surpriseCTA.buttonMobile}</span>
			</button>
			{open && mounted && createPortal(
				<div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
					<div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setOpen(false)} />
					<div className="relative mx-auto max-w-md w-full">
						<div className="relative bg-white rounded-2xl shadow-2xl px-6 sm:px-8 py-8 sm:py-10 text-center animate-scale-in">
							<h3 className="text-xl sm:text-2xl font-extrabold mb-2 text-primary">{surprise.title}</h3>
							<p className="text-sm sm:text-base text-neutral mb-6">{surprise.message}</p>
							<div className="flex flex-col sm:flex-row items-center justify-center gap-3">
								<a href={surprise.cta.href} className="btn w-full sm:w-auto px-6 py-3 text-base sm:text-lg">{surprise.cta.label}</a>
								<button className="btn-secondary w-full sm:w-auto px-6 py-3 text-base sm:text-lg" onClick={() => setOpen(false)}>{strings.surpriseCTA.later}</button>
							</div>
							{/* playful confetti */}
							<div className="pointer-events-none absolute inset-0 overflow-hidden">
								<div className="absolute w-3 h-3 bg-warm rounded-full animate-bounce-slow left-[12%] top-[18%]" />
								<div className="absolute w-2 h-2 bg-warm/80 rounded-full animate-bounce-slower left-[75%] top-[22%]" />
								<div className="absolute w-4 h-4 bg-accent rounded-full animate-bounce-slowest left-[38%] top-[8%]" />
								<div className="absolute w-2.5 h-2.5 bg-secondary rounded-full animate-bounce-slow right-[12%] bottom-[18%]" />
								<div className="absolute w-3.5 h-3.5 bg-accent/80 rounded-full animate-bounce-slower right-[35%] bottom-[10%]" />
							</div>
						</div>
					</div>
				</div>,
				document.body
			)}
		</>
	);
}


