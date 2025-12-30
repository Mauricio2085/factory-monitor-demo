import { query } from "../config/database.js";
import {
  calculateOEE,
  calculateMTBF,
  calculateMTTR,
} from "../utils/calculations.js";

export class MetricsService {
  async getOEE(lineId: number, runId: number) {
    // Get production run data
    const runResult = await query(
      `SELECT pr.*, pl.target_cycle_time 
       FROM production_runs pr
       JOIN production_lines pl ON pr.line_id = pl.id
       WHERE pr.id = $1 AND pr.line_id = $2`,
      [runId, lineId]
    );

    if (runResult.rows.length === 0) {
      return null;
    }

    const run = runResult.rows[0];

    // Calculate planned production time
    const startTime = new Date(run.start_time);
    const endTime = run.end_time ? new Date(run.end_time) : new Date();
    const plannedProductionTime =
      (endTime.getTime() - startTime.getTime()) / (1000 * 60); // minutes

    // Get total downtime
    const downtimeResult = await query(
      `SELECT COALESCE(SUM(duration_minutes), 0) as total_downtime
       FROM downtime_events
       WHERE run_id = $1`,
      [runId]
    );

    const totalDowntime = parseFloat(downtimeResult.rows[0].total_downtime);

    // Calculate OEE
    const oeeData = calculateOEE(
      plannedProductionTime,
      totalDowntime,
      run.actual_quantity,
      run.good_quantity,
      run.target_cycle_time
    );

    return oeeData;
  }

  async getDowntimeEvents(lineId: number, limit: number = 10) {
    const result = await query(
      `SELECT de.*, pr.shift
       FROM downtime_events de
       JOIN production_runs pr ON de.run_id = pr.id
       WHERE de.line_id = $1
       ORDER BY de.start_time DESC
       LIMIT $2`,
      [lineId, limit]
    );

    return result.rows;
  }

  async getDowntimeByCategory(lineId: number) {
    const result = await query(
      `SELECT 
         category,
         COUNT(*) as count,
         COALESCE(SUM(duration_minutes), 0) as total_minutes
       FROM downtime_events
       WHERE line_id = $1
       GROUP BY category
       ORDER BY total_minutes DESC`,
      [lineId]
    );

    return result.rows;
  }

  async getQualityMetrics(lineId: number, runId: number) {
    // Get production run data
    const runResult = await query(
      "SELECT * FROM production_runs WHERE id = $1 AND line_id = $2",
      [runId, lineId]
    );

    if (runResult.rows.length === 0) {
      return null;
    }

    const run = runResult.rows[0];

    // Get defect breakdown
    const defectsResult = await query(
      `SELECT 
         defect_type,
         SUM(defect_count) as total_count
       FROM quality_checks
       WHERE run_id = $1 AND defect_type IS NOT NULL
       GROUP BY defect_type
       ORDER BY total_count DESC`,
      [runId]
    );

    // Calculate FPY (First Pass Yield)
    const fpy =
      run.actual_quantity > 0
        ? (run.good_quantity / run.actual_quantity) * 100
        : 0;

    return {
      totalProduced: run.actual_quantity,
      goodUnits: run.good_quantity,
      defectUnits: run.defect_quantity,
      fpy: Math.round(fpy * 100) / 100,
      defectRate:
        Math.round((run.defect_quantity / run.actual_quantity) * 10000) / 100,
      defectsByType: defectsResult.rows,
    };
  }

  async getMTBFMTTR(lineId: number, days: number = 7) {
    // Get downtime events for the period
    const result = await query(
      `SELECT 
         COUNT(CASE WHEN category = 'breakdown' THEN 1 END) as breakdown_count,
         COALESCE(SUM(CASE WHEN category = 'breakdown' THEN duration_minutes END), 0) as total_breakdown_time,
         MIN(start_time) as period_start,
         MAX(COALESCE(end_time, NOW())) as period_end
       FROM downtime_events
       WHERE line_id = $1 
         AND start_time >= NOW() - INTERVAL '${days} days'`,
      [lineId]
    );

    const data = result.rows[0];
    const breakdownCount = parseInt(data.breakdown_count);
    const totalBreakdownTime = parseFloat(data.total_breakdown_time);

    // Calculate total operating time (in hours)
    const periodStart = new Date(data.period_start);
    const periodEnd = new Date(data.period_end);
    const totalTime =
      (periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60); // hours

    const mtbf = calculateMTBF(totalTime, breakdownCount);
    const mttr = calculateMTTR(totalBreakdownTime, breakdownCount);

    return {
      mtbf,
      mttr,
      breakdownCount,
      totalDowntime: totalBreakdownTime,
      periodDays: days,
    };
  }
}
