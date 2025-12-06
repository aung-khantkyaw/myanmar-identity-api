const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Load NRC data
const nrcData = JSON.parse(
  fs.readFileSync(path.join(__dirname, "nrc_data_test.json"), "utf8")
);

const EN_TO_MM_DIGITS = {
  0: "၀",
  1: "၁",
  2: "၂",
  3: "၃",
  4: "၄",
  5: "၅",
  6: "၆",
  7: "၇",
  8: "၈",
  9: "၉",
};

const toMyanmarDigits = (value = "") =>
  String(value).replace(/\d/g, (digit) => EN_TO_MM_DIGITS[digit] || digit);

app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

// Get all NRC types
app.get("/v1/nrc-types", (req, res) => {
  res.json(nrcData.nrcTypes);
});

// Get all states
app.get("/v1/states", (req, res) => {
  res.json(nrcData.nrcStates);
});

// Get all townships
app.get("/v1/townships", (req, res) => {
  res.json(nrcData.nrcTownships);
});

// Get state by code
app.get("/v1/states/code/:code", (req, res) => {
  const state = nrcData.nrcStates.find(
    (s) => s.code === req.params.code.toUpperCase()
  );
  if (!state) return res.status(404).json({ error: "State not found" });
  res.json(state);
});

// Get township by code
app.get("/v1/townships/code/:code", (req, res) => {
  const township = nrcData.nrcTownships.find(
    (t) => t.code === req.params.code.toUpperCase()
  );
  if (!township) return res.status(404).json({ error: "Township not found" });
  res.json(township);
});

// Get townships by state number
app.get("/v1/states/number/:number/townships", (req, res) => {
  const stateNumber = req.params.number;
  const townships = nrcData.nrcTownships.filter(
    (t) => t.stateCode === stateNumber
  );
  res.json(townships);
});

// Parse and validate NRC
app.post("/v1/nrc/parse", (req, res) => {
  const { nrc } = req.body;
  const match = nrc.match(/^(\d{1,2})\/(\w+)\((\w)\)(\d{6})$/);

  if (!match) {
    return res.status(400).json({ error: "Invalid NRC format" });
  }

  const [, stateNumber, townshipCode, nrcType, serialNumber] = match;

  const state = nrcData.nrcStates.find((s) => s.number.en === stateNumber);
  const township = nrcData.nrcTownships.find(
    (t) => t.short.en === townshipCode.toUpperCase()
  );
  const type = nrcData.nrcTypes.find(
    (t) => t.name.en === nrcType.toUpperCase()
  );

  if (!state || !township || !type) {
    return res.status(400).json({ error: "Invalid NRC data" });
  }

  const normalizedNrcEn = `${state.number.en}/${township.short.en}(${type.name.en})${serialNumber}`;
  const serialNumberMm = toMyanmarDigits(serialNumber);
  const normalizedNrcMm = `${state.number.mm}/${township.short.mm}(${type.name.mm})${serialNumberMm}`;

  res.json({
    nrc: {
      en: normalizedNrcEn,
      mm: normalizedNrcMm,
    },
    state: {
      code: state.code,
      number: state.number,
      name: state.name,
    },
    township: {
      code: township.code,
      short: township.short,
      name: township.name,
      stateCode: township.stateCode,
      postalCode: township.postalCode,
      district: township.district,
    },
    type: {
      name: type.name,
    },
    serialNumber: {
      en: serialNumber,
      mm: serialNumberMm,
    },
  });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.listen(PORT, () => {
  console.log(`Myanmar NRC API running on port ${PORT}`);
});
