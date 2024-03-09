export default function formateUnit(val, unit) {
  let ans = null;
  if (val !== null) {
    ans = val + unit;
  }
  return ans;
}
