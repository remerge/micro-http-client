function stripTrailingSlash(string) {
  if (string[string.length - 1] != '/') return string;
  return string.slice(0, -1);
}

function stripLeadingSlash(string) {
  if (string[0] != '/') return string;
  return string.slice(1);
}

export function prependHost(host) {
  const sanitizedHost = stripTrailingSlash(host);
  return ({ url: path }) => {
    const sanitizedPath = stripLeadingSlash(path);
    const newUrl = `${sanitizedHost}/${sanitizedPath}`;
    return { url: newUrl };
  };
}
