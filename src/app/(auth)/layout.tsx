import { Logo } from "@/components/brand/logo";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="grid min-h-svh lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-lavanda-500 via-lavanda-700 to-lavanda-900 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div
          aria-hidden="true"
          className="absolute -top-24 -right-24 size-96 rounded-full bg-lavanda-300/30 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-32 -left-16 size-[28rem] rounded-full bg-lavanda-400/25 blur-3xl"
        />
        <Logo variant="light" className="relative" />
        <figure className="relative max-w-md">
          <blockquote className="font-heading text-3xl leading-snug font-semibold text-balance text-white">
            “Hacer algo con el alma, con creatividad y con amor.”
          </blockquote>
          <figcaption className="mt-4 text-lavanda-100">
            <span className="font-semibold">Meraki</span> · palabra griega que inspira la manera en
            que acompañamos a cada consultante.
          </figcaption>
        </figure>
        <p className="relative text-sm text-lavanda-200">
          Expedientes, agenda y sesiones en un espacio seguro.
        </p>
      </aside>
      <main className="flex items-center justify-center bg-lavanda-50 px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <Logo className="mb-8 lg:hidden" />
          {children}
        </div>
      </main>
    </div>
  );
}
