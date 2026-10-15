import apiClient from "@/lib/apiClient";

/**
 * Mirrors nexus-backend `DocumentType` (`src/models/registration.rs`) — the
 * legal documents a hospital uploads for compliance review.
 */
export type HospitalDocumentType =
  | "operational_license"
  | "medical_certificate_of_standards"
  | "tax_compliance_certificate"
  | "cac_certificate"
  | "director_id"
  | "other";

/** Mirrors nexus-backend `SubmissionStatus`. */
export type DocumentSubmissionStatus =
  | "draft"
  | "under_review"
  | "approved"
  | "rejected";

export interface HospitalDocument {
  id: string;
  documentType: HospitalDocumentType;
  fileUrl: string;
  fileName: string;
  submissionStatus: DocumentSubmissionStatus;
  uploadedAt: string;
  reviewNotes: string | null;
}

interface HospitalDocumentResponse {
  id: string;
  document_type: HospitalDocumentType;
  file_url: string;
  file_name: string;
  submission_status: DocumentSubmissionStatus;
  uploaded_at: string;
  review_notes: string | null;
}

function fromResponse(d: HospitalDocumentResponse): HospitalDocument {
  return {
    id: d.id,
    documentType: d.document_type,
    fileUrl: d.file_url,
    fileName: d.file_name,
    submissionStatus: d.submission_status,
    uploadedAt: d.uploaded_at,
    reviewNotes: d.review_notes,
  };
}

/**
 * Hospital legal-document submission. The backend already has the full data
 * model for this (`hospital_documents` table + `HospitalDocument` /
 * `UploadDocumentRequest` structs in `src/models/registration.rs`), but as of
 * this writing no route or handler actually wires them up — there's a table
 * and dead model code, but nothing a client can call yet.
 *
 * This service is written against the shape those models imply, the same
 * way `workerDirectoryService.ts` documents an endpoint the backend doesn't
 * have yet: once the backend adds the route, this should work with no
 * frontend changes. Until then, every call fails and callers treat that as
 * "no documents submitted yet" rather than crashing the page.
 *
 * Expected backend routes (none of these exist yet):
 *   GET  /api/v1/hospitals/{hospital_id}/documents       -> HospitalDocumentResponse[]
 *   POST /api/v1/hospitals/{hospital_id}/documents       -> HospitalDocumentResponse
 *     body: { document_type, file_url, file_name, file_mime_type?, file_size_bytes? }
 */
export const HospitalDocumentsService = {
  async listDocuments(hospitalId: string): Promise<HospitalDocument[]> {
    try {
      const res = await apiClient.get<HospitalDocumentResponse[]>(
        `/api/v1/hospitals/${encodeURIComponent(hospitalId)}/documents`,
      );
      return res.data.map(fromResponse);
    } catch {
      return [];
    }
  },

  async uploadDocument(
    hospitalId: string,
    payload: {
      documentType: HospitalDocumentType;
      fileUrl: string;
      fileName: string;
      fileMimeType?: string;
      fileSizeBytes?: number;
    },
  ): Promise<HospitalDocument> {
    const res = await apiClient.post<HospitalDocumentResponse>(
      `/api/v1/hospitals/${encodeURIComponent(hospitalId)}/documents`,
      {
        document_type: payload.documentType,
        file_url: payload.fileUrl,
        file_name: payload.fileName,
        file_mime_type: payload.fileMimeType,
        file_size_bytes: payload.fileSizeBytes,
      },
    );
    return fromResponse(res.data);
  },
};
