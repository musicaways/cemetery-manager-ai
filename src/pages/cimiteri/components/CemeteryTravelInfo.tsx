
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Clock, MapPin, Sun, Car, Calendar } from "lucide-react";
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

// Traduzione delle condizioni meteo
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Ottieni la posizione corrente
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        // Fetch weather data con forecast
        const weatherResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?q=${city},IT&units=metric&appid=${OPENWEATHER_API_KEY}`
        );
        const weatherData = await weatherResponse.json();

        if (weatherData.cod === "404") {
          throw new Error("Città non trovata");
        }

        // Organizziamo i dati del forecast per i prossimi 3 giorni
        const forecast = weatherData.list
          .filter((_: any, index: number) => index % 8 === 0) // Prendiamo una previsione al giorno
          .slice(0, 3) // Solo i prossimi 3 giorni
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

        // Fetch travel info using Google Maps Distance Matrix API
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
    <Card className="p-4 space-y-4 bg-black/20 border-[var(--primary-color)]/20">
      <div className="grid grid-cols-2 gap-4">
        {weather && (
          <>
            <div className="flex items-center gap-2">
              <Sun className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-400">Temperatura attuale</p>
                <p className="text-lg">{weather.temperature}°C</p>
                <p className="text-sm text-gray-400">{weather.condition}</p>
              </div>
            </div>
            <div className="col-span-2">
              <div className="mt-2">
                <p className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Previsioni prossimi giorni:
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {weather.forecast.map((day, index) => (
                    <div key={index} className="text-center p-2 bg-black/10 rounded">
                      <p className="text-xs text-gray-400 capitalize">{day.date}</p>
                      <p className="text-sm font-medium">{day.temperature}°C</p>
                      <p className="text-xs text-gray-400">{day.condition}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
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
            
            <div className="flex items-center gap-2 col-span-2">
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
