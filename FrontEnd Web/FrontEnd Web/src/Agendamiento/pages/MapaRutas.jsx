import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet-routing-machine";
import axios from "axios";

export default function MapaRutas() {
	const mapRef = useRef(null);

	useEffect(() => {
		if (mapRef.current) return;

		const map = L.map("map").setView([-33.51, -70.75], 13);
		mapRef.current = map;

		L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
			maxZoom: 19,
			attribution: "© OpenStreetMap contributors",
		}).addTo(map);

		let waypoints = [];
		let routes = {};
		let currentRoute = null;
		let markers = [];
		let routePolylines = {};
		let geocodeMarkers = [];

		const routeProviders = {
			osrm: {
				name: "OSRM (Rápido)",
				color: "#4285F4",
				getRoute: async (wps) => {
					const coords = wps.map((wp) => `${wp.lng},${wp.lat}`).join(";");
					const response = await axios.get(
						`https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`,
					);
					return {
						geometry: response.data.routes[0].geometry,
						distance: response.data.routes[0].distance / 1000,
						duration: response.data.routes[0].duration / 60,
					};
				},
			},
			mapbox: {
				name: "Mapbox (Tráfico)",
				color: "#34A853",
				getRoute: async (wps) => {
					const coords = wps.map((wp) => `${wp.lng},${wp.lat}`).join(";");
					const response = await axios.get(
						`https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${coords}?geometries=geojson&access_token=pk.eyJ1Ijoic2FtdXZtIiwiYSI6ImNtYWFwZ3pjYTI0dGIycXB3bGFvYTZzOHUifQ.KlxX-TxZ0LXf-wpcaNqEfQ`,
					);
					return {
						geometry: response.data.routes[0].geometry,
						distance: response.data.routes[0].distance / 1000,
						duration: response.data.routes[0].duration / 60,
					};
				},
			},
		};

		async function geocodeAddress(address) {
			try {
				const response = await axios.get(
					`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
						address,
					)}&limit=1`,
				);
				if (response.data && response.data.length > 0) {
					const result = response.data[0];
					return L.latLng(parseFloat(result.lat), parseFloat(result.lon));
				}
				return null;
			} catch (error) {
				console.error("Error en geocodificación:", error);
				return null;
			}
		}

		function clearGeocodeMarkers() {
			geocodeMarkers.forEach((marker) => map.removeLayer(marker));
			geocodeMarkers = [];
		}

		async function calculateAllRoutes() {
			const loadingPopup = L.popup()
				.setLatLng(waypoints[0])
				.setContent("Calculando rutas...")
				.openOn(map);

			try {
				routes = {};
				routePolylines = {};

				for (const [providerId, provider] of Object.entries(routeProviders)) {
					try {
						const routeData = await provider.getRoute(waypoints);
						routes[providerId] = {
							...provider,
							...routeData,
							id: providerId,
						};

						let latLngs;
						if (typeof routeData.geometry === "string") {
							latLngs = L.Polyline.fromEncoded(routeData.geometry).getLatLngs();
						} else if (routeData.geometry.type === "LineString") {
							latLngs = routeData.geometry.coordinates.map((coord) =>
								L.latLng(coord[1], coord[0]),
							);
						}

						routePolylines[providerId] = L.polyline(latLngs, {
							color: provider.color,
							weight: 5,
							opacity: 0.7,
						});
					} catch (error) {
						console.error(`Error con ${provider.name}:`, error);
					}
				}
			} finally {
				map.closePopup(loadingPopup);
			}
		}

		function showRouteOptions() {
			const optionsContainer = document.getElementById("route-options");
			optionsContainer.innerHTML = "";

			for (const [providerId, route] of Object.entries(routes)) {
				const optionElement = document.createElement("div");
				optionElement.className = "route-option";
				optionElement.style.borderLeft = `4px solid ${route.color}`;
				optionElement.innerHTML = `
					<strong>${route.name}</strong>
					<div class="route-info">
						${route.distance.toFixed(1)} km • ${Math.round(route.duration)} min
					</div>
				`;
				optionElement.addEventListener("click", () => showRoute(providerId));
				optionsContainer.appendChild(optionElement);
			}
		}

		function showRoute(providerId) {
			for (const polyline of Object.values(routePolylines)) {
				if (map.hasLayer(polyline)) {
					map.removeLayer(polyline);
				}
			}

			const route = routes[providerId];
			routePolylines[providerId].addTo(map);
			currentRoute = providerId;

			map.fitBounds(routePolylines[providerId].getBounds(), {
				padding: [50, 50],
			});

			const detailsContainer = document.getElementById("route-details");
			detailsContainer.innerHTML = `
				<h6>${route.name}</h6>
				<p><strong>Distancia:</strong> ${route.distance.toFixed(1)} km</p>
				<p><strong>Duración:</strong> ${Math.round(route.duration)} minutos</p>
				<div style="height: 10px; background: linear-gradient(to right, #f5f5f5, ${route.color});"></div>
			`;
		}

		function addMarker(location, number) {
			const marker = L.marker(location, {
				icon: L.divIcon({
					className: "custom-marker",
					html: `<div>${number}</div>`,
				}),
			}).addTo(map);
			markers.push(marker);
		}

		const startBtn = document.getElementById("geocode-start");
		const endBtn = document.getElementById("geocode-end");
		const compareBtn = document.getElementById("compare");
		const resetBtn = document.getElementById("reset");

		startBtn.onclick = async () => {
			const address = document.getElementById("start-address").value;
			if (!address) return;

			const loadingPopup = L.popup()
				.setLatLng(map.getCenter())
				.setContent("Buscando dirección de inicio...")
				.openOn(map);

			const location = await geocodeAddress(address);
			map.closePopup(loadingPopup);

			if (location) {
				clearGeocodeMarkers();

				if (waypoints.length > 0) {
					waypoints[0] = location;
					if (markers.length > 0) markers[0].setLatLng(location);
				} else {
					waypoints.push(location);
					addMarker(location, 1);
				}

				const marker = L.marker(location, {
					icon: L.divIcon({ className: "custom-marker", html: "<div>S</div>" }),
				}).addTo(map);
				geocodeMarkers.push(marker);

				map.setView(location, 15);

				if (waypoints.length === 2) {
					await calculateAllRoutes();
					showRouteOptions();
				}
			} else {
				L.popup()
					.setLatLng(map.getCenter())
					.setContent("No se encontró la dirección")
					.openOn(map);
			}
		};

		endBtn.onclick = async () => {
			const address = document.getElementById("end-address").value;
			if (!address) return;

			const loadingPopup = L.popup()
				.setLatLng(map.getCenter())
				.setContent("Buscando dirección de destino...")
				.openOn(map);

			const location = await geocodeAddress(address);
			map.closePopup(loadingPopup);

			if (location) {
				clearGeocodeMarkers();

				if (waypoints.length > 1) {
					waypoints[1] = location;
					if (markers.length > 1) markers[1].setLatLng(location);
				} else if (waypoints.length === 1) {
					waypoints.push(location);
					addMarker(location, 2);
				} else {
					waypoints.push(location);
					addMarker(location, 2);
				}

				const marker = L.marker(location, {
					icon: L.divIcon({ className: "custom-marker", html: "<div>D</div>" }),
				}).addTo(map);
				geocodeMarkers.push(marker);

				if (waypoints.length === 1) {
					map.setView(location, 15);
				} else {
					map.fitBounds([waypoints[0], waypoints[1]], { padding: [50, 50] });
				}

				if (waypoints.length === 2) {
					await calculateAllRoutes();
					showRouteOptions();
				}
			} else {
				L.popup()
					.setLatLng(map.getCenter())
					.setContent("No se encontró la dirección")
					.openOn(map);
			}
		};

		compareBtn.onclick = () => {
			if (waypoints.length < 2) {
				alert("Por favor, establece ambos puntos (inicio y destino) primero.");
				return;
			}

			for (const polyline of Object.values(routePolylines)) {
				if (map.hasLayer(polyline)) map.removeLayer(polyline);
			}

			let index = 0;
			const totalRoutes = Object.keys(routes).length || 1;
			for (const [providerId, route] of Object.entries(routes)) {
				const opacity = totalRoutes > 1 ? 0.3 + 0.7 * (index / (totalRoutes - 1)) : 1;
				routePolylines[providerId].setStyle({ opacity, weight: 7 });
				routePolylines[providerId].addTo(map);
				index++;
			}

			const bounds = new L.LatLngBounds([]);
			for (const polyline of Object.values(routePolylines)) {
				bounds.extend(polyline.getBounds());
			}
			map.fitBounds(bounds, { padding: [50, 50] });

			const detailsContainer = document.getElementById("route-details");
			detailsContainer.innerHTML = "<h6>Comparativa de Rutas</h6>";

			const sortedRoutes = Object.values(routes).sort(
				(a, b) => a.duration - b.duration,
			);
			for (const route of sortedRoutes) {
				detailsContainer.innerHTML += `
					<div style="margin-bottom: 8px; border-left: 4px solid ${route.color}; padding-left: 8px;">
						<strong>${route.name}</strong>
						<div>${route.distance.toFixed(1)} km • ${Math.round(
						 route.duration,
					 )} min</div>
					</div>
				`;
			}
		};

		resetBtn.onclick = () => {
			markers.forEach((marker) => map.removeLayer(marker));
			markers = [];

			for (const polyline of Object.values(routePolylines)) {
				if (map.hasLayer(polyline)) map.removeLayer(polyline);
			}
			routePolylines = {};
			routes = {};
			currentRoute = null;
			waypoints = [];

			document.getElementById("route-options").innerHTML = "";
			document.getElementById("route-details").innerHTML = "";
			document.getElementById("start-address").value = "";
			document.getElementById("end-address").value = "";

			clearGeocodeMarkers();
		};

		map.on("click", async (e) => {
			if (waypoints.length < 2) {
				waypoints.push(e.latlng);
				addMarker(e.latlng, waypoints.length);

				if (waypoints.length === 1) {
					document.getElementById("start-address").value = "Punto en mapa";
				} else {
					document.getElementById("end-address").value = "Punto en mapa";
				}

				if (waypoints.length === 2) {
					await calculateAllRoutes();
					showRouteOptions();
				}
			} else {
				L.popup()
					.setLatLng(e.latlng)
					.setContent(
						'Ya tienes dos puntos. Haz clic en "Reiniciar" para comenzar de nuevo.',
					)
					.openOn(map);
			}
		});

		return () => {
			map.remove();
			mapRef.current = null;
		};
	}, []);

	return (
		<div style={{ position: "relative", height: "100vh", width: "100%" }}>
			<div className="control-panel">
				<h5>Opciones de Ruta</h5>

				<div className="address-input">
					<label htmlFor="start-address" className="form-label">
						Inicio:
					</label>
					<div className="input-group">
						<input
							type="text"
							id="start-address"
							className="form-control"
							placeholder="Ingresa dirección de inicio"
						/>
						<button id="geocode-start" className="btn btn-outline-secondary">
							Buscar
						</button>
					</div>
				</div>

				<div className="address-input">
					<label htmlFor="end-address" className="form-label">
						Destino:
					</label>
					<div className="input-group">
						<input
							type="text"
							id="end-address"
							className="form-control"
							placeholder="Ingresa dirección de destino"
						/>
						<button id="geocode-end" className="btn btn-outline-secondary">
							Buscar
						</button>
					</div>
				</div>

				<div className="btn-group w-100 mb-3">
					<button id="reset" className="btn btn-danger btn-sm">
						Reiniciar
					</button>
					<button id="compare" className="btn btn-primary btn-sm">
						Comparar Rutas
					</button>
				</div>

				<div id="route-options" />
				<div id="route-details" className="mt-3" />
			</div>

			<div id="map" />
		</div>
	);
}
