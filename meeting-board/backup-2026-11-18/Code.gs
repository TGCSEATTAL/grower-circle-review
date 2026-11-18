/**
 * TGC TEAM MEETING — Jordan's Team Meeting Guide version (Nov 2026)
 * ----------------------------------------------------------------
 * 1. THE FORM — everyone fills it out before every meeting
 *      Monday meeting: due 12 PM Monday · Friday meeting: due 6 PM Thursday
 * 2. THE BOARD (Google Sheet) — updates, goals, the Issues List and To-Dos land here
 * 3. THE LIVE BOARD (web page) — the 9 steps on screen during the meeting
 * 4. WEEKLY SUMMARY EMAIL — Friday 7 PM, lands in Seattal's drafts
 * Question 7 (outside-work) never goes on the board. It goes to a separate
 * private sheet for Mike and Jordan only.
 *
 * SWITCHING (one time):
 *   1. Save both files.  2. Run upgradeToMeetingGuide.  3. Deploy > Manage deployments > New version.
 */
const CONFIG = {
  MAIN_MEETING: 'Monday Meeting',
  CHECK_IN: 'Friday Meeting',
  START_TIME: '3:30 PM',
  MIKE_EMAIL: 'mike@thegrowercircle.com',
  AARON_EMAIL: 'aaron@thegrowercircle.com',
  KYLE_EMAIL: 'kyle@thegrowercircle.com',
  JORDAN_EMAIL: 'jordan@thegrowercircle.com',
  CC_EMAIL: 'seattal@thegrowercircle.com',
  SEND_MODE: 'draft',                // 'draft' = summary waits in Seattal's drafts. 'send' = goes out on its own.
  FOLDER_ID: '1UVgFU5nQ6LFIhZsV1yfAxwD5RTZjlrc5',
  LOGO_ID: '1zKucKB82m0SIjIAwfFJQvia5891eO7mJ',
  SUMMARY_HOUR: 19
};

const TEAMS = [
  { name: 'Garden',                 lead: 'Dylan (Aaron helps)' },
  { name: 'Compliance',             lead: 'Leah' },
  { name: 'Kitchen (Flight Bites)', lead: 'Chef' },
  { name: 'Sales (Nevada)',         lead: 'Aaron' },
  { name: 'New Mexico',             lead: 'Kyle' },
  { name: 'Production & Packaging', lead: 'Aaron, Dylan, Leah' },
  { name: 'Orders & Delivery',      lead: 'Aaron' },
  { name: 'Merch',                  lead: 'Seattal + merch team' },
  { name: 'Marketing & Events',     lead: 'Seattal' },
  { name: 'Leadership',             lead: 'Mike' }
];
const ANSWERS = ['Solved', 'Next meeting', 'Not doing it'];   // Mike's call on each issue
const PEOPLE = [
  ['Mike', 'Decision Maker. Makes the final call on every issue.'],
  ['Jordan', 'Investor. Co-facilitates with Seattal.'],
  ['Aaron', 'Runs sales, orders and production.'],
  ['Kyle', 'Co-founder. Runs New Mexico.'],
  ['Dylan', 'Runs the garden.'],
  ['Leah', 'Runs compliance (licenses and state rules).'],
  ['Chef', 'Runs the kitchen (Flight Bites).'],
  ['Seattal', 'Facilitator. Runs marketing, events and merch. Runs the meeting screen.'],
  ['Alex', 'Merch team'], ['Jimmy', 'Merch team'], ['Pala', 'Merch team'], ['Jas', 'Merch team']
];

// Form questions (the script reads answers by these titles — don't rename them in the form)
const Q = {
  NAME: 'Your name',
  TEAM: 'Your team',
  MEETING: 'Which meeting is this for?',
  GOOD: '1. One good thing from your personal life and one from work',
  WEEKLY: '2. Weekly goals',
  MONTHLY: '3. Monthly goals: On Track or Off Track',
  SHORT: '4. Where did you fall short, and why?',
  BLOCK: '5. What is blocking you, and what help do you need?',
  COMPLIANCE: '6. Any compliance concern?',
  COMPLIANCE_WHAT: '6b. If yes, what is it? (one sentence)',
  HEADLINE: 'Headline: one quick piece of news (optional)',
  DEEP: 'Does your biggest problem need a Deep Dive?',
  PRIVATE: '7. Anything outside work that could affect your week? (optional, private)'
};
const MEETINGS = ['Monday meeting', 'Friday meeting'];
const DEEP_YES = 'Yes, it affects several people, a brand, a store or a license';

