"use client";

import { ArrowRightIcon, LockKeyholeIcon, MailIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useActionState, useState } from "react";
import { FormMessage } from "@/components/shared/form-message";
import { iniciarSesion } from "../actions";
import { CampoAuth } from "./campo-auth";
import { LotoLogin } from "./loto-login";

/** Loto + formulario: el loto se abre a medida que se escriben el correo y la contraseña. */
export function LoginForm() {
  const [state, formAction, enviando] = useActionState(iniciarSesion, undefined);
  const desde = useSearchParams().get("desde") ?? "";
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [olvidada, setOlvidada] = useState(false);

  const pe = Math.min(1, email.length / 14) * (/@.+\./.test(email) ? 1 : 0.8);
  const pp = Math.min(1, pass.length / 8);
  const p = pe * 0.5 + pp * 0.5;
  const estado = enviando
    ? "Bienvenida de vuelta."
    : p === 0
      ? "Escribe tu correo y el loto despertará."
      : p < 0.5
        ? "Respira… se está abriendo."
        : p < 1
          ? "Un poco más."
          : "Listo, en plena flor.";

  return (
    <>
      <LotoLogin progreso={p} enviando={enviando} />
      <p aria-live="polite" className="mt-0.5 mb-[clamp(6px,2dvh,18px)] min-h-5 text-center text-sm font-bold text-lavanda-200">
        {estado}
      </p>

      <form
        action={formAction}
        noValidate
        className="animate-mk-up grid w-[min(100%,420px)] gap-[clamp(10px,1.8dvh,16px)] rounded-[36px_36px_36px_12px] border border-white/16 bg-white/7 p-[clamp(18px,3dvh,30px)_clamp(22px,4vw,30px)] shadow-[0_40px_80px_-40px_rgba(0,0,0,0.65)] backdrop-blur-[18px] [animation-delay:150ms] [animation-duration:0.8s]"
      >
        <input type="hidden" name="desde" value={desde} />
        <div className="grid gap-1">
          <h1 className="font-heading text-[28px] font-bold tracking-[-0.02em] text-white">Qué gusto verte</h1>
          <p className="text-[15px] text-lavanda-200 [@media(max-height:820px)]:hidden">El loto se abre mientras entras a tu consulta.</p>
        </div>
        <FormMessage state={state} />
        <CampoAuth
          id="email"
          name="email"
          type="email"
          label="Correo electrónico"
          icon={MailIcon}
          autoComplete="username"
          inputMode="email"
          placeholder="tu@correo.com"
          defaultValue={state?.values?.email}
          onChange={(e) => setEmail(e.target.value)}
          error={state?.fieldErrors?.email}
          required
          autoFocus
        />
        <CampoAuth
          id="password"
          name="password"
          label="Contraseña"
          icon={LockKeyholeIcon}
          revelable
          autoComplete="current-password"
          placeholder="Tu contraseña"
          onChange={(e) => setPass(e.target.value)}
          error={state?.fieldErrors?.password}
          required
          accion={
            <button
              type="button"
              onClick={() => setOlvidada((v) => !v)}
              aria-expanded={olvidada}
              className="text-[13px] font-bold text-lavanda-200 underline underline-offset-[3px] hover:text-white"
            >
              ¿La olvidaste?
            </button>
          }
        />
        {olvidada && (
          <p className="-mt-1 rounded-xl bg-white/8 px-3.5 py-2.5 text-[13px] leading-snug text-lavanda-100">
            Por seguridad, la administración de tu consultorio restablece la contraseña. Escríbele y te enviará una
            temporal.
          </p>
        )}
        <button
          type="submit"
          disabled={enviando}
          aria-busy={enviando}
          className="flex h-[clamp(46px,7dvh,54px)] items-center justify-center gap-2.5 rounded-full bg-white text-base font-extrabold text-lavanda-800 shadow-[0_18px_36px_-14px_rgba(201,174,240,0.75)] transition-transform hover:-translate-y-0.5 focus-visible:ring-4 focus-visible:ring-lavanda-300/60 focus-visible:outline-none disabled:opacity-80"
        >
          {enviando ? "Abriendo tu consulta…" : "Entrar"}
          <ArrowRightIcon aria-hidden="true" className="size-[18px]" />
        </button>
      </form>
    </>
  );
}
