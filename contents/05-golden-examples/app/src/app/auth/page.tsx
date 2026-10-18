"use client";

import { CheckCircle, Eye, EyeSlash, Gear } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState, type FormEvent } from "react";
import { RadialLight } from "@/components/patterns/accent";
import { AnimatedInput } from "@/components/patterns/animated-input";
import { BrandMark } from "@/components/patterns/brand-mark";
import { ConfirmDialog } from "@/components/patterns/confirm-dialog";
import { useDesign } from "@/components/patterns/design-provider";
import { Eyebrow } from "@/components/patterns/eyebrow";
import { GlassSheet } from "@/components/patterns/overlay";
import { RegionError } from "@/components/patterns/region-error";
import { Reveal } from "@/components/patterns/reveal";
import { SegmentedTabs } from "@/components/patterns/segmented-tabs";
import { noticeToast } from "@/components/patterns/toaster";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/input";
import type { StringKey } from "@/lib/i18n";
import { durations, fade, springs } from "@/lib/motion";

type Mode = "signin" | "create";
type FieldName = "name" | "email" | "password";
type Status = "idle" | "pending" | "failed" | "done";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function check(field: FieldName, value: string, mode: Mode): StringKey | null {
  if (field === "email") return EMAIL.test(value.trim()) ? null : "authErrEmail";
  if (field === "password") return value.length >= 8 ? null : "authErrPw";
  if (field === "name") return mode === "create" && value.trim().length === 0 ? "authErrName" : null;
  return null;
}

