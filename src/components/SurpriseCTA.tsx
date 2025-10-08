"use client";

import { useEffect, useMemo, useState } from "react";
import { strings } from '@/lib/strings';
import AppModal from './AppModal';

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
			
			<AppModal
				isOpen={open && mounted}
				onClose={() => setOpen(false)}
				title={surprise.title}
				subtitle={surprise.message}
			>
				<div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
					<a href={surprise.cta.href} className="btn w-full sm:w-auto px-6 py-3 text-base sm:text-lg">{surprise.cta.label}</a>
					<button className="btn-secondary w-full sm:w-auto px-6 py-3 text-base sm:text-lg" onClick={() => setOpen(false)}>{strings.surpriseCTA.later}</button>
				</div>
			</AppModal>
		</>
	);
}