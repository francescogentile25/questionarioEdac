-- Seed sezioni e domande del questionario PEI
insert into public.sections (id, position, title) values
  (1, 1, 'Dati generali'),
  (2, 2, 'Presentazione dell''alunno'),
  (3, 3, 'Relazione e socializzazione'),
  (4, 4, 'Comunicazione e linguaggio'),
  (5, 5, 'Autonomia e orientamento'),
  (6, 6, 'Dimensione cognitiva e apprendimenti'),
  (7, 7, 'Apprendimenti disciplinari'),
  (8, 8, 'Interventi e strategie'),
  (9, 9, 'Valutazione'),
  (10, 10, 'Documenti da allegare');

insert into public.questions
  (id, section_id, position, text, description, type, options, required, has_other, extra_text_trigger, extra_text_label)
values
  -- Sezione 1
  (1, 1, 1, 'Ordine di scuola', null, 'radio',
    array['Infanzia', 'Primaria'], true, false, null, null),
  (2, 1, 2, 'Classe/Sezione', null, 'text', null, true, false, null, null),
  (3, 1, 3, 'Diagnosi riportata nella documentazione clinica', null, 'textarea', null, true, false, null, null),
  (4, 1, 4, 'Ore di sostegno assegnate', null, 'text', null, true, false, null, null),
  (5, 1, 5, 'Sono presenti altre figure di supporto?', null, 'checkbox',
    array['Educatore', 'Assistente all''autonomia/comunicazione', 'Assistente materiale', 'Nessuna'], true, false, null, null),
  -- Sezione 2
  (6, 2, 1, 'Quali sono i principali punti di forza dell''alunno?', 'Max 5 righe', 'textarea', null, true, false, null, null),
  (7, 2, 2, 'Quali sono le principali difficoltà osservate?', 'Max 5 righe', 'textarea', null, true, false, null, null),
  (8, 2, 3, 'Quali attività o argomenti suscitano maggiore interesse e motivazione?', null, 'textarea', null, true, false, null, null),
  -- Sezione 3
  (9, 3, 1, 'Come si relaziona con adulti e compagni?', null, 'radio',
    array['In modo adeguato', 'Con qualche difficoltà', 'Solo se guidato', 'Presenta significative difficoltà relazionali'], true, false, null, null),
  (10, 3, 2, 'Partecipa alle attività di gruppo?', null, 'radio',
    array['Sempre', 'Spesso', 'Saltuariamente', 'Solo con mediazione dell''adulto', 'Raramente'], true, false, null, null),
  (11, 3, 3, 'Quali obiettivi ritiene prioritari in ambito relazionale?', null, 'textarea', null, true, false, null, null),
  -- Sezione 4
  (12, 4, 1, 'Come comprende le consegne?', 'Più risposte possibili', 'checkbox',
    array['Comprende consegne semplici', 'Comprende consegne articolate', 'Necessita semplificazione', 'Necessita supporti visivi'], true, false, null, null),
  (13, 4, 2, 'Come comunica prevalentemente?', null, 'radio',
    array['Linguaggio verbale adeguato', 'Linguaggio semplice', 'Frase minima', 'Comunicazione non verbale', 'CAA', 'Altro'], true, true, null, null),
  (14, 4, 3, 'Quali obiettivi ritiene prioritari nell''area comunicativa?', null, 'textarea', null, true, false, null, null),
  -- Sezione 5
  (15, 5, 1, 'Livello di autonomia personale e scolastica', null, 'radio',
    array['Adeguato', 'Parzialmente autonomo', 'Necessita frequenti supporti', 'Necessita assistenza costante'], true, false, null, null),
  (16, 5, 2, 'In quali aspetti manifesta maggiori difficoltà di autonomia?', 'Più risposte possibili', 'checkbox',
    array['Gestione materiali', 'Organizzazione del lavoro', 'Rispetto routine', 'Cura personale', 'Orientamento negli spazi', 'Altro'], true, true, null, null),
  (17, 5, 3, 'Obiettivi prioritari nell''area autonomia', null, 'textarea', null, true, false, null, null),
  -- Sezione 6
  (18, 6, 1, 'Come descriverebbe l''attenzione dell''alunno?', null, 'radio',
    array['Adeguata', 'Discontinua', 'Facilmente distraibile', 'Molto limitata'], true, false, null, null),
  (19, 6, 2, 'Come apprende più facilmente?', 'Più risposte possibili', 'checkbox',
    array['Attività pratiche', 'Attività laboratoriali', 'Supporti visivi', 'Tecnologie', 'Piccolo gruppo', 'Attività individuali'], true, false, null, null),
  (20, 6, 3, 'Quali difficoltà incidono maggiormente sugli apprendimenti?', null, 'textarea', null, true, false, null, null),
  (21, 6, 4, 'Quali obiettivi ritiene prioritari nell''area cognitiva e degli apprendimenti?', null, 'textarea', null, true, false, null, null),
  -- Sezione 7
  (22, 7, 1, 'Italiano', 'Descrivere brevemente il livello raggiunto e gli obiettivi essenziali', 'textarea', null, true, false, null, null),
  (23, 7, 2, 'Matematica', 'Descrivere brevemente il livello raggiunto e gli obiettivi essenziali', 'textarea', null, true, false, null, null),
  (24, 7, 3, 'Altre discipline / Campi di esperienza', null, 'textarea', null, false, false, null, null),
  -- Sezione 8
  (25, 8, 1, 'Quali strategie risultano maggiormente efficaci?', 'Più risposte possibili', 'checkbox',
    array['Routine strutturate', 'Supporti visivi', 'Rinforzo positivo', 'Peer tutoring', 'Cooperative learning', 'Attività laboratoriali', 'Tecnologie', 'Task analysis', 'Modellamento', 'Altro'], true, true, null, null),
  (26, 8, 2, 'Sono presenti comportamenti problema?', null, 'radio',
    array['No', 'Sì'], true, false, 'Sì', 'Se sì, descrivere brevemente'),
  (27, 8, 3, 'Quali facilitatori favoriscono la partecipazione e l''apprendimento?', null, 'textarea', null, true, false, null, null),
  (28, 8, 4, 'Quali barriere ostacolano maggiormente la partecipazione e l''apprendimento?', null, 'textarea', null, true, false, null, null),
  -- Sezione 9
  (29, 9, 1, 'Come vengono svolte le verifiche?', 'Più risposte possibili', 'checkbox',
    array['Orali', 'Pratiche', 'Scritte adattate', 'Osservazione sistematica', 'Utilizzo di strumenti compensativi', 'Tempi aggiuntivi'], true, false, null, null),
  (30, 9, 2, 'Ulteriori informazioni utili alla redazione del PEI', null, 'textarea', null, false, false, null, null),
  -- Sezione 10
  (31, 10, 1, 'Documenti da allegare', 'Selezionare i documenti che verranno inviati', 'checkbox',
    array['Profilo di Funzionamento', 'PEI precedente', 'Verbale GLO precedente', 'Relazioni specialistiche', 'Programmazione personalizzata', 'Altro'], false, true, null, null);
