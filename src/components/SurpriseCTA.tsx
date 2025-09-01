"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

const surprises = [
	{
		title: "Syurpriz kerakmi?",
		message: "Qiziquvchilarga javob topishda yordam bering, keyin his qilasiz!",
		cta: { label: "Ketdik", href: "/auth" },
	},
	{
		title: "Qiziqmi?",
		message: "Har kuni bitta yangi narsani o‘rgating. Birinchi bo‘lib javob bering!",
		cta: { label: "Boshla", href: "/auth" },
	},
	{
		title: "Keling, kashf qilamiz!",
		message: "O‘zingizga xos javob ulashing, fikringizni dunyo eshitsin!",
		cta: { label: "Qani", href: "/auth" },
	},
	{
		title: "Bir oz sehr?",
		message: "Odamlarga yordam berishga tayyormisiz?",
		cta: { label: "Ko‘raylikchi", href: "/auth" },
	},
];

export default function SurpriseCTA() {
	const [open, setOpen] = useState(false);
	const [mounted, setMounted] = useState(false);
	const surprise = useMemo(() => surprises[Math.floor(Math.random() * surprises.length)], []);

	useEffect(() => { setMounted(true); }, []);

	return (
		<>
			<button className="btn-secondary text-lg text-center" onClick={() => setOpen(true)}>Savollarga javoblaringiz bormi?</button>
			{open && mounted && createPortal(
				<div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
					<div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setOpen(false)} />
					<div className="relative mx-auto max-w-md w-full">
						<div className="relative bg-white rounded-2xl shadow-2xl px-8 py-10 text-center animate-scale-in">
							<h3 className="text-2xl font-extrabold mb-2" style={{color:'#0C4A6E'}}>{surprise.title}</h3>
							<p className="text-sky-700/80 mb-6">{surprise.message}</p>
							<div className="flex items-center justify-center gap-3">
								<a href={surprise.cta.href} className="btn">{surprise.cta.label}</a>
								<button className="btn-secondary" onClick={() => setOpen(false)}>Keyinroq</button>
							</div>
							{/* playful confetti */}
							<div className="pointer-events-none absolute inset-0 overflow-hidden">
								<div className="absolute w-3 h-3 bg-amber-300 rounded-full animate-bounce-slow left-[12%] top-[18%]" />
								<div className="absolute w-2 h-2 bg-rose-300 rounded-full animate-bounce-slower left-[75%] top-[22%]" />
								<div className="absolute w-4 h-4 bg-emerald-300 rounded-full animate-bounce-slowest left-[38%] top-[8%]" />
								<div className="absolute w-2.5 h-2.5 bg-sky-300 rounded-full animate-bounce-slow right-[12%] bottom-[18%]" />
								<div className="absolute w-3.5 h-3.5 bg-fuchsia-300 rounded-full animate-bounce-slower right-[35%] bottom-[10%]" />
							</div>
						</div>
					</div>
				</div>,
				document.body
			)}
		</>
	);
}


