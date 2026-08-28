import { useRouter } from "expo-router";
import { RefreshControl } from "react-native";

import { NavCard } from "../../../components/NavCard";
import { Screen } from "../../../components/Screen";
import { StateMessage } from "../../../components/StateMessage";
import { colors } from "../../../theme";
import { useProgramEnrollments } from "../hooks/usePrograms";
import {
  enrollmentCaption,
  enrollmentsOfKind,
  type EnrollmentKind,
} from "../programs";

type Copy = {
  kicker: string;
  title: string;
  subtitle: string;
  loadingTitle: string;
  loadingBody: string;
  errorTitle: string;
  emptyTitle: string;
  emptyBody: string;
};

const COPY: Record<EnrollmentKind, Copy> = {
  treatment: {
    kicker: "Care plan",
    title: "Treatment programs",
    subtitle: "Enrollments from your care team. Shown only to you.",
    loadingTitle: "Loading your programs",
    loadingBody: "Fetching enrollments from your record.",
    errorTitle: "We couldn't load your programs",
    emptyTitle: "No treatment programs yet",
    emptyBody:
      "When your care team enrolls you in a program, it will appear here with its status and start date.",
  },
  aftercare: {
    kicker: "Care plan",
    title: "Aftercare",
    subtitle: "Post-procedure programs from your care team. Shown only to you.",
    loadingTitle: "Loading aftercare",
    loadingBody: "Fetching follow-up programs from your record.",
    errorTitle: "We couldn't load aftercare",
    emptyTitle: "No aftercare programs yet",
    emptyBody:
      "After a procedure, any follow-up program your care team assigns will appear here.",
  },
};

type Props = {
  kind: EnrollmentKind;
};

export function EnrollmentList({ kind }: Props) {
  const router = useRouter();
  const list = useProgramEnrollments();
  const copy = COPY[kind];

  const rows = list.data ? enrollmentsOfKind(list.data, kind) : [];
  const isEmpty = list.isSuccess && rows.length === 0;

  return (
    <Screen
      kicker={copy.kicker}
      title={copy.title}
      subtitle={copy.subtitle}
      refreshControl={
        <RefreshControl
          refreshing={list.isFetching && !list.isPending}
          onRefresh={() => void list.refetch()}
          tintColor={colors.primary}
        />
      }
    >
      {list.isError ? (
        <StateMessage
          tone="error"
          title={copy.errorTitle}
          body="Your enrollments are unchanged. Try again in a moment."
          actionLabel="Retry"
          onAction={() => void list.refetch()}
        />
      ) : list.isPending ? (
        <StateMessage tone="loading" title={copy.loadingTitle} body={copy.loadingBody} />
      ) : isEmpty ? (
        <StateMessage tone="empty" title={copy.emptyTitle} body={copy.emptyBody} />
      ) : (
        rows.map((enrollment) => (
          <NavCard
            key={enrollment.id}
            mark={kind === "aftercare" ? "✓" : "▣"}
            title={enrollment.program.title}
            caption={enrollmentCaption(enrollment)}
            onPress={() => router.push(`/(app)/care/programs/${enrollment.id}`)}
          />
        ))
      )}
    </Screen>
  );
}
