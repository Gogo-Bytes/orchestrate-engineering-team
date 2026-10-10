export function slug(value) {
  return value.trim().toLowerCase().replace(/\s+/g, "-");
}
