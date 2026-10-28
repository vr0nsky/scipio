# Scipio

> *Fratelli d'Italia, l'Italia s'è desta,*
> ***dell'elmo di Scipio** s'è cinta la testa.*
>
> — Goffredo Mameli, *Il Canto degli Italiani* (1847)

Scipio è un fork di [Elmo](https://github.com/elmohq/elmo), la piattaforma open source che misura come le intelligenze artificiali parlano di un marchio. Il nome viene dall'inno: l'Italia «si cinge la testa con l'elmo di Scipio», e questo progetto prende l'elmo, cioè Elmo, e lo fa parlare italiano. Le IA rispondono come a un utente che fa le domande dall'Italia, e non più dagli Stati Uniti.

Scipio è un progetto di [Massimo Ivaldi Studio](https://massimoivaldi.com), agenzia italiana che si occupa di [monitoraggio e ottimizzazione AEO](https://massimoivaldi.com/it/servizi/ottimizzazione-aeo), cioè della presenza dei marchi nelle risposte delle IA, e di ottimizzazione della ricerca interna dei negozi online. Lo studio pubblica la [classifica della ricerca interna negli e-commerce italiani](https://massimoivaldi.com/it/classifica-ricerca-interna-e-commerce), basata sulla misurazione di quasi 6.000 negozi online.

## Perché un fork

Le IA adattano la risposta a chi fa la domanda: negozi, prezzi, fonti e marchi cambiano da un paese all'altro. Elmo interroga ogni servizio come un utente degli Stati Uniti, in inglese, anche quando la domanda è scritta in italiano. Per un marchio che vende in Italia, quindi, misura il mercato sbagliato.

Scipio aggiunge due impostazioni che fanno arrivare il paese e la lingua a tutti i servizi di raccolta che li accettano. Tutto il resto è identico a Elmo e resta allineato con il progetto originale: interfaccia, analisi, classificazione delle menzioni, API e database.

## Le due impostazioni

Nel file `.env`:

| Variabile | Che cosa indica | Esempio | Valore di default |
|---|---|---|---|
| `ELMO_COUNTRY` | Paese da cui partono le domande (ISO 3166-1 alpha-2) | `IT` | `US` |
| `ELMO_LANGUAGE` | Lingua dell'interfaccia, per i servizi che la accettano (ISO 639-1) | `it` | `en` |

Se non le imposti, Scipio si comporta esattamente come Elmo. Un valore non valido ferma il worker all'avvio: così si evita di raccogliere per settimane dati del mercato americano credendo che siano italiani.

Scrivi le domande nella lingua del mercato: la maggior parte delle IA risponde nella lingua in cui le si interroga.

Come ogni servizio usa paese e lingua:

| Servizio | Paese | Lingua |
|---|---|---|
| Cloro | Tutte le IA | Google AI Mode e AI Overview; per le altre la ricava dal paese |
| SearchApi | Solo Google AI Mode e AI Overview | Le IA di Google |
| BrightData | Tutte le IA | Google AI Mode e AI Overview |
| Oxylabs | Tutte le IA | Google AI Overview |
| Olostep | Tutte le IA | Le IA di Google |
| DataForSEO | Le IA di Google e gli scraper di ChatGPT e Gemini | Le IA di Google e gli scraper |
| OpenAI, Anthropic, OpenRouter | Posizione della ricerca web | — |
| Mistral | Non supportato dal suo strumento di ricerca | — |

Non tutti i servizi coprono ogni paese su ogni IA. Cloro, per esempio, elenca i paesi disponibili per ciascuna IA con `GET https://api.cloro.dev/v1/countries?model=<model>`. Se un paese non è supportato, la raccolta fallisce con l'errore del servizio. I dettagli sono nella [guida alla configurazione](packages/docs/content/docs/developer-guide/configuration.mdx#market-country-and-language).

## Installazione

Le immagini Docker pubblicate da Elmo **non contengono** la localizzazione: Scipio va costruito dal sorgente.

```bash
git clone https://github.com/vr0nsky/scipio.git
cd scipio
pnpm install
pnpm --filter @elmohq/cli build

# configurazione guidata in ~/.elmo, con immagini costruite da questa cartella
node apps/cli/dist/index.js init --dev --docker-dir docker
```

Aggiungi poi `ELMO_COUNTRY` ed `ELMO_LANGUAGE` a `~/.elmo/.env` e avvia:

```bash
docker compose -f ~/.elmo/elmo.yaml up -d --build
```

Servono le chiavi di almeno un servizio di raccolta e una chiave [TypeSafe](https://console.typesafe.ai) per Jev, che decide quali marchi sono davvero nominati e con che tono. Il resto della procedura è quello della [guida di Elmo](https://www.elmohq.com/docs/getting-started).

## Restare allineati con Elmo

```bash
git remote add upstream https://github.com/elmohq/elmo.git   # una volta sola
git fetch upstream
git merge upstream/main
pnpm test
docker compose -f ~/.elmo/elmo.yaml up -d --build
```

Prima di un aggiornamento che include migrazioni del database, conviene fare un backup:

```bash
docker exec elmo-postgres-1 pg_dump -U postgres -Fc elmo > elmo-backup.dump
```

## Documentazione

Per tutto ciò che non riguarda la localizzazione vale la documentazione di Elmo:

- [Guida introduttiva](https://www.elmohq.com/docs/getting-started)
- [Guida utente](https://www.elmohq.com/docs/user-guide): marchi, domande, visibilità, tono, fonti, report
- [Servizi di raccolta](https://www.elmohq.com/docs/user-guide/providers)
- [Guida per sviluppatori](https://www.elmohq.com/docs/developer-guide)
- [API e MCP](https://www.elmohq.com/docs/api)

## Crediti e licenza

Scipio esiste grazie al lavoro del team di [Elmo](https://www.elmohq.com/). Per le novità del prodotto, il supporto e la versione cloud fai riferimento al [progetto originale](https://github.com/elmohq/elmo).

Come Elmo, Scipio è distribuito con [licenza MIT](LICENSE.md).
