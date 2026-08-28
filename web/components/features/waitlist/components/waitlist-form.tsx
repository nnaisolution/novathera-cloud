"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { usePathname } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { useJoinWaitlist } from "@/components/features/waitlist/hooks/use-join-waitlist";
import {
  joinWaitlistInput,
  type JoinWaitlistInput,
} from "@/components/features/waitlist/schemas/join-waitlist";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

type WaitlistFormProps = {
  onSuccess?: () => void;
  submitLabel?: string;
};

export function WaitlistForm({
  onSuccess,
  submitLabel = "Join the waitlist",
}: WaitlistFormProps) {
  const pathname = usePathname();
  const joinWaitlist = useJoinWaitlist();

  const form = useForm<JoinWaitlistInput>({
    resolver: zodResolver(joinWaitlistInput),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      source: pathname,
      website: "",
    },
  });

  function onSubmit(values: JoinWaitlistInput) {
    const phone = values.phone?.trim();

    joinWaitlist.mutate(
      {
        name: values.name,
        email: values.email,
        phone: phone || undefined,
        source: values.source ?? pathname,
        website: values.website ?? "",
      },
      {
        onSuccess: () => {
          toast.success("You're on the list", {
            description: "We'll be in touch the moment we launch.",
          });
          form.reset({
            name: "",
            email: "",
            phone: "",
            source: pathname,
            website: "",
          });
          onSuccess?.();
        },
        onError: (error) => {
          toast.error("Something went wrong", {
            description: error.message || "Please try again in a moment.",
          });
        },
      },
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem className="absolute -left-[9999px] h-0 w-0 overflow-hidden opacity-0" aria-hidden>
              <FormLabel>Website</FormLabel>
              <FormControl>
                <Input tabIndex={-1} autoComplete="off" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  autoComplete="name"
                  placeholder="Your name"
                  className="h-10"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  autoComplete="email"
                  placeholder="you@email.com"
                  className="h-10"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Phone <span className="text-muted-foreground font-normal">(optional)</span>
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="tel"
                  autoComplete="tel"
                  placeholder="+1 (555) 000-0000"
                  className="h-10"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={joinWaitlist.isPending}
          className="h-11 w-full rounded-2xl text-base font-medium uppercase tracking-wide"
        >
          {joinWaitlist.isPending ? "Sending…" : submitLabel}
        </Button>

        <p className="text-muted-foreground text-xs">
          No spam. Just a gentle note the moment we launch.
        </p>
      </form>
    </Form>
  );
}
