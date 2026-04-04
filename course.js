(function () {
  "use strict";

  var PROGRESS_KEY_LEGACY = "claude_course_progress_v1";
  var STATE_KEY = "claude_course_state_v2";

  var TOTAL_LESSONS_GLOBAL = 24;
  var TRACK_LEN = 8;
  var speechProgressInterval = null;

  var PROMPT_HEBREW_SUFFIX =
    "\n\nחשוב: כל מה שאתה כותב לי כאן בעברית בלבד (כולל קוד, הערות בתוך הקוד ושמות מקומיים).";

  var TRACKS = {
    beginner: {
      id: "beginner",
      label: "מסלול למתחילים",
      lessonIds: ["m1-l1", "m1-l2", "m1-l3", "m1-l4", "m2-l1", "m2-l2", "m3-l1", "m3-l2"],
    },
    advanced: {
      id: "advanced",
      label: "מסלול למתקדמים",
      lessonIds: ["m2-l3", "m2-l4", "m3-l3", "m3-l4", "m3-l5", "m3-l6", "m4-l1", "m4-l2"],
    },
    pro: {
      id: "pro",
      label: "מסלול למקצוענים",
      lessonIds: ["m4-l3", "m4-l4", "m5-l1", "m5-l2", "m5-l3", "m5-l4", "m6-l1", "m6-l2"],
    },
  };

  var COURSE = window.COURSE;
  if (!COURSE || !COURSE.modules) {
    console.error("course-data.js חסר או לא תקין: ציפיתי ל־window.COURSE.modules");
    return;
  }

  function defaultState() {
    return {
      trackId: null,
      currentLessonId: null,
      completedLessonIds: [],
      verifyByLesson: {},
    };
  }

  function loadState() {
    try {
      var raw = localStorage.getItem(STATE_KEY);
      if (raw) {
        var o = JSON.parse(raw);
        if (o && typeof o === "object") {
          o.completedLessonIds = Array.isArray(o.completedLessonIds) ? o.completedLessonIds : [];
          o.verifyByLesson = o.verifyByLesson && typeof o.verifyByLesson === "object" ? o.verifyByLesson : {};
          return o;
        }
      }
    } catch (e) {}
    try {
      var leg = localStorage.getItem(PROGRESS_KEY_LEGACY);
      if (leg) {
        var old = JSON.parse(leg);
        var st = defaultState();
        if (old && Array.isArray(old.completedLessonIds)) st.completedLessonIds = old.completedLessonIds;
        return st;
      }
    } catch (e2) {}
    return defaultState();
  }

  function saveState(state) {
    try {
      localStorage.setItem(STATE_KEY, JSON.stringify(state));
    } catch (e) {}
  }

  var state = loadState();
  var assistantChatHistory = [];

  function findLesson(lessonId) {
    for (var mi = 0; mi < COURSE.modules.length; mi++) {
      var mod = COURSE.modules[mi];
      for (var li = 0; li < mod.lessons.length; li++) {
        if (mod.lessons[li].id === lessonId) return { lesson: mod.lessons[li], module: mod };
      }
    }
    return null;
  }

  function getTrack() {
    if (!state.trackId || !TRACKS[state.trackId]) return null;
    return TRACKS[state.trackId];
  }

  function trackIndex(lessonId) {
    var tr = getTrack();
    if (!tr) return -1;
    return tr.lessonIds.indexOf(lessonId);
  }

  function isLessonUnlocked(lessonId) {
    var tr = getTrack();
    if (!tr) return false;
    var idx = tr.lessonIds.indexOf(lessonId);
    if (idx < 0) return false;
    if (idx === 0) return true;
    return state.completedLessonIds.indexOf(tr.lessonIds[idx - 1]) !== -1;
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function appendSuffix(text) {
    return String(text || "") + _promptSuffixForText(text);
  }

  function _promptSuffixForText(text) {
    var t = String(text || "");
    if (t.indexOf("בעברית בלבד") !== -1 && t.indexOf("הערות בתוך הקוד") !== -1) return "";
    return PROMPT_HEBREW_SUFFIX;
  }

  function copyPlain(text, toastEl) {
    var full = appendSuffix(text);
    function ok() {
      if (toastEl) {
        toastEl.textContent = "הועתק";
        setTimeout(function () {
          if (toastEl.textContent === "הועתק") toastEl.textContent = "";
        }, 2200);
      }
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(full).then(ok).catch(function () {
        fallbackCopy(full, ok);
      });
    } else fallbackCopy(full, ok);
  }

  function fallbackCopy(text, done) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      if (done) done();
    } catch (e) {}
    document.body.removeChild(ta);
  }

  function stopSpeech() {
    if (speechProgressInterval) {
      clearInterval(speechProgressInterval);
      speechProgressInterval = null;
    }
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    document.querySelectorAll(".course-audio-row").forEach(function (row) {
      row.classList.remove("is-playing");
    });
    document.querySelectorAll(".course-audio-progress-fill").forEach(function (fill) {
      fill.style.width = "0%";
    });
  }

  function speechEstimateSeconds(lesson) {
    var t = [
      lesson.title,
      lesson.goal,
      lesson.onScreen,
      lesson.youDo,
      lesson.outcome,
      lesson.task,
      lesson.pasteHint,
    ]
      .filter(Boolean)
      .join(" ");
    return Math.min(240, Math.max(25, Math.floor(t.length / 11)));
  }

  function startSpeechForLesson(lesson, audioRow) {
    stopSpeech();
    if (!window.speechSynthesis) return;
    var parts = [
      lesson.title,
      lesson.goal,
      lesson.onScreen,
      lesson.youDo,
      lesson.outcome,
      lesson.task,
    ].filter(Boolean);
    var text = parts.join(". ");
    if (!text) return;
    var u = new SpeechSynthesisUtterance(text);
    u.lang = "he-IL";
    u.rate = 0.98;
    audioRow.classList.add("is-playing");
    var fill = audioRow.querySelector(".course-audio-progress-fill");
    var timerEl = audioRow.querySelector(".course-audio-timer");
    var total = speechEstimateSeconds(lesson);
    var start = Date.now();
    speechProgressInterval = setInterval(function () {
      var elapsed = (Date.now() - start) / 1000;
      var p = Math.min(100, (elapsed / total) * 100);
      if (fill) fill.style.width = p + "%";
      if (timerEl) timerEl.textContent = formatTime(elapsed);
    }, 200);
    u.onend = function () {
      stopSpeech();
      if (fill) fill.style.width = "100%";
      if (timerEl) timerEl.textContent = formatTime(total);
    };
    u.onerror = function () {
      stopSpeech();
    };
    window.speechSynthesis.speak(u);
  }

  function formatTime(sec) {
    sec = Math.floor(sec);
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return m + ":" + (s < 10 ? "0" : "") + s;
  }

  function waveBarsHtml(n) {
    var out = "";
    for (var i = 0; i < n; i++) {
      var h = 18 + ((i * 7) % 45);
      out += '<span class="course-wave-bar" style="height:' + h + '%"></span>';
    }
    return out;
  }

  function createLessonAudioRow() {
    var wrap = document.createElement("div");
    wrap.className = "course-audio-row";
    wrap.innerHTML =
      '<div class="course-audio-wave-shell"><div class="course-waveform--full">' +
      waveBarsHtml(40) +
      '</div><div class="course-audio-progress-line"><div class="course-audio-progress-fill"></div></div>' +
      '<div class="course-audio-controls">' +
      '<button type="button" class="btn course-audio-listen" data-action="speak">הקראת השיעור</button>' +
      '<button type="button" class="btn course-audio-stop" data-action="stop-speak">עצור</button>' +
      '<span class="course-audio-timer">0:00</span>' +
      "</div></div>";
    return wrap;
  }

  function allVerifyChecked(lesson) {
    if (!lesson.verify || !lesson.verify.items || !lesson.verify.items.length) return true;
    var arr = getVerifyArray(lesson.id, lesson.verify.items.length);
    for (var i = 0; i < arr.length; i++) if (!arr[i]) return false;
    return true;
  }

  function getVerifyArray(lessonId, n) {
    if (!state.verifyByLesson[lessonId]) state.verifyByLesson[lessonId] = [];
    var arr = state.verifyByLesson[lessonId];
    if (arr.length !== n) {
      arr = [];
      for (var i = 0; i < n; i++) arr.push(false);
      state.verifyByLesson[lessonId] = arr;
    }
    return arr;
  }

  function countTrackDone() {
    var tr = getTrack();
    if (!tr) return 0;
    var c = 0;
    for (var i = 0; i < tr.lessonIds.length; i++) {
      if (state.completedLessonIds.indexOf(tr.lessonIds[i]) !== -1) c++;
    }
    return c;
  }

  function updateProgressUi() {
    var g = state.completedLessonIds.length;
    var pctG = Math.round((g / TOTAL_LESSONS_GLOBAL) * 100);
    var barG = document.getElementById("course-progress-bar-global-only");
    var lblG = document.getElementById("course-progress-label-global-only");
    if (barG) barG.style.width = pctG + "%";
    if (lblG) lblG.textContent = g + " מתוך " + TOTAL_LESSONS_GLOBAL + " שיעורים (" + pctG + "%)";

    var tr = getTrack();
    var barT = document.getElementById("course-progress-bar-track");
    var lblT = document.getElementById("course-progress-label-track");
    var lblGlob = document.getElementById("course-progress-label-global");
    if (tr) {
      var td = countTrackDone();
      var pctT = Math.round((td / TRACK_LEN) * 100);
      if (barT) barT.style.width = pctT + "%";
      if (lblT) lblT.textContent = td + " מתוך " + TRACK_LEN + " שיעורים במסלול (" + pctT + "%)";
    }
    if (lblGlob) lblGlob.textContent = "בקורס המלא: " + g + " מתוך " + TOTAL_LESSONS_GLOBAL + " שיעורים";
  }

  function renderBonuses() {
    var root = document.getElementById("bonus-list");
    if (!root || !COURSE.bonuses) return;
    var b = COURSE.bonuses;
    var html =
      '<h2 class="visually-hidden">' +
      esc(b.title || "בונוסים") +
      "</h2>";
    for (var i = 0; i < (b.items || []).length; i++) {
      var it = b.items[i];
      html +=
        '<div class="course-bonus-card">' +
        "<h3>" +
        esc(it.title) +
        '</h3><pre class="course-bonus-pre">' +
        esc(it.body) +
        '</pre><button type="button" class="btn btn-secondary btn-copy" data-bonus-index="' +
        i +
        '">העתקה</button></div>';
    }
    root.innerHTML = html;
    root.querySelectorAll("[data-bonus-index]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var ix = parseInt(btn.getAttribute("data-bonus-index"), 10);
        var item = COURSE.bonuses.items[ix];
        if (item) copyPlain(item.body);
      });
    });
  }

  function renderPlaylist() {
    var aside = document.getElementById("course-playlist");
    if (!aside) return;
    var tr = getTrack();
    if (!tr) return;
    var html = "";
    html += '<div class="course-playlist-banner" role="group" aria-label="פלייליסט">';
    html += '<p class="course-playlist-banner-kicker">פלייליסט</p>';
    html += '<p class="course-playlist-banner-row">';
    html += '<span class="course-playlist-banner-dot" aria-hidden="true">·</span>';
    html += '<span class="course-playlist-banner-track">' + esc(tr.label) + "</span>";
    html += "</p></div>";
    html += '<ul class="course-playlist-list">';
    for (var i = 0; i < tr.lessonIds.length; i++) {
      var lid = tr.lessonIds[i];
      var found = findLesson(lid);
      var title = found ? found.lesson.title : lid;
      var unlocked = isLessonUnlocked(lid);
      var done = state.completedLessonIds.indexOf(lid) !== -1;
      var current = state.currentLessonId === lid;
      var cls = "course-pl-item";
      if (current) cls += " is-current";
      if (done) cls += " is-done";
      if (!unlocked) cls += " is-locked";
      html += '<li class="' + cls + '">';
      if (unlocked) {
        html +=
          '<button type="button" class="course-pl-btn" data-lesson-id="' +
          esc(lid) +
          '">' +
          esc(title) +
          "</button>";
      } else {
        html += '<span class="course-pl-locked">' + esc(title) + " (נעול)</span>";
      }
      html += "</li>";
    }
    html += "</ul>";
    html +=
      '<p class="course-playlist-foot">סימנו אימותים והמשיכו עם <strong>המשך לשיעור הבא</strong> לפתיחת השיעור הבא.</p>';
    aside.innerHTML = html;
    aside.querySelectorAll(".course-pl-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-lesson-id");
        if (id && isLessonUnlocked(id)) {
          state.currentLessonId = id;
          saveState(state);
          renderPlaylist();
          renderLesson();
        }
      });
    });
  }

  function renderLesson() {
    var inner = document.getElementById("course-lesson-inner");
    if (!inner) return;
    stopSpeech();
    var tr = getTrack();
    if (!tr || !state.currentLessonId) {
      inner.innerHTML = "";
      refreshCourseAssistantSummary();
      return;
    }
    var found = findLesson(state.currentLessonId);
    if (!found) {
      inner.innerHTML = "<p>שיעור לא נמצא.</p>";
      refreshCourseAssistantSummary();
      return;
    }
    var lesson = found.lesson;
    var ix = trackIndex(lesson.id);

    var html = '<article class="course-lesson-article-v2">';
    if (ix >= 0) {
      html +=
        '<p class="course-lesson-step-kicker">שיעור ' +
        (ix + 1) +
        " מתוך " +
        TRACK_LEN +
        "</p>";
    }
    html += '<h1 class="course-lesson-h1">' + esc(lesson.title) + "</h1>";
    if (lesson.durationMin) {
      html +=
        '<p class="course-lesson-duration"><span class="course-time-badge">זמן משוער</span> ' +
        esc(String(lesson.durationMin)) +
        " דק׳</p>";
    }

    html += '<div class="course-lesson-grid course-lesson-grid-v2">';
    if (lesson.goal)
      html +=
        '<section class="course-block"><h2>מטרה</h2><p>' + esc(lesson.goal) + "</p></section>";
    if (lesson.onScreen)
      html +=
        '<section class="course-block"><h2>במסך</h2><p>' + esc(lesson.onScreen) + "</p></section>";
    if (lesson.youDo)
      html +=
        '<section class="course-block"><h2>מה עושים</h2><p>' + esc(lesson.youDo) + "</p></section>";
    if (lesson.outcome)
      html +=
        '<section class="course-block course-block-accent"><h2>תוצאה</h2><p>' +
        esc(lesson.outcome) +
        "</p></section>";
    if (lesson.task)
      html +=
        '<section class="course-block course-block-task"><h2>משימה</h2><p>' +
        esc(lesson.task) +
        "</p></section>";
    html += "</div>";

    if (lesson.taskCompare) {
      var tc = lesson.taskCompare;
      html += '<div class="course-task-compare">';
      html += '<h3 class="course-task-compare-title">' + esc(tc.title || "לפני ואחרי") + "</h3>";
      html += '<div class="course-task-compare-grid">';
      html += '<figure class="course-task-compare-fig">';
      html += '<figcaption class="course-task-compare-cap">' + esc(tc.captionBefore || "") + "</figcaption>";
      html += '<div class="course-task-compare-imgwrap">';
      html += '<img src="' + esc(tc.before) + '" alt="' + esc(tc.altBefore || "") + '" loading="lazy" />';
      html += "</div></figure>";
      html += '<figure class="course-task-compare-fig">';
      html += '<figcaption class="course-task-compare-cap">' + esc(tc.captionAfter || "") + "</figcaption>";
      html += '<div class="course-task-compare-imgwrap">';
      html += '<img src="' + esc(tc.after) + '" alt="' + esc(tc.altAfter || "") + '" loading="lazy" />';
      html += "</div></figure>";
      html += "</div></div>";
    }

    inner.innerHTML = html;
    var article = inner.querySelector(".course-lesson-article-v2");

    if (lesson.copyPrompt || lesson.pasteHint || (lesson.copyPrompts && lesson.copyPrompts.length)) {
      var kit = document.createElement("div");
      kit.className = "course-prompt-kit";
      var kitHtml = "";
      if (lesson.pasteHint) kitHtml += '<p class="course-paste-hint">' + esc(lesson.pasteHint) + "</p>";
      if (lesson.copyPrompt) {
        kitHtml += '<div class="course-copy-row">';
        kitHtml +=
          '<button type="button" class="btn course-btn-copy" data-copy-once="1">העתקת פרומפט</button>';
        kitHtml += '<span class="course-copy-toast" aria-live="polite"></span>';
        kitHtml += "</div>";
      }
      if (lesson.copyPrompts) {
        for (var ci = 0; ci < lesson.copyPrompts.length; ci++) {
          var cp = lesson.copyPrompts[ci];
          kitHtml += '<div class="course-copy-row">';
          kitHtml +=
            '<button type="button" class="btn course-btn-copy" data-copy-idx="' +
            ci +
            '">' +
            esc(cp.label || "העתקה") +
            "</button>";
          kitHtml += '<span class="course-copy-toast" aria-live="polite"></span>';
          kitHtml += "</div>";
        }
      }
      kit.innerHTML = kitHtml;
      article.appendChild(kit);

      if (lesson.copyPrompt) {
        var row = kit.querySelector("[data-copy-once]");
        var toast = row.parentNode.querySelector(".course-copy-toast");
        row.addEventListener("click", function () {
          copyPlain(lesson.copyPrompt, toast);
        });
      }
      kit.querySelectorAll("[data-copy-idx]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var ix = parseInt(btn.getAttribute("data-copy-idx"), 10);
          var row = btn.closest(".course-copy-row");
          var toast = row ? row.querySelector(".course-copy-toast") : null;
          var cps = lesson.copyPrompts[ix];
          if (cps && cps.text) copyPlain(cps.text, toast);
        });
      });
    }

    if (lesson.resources && lesson.resources.length) {
      var res = document.createElement("div");
      res.className = "course-lesson-resources";
      res.innerHTML =
        '<h3 class="course-lesson-resources-title">קישורים</h3><ul class="course-lesson-resources-list"></ul>';
      var ul = res.querySelector("ul");
      for (var ri = 0; ri < lesson.resources.length; ri++) {
        var r = lesson.resources[ri];
        var li = document.createElement("li");
        li.className = "course-lesson-resources-item";
        li.innerHTML =
          '<a class="course-lesson-external-link" href="' +
          esc(r.url) +
          '" target="_blank" rel="noopener noreferrer">' +
          esc(r.label) +
          "</a>";
        if (r.note) {
          var note = document.createElement("span");
          note.className = "course-lesson-resources-note";
          note.textContent = " · " + r.note;
          li.appendChild(note);
        }
        ul.appendChild(li);
      }
      article.appendChild(res);
    }

    if (lesson.verify && lesson.verify.items && lesson.verify.items.length) {
      var ver = document.createElement("div");
      ver.className = "course-lesson-verify";
      var vchecks = getVerifyArray(lesson.id, lesson.verify.items.length);
      var vh =
        '<h3 class="course-lesson-verify-title">' +
        esc(lesson.verify.title || "אימות") +
        '</h3><ul class="course-lesson-verify-list">';
      for (var vi = 0; vi < lesson.verify.items.length; vi++) {
        vh +=
          '<li class="course-lesson-verify-item"><label class="course-verify-label">';
        vh +=
          '<input type="checkbox" class="course-verify-cb" data-vi="' +
          vi +
          '" ' +
          (vchecks[vi] ? "checked" : "") +
          " />";
        vh += "<span>" + esc(lesson.verify.items[vi]) + "</span></label></li>";
      }
      vh += "</ul>";
      ver.innerHTML = vh;
      article.appendChild(ver);
      ver.querySelectorAll(".course-verify-cb").forEach(function (cb) {
        cb.addEventListener("change", function () {
          var i = parseInt(cb.getAttribute("data-vi"), 10);
          var arr = getVerifyArray(lesson.id, lesson.verify.items.length);
          arr[i] = cb.checked;
          saveState(state);
          updateContinueGate(lesson);
        });
      });
    }

    var audioRow = createLessonAudioRow();
    article.appendChild(audioRow);
    audioRow.querySelector("[data-action=speak]").addEventListener("click", function () {
      startSpeechForLesson(lesson, audioRow);
    });
    audioRow.querySelector("[data-action=stop-speak]").addEventListener("click", stopSpeech);

    var cont = document.createElement("div");
    cont.className = "course-continue-row";
    var gated = !allVerifyChecked(lesson);
    var hasVerify = !!(lesson.verify && lesson.verify.items && lesson.verify.items.length);
    cont.innerHTML =
      (hasVerify
        ? '<p class="course-continue-note">למעבר הלאה סמנו את כל סעיפי האימות בבלוק למעלה.</p>'
        : '<p class="course-continue-note">לחצו המשך כשסיימתם את המשימה בשיעור.</p>') +
      '<button type="button" class="btn btn-primary btn-continue' +
      (gated ? " is-gated" : "") +
      '" data-action="continue"' +
      (gated ? ' disabled aria-disabled="true"' : "") +
      ">המשך לשיעור הבא</button>" +
      (gated && hasVerify
        ? '<p class="course-continue-gate-msg">נא לסמן את כל הסעיפים כדי להמשיך.</p>'
        : "");
    article.appendChild(cont);

    cont.querySelector("[data-action=continue]").addEventListener("click", function () {
      if (!allVerifyChecked(lesson)) return;
      advanceLesson();
    });

    updateContinueGate(lesson);
    updateProgressUi();
    refreshCourseAssistantSummary();
  }

  function updateContinueGate(lesson) {
    var btn = document.querySelector(".btn-continue[data-action=continue]");
    if (!btn || !lesson.verify || !lesson.verify.items || !lesson.verify.items.length) return;
    var ok = allVerifyChecked(lesson);
    btn.disabled = !ok;
    btn.setAttribute("aria-disabled", ok ? "false" : "true");
    btn.classList.toggle("is-gated", !ok);
    var msg = document.querySelector(".course-continue-gate-msg");
    if (msg) msg.style.display = ok ? "none" : "";
  }

  function advanceLesson() {
    var tr = getTrack();
    if (!tr || !state.currentLessonId) return;
    var lid = state.currentLessonId;
    if (state.completedLessonIds.indexOf(lid) === -1) state.completedLessonIds.push(lid);
    saveState(state);
    var idx = tr.lessonIds.indexOf(lid);
    renderPlaylist();
    updateProgressUi();
    if (idx < 0 || idx >= tr.lessonIds.length - 1) {
      showTrackComplete();
      return;
    }
    state.currentLessonId = tr.lessonIds[idx + 1];
    saveState(state);
    renderPlaylist();
    renderLesson();
  }

  function showTrackComplete() {
    var inner = document.getElementById("course-lesson-inner");
    if (!inner) return;
    stopSpeech();
    inner.innerHTML =
      '<div class="course-done-card glass-card">' +
      '<h2 class="course-done-title">סיימתם את המסלול 🎉</h2>' +
      "<p>אפשר לעבור מסлול או לחזור לבחירת הרמה.</p>" +
      '<button type="button" class="btn btn-primary" id="course-done-next">בחירת מסלול / רמה</button></div>';
    document.getElementById("course-done-next").addEventListener("click", showEntry);
  }

  function showClassroom() {
    var entry = document.getElementById("course-entry");
    var room = document.getElementById("course-classroom");
    var lbl = document.getElementById("course-track-label");
    if (entry) entry.hidden = true;
    if (room) room.hidden = false;
    if (lbl) lbl.textContent = "";
    renderPlaylist();
    renderLesson();
    updateProgressUi();
  }

  function showEntry() {
    stopSpeech();
    var entry = document.getElementById("course-entry");
    var room = document.getElementById("course-classroom");
    state.trackId = null;
    state.currentLessonId = null;
    saveState(state);
    if (entry) entry.hidden = false;
    if (room) room.hidden = true;
    updateProgressUi();
    refreshCourseAssistantSummary();
  }

  function pickTrack(trackId) {
    if (!TRACKS[trackId]) return;
    state.trackId = trackId;
    state.currentLessonId = TRACKS[trackId].lessonIds[0];
    saveState(state);
    showClassroom();
  }

  function buildCourseSyllabusForTutor() {
    var lines = [];
    lines.push(COURSE.title || "קורס");
    if (COURSE.subtitle) lines.push("תקציר: " + COURSE.subtitle);
    for (var i = 0; i < COURSE.modules.length; i++) {
      var m = COURSE.modules[i];
      var head = "יחידה: " + m.title;
      if (m.summary) head += " · " + m.summary;
      lines.push(head);
      for (var j = 0; j < m.lessons.length; j++) {
        lines.push("  · " + m.lessons[j].title + " [" + m.lessons[j].id + "]");
      }
    }
    return lines.join("\n");
  }

  function buildCurrentLessonContextBlock() {
    if (!state.currentLessonId) {
      return "התלמיד/ה במסך בחירת מסלול · עדיין לא נבחר שיעור ספציפי בלוח.";
    }
    var f = findLesson(state.currentLessonId);
    if (!f) return "לא נמצא נתון שיעור.";
    var L = f.lesson;
    var parts = ["שם השיעור: " + L.title + " (" + L.id + ")."];
    if (L.goal) parts.push("מטרה: " + L.goal);
    if (L.durationMin) parts.push("זמן משוער בקורס: כ־" + L.durationMin + " דקות.");
    return parts.join("\n");
  }

  function buildTutorSystemPrompt() {
    var lines = [
      "אתה עוזר הוראה הקשור אך ורק לקורס הדיגיטלי הבא. ענה תמיד בעברית, בצורה ברורה ומעשית.",
      "",
      "כללי התנהגות חובה:",
      "• ענה רק על נושאים שקשורים ישירות לתוכן הקורס: בניית דף או אתר בסיסי בעזרת קלוד (claude.ai), פרומפטים, קבצים על המחשב, HTML ו־CSS בסיסי, תצוגה בדפדפן, דף נחיתה, תיקונים ושיפורים, התאמה למובייל, העלאה לאינטרנט, אחסון, דומיין ו־DNS בהקשר של הקורס, ושיטת עבודה שהקורס מלמד.",
      "• אם השאלה אינה קשורה לקורס (רפואה, משפט, השקעות, פוליטיקה, נושאים אישיים, שיעורי בית למקצוע אחר וכו') · השב רק משפט אחד בעברית שאינך יכול לעזור בנושאים מחוץ לקורס, ובקש רק שאלה על תוכן הקורס.",
      "• אל תמציא מחירים או תנאי שירות · כשמדובר במחירים או במגבלות ציין לבדוק בעמוד הרשמי של אנתרופיק או של ספק האחסון.",
      "• אם חסר מידע טכני (שגיאה, קובץ, צילום מסך) · שאל את התלמיד/ה במפורש מה לבדוק, במקום לנחש.",
      "",
      "מפת תוכן הקורס (להקשר בלבד):",
      buildCourseSyllabusForTutor(),
      "",
      "מיקום נוכחי בממשק הלמידה:",
      buildCurrentLessonContextBlock(),
    ];
    if (state.trackId && TRACKS[state.trackId]) {
      lines.push("מסלול שנבחר בממשק: " + TRACKS[state.trackId].label + ".");
    }
    return lines.join("\n") + PROMPT_HEBREW_SUFFIX;
  }

  function getChatApiUrl() {
    if (typeof window !== "undefined" && window.COURSE_CHAT_API) return window.COURSE_CHAT_API;
    return "/api/course-chat";
  }

  function formatChatApiError(data, httpStatus) {
    var code = data && data.error;
    var hintLines = [];
    if (code === "server_missing_key") {
      hintLines.push(
        "הסבר: חסר משתנה סביבה ANTHROPIC_API_KEY בפרויקט (Vercel וכו')."
      );
    } else if (code === "upstream_error") {
      hintLines.push(
        "הסבר: Anthropic החזירה שגיאה · השדה detail ב־JSON למטה הוא ההודעה המדויקת מהם."
      );
    } else if (code === "bad_request") {
      hintLines.push("הסבר: הבקשה לא עברה ולידציה בשרת (חסר system או messages).");
    } else if (code === "bad_response") {
      hintLines.push("הסבר: גוף התשובה מהשרת אינו JSON תקין.");
    } else if (code === "proxy_failed") {
      hintLines.push("הסבר: הפרוקסי נכשל בקריאה ל־Anthropic.");
    } else if (code === "method_not_allowed") {
      hintLines.push("הסבר: נשלחה שיטת HTTP שאינה POST.");
    }
    var statusNum =
      httpStatus != null && httpStatus !== "" ? Number(httpStatus) : 0;
    var jsonBlock = "";
    try {
      jsonBlock =
        data && typeof data === "object"
          ? JSON.stringify(data, null, 2)
          : data != null
            ? String(data)
            : "(אין גוף JSON)";
    } catch (e) {
      jsonBlock = String(data);
    }
    var parts = [];
    if (hintLines.length) parts.push(hintLines.join("\n"));
    parts.push("HTTP: " + (statusNum || "?"));
    parts.push("JSON מהשרת:");
    parts.push(jsonBlock);
    return parts.join("\n\n");
  }

  function renderAssistantMessages() {
    var box = document.getElementById("course-assistant-messages");
    if (!box) return;
    box.innerHTML = "";
    if (!assistantChatHistory.length) {
      var empty = document.createElement("p");
      empty.className = "course-assistant-empty";
      empty.textContent =
        "שאלו כאן על תוכן הקורס בלבד. השיחה שמורה בדפדפן בלבד עד שמנקים או מרעננים.";
      box.appendChild(empty);
    } else {
      for (var i = 0; i < assistantChatHistory.length; i++) {
        var m = assistantChatHistory[i];
        var row = document.createElement("div");
        row.className =
          "course-assistant-msg " + (m.role === "user" ? "is-user" : "is-assistant");
        var meta = document.createElement("span");
        meta.className = "course-assistant-msg-role";
        meta.textContent = m.role === "user" ? "אתם" : "עוזר הקורס";
        var body = document.createElement("div");
        body.className = "course-assistant-msg-text";
        body.textContent = m.content;
        row.appendChild(meta);
        row.appendChild(body);
        box.appendChild(row);
      }
    }
    box.scrollTop = box.scrollHeight;
  }

  function refreshCourseAssistantSummary() {
    var el = document.getElementById("course-assistant-context");
    if (!el) return;
    if (!state.currentLessonId) {
      el.textContent =
        "מיקום נוכחי: מסך הבית של הקורס (בחירת מסלול). אחרי שתיכנסו לשיעור יוצג כאן שם השיעור.";
      return;
    }
    var tr = getTrack();
    var f = findLesson(state.currentLessonId);
    if (!f) {
      el.textContent = "";
      return;
    }
    var parts = [];
    if (tr) parts.push(tr.label);
    parts.push(f.lesson.title);
    el.textContent = "מיקום נוכחי: " + parts.join(" · ");
  }

  function initCourseAssistant() {
    var root = document.getElementById("course-assistant");
    var fab = document.getElementById("course-assistant-fab");
    var input = document.getElementById("course-assistant-chat-input");
    var sendBtn = document.getElementById("course-assistant-send");
    var clearBtn = document.getElementById("course-assistant-clear-chat");
    var errEl = document.getElementById("course-assistant-error");
    if (!root || !fab) return;

    renderAssistantMessages();

    function openAssistant() {
      root.classList.add("is-open");
      root.setAttribute("aria-hidden", "false");
      fab.setAttribute("aria-expanded", "true");
      refreshCourseAssistantSummary();
      renderAssistantMessages();
      if (errEl) errEl.textContent = "";
      try {
        if (input) input.focus();
      } catch (e) {}
    }

    function closeAssistant() {
      root.classList.remove("is-open");
      root.setAttribute("aria-hidden", "true");
      fab.setAttribute("aria-expanded", "false");
      if (errEl) errEl.textContent = "";
    }

    function trimHistory(h) {
      var max = 24;
      if (h.length <= max) return h;
      return h.slice(h.length - max);
    }

    function sendAssistantChat() {
      if (!input || !sendBtn) return;
      var text = (input.value || "").trim();
      if (!text || sendBtn.disabled) return;
      if (errEl) errEl.textContent = "";

      assistantChatHistory = trimHistory(assistantChatHistory);
      assistantChatHistory.push({ role: "user", content: text });
      input.value = "";
      renderAssistantMessages();

      var system = buildTutorSystemPrompt();
      var payload = assistantChatHistory.map(function (m) {
        return { role: m.role, content: m.content };
      });

      sendBtn.disabled = true;
      var prevLabel = sendBtn.textContent;
      sendBtn.textContent = "שולח…";

      fetch(getChatApiUrl(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: system,
          messages: payload,
        }),
      })
        .then(function (r) {
          return r.text().then(function (text) {
            var data = null;
            try {
              data = text ? JSON.parse(text) : null;
            } catch (e) {
              var raw =
                text != null && String(text).length > 20000
                  ? String(text).slice(0, 20000) + "\n… (נחתך)"
                  : String(text || "");
              data = {
                ok: false,
                error: "bad_response",
                detail: raw,
              };
            }
            return { r: r, data: data };
          });
        })
        .then(function (pair) {
          var r = pair.r;
          var data = pair.data;
          if (!r.ok || !data || !data.ok) {
            assistantChatHistory.pop();
            renderAssistantMessages();
            if (errEl) errEl.textContent = formatChatApiError(data, r.status);
            return;
          }
          assistantChatHistory.push({
            role: "assistant",
            content:
              data.text != null && String(data.text).trim() !== ""
                ? String(data.text)
                : "(התקבלה תשובה ריקה מהמודל · נסו לנסח שוב את השאלה.)",
          });
          assistantChatHistory = trimHistory(assistantChatHistory);
          renderAssistantMessages();
        })
        .catch(function () {
          assistantChatHistory.pop();
          renderAssistantMessages();
          if (errEl) errEl.textContent = "אין חיבור לשרת או שהבקשה נחסמה. אם פותחים קבצים מקומית (file://) צריך אחסון עם API.";
        })
        .then(function () {
          sendBtn.disabled = false;
          sendBtn.textContent = prevLabel;
        });
    }

    fab.addEventListener("click", function () {
      if (root.classList.contains("is-open")) closeAssistant();
      else openAssistant();
    });
    var bannerOpen = document.getElementById("course-assistant-open-banner");
    if (bannerOpen) {
      bannerOpen.addEventListener("click", function () {
        openAssistant();
      });
    }
    if (sendBtn) sendBtn.addEventListener("click", sendAssistantChat);
    if (clearBtn)
      clearBtn.addEventListener("click", function () {
        assistantChatHistory = [];
        renderAssistantMessages();
        if (errEl) errEl.textContent = "";
      });
    if (input) {
      input.addEventListener("keydown", function (e) {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          sendAssistantChat();
        }
      });
    }
    root.querySelectorAll("[data-close-assistant]").forEach(function (el) {
      el.addEventListener("click", closeAssistant);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && root.classList.contains("is-open")) closeAssistant();
    });
  }

  function init() {
    renderBonuses();
    var brand = document.getElementById("course-brand-title");
    if (brand && COURSE.title) brand.textContent = COURSE.title;

    document.querySelectorAll(".course-level-card[data-track]").forEach(function (card) {
      card.addEventListener("click", function () {
        pickTrack(card.getAttribute("data-track"));
      });
    });

    var back = document.getElementById("course-back-levels");
    if (back) back.addEventListener("click", showEntry);

    var reset = document.getElementById("course-btn-reset-progress");
    if (reset)
      reset.addEventListener("click", function () {
        if (!confirm("לאפס את כל ההתקדמות בדפדפן הזה?")) return;
        try {
          localStorage.removeItem(STATE_KEY);
          localStorage.removeItem(PROGRESS_KEY_LEGACY);
        } catch (e) {}
        state = defaultState();
        saveState(state);
        stopSpeech();
        var entry = document.getElementById("course-entry");
        var room = document.getElementById("course-classroom");
        if (entry) entry.hidden = false;
        if (room) room.hidden = true;
        renderPlaylist();
        var inner = document.getElementById("course-lesson-inner");
        if (inner) inner.innerHTML = "";
        updateProgressUi();
        refreshCourseAssistantSummary();
      });

    if (state.trackId && TRACKS[state.trackId] && state.currentLessonId) {
      if (!isLessonUnlocked(state.currentLessonId)) {
        state.currentLessonId = TRACKS[state.trackId].lessonIds[0];
        saveState(state);
      }
      showClassroom();
    } else {
      updateProgressUi();
    }

    initCourseAssistant();
    refreshCourseAssistantSummary();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else init();
})();
