"use client";

import { useActionState } from "react";
import { saveSettings } from "@/app/admin/actions/settings";
import { ImageField } from "@/components/admin/ImageField";
import {
  Field,
  FormSection,
  SubmitButton,
  TextArea,
  TextInput,
} from "@/components/admin/form";

export type SettingsFormData = {
  siteName: string;
  siteDescription: string;
  clientLogoUrl: string | null;
  weatherCity: string;
  weatherLat: string;
  weatherLon: string;
  currencyApiProvider: string;
  cubValue: string;
  cubReference: string | null;
  cubUpdatedAt: string | null;
  gtmContainerId: string | null;
  whatsappNumber: string;
  whatsappMessage: string;
  instagramUrl: string | null;
  facebookUrl: string | null;
  youtubeUrl: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  contactAddress: string | null;
};

export function SettingsForm({ settings }: { settings: SettingsFormData }) {
  const [state, formAction] = useActionState(saveSettings, {});

  return (
    <form action={formAction} className="grid gap-6">
      {state.error ? (
        <p role="alert" className="border-l-2 border-brand bg-surface p-3 text-sm text-brand">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="border-l-2 border-emerald-600 bg-surface p-3 text-sm text-emerald-800">
          {state.success}
        </p>
      ) : null}

      <FormSection title="Identidade do site">
        <Field label="Nome do site" htmlFor="siteName" required>
          <TextInput id="siteName" name="siteName" defaultValue={settings.siteName} required />
        </Field>
        <Field
          label="Descrição"
          htmlFor="siteDescription"
          hint="Usada pelos buscadores quando a página não tem descrição própria."
        >
          <TextArea
            id="siteDescription"
            name="siteDescription"
            rows={2}
            defaultValue={settings.siteDescription}
          />
        </Field>
        <ImageField
          name="clientLogoUrl"
          label="Logo"
          hint="PNG ou SVG com fundo transparente, altura mínima de 80px, até 5MB. Aparece no topo do site e no painel."
          defaultValue={settings.clientLogoUrl}
        />
      </FormSection>

      <FormSection
        title="Barra de dados automáticos"
        description="Alimenta a faixa de clima, dólar e CUB exibida no topo de todas as páginas."
      >
        <p className="border-l-2 border-line bg-surface-alt p-3 text-sm text-muted">
          O clima vem do Open-Meteo e a cotação do dólar da AwesomeAPI: as duas são
          gratuitas e <strong>não exigem chave nem cadastro</strong>. Não há nada para
          renovar aqui.
        </p>

        <Field
          label="Cidade do clima"
          htmlFor="weatherCity"
          hint="Formato cidade,UF,BR — por exemplo Toledo,PR,BR. A UF também define o estado usado no custo do m² do IBGE."
        >
          <TextInput id="weatherCity" name="weatherCity" defaultValue={settings.weatherCity} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Latitude (opcional)"
            htmlFor="weatherLat"
            hint="Em branco, localizamos pela cidade. Ex.: -24.7136"
          >
            <TextInput
              id="weatherLat"
              name="weatherLat"
              inputMode="decimal"
              defaultValue={settings.weatherLat}
            />
          </Field>

          <Field
            label="Longitude (opcional)"
            htmlFor="weatherLon"
            hint="Preencha junto com a latitude. Ex.: -53.7431"
          >
            <TextInput
              id="weatherLon"
              name="weatherLon"
              inputMode="decimal"
              defaultValue={settings.weatherLon}
            />
          </Field>
        </div>

        <Field
          label="Fonte da cotação do dólar"
          htmlFor="currencyApiProvider"
          hint="awesomeapi — gratuita e sem cadastro, atualizada a cada 15 minutos."
        >
          <TextInput
            id="currencyApiProvider"
            name="currencyApiProvider"
            defaultValue={settings.currencyApiProvider}
          />
        </Field>

        <Field
          label="Valor do CUB (R$/m²)"
          htmlFor="cubValue"
          hint="Não existe API pública do CUB: o valor é publicado mensalmente pelo Sinduscon. Atualize aqui quando sair o novo índice — ex.: 2845,71. Se deixar em branco, a barra exibe o custo médio do m² do SINAPI/IBGE, atualizado sozinho e identificado como tal."
        >
          <TextInput id="cubValue" name="cubValue" inputMode="decimal" defaultValue={settings.cubValue} />
        </Field>

        <Field
          label="Mês de referência do CUB"
          htmlFor="cubReference"
          hint="Ex.: setembro/2026 — exibido ao lado do valor."
        >
          <TextInput
            id="cubReference"
            name="cubReference"
            defaultValue={settings.cubReference ?? ""}
          />
        </Field>

        {settings.cubUpdatedAt ? (
          <p className="text-xs text-muted">Última atualização do CUB: {settings.cubUpdatedAt}</p>
        ) : null}
      </FormSection>

      <FormSection title="Assinatura e contato">
        <Field
          label="WhatsApp comercial"
          htmlFor="whatsappNumber"
          hint="Com código do país e DDD, apenas números — ex.: 5545999998888."
          required
        >
          <TextInput
            id="whatsappNumber"
            name="whatsappNumber"
            inputMode="numeric"
            defaultValue={settings.whatsappNumber}
            required
          />
        </Field>

        <Field
          label="Mensagem pré-preenchida"
          htmlFor="whatsappMessage"
          hint="É o texto que já vem escrito quando a pessoa clica em Assine agora."
        >
          <TextArea
            id="whatsappMessage"
            name="whatsappMessage"
            rows={2}
            defaultValue={settings.whatsappMessage}
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="Instagram" htmlFor="instagramUrl">
            <TextInput id="instagramUrl" name="instagramUrl" defaultValue={settings.instagramUrl ?? ""} />
          </Field>
          <Field label="Facebook" htmlFor="facebookUrl">
            <TextInput id="facebookUrl" name="facebookUrl" defaultValue={settings.facebookUrl ?? ""} />
          </Field>
          <Field label="YouTube" htmlFor="youtubeUrl">
            <TextInput id="youtubeUrl" name="youtubeUrl" defaultValue={settings.youtubeUrl ?? ""} />
          </Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Telefone" htmlFor="contactPhone">
            <TextInput id="contactPhone" name="contactPhone" defaultValue={settings.contactPhone ?? ""} />
          </Field>
          <Field label="E-mail" htmlFor="contactEmail">
            <TextInput
              id="contactEmail"
              name="contactEmail"
              type="email"
              defaultValue={settings.contactEmail ?? ""}
            />
          </Field>
        </div>

        <Field label="Endereço" htmlFor="contactAddress">
          <TextInput
            id="contactAddress"
            name="contactAddress"
            defaultValue={settings.contactAddress ?? ""}
          />
        </Field>
      </FormSection>

      <FormSection
        title="Medição"
        description="O contêiner do Google Tag Manager centraliza analytics e tags de acompanhamento."
      >
        <Field
          label="ID do contêiner do Google Tag Manager"
          htmlFor="gtmContainerId"
          hint="Formato GTM-XXXXXXX. Em branco, nenhuma tag é carregada."
        >
          <TextInput
            id="gtmContainerId"
            name="gtmContainerId"
            defaultValue={settings.gtmContainerId ?? ""}
            placeholder="GTM-XXXXXXX"
          />
        </Field>
      </FormSection>

      <div>
        <SubmitButton>Salvar configurações</SubmitButton>
      </div>
    </form>
  );
}
