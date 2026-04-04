from fastapi import APIRouter
import httpx

router = APIRouter()

# Using Open-Meteo because it requires no API key.
WEATHER_API_URL = "https://api.open-meteo.com/v1/forecast"
AQI_API_URL = "https://air-quality-api.open-meteo.com/v1/air-quality"

@router.get("/")
async def get_environment_data(lat: float, lng: float):
    # Fetch weather
    weather_params = {
        "latitude": lat,
        "longitude": lng,
        "current": "temperature_2m,weather_code"
    }
    
    # Fetch air quality
    aqi_params = {
        "latitude": lat,
        "longitude": lng,
        "current": "european_aqi"
    }

    async with httpx.AsyncClient() as client:
        weather_res = await client.get(WEATHER_API_URL, params=weather_params)
        aqi_res = await client.get(AQI_API_URL, params=aqi_params)
        
        weather_data = weather_res.json()
        aqi_data = aqi_res.json()
        
        # Parse temperature
        temp = 24 # default fallback
        if "current" in weather_data and "temperature_2m" in weather_data["current"]:
            temp = round(weather_data["current"]["temperature_2m"])
            
        # Parse AQI (lower is better, < 50 is Good)
        aqi_val = 50
        if "current" in aqi_data and "european_aqi" in aqi_data["current"]:
            aqi_val = aqi_data["current"]["european_aqi"]
            
        # Map AQI to Grade
        aqi_grade = "A+"
        if aqi_val > 40: aqi_grade = "A"
        if aqi_val > 60: aqi_grade = "B"
        if aqi_val > 80: aqi_grade = "C"
        if aqi_val > 100: aqi_grade = "D"

        return {
            "temperature": temp,
            "aqi": aqi_val,
            "aqi_grade": aqi_grade,
            "weather_code": weather_data.get("current", {}).get("weather_code", 0)
        }
