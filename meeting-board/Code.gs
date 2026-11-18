/**
 * TGC TEAM MEETING BOARD  (v3, Nov 18 2026)
 * Built on Jordan's "How We Meet" Team Meeting Guide, with Seattal's changes.
 *
 * HOW THE PIECES FIT
 *   1. THE FORM        Everyone fills it out before every meeting.
 *                      Monday meeting: due 12 PM Monday.  Friday meeting: due 6 PM Thursday.
 *   2. THE SHEET       "TGC Weekly Meeting Board". The form fills it by itself.
 *   3. THE LIVE BOARD  This web app. The 9 steps on screen, with timers.
 *   4. THE RECAP       Press "Finish meeting" on the board. A recap Google Doc is made
 *                      for the whole team, and an email with the link waits in Seattal's Drafts.
 *
 * PRIVATE: question 7 only ever goes to the PRIVATE sheet (Mike + Jordan).
 * It is never written to the board sheet, the live board, the recap or Meeting Notes.
 *
 * ONE-TIME SETUP: run setupNewBoard. TEST: run testWithTestUser, then deleteTestData.
 */
const CONFIG = {
  BOARD_ID: '1432d67A5gBtCujIWqUNqiTzdcs1n66rTDznQMXzirjQ',
  FORM_ID: '1amvH8i-6cCkCkSESFwCiLTJw8jbvLfQGMLBlXoX2Hs0',
  NOTES_ID: '19a77UGf3UX31XWo31MGf6i0WKhOOrQAeCOtcx4TdWHM',
  PRIVATE_ID: '1D6IVJIWmwPegjFKcXbBKz1g3t7D_kkb-zSvIAZpQmW4',
  FOLDER_ID: '1UVgFU5nQ6LFIhZsV1yfAxwD5RTZjlrc5',      // Team Meetings folder
  LOGO_ID: '1zKucKB82m0SIjIAwfFJQvia5891eO7mJ',        // TGC Logo.png (white on black)
  PRIVATE_VIEWERS: ['mike@thegrowercircle.com', 'jordan@thegrowercircle.com'],
  FACILITATOR_EMAIL: 'seattal@thegrowercircle.com',
  MEET_TIME: '15:30',          // regular Monday + Friday start (24h clock)
  MEET_MINUTES: 60,
  POINTS_START: '2026-12-02',  // weeks 1 and 2 are practice (no points), per Jordan's guide
  TEST_NAME: 'TEST USER'
};

const TEAMS = ['Garden', 'Compliance', 'Kitchen (Flight Bites)', 'Sales (Nevada)', 'New Mexico',
  'Production & Packaging', 'Orders & Delivery', 'Merch', 'Marketing & Events', 'Leadership'];

// name, role, email, in the meeting?, fills out the form?
const PEOPLE = [
  ['Mike', 'Decision Maker. Makes the final call on every issue.', 'mike@thegrowercircle.com', 'Yes', 'No'],
  ['Jordan', 'Co-facilitator. Investor.', 'jordan@thegrowercircle.com', 'Yes', 'Yes'],
  ['Aaron', 'Runs sales, orders and production.', 'aaron@thegrowercircle.com', 'Yes', 'Yes'],
  ['Kyle', 'Co-founder. Runs New Mexico.', 'kyle@thegrowercircle.com', 'Yes', 'Yes'],
  ['Dylan', 'Runs the garden.', 'dylan@thegrowercircle.com', 'Yes', 'Yes'],
  ['Seattal', 'Facilitator. Runs marketing, events and merch. Runs the meeting screen.', 'seattal@thegrowercircle.com', 'Yes', 'Yes'],
  ['Leah', 'Runs compliance (licenses and state rules).', '', 'No', 'No'],
  ['Chef', 'Runs the kitchen (Flight Bites).', '', 'No', 'No'],
  ['Alex', 'Merch team', '', 'No', 'No'], ['Jimmy', 'Merch team', '', 'No', 'No'],
  ['Pala', 'Merch team', '', 'No', 'No'], ['Jas', 'Merch team', '', 'No', 'No']
];

// Form question titles. The script finds answers by these exact titles.
const Q = {
  NAME: '1. Your name',
  TEAM: '1b. Your team',
  WEEKLY: '2. Weekly goals',
  MONTHLY: '3. Monthly goals: On Track or Off Track?',
  MONTHLY_NOTE: '3b. Monthly goals in one line',
  HEADLINE: '4. Headline: one sentence of news',
  TODOS: '5. Your To-Dos from last meeting',
  HAS_ASK: '6. Do you have a problem or an ask for the team?',
  ASK_FOR: n => `Ask ${n}: Who is it for?`,
  ASK_TEXT: n => `Ask ${n}: What do you need?`,
  ASK_FLAGS: n => `Ask ${n}: Check any that fit`,
  MORE: n => `Ask ${n} is done. Do you have another one?`,
  PRIVATE: '7. PRIVATE: How are you doing? Anything outside work that could affect your week?'
};
const ASK_SLOTS = 3;
const FOR_CHOICES = ['Mike', 'Aaron', 'Someone else'];
const FLAG = { URGENT: 'Urgent', COMPLIANCE: 'Compliance risk (license, product or store)', DEEP: 'Needs a Deep Dive (affects several people, a brand, a store or a license)' };
const NO_TODOS_ROW = 'No To-Dos yet. Skip this question.';
const ANSWERS = ['Yes', 'No', 'Next meeting'];     // Mike's call

const TAB = { HOW: 'HOW IT WORKS', UPD: 'UPDATES', ISS: 'ISSUES LIST', TODO: 'TO-DOS', SNAP: 'SNAPSHOT',
  PTS: 'POINTS', MEET: 'MEETINGS', DATES: 'SPECIAL DATES', PEOPLE: 'WHO RUNS WHAT' };
const OLD_ISSUE_TABS = ['ISSUES & TO-DOS', 'ASKS'];

// ISSUES LIST columns. A-F must stay where they are: Meeting Notes reads A-F.
const IC = { num: 1, added: 2, team: 3, askedBy: 4, ask: 5, urgent: 6, answer: 7, owner: 8, due: 9, done: 10, later: 11,
  notes: 12, answeredOn: 13, forWho: 14, decision: 15, compliance: 16, deep: 17, meeting: 18, formId: 19 };
const IN = 19;
const ISSUE_HEAD = ['#', 'ADDED', 'TEAM', 'RAISED BY', 'THE ISSUE / ASK', 'URGENT', "MIKE'S CALL", 'WHO DOES IT', 'BY WHEN', 'DONE',
  'LATER', 'NOTES', 'DECIDED ON', 'ASK IS FOR', "MIKE'S DECISION (IN WORDS)", 'COMPLIANCE', 'DEEP DIVE', 'FOR MEETING', 'FORM ID'];

const UC = { meeting: 1, type: 2, name: 3, team: 4, weekly: 5, monthly: 6, monthlyNote: 7, headline: 8, todos: 9, asks: 10, submitted: 11, onTime: 12, formId: 13 };
const UN = 13;
const UPD_HEAD = ['MEETING DATE', 'MEETING', 'NAME', 'TEAM', 'WEEKLY GOALS', 'MONTHLY GOALS', 'MONTHLY NOTE', 'HEADLINE',
  'TO-DOS (FORM SAYS)', 'ASKS', 'SUBMITTED', 'ON TIME?', 'FORM ID'];

const TC = { num: 1, added: 2, owner: 3, todo: 4, due: 5, status: 6, notDone: 7, issue: 8, checked: 9, formSays: 10, onList: 11 };
const TN = 11;
const TODO_HEAD = ['#', 'ADDED AT MEETING', 'WHO', 'TO-DO', 'DUE', 'STATUS', 'TIMES NOT DONE', 'FROM ISSUE #', 'LAST CHECKED', 'FORM SAYS', 'ON ISSUES LIST'];

const B = { black: '#000000', ink: '#ffffff', grey: '#e9e9e9', mid: '#8a8a8a', line: '#d0d0d0', good: '#1f9d55', bad: '#d93a2b' };

/* ============================================================
 * 1. ONE-TIME SETUP  (safe to run again)
 * ============================================================ */
