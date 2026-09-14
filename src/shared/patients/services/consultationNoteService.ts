import apiClient from "@/lib/apiClient";

// Mirrors nexus-backend's src/models/consultation_note.rs response shapes.
// See src/handlers/consultation_notes.rs for the live routes:
//   POST   /api/v1/patients/{patientId}/consultation-notes
//   GET    /api/v1/patients/{patientId}/consultation-notes
//   GET    /api/v1/consultation-notes/{id}
//   POST   /api/v1/consultation-notes/{id}/audio-chunk
//   PATCH  /api/v1/consultation-notes/{id}
//   POST   /api/v1/consultation-notes/{id}/complete

export type ConsultationNoteStatus = "recording" | "completed" | "failed";

export interface ConsultationNote {
  id: string;
  patient_id: string;
  hospital_id: string;
  recorded_by: string;
  status: ConsultationNoteStatus;
  full_transcript: string;
  language: string;
  duration_seconds: number;
  chief_complaint: string | null;
  history_of_present_illness: string | null;
  assessment: string | null;
  plan: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface ConsultationTranscriptSegment {
  id: string;
  consultation_note_id: string;
  sequence: number;
  audio_path: string;
  audio_duration_seconds: number | null;
  transcript_text: string;
  status: "completed" | "failed";
  last_error: string | null;
  created_at: string;
}

export interface ConsultationNoteDetail extends ConsultationNote {
  segments: ConsultationTranscriptSegment[];
}

export interface UpdateConsultationNoteRequest {
  chief_complaint?: string;
  history_of_present_illness?: string;
  assessment?: string;
  plan?: string;
}

export interface AudioChunkResponse {
  sequence: number;
  transcript_text: string;
  status: "completed" | "failed";
  full_transcript: string;
}

export class ConsultationNoteService {
  static async start(patientId: string): Promise<{ id: string }> {
    const res = await apiClient.post<{ id: string }>(
      `/api/v1/patients/${patientId}/consultation-notes`,
    );
    return res.data;
  }

  static async listForPatient(patientId: string): Promise<ConsultationNote[]> {
    const res = await apiClient.get<ConsultationNote[]>(
      `/api/v1/patients/${patientId}/consultation-notes`,
    );
    return res.data;
  }

  static async get(id: string): Promise<ConsultationNoteDetail> {
    const res = await apiClient.get<ConsultationNoteDetail>(`/api/v1/consultation-notes/${id}`);
    return res.data;
  }

  /** `sequence` is 0-indexed chunk order — the caller tracks it, not the server. */
  static async uploadAudioChunk(
    id: string,
    sequence: number,
    audioBlob: Blob,
    filename: string,
  ): Promise<AudioChunkResponse> {
    const form = new FormData();
    form.append("sequence", String(sequence));
    form.append("audio", audioBlob, filename);
    const res = await apiClient.post<AudioChunkResponse>(
      `/api/v1/consultation-notes/${id}/audio-chunk`,
      form,
      {
        // Let the browser set the multipart boundary itself — the instance's
        // default 'application/json' header would otherwise break the upload.
        headers: { "Content-Type": undefined },
        timeout: 60_000,
      },
    );
    return res.data;
  }

  static async update(
    id: string,
    fields: UpdateConsultationNoteRequest,
  ): Promise<ConsultationNote> {
    const res = await apiClient.patch<ConsultationNote>(
      `/api/v1/consultation-notes/${id}`,
      fields,
    );
    return res.data;
  }

  static async complete(id: string): Promise<ConsultationNote> {
    const res = await apiClient.post<ConsultationNote>(
      `/api/v1/consultation-notes/${id}/complete`,
    );
    return res.data;
  }
}
