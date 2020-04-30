
export function rgbToHex(s:string): string {
    let rgb = s.split(' ').map(Number);
    return "#" + ((1 << 24) + (rgb[0] << 16) + (rgb[1] << 8) + rgb[2]).toString(16).toUpperCase().slice(1);
  }
  