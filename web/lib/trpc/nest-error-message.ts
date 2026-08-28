type ZodFlattened = {
  formErrors?: string[];
  fieldErrors?: Record<string, string[] | undefined>;
};

type TrpcErrorShape = {
  message?: string;
  data?: {
    code?: string;
    zodError?: ZodFlattened | null;
  };
};

const CODE_MESSAGES: Record<string, string> = {
  UNAUTHORIZED: "Please sign in to continue.",
  FORBIDDEN: "You don't have permission to do this.",
  NOT_FOUND: "The requested item could not be found.",
  CONFLICT: "This conflicts with existing data.",
  BAD_REQUEST: "Invalid request. Please check your input.",
  INTERNAL_SERVER_ERROR: "Something went wrong. Please try again.",
  TIMEOUT: "The request timed out. Please try again.",
  PARSE_ERROR: "Invalid request. Please try again.",
};

function formatFieldName(field: string) {
  return field
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

function messageFromZod(zodError: ZodFlattened): string | null {
  const formErrors = zodError.formErrors?.filter(Boolean) ?? [];
  if (formErrors.length > 0) return formErrors[0];

  for (const [field, messages] of Object.entries(zodError.fieldErrors ?? {})) {
    const first = messages?.find(Boolean);
    if (first) {
      return field === "_errors" ? first : `${formatFieldName(field)}: ${first}`;
    }
  }

  return null;
}

function looksLikeDevError(message: string) {
  if (message.length > 180) return true;
  if (/^\s*[\[{]/.test(message)) return true;
  if (message.includes("Prisma") || message.includes("TRPCError")) return true;
  if (message.includes("\n    at ")) return true;
  if (
    /^(UNAUTHORIZED|FORBIDDEN|NOT_FOUND|INTERNAL_SERVER_ERROR)$/.test(message)
  )
    return true;
  return false;
}

function isFriendlyMessage(message: string) {
  return message.length > 0 && !looksLikeDevError(message);
}

export function getNestTrpcErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (!error || typeof error !== "object") return fallback;

  const err = error as TrpcErrorShape;
  const zodMessage = err.data?.zodError
    ? messageFromZod(err.data.zodError)
    : null;
  if (zodMessage) return zodMessage;

  const message = err.message?.trim();
  if (message && isFriendlyMessage(message)) return message;

  const code = err.data?.code;
  if (code && CODE_MESSAGES[code]) return CODE_MESSAGES[code];

  return fallback;
}
