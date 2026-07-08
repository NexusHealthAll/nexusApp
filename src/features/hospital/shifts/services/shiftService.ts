import type { ShiftFormData } from "../types";

export class ShiftService {
  /**
   * Saves a shift as draft. No real draft-persistence endpoint exists yet
   * in nexus-backend — this stays a local mock until one is added; real
   * shift creation goes through `useHospitalShift`'s `createShift`, which
   * does call the live `POST /api/v1/shifts` endpoint.
   */
  static async saveDraft(
    _data: Partial<ShiftFormData>,
  ): Promise<{ id: string }> {
    // TODO: Replace with actual API call
    return new Promise((resolve) =>
      setTimeout(() => resolve({ id: crypto.randomUUID() }), 400),
    );
  }
}
