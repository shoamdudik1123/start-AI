(function () {
  "use strict";

  var PROGRESS_KEY_LEGACY = "claude_course_progress_v1";
  var STATE_KEY = "claude_course_state_v2";
  /** לאיפוס התקדמות: פתחו course.html?reset-progress=1 (או ?reset=1) ואז רענון ללא הפרמטר. */

  var TOTAL_LESSONS_GLOBAL = 24;
  var TRACK_LEN = 8;
  var speechProgressInterval = null;

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

  var COURSE = {
    title: "קוד קלוד למתחילים",
    subtitle: "בונים בפועל · פרומפטים · דף נחיתה · תיקונים ומובייל",
    modules: [
      {
        id: "m1",
        title: "מודול 1 — מפת דרך וסט־אפ פרקטי",
        summary: "תכל'ס: מנוי Claude (בסיסי ~20$ לחודש מספיק לרוב), תיקייה וקבצים על המחשב — הכול דרך claude.ai ללא עורך מתקדם חובה.",
        lessons: [
          {
            id: "m1-l1",
            title: "מה נלמד בקורס (פתיחה קצרה)",
            durationMin: 6,
            goal: "לדעת בדיוק לאן המסלול למתחילים לוקח: מנוי Claude בדפדפן ועד דף שעובד — קוד מ-Claude, שמירה לקבצים, פתיחה בדפדפן.",
            onScreen: "שמונה צעדים: Claude (claude.ai) → תיקייה על המחשב → index.html → תצוגה בדפדפן → איך לכתוב לצ'אט → פרומפטים → זרימה (טיוטה מכלי אחר ואז קלוד מסיים קוד) → שלד מלא לדף.",
            youDo: "כתבו משפט אחד: לאיזה אתר/עסק תרצו דף נחיתה (אפילו טיוטה).",
            outcome: "יש לכם כיוון קונקרטי לשאר השיעורים — לא ”קורס כללי“.",
            task: "שמרו את המשפט בפתק; נשתמש בו בשיעור עם הזרימה דו-שלבית (בינה אחרת + קלוד).",
            pasteHint:
              "👉 עכשיו: רשמו משפט אחד על דף הנחיתה (אפילו במחברות או בקובץ טקסט) — זה מספיק לשלב הזה.",
            verify: {
              title: "לפני ”המשך“ — האם ביצעתם?",
              items: [
                "יש לי משפט אחד ברור על האתר/העסק שאליו הדף אמור לשרת",
                "שמרתי אותו במקום שאמצא בשיעור הבא (פתק / קובץ / הערה בטלפון)",
              ],
            },
          },
          {
            id: "m1-l2",
            title: "חשבון Claude ומנוי — מתחילים כאן",
            durationMin: 12,
            goal: "חשבון פעיל ב-Claude (claude.ai) + הבנה שמנוי בסיסי/Pro (בערך 20 דולר לחודש) מספיק לרוב לבניית אתר בשיעורים האלה.",
            onScreen: "נרשמים, בוחרים תוכנית, נכנסים לצ'אט בדפדפן. אין צורך בהתקנת עורך מיוחד — רק דפדפן ואז בשיעורים הבאים תיקייה וקובץ טקסט.",
            youDo: "1) כניסה ל-claude.ai והרשמה/התחברות. 2) הצטרפות לתוכנית בתשלום אם החינמי לא מספיק (בדקו את המחיר הנוכחי בעמוד התוכניות). 3) פתיחת שיחה חדשה וודאו שאתם רואים את חלון הצ'אט.",
            outcome: "יש לכם גישה ל-Claude בדפדפן עם מספיק שימוש לעבודה על הפרויקט.",
            task: "צילום מסך אחד: claude.ai עם צ'אט פתוח (אפשר לטשטש פרטים אישיים).",
            pasteHint:
              "👉 עכשיו: נכנסים ל-Claude, בודקים שמנוי/מגבלות מתאימים לכם — אז מסמנים אימות.",
            verify: {
              title: "אימות — האם הצליח?",
              items: [
                "אני מחובר/ת ל-claude.ai ורואה צ'אט שעובד",
                "ידעתי/י איזו תוכנית יש לי (חינמי/משלם) וזה מספיק לי להתחיל את השיעורים",
                "אין לי חובה להתקין שום עורך — רק דפדפן + בשלב הבא קובץ על המחשב",
              ],
            },
            resources: [
              {
                label: "Claude — אתר וצ'אט",
                url: "https://claude.ai/",
                note: "כל העבודה עם קלוד כאן (מנוי בסדר גודל ~20$ לחודש בדרך כלל מספיק)",
              },
              {
                label: "תוכניות ומחירים — Anthropic",
                url: "https://www.anthropic.com/pricing",
                note: "בדקו את המחיר המעודכן לפני רכישה",
              },
            ],
          },
          {
            id: "m1-l3",
            title: "תיקיית פרויקט וקובץ ראשון — תצוגה בדפדפן",
            durationMin: 14,
            goal: "תיקייה על המחשב, `index.html`, פתיחה בדפדפן או Live Server — כדי שכל קוד יהיה ניתן לראייה מיידית.",
            onScreen: "במחשב: תיקייה חדשה, קובץ index.html שנפתח בכל עורך טקסט (נוטפד, VS Code חינמי וכו'), שמירה, גרירה לחלון דפדפן או ”פתח באמצעות“ → דפדפן.",
            youDo: "צרו תיקייה `landing-draft` · קובץ `index.html` · הוסיפו `<h1>בדיקה</h1>` · שמרו · פתחו את הקובץ בדפדפן וראיתם את הכותרת.",
            outcome: "מעגל סגור: עריכה → שמירה → תוצאה בדפדפן.",
            task: "שנו את תוכן ה־h1, שמרו, רעננו — וודאו שהשינוי מופיע.",
            pasteHint:
              "👉 עכשיו: יוצרים תיקייה וקובץ index.html במחשב, עורכים בשורת נוטפד או כל עורך, שומרים — ואז פותחים את הקובץ בדפדפן. למטה אפשר גם לנסות את ”נסו בעצמכם“ בדף הקורס.",
            verify: {
              title: "אימות — האם רואים את האתר?",
              items: [
                "יש לי תיקייה landing-draft (או שם דומה) וקובץ index.html בתוכה",
                "אחרי שמירה — פתיחת הקובץ בדפדפן או Live Server מראה את ה-h1",
                "שינוי קטן + ריענון מעדכן את מה שאני רואה בדפדפן",
              ],
            },
            taskCompare: {
              title: "אותה משימה — לפני ואחרי",
              before: "assets/lesson-compare/m1-l3-before.svg",
              after: "assets/lesson-compare/m1-l3-after.svg",
              captionBefore: "לפני: קובץ ריק בפרויקט",
              captionAfter: "אחרי: אותו קובץ עם שלד HTML בסיסי",
              altBefore: "איור: תיקייה וקובץ index ריק",
              altAfter: "איור: אותו קובץ עם תגיות HTML",
            },
            tryIt: {
              title: "נסו בעצמכם — עורך HTML",
              subtitle:
                "ערכו את הקוד, לחצו הרצה (או השאירו עדכון חי). בסגנון Try it Yourself כמו ב-W3Schools.",
              htmlDefault:
                '<!DOCTYPE html>\n<html lang="he" dir="rtl">\n<head>\n<meta charset="UTF-8">\n<title>הטסט שלי</title>\n<style>\n  body { font-family: system-ui, sans-serif; background:#1e1b2e; color:#e8e6f0; padding:1.5rem; }\n  h1 { color:#c4b5fd; }\n</style>\n</head>\n<body>\n  <h1>שלום מהקורס</h1>\n  <p>שנו את הכותרת או הוסיפו פסקה.</p>\n</body>\n</html>',
            },
            resources: [
              {
                label: "מדריך Live Server (הרחבה ב-VS Code)",
                url: "https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer",
                note: "אם משתמשים ב-VS Code — הרחבה נוחה לריענון אוטומטי",
              },
              {
                label: "Netlify Drop — העלאת תיקייה לדמו",
                url: "https://app.netlify.com/drop",
                note: "אופציונלי, אם רוצים קישור חי בלי שרת מקומי",
              },
            ],
          },
          {
            id: "m1-l4",
            title: "שיחה ראשונה בצ'אט — רק אחרי שנכנסתם לכלי",
            durationMin: 11,
            goal: "להגיש בקשה אחת ברורה: מי אתם, מה נדרש, פלט מצופה — בלי לפרוס חמישה נושאים בהודעה אחת.",
            onScreen: "בקשה גרועה: ”תבנה לי אתר יפה“. בקשה טובה: נושא העסק + סוג עמוד + סקשנים + שפה + מה לא לשנות.",
            youDo: "ב-claude.ai שלחו בקשה אחת: שלושה סקשנים לדף הנחיתה של המשפט ששמרתם + טון כתיבה.",
            outcome: "מבינים שצ'אט עובד כמו אפיון קצר לטכנאי — לא כמו קסם.",
            task: "העתיקו את התשובה לקובץ טקסט בשם `prompt-draft.txt` בתיקיית הפרויקט.",
            copyPrompt:
              "אני בתרגיל מקורס. בנה עבורי טקסט אפיון בלבד (בלי קוד) לדף נחיתה בעברית, RTL, לנושא הבא:\n\n" +
              "הנושא שלי: [הדביקו כאן את המשפט ששמרתם על העסק/הדף]\n\n" +
              "דרישות:\n" +
              "- שלושה סקשנים ברורים: לכל סקשן כותרת + שתי שורות תוכן לדוגמה\n" +
              "- ציון טון כתיבה אחד (למשל מקצועי־חם)\n" +
              "- הפלט: רק התוכן המסודר, בלי הקדמות ארוכות ושאלות המשך\n",
            pasteHint:
              "👉 עכשיו: לחצו ”העתק פרומפט“ → ב-claude.ai הדביקו → החליפו את שורת [הדביקו כאן…] במשפט האמיתי → שלחו.",
            verify: {
              title: "אימות — האם קיבלתם תשובה סבירה?",
              items: [
                "שלחתי בקשה אחת לפי הפרומפט (אחרי שהחלפתי את שורת הנושא)",
                "קיבלתי לפחות שלושה סקשנים / כותרות עם תוכן",
                "העתקתי את התשובה לקובץ prompt-draft.txt בתיקיית הפרויקט",
              ],
            },
          },
        ],
      },
      {
        id: "m2",
        title: "מודול 2 — פרומפטים וזרימת עבודה אמיתית",
        summary: "תבנית להדבקה, ואז זרימה: בינה אחת לטיוטה → קלוד ב-claude.ai מיישם קוד שתשמרו ל-index.html.",
        lessons: [
          {
            id: "m2-l1",
            title: "תבנית פרומפט להעתקה — תכל'ס",
            durationMin: 10,
            goal: "שלד הודעה אחת שעובד: הקשר → תוצר → פורמט → מגבלות.",
            onScreen: "חמש שורות קבועות: 1) למי הדף 2) מה נבנה 3) שפה וטון 4) רשימת סקשנים 5) מה אסור לשנות.",
            youDo: "פתחו את `prompt-draft.txt`, מחקו את התרגיל הקודם, והדביקו את התבנית עם המילוי שלכם (דף הנחיתה מהשיעור הראשון).",
            outcome: "יש לכם פרומפט ”מוכן להדבקה“ לכל סבב הבא.",
            task: "שמרו גרסה שנייה של אותו פרומפט עם משפט מגבלה אחד: למשל ”בלי פלט מילולי — רק קוד“ או ההפך, לפי מה שתצטרכו בשיעור הבא.",
            copyPrompt:
              "הקשר: [למי הדף / מה העסק]\n" +
              "תוצר: דף נחיתה בודד בעברית RTL — [נושא ספציפי]\n" +
              "סקשנים נדרשים: Hero · 3 יתרונות · המלצות · FAQ (4 שאלות) · CTA\n" +
              "טון: [למשל מקצועי־חם]\n" +
              "מגבלות: בלי תמונות מ-URL חיצוני; בשלב זה בקשו אפיון מילולי/מבנה — לא קוד, אלא אם כבר ממשיכים לשיעור הבא.\n",
            pasteHint:
              "👉 עכשיו: לחצו ”העתק פרומפט“, הדביקו ב-claude.ai, מלאו את הסוגריים במילים שלכם ושמרו את התוצאה ב-prompt-draft.txt.",
            verify: {
              title: "אימות — האם יש לכם תבנית מלאה?",
              items: [
                "העתקתי את תבנית חמש השורות ומילאתי בה במקומות הריקים",
                "הפרומפט המעודכן שמור ב-prompt-draft.txt (או מסמך אחר בתיקייה)",
                "יש גם גרסה שנייה עם משפט מגבלה אחד — כפי שמופיע במשימה",
              ],
            },
          },
          {
            id: "m2-l2",
            title: "בינה אחת לטיוטת פרונט → קלוד ליישום בפרויקט",
            durationMin: 14,
            goal: "להריץ ב-ChatGPT / Gemini טיוטת HTML+CSS, ואז ב-claude.ai לבקש מקלוד לסדר/להשלים קוד, להעתיק ל-index.html (ו-styles.css אם יש) ולפתוח בדפדפן.",
            onScreen: "צעדים: (א) פרומפט לכלי חיצוני. (ב) מעתיקים את כל קוד הפלט. (ג) ב-claude.ai — מדביקים את כפתור ”בקשה לקלוד“ + הטיוטה — מקבלים קוד מסודר, שומרים לקבצים ופותחים בדפדפן.",
            youDo: "בצעו את שלושת הצעדים בפועל. אל תערכו ידנית את הקוד לפני שנתתם לקלוד לנסות.",
            outcome: "זרימת עבודה: טיוטה מהירה מחוץ לפרויקט → ביצוע מסודר בתוך הפרויקט עם קוד קלוד.",
            task: "רשמו במשפט אחד: איזה כלי חיצוני השתמשתם ומה קלוד שינה בקבצים לעומת הטיוטה.",
            copyPrompts: [
              {
                label: "העתק — לכלי חיצוני (ChatGPT / Gemini)",
                text:
                  "אתה מומחה לפרונט בסיסי. תן שלד מלא אחד: HTML + CSS (אפשר <style> פנימי) לדף נחיתה בעברית, RTL.\n\n" +
                  "הנושא והסקשנים לפי הפרומפט שלי כאן:\n\n" +
                  "[הדביקו כאן את תוכן prompt-draft.txt המעודכן]\n\n" +
                  "חובה במבנה: Hero, 3 יתרונות, המלצות (2), FAQ (4), CTA עם כפתור.\n" +
                  "עיצוב נקי ורספונסיבי בסיסי.\n" +
                  "פלט: רק קוד — בלי טקסט הסבר לפני ואחרי.\n",
              },
              {
                label: "העתק — בקשה לקלוד (ב-claude.ai)",
                text:
                  "אני בונה דף נחיתה. להלן טיוטת HTML/CSS שקיבלתי ממודל אחר — מדביק אותה אחרי השורה ---טיוטה---.\n" +
                  "משימה: תן לי קוד מלא ונקי לקובץ index.html (ואם צריך קובץ styles.css נפרד — תפרט מה שם). RTL, lang=he, כותרות לוגיות, בלי שגיאות ברורות. אל תוסיף הסברים — רק קוד, עם הוראה קצרה איך לשמור כל קובץ.\n\n" +
                  "---טיוטה---\n" +
                  "[מדביקים כאן את כל הפלט מהכלי החיצוני]\n",
              },
            ],
            pasteHint:
              "👉 שלב א: ”העתק — לכלי חיצוני“ → ChatGPT או Gemini → מחליפים את [הדביקו…] בפרומפט מ-prompt-draft.txt → שולחים. שלב ב: מעתיקים את כל קוד הפלט. שלב ג: ב-claude.ai — ”העתק — בקשה לקלוד“, מדביקים, ואז מדביקים את הטיוטה במקום [מדביקים כאן…] → שולחים → שומרים את הקוד לקבצים במחשב.",
            verify: {
              title: "אימות — האם סיימתם את כל השלבים?",
              items: [
                "הרצתי פרומפט בכלי חיצוני וקיבלתי שלד HTML/CSS",
                "הדבקתי את הבקשה והטיוטה ב-claude.ai וקיבלתי מתוכו קוד מסודר",
                "העתקתי את הקוד ל-index.html (ולאחרים אם הופיעו) ופתחתי בדפדפן — רואה דף",
                "מילאתי את משימת השיעור במשפט אחד: איזה כלי חיצוני + מה קלוד שיפר",
              ],
            },
            resources: [
              {
                label: "ChatGPT",
                url: "https://chatgpt.com/",
                note: "דוגמה לטיוטת פרונט טקסטואלית/קוד",
              },
              {
                label: "Google Gemini",
                url: "https://gemini.google.com/",
                note: "חלופה לטיוטה ראשונית",
              },
            ],
          },
          {
            id: "m2-l3",
            title: "טעויות נפוצות",
            durationMin: 8,
            goal: "לזהות לפני השגיאה: בקשה כללית, יותר מדי במכה, בלי הקשר.",
            onScreen: "רשימת ”אל תעשו ככה“ + תיקון מהיר לכל אחת.",
            youDo: "סמנו איזו טעות הכי מוכרת לכם — ותיקונו אותה בפרומפט הבא.",
            outcome: "פחות ”למה הוא לא הבין אותי“.",
            task: "פרקו בקשה גדולה לשתי הודעות קטנות לדוגמה.",
          },
          {
            id: "m2-l4",
            title: "תרגול פרומפטים אמיתי",
            durationMin: 12,
            goal: "שלוש דוגמאות: דף נחיתה, רכיב באתר, תיקון באג.",
            onScreen: "מעתיקים פרומפטים, מתאימים לעסק, מריצים, משווים תוצאות.",
            youDo: "בחרו דוגמה אחת והריצו עד תוצאה סבירה (גם אם לא מושלמת).",
            outcome: "ידיים חמות לפני מודול הבנייה.",
            task: "שמרו בקובץ טקסט 3 פרומפטים שעבדו לכם — זה המאגר האישי שלכם.",
          },
        ],
      },
      {
        id: "m3",
        title: "מודול 3 — דף נחיתה מהפרויקט בפועל",
        summary: "אותה תיקייה על המחשב: קוד מ-Claude → שמירה לקבצים → ריענון בדפדפן.",
        lessons: [
          {
            id: "m3-l1",
            title: "הפרויק트 על המחשב — תיקייה וקבצים",
            durationMin: 9,
            goal: "לדעת איפה נמצאת תיקיית הפרויקט, לערוך index.html בעורך פשוט ולפתוח את הקובץ בדפדפן אחרי כל שינוי.",
            onScreen: "סייר הקבצים → הכנסה לתיקייה → לחיצה ימנית על index.html → עריכה (נוטפד וכו') → שמירה → פתיחה מחדש בדפדפן או ריענון.",
            youDo: "גלו שאתם מוצאים את תיקיית landing-draft · פתחו בה את index.html · שינוי קטן ושמירה · ריענון בדפדפן.",
            outcome: "מעגל ברור: קוד מ-Claude → שמירה לקובץ → בדיקה בדפדפן.",
            task: "צרו תיקיית `assets` (ריקה) אם עדיין אין — קלוד יזכיר אותה כשתבקשו תמונות.",
            pasteHint:
              "👉 עכשיו: גלו לתיקיית הפרויקט במחשב — אותה תיקייה מהשיעורים הקודמים — וודאו שאתם יודעים איך לערוך ולשחק קובץ.",
            verify: {
              title: "אימות — הפרויקט נטען?",
              items: [
                "אני יודע/ת איפה תיקיית landing-draft ואיפה index.html על המחשב",
                "עריכה + שמירה + ריענון בדפדפן עבדו לי אחרי שינוי קטן",
              ],
            },
            resources: [],
          },
          {
            id: "m3-l2",
            title: "שלד הדף — מהפרומפט שלכם לקבצים",
            durationMin: 12,
            goal: "בקשה אחת ב-claude.ai: ליישם את הפרומפט מ־prompt-draft.txt (או טיוטה מכלי חיצוני) כ־HTML/CSS, ואז להעתיק לקבצים בתיקייה.",
            onScreen: "ב-claude.ai: מדביקים את בקשת השיעור + את התוכן ליישום → מקבלים קוד → מעתיקים ל-index.html (ו־CSS אם צריך) → פותחים בדפדפן.",
            youDo: "ב-claude.ai: הדביקו את תבנית m2-l1 או פלט מ־ChatGPT/Gemini, ובקשו שלד עם לפחות 5 אזורים (section/div) ו־RTL; שמרו את הקוד לקבצים.",
            outcome: "דף שנפתח בדפדפן עם מבנה אמיתי, לא רק טקסט בצ'אט.",
            task: "ספרו בשני משפטים: האם המבנה תואם את מה שביקשתם מהבינה החיצונית — מה עוד דורש סבב נוסף?",
            copyPrompt:
              "משימה: ליישם את האפיון/הטיוטה הבאה כ־HTML + CSS מלאים (קובץ אחד עם <style> או קבצים נפרדים — ציין בהוראה קצרה איך לשמור).\n" +
              "דרישות: לפחות 5 אזורי section או div ברורים, lang=he ו-dir=rtl, כותרות הגיוניות, קוד בלבד בלי נאום.\n\n" +
              "להלן התוכן ליישום:\n\n" +
              "[הדביקו כאן את תוכן prompt-draft.txt או את טיוטת ה-HTML/CSS]\n",
            pasteHint:
              "👉 עכשיו: ”העתק פרומפט“ → החליפו את [הדביקו…] → claude.ai → שליחה → העתקת הקוד ל-index.html וקבצים נוספים אם הופיעו → פתיחה בדפדפן.",
            verify: {
              title: "אימות — האם יש שלד בקבצים?",
              items: [
                "קיבלתי מקלוד ב-claude.ai קוד מלא והדבקתי אותו לקבצים בתיקייה",
                "יש לפחות 5 אזורים מובחנים ב-HTML",
                "הדף נטען בדפדפן ואני רואה מבנה קריא (גם אם העיצוב עדיין גולמי)",
              ],
            },
            taskCompare: {
              title: "מבולגן לעומת שלד מסודר",
              before: "assets/lesson-compare/m3-l2-before.svg",
              after: "assets/lesson-compare/m3-l2-after.svg",
              captionBefore: "לפני: רעיונות בלי סדר",
              captionAfter: "אחרי: סקשנים לפי זרימה",
              altBefore: "איור: רעיונות מפוזרים לדף נחיתה",
              altAfter: "איור: מבנה סקשנים ב-HTML",
            },
            tryIt: {
              title: "נסו בעצמכם — שלד דף נחיתה",
              subtitle: "הריצו וראו איך הסקשנים נראים בדפדפן. שחקו עם הטקסטים.",
              htmlDefault:
                '<!DOCTYPE html>\n<html lang="he" dir="rtl">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>דף נחיתה — דמו</title>\n<style>\n  * { box-sizing: border-box; }\n  body { font-family: system-ui, sans-serif; margin: 0; background: #f8fafc; color: #0f172a; line-height: 1.6; }\n  section { max-width: 40rem; margin: 0 auto; padding: 1.25rem 1rem; border-bottom: 1px solid #e2e8f0; }\n  h1 { font-size: 1.75rem; margin: 0 0 0.5rem; }\n  h2 { font-size: 1.1rem; color: #4f46e5; margin: 0 0 0.35rem; }\n  .hero { background: linear-gradient(135deg, #1e1b4b, #312e81); color: #e0e7ff; text-align: center; padding: 2rem 1rem; }\n  .cta { background: #4f46e5; color: #fff; text-align: center; }\n  .cta a { color: #fff; font-weight: 700; }\n</style>\n</head>\n<body>\n  <header class="hero">\n    <h1>כותרת ראשית</h1>\n    <p>משפט שמסביר במה עסק התוכן.</p>\n  </header>\n  <section><h2>יתרונות</h2><p>שלושה נקודות קצרות על הערך.</p></section>\n  <section><h2>המלצות</h2><p>ציטוט או לוגו לקוח.</p></section>\n  <section><h2>שאלות נפוצות</h2><p>שאלה ותשובה לדוגמה.</p></section>\n  <section class="cta"><h2>יצירת קשר</h2><p><a href="#">וואטסאפ</a></p></section>\n</body>\n</html>',
            },
          },
          {
            id: "m3-l3",
            title: "סידור סקשנים: Hero עד CTA",
            durationMin: 10,
            goal: "Hero, יתרונות, למי זה, המלצות, FAQ, קריאה לפעולה.",
            onScreen: "מבקשים מהקלוד להוסיף/לסדר סקשנים בלי לשבור את השאר.",
            youDo: "אשרו סדר סקשנים בפרומפט ועדכנו טקסטים לעסק שלכם.",
            outcome: "זרימת מסירת מסר הגיונית מלמעלה למטה.",
            task: "בדקו שבכל סקשן יש כותרת ברורה אחת לפחות.",
          },
          {
            id: "m3-l4",
            title: "שיפור עיצוב",
            durationMin: 12,
            goal: "צבעים, מרווחים, פונטים, כפתורים, היררכיה.",
            onScreen: "בקשות קצרות: פלטת צבעים, ריווח אחיד, כפתור בולט.",
            youDo: "בחרו צבע ראשי ומשני ובקשו להחיל בצורה עקבית.",
            outcome: "דף שנראה מקצועי יותר גם בלי עיצוב ”מטורף“.",
            task: "הגדילו ניגודיות בכפתור הראשי בודקים גם במובייל.",
          },
          {
            id: "m3-l5",
            title: "התאמה למובייל",
            durationMin: 11,
            goal: "בדיקה ב-DevTools, תיקון שבירות, בקשות רספונסיביות ממוקדות.",
            onScreen: "צמצום רוחב, גלילה, טקסטים ארוכים, תפריט אם יש.",
            youDo: "בקשו: ”תקן רספונסיביות רק לרוחב מתחת ל-600px, בלי לשנות דסקטופ“.",
            outcome: "דף נקרא ונוח בטלפון.",
            task: "צלמו מסך מובייל של ה-Hero אחרי התיקון.",
          },
          {
            id: "m3-l6",
            title: "טפסים, כפתורים וקריאה לפעולה",
            durationMin: 10,
            goal: "כפתור WhatsApp, טופס בסיסי, או קישור להרשמה.",
            onScreen: "קישור `wa.me`, או `mailto:`, או טופס `form` פשוט + הערה על שליחה אמיתית.",
            youDo: "הוסיפו פעולה אחת ברורה — לחיצה אחת שמובילה לצעד הבא.",
            outcome: "דף שלא רק ”יפה“ אלא מבקש פעולה.",
            task: "בדקו שלחיצה פותחת את היעד הנכון בטאב חדש אם צריך.",
          },
        ],
      },
      {
        id: "m4",
        title: "מודול 4 — עבודה חכמה בתוך הפרויקט",
        summary: "תיקונים, שינויים מבוקתים, סידור קוד, פיצ'רים קטנים.",
        lessons: [
          {
            id: "m4-l1",
            title: "איך לתקן באגים עם קלוד",
            durationMin: 10,
            goal: "להעתיק שגיאה, לתאר צעדים, לבקש תיקון בלי ”לשרוף“ הכול.",
            onScreen: "קונסולת דפדפן, הודעת שגיאה, הקשר: איזה קובץ ומה ניסיתם.",
            youDo: "פתחו באג קטן בכוונה (למשל שם קלאס) ותקנו עם בקשה ממוקדת.",
            outcome: "זרימת דיבאג שחוזרת על עצמה בכל פרויקט.",
            task: "רשמו תבנית: ”השגיאה + מה מצופה + מה לא לגעת“.",
          },
          {
            id: "m4-l2",
            title: "שינויים בלי שהכול מתפרק",
            durationMin: 9,
            goal: "הגבלת היקף: ”שנה רק את אזור ההמלצות“.",
            onScreen: "פרומפט עם גבולות + ”אל תשנה קבצים שלא צוינו“.",
            youDo: "בקשו החלפת קטע טקסט בלי לגעת ב-CSS הגלובלי.",
            outcome: "פחות רגרסיות.",
            task: "בדקו ב-git או בהשוואת קבצים אם יש לכם — אם לא, שמרו עותק לפני שינוי גדול.",
          },
          {
            id: "m4-l3",
            title: "מקוד מבולגן למסודר",
            durationMin: 10,
            goal: "חלוקה לקבצים, שמות ברורים, הערות מינימליות.",
            onScreen: "`styles.css` נפרד, קומפוננטות לוגיות, מחיקת כפילויות.",
            youDo: "בקשו ריפקטור קטן: העברת סגנונות או איחוד כפילויות.",
            outcome: "פרויקט קל יותר להמשך עבודה.",
            task: "ודאו שיש רק ערוץ אחד לצבע ראשי (משתנה CSS או הערה).",
          },
          {
            id: "m4-l4",
            title: "פיצ'רים קטנים",
            durationMin: 12,
            goal: "FAQ נפתח, גלריה, המלצות, טיימר, טבלת מחירים — אחד בכל פעם.",
            onScreen: "בחירת פיצ'ר אחד, איפיון קצר, יישום, בדיקה.",
            youDo: "הוסיפו פיצ'ר אחד שמתאים לדף הנחיתה שלכם.",
            outcome: "תחושה שאפשר לבנות ”לגו“ של בלוקים.",
            task: "עדכנו את הפרומפט האישי שלכם ל”הוספת בלוק דומה בעתיד“.",
          },
        ],
      },
      {
        id: "m5",
        title: "מודול 5 — שימושים שמוכרים את הקורס",
        summary: "דפי מכירה, אתר שירות, תוכן, ושדרוג אתר קיים.",
        lessons: [
          {
            id: "m5-l1",
            title: "דף מכירה לקורס דיגיטלי",
            durationMin: 14,
            goal: "מבנה שמוכר: בעיה, תוצאה, סילבוס, עדות, השכרת מחיר, שאלות, רכישה.",
            onScreen: "התאמה של דף הנחיתה לשפה של קורסים.",
            youDo: "בנו גרסה אחת מלאה לקורס אמיתי או לדוגמה.",
            outcome: "נכס שאפשר לשלוח ללקוח או להשתמש בעצמכם.",
            task: "שלחו את הקישור המקומי/הדמו לחבר לביקורת קריאה.",
          },
          {
            id: "m5-l2",
            title: "אתר שירות פשוט (סטודיו / עסק מקומי)",
            durationMin: 13,
            goal: "3–5 עמודים או עמוד בודד עם ניווט עוגנים לפי הצורך.",
            onScreen: "דף בית, שירותים, אודות, צור קשר — או סקשנים באחד.",
            youDo: "התאימו לעסק: שעות, אזור שירות, זכויות יצירת קשר.",
            outcome: "אתר ״מספיק טוב״ להעלאה מהירה.",
            task: "הוסיפו פס קטן של אמון: וותק, ביטוח, או מספר רישוי אם רלוונטי.",
          },
          {
            id: "m5-l3",
            title: "תוכן לאתר עם קלוד",
            durationMin: 10,
            goal: "כותרות, תיאורי מוצר, FAQ, טקסטים לכפתורים, טיוטות SEO.",
            onScreen: "פרומפטי תוכן נפרדים מהקוד; הדבקה לעמוד.",
            youDo: "ייצרו סט FAQ של 8 שאלות בעברית טבעית.",
            outcome: "פחות בורות בכתיבה, יותר מהירות.",
            task: "ערכו ידנית משפט אחד שחייב להיות בקול שלכם בלבד.",
          },
          {
            id: "m5-l4",
            title: "שדרוג פרויקט קיים",
            durationMin: 12,
            goal: "לייבא קוד קיים, למפות, לבקש שינוי מבוקר.",
            onScreen: "תיאור המבנה לקלוד, רשימת קבצים, מה מותר לשנות.",
            youDo: "קחו פרויקט ישן או תבנית ושדרגו חלק אחד (ביצועים/נגישות/מובייל).",
            outcome: "ביטחון שלא חייבים להתחיל מאפס.",
            task: "תעדו במשפט אחד מה הייתה נקודת החולשה המרכזית לפני השדרוג.",
          },
        ],
      },
      {
        id: "m6",
        title: "מודול 6 — לעבוד כמו מקצוען + העלאה",
        summary: "מתודולוגיה מלאה, איכות עקבית, וסגירת המעגל באוויר.",
        lessons: [
          {
            id: "m6-l1",
            title: "שיטת עבודה מלאה",
            durationMin: 11,
            goal: "מטרה → מבנה → עיצוב → תיקונים → מובייל → העלאה.",
            onScreen: "צ'קליסט מודפס/דיגיטלי שעוברים לפניו בכל דף.",
            youDo: "הריצו את הצ'קליסט על דף הנחיתה שלכם וסמנו מה חסר.",
            outcome: "פחות דילוגים אקראיים.",
            task: "קבעו ”הגדרת הושלמה“ למשימה: כל סעיף בצ'קליסט ירוק.",
          },
          {
            id: "m6-l2",
            title: "תוצאה ברמה גבוהה בכל פעם",
            durationMin: 12,
            goal: "שלבים, גרסאות, בדיקה ויזואלית, לא לרוץ קדימה.",
            onScreen: "דוגמאות לפני/אחרי, ושימוש בפרומפט ” polishing “ אחד לסוף.",
            youDo: "בצעו סבב אחד של ”ליטוש“: ניגודיות, מרווחים, מיקרו-קופי.",
            outcome: "סגירת קורס עם פרויקט שאתם גאים להראות.",
            task: "העלו גרסה ל-Hosting (Netlify / GitHub Pages / השרת שלכם) או הכינו ZIP לספק.",
          },
        ],
      },
    ],
    bonuses: {
      title: "בונוסים",
      items: [
        {
          title: "מאגר פרומפטים (העתקה מהירה)",
          body:
            "דף נחיתה: ”אתה מומחה לדפי נחיתה בעברית. בנה דף בודד (HTML+CSS) ל-[נישה]. סקשנים: Hero עם כותרת משנה, 3 יתרונות עם אייקון טקסטואלי, למי זה מתאים (רשימה), 3 המלצות (שם+משפט), FAQ של 6 שאלות, CTA כפול. עיצוב נקי, RTL, נגישות בסיסית (כפתורים גדולים, ניגודיות). אל תשתמש בתמונות חיצוניות.“\n\n" +
            "שיפור עיצוב: ”שפר רק את ה-CSS: טיפוגרפיה ומרווחים. אל תשנה מבנה ה-HTML. שמור RTL.“\n\n" +
            "מובייל: ”תקן breakpoint עד 640px: גלישת טקסט, ריווח אנכי, כפתורים ברוחב מלא. אל תשנה דסקטופ.“\n\n" +
            "תוכן: ”כתוב בקול מקצועי-חם בעברית: כותרת ראשית, 5 כותרות משנה, טקסט לכפתור CTA, ו-8 שאלות FAQ על [נושא].“\n\n" +
            "פיצ'ר: ”הוסף FAQ עם details/summary ב-HTML בלבד, סגנון מינימלי ב-CSS, בלי JS.“",
        },
        {
          title: "צ'קליסט עבודה",
          body:
            "□ תיקייה ושם פרויקט ברורים\n" +
            "□ תצוגה בדפדפן עובדת\n" +
            "□ שלד סקשנים מוסכם\n" +
            "□ טקסטים אמיתיים (לא lorem בשלב סיום)\n" +
            "□ כפתור/טופס/וואטסאפ — בודקים לחיצה\n" +
            "□ מובייל — עוברים על כל הסקשנים\n" +
            "□ מהירות בסיסית — תמונות מכווצות אם יש\n" +
            "□ העלאה / גיבוי לפני שיתוף עם לקוח",
        },
        {
          title: "תזכורות קצרות",
          body:
            "• משימה אחת בהודעה כשאפשר\n" +
            "• תמיד לצרף: מטרה + מגבלות (מה לא לגעת)\n" +
            "• אחרי שינוי גדול — רענון וודאי בדפדפן\n" +
            "• שמרו עותק לפני ”תא פרויקט מחדש“\n" +
            "• אם משהו נשבר — חזרה צעד אחורה ולא ”מנהיגת כאוס“",
        },
      ],
    },
  };

  var currentTrackKey = null;
  var activeLessonIndex = 0;

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function resetAllCourseProgress() {
    try {
      localStorage.removeItem(STATE_KEY);
      localStorage.removeItem(PROGRESS_KEY_LEGACY);
    } catch (eR) {}
  }

  function stripResetProgressQuery() {
    var p = new URLSearchParams(location.search);
    if (p.get("reset-progress") !== "1" && p.get("reset") !== "1") return false;
    resetAllCourseProgress();
    p.delete("reset-progress");
    p.delete("reset");
    var qs = p.toString();
    var url = location.pathname + (qs ? "?" + qs : "") + location.hash;
    try {
      history.replaceState(null, "", url);
    } catch (eH) {}
    return true;
  }

  function loadState() {
    try {
      var raw = localStorage.getItem(STATE_KEY);
      if (raw) {
        var o = JSON.parse(raw);
        if (o && typeof o.completed === "object") {
          if (!o.verify || typeof o.verify !== "object") o.verify = {};
          return o;
        }
      }
      var leg = localStorage.getItem(PROGRESS_KEY_LEGACY);
      if (leg) {
        var old = JSON.parse(leg);
        if (old && typeof old === "object") {
          var completed = {};
          Object.keys(old).forEach(function (k) {
            if (old[k]) completed[k] = true;
          });
          var s = { completed: completed, activeTrack: null, activeIndex: 0, verify: {} };
          saveState(s);
          return s;
        }
      }
    } catch (e) {}
    return { completed: {}, activeTrack: null, activeIndex: 0, verify: {} };
  }

  function saveState(state) {
    try {
      localStorage.setItem(STATE_KEY, JSON.stringify(state));
    } catch (e) {}
  }

  function getCompleted() {
    return loadState().completed || {};
  }

  function setLessonDone(lessonId, done) {
    var st = loadState();
    st.completed = st.completed || {};
    if (done) st.completed[lessonId] = true;
    else delete st.completed[lessonId];
    saveState(st);
  }

  function getEffectiveVerify(les) {
    if (les.verify && les.verify.items && les.verify.items.length) return les.verify;
    return {
      title: 'לפני "המשך" — אימות קצר',
      items: [
        "ביצעתי את משימת השיעור בפועל (לא רק קראתי), ורק עכשיו אני מסמן/ה.",
      ],
    };
  }

  function getVerifyChecks(lessonId, itemCount) {
    var st = loadState();
    var bag = st.verify && typeof st.verify === "object" ? st.verify[lessonId] : null;
    var arr = [];
    for (var i = 0; i < itemCount; i++) {
      arr[i] = !!(bag && bag[String(i)]);
    }
    return arr;
  }

  function setVerifyCheck(lessonId, index, checked) {
    var st = loadState();
    st.verify = st.verify && typeof st.verify === "object" ? st.verify : {};
    st.verify[lessonId] = st.verify[lessonId] && typeof st.verify[lessonId] === "object" ? st.verify[lessonId] : {};
    st.verify[lessonId][String(index)] = !!checked;
    saveState(st);
  }

  function allVerifyChecked(lessonId, les) {
    var v = getEffectiveVerify(les);
    var arr = getVerifyChecks(lessonId, v.items.length);
    for (var i = 0; i < v.items.length; i++) {
      if (!arr[i]) return false;
    }
    return true;
  }

  function copyTextToClipboard(text, onOk) {
    function done() {
      if (onOk) onOk();
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(function () {
        fallbackCopyText(text, done);
      });
      return;
    }
    fallbackCopyText(text, done);
  }

  function fallbackCopyText(text, onOk) {
    try {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      if (onOk) onOk();
    } catch (e1) {
      if (onOk) onOk();
    }
  }

  function buildLessonPromptKitHtml(les) {
    var blocks = [];
    if (les.copyPrompts && les.copyPrompts.length) {
      for (var ci = 0; ci < les.copyPrompts.length; ci++) {
        var b = les.copyPrompts[ci];
        if (b && b.text) blocks.push({ label: b.label || "העתק", text: b.text });
      }
    } else if (les.copyPrompt) {
      blocks.push({ label: "העתק פרומפט", text: les.copyPrompt });
    }
    var hasCopy = blocks.length > 0;
    if (!hasCopy && !les.pasteHint) return "";
    var h = '<div class="course-prompt-kit">';
    if (les.pasteHint) {
      h +=
        '<p class="course-paste-hint" role="status">' + escapeHtml(les.pasteHint) + "</p>";
    } else if (hasCopy) {
      h +=
        '<p class="course-paste-hint" role="status">👉 עכשיו: לחצו ”העתק“, והדביקו ב-claude.ai לפי שלב השיעור.</p>';
    }
    for (var bi = 0; bi < blocks.length; bi++) {
      h +=
        '<div class="course-copy-row"><button type="button" class="btn course-btn-copy">' +
        escapeHtml(blocks[bi].label) +
        '</button><span class="course-copy-toast" hidden aria-live="polite">הועתק ✓</span></div>';
    }
    h += "</div>";
    return h;
  }

  function buildLessonVerifyHtml(les, lessonId, alreadyDone) {
    if (alreadyDone) return "";
    var v = getEffectiveVerify(les);
    var checks = getVerifyChecks(lessonId, v.items.length);
    var allOk = true;
    for (var ai = 0; ai < v.items.length; ai++) {
      if (!checks[ai]) allOk = false;
    }
    var titleBlock =
      v.title ||
      'לפני "המשך" — האם הצליח?';
    var h =
      '<div class="course-lesson-verify" id="course-lesson-verify">' +
      '<h2 class="course-lesson-verify-title">' +
      escapeHtml(titleBlock) +
      "</h2>" +
      '<ul class="course-lesson-verify-list">';
    for (var vi = 0; vi < v.items.length; vi++) {
      var ck = checks[vi] ? " checked" : "";
      h +=
        '<li class="course-lesson-verify-item"><label class="course-verify-label"><input type="checkbox" class="course-verify-cb" data-vi="' +
        vi +
        '"' +
        ck +
        '> <span>' +
        escapeHtml(v.items[vi]) +
        "</span></label></li>";
    }
    h +=
      "</ul>" +
      '<p class="course-continue-gate-msg" id="course-continue-gate-msg" aria-live="polite"' +
      (allOk ? " hidden" : "") +
      ">יש לסמן את כל הסעיפים כדי ללחוץ על ”המשך“.</p>" +
      "</div>";
    return h;
  }

  function wireLessonPromptKit(les) {
    var kit = document.querySelector(".course-prompt-kit");
    if (!kit) return;
    var texts = [];
    if (les.copyPrompts && les.copyPrompts.length) {
      for (var i = 0; i < les.copyPrompts.length; i++) {
        if (les.copyPrompts[i] && les.copyPrompts[i].text) texts.push(les.copyPrompts[i].text);
      }
    } else if (les.copyPrompt) {
      texts.push(les.copyPrompt);
    }
    var btns = kit.querySelectorAll(".course-btn-copy");
    for (var j = 0; j < btns.length; j++) {
      (function (idx) {
        btns[idx].addEventListener("click", function () {
          var t = texts[idx];
          if (!t) return;
          copyTextToClipboard(t, function () {
            var row = btns[idx].closest(".course-copy-row");
            var toast = row && row.querySelector(".course-copy-toast");
            if (toast) {
              toast.hidden = false;
              setTimeout(function () {
                toast.hidden = true;
              }, 2000);
            }
          });
        });
      })(j);
    }
  }

  function wireLessonVerification(les, lessonId, alreadyDone) {
    if (alreadyDone) return;
    var box = document.getElementById("course-lesson-verify");
    if (!box) return;
    var msg = document.getElementById("course-continue-gate-msg");
    function syncContinue() {
      var ok = allVerifyChecked(lessonId, les);
      var btn = document.getElementById("course-btn-continue");
      if (btn) {
        btn.disabled = !ok;
        btn.setAttribute("aria-disabled", ok ? "false" : "true");
        btn.classList.toggle("is-gated", !ok);
      }
      if (msg) {
        if (ok) msg.setAttribute("hidden", "");
        else msg.removeAttribute("hidden");
      }
    }
    box.querySelectorAll(".course-verify-cb").forEach(function (cb) {
      cb.addEventListener("change", function () {
        var ix = Number(cb.getAttribute("data-vi"));
        setVerifyCheck(lessonId, ix, cb.checked);
        syncContinue();
      });
    });
    syncContinue();
  }

  function findLesson(lessonId) {
    for (var mi = 0; mi < COURSE.modules.length; mi++) {
      var m = COURSE.modules[mi];
      for (var li = 0; li < m.lessons.length; li++) {
        if (m.lessons[li].id === lessonId) return { module: m, lesson: m.lessons[li], moduleIndex: mi, lessonIndex: li };
      }
    }
    return null;
  }

  function countGlobalDone() {
    var c = getCompleted();
    var n = 0;
    Object.keys(c).forEach(function (k) {
      if (c[k]) n++;
    });
    return n;
  }

  function countTrackDone(trackKey) {
    var ids = TRACKS[trackKey].lessonIds;
    var c = getCompleted();
    var n = 0;
    for (var i = 0; i < ids.length; i++) {
      if (c[ids[i]]) n++;
    }
    return n;
  }

  function isIndexUnlocked(trackKey, index) {
    var ids = TRACKS[trackKey].lessonIds;
    var c = getCompleted();
    for (var j = 0; j < index; j++) {
      if (!c[ids[j]]) return false;
    }
    return true;
  }

  function firstIncompleteIndex(trackKey) {
    var ids = TRACKS[trackKey].lessonIds;
    var c = getCompleted();
    for (var i = 0; i < ids.length; i++) {
      if (!c[ids[i]]) return i;
    }
    return ids.length - 1;
  }

  function updateProgressBars() {
    var globalDone = countGlobalDone();
    var pctGlobal = Math.round((globalDone / TOTAL_LESSONS_GLOBAL) * 100);

    var barG = $("#course-progress-bar-global-only");
    var labG = $("#course-progress-label-global-only");
    if (barG) barG.style.width = pctGlobal + "%";
    if (labG) {
      labG.textContent =
        globalDone + " מתוך " + TOTAL_LESSONS_GLOBAL + " שיעורים בקורס (" + pctGlobal + "%)";
    }

    if (!currentTrackKey) return;

    var trackDone = countTrackDone(currentTrackKey);
    var pctTrack = Math.round((trackDone / TRACK_LEN) * 100);

    var bar = $("#course-progress-bar-track");
    var lt = $("#course-progress-label-track");
    var lg = $("#course-progress-label-global");
    if (bar) bar.style.width = pctTrack + "%";
    if (lt) lt.textContent = trackDone + " מתוך " + TRACK_LEN + " שיעורים במסלול (" + pctTrack + "%)";
    if (lg) lg.textContent = "בקורס המלא: " + globalDone + " מתוך " + TOTAL_LESSONS_GLOBAL + " שיעורים (" + pctGlobal + "%)";
  }

  function stopSpeech() {
    if (speechProgressInterval !== null) {
      clearInterval(speechProgressInterval);
      speechProgressInterval = null;
    }
    var player = document.getElementById("course-audio-player");
    if (player) player.classList.remove("is-playing");
    var fill = document.getElementById("course-audio-progress-fill");
    var timerEl = document.getElementById("course-speak-timer");
    if (fill) fill.style.width = "0%";
    if (timerEl) timerEl.textContent = "0 שנ׳";
    try {
      window.speechSynthesis.cancel();
    } catch (e) {}
  }

  function waveformBarsMarkup(barCount) {
    var pattern = [35, 58, 28, 72, 42, 65, 33, 78, 45, 52, 38, 68, 48, 55, 30, 75, 40, 62, 35, 70, 44, 50, 36, 66, 42, 58, 32, 74, 46, 54, 39, 64];
    var parts = [];
    for (var i = 0; i < barCount; i++) {
      var pct = pattern[i % pattern.length];
      parts.push('<span class="course-wave-bar" style="height:' + pct + '%"></span>');
    }
    return parts.join("");
  }

  function buildTaskCompareHtml(tc) {
    if (!tc || (!tc.before && !tc.after)) return "";
    var title = tc.title || "אותה משימה — לפני ואחרי";
    var capB = tc.captionBefore || "לפני";
    var capA = tc.captionAfter || "אחרי";
    var altB = tc.altBefore || capB;
    var altA = tc.altAfter || capA;
    var h =
      '<div class="course-task-compare">' +
      '<h2 class="course-task-compare-title">' +
      escapeHtml(title) +
      "</h2>" +
      '<div class="course-task-compare-grid">';
    if (tc.before) {
      h +=
        '<figure class="course-task-compare-fig">' +
        '<figcaption class="course-task-compare-cap">' +
        escapeHtml(capB) +
        '</figcaption><div class="course-task-compare-imgwrap"><img src="' +
        escapeHtml(tc.before) +
        '" alt="' +
        escapeHtml(altB) +
        '" loading="lazy" /></div></figure>';
    }
    if (tc.after) {
      h +=
        '<figure class="course-task-compare-fig">' +
        '<figcaption class="course-task-compare-cap">' +
        escapeHtml(capA) +
        '</figcaption><div class="course-task-compare-imgwrap"><img src="' +
        escapeHtml(tc.after) +
        '" alt="' +
        escapeHtml(altA) +
        '" loading="lazy" /></div></figure>';
    }
    return h + "</div></div>";
  }

  function buildTryItHtml(les) {
    if (!les.tryIt || !les.tryIt.htmlDefault) return "";
    var ti = les.tryIt;
    var title = ti.title || "נסו בעצמכם";
    var sub =
      ti.subtitle ||
      "ערכו את הקוד ולחצו הרצה — כמו Try it Yourself ב-W3Schools.";
    return (
      '<div class="course-w3-tryit" id="course-w3-tryit">' +
      '<div class="course-w3-header">' +
      '<h2 class="course-w3-title">' +
      escapeHtml(title) +
      "</h2>" +
      '<p class="course-w3-sub">' +
      escapeHtml(sub) +
      "</p></div>" +
      '<div class="course-w3-toolbar">' +
      '<button type="button" class="course-w3-run" id="course-w3-run">הרצה »</button>' +
      '<label class="course-w3-live"><input type="checkbox" id="course-w3-live" checked /> עדכון חי</label>' +
      "</div>" +
      '<div class="course-w3-panes">' +
      '<div class="course-w3-pane course-w3-pane-editor">' +
      '<div class="course-w3-pane-label">HTML</div>' +
      '<textarea class="course-w3-textarea" id="course-w3-editor" spellcheck="false" autocomplete="off" autocapitalize="off" aria-label="עריכת HTML"></textarea>' +
      "</div>" +
      '<div class="course-w3-pane course-w3-pane-result">' +
      '<div class="course-w3-pane-label">תוצאה</div>' +
      '<iframe class="course-w3-iframe" id="course-w3-iframe" title="תצוגה מקדימה" sandbox="allow-scripts"></iframe>' +
      "</div></div></div>"
    );
  }

  function buildLessonResourcesHtml(les) {
    var list = les.resources;
    if (!list || !list.length) return "";
    var h =
      '<div class="course-lesson-resources">' +
      '<h2 class="course-lesson-resources-title">קישורים לפעולה</h2>' +
      '<ul class="course-lesson-resources-list">';
    for (var i = 0; i < list.length; i++) {
      var r = list[i];
      if (!r || !r.url) continue;
      var lab = r.label || r.url;
      h +=
        '<li class="course-lesson-resources-item"><a class="course-lesson-external-link" href="' +
        escapeHtml(r.url) +
        '" target="_blank" rel="noopener noreferrer">' +
        escapeHtml(lab) +
        "</a>";
      if (r.note) {
        h +=
          ' <span class="course-lesson-resources-note">— ' +
          escapeHtml(r.note) +
          "</span>";
      }
      h += "</li>";
    }
    h += "</ul></div>";
    return h;
  }

  function initCourseTryIt(les) {
    if (!les.tryIt || !les.tryIt.htmlDefault) return;
    var ed = document.getElementById("course-w3-editor");
    var iframe = document.getElementById("course-w3-iframe");
    var run = document.getElementById("course-w3-run");
    var live = document.getElementById("course-w3-live");
    if (!ed || !iframe) return;
    var debTimer = null;
    function runPreview() {
      try {
        iframe.srcdoc = ed.value;
      } catch (eRun) {
        iframe.srcdoc =
          "<!DOCTYPE html><html lang=\"he\" dir=\"rtl\"><body><p>שגיאה בתצוגה</p></body></html>";
      }
    }
    ed.value = les.tryIt.htmlDefault;
    runPreview();
    if (run) run.addEventListener("click", runPreview);
    if (live) {
      ed.addEventListener("input", function () {
        if (!live.checked) return;
        if (debTimer) clearTimeout(debTimer);
        debTimer = setTimeout(runPreview, 400);
      });
    }
  }

  function pickHebrewVoice() {
    var voices = window.speechSynthesis.getVoices();
    for (var i = 0; i < voices.length; i++) {
      var l = (voices[i].lang || "").toLowerCase();
      if (l.indexOf("he") === 0) return voices[i];
    }
    return null;
  }

  function lessonToSpeechText(found) {
    var les = found.lesson;
    return [
      "שיעור: " + les.title + ".",
      "מטרה: " + les.goal,
      "מה רואים על המסך: " + les.onScreen,
      "מה לעשות: " + les.youDo,
      "תוצאה צפויה: " + les.outcome,
      "משימה קטנה: " + les.task,
    ].join(" ");
  }

  function speakLesson(found) {
    if (!window.speechSynthesis) return;
    stopSpeech();
    var player = document.getElementById("course-audio-player");
    var fill = document.getElementById("course-audio-progress-fill");
    var timerEl = document.getElementById("course-speak-timer");
    if (player) player.classList.add("is-playing");

    var text = lessonToSpeechText(found);
    var textLen = Math.max(1, text.length);
    var u = new SpeechSynthesisUtterance(text);
    u.lang = "he-IL";
    var v = pickHebrewVoice();
    if (v) u.voice = v;
    u.rate = 0.92;

    var estimatedSec = Math.max(14, textLen / (7.2 * u.rate));
    var startMs = Date.now();
    var boundaryPct = -1;

    function syncSpeakUi() {
      var elapsed = (Date.now() - startMs) / 1000;
      var sec = Math.floor(elapsed);
      if (timerEl) timerEl.textContent = sec + " שנ׳";
      var timePct = Math.min(99.2, (elapsed / estimatedSec) * 100);
      var pct =
        boundaryPct >= 0 ? Math.max(boundaryPct, timePct) : timePct;
      if (fill) fill.style.width = Math.min(100, pct) + "%";
    }

    u.onboundary = function (ev) {
      if (typeof ev.charIndex === "number") {
        boundaryPct = Math.min(100, (ev.charIndex / textLen) * 100);
      }
    };

    speechProgressInterval = setInterval(syncSpeakUi, 120);

    function finishSpeakingUi(keepTimer) {
      if (speechProgressInterval !== null) {
        clearInterval(speechProgressInterval);
        speechProgressInterval = null;
      }
      if (player) player.classList.remove("is-playing");
      if (!keepTimer) {
        if (fill) fill.style.width = "0%";
        if (timerEl) timerEl.textContent = "0 שנ׳";
      } else {
        if (fill) fill.style.width = "100%";
        if (timerEl)
          timerEl.textContent =
            Math.max(0, Math.floor((Date.now() - startMs) / 1000)) + " שנ׳";
      }
    }

    u.onend = function () {
      finishSpeakingUi(true);
    };
    u.onerror = function () {
      finishSpeakingUi(false);
    };

    window.speechSynthesis.speak(u);
  }

  function persistActiveLesson() {
    var st = loadState();
    st.activeTrack = currentTrackKey;
    st.activeIndex = activeLessonIndex;
    saveState(st);
  }

  function renderPlaylist() {
    var aside = document.getElementById("course-playlist");
    if (!aside || !currentTrackKey) return;
    var ids = TRACKS[currentTrackKey].lessonIds;
    var c = getCompleted();
    var html = "";
    html +=
      '<p class="course-playlist-head"><strong>פלייליסט</strong> · ' +
      TRACKS[currentTrackKey].label +
      "</p>";
    html += '<ol class="course-playlist-list" start="1">';
    for (var i = 0; i < ids.length; i++) {
      var lid = ids[i];
      var unlocked = isIndexUnlocked(currentTrackKey, i);
      var done = !!c[lid];
      var isCurrent = i === activeLessonIndex;
      var cls = "course-pl-item";
      if (done) cls += " is-done";
      if (isCurrent) cls += " is-current";
      if (!unlocked) cls += " is-locked";
      var found = findLesson(lid);
      var title = found ? found.lesson.title : lid;
      html += '<li class="' + cls + '">';
      if (unlocked) {
        html +=
          '<button type="button" class="course-pl-btn" data-idx="' +
          i +
          '">' +
          escapeHtml(title) +
          (done ? " ✓" : "") +
          "</button>";
      } else {
        html +=
          '<span class="course-pl-locked">' + escapeHtml(title) + " · נעול</span>";
      }
      html += "</li>";
    }
    html += "</ol>";
    html +=
      '<p class="course-playlist-foot">' +
      countTrackDone(currentTrackKey) +
      " מתוך " +
      TRACK_LEN +
      " הושלמו במסלול</p>";
    aside.innerHTML = html;
    aside.querySelectorAll(".course-pl-btn").forEach(function (b) {
      b.addEventListener("click", function () {
        var ix = Number(b.getAttribute("data-idx"));
        if (!isIndexUnlocked(currentTrackKey, ix)) return;
        activeLessonIndex = ix;
        persistActiveLesson();
        renderLessonStage();
        renderPlaylist();
      });
    });
  }

  function renderLessonStage() {
    var stage = document.getElementById("course-lesson-inner");
    if (!stage || !currentTrackKey) return;
    var ids = TRACKS[currentTrackKey].lessonIds;
    var lid = ids[activeLessonIndex];
    var found = findLesson(lid);
    if (!found) return;
    var les = found.lesson;
    var mod = found.module;
    var c = getCompleted();
    var isLast = activeLessonIndex >= ids.length - 1;
    var done = !!c[lid];
    var verifyOk = done || allVerifyChecked(lid, les);
    var continueCls = "btn btn-primary btn-continue" + (verifyOk ? "" : " is-gated");
    var continueDisabled = verifyOk ? "" : " disabled aria-disabled=\"true\"";
    stage.innerHTML =
      '<article class="course-lesson-article course-lesson-article-v2">' +
      '<p class="course-lesson-breadcrumb">' +
      escapeHtml(mod.title) +
      '</p><p class="course-lesson-step-kicker">שיעור ' +
      (activeLessonIndex + 1) +
      " מתוך " +
      TRACK_LEN +
      '</p><h1 class="course-lesson-h1">' +
      escapeHtml(les.title) +
      "</h1>" +
      '<p class="course-lesson-duration"><span class="course-time-badge">~' +
      les.durationMin +
      ' דק׳</span> קריאה או הקראה</p>' +
      '<div class="course-lesson-grid course-lesson-grid-v2">' +
      '<section class="course-block"><h2>מטרת השיעור</h2><p>' +
      escapeHtml(les.goal) +
      "</p></section>" +
      '<section class="course-block"><h2>מה רואים על המסך</h2><p>' +
      escapeHtml(les.onScreen) +
      "</p></section>" +
      '<section class="course-block"><h2>מה אתם עושים</h2><p>' +
      escapeHtml(les.youDo) +
      "</p></section>" +
      '<section class="course-block course-block-accent"><h2>התוצאה בסוף</h2><p>' +
      escapeHtml(les.outcome) +
      "</p></section>" +
      '<section class="course-block course-block-task"><h2>משימה קטנה</h2><p>' +
      escapeHtml(les.task) +
      "</p></section>" +
      "</div>" +
      buildLessonPromptKitHtml(les) +
      buildLessonResourcesHtml(les) +
      buildTaskCompareHtml(les.taskCompare) +
      buildTryItHtml(les) +
      buildLessonVerifyHtml(les, lid, done) +
      '<div class="course-audio-row" id="course-audio-player">' +
      '<div class="course-audio-wave-shell">' +
      '<div class="course-waveform course-waveform--full" aria-hidden="true">' +
      waveformBarsMarkup(56) +
      "</div>" +
      '<div class="course-audio-progress-line" aria-hidden="true">' +
      '<div class="course-audio-progress-fill" id="course-audio-progress-fill"></div>' +
      "</div>" +
      "</div>" +
      '<div class="course-audio-controls">' +
      '<span class="course-audio-timer" id="course-speak-timer" aria-live="polite">0 שנ׳</span>' +
      '<button type="button" class="btn course-audio-listen" id="course-btn-speak">האזן לשיעור</button>' +
      '<button type="button" class="btn course-audio-stop" id="course-btn-stop-speak">עצירה</button>' +
      "</div>" +
      "</div>" +
      '<div class="course-continue-row">' +
      (done ? '<p class="course-continue-note">סימנתם את השיעור כהושלם ✓</p>' : "") +
      '<button type="button" class="' +
      continueCls +
      '" id="course-btn-continue"' +
      continueDisabled +
      ">" +
      (isLast ? "סיימתי — סיום המסלול" : "המשך לשיעור הבא") +
      "</button>" +
      "</div>" +
      "</article>";
    var btnSpeak = document.getElementById("course-btn-speak");
    var btnStop = document.getElementById("course-btn-stop-speak");
    var btnCont = document.getElementById("course-btn-continue");
    if (btnSpeak) btnSpeak.addEventListener("click", function () { speakLesson(found); });
    if (btnStop) btnStop.addEventListener("click", stopSpeech);
    if (btnCont) {
      btnCont.addEventListener("click", function () {
        if (!done && !allVerifyChecked(lid, les)) return;
        setLessonDone(lid, true);
        updateProgressBars();
        if (!isLast) {
          activeLessonIndex++;
          persistActiveLesson();
          renderLessonStage();
        } else {
          renderLessonStageDone();
        }
        renderPlaylist();
      });
    }
    initCourseTryIt(les);
    wireLessonPromptKit(les);
    wireLessonVerification(les, lid, done);
    var wrap = stage.closest(".course-lesson-stage");
    if (wrap) {
      try {
        wrap.scrollIntoView({ behavior: "smooth", block: "start" });
      } catch (e2) {}
    }
  }

  function renderLessonStageDone() {
    var stage = document.getElementById("course-lesson-inner");
    if (!stage) return;
    stage.innerHTML =
      '<div class="course-done-card">' +
      '<h2 class="course-done-title">כל הכבוד!</h2>' +
      "<p>סיימתם את כל השיעורים ב" +
      escapeHtml(TRACKS[currentTrackKey].label) +
      '. אפשר לבחור מסלול אחר.</p><button type="button" class="btn btn-primary" id="course-done-another">בחירת מסלול</button></div>';
    var b = document.getElementById("course-done-another");
    if (b) b.addEventListener("click", showLevelPicker);
  }

  function trackFullyDone(trackKey) {
    var ids = TRACKS[trackKey].lessonIds;
    var c = getCompleted();
    for (var i = 0; i < ids.length; i++) {
      if (!c[ids[i]]) return false;
    }
    return true;
  }

  function showClassroom(trackKey) {
    currentTrackKey = trackKey;
    var st = loadState();
    var fallbackIx = firstIncompleteIndex(trackKey);
    activeLessonIndex = fallbackIx;
    if (st.activeTrack === trackKey && typeof st.activeIndex === "number") {
      var want = Math.min(Math.max(0, st.activeIndex), TRACK_LEN - 1);
      if (isIndexUnlocked(trackKey, want)) activeLessonIndex = want;
    }
    var entry = document.getElementById("course-entry");
    var room = document.getElementById("course-classroom");
    if (entry) entry.hidden = true;
    if (room) room.hidden = false;
    var lab = document.getElementById("course-track-label");
    if (lab) lab.textContent = TRACKS[trackKey].label;
    persistActiveLesson();
    updateProgressBars();
    renderPlaylist();
    if (trackFullyDone(trackKey)) {
      renderLessonStageDone();
    } else {
      renderLessonStage();
    }
  }

  function showLevelPicker() {
    stopSpeech();
    currentTrackKey = null;
    var entry = document.getElementById("course-entry");
    var room = document.getElementById("course-classroom");
    if (room) room.hidden = true;
    if (entry) entry.hidden = false;
    updateProgressBars();
  }

  function wireLevelButtons() {
    document.querySelectorAll(".course-level-card[data-track]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var t = btn.getAttribute("data-track");
        if (TRACKS[t]) showClassroom(t);
      });
    });
    var back = document.getElementById("course-back-levels");
    if (back) back.addEventListener("click", showLevelPicker);
  }

  function renderBonuses() {
    var el = document.getElementById("bonus-list");
    if (!el) return;
    var html = "";
    COURSE.bonuses.items.forEach(function (b) {
      html +=
        '<section class="course-bonus-card"><h3>' +
        escapeHtml(b.title) +
        '</h3><pre class="course-bonus-pre" dir="auto">' +
        escapeHtml(b.body) +
        '</pre><button type="button" class="btn btn-ghost btn-copy" data-copy>העתקה ללוח</button></section>';
    });
    el.innerHTML = html;
    el.querySelectorAll("[data-copy]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var pre = btn.previousElementSibling;
        if (!pre || pre.tagName !== "PRE") return;
        var text = pre.textContent || "";
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(
            function () {
              btn.textContent = "הועתק!";
              setTimeout(function () {
                btn.textContent = "העתקה ללוח";
              }, 1600);
            },
            function () {}
          );
        }
      });
    });
  }

  function wireResetProgressButton() {
    var btn = document.getElementById("course-btn-reset-progress");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var ok = window.confirm(
        "לאפס את כל ההתקדמות בשמירה המקומית?\n\nיימחקו: שיעורים שסומנו כהושלמו, סימוני אימות, ומקום בפלייליסט — רק בדפדפן הזה.\n\nלא ניתן לבטל."
      );
      if (!ok) return;
      stopSpeech();
      resetAllCourseProgress();
      currentTrackKey = null;
      activeLessonIndex = 0;
      location.reload();
    });
  }

  function initCourseShell() {
    var brand = document.getElementById("course-brand-title");
    if (brand) brand.textContent = COURSE.title;
    wireResetProgressButton();
    wireLevelButtons();
    renderBonuses();
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }
    updateProgressBars();
  }

  function init() {
    stripResetProgressQuery();
    initCourseShell();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
