export function formatBoostMessage(template, { user, guild, boostCount }) {
  return template
    .replace(/{user}/g, `<@${user.id}>`)
    .replace(/{username}/g, user.username)
    .replace(/{guild}/g, guild.name)
    .replace(/{boostcount}/g, boostCount.toString());
}
