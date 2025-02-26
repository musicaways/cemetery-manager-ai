import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Clock, MapPin, Sun, Car, Calendar, Navigation } from "lucide-react";
import { toast } from "sonner";

interface CemeteryTravelInfoProps {
  address: string | null;
  city: string;
}

interface WeatherData {
  temperature: number;
  condition: string;
  forecast: ForecastDay[];
}

interface ForecastDay {
  date: string;
  temperature: number;
  condition: string;
}

interface TravelInfo {
  duration: string;
  distance: string;
}

const OPENWEATHER_API_KEY = "bd5e378503939ddaee76f12ad7a97608";

const weatherTranslations: { [key: string]: string } = {
  'Clear': 'Sereno',
  'Clouds': 'Nuvoloso',
  'Rain': 'Pioggia',
  'Snow': 'Neve',
  'Drizzle': 'Pioggerella',
  'Thunderstorm': 'Temporale',
  'Mist': 'Nebbia',
  'Fog': 'Nebbia',
  'Haze': 'Foschia',
  'Dust': 'Polvere',
  'Smoke': 'Fumo',
  'Few clouds': 'Poco nuvoloso',
  'Scattered clouds': 'Nubi sparse',
  'Broken clouds': 'Nuvoloso',
  'Overcast clouds': 'Coperto'
};

export const CemeteryTravelInfo = ({ address, city }: CemeteryTravelInfoProps) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [travelInfo, setTravelInfo] = useState<TravelInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const currentDate = new Date().toLocaleDateString('it-IT', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        const weatherResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?q=${city},IT&units=metric&appid=${OPENWEATHER_API_KEY}`
        );
        const weatherData = await weatherResponse.json();

        if (weatherData.cod === "404") {
          throw new Error("Città non trovata");
        }

        const forecast = weatherData.list
          .filter((_: any, index: number) => index % 8 === 0)
          .slice(0, 3)
          .map((day: any) => ({
            date: new Date(day.dt * 1000).toLocaleDateString('it-IT', { weekday: 'long' }),
            temperature: Math.round(day.main.temp),
            condition: weatherTranslations[day.weather[0].main] || day.weather[0].main
          }));

        setWeather({
          temperature: Math.round(weatherData.list[0].main.temp),
          condition: weatherTranslations[weatherData.list[0].weather[0].main] || weatherData.list[0].weather[0].main,
          forecast
        });

        if (address) {
          const origin = `${position.coords.latitude},${position.coords.longitude}`;
          const destination = encodeURIComponent(`${address}, ${city}, Italy`);
          
          const response = await fetch(
            `/api/edge/distance-matrix?origin=${origin}&destination=${destination}`
          );
          
          if (!response.ok) {
            throw new Error("Errore nella risposta del server");
          }
          
          const data = await response.json();
          console.log("Distance Matrix Response:", data);

          if (data.rows?.[0]?.elements?.[0]?.status === "OK") {
            setTravelInfo({
              duration: data.rows[0].elements[0].duration.text,
              distance: data.rows[0].elements[0].distance.text
            });
          } else {
            console.error("Errore risposta Distance Matrix:", data);
            throw new Error("Impossibile calcolare il percorso");
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
    <Card className="p-6 space-y-6 bg-gradient-to-br from-black/30 to-black/10 backdrop-blur-sm border-[var(--primary-color)]/20">
      <div className="border-b border-white/10 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Navigation className="w-5 h-5 text-[var(--primary-color)]" />
            <h3 className="text-lg font-medium capitalize">{city}</h3>
          </div>
          <p className="text-sm text-gray-400 capitalize">{currentDate}</p>
        </div>
      </div>

      <div className="grid gap-6">
        {weather && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-black/20 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-yellow-500/10 rounded-lg">
                  <Sun className="w-8 h-8 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Temperatura attuale</p>
                  <div className="flex items-end gap-1">
                    <p className="text-3xl font-medium">{weather.temperature}</p>
                    <p className="text-lg text-gray-400 mb-1">°C</p>
                  </div>
                </div>
              </div>
              <p className="text-lg text-gray-300">{weather.condition}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-400">
                <Calendar className="w-4 h-4" />
                <p className="text-sm">Previsioni prossimi giorni</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {weather.forecast.map((day, index) => (
                  <div key={index} className="bg-black/20 rounded-lg p-3 text-center">
                    <p className="text-sm text-gray-400 capitalize mb-2">{day.date}</p>
                    <p className="text-lg font-medium mb-1">{day.temperature}°C</p>
                    <p className="text-xs text-gray-400">{day.condition}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {travelInfo && (
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Clock className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Tempo stimato</p>
                <p className="text-lg">{travelInfo.duration}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Car className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Distanza</p>
                <p className="text-lg">{travelInfo.distance}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 col-span-2">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <MapPin className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Indirizzo</p>
                <p className="text-sm text-gray-300">{address}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