const TAB = { HOW: 'HOW IT WORKS', PEOPLE_UP: 'UPDATES', TEAMS: 'TEAM UPDATES', ASKS: 'ISSUES & TO-DOS', OLD_ASKS: 'ASKS', PEOPLE: 'WHO RUNS WHAT' };
const UP = { name: 1, team: 2, meeting: 3, good: 4, weekly: 5, monthly: 6, short: 7, block: 8, compliance: 9, headline: 10, deep: 11, updated: 12 };
const UPN = 12;
const COL = { num: 1, added: 2, team: 3, askedBy: 4, ask: 5, urgent: 6, answer: 7, owner: 8, due: 9, done: 10, later: 11, notes: 12, answeredOn: 13 };
const NCOL = 13;
const NAMES_RANGE = "'WHO RUNS WHAT'!A2:A60";
const C = { room: '#0b0b0a', panel: '#151513', panel2: '#1c1b18', line: '#2c2a25', ink: '#f2eee6', soft: '#cfc8ba',
  muted: '#958f83', brass: '#c9a24d', good: '#4fae7c', warn: '#e2aa3c', bad: '#dc5a4c', later: '#86b8d8' };

/* ============================================================
 * 1. UPGRADE — run once. Keeps the same board sheet, form link and live board link.
 * ============================================================ */
function upgradeToMeetingGuide() {
  const props = PropertiesService.getScriptProperties();
  const ss = board_();

  // Issues List: rename the old ASKS tab, relabel headers + answer choices. Nothing on it is deleted.
  let asks = ss.getSheetByName(TAB.ASKS) || ss.getSheetByName(TAB.OLD_ASKS);
  asks.setName(TAB.ASKS);
  asks.getRange(1, 1, 1, NCOL).setValues([['#', 'ADDED', 'TEAM', 'RAISED BY', 'THE ISSUE / TO-DO', 'URGENT', "MIKE'S CALL", 'OWNER', 'DUE BY', 'DONE', 'LATER', 'NOTES', 'DECIDED ON']]);
  const N = asks.getMaxRows() - 1;
  const old = asks.getRange(2, COL.answer, N, 1).getValues()
    .map(r => [({ 'Yes': 'Solved', 'No': 'Not doing it', 'Not yet': 'Next meeting' })[r[0]] || r[0]]);
  asks.getRange(2, COL.answer, N, 1).clearDataValidations().setValues(old);
  list_(asks.getRange(2, COL.answer, N, 1), ANSWERS);
  const ans = asks.getRange(2, COL.answer, N, 1), body = asks.getRange(2, 1, N, NCOL);
  asks.setConditionalFormatRules([
    cf_(body, '=$J2=TRUE', '#121211', '#5f5a51', false, true),
    cf_(body, '=$K2=TRUE', '#10171c', C.later),
    cf_(ans, '=$G2="Solved"', C.good, '#06140c', true),
    cf_(ans, '=$G2="Not doing it"', C.bad, '#1c0806', true),
    cf_(ans, '=$G2="Next meeting"', C.warn, '#1b1304', true),
    cf_(asks.getRange(2, COL.ask, N, 1), '=$F2=TRUE', null, C.bad, true)
  ]);
  list_(asks.getRange(2, COL.team, N, 1), TEAMS.map(t => t.name));

  // Names: add Jordan if missing
  const ppl = ss.getSheetByName(TAB.PEOPLE);
  const names = people_(ss);
  PEOPLE.forEach(p => { if (names.indexOf(p[0]) < 0) { const r = ppl.getRange('A2:A60').getValues().findIndex(x => !x[0]) + 2; ppl.getRange(r, 1, 1, 2).setValues([p]); } });

  // New UPDATES tab (one row per person), old TEAM UPDATES tab hidden (kept, not deleted)
  if (!ss.getSheetByName(TAB.PEOPLE_UP)) peopleUpdatesTab_(ss.insertSheet(TAB.PEOPLE_UP, 1));
  const tu = ss.getSheetByName(TAB.TEAMS); if (tu) tu.hideSheet();

  // HOW IT WORKS: rewritten
  const how = ss.getSheetByName(TAB.HOW);
  how.clear(); how.clearConditionalFormatRules(); howTab_(how);

  // Private sheet for question 7 (never on the board)
  if (!props.getProperty('PRIVATE_ID')) {
    const p = SpreadsheetApp.create('PRIVATE — Outside-work notes (Mike + Jordan only)');
    p.getSheets()[0].setName('NOTES').getRange(1, 1, 1, 3).setValues([['DATE', 'NAME', 'WHAT THEY SHARED']]).setFontWeight('bold');
    p.getSheets()[0].setColumnWidth(3, 600);
    DriveApp.getFileById(p.getId()).moveTo(DriveApp.getFolderById(CONFIG.FOLDER_ID));
    props.setProperty('PRIVATE_ID', p.getId());
  }

  // Form: same link, new questions
  const form = FormApp.openById(prop_('FORM_ID'));
  form.getItems().forEach(i => form.deleteItem(i));
  buildForm_(form);
  installTriggers();
  ss.setActiveSheet(how);
  Logger.log('BOARD: ' + ss.getUrl());
  Logger.log('FORM: ' + form.getPublishedUrl());
  Logger.log('PRIVATE SHEET (share with Mike + Jordan only): ' + SpreadsheetApp.openById(prop_('PRIVATE_ID')).getUrl());
}

