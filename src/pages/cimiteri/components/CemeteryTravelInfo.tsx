import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Clock, MapPin, Sun, Car, Calendar, Navigation, CloudRain, Cloud, CloudSnow, CloudLightning } from "lucide-react";
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

interface WeatherHourly {
  time: string;
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

const getWeatherIcon = (condition: string) => {
  switch (condition.toLowerCase()) {
    case 'pioggia':
    case 'pioggerella':
      return <CloudRain className="h-full w-full" />;
    case 'neve':
      return <CloudSnow className="h-full w-full" />;
    case 'temporale':
      return <CloudLightning className="h-full w-full" />;
    case 'nuvoloso':
    case 'coperto':
    case 'poco nuvoloso':
    case 'nubi sparse':
      return <Cloud className="h-full w-full" />;
    default:
      return <Sun className="h-full w-full" />;
  }
};

export const CemeteryTravelInfo = ({ address, city }: CemeteryTravelInfoProps) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [hourlyForecast, setHourlyForecast] = useState<WeatherHourly[]>([]);
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
        console.log("Starting data fetch...");
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        console.log("Got position:", position.coords);

        const weatherResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?q=${city},IT&units=metric&appid=${OPENWEATHER_API_KEY}`
        );
        const weatherData = await weatherResponse.json();

        if (weatherData.cod === "404") {
          throw new Error("Città non trovata");
        }

        const currentHour = new Date().getHours();
        const todayHourly = weatherData.list
          .filter((item: any) => {
            const itemDate = new Date(item.dt * 1000);
            return itemDate.getDate() === new Date().getDate() && 
                   itemDate.getHours() >= currentHour;
          })
          .map((item: any) => ({
            time: new Date(item.dt * 1000).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
            temperature: Math.round(item.main.temp),
            condition: weatherTranslations[item.weather[0].main] || item.weather[0].main
          }));

        setHourlyForecast(todayHourly);

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
          console.log("Fetching travel info with address:", address);
          const origin = `${position.coords.latitude},${position.coords.longitude}`;
          const destination = encodeURIComponent(`${address}, ${city}, Italy`);
          
          console.log("Making request to distance-matrix with:", {
            origin,
            destination,
            url: `/api/edge/distance-matrix?origin=${origin}&destination=${destination}`
          });
          
          const response = await fetch(
            `/api/edge/distance-matrix?origin=${origin}&destination=${destination}`,
            {
              headers: {
                'Content-Type': 'application/json',
              }
            }
          );
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          console.log("Distance Matrix Raw Response:", data);

          if (data.rows?.[0]?.elements?.[0]?.status === "OK") {
            console.log("Setting travel info:", {
              duration: data.rows[0].elements[0].duration.text,
              distance: data.rows[0].elements[0].distance.text
            });
            setTravelInfo({
              duration: data.rows[0].elements[0].duration.text,
              distance: data.rows[0].elements[0].distance.text
            });
          } else {
            console.error("Invalid Distance Matrix Response:", data);
            throw new Error("Impossibile calcolare il percorso");
          }
        } else {
          console.log("No address provided, skipping travel info fetch");
        }
      } catch (error) {
        console.error("Error in fetchData:", error);
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
    <Card className="p-4 space-y-4 bg-gradient-to-br from-black/30 to-black/10 backdrop-blur-sm border-[var(--primary-color)]/20">
      <div className="border-b border-white/10 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-[var(--primary-color)]" />
            <h3 className="text-base font-medium capitalize">{city}</h3>
          </div>
          <p className="text-xs text-gray-400 capitalize">{currentDate}</p>
        </div>
      </div>

      {weather && (
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="bg-black/20 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 flex items-center justify-center">
                    {getWeatherIcon(weather.condition)}
                  </div>
                  <div>
                    <div className="flex items-baseline gap-1">
                      <p className="text-2xl font-medium">{weather.temperature}</p>
                      <p className="text-sm text-gray-400">°C</p>
                    </div>
                    <p className="text-xs text-gray-400">{weather.condition}</p>
                  </div>
                </div>
              </div>
            </div>

            <Separator orientation="vertical" className="bg-white/10" />

            {hourlyForecast.length > 0 && (
              <div className="flex-1">
                <div className="grid grid-cols-2 gap-2">
                  {hourlyForecast.slice(0, 4).map((hour, index) => (
                    <div key={index} className="bg-black/20 rounded-lg p-2 text-center">
                      <p className="text-xs text-gray-400">{hour.time}</p>
                      <p className="text-sm font-medium">{hour.temperature}°C</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-white/10 pt-3">
            <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Prossimi giorni
            </p>
            <div className="grid grid-cols-3 gap-2">
              {weather.forecast.map((day, index) => (
                <div key={index} className="bg-black/20 rounded-lg p-2 text-center">
                  <p className="text-xs text-gray-400 capitalize">{day.date}</p>
                  <div className="h-5 w-5 mx-auto my-1">
                    {getWeatherIcon(day.condition)}
                  </div>
                  <p className="text-sm font-medium">{day.temperature}°C</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {travelInfo && (
        <div className="border-t border-white/10 pt-3 mt-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-xs text-gray-400">Tempo</p>
                <p className="text-sm">{travelInfo.duration}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Car className="w-4 h-4 text-green-500" />
              <div>
                <p className="text-xs text-gray-400">Distanza</p>
                <p className="text-sm">{travelInfo.distance}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-red-500" />
              <div>
                <p className="text-xs text-gray-400">Indirizzo</p>
                <p className="text-xs text-gray-300 truncate">{address}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
