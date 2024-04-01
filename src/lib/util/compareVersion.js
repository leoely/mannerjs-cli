function getVersions(v) {
  return v.substring(1, v.length).split('.');
}

export default function compareVersion(v1, v2, cmp) {
  const versions1 = getVersions(v1);
  const versions2 = getVersions(v2);
  let ans = [];
  for (let i = 0; i < versions1.length; i += 1) {
    ans.push(cmp(parseInt(versions1[i]), parseInt(versions2[i])));
  }
  return ans;
}