export default function AuthPage() {
  const { t, tl, motionOk } = useDesign();
  const [mode, setMode] = useState<Mode>("signin");
  const [values, setValues] = useState<Record<FieldName, string>>({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState<Partial<Record<FieldName, StringKey>>>({});
  const [showPw, setShowPw] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [resetOpen, setResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const setValue = (f: FieldName, v: string) => {
    setValues((s) => ({ ...s, [f]: v }));
    // once a field has shown an error, re-check as the person fixes it
    if (errors[f]) setErrors((e) => ({ ...e, [f]: check(f, v, mode) ?? undefined }));
  };
  const blur = (f: FieldName) => {
    if (values[f] === "" && !errors[f] && f !== "email") return;
    setErrors((e) => ({ ...e, [f]: check(f, values[f], mode) ?? undefined }));
  };

  const submit = async (e?: FormEvent) => {
    e?.preventDefault();
    const next: Partial<Record<FieldName, StringKey>> = {};
    for (const f of ["name", "email", "password"] as const) {
      const k = check(f, values[f], mode);
      if (k) next[f] = k;
    }
    setErrors(next);
    if (Object.keys(next).length > 0) {
      formRef.current?.querySelector<HTMLInputElement>("[aria-invalid=true]")?.focus();
      return;
    }
    setStatus("pending");
    await sleep(900);
    if (values.email.trim().toLowerCase().startsWith("fail")) {
      setStatus("failed");
      return;
    }
    setStatus("done");
    noticeToast(t("authSuccess"));
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setErrors({});
    setStatus("idle");
  };

  const openDelete = () => {
    // one overlay at a time: the sheet closes first, then the confirmation opens
    setSettingsOpen(false);
    setTimeout(() => setDeleteOpen(true), durations.slow * 1000);
  };

  const tabs = [
    { value: "signin" as const, label: t("authSignIn") },
    { value: "create" as const, label: t("authCreate") },
  ];
  const pending = status === "pending";

  return (
    <main id="main" className="relative isolate min-h-dvh overflow-hidden">
      <RadialLight className="-top-24 start-0 -z-10 size-[44rem] -translate-x-1/3 rtl:translate-x-1/3" breathe />
      <RadialLight className="-bottom-24 end-0 -z-10 size-[36rem] translate-x-1/4 rtl:-translate-x-1/4 opacity-60" />
      <div className="mx-auto grid min-h-dvh max-w-marketing items-center gap-section-sm px-(--ds-gutter) py-section-md lg:grid-cols-2">
        <Reveal className="grid max-w-reading content-center gap-6">
          <BrandMark draw className="size-12" />
          <Eyebrow>{mode === "signin" ? t("authSignIn") : t("authCreate")}</Eyebrow>
          <h1 className="font-display text-display-lg leading-display tracking-display text-balance">
            {mode === "signin" ? t("authWelcome") : t("authWelcomeNew")}
          </h1>
          <p className="text-lg text-ink-2">{t("authSub")}</p>
        </Reveal>

        <Reveal index={2} className="lg:justify-self-end lg:w-full lg:max-w-md">
          <section aria-label={t("authSignIn")} className="glass grid gap-6 rounded-sheet p-6 sm:p-8">
            <SegmentedTabs tabs={tabs} value={mode} onChange={switchMode} label={t("authSignIn")} idPrefix="auth" />
            <div role="tabpanel" id="auth-panel" aria-labelledby={`auth-tab-${mode}`}>
              <form ref={formRef} onSubmit={submit} noValidate className="grid gap-4">
                <AnimatePresence initial={false}>
                  {mode === "create" && (
                    <motion.div
                      key="name"
                      className="-m-2 overflow-hidden p-2"
                      initial={motionOk ? { opacity: 0, height: 0 } : { opacity: 0 }}
                      animate={motionOk ? { opacity: 1, height: "auto" } : { opacity: 1 }}
                      exit={motionOk ? { opacity: 0, height: 0 } : { opacity: 0 }}
                      transition={motionOk ? springs.ui : fade}
                    >
                      <Field label={t("authName")} error={errors.name ? t(errors.name) : null}>
                        {(c) => (
                          <AnimatedInput
                            {...c}
                            examples={tl("exName")}
                            autoComplete="name"
                            value={values.name}
                            onChange={(e) => setValue("name", e.target.value)}
                            onBlur={() => blur("name")}
                          />
                        )}
                      </Field>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Field label={t("authEmail")} error={errors.email ? t(errors.email) : null}>
                  {(c) => (
                    <AnimatedInput
                      {...c}
                      examples={tl("exEmail")}
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      value={values.email}
                      onChange={(e) => setValue("email", e.target.value)}
                      onBlur={() => blur("email")}
                    />
                  )}
                </Field>

                <Field
                  label={t("authPassword")}
                  error={errors.password ? t(errors.password) : null}
                  trailing={
                    mode === "signin" ? (
                      <button type="button" onClick={() => setResetOpen(true)} className="min-h-8 text-sm text-brand-text underline-offset-4 hover:underline">
                        {t("authForgot")}
                      </button>
                    ) : null
                  }
                >
                  {(c) => (
                    <div className="relative">
                      <AnimatedInput
                        {...c}
                        mode="password"
                        type={showPw ? "text" : "password"}
                        examples={tl("exPassword")}
                        autoComplete={mode === "signin" ? "current-password" : "new-password"}
                        className="pe-16"
                        value={values.password}
                        onChange={(e) => setValue("password", e.target.value)}
                        onBlur={() => blur("password")}
                      />
                      <button
                        type="button"
                        aria-label={showPw ? t("authHidePw") : t("authShowPw")}
                        aria-pressed={showPw}
                        onClick={() => setShowPw((s) => !s)}
                        className="absolute inset-y-0 end-1 grid size-touch place-items-center rounded-pill text-ink-2 hover:text-ink"
                      >
                        {showPw ? <EyeSlash aria-hidden size={20} weight="light" /> : <Eye aria-hidden size={20} weight="light" />}
                      </button>
                    </div>
                  )}
                </Field>

                <Button type="submit" size="lg" glint loading={pending} className="mt-2 w-full">
                  {mode === "signin" ? t("authSignIn") : t("authCreate")}
                </Button>

                {status === "failed" && (
                  <RegionError title={t("authErrNetTitle")} body={t("authErrNetBody")} onRetry={() => void submit()} />
                )}
                {status === "done" && (
                  <p role="status" className="flex items-center justify-center gap-2 text-sm text-success">
                    <CheckCircle aria-hidden size={18} weight="light" />
                    {t("authSuccess")}
                  </p>
                )}
              </form>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="max-w-xs text-sm text-ink-2">{t("authHint")}</p>
              <Button variant="ghost" size="sm" onClick={() => setSettingsOpen(true)}>
                <Gear aria-hidden size={16} weight="light" />
                {t("authSettings")}
              </Button>
            </div>
          </section>
        </Reveal>
      </div>

      <GlassSheet open={resetOpen} onOpenChange={setResetOpen} title={t("authResetTitle")} description={t("authResetBody")}>
        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            setResetOpen(false);
            noticeToast(t("authResetSent"));
          }}
        >
          <Field label={t("authEmail")}>
            {(c) => (
              <AnimatedInput {...c} type="email" examples={tl("exEmail")} autoComplete="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} />
            )}
          </Field>
          <Button type="submit" glint>
            {t("authResetSend")}
          </Button>
        </form>
      </GlassSheet>

      <GlassSheet open={settingsOpen} onOpenChange={setSettingsOpen} title={t("authSettingsTitle")} description={t("authSettingsBody")}>
        <div className="grid gap-4">
          <Eyebrow>{t("authSettingsLabel")}</Eyebrow>
          <Button variant="danger" onClick={openDelete}>
            {t("authDelete")}
          </Button>
        </div>
      </GlassSheet>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={t("authDelTitle")}
        description={t("authDelBody")}
        confirmLabel={t("authDelConfirm")}
        phrase={t("authDelPhrase")}
        onConfirm={async () => {
          await sleep(600);
          noticeToast(t("authDeleted"));
        }}
      />
    </main>
  );
}
