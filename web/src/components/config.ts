// Define color types
type RGB = `rgb(${number}, ${number}, ${number})`;
type RGBA = `rgba(${number}, ${number}, ${number}, ${number})`;
type HEX = `#${string}`;

type Color = RGB | RGBA | HEX;

interface Page {
  name: string;
  color: Color;
}
export const pages: Page[] = [
  {
    name: "home", 
    color: '#FFFFFF'
  },
  {
    name: "blog", 
    color: '#FFFF00'
  },
]