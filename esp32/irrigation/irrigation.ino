/*
 * Smart Irrigation System - Arduino Uno R4 WiFi Firmware
 *
 * Wiring:
 *   Soil Moisture Sensor AO  ->  A0  (14-bit ADC)
 *   Water Pump Relay IN      ->  D7  (Digital Output)
 *
 * Libraries required (install via Arduino Library Manager):
 *   - WiFiS3          (built-in with Arduino UNO R4 board package)
 *   - ArduinoHttpClient  by Arduino
 *   - ArduinoJson        by Benoit Blanchon (v7+)
 *
 * Board: Arduino UNO R4 WiFi
 * Install board package: Tools -> Board Manager -> search "Arduino UNO R4"
 */

#include <WiFiS3.h>
#include <ArduinoHttpClient.h>
#include <ArduinoJson.h>

// ---- Configuration ----
const char WIFI_SSID[]     = "YOUR_WIFI_SSID";
const char WIFI_PASSWORD[] = "YOUR_WIFI_PASSWORD";
const char SERVER_HOST[]   = "your-backend.onrender.com";  // no https://
const int  SERVER_PORT     = 443;                           // 443 for HTTPS, 80 for HTTP
const char ENDPOINT[]      = "/api/sensor-data";
const char PLANT_TYPE[]    = "Tomato";

// ---- Pin Definitions ----
// Arduino Uno R4 WiFi uses standard Arduino pin numbering
const int MOISTURE_PIN = A0;   // Analog pin for soil moisture sensor
const int PUMP_PIN     = 7;    // Digital pin for relay module

// ---- ADC Calibration ----
// Uno R4 WiFi has a 14-bit ADC (0–16383)
// Adjust these by testing your sensor in dry air and submerged in water
const int DRY_VALUE = 16383;   // ADC reading in dry air
const int WET_VALUE = 6000;    // ADC reading in water

// ---- Interval ----
const unsigned long SEND_INTERVAL = 10000;  // 10 seconds
unsigned long lastSend = 0;

// ---- HTTP client objects ----
WiFiSSLClient wifiClient;                                    // use WiFiClient for HTTP
HttpClient httpClient = HttpClient(wifiClient, SERVER_HOST, SERVER_PORT);

void setup() {
  Serial.begin(9600);
  while (!Serial);  // wait for Serial on Uno R4

  pinMode(PUMP_PIN, OUTPUT);
  digitalWrite(PUMP_PIN, LOW);

  connectWiFi();
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi disconnected, reconnecting...");
    connectWiFi();
  }

  unsigned long now = millis();
  if (now - lastSend >= SEND_INTERVAL) {
    lastSend = now;

    int rawValue = analogRead(MOISTURE_PIN);
    int moisture = map(rawValue, DRY_VALUE, WET_VALUE, 0, 100);
    moisture = constrain(moisture, 0, 100);

    Serial.print("Raw: ");
    Serial.print(rawValue);
    Serial.print(" | Moisture: ");
    Serial.print(moisture);
    Serial.println("%");

    bool pumpOn = sendData(moisture);
    digitalWrite(PUMP_PIN, pumpOn ? HIGH : LOW);
    Serial.print("Pump: ");
    Serial.println(pumpOn ? "ON" : "OFF");
  }
}

void connectWiFi() {
  Serial.print("Connecting to ");
  Serial.println(WIFI_SSID);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println();
    Serial.print("Connected! IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\nFailed to connect. Will retry on next loop.");
  }
}

// Returns true if backend says pump should be ON
bool sendData(int moisture) {
  if (WiFi.status() != WL_CONNECTED) return false;

  // Build JSON body
  JsonDocument doc;
  doc["moisture"]  = moisture;
  doc["plantType"] = PLANT_TYPE;

  String body;
  serializeJson(doc, body);

  // Send POST request
  httpClient.beginRequest();
  httpClient.post(ENDPOINT);
  httpClient.sendHeader("Content-Type", "application/json");
  httpClient.sendHeader("Content-Length", body.length());
  httpClient.beginBody();
  httpClient.print(body);
  httpClient.endRequest();

  int statusCode = httpClient.responseStatusCode();
  String response = httpClient.responseBody();

  Serial.print("HTTP status: ");
  Serial.println(statusCode);

  bool pumpOn = false;

  if (statusCode == 201) {
    JsonDocument res;
    DeserializationError err = deserializeJson(res, response);
    if (!err) {
      pumpOn = res["pump"]["status"] | false;
    }
  } else {
    Serial.print("HTTP error: ");
    Serial.println(statusCode);
  }

  return pumpOn;
}
