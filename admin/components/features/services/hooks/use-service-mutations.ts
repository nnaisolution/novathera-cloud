"use client";

import { useTRPC } from "@/lib/trpc/client";
import { getTrpcErrorMessage } from "@/lib/trpc/error-message";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { z } from "zod";
import type {
  ServiceFormValues,
  categoryFormSchema,
  packageFormSchema,
} from "../schemas/service.schema";

type CategoryForm = z.infer<typeof categoryFormSchema>;
type PackageForm = z.infer<typeof packageFormSchema>;

function serviceToPayload(values: ServiceFormValues) {
  return {
    name: values.name,
    categoryId: values.categoryId,
    shortDescription: values.shortDescription || undefined,
    detailedDescription: values.detailedDescription || undefined,
    imageUrl: values.imageUrl || undefined,
    tags: values.tags
      ? values.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [],
    status: values.status,
    durationMinutes: values.durationMinutes,
    bufferAfterMinutes: values.bufferAfterMinutes,
    minAdvanceBookingMinutes: values.minAdvanceBookingMinutes,
    maxAdvanceBookingDays: values.maxAdvanceBookingDays,
    requiresConsultation: values.requiresConsultation,
    standardPriceCents: Math.round(values.standardPrice * 100),
    memberPriceCents: values.memberPrice
      ? Math.round(values.memberPrice * 100)
      : undefined,
    taxApplicable: values.taxApplicable,
    depositRequired: values.depositRequired,
    depositAmountCents: values.depositAmount
      ? Math.round(values.depositAmount * 100)
      : undefined,
    anyAssignedStaff: values.anyAssignedStaff,
    clientCanChooseStaff: values.clientCanChooseStaff,
    staffEmployeeIds: values.staffEmployeeIds,
    locations: values.locations.map((l) => ({
      locationId: l.locationId,
      isAvailable: l.isAvailable,
      priceOverrideCents: l.priceOverride
        ? Math.round(l.priceOverride * 100)
        : undefined,
      durationOverrideMinutes: l.durationOverrideMinutes,
      roomOrEquipment: l.roomOrEquipment || undefined,
    })),
  };
}

export function useServiceMutations() {
  const trpc = useTRPC();
  const qc = useQueryClient();

  const invalidateAll = () => {
    void qc.invalidateQueries({ queryKey: trpc.services.list.queryKey() });
    void qc.invalidateQueries({
      queryKey: trpc.serviceCategories.list.queryKey(),
    });
    void qc.invalidateQueries({ queryKey: trpc.packages.list.queryKey() });
  };

  const createService = useMutation(
    trpc.services.create.mutationOptions({
      onSuccess: () => {
        toast.success("Service created");
        invalidateAll();
      },
      onError: (error: unknown) => toast.error(getTrpcErrorMessage(error)),
    }),
  );

  const updateService = useMutation(
    trpc.services.update.mutationOptions({
      onSuccess: () => {
        toast.success("Service updated");
        invalidateAll();
      },
      onError: (error: unknown) => toast.error(getTrpcErrorMessage(error)),
    }),
  );

  const deleteService = useMutation(
    trpc.services.delete.mutationOptions({
      onSuccess: () => {
        toast.success("Service deleted");
        invalidateAll();
      },
      onError: (error: unknown) => toast.error(getTrpcErrorMessage(error)),
    }),
  );

  const createCategory = useMutation(
    trpc.serviceCategories.create.mutationOptions({
      onSuccess: () => {
        toast.success("Category created");
        invalidateAll();
      },
      onError: (error: unknown) => toast.error(getTrpcErrorMessage(error)),
    }),
  );

  const updateCategory = useMutation(
    trpc.serviceCategories.update.mutationOptions({
      onSuccess: () => {
        toast.success("Category updated");
        invalidateAll();
      },
      onError: (error: unknown) => toast.error(getTrpcErrorMessage(error)),
    }),
  );

  const deleteCategory = useMutation(
    trpc.serviceCategories.delete.mutationOptions({
      onSuccess: () => {
        toast.success("Category deleted");
        invalidateAll();
      },
      onError: (error: unknown) => toast.error(getTrpcErrorMessage(error)),
    }),
  );

  const reorderCategories = useMutation(
    trpc.serviceCategories.reorder.mutationOptions({
      onSuccess: () => invalidateAll(),
      onError: (error: unknown) => toast.error(getTrpcErrorMessage(error)),
    }),
  );

  const createPackage = useMutation(
    trpc.packages.create.mutationOptions({
      onSuccess: () => {
        toast.success("Package created");
        invalidateAll();
      },
      onError: (error: unknown) => toast.error(getTrpcErrorMessage(error)),
    }),
  );

  const updatePackage = useMutation(
    trpc.packages.update.mutationOptions({
      onSuccess: () => {
        toast.success("Package updated");
        invalidateAll();
      },
      onError: (error: unknown) => toast.error(getTrpcErrorMessage(error)),
    }),
  );

  const deletePackage = useMutation(
    trpc.packages.delete.mutationOptions({
      onSuccess: () => {
        toast.success("Package deleted");
        invalidateAll();
      },
      onError: (error: unknown) => toast.error(getTrpcErrorMessage(error)),
    }),
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const call = (mutation: any, input: unknown) =>
    mutation.mutateAsync(input) as Promise<unknown>;

  return {
    createService: (v: ServiceFormValues) =>
      call(createService, serviceToPayload(v)),
    updateService: (id: string, v: ServiceFormValues) =>
      call(updateService, { id, ...serviceToPayload(v) }),
    deleteService: (id: string) => call(deleteService, { id }),
    createCategory: (v: CategoryForm) =>
      call(createCategory, { ...v, iconUrl: v.iconUrl || undefined }),
    updateCategory: (id: string, v: CategoryForm) =>
      call(updateCategory, { id, ...v, iconUrl: v.iconUrl || undefined }),
    deleteCategory: (id: string) => call(deleteCategory, { id }),
    reorderCategories: (orderedIds: string[]) =>
      call(reorderCategories, { orderedIds }),
    createPackage: (v: PackageForm) =>
      call(createPackage, {
        ...v,
        priceCents: Math.round(v.price * 100),
        validityDays: v.validityDays || undefined,
      }),
    updatePackage: (id: string, v: PackageForm) =>
      call(updatePackage, {
        id,
        ...v,
        priceCents: Math.round(v.price * 100),
        validityDays: v.validityDays || undefined,
      }),
    deletePackage: (id: string) => call(deletePackage, { id }),
    isCreating: createService.isPending,
    isUpdating: updateService.isPending,
  };
}
