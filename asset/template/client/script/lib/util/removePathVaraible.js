export default function removePathVariables(pathname) {
  let i;
  for (i = pathname.length - 1; i >= 1; i -= 1) {
    const char = pathname.charAt(i);
    if (char === '/') {
      const prevChar = pathname.charAt(i - 1);
      if (prevChar === '/') {
        break;
      }
    }
  }
  if (i <= 1) {
    return pathname;
  } else {
    return pathname.substring(0, i - 2 + 1);
  }
}

