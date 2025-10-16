export async function recordAndTranscribe(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  if (!navigator.mediaDevices?.getUserMedia) return null;

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const chunks: Blob[] = [];
  // @ts-expect-error - MediaRecorder exists in browsers
  const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });

  return new Promise<string | null>((resolve) => {
    recorder.ondataavailable = (e: BlobEvent) => {
      if (e.data.size > 0) chunks.push(e.data);
    };
    recorder.onstop = async () => {
      const blob = new Blob(chunks, { type: "audio/webm" });
      const form = new FormData();
      form.append("file", blob, "audio.webm");
      try {
        const res = await fetch("/api/transcribe", { method: "POST", body: form });
        const data = await res.json();
        resolve(data.text ?? null);
      } catch {
        resolve(null);
      } finally {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
    recorder.start();
    setTimeout(() => recorder.stop(), 4000);
  });
}
