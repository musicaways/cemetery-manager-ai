
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Clock, MapPin, Sun, Car, Calendar, Navigation, CloudRain, Cloud, CloudSnow, CloudLightning, Maximize2, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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

        const now = new Date();
        const nextForecasts = weatherData.list
          .filter((item: any) => new Date(item.dt * 1000) > now)
          .slice(0, 6)
          .map((item: any) => {
            const itemDate = new Date(item.dt * 1000);
            const isNextDay = itemDate.getDate() !== now.getDate();
            return {
              time: isNextDay 
                ? `${itemDate.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })} ${itemDate.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}`
                : itemDate.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
              temperature: Math.round(item.main.temp),
              condition: weatherTranslations[item.weather[0].main] || item.weather[0].main,
              fullDate: itemDate
            };
          });

        setHourlyForecast(nextForecasts);

        const forecast = weatherData.list
          .filter((item: any) => {
            const itemDate = new Date(item.dt * 1000);
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);
            return itemDate >= tomorrow;
          })
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
          
          const { data, error } = await supabase.functions.invoke('distance-matrix', {
            body: { origin, destination }
          });
          
          if (error) {
            throw error;
          }
          
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

  const futureHourlyForecast = hourlyForecast;

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
            <Navigation className="w-4 h-4 text-[var(--primary-color)]" />
            <h3 className="text-base font-medium text-white/90 capitalize">{city}</h3>
          </div>
          <p className="text-xs text-white/70 capitalize">{currentDate}</p>
        </div>
      </div>

      {weather && (
        <div className="space-y-4">
          <div className="flex items-stretch">
            <div className="flex-1 pr-4">
              <div className="h-full flex items-center gap-3 bg-black/20 rounded-lg p-3">
                <div className="h-10 w-10 flex items-center justify-center text-[var(--primary-color)]">
                  {getWeatherIcon(weather.condition)}
                </div>
                <div>
                  <div className="flex items-baseline gap-1">
                    <p className="text-2xl font-medium text-white">{weather.temperature}</p>
                    <p className="text-sm text-white/70">°C</p>
                  </div>
                  <p className="text-sm text-white/80">{weather.condition}</p>
                </div>
              </div>
            </div>

            <Separator orientation="vertical" className="mx-4 h-auto bg-white/20" />

            <div className="flex-1">
              <div className="space-y-1.5">
                {futureHourlyForecast.slice(0, 3).map((hour, index) => (
                  <div key={index} className="flex items-center justify-between bg-black/20 rounded-lg px-3 py-1.5">
                    <span className="text-xs text-white/80">{hour.time}</span>
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 text-[var(--primary-color)]">
                        {getWeatherIcon(hour.condition)}
                      </div>
                      <span className="text-sm font-medium text-white">{hour.temperature}°C</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full text-xs text-white/70 hover:text-white hover:bg-white/5">
                <Maximize2 className="w-4 h-4 mr-2" />
                Mostra previsioni complete
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl bg-[#1A1F2C] border border-white/10 rounded-xl">
              <div className="flex justify-between items-center border-b border-white/10 p-6 pb-4">
                <div className="flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-[var(--primary-color)]" />
                  <DialogTitle className="text-xl font-medium text-white">Previsioni meteo per {city}</DialogTitle>
                </div>
                <DialogClose className="rounded-full p-2 hover:bg-white/10">
                  <X className="w-5 h-5 text-white/70 hover:text-white" />
                </DialogClose>
              </div>

              <ScrollArea className="max-h-[80vh] overflow-y-auto">
                <div className="space-y-6 p-6">
                  <div className="bg-black/20 rounded-xl p-4 border border-white/10">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 flex items-center justify-center text-[var(--primary-color)]">
                        {getWeatherIcon(weather.condition)}
                      </div>
                      <div>
                        <div className="flex items-baseline gap-2">
                          <p className="text-4xl font-medium text-white">{weather.temperature}</p>
                          <p className="text-xl text-white/70">°C</p>
                        </div>
                        <p className="text-lg text-white/80 mt-1">{weather.condition}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-base font-medium text-white flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[var(--primary-color)]" />
                      Previsioni orarie di oggi
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                      {futureHourlyForecast.slice(0, 6).map((hour, index) => (
                        <div key={index} className="bg-black/20 rounded-lg p-2 border border-white/10">
                          <div className="flex flex-col items-center">
                            <p className="text-sm font-medium text-white">{hour.time}</p>
                            <div className="h-5 w-5 text-[var(--primary-color)] my-1">
                              {getWeatherIcon(hour.condition)}
                            </div>
                            <p className="text-sm font-medium text-white">{hour.temperature}°C</p>
                            <p className="text-[10px] text-white/80 text-center mt-0.5">{hour.condition}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator className="bg-white/10" />

                  <div className="space-y-3">
                    <h4 className="text-base font-medium text-white flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[var(--primary-color)]" />
                      Previsioni prossimi giorni
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {weather.forecast.map((day, index) => (
                        <div key={index} className="bg-black/20 rounded-xl p-3 border border-white/10">
                          <p className="text-sm font-medium text-white capitalize mb-2">{day.date}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 text-[var(--primary-color)]">
                                {getWeatherIcon(day.condition)}
                              </div>
                              <p className="text-sm text-white/80">{day.condition}</p>
                            </div>
                            <p className="text-lg font-medium text-white">{day.temperature}°C</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {travelInfo && (
        <div className="border-t border-white/10 pt-3 mt-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-xs text-white/70">Tempo</p>
                <p className="text-sm text-white/90">{travelInfo.duration}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Car className="w-4 h-4 text-green-500" />
              <div>
                <p className="text-xs text-white/70">Distanza</p>
                <p className="text-sm text-white/90">{travelInfo.distance}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-red-500" />
              <div>
                <p className="text-xs text-white/70">Indirizzo</p>
                <p className="text-xs text-white/80 truncate">{address}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
