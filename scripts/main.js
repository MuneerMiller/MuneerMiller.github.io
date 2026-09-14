// Animations
AOS.init({
  anchorPlacement: 'top-left',
  duration: 1000
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    document.querySelector(this.getAttribute('href')).scrollIntoView({
      behavior: 'smooth'
    });
  });
});

// ===== Dark/Light Mode Toggle =====
const themeToggle = document.getElementById('theme-toggle');

// 1. Check for saved user preference or use system preference
const savedTheme = localStorage.getItem('theme');
const currentTheme = savedTheme ||
                    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

// 2. Apply the initial theme
if (currentTheme === 'dark') {
  document.documentElement.setAttribute('data-theme', 'dark');
  themeToggle.checked = true;
}

// 3. Toggle theme on button click
themeToggle.addEventListener('change', function() {
  if (this.checked) {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
    localStorage.setItem('theme', 'light');
  }
});

// 4. Watch for system theme changes
const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
const handleSystemThemeChange = e => {
  if (localStorage.getItem('theme')) {
    return;
  }
  const newTheme = e.matches ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', newTheme);
  themeToggle.checked = (newTheme === 'dark');
};

if (systemTheme.addEventListener) {
  systemTheme.addEventListener('change', handleSystemThemeChange);
} else {
  systemTheme.addListener(handleSystemThemeChange);
}
