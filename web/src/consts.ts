// Define color types
type RGB = `rgb(${number}, ${number}, ${number})`;
type RGBA = `rgba(${number}, ${number}, ${number}, ${number})`;
type HEX = `#${string}`;

type Color = RGB | RGBA | HEX;

interface Page {
  name: string;
  color: Color;
}

export const SITE_PAGES: Page[] = [
  {
    name: "home", 
    color: '#FFFFFF'
  },
  {
    name: "blog", 
    color: '#FFFF00'
  },
]

export const SITE_TITLE = 'hexcyan';
export const SITE_DESCRIPTION = 'welcome to my site :)';
