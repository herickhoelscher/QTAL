"use client";

import { useActionState } from "react";
import { refreshCubNow, saveSettings } from "@/app/admin/actions/settings";
import { ImageField } from "@/components/admin/ImageField";
import {
  Checkbox,
  Field,
  FormSection,
  Select,
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
  cubSource: string | null;
  cubAutoUpdate: boolean;
  cubIndex: string;
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
          hint="Preenchido sozinho todo mês pelo índice do Sinduscon Paraná Oeste. Só edite se quiser fixar outro valor — ex.: 2845,71. Em branco, a barra cai para o custo médio do m² do SINAPI/IBGE, identificado como tal."
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

        <Field
          label="Qual índice do CUB exibir"
          htmlFor="cubIndex"
          hint="Use o regional se o portal anuncia só no oeste do Paraná — ele acompanha melhor o custo daqui. Use o estadual se houver imóveis de outras regiões do estado."
        >
          <Select id="cubIndex" name="cubIndex" defaultValue={settings.cubIndex}>
            <option value="CUBOESTE/PR">Regional — Oeste do Paraná (CUBOESTE/PR)</option>
            <option value="CUB/PR">Estadual — Paraná inteiro (CUB/PR)</option>
          </Select>
        </Field>

        <Checkbox
          name="cubAutoUpdate"
          label="Atualizar o CUB automaticamente todo mês"
          hint="Busca o índice na tabela do Sinduscon Paraná Oeste entre os dias 2 e 6 de cada mês. Desligue se preferir digitar o valor à mão."
          defaultChecked={settings.cubAutoUpdate}
        />

        <div className="flex flex-wrap items-center gap-4 border-l-2 border-line bg-surface-alt p-3">
          <div className="text-xs text-muted">
            {settings.cubUpdatedAt ? (
              <>
                Última atualização: {settings.cubUpdatedAt}
                {settings.cubSource === "sinduscon"
                  ? ` · ${settings.cubIndex}, buscado no Sinduscon`
                  : settings.cubSource === "manual"
                    ? " · digitado no painel"
                    : null}
              </>
            ) : (
              "O CUB ainda não foi atualizado nenhuma vez."
            )}
          </div>
          <button
            type="submit"
            formAction={refreshCubNow}
            className="eyebrow ml-auto border border-line bg-surface px-4 py-2 hover:border-brand hover:text-brand"
          >
            Buscar CUB agora
          </button>
        </div>
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
