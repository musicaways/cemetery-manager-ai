import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Clock, MapPin, Sun, Car, Calendar, Navigation, CloudRain, Cloud, CloudSnow, CloudLightning, Maximize2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
          const origin = `${position.coords.latitude},${position.coords.longitude}`;
          const destination = encodeURIComponent(`${address}, ${city}, Italy`);
          
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

          if (data.rows?.[0]?.elements?.[0]?.status === "OK") {
            setTravelInfo({
              duration: data.rows[0].elements[0].duration.text,
              distance: data.rows[0].elements[0].distance.text
            });
          } else {
            throw new Error("Impossibile calcolare il percorso");
          }
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
      <Card className="p-4 space-y-2 bg-black/20 border-[var(--primary-color)]/20 animate-pulse rounded-xl">
        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
        <div className="h-4 bg-gray-700 rounded w-1/2"></div>
      </Card>
    );
  }

  return (
    <Card className="p-4 space-y-4 bg-gradient-to-br from-black/30 to-black/10 backdrop-blur-sm border-[var(--primary-color)]/20 rounded-xl">
      <div className="border-b border-white/10 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Navigation className="w-5 h-5 text-[var(--primary-color)]" />
            <h3 className="text-base font-medium capitalize">{city}</h3>
          </div>
          <p className="text-xs text-gray-400 capitalize">{currentDate}</p>
        </div>
      </div>

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="w-full mt-2 text-xs text-gray-400 hover:text-white hover:bg-black/20">
            <Maximize2 className="w-4 h-4 mr-2" />
            Mostra previsioni complete
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl bg-gradient-to-br from-[#221F26] to-[#1A1F2C] backdrop-blur-xl border border-white/10 rounded-xl p-6">
          <DialogHeader className="border-b border-white/10 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Navigation className="w-5 h-5 text-[var(--primary-color)]" />
                <DialogTitle className="text-xl font-medium">Previsioni meteo per {city}</DialogTitle>
              </div>
              <p className="text-sm text-gray-400">{currentDate}</p>
            </div>
          </DialogHeader>

          <div className="space-y-8 py-6 max-h-[80vh] overflow-y-auto pr-2">
            {/* Meteo attuale */}
            <div className="bg-black/30 rounded-xl p-6">
              <div className="flex items-center gap-6">
                <div className="h-20 w-20 flex items-center justify-center text-[var(--primary-color)]">
                  {getWeatherIcon(weather?.condition || '')}
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <p className="text-4xl font-medium">{weather?.temperature}</p>
                    <p className="text-xl text-gray-400">°C</p>
                  </div>
                  <p className="text-lg text-gray-300 mt-1">{weather?.condition}</p>
                </div>
              </div>
            </div>

            {/* Previsioni orarie */}
            <div className="space-y-4">
              <h4 className="text-base font-medium text-gray-300 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[var(--primary-color)]" />
                Previsioni orarie di oggi
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {hourlyForecast.map((hour, index) => (
                  <div key={index} className="bg-black/30 rounded-xl p-4 border border-white/5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-base font-medium">{hour.time}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="h-6 w-6 text-[var(--primary-color)]">
                            {getWeatherIcon(hour.condition)}
                          </div>
                          <p className="text-sm text-gray-300">{hour.condition}</p>
                        </div>
                      </div>
                      <p className="text-2xl font-medium">{hour.temperature}°C</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="bg-white/10" />

            {/* Previsioni giornaliere */}
            <div className="space-y-4">
              <h4 className="text-base font-medium text-gray-300 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[var(--primary-color)]" />
                Previsioni prossimi giorni
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {weather?.forecast.map((day, index) => (
                  <div key={index} className="bg-black/30 rounded-xl p-4 border border-white/5">
                    <p className="text-lg font-medium capitalize mb-3">{day.date}</p>
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 text-[var(--primary-color)]">
                            {getWeatherIcon(day.condition)}
                          </div>
                          <p className="text-sm text-gray-300">{day.condition}</p>
                        </div>
                        <p className="text-2xl font-medium">{day.temperature}°C</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
