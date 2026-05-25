const API_KEY = "f5f28a72de61c6588572b4d50421d4ea";
const BASE_URL = "https://restapi.amap.com/v3/weather/weatherInfo";

export interface WeatherResponse {
  status: string;
  count: string;
  info: string;
  infocode: string;
  lives?: WeatherLive[];
  forecasts?: WeatherForecast[];
}

export interface WeatherLive {
  province: string;
  city: string;
  adcode: string;
  weather: string;
  temperature: string;
  winddirection: string;
  windpower: string;
  humidity: string;
  reporttime: string;
}

export interface WeatherForecast {
  city: string;
  adcode: string;
  province: string;
  reporttime: string;
  casts: ForecastDay[];
}

export interface ForecastDay {
  date: string;
  week: string;
  dayweather: string;
  nightweather: string;
  daytemp: string;
  nighttemp: string;
  daywind: string;
  nightwind: string;
  daypower: string;
  nightpower: string;
}

const cityCodes: Record<string, string> = {
  "北京": "110000",
  "上海": "310000",
  "广州": "440100",
  "深圳": "440300",
  "杭州": "330100",
  "成都": "510100",
  "武汉": "420100",
  "南京": "320100",
  "西安": "610100",
  "重庆": "500000",
};

export function getCityCode(cityName: string): string {
  return cityCodes[cityName] || "110000";
}

export function getCityList(): { name: string; code: string }[] {
  return Object.entries(cityCodes).map(([name, code]) => ({ name, code }));
}

export async function getWeather(cityCode: string = "110000"): Promise<WeatherResponse> {
  const url = `${BASE_URL}?city=${cityCode}&key=${API_KEY}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`天气请求失败: ${response.status}`);
  }
  
  return response.json() as Promise<WeatherResponse>;
}

export async function getWeatherByCityName(cityName: string): Promise<WeatherResponse> {
  const cityCode = getCityCode(cityName);
  return getWeather(cityCode);
}