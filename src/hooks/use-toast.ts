export function useToast() {
  return {
    toast: ({ title, description }: { title: string; description?: string; variant?: string }) => {
      if (typeof window !== "undefined") {
        // eslint-disable-next-line no-console
        console.log(`[toast] ${title}${description ? `: ${description}` : ""}`);
      }
    },
  };
}
