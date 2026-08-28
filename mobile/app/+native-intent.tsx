import { rewriteNativeIntentPath } from "../src/navigation/deepLinks";

export function redirectSystemPath({
  path,
}: {
  path: string;
  initial: boolean;
}): string {
  return rewriteNativeIntentPath(path);
}
