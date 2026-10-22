import { AppShell } from "@/components/layout/app-shell";

// Todo lo privado depende de la sesión y de datos clínicos que no se cachean a propósito
// (privacidad y revocación inmediata). Se renderiza por petición con streaming + skeletons.
export const instant = false;

export default function AppLayout({ children }: LayoutProps<"/">) {
  return <AppShell>{children}</AppShell>;
}
