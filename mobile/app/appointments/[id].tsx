import { Redirect, useLocalSearchParams } from "expo-router";

function firstParam(value: string | string[] | undefined): string | undefined {
  if (typeof value === "string" && value.length > 0) return value;
  if (Array.isArray(value) && typeof value[0] === "string" && value[0].length > 0) {
    return value[0];
  }
  return undefined;
}

export default function AppointmentDeepLink() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = firstParam(params.id);
  if (!id) return <Redirect href="/(app)/care/appointments" />;
  return <Redirect href={{ pathname: "/(app)/care/appointments/[id]", params: { id } }} />;
}
