# Google Maps API Setup Guide

This guide will help you set up Google Maps API integration for automatic distance calculation in the Carbon Footprint Calculator.

## Prerequisites

1. A Google Cloud Platform account
2. A billing account (Google Maps API requires billing to be enabled)

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable billing for your project

## Step 2: Enable Required APIs

Enable the following APIs in your Google Cloud Console:

1. **Maps JavaScript API**
   - Go to APIs & Services > Library
   - Search for "Maps JavaScript API"
   - Click "Enable"

2. **Places API**
   - Search for "Places API"
   - Click "Enable"

3. **Distance Matrix API**
   - Search for "Distance Matrix API"
   - Click "Enable"

## Step 3: Create API Key

1. Go to APIs & Services > Credentials
2. Click "Create Credentials" > "API Key"
3. Copy the generated API key

## Step 4: Restrict API Key (Recommended)

1. Click on the created API key
2. Under "Application restrictions", select "HTTP referrers (websites)"
3. Add your domain (e.g., `localhost:3000/*` for development)
4. Under "API restrictions", select "Restrict key"
5. Select the three APIs you enabled:
   - Maps JavaScript API
   - Places API
   - Distance Matrix API

## Step 5: Add API Key to Environment Variables

Create a `.env` file in your project root (if it doesn't exist) and add:

```env
REACT_APP_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

## Step 6: Test the Integration

1. Start your development server
2. Go to the Calculator page
3. Select "Transportation" category
4. Click "Use Google Maps"
5. Enter origin and destination addresses
6. Click "Calculate Distance"

## Features

- **Autocomplete**: Address suggestions as you type
- **Distance Calculation**: Automatic distance calculation using Google's routing
- **Multiple Units**: Shows distance in both kilometers and miles
- **Error Handling**: Graceful error handling for API failures

## Cost Considerations

- Google Maps API has usage-based pricing
- Distance Matrix API: $5 per 1000 requests
- Places API: $17 per 1000 requests
- Maps JavaScript API: $7 per 1000 requests

For development and small-scale usage, costs are typically very low.

## Troubleshooting

### API Key Not Working
- Ensure the API key is correct
- Check that billing is enabled
- Verify that all required APIs are enabled
- Check API key restrictions

### Distance Calculation Fails
- Ensure addresses are valid
- Check browser console for error messages
- Verify API quotas haven't been exceeded

### Autocomplete Not Working
- Ensure Places API is enabled
- Check API key restrictions
- Verify the script is loading correctly

## Security Notes

- Never commit your API key to version control
- Use environment variables for API keys
- Restrict API keys to your domain
- Monitor API usage to prevent unexpected charges 