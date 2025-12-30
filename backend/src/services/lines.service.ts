import { query } from "../config/database.js";
import { ProductionLine, ProductionRun } from "../types/index.js";

export class LinesService {
  async getAllLines(): Promise<ProductionLine[]> {
    const result = await query(
      "SELECT * FROM production_lines WHERE is_active = true ORDER BY id"
    );
    return result.rows;
  }

  async getLineById(id: number): Promise<ProductionLine | null> {
    const result = await query("SELECT * FROM production_lines WHERE id = $1", [
      id,
    ]);
    return result.rows[0] || null;
  }

  async getCurrentRun(lineId: number): Promise<ProductionRun | null> {
    const result = await query(
      `SELECT * FROM production_runs 
       WHERE line_id = $1 AND status = 'running' 
       ORDER BY start_time DESC 
       LIMIT 1`,
      [lineId]
    );
    return result.rows[0] || null;
  }

  async getLineStats(lineId: number) {
    const line = await this.getLineById(lineId);
    const currentRun = await this.getCurrentRun(lineId);

    if (!line || !currentRun) {
      return null;
    }

    return {
      line,
      currentRun,
    };
  }
}
