const apiBaseUrl = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? "http://localhost:3000";

const EDIT_JOBS_ENDPOINT = `${apiBaseUrl}/api/jobs`;

export type EditJobStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

export type EditJob = {
  id: string;
  inputUrl: string;
  outputUrl: string | null;
  prompt: string;
  parsedCommand: unknown;
  status: EditJobStatus;
};

type CreateEditJobPayload = {
  prompt: string;
  video: File;
  signal?: AbortSignal;
};

type FetchEditJobOptions = {
  signal?: AbortSignal;
};

const parseErrorMessage = async (response: Response) => {
  try {
    const data = await response.json();
    if (data?.error) return data.error as string;
  } catch {
    // ignore
  }
  return response.statusText || "Request failed";
};

export const createEditJob = async ({ prompt, video, signal }: CreateEditJobPayload): Promise<EditJob> => {
  const formData = new FormData();
  formData.append("prompt", prompt);
  formData.append("video", video);

  const response = await fetch(EDIT_JOBS_ENDPOINT, {
    method: "POST",
    body: formData,
    signal,
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const data = (await response.json()) as { success?: boolean; job?: EditJob };

  if (!data?.job) {
    throw new Error("Invalid response from server");
  }

  return data.job;
};

export const getEditJob = async (id: string, { signal }: FetchEditJobOptions = {}): Promise<EditJob> => {
  const response = await fetch(`${EDIT_JOBS_ENDPOINT}/${id}`, {
    method: "GET",
    signal,
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const data = (await response.json()) as { job?: EditJob };

  if (!data?.job) {
    throw new Error("Invalid response from server");
  }

  return data.job;
};


