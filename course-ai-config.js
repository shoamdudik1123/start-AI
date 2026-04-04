/* הגדרת כתובת ה־API לעוזר הצ'אט · לעריכה לפי ספק האחסון */
(function (w) {
  if (!w.COURSE_CHAT_API) {
    /* Vercel: ברירת מחדל */
    w.COURSE_CHAT_API = "/api/course-chat";
    /* Netlify: החליפו ל־
       w.COURSE_CHAT_API = "/.netlify/functions/course-chat";
    */
  }
})(window);
