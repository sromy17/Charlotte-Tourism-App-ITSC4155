import React from 'react';
import { motion } from 'framer-motion';
import { RecommendationItemAPI } from '../services/api';

interface RecommendationCardProps {
	item: RecommendationItemAPI;
	index?: number;
	onClick?: () => void;
	variant?: 'default' | 'compact';
}

/**
 * Displays a single recommendation item from the backend
 * Shows name, location, type, and API source with styled card design
 */
const RecommendationCard: React.FC<RecommendationCardProps> = ({
	item,
	index = 0,
	onClick,
	variant = 'default',
}) => {
	const getSourceColor = (source: string): string => {
		const sourceMap: Record<string, string> = {
			tomtom: 'from-royal-emerald/20 to-royal-emerald/5',
			ticketmaster: 'from-fairway-gold/20 to-fairway-gold/5',
			eventbrite: 'from-royal-gold/20 to-royal-gold/5',
		};
		return sourceMap[source] || 'from-white/10 to-white/5';
	};

	const getSourceBadgeColor = (source: string): string => {
		const badgeMap: Record<string, string> = {
			tomtom: 'bg-royal-emerald/30 text-royal-emerald',
			ticketmaster: 'bg-fairway-gold/30 text-fairway-gold',
			eventbrite: 'bg-royal-gold/30 text-royal-gold',
		};
		return badgeMap[source] || 'bg-white/10 text-white/60';
	};

	const getTypeIcon = (type: string): string => {
		const typeMap: Record<string, string> = {
			restaurant: '🍽️',
			event: '🎭',
			activity: '🎯',
			default: '📍',
		};
		return typeMap[type] || typeMap.default;
	};

	if (variant === 'compact') {
		return (
			<motion.div
				initial={{ opacity: 0, x: -20 }}
				animate={{ opacity: 1, x: 0 }}
				transition={{ delay: index * 0.1 }}
				onClick={onClick}
				className="group cursor-pointer"
			>
				<div className="flex items-start gap-3 p-3 rounded-lg border border-white/10 hover:border-white/30 bg-white/5 hover:bg-white/10 transition-all">
					<div className="text-xl flex-shrink-0 mt-0.5">
						{getTypeIcon(item.type)}
					</div>
					<div className="flex-1 min-w-0">
						<h4 className="text-xs font-semibold text-white truncate group-hover:text-fairway-gold transition-colors">
							{item.name}
						</h4>
						<p className="text-[9px] text-white/40 mt-1 truncate">
							{item.location}
						</p>
						<div className="mt-2 flex gap-2 flex-wrap">
							<span className={`px-2 py-0.5 rounded text-[8px] font-mono uppercase ${getSourceBadgeColor(item.api_source)}`}>
								{item.api_source}
							</span>
							{item.price && (
								<span className="px-2 py-0.5 rounded text-[8px] font-mono text-white/60 bg-white/5">
									{item.price}
								</span>
							)}
						</div>
					</div>
				</div>
			</motion.div>
		);
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: index * 0.08 }}
			onClick={onClick}
			className="group cursor-pointer h-full"
		>
			<div
				className={`relative h-full rounded-xl border border-white/10 hover:border-white/30 bg-gradient-to-br ${getSourceColor(item.api_source)} backdrop-blur-sm p-4 overflow-hidden transition-all hover:shadow-lg hover:shadow-white/5`}
			>
				{/* Background accent */}
				<div className="absolute -top-8 -right-8 w-24 h-24 bg-white/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

				{/* Icon */}
				<div className="relative z-10 text-3xl mb-3">
					{getTypeIcon(item.type)}
				</div>

				{/* Content */}
				<div className="relative z-10">
					{/* Source Badge */}
					<span className={`inline-flex px-2.5 py-1 rounded-full text-[8px] font-mono uppercase tracking-[0.1em] ${getSourceBadgeColor(item.api_source)} mb-3`}>
						{item.api_source}
					</span>

					{/* Name */}
					<h3 className="text-sm font-semibold text-white line-clamp-2 group-hover:text-fairway-gold transition-colors mb-2">
						{item.name}
					</h3>

					{/* Location */}
					<p className="text-[11px] text-white/60 mb-3 line-clamp-2 flex items-start gap-1.5">
						<span className="text-white/40 flex-shrink-0">📍</span>
						<span>{item.location}</span>
					</p>

					{/* Description */}
					{item.description && (
						<p className="text-[10px] text-white/40 line-clamp-3 mb-3">
							{item.description}
						</p>
					)}

					{/* Footer Info */}
					<div className="flex items-center justify-between pt-3 border-t border-white/10">
						{/* Type & Price */}
						<div className="flex gap-2">
							<span className="px-2 py-1 rounded text-[9px] font-mono uppercase bg-white/5 text-white/60">
								{item.type}
							</span>
							{item.price && (
								<span className="px-2 py-1 rounded text-[9px] font-mono text-fairway-gold bg-white/5">
									{item.price}
								</span>
							)}
						</div>

						{/* DateTime if available */}
						{item.datetime && (
							<span className="text-[9px] text-white/40 font-mono">
								{item.datetime.split('T')[0]}
							</span>
						)}
					</div>
				</div>
			</div>
		</motion.div>
	);
};

export default RecommendationCard;
