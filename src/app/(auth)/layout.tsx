import { Logo } from "@/components/brand/logo";

const PETALO =
  "M24 6c4.8 5.2 7 10.6 7 16.2S28.8 33 24 38.4C19.2 33 17 27.8 17 22.2S19.2 11.2 24 6Z";

const ANGULOS = [-78, -52, -26, 0, 26, 52, 78];
const RELLENOS = [
  "rgba(201,174,240,.22)",
  "rgba(224,208,247,.28)",
  "rgba(255,255,255,.32)",
  "rgba(255,255,255,.45)",
  "rgba(255,255,255,.32)",
  "rgba(224,208,247,.28)",
  "rgba(201,174,240,.22)",
];
// Orden de pintado: los pétalos exteriores quedan al fondo.
const ORDEN = [0, 6, 1, 5, 2, 4, 3];

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="grid min-h-svh bg-sidebar lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-[linear-gradient(160deg,#9466d9_0%,#6534a8_55%,#3a1f61_100%)] p-12 text-white lg:grid lg:grid-rows-[auto_1fr_auto]">
        <Logo variant="light" />
        <div className="flex items-center justify-center" aria-hidden="true">
          <svg viewBox="-8 -4 64 48" className="h-[280px] w-[360px] overflow-visible">
            {ORDEN.map((i) => (
              <path
                key={i}
                d={PETALO}
                fill={RELLENOS[i]}
                className="animate-mk-sway"
                style={
                  {
                    "--a": `${ANGULOS[i]}deg`,
                    transformOrigin: "24px 38.4px",
                    transform: `rotate(${ANGULOS[i]}deg)`,
                    animationDelay: `${-Math.abs(i - 3) * 0.9}s`,
                  } as React.CSSProperties
                }
              />
            ))}
          </svg>
        </div>
        <figure className="max-w-[440px] justify-self-center text-center">
          <blockquote className="font-heading text-3xl leading-tight font-semibold text-balance text-white">
            “Hacer algo con el alma, con creatividad y con amor.”
          </blockquote>
          <figcaption className="mt-3.5 text-[15px] leading-normal text-lavanda-100">
            <span className="font-extrabold">Meraki</span> · palabra griega que inspira la manera en
            que acompañamos a cada consultante.
          </figcaption>
        </figure>
      </aside>
      <main className="flex items-center justify-center px-4 py-10 sm:px-12">
        <div className="w-full max-w-[420px]">
          <Logo className="mb-8 justify-center lg:hidden" />
          {children}
        </div>
      </main>
    </div>
  );
}
