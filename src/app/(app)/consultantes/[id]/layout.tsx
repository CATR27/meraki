import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ConsultanteHeader } from "@/features/consultantes/components/consultante-header";
import { ConsultanteTabs } from "@/features/consultantes/components/consultante-tabs";

export default function ConsultanteLayout({ children, params }: LayoutProps<"/consultantes/[id]">) {
  return (
    <>
      <Suspense fallback={<HeaderSkeleton />}>
        <Encabezado params={params} />
      </Suspense>
      {children}
    </>
  );
}

async function Encabezado({ params }: { params: LayoutProps<"/consultantes/[id]">["params"] }) {
  const { id } = await params;
  return (
    <>
      <ConsultanteHeader id={id} />
      <ConsultanteTabs id={id} />
    </>
  );
}

function HeaderSkeleton() {
  return (
    <div className="mb-8 grid gap-4" aria-hidden="true">
      <Skeleton className="h-4 w-28" />
      <div className="flex items-center gap-4">
        <Skeleton className="size-[76px] rounded-full" />
        <div className="grid gap-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-5 w-40" />
        </div>
      </div>
      <Skeleton className="h-12 w-full max-w-lg rounded-full" />
    </div>
  );
}
