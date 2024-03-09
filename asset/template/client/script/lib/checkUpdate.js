export default async function checkUpdate() {
  const response = await fetch('/update/time');
  const { time, } = await response.json();
  let ans = false;
  if (new Date().getTime() <= time) {
    ans = true;
  }
  return ans;
}
