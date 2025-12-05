# Myanmar Identity API & Tester

API and web interface for Myanmar National Registration Card (NRC) validation and testing.

## Installation

```bash
npm install
```

## Usage

```bash
npm start
```

Visit `http://localhost:3000` to use the NRC tester interface.

## Project Structure

```
myanmar-identity-api/
├── server/
│   ├── app.js              # Express server
│   └── nrc_data_test.json  # NRC data
├── public/
│   ├── index.html          # Web interface
│   ├── style.css           # Styles
│   └── script.js           # Frontend logic
└── package.json
```

## API Endpoints

- `GET /api/nrc-types` - Get all NRC types
- `GET /api/states` - Get all states
- `GET /api/townships` - Get all townships
- `GET /api/states/:stateId/townships` - Get townships by state ID
- `GET /api/states/number/:number/townships` - Get townships by state number
- `GET /api/states/code/:code` - Get state by code
- `GET /api/townships/code/:code` - Get township by code
- `POST /api/nrc/parse` - Parse and validate NRC format

## NRC Format

Format: `14/MaAPa(C)123456`
- `14` - State/Region number (1-14)
- `MaAPa` - Township short code
- `C` - NRC type (N, E, P, T, Y, S)
- `123456` - 6-digit serial number

## Web Interface Features

- **Build NRC**: Select state, township, type, and serial to generate NRC
- **Test NRC**: Validate existing NRC and get detailed information
- **Real-time validation** with detailed township information