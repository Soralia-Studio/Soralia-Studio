# Stream Text Overlay with Google Sheets API

A simple Next.js application that displays text from Google Sheets in a transparent overlay for OBS streaming. Users can input text through an admin panel, and the text will be displayed in real-time on a transparent overlay suitable for streaming.

## Features

- Transparent background for seamless OBS integration
- Real-time text updates from Google Sheets
- Admin panel for text input
- Customizable text appearance through URL parameters
- Auto-refresh capability

## Setup Instructions

### 1. Create a Google Sheets document

1. Go to [Google Sheets](https://sheets.google.com/) and create a new spreadsheet
2. Rename the first sheet to "StreamText" (optional)
3. Add headers in row 1: `text` and `timestamp`

### 2. Set up Google Cloud API credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable the Google Sheets API
4. Create a service account
5. Download the JSON credentials file
6. Share your Google Sheet with the service account email (with Editor permissions)

### 3. Configure the application

1. Rename `.env.local.example` to `.env.local`
2. Fill in the environment variables:
   ```
   GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account-email@your-project.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
Your Private Key Here
-----END PRIVATE KEY-----
"
   GOOGLE_SHEET_ID=your-sheet-id-from-url
   ```

### 4. Run the application

```bash
npm install
npm run dev
```

- Admin panel: http://localhost:3000/admin
- Transparent overlay: http://localhost:3000

## Using with OBS

1. Add a "Browser Source" in OBS
2. Set the URL to your deployed application or http://localhost:3000 if running locally
3. Set width/height as needed
4. Check "Refresh browser when scene becomes active"

## Customizing the text display

You can customize the text appearance by adding URL parameters:

```
http://localhost:3000/?fontSize=60&textColor=yellow&textShadow=2px%202px%204px%20%23000&refreshInterval=3
```

Available parameters:
- `fontSize` - Size of the text in pixels (default: 40)
- `textColor` - Color of the text (default: white)
- `fontStyle` - Font style: normal, italic (default: normal)
- `fontWeight` - Font weight: normal, bold, etc. (default: bold)
- `textShadow` - CSS text shadow property (default: 2px 2px 4px rgba(0,0,0,0.5))
- `refreshInterval` - Refresh interval in seconds (default: 5)

## Deployment

For production use, deploy to your preferred hosting service like Vercel, Netlify, or any other Next.js compatible platform.
