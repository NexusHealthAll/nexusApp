type WaitlistErrorCode = "config" | "duplicate" | "network" | "unknown";

interface FirebaseWaitlistConfig {
  apiKey: string;
  projectId: string;
  collectionId: string;
}

export type WaitlistRole = "hospital" | "health-worker";

export interface WaitlistLeadSubmission {
  role: WaitlistRole;
  source: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  hospitalName?: string;
  location?: string;
  roleCategory?: string;
  professionalTitle?: string;
  licenseNumber?: string;
}

interface FirestoreDocument {
  name: string;
}

interface FirestoreRunQueryResult {
  document?: FirestoreDocument;
}

interface FirestoreErrorResponse {
  error?: {
    message?: string;
  };
}

export class WaitlistSubmissionError extends Error {
  readonly code: WaitlistErrorCode;

  constructor(code: WaitlistErrorCode, message: string) {
    super(message);
    this.code = code;
    this.name = "WaitlistSubmissionError";
  }
}

function getFirebaseWaitlistConfig(): FirebaseWaitlistConfig {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY?.trim();
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim();
  const collectionId = import.meta.env.VITE_FIREBASE_WAITLIST_COLLECTION?.trim();

  if (!apiKey || !projectId || !collectionId) {
    throw new WaitlistSubmissionError(
      "config",
      "Firebase waitlist configuration is missing.",
    );
  }

  return {
    apiKey,
    projectId,
    collectionId,
  };
}

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as FirestoreErrorResponse;
    return (
      payload.error?.message || `Request failed with status ${response.status}.`
    );
  } catch {
    return `Request failed with status ${response.status}.`;
  }
}

async function hasExistingEmail(
  config: FirebaseWaitlistConfig,
  email: string,
): Promise<boolean> {
  const runQueryUrl = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(config.projectId)}/databases/(default)/documents:runQuery?key=${encodeURIComponent(config.apiKey)}`;

  const queryPayload = {
    structuredQuery: {
      from: [{ collectionId: config.collectionId }],
      where: {
        fieldFilter: {
          field: { fieldPath: "email" },
          op: "EQUAL",
          value: { stringValue: email },
        },
      },
      limit: 1,
    },
  };

  const response = await fetch(runQueryUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(queryPayload),
  });

  if (!response.ok) {
    const message = await parseErrorMessage(response);
    throw new WaitlistSubmissionError(
      "network",
      `Could not verify waitlist status. ${message}`,
    );
  }

  const result = (await response.json()) as FirestoreRunQueryResult[];
  return result.some((item) => Boolean(item.document?.name));
}

async function createWaitlistEntry(
  config: FirebaseWaitlistConfig,
  fields: Record<string, string>,
): Promise<void> {
  const createUrl = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(config.projectId)}/databases/(default)/documents/${encodeURIComponent(config.collectionId)}?key=${encodeURIComponent(config.apiKey)}`;

  const payloadFields: Record<
    string,
    {
      stringValue?: string;
      timestampValue?: string;
    }
  > = {
    status: { stringValue: "pending" },
    createdAt: { timestampValue: new Date().toISOString() },
    userAgent: {
      stringValue:
        typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
    },
  };

  Object.entries(fields).forEach(([fieldName, fieldValue]) => {
    if (!fieldValue) {
      return;
    }

    payloadFields[fieldName] = { stringValue: fieldValue };
  });

  const payload = {
    fields: payloadFields,
  };

  const response = await fetch(createUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await parseErrorMessage(response);
    throw new WaitlistSubmissionError(
      "network",
      `Could not save your waitlist request. ${message}`,
    );
  }
}

export async function submitWaitlistEmailToFirebase(
  email: string,
  source: string,
): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();

  try {
    const config = getFirebaseWaitlistConfig();
    const alreadyExists = await hasExistingEmail(config, normalizedEmail);

    if (alreadyExists) {
      throw new WaitlistSubmissionError("duplicate", "email is on waitlist");
    }

    await createWaitlistEntry(config, {
      email: normalizedEmail,
      source,
    });
  } catch (error) {
    if (error instanceof WaitlistSubmissionError) {
      throw error;
    }

    throw new WaitlistSubmissionError(
      "unknown",
      "Unexpected waitlist error. Please try again.",
    );
  }
}

export async function submitWaitlistLeadToFirebase(
  submission: WaitlistLeadSubmission,
): Promise<void> {
  const normalizedEmail = submission.email.trim().toLowerCase();

  try {
    const config = getFirebaseWaitlistConfig();
    const alreadyExists = await hasExistingEmail(config, normalizedEmail);

    if (alreadyExists) {
      throw new WaitlistSubmissionError("duplicate", "email is on waitlist");
    }

    await createWaitlistEntry(config, {
      role: submission.role,
      source: submission.source,
      fullName: submission.fullName.trim(),
      email: normalizedEmail,
      phoneNumber: submission.phoneNumber.trim(),
      hospitalName: submission.hospitalName?.trim() || "",
      location: submission.location?.trim() || "",
      roleCategory: submission.roleCategory?.trim() || "",
      professionalTitle: submission.professionalTitle?.trim() || "",
      licenseNumber: submission.licenseNumber?.trim() || "",
    });
  } catch (error) {
    if (error instanceof WaitlistSubmissionError) {
      throw error;
    }

    throw new WaitlistSubmissionError(
      "unknown",
      "Unexpected waitlist error. Please try again.",
    );
  }
}