function setupNewBoard() {
  const ss = board_();
  const log = [];

  // Issues List: the old ASKS / ISSUES & TO-DOS tab, renamed. Nothing on it is deleted.
  let iss = ss.getSheetByName(TAB.ISS) || OLD_ISSUE_TABS.map(n => ss.getSheetByName(n)).find(Boolean);
  if (!iss) iss = ss.insertSheet(TAB.ISS);
  iss.setName(TAB.ISS);
  log.push(fixNotesFormulas());   // right away, so Meeting Notes is never left pointing at a missing tab
  if (iss.getMaxColumns() < IN) iss.insertColumnsAfter(iss.getMaxColumns(), IN - iss.getMaxColumns());
  styleHeader_(iss, ISSUE_HEAD);
  const n = iss.getMaxRows() - 1;
  // backfill "ASK IS FOR" from the "MIKE - ..." / "AARON - ..." start of each ask
  const vals = iss.getRange(2, 1, n, IN).getValues();
  let filled = 0;
  vals.forEach((r, i) => {
    if (!String(r[IC.ask - 1]).trim() || r[IC.forWho - 1]) return;
    const m = String(r[IC.ask - 1]).match(/^\s*(MIKE|AARON)\b/i);
    iss.getRange(i + 2, IC.forWho).setValue(m ? (m[1].toUpperCase() === 'MIKE' ? 'Mike' : 'Aaron') : 'Someone else');
    filled++;
  });
  // old answer words -> new plain words
  const ans = iss.getRange(2, IC.answer, n, 1);
  ans.clearDataValidations();
  ans.setValues(ans.getValues().map(r => [({ Solved: 'Yes', 'Not doing it': 'No' })[r[0]] || r[0]]));
  list_(ans, ANSWERS);
  list_(iss.getRange(2, IC.forWho, n, 1), FOR_CHOICES);
  list_(iss.getRange(2, IC.team, n, 1), TEAMS);
  [IC.urgent, IC.done, IC.later, IC.compliance, IC.deep].forEach(c => {
    const r = iss.getRange(2, c, n, 1); const v = r.getValues();
    r.insertCheckboxes(); r.setValues(v.map(x => [x[0] === true]));
  });
  iss.getRange(2, IC.due, n, 1).setNumberFormat('ddd m/d');
  iss.getRange(2, IC.added, n, 1).setNumberFormat('m/d');
  iss.hideColumns(IC.formId);
  const body = iss.getRange(2, 1, n, IN);
  iss.setConditionalFormatRules([
    cf_(body, '=$J2=TRUE', '#f2f2f2', B.mid, false, true),
    cf_(iss.getRange(2, IC.answer, n, 1), '=$G2="Yes"', B.good, B.ink, true),
    cf_(iss.getRange(2, IC.answer, n, 1), '=$G2="No"', B.bad, B.ink, true),
    cf_(iss.getRange(2, IC.answer, n, 1), '=$G2="Next meeting"', '#555555', B.ink, true),
    cf_(iss.getRange(2, IC.ask, n, 1), '=OR($F2=TRUE,$P2=TRUE)', null, B.bad, true)
  ]);
  [40, 60, 150, 90, 520, 70, 110, 100, 80, 60, 60, 200, 90, 100, 300, 90, 80, 100, 60].forEach((w, i) => iss.setColumnWidth(i + 1, w));
  log.push(`ISSUES LIST ready (${vals.filter(r => String(r[IC.ask - 1]).trim()).length} existing issues kept, ${filled} tagged Mike/Aaron).`);

  // UPDATES: rebuilt for the new questions. If it has old answers, they are kept on a renamed copy.
  let upd = ss.getSheetByName(TAB.UPD);
  if (upd && upd.getLastRow() > 1 && upd.getRange(1, 1).getValue() !== UPD_HEAD[0]) {
    upd.setName('UPDATES (old form)'); upd.hideSheet(); upd = null;
  }
  if (!upd) upd = ss.insertSheet(TAB.UPD, 1);
  if (upd.getMaxColumns() < UN) upd.insertColumnsAfter(upd.getMaxColumns(), UN - upd.getMaxColumns());
  upd.clearConditionalFormatRules();
  upd.getRange(1, 1, upd.getMaxRows(), upd.getMaxColumns()).setBackground(null).setFontColor('#000000').setFontWeight('normal');
  upd.setHiddenGridlines(false);
  styleHeader_(upd, UPD_HEAD);
  [100, 80, 100, 150, 340, 110, 260, 260, 260, 60, 130, 80, 60].forEach((w, i) => upd.setColumnWidth(i + 1, w));
  upd.getRange(2, 1, upd.getMaxRows() - 1, UN).setVerticalAlignment('top').setWrap(true);
  upd.getRange(2, UC.submitted, upd.getMaxRows() - 1, 1).setNumberFormat('ddd m/d h:mm am/pm');
  upd.hideColumns(UC.formId);

  // New tabs
  ensureTab_(ss, TAB.TODO, TODO_HEAD, [50, 110, 100, 420, 90, 100, 90, 90, 110, 110, 90], sh => {
    list_(sh.getRange(2, TC.status, sh.getMaxRows() - 1, 1), ['Done', 'Not Done']);
    sh.getRange(2, TC.due, sh.getMaxRows() - 1, 1).setNumberFormat('ddd m/d');
    names_(sh.getRange(2, TC.owner, sh.getMaxRows() - 1, 1));
  });
  ensureTab_(ss, TAB.SNAP, ['WHAT', 'NUMBER OR STATUS', 'NOTE (optional)'], [360, 200, 420], sh => {
    const rows = [['Sales this month vs. goal: The Grower Circle', '', 'Example: 92% of goal'],
      ['Sales this month vs. goal: Flight Bites', '', ''],
      ['Company Priority 1', '', 'Write the priority in column A. Pick On Track / Off Track in column B.'],
      ['Company Priority 2', '', ''], ['Company Priority 3', '', '']]
      .concat(TEAMS.filter(t => t !== 'Leadership').map(t => ['Team: ' + t, '', '']));
    sh.getRange(2, 1, rows.length, 3).setValues(rows);
    sh.getRange(4, 3, 1, 1).setFontColor(B.mid);
    list_(sh.getRange(4, 2, rows.length - 2, 1), ['On Track', 'Off Track']);
  });
  ensureTab_(ss, TAB.PTS, ['DATE', 'NAME', 'POINTS', 'WHY', 'MEETING'], [110, 110, 70, 360, 110], sh => {
    sh.getRange(2, 1, sh.getMaxRows() - 1, 1).setNumberFormat('ddd m/d');
  });
  ensureTab_(ss, TAB.MEET, ['MEETING DATE', 'MEETING', 'FINISHED', 'AVERAGE RATING', 'RECAP DOC'], [120, 90, 160, 120, 520], () => {});
  ensureTab_(ss, TAB.DATES, ['DATE', 'TIME', 'WHAT', 'NOTE'], [110, 90, 220, 400], sh => {
    sh.getRange(2, 1, sh.getMaxRows() - 1, 2).setNumberFormat('@');
    sh.getRange(2, 1, 1, 4).setValues([['2026-11-18', '5:00 PM', 'Monday-style meeting', 'First meeting (moved from Fri 11/13)']]);
    sh.getRange(2, 4, 1, 1).setNote('Example. Dates like 2026-11-20 or 11/20/2026. Times like 3:30 PM.');
    list_(sh.getRange(2, 3, sh.getMaxRows() - 1, 1), ['Monday-style meeting', 'Friday-style meeting', 'Cancelled']);
  });

  // WHO RUNS WHAT: add email, "in the meeting?" and "fills out the form?"
  const ppl = ss.getSheetByName(TAB.PEOPLE);
  if (ppl.getMaxRows() < 60) ppl.insertRowsAfter(ppl.getMaxRows(), 60 - ppl.getMaxRows());
  if (ppl.getMaxColumns() < 5) ppl.insertColumnsAfter(ppl.getMaxColumns(), 5 - ppl.getMaxColumns());
  styleHeader_(ppl, ['NAME', 'IN CHARGE OF', 'EMAIL', 'IN THE MEETING?', 'FILLS OUT THE FORM?']);
  const pv = ppl.getRange(2, 1, 59, 5).getValues();
  PEOPLE.forEach(p => {
    let i = pv.findIndex(r => String(r[0]).trim().toLowerCase() === p[0].toLowerCase());
    if (i < 0) { i = pv.findIndex(r => !String(r[0]).trim()); pv[i] = [p[0], p[1], '', '', '']; }
    if (!pv[i][1]) pv[i][1] = p[1];
    if (!pv[i][2]) pv[i][2] = p[2];
    if (!pv[i][3]) pv[i][3] = p[3];
    if (!pv[i][4]) pv[i][4] = p[4];
  });
  ppl.getRange(2, 1, 59, 5).setValues(pv);
  list_(ppl.getRange(2, 4, 59, 2), ['Yes', 'No']);
  [110, 420, 240, 130, 160].forEach((w, i) => ppl.setColumnWidth(i + 1, w));

  // HOW IT WORKS (Jordan's guide, short version)
  const how = ss.getSheetByName(TAB.HOW) || ss.insertSheet(TAB.HOW, 0);
  howTab_(how);

  // Tab order
  [TAB.HOW, TAB.SNAP, TAB.UPD, TAB.ISS, TAB.TODO, TAB.PTS, TAB.MEET, TAB.PEOPLE, TAB.DATES].forEach((name, i) => {
    const sh = ss.getSheetByName(name); if (sh) { ss.setActiveSheet(sh); ss.moveActiveSheet(i + 1); }
  });
  ss.setActiveSheet(how);
  log.push('Sheet tabs ready: SNAPSHOT, UPDATES, ISSUES LIST, TO-DOS, POINTS, MEETINGS, SPECIAL DATES.');

  // Private sheet (question 7): Mike + Jordan only
  const priv = SpreadsheetApp.openById(CONFIG.PRIVATE_ID);
  const psh = priv.getSheets()[0];
  psh.getRange(1, 1, 1, 5).setValues([['DATE', 'NAME', 'MEETING', 'WHAT THEY SHARED', 'FORM ID']]).setFontWeight('bold')
    .setBackground(B.black).setFontColor(B.ink);
  psh.setColumnWidth(4, 600); psh.hideColumns(5); psh.setFrozenRows(1);
  CONFIG.PRIVATE_VIEWERS.forEach(e => { try { priv.addViewer(e); } catch (err) { log.push('Could not share private sheet with ' + e + ': ' + err); } });
  log.push('Private sheet shared (view only) with ' + CONFIG.PRIVATE_VIEWERS.join(' + ') + '.');

  // Form: same link, new questions
  const form = FormApp.openById(CONFIG.FORM_ID);
  let dest = ''; try { dest = form.getDestinationId(); } catch (e) {}
  if (dest) { form.removeDestination(); log.push('Form was linked to a responses sheet (' + dest + '). Unlinked it so private answers can never land there. The old rows in that sheet are untouched.'); }
  form.setPublishingSummary(false);
  if (form.getItems().some(i => i.getTitle() === Q.PRIVATE)) {
    log.push('Form already has the new questions. Left it alone (answers kept).');
  } else {
    log.push(archiveOldAnswers_(form, priv));
    buildForm_(form);
    log.push('Form rebuilt with the 7 questions. Link: ' + form.getPublishedUrl());
  }
  refreshTodoQuestion_();

  installTriggers();
  log.push('Form trigger installed. (Old Friday summary email trigger removed. The recap replaces it.)');

  PropertiesService.getScriptProperties().setProperties({ FORM_URL: form.getPublishedUrl(), BOARD_ID: CONFIG.BOARD_ID, FORM_ID: CONFIG.FORM_ID, PRIVATE_ID: CONFIG.PRIVATE_ID });
  Logger.log('\n' + log.join('\n'));
  return log;
}

