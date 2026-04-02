(function () {
  "use strict";

  var pack = window.LEARN_TASKS_DATA;
  if (!pack || !pack.phases || !pack.phases.length) return;

  var root = document.getElementById("learn-tasks-root");
  if (!root) return;

  var noteEl = document.getElementById("learn-pricing-note");

  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function render() {
    if (noteEl && pack.pricingNote) {
      noteEl.innerHTML =
        '<p class="learn-pricing-note-text">' + escapeHtml(pack.pricingNote) + "</p>" +
        '<p class="learn-pricing-note-links"><a class="course-inline-link" href="https://www.anthropic.com/pricing" target="_blank" rel="noopener noreferrer">תמחור Anthropic (רשמי)</a></p>';
    }

    var html = "";
    var stepNum = 0;

    pack.phases.forEach(function (phase) {
      html += '<section class="learn-task-module glass-card" id="phase-' + escapeHtml(phase.id) + '">';
      html += '<h2 class="learn-module-title">' + escapeHtml(phase.title) + "</h2>";
      html += '<div class="learn-task-grid">';

      phase.steps.forEach(function (task) {
        stepNum += 1;
        html += '<article class="learn-task-card" id="step-' + stepNum + '">';
        html +=
          '<div class="learn-task-card-head"><span class="learn-step-num" aria-hidden="true">' +
          stepNum +
          '</span><h3 class="learn-task-card-title">' +
          escapeHtml(task.title) +
          "</h3></div>";
        html += '<div class="learn-task-block"><h4>הסבר</h4><p>' + escapeHtml(task.explain) + "</p></div>";
        html +=
          '<div class="learn-task-block"><h4>דוגמה / מה לבקש</h4><p class="learn-task-mono">' +
          escapeHtml(task.example) +
          "</p></div>";
        html += '<details class="learn-task-details">';
        html += '<summary class="learn-task-summary">פתרון מוצע (לחצו רק אחרי שניסיתם)</summary>';
        html +=
          '<div class="learn-task-solution"><p>' +
          escapeHtml(task.solution).replace(/\n/g, "<br />") +
          "</p></div>";
        html += "</details>";
        html += '<div class="learn-task-block learn-task-self"><h4>בדיקה עצמית</h4><ul>';
        task.selfCheck.forEach(function (line) {
          html += "<li>" + escapeHtml(line) + "</li>";
        });
        html += "</ul></div>";
        html += "</article>";
      });

      html += "</div></section>";
    });

    root.innerHTML = html;
  }

  render();
})();
