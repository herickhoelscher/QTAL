"use client";

import { useActionState } from "react";
import { refreshCubNow, saveSettings } from "@/app/admin/actions/settings";
import { ImageField } from "@/components/admin/ImageField";
import { SECONDARY_BUTTON } from "@/components/admin/styles";
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
  hasDeeplKey: boolean;
};

/** Todo cartao tem o proprio Salvar, mas todos enviam o formulario inteiro. */
function SaveRow() {
  return (
    <div className="flex justify-end md:col-span-2">
      <SubmitButton>Salvar</SubmitButton>
    </div>
  );
}

export function SettingsForm({ settings }: { settings: SettingsFormData }) {
  const [state, formAction] = useActionState(saveSettings, {});

  return (
    <form action={formAction} className="grid gap-6">
      {state.error || state.success ? (
        <p
          role={state.error ? "alert" : "status"}
          className={
            "fixed right-6 bottom-6 z-50 max-w-sm rounded-xl border px-4 py-3 text-sm shadow-lg " +
            (state.error
              ? "border-danger/30 bg-surface text-danger"
              : "border-emerald-600/30 bg-surface text-ink")
          }
        >
          {state.error ?? state.success}
        </p>
      ) : null}

      <FormSection title="Identidade do site">
        <Field label="Nome do site" htmlFor="siteName" required>
          <TextInput id="siteName" name="siteName" defaultValue={settings.siteName} required />
        </Field>
        <Field
          wide
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
        <SaveRow />
      </FormSection>

      <FormSection
        title="Barra de dados automáticos"
        description="Alimenta a faixa de clima, dólar e CUB exibida no topo de todas as páginas."
      >
        <p className="rounded-xl bg-surface-alt p-3 text-sm text-muted md:col-span-2">
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

        <div className="grid gap-4 sm:grid-cols-2 md:col-span-2">
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
          hint="Preenchido sozinho: o site confere todo dia o Sinduscon Paraná Oeste e o Sinduscon-PR e fica com o mais recente. Só edite se quiser fixar outro valor — ex.: 2845,71. Em branco, a barra mostra o custo médio do m² do IBGE com o nome Custo m²."
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

        <div className="flex flex-wrap items-center gap-4 rounded-xl bg-surface-alt p-3 md:col-span-2">
          <div className="text-xs text-muted">
            {settings.cubUpdatedAt ? (
              <>
                Última atualização: {settings.cubUpdatedAt}
                {settings.cubSource === "sinduscon"
                  ? ` · ${settings.cubIndex}, buscado no Sinduscon Paraná Oeste`
                  : settings.cubSource === "sinduscon-pr"
                    ? " · CUB-PR estadual, buscado no Sinduscon-PR (o regional ainda não tinha este mês)"
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
            className={SECONDARY_BUTTON + " ml-auto py-2"}
          >
            Buscar CUB agora
          </button>
        </div>
        <SaveRow />
      </FormSection>

      <FormSection title="Anuncie e contato">
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
          wide
          label="Mensagem pré-preenchida"
          htmlFor="whatsappMessage"
          hint="É o texto que já vem escrito quando a pessoa clica em Entre em contato (Anuncie)."
        >
          <TextArea
            id="whatsappMessage"
            name="whatsappMessage"
            rows={2}
            defaultValue={settings.whatsappMessage}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-3 md:col-span-2">
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

        <div className="grid gap-4 sm:grid-cols-2 md:col-span-2">
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
        <SaveRow />
      </FormSection>

      <FormSection
        title="Idiomas"
        description="O site tem versões em inglês e espanhol (bandeiras no topo). Menus e botões já saem traduzidos; matérias, eventos, imóveis e vídeos são traduzidos automaticamente no momento em que você publica."
      >
        <Field
          label="Chave da API do DeepL"
          htmlFor="deeplApiKey"
          hint={
            settings.hasDeeplKey
              ? "Há uma chave cadastrada. Deixe em branco para mantê-la, ou cole outra para trocar."
              : "Opcional. Sem chave, o site já traduz sozinho com um serviço gratuito (cerca de 10 matérias por dia). Para mais volume e melhor qualidade, crie uma conta gratuita em deepl.com/pro-api (500 mil caracteres por mês) e cole a chave aqui."
          }
        >
          <TextInput
            id="deeplApiKey"
            name="deeplApiKey"
            type="password"
            autoComplete="off"
            placeholder={settings.hasDeeplKey ? "•••••••• cadastrada" : "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx:fx"}
          />
        </Field>
        {settings.hasDeeplKey ? (
          <Checkbox name="deeplApiKeyRemove" label="Remover a chave cadastrada" />
        ) : null}
        <SaveRow />
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
        <SaveRow />
      </FormSection>
    </form>
  );
}