function installTriggers() {
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('onUpdateSubmit').forForm(FormApp.openById(prop_('FORM_ID'))).onFormSubmit().create();
  ScriptApp.newTrigger('weeklySummary').timeBased().onWeekDay(ScriptApp.WeekDay.FRIDAY).atHour(CONFIG.SUMMARY_HOUR).create();
}

/* ============================================================
 * 2. THE FORM — Jordan's 7 questions
 * ============================================================ */
function buildForm_(form) {
  form.setTitle('TGC Team Meeting Form');
  form.setDescription('Fill this out before every meeting. About 5 minutes.\n' +
    'Monday meeting: due 12 PM Monday.  Friday meeting: due 6 PM Thursday.\n' +
    'A good goal has a number and a deadline: "Visit 10 stores by Friday," not "Visit more stores."');
  form.setCollectEmail(false);
  form.setAllowResponseEdits(true);
  form.setProgressBar(false);
  form.setConfirmationMessage('Got it, thank you! See you at the meeting.');
  form.addListItem().setTitle(Q.NAME).setChoiceValues(people_().concat(['Someone else'])).setRequired(true);
  form.addListItem().setTitle(Q.TEAM).setChoiceValues(TEAMS.map(t => t.name)).setRequired(true);
  form.addMultipleChoiceItem().setTitle(Q.MEETING).setChoiceValues(MEETINGS).setRequired(true);
  form.addParagraphTextItem().setTitle(Q.GOOD)
    .setHelpText('Example: "My daughter\'s first soccer game. We got two new stores in Reno."').setRequired(true);
  form.addParagraphTextItem().setTitle(Q.WEEKLY)
    .setHelpText('Monday: your 3 goals for this week, one per line.\nFriday: Hit or Missed for each.\nExample: "Visit 10 stores: Hit"').setRequired(true);
  form.addParagraphTextItem().setTitle(Q.MONTHLY)
    .setHelpText('One per line. Example: "NM displays by Nov 30: Off Track"').setRequired(true);
  form.addParagraphTextItem().setTitle(Q.SHORT)
    .setHelpText('Example: "Missed the tin quotes. Two vendors haven\'t replied." Write "None" if nothing.');
  form.addParagraphTextItem().setTitle(Q.BLOCK)
    .setHelpText('Each line goes on the Issues List for Problem Solving. Leave blank if nothing.');
  form.addMultipleChoiceItem().setTitle(Q.COMPLIANCE)
    .setHelpText('Anything that could put a license, a product or a store at risk. Yes goes to the top of the list.')
    .setChoiceValues(['No', 'Yes']).setRequired(true);
  form.addTextItem().setTitle(Q.COMPLIANCE_WHAT);
  form.addTextItem().setTitle(Q.HEADLINE).setHelpText('Example: "Store X in Reno wants to carry Flight Bites."');
  form.addCheckboxItem().setTitle(Q.DEEP).setChoiceValues([DEEP_YES]);
  form.addParagraphTextItem().setTitle(Q.PRIVATE)
    .setHelpText('Optional and private. Only Mike and Jordan see this. It never goes on the meeting screen. Leave blank if nothing.');
}
function syncNames() {
  const item = FormApp.openById(prop_('FORM_ID')).getItems(FormApp.ItemType.LIST).find(i => i.getTitle() === Q.NAME);
  const names = people_();
  if (item && names.length) item.asListItem().setChoiceValues(names.concat(['Someone else']));
}

