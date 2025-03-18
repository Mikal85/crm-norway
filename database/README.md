# Database Struktur for CRM Norway

Dette dokumentet beskriver databasestrukturen for CRM-systemet.

## Tabeller

### 1. users
- Lagrer brukerinformasjon for systemet
- Inneholder autentisering og autorisasjonsdata
- Roller kan være admin, selger, support, etc.

### 2. customers
- Hovedtabell for kundedata
- Inneholder firmanavn, org.nummer og kontaktinformasjon
- Koblet til brukere for oppfølging og ansvar

### 3. contacts
- Kontaktpersoner tilknyttet kunder
- Én kunde kan ha flere kontaktpersoner
- Markering av primærkontakt

### 4. deals
- Salgsmuligheter og avtaler
- Inneholder verdi, sannsynlighet og forventet sluttdato
- Koblet til kunde og ansvarlig selger

### 5. activities
- Alle typer aktiviteter (møter, samtaler, oppgaver)
- Kan være koblet til kunde, deal eller kontakt
- Inkluderer oppfølging og påminnelser

### 6. notes
- Notater og kommentarer
- Kan knyttes til kunde, deal eller kontakt
- Sporing av hvem som opprettet notatet

### 7. documents
- Dokumenthåndtering
- Lagrer filsti, type og størrelse
- Kobling mot kunde eller deal

## Relasjoner
- Hver kunde kan ha flere kontakter (one-to-many)
- Hver kunde kan ha flere deals (one-to-many)
- Aktiviteter kan knyttes til kunde, deal eller kontakt (many-to-one)
- Dokumenter kan knyttes til kunde eller deal (many-to-one)

## Indekser
- Optimalisert for rask søking på firmanavn
- Indekser på alle foreign keys for bedre ytelse
- Automatisk oppdatering av updated_at felt

## Bruk
For å sette opp databasen:

1. Opprett en ny PostgreSQL database
2. Kjør schema.sql filen
3. Verifiser at alle tabeller er opprettet korrekt

```sql
-- Opprett database
CREATE DATABASE crm_norway;

-- Koble til database
\c crm_norway

-- Kjør schema
\i schema.sql
```