function installTriggers() {
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('onUpdateSubmit').forForm(FormApp.openById(CONFIG.FORM_ID)).onFormSubmit().create();
}

// Meeting Notes reads asks from the board. Point every old "ASKS" / "ISSUES & TO-DOS" reference at "ISSUES LIST".
function fixNotesFormulas() {
  const notes = SpreadsheetApp.openById(CONFIG.NOTES_ID);
  const changed = [];
  notes.getSheets().forEach(sh => {
    const rng = sh.getDataRange(); const f = rng.getFormulas();
    f.forEach((row, r) => row.forEach((fx, c) => {
      if (!fx || fx.indexOf(CONFIG.BOARD_ID) < 0) return;
      const nf = fx.replace(/"(?:ASKS|'ISSUES & TO-DOS'|ISSUES & TO-DOS)!/g, `"'${TAB.ISS}'!`);
      if (nf !== fx) { sh.getRange(r + 1, c + 1).setFormula(nf); changed.push(sh.getName() + '!' + sh.getRange(r + 1, c + 1).getA1Notation()); }
    }));
  });
  return changed.length ? 'Meeting Notes fixed: ' + changed.join(', ') + ' now read ISSUES LIST.' : 'Meeting Notes: nothing needed fixing.';
}

/* ============================================================
 * 2. THE FORM
 * ============================================================ */
function buildForm_(form) {
  form.getItems().forEach(i => form.deleteItem(i));
  form.setTitle('TGC Team Meeting Form');
  form.setDescription(
    'Fill this out before every meeting. It takes about 5 minutes.\n\n' +
    'MONDAY meeting: due by 12 PM Monday.\nFRIDAY meeting: due by 6 PM Thursday.\n\n' +
    'Keep it short. A good goal has a number and a deadline:\n"Visit 10 stores by Friday."  NOT  "Visit more stores."');
  form.setCollectEmail(false);
  form.setAllowResponseEdits(true);
  form.setProgressBar(true);
  form.setConfirmationMessage('Got it. Thank you! See you at the meeting.');

  form.addListItem().setTitle(Q.NAME).setChoiceValues(formNames_()).setRequired(true);
  form.addListItem().setTitle(Q.TEAM).setChoiceValues(TEAMS).setRequired(true);
  form.addParagraphTextItem().setTitle(Q.WEEKLY).setRequired(true).setHelpText(
    'MONDAY: your 3 goals for this week. One per line.\n' +
    '   Example:  Visit 10 stores by Friday\n\n' +
    'FRIDAY: the same 3 goals. Write Hit or Missed after each one.\n' +
    '   Example:  Visit 10 stores: Hit');
  form.addMultipleChoiceItem().setTitle(Q.MONTHLY).setChoiceValues(['On Track', 'Off Track']).setRequired(true)
    .setHelpText('Are you on pace to finish your monthly goals on time? Pick one. "Kind of" is not an answer.');
  form.addTextItem().setTitle(Q.MONTHLY_NOTE).setRequired(true)
    .setHelpText('Example:  NM displays by Nov 30: Off Track. Holiday merch drop: On Track.');
  form.addTextItem().setTitle(Q.HEADLINE)
    .setHelpText('Good or bad news about a customer, a store or the team. Example:  Store X in Reno wants to carry Flight Bites.');
  form.addGridItem().setTitle(Q.TODOS).setColumns(['Done', 'Not Done']).setRows([NO_TODOS_ROW])
    .setHelpText('Find YOUR name. Pick Done or Not Done for each one. Skip everyone else\'s.');
  const hasAsk = form.addMultipleChoiceItem().setTitle(Q.HAS_ASK).setRequired(true)
    .setHelpText('A problem, a question, or a decision you need from Mike, Aaron or someone else.');

  const pages = [], mores = [];
  for (let k = 1; k <= ASK_SLOTS; k++) {
    pages.push(form.addPageBreakItem().setTitle(`Ask ${k}`).setHelpText('One ask per page. Keep it to 1 or 2 sentences.'));
    form.addMultipleChoiceItem().setTitle(Q.ASK_FOR(k)).setChoiceValues(FOR_CHOICES).setRequired(true);
    form.addParagraphTextItem().setTitle(Q.ASK_TEXT(k)).setRequired(true)
      .setHelpText('Example:  OK to order 2 pop-up podiums (~$60 each) for Green Wednesday?');
    form.addCheckboxItem().setTitle(Q.ASK_FLAGS(k)).setChoiceValues([FLAG.URGENT, FLAG.COMPLIANCE, FLAG.DEEP])
      .setHelpText('Leave blank if none fit. Compliance risks go to the top of the list.');
    if (k < ASK_SLOTS) mores.push(form.addMultipleChoiceItem().setTitle(Q.MORE(k)).setRequired(true));
  }
  const privPage = form.addPageBreakItem().setTitle('PRIVATE: only Mike and Jordan see this')
    .setHelpText('This never goes on the meeting screen, the recap or any shared sheet. It is optional. Leave it blank if you have nothing to share.');
  form.addParagraphTextItem().setTitle(Q.PRIVATE)
    .setHelpText('Example:  Moving apartments Wednesday, may be slow to reply that afternoon.');

  hasAsk.setChoices([hasAsk.createChoice('Yes', pages[0]), hasAsk.createChoice('No', privPage)]);
  mores.forEach((m, i) => m.setChoices([m.createChoice('Yes', pages[i + 1]), m.createChoice('No', privPage)]));
}

function formNames_() { return people_().map(p => p.name); }

// Question 5 lists every open To-Do as "#12 · Aaron: Send tray quote (due Fri 11/20)"
function refreshTodoQuestion_() {
  const form = FormApp.openById(CONFIG.FORM_ID);
  const item = form.getItems(FormApp.ItemType.GRID).find(i => i.getTitle() === Q.TODOS);
  if (!item) return;
  const rows = readTodos_(board_()).filter(t => t.status !== 'Done')
    .sort((a, b) => String(a.owner).localeCompare(String(b.owner)) || a.num - b.num)
    .map(t => `#${t.num} · ${t.owner || '?'}: ${t.todo}${t.due ? ' (due ' + fmt_(t.due) + ')' : ''}`);
  item.asGridItem().setRows(rows.length ? rows : [NO_TODOS_ROW]);
}

function syncNames() {
  const item = FormApp.openById(CONFIG.FORM_ID).getItems(FormApp.ItemType.LIST).find(i => i.getTitle() === Q.NAME);
  if (item) item.asListItem().setChoiceValues(formNames_());
}

/* ============================================================
 * 3. WHEN SOMEONE SUBMITS THE FORM
 * ============================================================ */
function onUpdateSubmit(e) { handleResponse_(e.response); }

function handleResponse_(resp) {
  const a = rawAnswers_(resp);
  const id = resp.getId();
  const when = resp.getTimestamp();
  const m = meetingFor_(when);
  const name = String(a[Q.NAME] || 'Someone');
  const team = String(a[Q.TEAM] || '');
  const onTime = when <= m.due;
  const ss = board_();

  withLock_(() => {
    // 1. UPDATES (one row per person per meeting; editing the form replaces the row)
    const upd = ss.getSheetByName(TAB.UPD);
    const todoAns = a[Q.TODOS] || [];
    const todoRows = gridRows_();
    const todoText = todoRows.map((r, i) => todoAns[i] ? `${r}: ${todoAns[i]}` : '').filter(Boolean).join('\n');
    const asks = [];
    for (let k = 1; k <= ASK_SLOTS; k++) {
      const text = String(a[Q.ASK_TEXT(k)] || '').trim();
      if (!text) continue;
      const flags = [].concat(a[Q.ASK_FLAGS(k)] || []);
      asks.push({ forWho: a[Q.ASK_FOR(k)] || 'Someone else', text,
        urgent: flags.indexOf(FLAG.URGENT) > -1, compliance: flags.indexOf(FLAG.COMPLIANCE) > -1, deep: flags.indexOf(FLAG.DEEP) > -1 });
    }
    const row = [m.key, m.type, name, team, a[Q.WEEKLY] || '', a[Q.MONTHLY] || '', a[Q.MONTHLY_NOTE] || '', a[Q.HEADLINE] || '',
      todoText, asks.length, when, onTime ? 'Yes' : 'LATE', id];
    const last = upd.getLastRow();
    const keys = last > 1 ? upd.getRange(2, 1, last - 1, UN).getValues() : [];
    let r = keys.findIndex(k => k[UC.formId - 1] === id || (iso_(k[0]) === m.key && k[UC.name - 1] === name));
    r = r > -1 ? r + 2 : last + 1;
    upd.getRange(r, 1, 1, UN).setValues([row]);
    upd.getRange(r, UC.meeting).setNumberFormat('@').setValue(m.key);

    // 2. ISSUES LIST: asks, plus missed weekly goals (Friday) and Off Track monthly goals
    const iss = ss.getSheetByName(TAB.ISS);
    clearUnansweredFrom_(iss, id);
    const base = { team, askedBy: name, meeting: m.key, formId: id };
    asks.forEach(x => writeIssue_(iss, null, Object.assign({}, base, {
      ask: (x.forWho === 'Someone else' ? '' : x.forWho.toUpperCase() + ' - ') + x.text,
      forWho: x.forWho, urgent: x.urgent || x.compliance, compliance: x.compliance, deep: x.deep })));
    if (m.type === 'Friday') goalLines_(a[Q.WEEKLY]).filter(g => g.result === 'Missed').forEach(g =>
      writeIssue_(iss, null, Object.assign({}, base, { ask: 'MISSED GOAL: ' + g.text, forWho: 'Someone else' })));
    if (a[Q.MONTHLY] === 'Off Track') writeIssue_(iss, null, Object.assign({}, base,
      { ask: 'OFF TRACK (monthly goal): ' + (a[Q.MONTHLY_NOTE] || 'see form'), forWho: 'Someone else' }));

    // 3. TO-DOS: remember what the form said (the board shows it; the meeting confirms it)
    const tsh = ss.getSheetByName(TAB.TODO);
    const todos = readTodos_(ss);
    todoRows.forEach((label, i) => {
      if (!todoAns[i]) return;
      const num = +((label.match(/^#(\d+)/) || [])[1]);
      const t = todos.find(x => x.num === num);
      if (t) tsh.getRange(t.row, TC.formSays).setValue(todoAns[i]);
    });
  });

  // 4. PRIVATE (question 7): private sheet only
  const priv = String(a[Q.PRIVATE] || '').trim();
  withLock_(() => {
    const psh = SpreadsheetApp.openById(CONFIG.PRIVATE_ID).getSheets()[0];
    const plast = psh.getLastRow();
    const pids = plast > 1 ? psh.getRange(2, 5, plast - 1, 1).getValues().map(x => x[0]) : [];
    const pr = pids.indexOf(id);
    if (priv) {
      const prow = [when, name, m.label, priv, id];
      if (pr > -1) psh.getRange(pr + 2, 1, 1, 5).setValues([prow]); else psh.appendRow(prow);
    } else if (pr > -1) psh.deleteRow(pr + 2);
  });
}

// Before the old questions are deleted, copy every old answer to an archive tab in the PRIVATE sheet
// (old answers may include private ones, so they go to the private sheet, not the board).
function archiveOldAnswers_(form, priv) {
  const resps = form.getResponses();
  if (!resps.length) return 'Form had no old answers to save.';
  const titles = form.getItems().filter(i => i.getType() !== FormApp.ItemType.PAGE_BREAK && i.getType() !== FormApp.ItemType.SECTION_HEADER).map(i => i.getTitle());
  const rows = resps.map(r => {
    const a = {}; r.getItemResponses().forEach(ir => { const v = ir.getResponse(); a[ir.getItem().getTitle()] = Array.isArray(v) ? v.join(', ') : v; });
    return [r.getTimestamp()].concat(titles.map(t => a[t] == null ? '' : String(a[t])));
  });
  const sh = priv.getSheetByName('OLD FORM ANSWERS') || priv.insertSheet('OLD FORM ANSWERS');
  sh.clear();
  sh.getRange(1, 1, 1, titles.length + 1).setValues([['SUBMITTED'].concat(titles)]).setFontWeight('bold');
  sh.getRange(2, 1, rows.length, titles.length + 1).setValues(rows);
  return `Saved ${rows.length} old form answers to the private sheet (tab OLD FORM ANSWERS) before replacing the questions.`;
}

function rawAnswers_(resp) {
  const out = {};
  resp.getItemResponses().forEach(ir => { out[ir.getItem().getTitle()] = ir.getResponse(); });
  return out;
}
function gridRows_() {
  const item = FormApp.openById(CONFIG.FORM_ID).getItems(FormApp.ItemType.GRID).find(i => i.getTitle() === Q.TODOS);
  return item ? item.asGridItem().getRows() : [];
}
function goalLines_(s) {
  return lines_(s).map(t => {
    const end = (t.match(/\b(hit|missed|miss)\W*$/i) || [])[1] || '';
    const hit = /^hit$/i.test(end), miss = /^miss/i.test(end);
    return { text: t, result: miss ? 'Missed' : hit ? 'Hit' : '' };
  });
}
function clearUnansweredFrom_(sh, formId) {
  const last = sh.getLastRow(); if (last < 2) return;
  const v = sh.getRange(2, 1, last - 1, IN).getValues();
  const untouched = r => !r[IC.answer - 1] && !r[IC.owner - 1] && !r[IC.due - 1] && !r[IC.decision - 1] && !r[IC.notes - 1] && r[IC.done - 1] !== true && r[IC.later - 1] !== true;
  v.forEach((r, i) => { if (r[IC.formId - 1] === formId && untouched(r)) clearIssueRow_(sh, i + 2); });
}
function clearIssueRow_(sh, row) {
  sh.getRange(row, 1, 1, IN).clearContent();
  [IC.urgent, IC.done, IC.later, IC.compliance, IC.deep].forEach(c => sh.getRange(row, c).setValue(false));
}

/* ============================================================
 * 4. MEETING SCHEDULE
 *    Regular: every Monday + Friday at CONFIG.MEET_TIME.
 *    Changes: the SPECIAL DATES tab (move a meeting, add one, or cancel one).
 * ============================================================ */
function meetings_(from, days) {
  const tz = tz_();
  const special = specialDates_();
  const out = [];
  for (let d = -2; d <= days; d++) {
    const day = new Date(from.getTime() + d * 864e5);
    const key = Utilities.formatDate(day, tz, 'yyyy-MM-dd');
    const dow = +Utilities.formatDate(day, tz, 'u'); // 1 = Monday ... 5 = Friday
    const sp = special.filter(s => s.key === key);
    if (sp.some(s => s.what === 'Cancelled')) continue;
    sp.forEach(s => out.push(mk_(key, s.time, s.what.indexOf('Friday') === 0 ? 'Friday' : 'Monday')));
    if (!sp.length && (dow === 1 || dow === 5)) out.push(mk_(key, CONFIG.MEET_TIME, dow === 1 ? 'Monday' : 'Friday'));
  }
  return out.sort((x, y) => x.start - y.start);
}
function mk_(key, time, type) {
  const tz = tz_();
  const start = Utilities.parseDate(key + ' ' + time, tz, 'yyyy-MM-dd HH:mm');
  const prev = Utilities.formatDate(new Date(start.getTime() - 864e5), tz, 'yyyy-MM-dd');
  const due = type === 'Monday' ? Utilities.parseDate(key + ' 12:00', tz, 'yyyy-MM-dd HH:mm')
    : Utilities.parseDate(prev + ' 18:00', tz, 'yyyy-MM-dd HH:mm');
  return { key, type, start, due, label: Utilities.formatDate(start, tz, 'EEE M/d') + ' at ' + Utilities.formatDate(start, tz, 'h:mm a'),
    dueLabel: Utilities.formatDate(due, tz, 'EEE M/d h:mm a') };
}
// A form answer counts for the next meeting (or one that started less than 90 min ago)
function meetingFor_(t) { return meetings_(t, 14).find(m => m.start.getTime() + 90 * 6e4 > t.getTime()); }
// The board shows today's meeting until 3 hours after it starts, then the next one
function boardMeeting_() { const now = new Date(); return meetings_(now, 14).find(m => m.start.getTime() + 3 * 36e5 > now.getTime()); }
function specialDates_() {
  const sh = board_().getSheetByName(TAB.DATES);
  if (!sh || sh.getLastRow() < 2) return [];
  return sh.getRange(2, 1, sh.getLastRow() - 1, 3).getValues().filter(r => r[0] && r[2]).map(r => {
    let key = r[0] instanceof Date ? Utilities.formatDate(r[0], tz_(), 'yyyy-MM-dd') : String(r[0]).trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) { const d = new Date(key); if (!isNaN(d)) key = Utilities.formatDate(d, tz_(), 'yyyy-MM-dd'); }
    return { key, time: time24_(r[1]), what: String(r[2]) };
  });
}
function time24_(v) {
  if (v instanceof Date) return Utilities.formatDate(v, tz_(), 'HH:mm');
  const m = String(v || '').trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);
  if (!m) return CONFIG.MEET_TIME;
  let h = +m[1]; const ap = (m[3] || '').toLowerCase();
  if (ap === 'pm' && h < 12) h += 12; if (ap === 'am' && h === 12) h = 0;
  return String(h).padStart(2, '0') + ':' + (m[2] || '00');
}

/* ============================================================
 * 5. THE LIVE BOARD (web page)
 * ============================================================ */
function doGet() {
  const t = HtmlService.createTemplateFromFile('Board');
  t.logo = '';
  try { t.logo = Utilities.base64Encode(DriveApp.getFileById(CONFIG.LOGO_ID).getBlob().getBytes()); } catch (e) {}
  return t.evaluate().setTitle('TGC Team Meeting').addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
}

function getBoard() {
  const ss = board_();
  const m = boardMeeting_();
  const state = JSON.parse(PropertiesService.getScriptProperties().getProperty('MEET_' + m.key) || '{}');
  const people = people_(ss).filter(p => p.inMeeting);
  const updates = readUpdates_(ss);
  const mine = updates.filter(u => u.meeting === m.key);
  const lastMonday = {};
  updates.filter(u => u.type === 'Monday' && u.meeting < m.key).forEach(u => { lastMonday[u.name] = u; });
  const todos = readTodos_(ss);
  const pts = readPoints_(ss);
  const month = m.key.slice(0, 7);
  const points = {};
  pts.filter(p => p.date.slice(0, 7) === month).forEach(p => { points[p.name] = (points[p.name] || 0) + p.points; });
  return {
    meeting: { key: m.key, type: m.type, label: m.label, due: m.dueLabel, minutes: CONFIG.MEET_MINUTES },
    state, people,
    updates: mine.map(u => Object.assign(u, { goals: goalLines_(u.weekly), mondayGoals: lastMonday[u.name] ? lines_(lastMonday[u.name].weekly) : [] })),
    issues: readIssues_(ss).filter(x => !x.done || x.answeredOn === m.key),
    todosReview: todos.filter(t => t.added < m.key && (t.status !== 'Done' || t.checked === m.key)),
    todosNew: todos.filter(t => t.added === m.key),
    snapshot: readSnapshot_(ss),
    points, pointsLive: m.key >= CONFIG.POINTS_START, pointsStart: fmt_(CONFIG.POINTS_START),
    recap: readMeetings_(ss).filter(x => x.meeting === m.key).pop() || null,
    lastRecap: readMeetings_(ss).filter(x => x.meeting < m.key).pop() || null,
    links: { form: formUrl_(), sheet: ss.getUrl() + '#gid=' + ss.getSheetByName(TAB.SNAP).getSheetId() }
  };
}

function saveState(key, patch) {
  return withLock_(() => {
    const props = PropertiesService.getScriptProperties();
    const cur = JSON.parse(props.getProperty('MEET_' + key) || '{}');
    props.setProperty('MEET_' + key, JSON.stringify(merge_(cur, patch)));
    return true;
  });
}

// Mike's call + decision on an issue. "Yes" with a person and a date also makes a To-Do.
function decideIssue(row, d, meetingKey) {
  return withLock_(() => {
    const ss = board_();
    const sh = ss.getSheetByName(TAB.ISS);
    const patch = {};
    ['answer', 'decision', 'owner', 'due', 'done', 'later', 'notes'].forEach(k => { if (k in d) patch[k] = d[k]; });
    if ('answer' in d) patch.answeredOn = d.answer ? meetingKey : '';
    writeIssue_(sh, row, patch);
    const x = readIssues_(ss).find(i => i.row === row);
    if (x && x.answer === 'Yes' && x.owner && x.due && d.makeTodo) {
      const exists = readTodos_(ss).some(t => t.issue === x.num);
      if (!exists) addTodoRow_(ss, { owner: x.owner, todo: x.decision || x.ask, due: x.due, issue: x.num, added: meetingKey });
    }
    return true;
  });
}
function addIssue(d, meetingKey) {
  return withLock_(() => writeIssue_(board_().getSheetByName(TAB.ISS), null,
    { ask: d.ask, askedBy: d.askedBy || '', forWho: d.forWho || 'Someone else', team: d.team || '', urgent: !!d.urgent, meeting: meetingKey }));
}
function addTodo(d, meetingKey) {
  return withLock_(() => addTodoRow_(board_(), { owner: d.owner, todo: d.todo, due: d.due, added: meetingKey }));
}
function deleteTodo(row) {
  return withLock_(() => { board_().getSheetByName(TAB.TODO).getRange(row, 1, 1, TN).clearContent(); return true; });
}
// Done / Not Done in To-Do Review. Not Done twice in a row puts it on the Issues List.
function setTodoStatus(row, status, meetingKey) {
  return withLock_(() => {
    const ss = board_(); const sh = ss.getSheetByName(TAB.TODO);
    const t = readTodos_(ss).find(x => x.row === row); if (!t) return false;
    let count = t.notDone;
    if (t.checked === meetingKey && t.status === 'Not Done') count--;
    if (status === 'Not Done') count++;
    sh.getRange(row, TC.status).setValue(status);
    sh.getRange(row, TC.notDone).setValue(Math.max(count, 0));
    sh.getRange(row, TC.checked).setNumberFormat('@').setValue(meetingKey);
    if (count >= 2 && !t.onList) {
      writeIssue_(ss.getSheetByName(TAB.ISS), null, { ask: `NOT DONE TWICE: ${t.owner} - ${t.todo}`, askedBy: t.owner, forWho: 'Someone else', meeting: meetingKey });
      sh.getRange(row, TC.onList).setValue('Yes');
    }
    return true;
  });
}
function addPoint(name, points, why, meetingKey) {
  if (meetingKey < CONFIG.POINTS_START) return false;
  return withLock_(() => {
    const sh = board_().getSheetByName(TAB.PTS);
    const r = sh.getLastRow() + 1;
    sh.getRange(r, 1, 1, 5).setValues([[new Date(), name, points, why, '']]);
    sh.getRange(r, 5).setNumberFormat('@').setValue(meetingKey);
    return true;
  });
}
function removePoint(name, why, meetingKey) {
  return withLock_(() => {
    const sh = board_().getSheetByName(TAB.PTS); const last = sh.getLastRow(); if (last < 2) return false;
    const v = sh.getRange(2, 1, last - 1, 5).getValues();
    for (let i = v.length - 1; i >= 0; i--) if (v[i][1] === name && v[i][3] === why && String(v[i][4]) === meetingKey) { sh.deleteRow(i + 2); return true; }
    return false;
  });
}

/* ============================================================
 * 6. FINISH THE MEETING: recap doc for everyone + email draft
 * ============================================================ */
function finishMeeting(meetingKey, mode) {
  const ss = board_();
  const data = getBoard();
  if (data.meeting.key !== meetingKey) throw new Error('The board moved to a new meeting. Reload the page.');
  const st = data.state;
  const tz = tz_();

  // Form points (only after practice weeks)
  if (data.pointsLive) {
    const pts = readPoints_(ss).filter(p => p.meeting === meetingKey);
    data.people.filter(p => p.fillsForm).forEach(p => {
      const u = data.updates.find(x => x.name === p.name);
      const why = !u ? 'Form not submitted' : u.onTime === 'LATE' ? 'Form submitted late' : '';
      if (why && !pts.some(x => x.name === p.name && x.why === why)) addPoint(p.name, why === 'Form not submitted' ? 2 : 1, why, meetingKey);
    });
  }

  const fresh = getBoard();
  const ratings = Object.values(st.ratings || {}).map(Number).filter(n => n > 0);
  const avg = ratings.length ? Math.round(ratings.reduce((a, b) => a + b, 0) / ratings.length * 10) / 10 : '';
  const title = `TGC Team Meeting Recap: ${fresh.meeting.label}`;

  const doc = DocumentApp.create(title);
  const body = doc.getBody();
  body.setMarginTop(36);
  try { body.getParagraphs()[0].appendInlineImage(DriveApp.getFileById(CONFIG.LOGO_ID).getBlob()).setWidth(90).setHeight(90); } catch (e) {}
  const H = (t, lvl) => body.appendParagraph(t).setHeading(lvl || DocumentApp.ParagraphHeading.HEADING2);
  const P = t => body.appendParagraph(t);
  const L = t => body.appendListItem(t).setGlyphType(DocumentApp.GlyphType.BULLET);
  H(title, DocumentApp.ParagraphHeading.HEADING1);
  P(`${mode === 'Friday' ? 'Friday meeting: score the week.' : 'Monday meeting: plan the week.'}  Meeting rating: ${avg || 'not rated'}${avg ? ' / 10' : ''}`);
  P('Check this the same day. If something in your action plan is wrong, tell Seattal or Jordan right away.').editAsText().setItalic(true);

  // Action plan per person
  H('Your action plan (To-Dos)');
  const openTodos = readTodos_(ss).filter(t => t.status !== 'Done');
  const names = fresh.people.map(p => p.name);
  openTodos.forEach(t => { if (names.indexOf(t.owner) < 0) names.push(t.owner); });
  names.forEach(n => {
    const mine = openTodos.filter(t => t.owner === n);
    const pts = fresh.points[n] || 0;
    if (!mine.length && !(fresh.pointsLive && pts)) return;
    body.appendParagraph(n).setHeading(DocumentApp.ParagraphHeading.HEADING3);
    mine.forEach(t => L(`${t.todo}  (due ${fmt_(t.due) || 'no date yet'})${t.added === meetingKey ? '  NEW' : ''}`));
    if (fresh.pointsLive) L(`Points this month: ${pts}`);
  });
  if (!openTodos.length) P('No open To-Dos.');

  // Decisions
  H("Mike's decisions");
  const decided = fresh.issues.filter(x => x.answeredOn === meetingKey && x.answer);
  if (!decided.length) P('No decisions recorded.');
  decided.forEach(x => L(`${x.answer.toUpperCase()}: ${x.ask}${x.decision ? '\n   Decision: ' + x.decision : ''}${x.owner ? '\n   Who: ' + x.owner + (x.due ? ', by ' + fmt_(x.due) : '') : ''}`));

  // To-Do review
  H('To-Do review (from last meeting)');
  if (!fresh.todosReview.length) P('Nothing to review.');
  fresh.todosReview.forEach(t => L(`${t.checked === meetingKey && t.status ? t.status.toUpperCase() : 'NOT CHECKED'}: ${t.owner}: ${t.todo}`));

  // Goals
  H(mode === 'Friday' ? 'Weekly goals: Hit or Missed' : 'Weekly goals for this week');
  fresh.people.filter(p => p.fillsForm).forEach(p => {
    const u = fresh.updates.find(x => x.name === p.name);
    if (!u) { L(`${p.name}: no update`); return; }
    L(`${p.name}: ` + (u.goals.map(g => g.text).join(' | ') || '(blank)'));
  });
  H('Monthly goals');
  fresh.updates.forEach(u => L(`${u.monthly === 'Off Track' ? 'OFF TRACK' : 'On Track'}: ${u.name}: ${u.monthlyNote}`));
  H('Headlines');
  const heads = fresh.updates.filter(u => u.headline);
  if (!heads.length) P('None.');
  heads.forEach(u => L(`${u.name}: ${u.headline}`));

  // Still open
  H('Still on the Issues List');
  const open = readIssues_(ss).filter(x => !x.done && !x.later && x.answer !== 'Yes' && x.answer !== 'No');
  if (!open.length) P('Nothing open.');
  open.forEach(x => L(`${x.compliance ? 'COMPLIANCE ' : x.urgent ? 'URGENT ' : ''}${x.ask} (raised by ${x.askedBy || '?'})`));

  doc.saveAndClose();
  const file = DriveApp.getFileById(doc.getId());
  file.moveTo(recapFolder_());
  file.setSharing(DriveApp.Access.DOMAIN_WITH_LINK, DriveApp.Permission.VIEW);
  const url = doc.getUrl();

  // Email draft to everyone in the meeting (Seattal reviews and hits Send)
  const to = people_(ss).filter(p => p.inMeeting && p.email).map(p => p.email).join(',');
  const html = `<div style="font-family:Arial;font-size:15px;color:#000">` +
    `<p><b>${esc_(title)}</b></p><p>Here is the recap: <a href="${url}">open the recap</a>.<br>` +
    `It has your To-Dos and due dates. Check it today. If something is wrong, tell Seattal or Jordan.</p>` +
    `<p style="color:#666">Next meeting: ${esc_(nextLabel_(meetingKey))}. Form due ${esc_(nextDue_(meetingKey))}.</p></div>`;
  GmailApp.createDraft(to, title, 'Recap: ' + url, { htmlBody: html });

  const msh = ss.getSheetByName(TAB.MEET);
  const r = msh.getLastRow() + 1;
  msh.getRange(r, 1, 1, 5).setValues([[meetingKey, mode, new Date(), avg, url]]);
  msh.getRange(r, 1).setNumberFormat('@').setValue(meetingKey);
  saveState(meetingKey, { finished: true });

  try { refreshTodoQuestion_(); syncNames(); } catch (e) {}
  return { url, draftTo: to };
}
function formUrl_() {
  const p = PropertiesService.getScriptProperties(); let u = p.getProperty('FORM_URL');
  if (!u) { u = FormApp.openById(CONFIG.FORM_ID).getPublishedUrl(); p.setProperty('FORM_URL', u); }
  return u;
}
function nextLabel_(key) { const n = meetings_(new Date(), 14).find(m => m.key > key); return n ? n.label : ''; }
function nextDue_(key) { const n = meetings_(new Date(), 14).find(m => m.key > key); return n ? n.dueLabel : ''; }
function recapFolder_() {
  const parent = DriveApp.getFolderById(CONFIG.FOLDER_ID);
  const it = parent.getFoldersByName('Meeting Recaps');
  return it.hasNext() ? it.next() : parent.createFolder('Meeting Recaps');
}

/* ============================================================
 * 7. TEST + CLEAN UP
 * ============================================================ */
function testWithTestUser() {
  const form = FormApp.openById(CONFIG.FORM_ID);
  const nameItem = form.getItems(FormApp.ItemType.LIST).find(i => i.getTitle() === Q.NAME).asListItem();
  nameItem.setChoiceValues(formNames_().concat([CONFIG.TEST_NAME]));
  const ss = board_();
  addTodoRow_(ss, { owner: CONFIG.TEST_NAME, todo: 'TEST to-do from last meeting', due: iso_(new Date()), added: '2026-01-01' });
  refreshTodoQuestion_();

  const item = t => form.getItems().find(i => i.getTitle() === t);
  const grid = item(Q.TODOS).asGridItem();
  const rows = grid.getRows();
  const fr = form.createResponse()
    .withItemResponse(nameItem.createResponse(CONFIG.TEST_NAME))
    .withItemResponse(item(Q.TEAM).asListItem().createResponse('Garden'))
    .withItemResponse(item(Q.WEEKLY).asParagraphTextItem().createResponse('TEST goal one: visit 10 stores by Friday\nTEST goal two: 3 tin quotes by Thursday\nTEST goal three: BA schedule by Wednesday'))
    .withItemResponse(item(Q.MONTHLY).asMultipleChoiceItem().createResponse('Off Track'))
    .withItemResponse(item(Q.MONTHLY_NOTE).asTextItem().createResponse('TEST monthly: NM displays by Nov 30: Off Track'))
    .withItemResponse(item(Q.HEADLINE).asTextItem().createResponse('TEST headline: a Reno store wants Flight Bites'))
    .withItemResponse(grid.createResponse(rows.map(r => r.indexOf(CONFIG.TEST_NAME) > -1 ? 'Not Done' : null)))
    .withItemResponse(item(Q.HAS_ASK).asMultipleChoiceItem().createResponse('Yes'))
    .withItemResponse(item(Q.ASK_FOR(1)).asMultipleChoiceItem().createResponse('Mike'))
    .withItemResponse(item(Q.ASK_TEXT(1)).asParagraphTextItem().createResponse('TEST ask: OK to order 2 pop-up podiums for Green Wednesday?'))
    .withItemResponse(item(Q.ASK_FLAGS(1)).asCheckboxItem().createResponse([FLAG.URGENT]))
    .withItemResponse(item(Q.MORE(1)).asMultipleChoiceItem().createResponse('No'))
    .withItemResponse(item(Q.PRIVATE).asParagraphTextItem().createResponse('TEST PRIVATE ANSWER: this must never show on the board'))
    .submit();
  PropertiesService.getScriptProperties().setProperty('TEST_RESPONSE_ID', fr.getId());

  // Give the form trigger time to run. If it did not run, process it directly and say so.
  let seen = false;
  for (let i = 0; i < 12 && !seen; i++) { Utilities.sleep(5000); seen = readUpdates_(board_()).some(u => u.name === CONFIG.TEST_NAME); }
  const note = seen ? 'The form trigger ran on its own.' : 'The form trigger did NOT run within 60 seconds, so the test answer was processed directly. Check Triggers.';
  if (!seen) handleResponse_(fr);

  const d = getBoard();
  const u = d.updates.find(x => x.name === CONFIG.TEST_NAME);
  const issues = d.issues.filter(x => x.askedBy === CONFIG.TEST_NAME);
  const json = JSON.stringify(d);
  const out = [note,
    'Board meeting: ' + d.meeting.label + (u ? '' : '  (NOTE: test answer counts for ' + meetingFor_(fr.getTimestamp()).label + ')'),
    'UPDATES row on board: ' + (u ? 'YES' : 'no'),
    'Issues from TEST USER: ' + issues.map(x => (x.urgent ? '[URGENT] ' : '') + x.ask).join(' | '),
    'Private answer anywhere in board data: ' + (json.indexOf('TEST PRIVATE ANSWER') > -1 ? 'YES (PROBLEM!)' : 'no (good)'),
    'Private sheet has it: ' + (SpreadsheetApp.openById(CONFIG.PRIVATE_ID).getSheets()[0].getDataRange().getValues().some(r => String(r[3]).indexOf('TEST PRIVATE') === 0) ? 'yes (good)' : 'NO')];
  Logger.log('\n' + out.join('\n'));
  return out;
}

function deleteTestData() {
  const T = CONFIG.TEST_NAME; const ss = board_(); const out = [];
  withLock_(() => {
    [[TAB.UPD, UC.name, UN], [TAB.TODO, TC.owner, TN], [TAB.PTS, 2, 5]].forEach(([tab, col, n]) => {
      const sh = ss.getSheetByName(tab); const last = sh.getLastRow(); if (last < 2) return;
      const v = sh.getRange(2, 1, last - 1, n).getValues(); let c = 0;
      for (let i = v.length - 1; i >= 0; i--) if (v[i][col - 1] === T) { sh.deleteRow(i + 2); c++; }
      out.push(`${tab}: ${c} test rows deleted`);
    });
    const iss = ss.getSheetByName(TAB.ISS); const last = iss.getLastRow(); let c = 0;
    if (last > 1) iss.getRange(2, 1, last - 1, IN).getValues().forEach((r, i) => {
      if (r[IC.askedBy - 1] === T || String(r[IC.ask - 1]).indexOf(T) > -1) { clearIssueRow_(iss, i + 2); c++; }
    });
    out.push(`${TAB.ISS}: ${c} test rows cleared`);
  });
  const psh = SpreadsheetApp.openById(CONFIG.PRIVATE_ID).getSheets()[0];
  const pv = psh.getDataRange().getValues(); let pc = 0;
  for (let i = pv.length - 1; i >= 1; i--) if (pv[i][1] === T) { psh.deleteRow(i + 1); pc++; }
  out.push(`Private sheet: ${pc} test rows deleted`);

  const form = FormApp.openById(CONFIG.FORM_ID);
  let fc = 0;
  form.getResponses().forEach(r => {
    const nm = r.getItemResponses().find(ir => ir.getItem().getTitle() === Q.NAME);
    if (nm && nm.getResponse() === T) { form.deleteResponse(r.getId()); fc++; }
  });
  out.push(`Form Responses tab: ${fc} test responses deleted`);
  let dest = '';
  try { dest = form.getDestinationId(); } catch (e) {}
  if (dest) {
    const ds = SpreadsheetApp.openById(dest); let dc = 0;
    ds.getSheets().forEach(sh => {
      const v = sh.getDataRange().getValues();
      for (let i = v.length - 1; i >= 1; i--) if (v[i].indexOf(T) > -1) { sh.deleteRow(i + 1); dc++; }
    });
    out.push(`Linked responses sheet: ${dc} test rows deleted`);
  } else out.push('Linked responses sheet: none exists (nothing to delete)');
  PropertiesService.getScriptProperties().getKeys().filter(k => k.indexOf('MEET_') === 0).forEach(k => {
    const s = JSON.parse(PropertiesService.getScriptProperties().getProperty(k));
    let dirty = false;
    ['checked', 'thumbs', 'ratings'].forEach(f => { if (s[f] && T in s[f]) { delete s[f][T]; dirty = true; } });
    if (dirty) PropertiesService.getScriptProperties().setProperty(k, JSON.stringify(s));
  });
  PropertiesService.getScriptProperties().deleteProperty('TEST_RESPONSE_ID');
  syncNames();
  refreshTodoQuestion_();
  out.push('TEST USER removed from the form name list.');
  Logger.log('\n' + out.join('\n'));
  return out;
}

/* ============================================================
 * 8. SHEET HELPERS
 * ============================================================ */
function ensureTab_(ss, name, head, widths, init) {
  let sh = ss.getSheetByName(name);
  const isNew = !sh;
  if (isNew) sh = ss.insertSheet(name);
  if (sh.getMaxColumns() < head.length) sh.insertColumnsAfter(sh.getMaxColumns(), head.length - sh.getMaxColumns());
  styleHeader_(sh, head);
  widths.forEach((w, i) => sh.setColumnWidth(i + 1, w));
  if (isNew) { sh.getRange(2, 1, sh.getMaxRows() - 1, head.length).setVerticalAlignment('top').setWrap(true); init(sh); }
  return sh;
}
function styleHeader_(sh, labels) {
  sh.getRange(1, 1, 1, labels.length).setValues([labels]).setBackground(B.black).setFontColor(B.ink)
    .setFontWeight('bold').setFontSize(10).setFontFamily('Arial').setVerticalAlignment('middle');
  sh.setRowHeight(1, 32); sh.setFrozenRows(1);
  sh.setTabColor(B.black);
}
function cf_(range, formula, bg, fg, bold, strike) {
  let b = SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied(formula).setRanges([range]);
  if (bg) b = b.setBackground(bg); if (fg) b = b.setFontColor(fg);
  if (bold) b = b.setBold(true); if (strike) b = b.setStrikethrough(true);
  return b.build();
}
function list_(range, values) {
  range.setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(values, true).setAllowInvalid(false).build());
}
function names_(range) {
  const src = range.getSheet().getParent().getRange(`'${TAB.PEOPLE}'!A2:A60`);
  range.setDataValidation(SpreadsheetApp.newDataValidation().requireValueInRange(src, true).setAllowInvalid(true).build());
}

function howTab_(sh) {
  sh.getRange(1, 1, sh.getMaxRows(), sh.getMaxColumns()).breakApart();
  sh.clear(); sh.clearConditionalFormatRules();
  sh.getImages().forEach(i => i.remove());
  sh.setHiddenGridlines(true);
  if (sh.getMaxColumns() < 3) sh.insertColumnsAfter(sh.getMaxColumns(), 3 - sh.getMaxColumns());
  if (sh.getMaxRows() < 90) sh.insertRowsAfter(sh.getMaxRows(), 90 - sh.getMaxRows());
  sh.getRange(1, 1, 90, 3).setBackground(B.black).setFontColor(B.ink).setFontFamily('Arial').setFontSize(12).setVerticalAlignment('middle');
  sh.setColumnWidth(1, 30); sh.setColumnWidth(2, 260); sh.setColumnWidth(3, 700);
  sh.setRowHeight(1, 20); sh.setRowHeights(2, 4, 30);
  try { sh.insertImage(DriveApp.getFileById(CONFIG.LOGO_ID).getBlob(), 2, 2).setWidth(110).setHeight(110); } catch (e) {}
  sh.getRange('C2').setValue('HOW WE MEET').setFontSize(26).setFontWeight('bold');
  sh.getRange('C3').setValue('Everyone knows the plan. Everyone owns their part. Nobody stays stuck.').setFontColor('#bdbdbd');
  sh.getRange('C4').setValue('Every Monday and Friday · 60 minutes · Mike makes the final call.').setFontColor('#bdbdbd');
  let r = 7;
  const block = (title, rows) => {
    sh.getRange(r, 2, 1, 2).merge().setValue(title).setFontWeight('bold').setFontSize(11)
      .setBorder(null, null, true, null, null, null, B.ink, SpreadsheetApp.BorderStyle.SOLID); r++;
    rows.forEach(([k, v]) => {
      sh.getRange(r, 2).setValue(k).setFontWeight('bold');
      sh.getRange(r, 3).setValue(v).setWrap(true);
      sh.setRowHeight(r, v.length > 90 ? 46 : 28); r++;
    });
    r++;
  };
  block('BEFORE THE MEETING', [
    ['Fill out the form', 'Monday meeting: due 12 PM Monday. Friday meeting: due 6 PM Thursday. About 5 minutes.'],
    ['Question 7', 'Optional and private. Only Mike and Jordan see it. It never goes on the screen, the recap or any shared sheet.'],
    ['Check yourself', 'Form in on time? Know your To-Dos and if each is Done? Any problem you need solved is in the form?'],
    ['Seattal or Jordan', 'Fill in the SNAPSHOT tab (sales vs. goal, top 3 priorities, On/Off Track per team).']]);
  block('THE MEETING · 60 MINUTES', [
    ['1. Personal Update · 8', 'Go around the room. How you\'re doing + anything that could affect your week. "Pass" is OK.'],
    ['2. Clearing Round · 1', 'Thumbs up or down: am I good with everyone here? Thumbs down = talk 1-on-1 right after.'],
    ['3. Company Snapshot · 4', 'Where the whole company stands. Just listen. Questions go to Problem Solving.'],
    ['4. Weekly Goals · 5', 'Monday: read your 3 goals. Friday: Hit or Missed. No explaining. Missed goes on the Issues List.'],
    ['5. Monthly Goals · 4', 'On Track or Off Track. "Kind of" is not an answer. Off Track goes on the Issues List.'],
    ['6. Headlines · 3', 'One sentence of news about a customer, a store or the team. No discussion.'],
    ['7. To-Do Review · 4', 'Done or Not Done. Not Done twice in a row goes on the Issues List.'],
    ['8. Problem Solving · 26', 'Biggest first, one at a time. Identify the real problem. Discuss: everyone says it once. Solve: Mike makes the call. 10 minutes max each. A major issue can get one Deep Dive (2 min each person).'],
    ['9. Wrap-Up · 5', 'Read your new To-Dos out loud: what and by when. Rate the meeting 1 to 10. Under 8? Say why. Then press Finish.']]);
  block('YOUR ANSWERS', [['Weekly goals', 'Hit or Missed'], ['Monthly goals', 'On Track or Off Track'], ['To-Dos', 'Done or Not Done'],
    ["Mike's call", 'Yes (becomes a To-Do with one name + a date) · No · Next meeting']]);
  block('AFTER THE MEETING', [
    ['The recap', 'Press Finish on the board. A recap doc with everyone\'s To-Dos is made in Team Meetings > Meeting Recaps. Seattal sends the email.'],
    ['Your To-Dos', 'Due within 7 days. Report Done or Not Done at the next meeting.'],
    ['Targets', 'To-Dos 90% Done · Weekly goals 80% Hit · Monthly goals 80% Done · Meeting rating 8 or higher.']]);
  block('POINTS (start ' + fmt_(CONFIG.POINTS_START) + '. Weeks 1 and 2 are practice)', [
    ['1 point', 'Form late · Can\'t give your goal or To-Do status · Goal has no number or deadline · More than 2 minutes late'],
    ['2 points', 'No form · Missed the meeting without telling the facilitator first'],
    ['3 in a month', '1-on-1 with Mike. 5 in a month: written plan with Mike. Points reset on the 1st. No points for real emergencies.']]);
  block('RULES', [
    ['1', 'Start on time. End on time. Camera on. Phone away.'],
    ['2', 'One person talks at a time. Short answers during updates. Save problems for Problem Solving.'],
    ['3', 'Every To-Do has one name and one due date. "We" is nobody.'],
    ['4', 'Compliance concerns go to the top of the list, right away.'],
    ['5', 'Focus on the problem, not the person. Personal updates stay in the meeting.']]);
  block('THE TABS', [
    ['SNAPSHOT', 'Fill in before each meeting. Shows on screen in step 3.'],
    ['UPDATES', 'Everyone\'s form answers. Fills itself.'],
    ['ISSUES LIST', 'Every problem and ask. Fills itself from the form. Meeting Notes reads columns A to F.'],
    ['TO-DOS', 'Every To-Do with one name and a date. Made at the meeting.'],
    ['POINTS · MEETINGS', 'Points log. List of past meetings with links to each recap.'],
    ['WHO RUNS WHAT', 'Names, emails, who is in the meeting. Add new people here.'],
    ['SPECIAL DATES', 'Meeting moved or cancelled? Add a row here. The form and board follow it.']]);
  block('PLEASE DON\'T', [['', 'Rename tabs or move columns. The automation reads them.']]);
  sh.setTabColor(B.black);
}

/* ============================================================
 * 9. READ / WRITE HELPERS
 * ============================================================ */
function board_() { return SpreadsheetApp.openById(CONFIG.BOARD_ID); }
function tz_() { return Session.getScriptTimeZone(); }
function people_(ss) {
  const sh = (ss || board_()).getSheetByName(TAB.PEOPLE);
  const v = sh.getRange(2, 1, 59, 5).getValues();
  const yes = x => String(x).trim().toLowerCase() !== 'no';
  return v.filter(r => String(r[0]).trim()).map(r => ({ name: String(r[0]).trim(), role: r[1], email: String(r[2]).trim(),
    inMeeting: yes(r[3]), fillsForm: yes(r[4]) && yes(r[3]) }));
}
function readUpdates_(ss) {
  const sh = ss.getSheetByName(TAB.UPD); const last = sh.getLastRow();
  if (last < 2) return [];
  return sh.getRange(2, 1, last - 1, UN).getValues().filter(r => r[UC.name - 1]).map(r => ({
    meeting: iso_(r[0]) || String(r[0]), type: r[1], name: r[2], team: r[3], weekly: String(r[4] || ''), monthly: r[5],
    monthlyNote: String(r[6] || ''), headline: String(r[7] || ''), todos: String(r[8] || ''), asks: r[9],
    submitted: r[10] instanceof Date ? Utilities.formatDate(r[10], tz_(), 'EEE h:mm a') : '', onTime: r[11] }));
}
function readIssues_(ss) {
  const sh = ss.getSheetByName(TAB.ISS); const last = sh.getLastRow(); const out = [];
  if (last < 2) return out;
  sh.getRange(2, 1, last - 1, IN).getValues().forEach((r, i) => {
    if (!String(r[IC.ask - 1]).trim()) return;
    out.push({ row: i + 2, num: r[IC.num - 1], added: iso_(r[IC.added - 1]), team: r[IC.team - 1], askedBy: String(r[IC.askedBy - 1] || ''),
      ask: String(r[IC.ask - 1]), urgent: r[IC.urgent - 1] === true, answer: r[IC.answer - 1], owner: r[IC.owner - 1],
      due: iso_(r[IC.due - 1]), done: r[IC.done - 1] === true, later: r[IC.later - 1] === true, notes: String(r[IC.notes - 1] || ''),
      answeredOn: iso_(r[IC.answeredOn - 1]) || String(r[IC.answeredOn - 1] || ''), forWho: r[IC.forWho - 1] || 'Someone else',
      decision: String(r[IC.decision - 1] || ''), compliance: r[IC.compliance - 1] === true, deep: r[IC.deep - 1] === true,
      meeting: String(r[IC.meeting - 1] || '') });
  });
  return out;
}
function writeIssue_(sh, row, d) {
  if (!row) {
    const vals = sh.getRange(2, IC.ask, sh.getMaxRows() - 1, 1).getValues();
    const i = vals.findIndex(r => r[0] === '');
    if (i === -1) { sh.insertRowsAfter(sh.getMaxRows(), 50); row = sh.getMaxRows() - 49; } else row = i + 2;
    const nums = sh.getRange(2, IC.num, sh.getMaxRows() - 1, 1).getValues().map(r => +r[0] || 0);
    sh.getRange(row, IC.num).setValue(Math.max.apply(null, nums.concat([0])) + 1);
    sh.getRange(row, IC.added).setValue(new Date());
  }
  Object.keys(d).forEach(k => {
    const c = IC[k]; if (!c || k === 'num' || k === 'added') return;
    let v = d[k];
    if (k === 'due') v = v ? new Date(v + 'T12:00:00') : '';
    if (['urgent', 'done', 'later', 'compliance', 'deep'].indexOf(k) > -1) v = !!v;
    const cell = sh.getRange(row, c);
    if (k === 'meeting' || k === 'answeredOn') cell.setNumberFormat('@');
    cell.setValue(v == null ? '' : v);
  });
  return row;
}
function readTodos_(ss) {
  const sh = ss.getSheetByName(TAB.TODO); const last = sh.getLastRow(); const out = [];
  if (last < 2) return out;
  sh.getRange(2, 1, last - 1, TN).getValues().forEach((r, i) => {
    if (!String(r[TC.todo - 1]).trim()) return;
    out.push({ row: i + 2, num: +r[0], added: iso_(r[1]) || String(r[1]), owner: String(r[2] || ''), todo: String(r[3]), due: iso_(r[4]),
      status: r[5], notDone: +r[6] || 0, issue: r[7], checked: iso_(r[8]) || String(r[8] || ''), formSays: r[9], onList: r[10] === 'Yes' });
  });
  return out;
}
function addTodoRow_(ss, d) {
  const sh = ss.getSheetByName(TAB.TODO);
  const last = sh.getLastRow();
  const nums = last > 1 ? sh.getRange(2, 1, last - 1, 1).getValues().map(r => +r[0] || 0) : [0];
  const row = last + 1;
  sh.getRange(row, 1, 1, TN).setValues([[Math.max.apply(null, nums) + 1, d.added, d.owner, d.todo,
    d.due ? new Date(d.due + 'T12:00:00') : '', '', 0, d.issue || '', '', '', '']]);
  sh.getRange(row, TC.added).setNumberFormat('@').setValue(d.added);
  return row;
}
function readPoints_(ss) {
  const sh = ss.getSheetByName(TAB.PTS); const last = sh.getLastRow();
  if (last < 2) return [];
  return sh.getRange(2, 1, last - 1, 5).getValues().filter(r => r[1]).map(r => ({ date: iso_(r[0]), name: r[1], points: +r[2] || 0, why: r[3], meeting: String(r[4]) }));
}
function readMeetings_(ss) {
  const sh = ss.getSheetByName(TAB.MEET); const last = sh.getLastRow();
  if (last < 2) return [];
  return sh.getRange(2, 1, last - 1, 5).getValues().filter(r => r[0]).map(r => ({ meeting: iso_(r[0]) || String(r[0]), type: r[1], rating: r[3], url: r[4] }));
}
function readSnapshot_(ss) {
  const sh = ss.getSheetByName(TAB.SNAP); const last = sh.getLastRow();
  if (last < 2) return [];
  const tip = /^(Example|Write the priority)/;
  return sh.getRange(2, 1, last - 1, 3).getDisplayValues().filter(r => r[0] && (r[1] || (r[2] && !tip.test(r[2]))))
    .map(r => ({ what: r[0], value: r[1], note: tip.test(r[2]) ? '' : r[2] }));
}
function withLock_(fn) {
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try { return fn(); } finally { lock.releaseLock(); }
}
function merge_(t, s) {
  Object.keys(s).forEach(k => {
    const v = s[k];
    if (v && typeof v === 'object' && !Array.isArray(v)) t[k] = merge_(t[k] && typeof t[k] === 'object' ? t[k] : {}, v);
    else t[k] = v;
  });
  return t;
}
function lines_(s) { return String(s || '').split(/\n+/).map(x => x.replace(/^\s*(?:[-•*]+|\d+[.)])\s*/, '').trim()).filter(Boolean); }
function iso_(d) {
  if (!d) return '';
  if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  const dt = d instanceof Date ? d : new Date(d);
  return isNaN(dt) ? '' : Utilities.formatDate(dt, tz_(), 'yyyy-MM-dd');
}
function fmt_(d) {
  if (!d) return '';
  const dt = d instanceof Date ? d : new Date(String(d).length === 10 ? d + 'T12:00:00' : d);
  return isNaN(dt) ? String(d) : Utilities.formatDate(dt, tz_(), 'EEE M/d');
}
function esc_(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
}
