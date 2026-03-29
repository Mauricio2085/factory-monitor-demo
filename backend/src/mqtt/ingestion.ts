import mqtt from "mqtt";
import { config } from "../config/env.js";
import { getTelemetrySubscribePattern } from "../ingestion/contract.js";
import {
  insertTelemetryPoint,
  parseLineIdFromTelemetryTopic,
} from "../services/telemetry-ingestion.service.js";

export function startMqttIngestion(): () => void {
  const url = config.mqtt.url.trim();
  if (!url) {
    console.log("ℹ️  MQTT_URL not set — MQTT telemetry ingestion disabled");
    return () => {};
  }

  const pattern = getTelemetrySubscribePattern();
  const prefix = config.mqtt.topicPrefix;

  const client = mqtt.connect(url, {
    reconnectPeriod: 5000,
    connectTimeout: 10_000,
  });

  client.on("connect", () => {
    client.subscribe(pattern, { qos: 1 }, (err) => {
      if (err) {
        console.error("❌ MQTT subscribe failed:", err);
        return;
      }
      console.log(`📡 MQTT subscribed: ${pattern}`);
    });
  });

  client.on("message", async (topic, payload) => {
    const lineId = parseLineIdFromTelemetryTopic(topic, prefix);
    if (lineId === null) {
      console.warn("MQTT: ignored topic (unexpected shape):", topic);
      return;
    }

    let body: unknown;
    try {
      body = JSON.parse(payload.toString("utf8"));
    } catch {
      console.warn("MQTT: invalid JSON on topic", topic);
      return;
    }

    try {
      await insertTelemetryPoint(lineId, body);
    } catch (e) {
      console.error("MQTT: insert failed", { topic, lineId, err: e });
    }
  });

  client.on("error", (err) => {
    console.error("❌ MQTT client error:", err);
  });

  return () => {
    client.end(true);
    console.log("MQTT client disconnected");
  };
}
