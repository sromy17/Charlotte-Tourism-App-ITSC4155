import React from 'react';

const MapView: React.FC = () => {
	return (
		<div className="min-h-screen bg-gray-50">
			<div className="container mx-auto px-4 py-8">
				<h1 className="text-3xl font-bold text-uncc-green mb-6">
					Charlotte Interactive Map
				</h1>
				<div className="bg-gray-200 h-96 rounded-lg flex items-center justify-center shadow-lg">
					<div className="text-center">
						<div className="text-6xl mb-4" role="img" aria-label="Map">🗺️</div>
						<div className="text-gray-600 text-lg">
							Mapbox integration coming soon...
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default MapView;
