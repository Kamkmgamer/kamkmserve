(function () {
   try {
     var saved = localStorage.getItem('theme');
     var prefersDark = false;
     try {
       prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
     } catch (_) {}
     var theme = (saved === 'light' || saved === 'dark') ? saved : (prefersDark ? 'dark' : 'light');
     if (theme === 'dark') {
       document.documentElement.classList.add('dark');
     } else {
       document.documentElement.classList.remove('dark');
     }
     // Persist initial resolution if nothing was saved
     if (saved !== theme) {
       localStorage.setItem('theme', theme);
     }
   } catch (e) {}
 })();
