export interface ProductionLine {
  id: number;
  name: string;
  description: string | null;
  target_cycle_time: number;
  target_units_per_hour: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ProductionRun {
  id: number;
  line_id: number;
  shift: "morning" | "afternoon" | "night";
  start_time: Date;
  end_time: Date | null;
  target_quantity: number;
  actual_quantity: number;
  good_quantity: number;
  defect_quantity: number;
  status: "running" | "stopped" | "completed";
  created_at: Date;
  updated_at: Date;
}

export interface DowntimeEvent {
  id: number;
  line_id: number;
  run_id: number;
  category: "breakdown" | "setup" | "no_operator" | "starved" | "blocked";
  reason: string;
  start_time: Date;
  end_time: Date | null;
  duration_minutes: number | null;
  resolved_by: string | null;
  notes: string | null;
  created_at: Date;
}

export interface QualityCheck {
  id: number;
  line_id: number;
  run_id: number;
  check_time: Date;
  defect_type: string | null;
  defect_count: number;
  inspector: string | null;
  notes: string | null;
  created_at: Date;
}
