export default function formatUnit(val, unit) {
  let ans = null;
  if (val !== null) {
    ans = val + unit;
  }
  return ans;
}
