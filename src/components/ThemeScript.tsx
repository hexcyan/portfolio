// Blocking inline script that applies the saved theme to <html> before first
// paint. Without this, the theme is only set in StatusBar's useEffect (which
// runs after paint), so full-document loads — direct visits, hard refreshes,
// and plain <a> navigations — flash the default "cyan" theme before the saved
// one is restored. The string is a hardcoded constant (no interpolation), so
// dangerouslySetInnerHTML carries no injection risk here.
const script = `(function(){try{var t=localStorage.getItem("theme");if(t&&["cyan","xp","dark","parchment"].indexOf(t)!==-1&&t!=="cyan"){document.documentElement.setAttribute("data-theme",t);}}catch(e){}})();`;

export default function ThemeScript() {
    return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
