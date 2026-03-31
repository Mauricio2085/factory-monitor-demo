# Node-RED: simulated OPC UA → MQTT

This folder versions a **Node-RED flow** that mimics periodic OPC UA tag reads and publishes telemetry to an MQTT broker in the same format the backend expects (`backend/src/ingestion/contract.ts`, `backend/src/mqtt/ingestion.ts`).

## Versioned artifact

| File | Purpose |
|------|---------|
| [flows/opc-ua-simulator-mqtt.json](flows/opc-ua-simulator-mqtt.json) | Flow export (import via Node-RED **Menu → Import**). |

## Prerequisites

- Node-RED (local install or container).
- An MQTT broker reachable from Node-RED (e.g. Mosquitto on `localhost:1883`).
- Optional: backend with `MQTT_URL` set so it subscribes and persists to Timescale (`machine_telemetry`).

## Import

1. Start Node-RED and open the editor.
2. **Menu (☰) → Import → select a file** and choose `flows/opc-ua-simulator-mqtt.json`.
3. **Deploy**.

## What the flow does

- Two **inject** nodes fire on a timer (2 s for line 1, 2.5 s for line 2).
- Each **function** node picks a random simulated tag (`motor_rpm`, `line_pressure_bar`, `temperature_c`), adds noise, occasionally marks **bad quality** (`quality: 0`, `value: null`), sets **`source_ts`** to ISO-8601, and builds **`metadata`** (allowed by the ingest schema).
- **`msg.topic`** is set to `{prefix}/line/{id}/telemetry` with default prefix **`factory`** (lines **1** and **2**).
- A single **mqtt out** node publishes **QoS 1** UTF-8 JSON payloads.

## Align with your environment

| Setting | Where to change |
|--------|------------------|
| Broker host/port | Double-click the **factory-mqtt** MQTT broker config node (or edit the `mqtt-broker` entry before import). |
| Topic prefix | Edit both function nodes: variable `topicPrefix` must match backend **`MQTT_TOPIC_PREFIX`** (default `factory`). |
| Line IDs | Edit `lineId` in each function; IDs must exist in `production_lines` and match your subscribe pattern. |

## Contract (summary)

- **Topic:** `{MQTT_TOPIC_PREFIX}/line/{lineId}/telemetry` (no trailing slash on the prefix).
- **Body:** JSON with **`tag`** (required), optional **`value`**, **`quality`**, **`time`** or **`source_ts`**, **`metadata`**.

After changing the JSON on disk, re-import or paste the updated nodes in Node-RED and deploy; consider committing the updated `flows/opc-ua-simulator-mqtt.json` so the demo stays reproducible.