/* ============================================================
 * 3. WHEN SOMEONE SUBMITS THE FORM
 * ============================================================ */
function onUpdateSubmit(e) {
  const a = answers_(e.response);
  const ss = board_();
  const name = a[Q.NAME] || 'Someone';
  const compliance = a[Q.COMPLIANCE] === 'Yes';
  const deep = String(a[Q.DEEP] || '').indexOf('Yes') === 0;
  const row = [name, a[Q.TEAM] || '', a[Q.MEETING] || '', a[Q.GOOD] || '', a[Q.WEEKLY] || '', a[Q.MONTHLY] || '',
    a[Q.SHORT] || '', a[Q.BLOCK] || '', compliance ? 'YES: ' + (a[Q.COMPLIANCE_WHAT] || '') : 'No',
    a[Q.HEADLINE] || '', deep ? 'Yes' : '', new Date()];
  withLock_(() => {
    const sh = ss.getSheetByName(TAB.PEOPLE_UP);
    const last = Math.max(sh.getLastRow(), 1);
    const names = last > 1 ? sh.getRange(2, 1, last - 1, 1).getValues().map(r => r[0]) : [];
    const r = names.indexOf(name) > -1 ? names.indexOf(name) + 2 : last + 1;
    sh.getRange(r, 1, 1, UPN).setValues([row]);
  });
  const asks = ss.getSheetByName(TAB.ASKS);
  if (compliance) writeAsk_(asks, null, { team: 'Compliance', askedBy: name, ask: 'COMPLIANCE: ' + (a[Q.COMPLIANCE_WHAT] || 'see form'), urgent: true });
  lines_(a[Q.BLOCK]).filter(x => !/^(none|n\/a|nothing)$/i.test(x)).forEach((x, i) =>
    writeAsk_(asks, null, { team: a[Q.TEAM], askedBy: name, ask: x, urgent: false, notes: deep && i === 0 ? 'Deep Dive requested' : '' }));
  const priv = String(a[Q.PRIVATE] || '').trim();
  if (priv) {
    try { SpreadsheetApp.openById(prop_('PRIVATE_ID')).getSheets()[0].appendRow([new Date(), name, priv]); } catch (err) {}
  }
}

/* ============================================================
 * 4. WEEKLY SUMMARY EMAIL — Friday 7 PM (never includes question 7)
 * ============================================================ */
