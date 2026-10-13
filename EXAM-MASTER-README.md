# Exam Master upgrade: notes

New files: exam-data.js (notes, 66 authored questions, flashcards, syllabus text), exam.js (tab logic), this README.
Changed: periodic-table.html (loads the 2 scripts; fixed Bohr model drawing an empty 5th shell for Pd), service-worker.js (cache v19, new files cached, network-first for new scripts).

Question bank: 66 authored + 96 generated from element data (config/position, unpaired electrons) = 162, all labelled ORIGINAL PRACTICE or GENERATED. The older NCERT Prep tab adds 31 more.
PYQs: 0 verified PYQs are bundled. Import your own verified JSON in the NCERT Prep > PYQs tab.
NCERT: chapter/section titles only; page and line references are pending verification. Nothing is quoted from NCERT.
Exam formats: NEET (180 MCQ, +4/-1, 3 h) is from secondary sources; JEE Main / Advanced marking is illustrative. Confirm on the official brochures.

Deploy (Cloudflare Pages): upload the folder as-is, no build command, output directory = root. Open /periodic-table.html (vercel.json rewrites do not apply there).
Deploy (Vercel): import the folder as a static project, no build; vercel.json provides /periodic-table.
