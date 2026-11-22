# Manual tests

Things that still need someone to try them in a browser. Tick a box when it works; if it doesn't, write what happened under the item and add a fix task to `TASKS.md`.

**Where:** https://zdoma.tian-istenic34.workers.dev
**Log in as hospital staff:** `/prijava` → "Osebje" → `marko.horvat@zdoma.demo` or `tina.bizjak@zdoma.demo`, password = `SEED_PASSWORD` from `.env.local`. (Mojca, Petra and Nina are patronažne sestre and don't open rehabilitacije.)
**Get to the medicines:** "Nova rehabilitacija" (`/nurse/odpust`) → "Pacient" (davčna številka, name if new) → "Skupina pacientov" (e.g. Srčno popuščanje) → "Vrednosti in vprašanja" → step 4 "Zdravila". Don't finish the last step "Potrditev" unless you are also testing saving: it creates a real rehabilitacija in the shared database.

## T-74 · "Dodaj zdravilo" from the EMA list

### Search results
- [ ] With a template that doesn't list bisoprolol (e.g. Nov kolk ali koleno), type `biso`: four groups appear in this order: "Iz predlog (z običajnimi odmerki)" (Bisoprolol), "Drugo ime za priporočeno zdravilo" (Byol, Concor, Borez, Sobycor …), "Druga zdravila" (Bisonessa, Bisoprolol/Amlodipin Krka …), and last "Dodaj »biso« kot novo zdravilo".
- [ ] With Srčno popuščanje, `biso` shows no "Iz predlog" group, because Bisoprolol is already in the list above (expected).
- [ ] Search ignores capitals and č/š/ž: `furosemid` and `FUROSEMID` give the same results; `Bisolvón` finds Bisolvon.
- [ ] Searching by active substance works: `sakubitril` finds Entresto and its other brands.
- [ ] A medicine already in the list (e.g. Lasix in the heart failure template) does not show up again.
- [ ] Type the exact name `Byol`: no "kot novo zdravilo" row (it's a known medicine).
- [ ] Type something unknown, e.g. `xyz kapljice`: only "Dodaj »xyz kapljice« kot novo zdravilo".
- [ ] Under the field: "Seznam zdravil: Evropska agencija za zdravila (EMA), stanje 11/2026".

### Adding
- [ ] **Byol** (other brand) → new line "Byol" with the bisoprolol dose buttons 1,25 / 2,5 / 5 / 10 mg, the template's times already ticked, and "Za: …".
- [ ] **A medicine from "Druga zdravila"** → new line with no dose buttons, an empty "Odmerek" field and time chips; no "Za:".
- [ ] **"Dodaj »…« kot novo zdravilo"** → same as above, with the typed name.
- [ ] After adding, the search field is empty and the results are gone.
- [ ] "Naprej" stays disabled until every ticked medicine has a dose and at least one time (or is "po potrebi").
- [ ] "Odstrani" removes an added line.

### Saving (only if you want a test rehabilitacija in the database)
- [ ] Finish the wizard with one EMA medicine (e.g. Byol) and one own medicine. Both are saved with the right dose and times.
- [ ] The patient's pill list shows both. The own medicine has no "Za:" line (expected).

## T-76 · Keyboard in "Dodaj zdravilo" (PC)

- [ ] Type `biso`: the first result has a frame and "Enter ↵" on the right.
- [ ] ↓ moves the frame down through all groups, ↑ moves it up; from the last result ↓ goes back to the first and the other way round.
- [ ] With many results, the framed one scrolls into view.
- [ ] Enter adds the framed medicine (same result as clicking it) and clears the field. Enter does not submit or skip the step.
- [ ] Esc clears the field.
- [ ] Moving the mouse over a result moves the frame there; clicking still works.
- [ ] Typing again after ↓ starts from the first result.

## Layout

- [ ] **Desktop (≥ 1280 px):** the medicines step and the result groups look tidy inside the wizard width.
- [ ] **Phone (390 px):** results are readable, long names and substances wrap instead of running off the screen, buttons are big enough to tap; "Enter ↵" is hidden.