function weeklySummary() {
  const ss = board_();
  const now = new Date();
  const ups = readPeople_(ss);
  const fresh = u => u.updated && (now - new Date(u.updated + 'T12:00:00')) < 8 * 864e5;
  const asks = readAsks_(ss).filter(x => !x.done && !x.later);
  const late = asks.filter(x => x.answer === 'Solved' && x.due && new Date(x.due + 'T23:59:59') < now)
    .map(x => [x.owner || '—', x.ask, fmt_(x.due)]);
  const open = asks.filter(x => x.answer !== 'Solved' && x.answer !== 'Not doing it').map(x => [x.urgent ? 'URGENT' : '', x.askedBy, x.ask]);
  const todos = asks.filter(x => x.answer === 'Solved').map(x => [x.owner || '—', x.ask, fmt_(x.due)]);
  const missing = people_(ss).filter(n => !ups.some(u => u.name === n && fresh(u)));

  let html = `<div style="font-family:Arial;max-width:720px"><div style="background:${C.room};color:${C.ink};padding:16px 18px">` +
    `<div style="color:${C.brass};font-size:11px;letter-spacing:2px">THE GROWER CIRCLE · FLIGHT BITES</div>` +
    `<div style="font-family:Georgia;font-size:24px;font-weight:bold">Weekly Summary</div>` +
    `<div style="color:${C.muted};font-size:12px">${fmt_(now)}</div></div>`;
  html += h_('Weekly goals') + table_(['Who', 'Weekly goals', 'Monthly goals'], ups.filter(fresh).map(u => [u.name, u.weekly, u.monthly]));
  if (missing.length) html += `<p style="font-size:13px"><b>No form this week:</b> ${missing.map(esc_).join(', ')}</p>`;
  if (late.length) html += h_('Late to-dos', C.bad) + table_(['Who', 'To-do', 'Was due'], late);
  if (open.length) html += h_(`Issues List (${open.length})`) + table_(['', 'Raised by', 'Issue'], open);
  if (todos.length) html += h_(`Open to-dos (${todos.length})`) + table_(['Who', 'To-do', 'Due'], todos);
  let live = ''; try { live = ScriptApp.getService().getUrl() || ''; } catch (e) {}
  html += `<p style="font-size:13px">${live ? `<a href="${live}">Open the live board</a> · ` : ''}<a href="${ss.getUrl()}">Open the sheet</a></p></div>`;
  const to = [CONFIG.MIKE_EMAIL, CONFIG.AARON_EMAIL, CONFIG.KYLE_EMAIL, CONFIG.JORDAN_EMAIL].join(',');
  const subject = `TGC Weekly Summary — ${fmt_(now)}`;
  const opts = { htmlBody: html, cc: CONFIG.CC_EMAIL };
  if (CONFIG.SEND_MODE === 'send') GmailApp.sendEmail(to, subject, 'Open in a browser to read the summary.', opts);
  else GmailApp.createDraft(to, subject, 'Open in a browser to read the summary.', opts);
  try { syncNames(); } catch (e) {}
}

/* ============================================================
 * 5. SHEET TABS
 * ============================================================ */
