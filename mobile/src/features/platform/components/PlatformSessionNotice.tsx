import { Alert } from "react-native";

import { useAuth } from "../../../auth/AuthProvider";
import { StateMessage } from "../../../components/StateMessage";

type Props = {
  /** Reads inside "… lives on the clinic system", e.g. "Your appointment history". */
  subject: string;
};

/**
 * Shown wherever a screen needs the NestJS platform session and does not have
 * one. Deliberately not an error tone: nothing has gone wrong with the
 * patient's account, and the app is still fully usable everywhere else.
 *
 * Re-verifying by phone is the only recovery, so the action signs out rather
 * than offering a retry that could never succeed.
 */
export function PlatformSessionNotice({ subject }: Props) {
  const { signOut } = useAuth();

  const confirmSignOut = () => {
    Alert.alert(
      "Sign out and verify again?",
      "You'll be asked for your phone number and a new code. Nothing in your record changes.",
      [
        { text: "Not now", style: "cancel" },
        { text: "Sign out", style: "destructive", onPress: () => void signOut() },
      ],
    );
  };

  return (
    <StateMessage
      tone="empty"
      title="Your clinic session has ended"
      body={`${subject} lives on Nova Thera's clinic system, and this device's link to it is no longer valid. The rest of the app — your readings, trends, and profile — still works normally.`}
      note="Verifying your phone again is the only way to re-link this device."
      actionLabel="Sign out and verify"
      onAction={confirmSignOut}
    />
  );
}
