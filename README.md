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

- `GET /v1/nrc-types` - Get all NRC types
- `GET /v1/states` - Get all states
- `GET /v1/townships` - Get all townships
- `GET /v1/states/:stateId/townships` - Get townships by state ID
- `GET /v1/states/number/:number/townships` - Get townships by state number
- `GET /v1/states/code/:code` - Get state by code
- `GET /v1/townships/code/:code` - Get township by code
- `POST /v1/nrc/parse` - Parse and validate NRC format

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
