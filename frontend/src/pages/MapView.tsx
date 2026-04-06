import React from 'react';

const MapView: React.FC = () => {
	return (
		<div className="min-h-[calc(100vh-7rem)] bg-[#020202] px-6 pb-16 text-[#F6F3EB]">
			<div className="mx-auto max-w-6xl">
				<div className="luxury-panel p-8">
					<p className="luxury-label text-[#79bfa0]">City Map · Preview</p>
					<h1 className="mt-3 text-5xl italic">Charlotte, beautifully mapped</h1>
					<p className="mt-2 max-w-2xl text-white/70">
						Your live map experience is being connected to itinerary nodes. For now,
						this preview mirrors the visual language used in your personalized day flow.
					</p>

					<div className="relative mt-8 h-[520px] overflow-hidden rounded-[28px] border thin-border border-white/20 bg-gradient-to-br from-[#0f2a1f] via-[#07140f] to-[#020202]">
						<div
							className="absolute inset-0 opacity-[0.16]"
							style={{
								backgroundImage:
									'linear-gradient(rgba(255,255,255,0.22) 0.5px, transparent 0.5px), linear-gradient(90deg, rgba(255,255,255,0.22) 0.5px, transparent 0.5px)',
								backgroundSize: '52px 52px',
							}}
						/>
						<div className="absolute left-[16%] top-[24%] h-3 w-3 rounded-full bg-[#d6c08e] shadow-[0_0_20px_rgba(214,192,142,0.6)]" />
						<div className="absolute left-[46%] top-[42%] h-3 w-3 rounded-full bg-[#79bfa0] shadow-[0_0_20px_rgba(121,191,160,0.6)]" />
						<div className="absolute left-[70%] top-[34%] h-3 w-3 rounded-full bg-[#d6c08e] shadow-[0_0_20px_rgba(214,192,142,0.6)]" />
						<div className="absolute bottom-[18%] left-[34%] h-3 w-3 rounded-full bg-[#79bfa0] shadow-[0_0_20px_rgba(121,191,160,0.6)]" />

						<div className="absolute bottom-6 left-6 rounded-xl border border-white/20 bg-black/35 px-4 py-3 backdrop-blur-xl">
							<p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/70">
								Live map markers and camera transitions will appear here.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default MapView;
