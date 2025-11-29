"use client";

import { Toaster as SonnerToaster, toast as sonnerToast, type ToasterProps } from "sonner";

export const Toaster = (props: ToasterProps) => (
  <SonnerToaster richColors closeButton expand={false} {...props} />
);
export const toast = sonnerToast;
