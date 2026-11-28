// Lifepoint Caboolture West public launch: Sunday 7 February 2027, Brisbane time.
// Wording marked "pre-launch" shows before this moment and "post-launch" after it.
// Builds after the launch output the new wording; a small script in base.njk
// switches pages that were built earlier, so it changes on the day without republishing.
// To preview the after-launch site: LAUNCH_NOW=2027-02-07T09:00:00+10:00 npx @11ty/eleventy
const at = "2027-02-07T00:00:00+10:00";
module.exports = () => {
  const now = process.env.LAUNCH_NOW ? Date.parse(process.env.LAUNCH_NOW) : Date.now();
  return { at, ts: Date.parse(at), done: now >= Date.parse(at) };
};
