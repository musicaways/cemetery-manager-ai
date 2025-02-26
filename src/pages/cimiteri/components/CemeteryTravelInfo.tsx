
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Clock, MapPin, Sun, Car } from "lucide-react";
import { toast } from "sonner";

interface CemeteryTravelInfoProps {
  address: string | null;
  city: string;
}

interface WeatherData {
  temperature: number;
  condition: string;
}

interface TravelInfo {
  duration: string;
  distance: string;
}

export const CemeteryTravelInfo = ({ address, city }: CemeteryTravelInfoProps) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [travelInfo, setTravelInfo] = useState<TravelInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Ottieni la posizione corrente
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        // Fetch weather data
        const weatherResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${city},IT&units=metric&appid=${process.env.OPENWEATHER_API_KEY}`
        );
        const weatherData = await weatherResponse.json();

        setWeather({
          temperature: Math.round(weatherData.main.temp),
          condition: weatherData.weather[0].main
        });

        // Fetch travel info using Google Maps Distance Matrix API
        if (address) {
          const origin = `${position.coords.latitude},${position.coords.longitude}`;
          const destination = encodeURIComponent(address);
          
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}&key=${process.env.GOOGLE_MAPS_API_KEY}`
          );
          const data = await response.json();

          if (data.rows[0]?.elements[0]?.status === "OK") {
            setTravelInfo({
              duration: data.rows[0].elements[0].duration.text,
              distance: data.rows[0].elements[0].distance.text
            });
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Errore nel recupero delle informazioni di viaggio e meteo");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [address, city]);

  if (loading) {
    return (
      <Card className="p-4 space-y-2 bg-black/20 border-[var(--primary-color)]/20 animate-pulse">
        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
        <div className="h-4 bg-gray-700 rounded w-1/2"></div>
      </Card>
    );
  }

  return (
    <Card className="p-4 space-y-4 bg-black/20 border-[var(--primary-color)]/20">
      <div className="grid grid-cols-2 gap-4">
        {weather && (
          <div className="flex items-center gap-2">
            <Sun className="w-5 h-5 text-yellow-500" />
            <div>
              <p className="text-sm text-gray-400">Temperatura</p>
              <p className="text-lg">{weather.temperature}°C</p>
              <p className="text-sm text-gray-400">{weather.condition}</p>
            </div>
          </div>
        )}
        
        {travelInfo && (
          <>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-400">Tempo stimato</p>
                <p className="text-lg">{travelInfo.duration}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Car className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-400">Distanza</p>
                <p className="text-lg">{travelInfo.distance}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-sm text-gray-400">Indirizzo</p>
                <p className="text-sm">{address}</p>
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
};