function canvas_(sh, rows, cols) {
  sh.setHiddenGridlines(true);
  if (sh.getMaxColumns() > cols) sh.deleteColumns(cols + 1, sh.getMaxColumns() - cols);
  if (sh.getMaxColumns() < cols) sh.insertColumnsAfter(sh.getMaxColumns(), cols - sh.getMaxColumns());
  if (sh.getMaxRows() > rows) sh.deleteRows(rows + 1, sh.getMaxRows() - rows);
  if (sh.getMaxRows() < rows) sh.insertRowsAfter(sh.getMaxRows(), rows - sh.getMaxRows());
  sh.getRange(1, 1, rows, cols).setBackground(C.room).setFontColor(C.ink).setFontFamily('Arial').setFontSize(11).setVerticalAlignment('middle');
}
function header_(sh, labels) {
  sh.getRange(1, 1, 1, labels.length).setValues([labels]).setFontColor(C.brass).setFontWeight('bold').setFontSize(9)
    .setBorder(null, null, true, null, null, null, C.brass, SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  sh.setRowHeight(1, 30); sh.setFrozenRows(1);
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
  const src = range.getSheet().getParent().getRange(NAMES_RANGE);
  range.setDataValidation(SpreadsheetApp.newDataValidation().requireValueInRange(src, true).setAllowInvalid(true).build());
}

function howTab_(sh) {
  canvas_(sh, 70, 3);
  sh.setColumnWidth(1, 30); sh.setColumnWidth(2, 220); sh.setColumnWidth(3, 680);
  sh.getRange('B2').setValue('HOW WE MEET').setFontFamily('Georgia').setFontSize(22).setFontWeight('bold');
  sh.getRange('B3').setValue('Everyone knows the plan. Everyone owns their part. Nobody stays stuck.').setFontColor(C.muted);
  let r = 5;
  const block = (title, rows) => {
    sh.getRange(r++, 2).setValue(title).setFontColor(C.brass).setFontWeight('bold').setFontSize(9);
    rows.forEach(([k, v]) => {
      sh.getRange(r, 2).setValue(k).setFontWeight('bold').setBackground(C.panel);
      sh.getRange(r, 3).setValue(v).setWrap(true).setBackground(C.panel);
      sh.setRowHeight(r, v.length > 95 ? 44 : 28); r++;
    });
    r++;
  };
  block('BEFORE', [
    ['Fill out the form', 'Monday meeting: due 12 PM Monday. Friday meeting: due 6 PM Thursday. About 5 minutes.'],
    ['Question 7', 'Optional and private. Only Mike and Jordan see it. It never goes on the screen.']
  ]);
  block('THE MEETING · 60 MINUTES', [
    ['1. Personal Update · 8', 'About 1 minute each. How you\'re doing + anything that could affect your week. "Pass" is OK.'],
    ['2. Clearing Round · 1', 'Thumbs up or down: am I good with everyone here? Anything that comes up gets handled 1-on-1 after.'],
    ['3. Company Snapshot · 4', 'Where the whole company stands. Seattal or Jordan preps it, Mike reviews.'],
    ['4. Weekly Goals · 5', 'Monday: say your 3 goals. Friday: Hit or Missed. Missed goes on the Issues List.'],
    ['5. Monthly Goals · 4', 'On Track or Off Track. Off Track goes on the Issues List.'],
    ['6. Headlines · 3', 'One sentence of news about a customer, a store or the team.'],
    ['7. To-Do Review · 4', 'Done or Not Done. Not Done twice in a row goes on the Issues List.'],
    ['8. Problem Solving · 26', 'Biggest issues first, one at a time: Identify, Discuss, Solve. 10 min max each. Mike makes the final call.'],
    ['9. Wrap-Up · 5', 'Read your new To-Dos out loud. Rate the meeting 1 to 10. Under 8? Say why.']
  ]);
  block('YOUR ANSWERS', [
    ['Weekly goals', 'Hit or Missed'],
    ['Monthly goals', 'On Track or Off Track'],
    ['To-Dos', 'Done or Not Done'],
    ["Mike's call", 'Solved (becomes a To-Do with one name + a due date) · Next meeting · Not doing it']
  ]);
  block('THE TABS', [
    ['UPDATES', 'Everyone\'s latest form answers. Fills itself.'],
    ['ISSUES & TO-DOS', 'Every issue and every To-Do. Fills itself from the form. You can also add a row.'],
    ['WHO RUNS WHAT', 'Everybody\'s name and role. Add new people here.']
  ]);
  block('RULES', [
    ['1', 'Start on time. End on time. Camera on. Phone away.'],
    ['2', 'Short answers during updates. Save problems for Problem Solving.'],
    ['3', 'Every To-Do has one name and one due date.'],
    ['4', 'Compliance concerns go to the top of the list, right away.'],
    ['5', 'Personal updates stay in the meeting. Personal conflicts get handled 1-on-1.'],
    ['6', 'Meetings are recorded on Google Meet for the recap.']
  ]);
  block('PLEASE DON\'T', [['', 'Rename tabs or move columns. The automation reads them.']]);
  sh.setTabColor(C.brass);
}
function peopleUpdatesTab_(sh) {
  canvas_(sh, 40, UPN);
  [110, 150, 120, 260, 280, 260, 220, 240, 180, 220, 80, 100].forEach((w, i) => sh.setColumnWidth(i + 1, w));
  header_(sh, ['NAME', 'TEAM', 'MEETING', 'PERSONAL UPDATE', 'WEEKLY GOALS', 'MONTHLY GOALS', 'FELL SHORT', 'BLOCKERS', 'COMPLIANCE', 'HEADLINE', 'DEEP DIVE?', 'UPDATED']);
  sh.getRange(2, 1, 39, UPN).setBackground(C.panel).setVerticalAlignment('top').setWrap(true)
    .setBorder(null, null, null, null, null, true, C.line, SpreadsheetApp.BorderStyle.SOLID);
  sh.getRange(2, 1, 39, 1).setFontWeight('bold');
  sh.getRange(2, UP.updated, 39, 1).setNumberFormat('ddd m/d h:mm am/pm');
  sh.setConditionalFormatRules([cf_(sh.getRange(2, UP.compliance, 39, 1), '=LEFT($I2,3)="YES"', C.bad, '#1c0806', true)]);
  sh.setTabColor(C.good);
}

/* ============================================================
 * 6. THE LIVE BOARD (web page)
 * ============================================================ */
function doGet() {
  const t = HtmlService.createTemplateFromFile('Board');
  t.logo = '';
  try { t.logo = Utilities.base64Encode(DriveApp.getFileById(CONFIG.LOGO_ID).getBlob().getBytes()); } catch (e) {}
  t.cfg = JSON.stringify({ main: CONFIG.MAIN_MEETING, checkIn: CONFIG.CHECK_IN, start: CONFIG.START_TIME,
    teams: TEAMS.map(t => ({ name: t.name, lead: t.lead })), answers: ANSWERS });
  return t.evaluate().setTitle('TGC Team Meeting').addMetaTag('viewport', 'width=device-width, initial-scale=1');
}
function getBoard(mode, date) {
  const ss = board_();
  const meeting = JSON.parse(PropertiesService.getScriptProperties().getProperty(`M_${mode}_${date}`) || '{}');
  return { meeting, people: people_(ss), updates: readPeople_(ss), asks: readAsks_(ss) };
}
function saveMeeting(mode, date, patch) {
  return withLock_(() => {
    const props = PropertiesService.getScriptProperties();
    const key = `M_${mode}_${date}`;
    const cur = JSON.parse(props.getProperty(key) || '{}');
    props.setProperty(key, JSON.stringify(merge_(cur, patch)));
    return true;
  });
}
function addAsk(d) { return withLock_(() => writeAsk_(board_().getSheetByName(TAB.ASKS), null, d)); }
function updateAsk(row, d) { return withLock_(() => { writeAsk_(board_().getSheetByName(TAB.ASKS), row, d); return true; }); }
function deleteAsk(row) {
  return withLock_(() => {
    const sh = board_().getSheetByName(TAB.ASKS);
    sh.getRange(row, 1, 1, NCOL).clearContent();
    [COL.urgent, COL.done, COL.later].forEach(c => sh.getRange(row, c).uncheck());
    return true;
  });
}

/* ============================================================
 * Helpers
 * ============================================================ */
function readPeople_(ss) {
  const sh = ss.getSheetByName(TAB.PEOPLE_UP);
  if (!sh || sh.getLastRow() < 2) return [];
  return sh.getRange(2, 1, sh.getLastRow() - 1, UPN).getValues().filter(r => r[0]).map(r => ({
    name: r[0], team: r[1], meeting: r[2], good: String(r[3] || ''), weekly: String(r[4] || ''), monthly: String(r[5] || ''),
    short: String(r[6] || ''), block: String(r[7] || ''), compliance: String(r[8] || ''), headline: String(r[9] || ''),
    deep: r[10], updated: iso_(r[11]) }));
}
function board_() { return SpreadsheetApp.openById(prop_('BOARD_ID')); }
function prop_(k) {
  const v = PropertiesService.getScriptProperties().getProperty(k);
  if (!v) throw new Error('Missing setting: ' + k);
  return v;
}
function withLock_(fn) {
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
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
function people_(ss) {
  try {
    return (ss || board_()).getRange(NAMES_RANGE).getValues().map(r => String(r[0]).trim()).filter(Boolean);
  } catch (e) { return PEOPLE.map(p => p[0]); }
}
function readAsks_(ss) {
  const sh = ss.getSheetByName(TAB.ASKS);
  const last = sh.getLastRow(); const out = [];
  if (last < 2) return out;
  sh.getRange(2, 1, last - 1, NCOL).getValues().forEach((r, i) => {
    if (!String(r[COL.ask - 1]).trim()) return;
    out.push({ row: i + 2, added: iso_(r[COL.added - 1]), team: r[COL.team - 1], askedBy: r[COL.askedBy - 1],
      ask: String(r[COL.ask - 1]), urgent: r[COL.urgent - 1] === true, answer: r[COL.answer - 1],
      owner: r[COL.owner - 1], due: iso_(r[COL.due - 1]), done: r[COL.done - 1] === true,
      later: r[COL.later - 1] === true, notes: r[COL.notes - 1], answeredOn: iso_(r[COL.answeredOn - 1]) });
  });
  return out;
}
function writeAsk_(sh, row, d, added) {
  if (!row) {
    const vals = sh.getRange(2, COL.ask, sh.getMaxRows() - 1, 1).getValues();
    const i = vals.findIndex(r => r[0] === '');
    if (i === -1) { sh.insertRowsAfter(sh.getMaxRows(), 50); row = sh.getMaxRows() - 49; }
    else row = i + 2;
    sh.getRange(row, COL.num).setValue(row - 1);
    sh.getRange(row, COL.added).setValue(added || new Date());
  }
  Object.keys(d).forEach(k => {
    const c = COL[k]; if (!c || k === 'num' || k === 'added') return;
    let v = d[k];
    if (k === 'due' || k === 'answeredOn') v = v ? new Date(v + 'T12:00:00') : '';
    if (k === 'urgent' || k === 'done' || k === 'later') v = !!v;
    sh.getRange(row, c).setValue(v == null ? '' : v);
  });
  return row;
}
function answers_(response) {
  const out = {};
  response.getItemResponses().forEach(ir => {
    const v = ir.getResponse();
    out[ir.getItem().getTitle()] = Array.isArray(v) ? v.join(', ') : v;
  });
  return out;
}
function lines_(s) { return String(s || '').split(/\n+/).map(x => x.replace(/^[\s\-•*\d.)]+/, '').trim()).filter(Boolean); }
function iso_(d) {
  if (!d) return '';
  const dt = d instanceof Date ? d : new Date(d);
  return isNaN(dt) ? '' : Utilities.formatDate(dt, Session.getScriptTimeZone(), 'yyyy-MM-dd');
}
function fmt_(d) {
  if (!d) return '';
  const dt = d instanceof Date ? d : new Date(String(d).length === 10 ? d + 'T12:00:00' : d);
  return isNaN(dt) ? String(d) : Utilities.formatDate(dt, Session.getScriptTimeZone(), 'EEE M/d');
}
function h_(t, color) {
  return `<div style="margin:18px 0 6px;padding:6px 10px;background:${C.room};color:${color || C.brass};font-size:12px;font-weight:bold;letter-spacing:1px">${esc_(t.toUpperCase())}</div>`;
}
function table_(head, rows) {
  if (!rows.length) return '<p style="color:#958f83;font-size:13px"><i>None</i></p>';
  const th = head.map(h => `<th style="background:#1c1b18;color:${C.brass};padding:6px;text-align:left;font-size:11px">${esc_(h)}</th>`).join('');
  const trs = rows.map(r => '<tr>' + r.map(c => `<td style="border-bottom:1px solid #e5e2da;padding:6px;vertical-align:top">${esc_(c)}</td>`).join('') + '</tr>').join('');
  return `<table style="border-collapse:collapse;font-family:Arial;font-size:13px;width:100%"><tr>${th}</tr>${trs}</table>`;
}
function esc_(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
}

