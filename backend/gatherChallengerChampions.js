const { Kayn, REGIONS } = require("kayn");
const fs = require("fs");
const fileName = "./data/challenger.json";
const file = require(fileName);

const kayn = Kayn("RGAPI-854ad062-9174-493d-860a-71d643e90c89")({
  region: REGIONS.NORTH_AMERICA,
  locale: "en_US",
  debugOptions: {
    isEnabled: true,
    showKey: false
  },
  requestOptions: {
    shouldRetry: true,
    numberOfRetriesBeforeAbort: 3,
    delayBeforeRetry: 1000,
    burst: false,
    shouldExitOn403: false
  },
  cacheOptions: {
    cache: null,
    timeToLives: {
      useDefault: false,
      byGroup: {},
      byMethod: {}
    }
  }
});

const getMatchList = async (kayn, summonerName) => {
  const { accountId } = await kayn.Summoner.by.name(summonerName);

  let rest = [];
  let beginIndex = 0;
  while (true) {
    const endIndex = beginIndex + 100;
    const indexQuery = { beginIndex, endIndex };
    const matchlist = await kayn.Matchlist.by
      .accountID(accountId)
      .region("na")
      .query({ queue: 420, season: 13 })
      .query(indexQuery || {});
    if (matchlist.matches.length === 0) break; // this is key
    rest = rest.concat(matchlist["matches"]);
    beginIndex += 100;
  }

  return rest;
};

const parseChampions = async (
  kayn,
  matchlist,
  currentEpoch,
  lastWeekEpoch,
  total,
  week
) => {
  const DDragonChampions = await kayn.DDragon.Champion.listDataByIdWithParentAsId();
  const championData = DDragonChampions["data"];
  const championIdToName = id => championData[id]["name"];
  let totalChampionJSON = {};
  let weekChampionJSON = {};
  const getTopThree = totalJSON => {
    let props = Object.keys(totalJSON).map(function(key) {
      return { key: key, value: this[key] };
    }, totalJSON);
    props.sort(function(p1, p2) {
      return p2.value - p1.value;
    });
    let topThree = props.slice(0, 3).reduce(function(obj, prop) {
      obj[prop.key] = prop.value;
      return obj;
    }, {});
    return topThree;
  };

  for (let i = 0; i < matchlist.length; i++) {
    if (matchlist[i]["timestamp"] < currentEpoch) {
      championName = championIdToName(matchlist[i].champion);
      if (totalChampionJSON.hasOwnProperty(championName)) {
        totalChampionJSON[championName]++;
      } else {
        totalChampionJSON[championName] = 1;
      }
      if (total.hasOwnProperty(championName)) {
        total[championName]++;
      } else {
        total[championName] = 1;
      }
      if (matchlist[i]["timestamp"] > lastWeekEpoch) {
        if (weekChampionJSON.hasOwnProperty(championName)) {
          weekChampionJSON[championName]++;
        } else {
          weekChampionJSON[championName] = 1;
        }
        if (week.hasOwnProperty(championName)) {
          week[championName]++;
        } else {
          week[championName] = 1;
        }
      }
    }
  }
  topThree = getTopThree(totalChampionJSON);
  topThreeWeek = getTopThree(weekChampionJSON);
  return [topThree, topThreeWeek, total, week];
};

const sortByLP = (a, b) => b.leaguePoints - a.leaguePoints;

const gatherChallenger = async kayn => {
  const challengerLeague = await kayn.Challenger.list("RANKED_SOLO_5x5");
  let players = challengerLeague.entries.sort(sortByLP);
  const summonerNametoSummonerName = ({ summonerName }) => summonerName;
  const d = new Date();
  d.setHours(0);
  d.setMinutes(0);
  d.setSeconds(0);
  d.setMilliseconds(0);
  const currentEpoch = d.getTime();
  const lastWeekEpoch = currentEpoch - 1000 * 60 * 60 * 24 * 7;
  let total = {};
  let week = {};

  players = players.map(summonerNametoSummonerName);
  for (let i = 0; i < players.length; i++) {
    let j = 0;
    playerMatchlist = await getMatchList(kayn, players[i]);
    champions = await parseChampions(
      kayn,
      playerMatchlist,
      currentEpoch,
      lastWeekEpoch,
      total,
      week
    );

    file[players[i]] = {};
    file[players[i]]["Rank"] = i + 1;
    file[players[i]]["SummonerName"] = players[i];
    file["TotalThisSeason"] = champions[2];
    file["TotalThisWeek"] = champions[3];
    file[players[i]]["TopThreeTotal"] = {};
    file[players[i]]["TopThreeTotal"][0] = {};
    file[players[i]]["TopThreeTotal"][1] = {};
    file[players[i]]["TopThreeTotal"][2] = {};

    for (let champion in champions[0]) {
      file[players[i]]["TopThreeTotal"][j]["champion"] = champion;
      file[players[i]]["TopThreeTotal"][j]["GamesPlayed"] =
        champions[0][champion];
      j++;
    }
    j = 0;
    file[players[i]]["TopThreeWeek"] = {};
    file[players[i]]["TopThreeWeek"][0] = {};
    file[players[i]]["TopThreeWeek"][1] = {};
    file[players[i]]["TopThreeWeek"][2] = {};
    for (let champion in champions[1]) {
      file[players[i]]["TopThreeWeek"][j]["champion"] = champion;
      file[players[i]]["TopThreeWeek"][j]["GamesPlayed"] =
        champions[1][champion];
      j++;
    }
    file[players[i]]["LastUpdate"] = currentEpoch;
    fs.writeFile(fileName, JSON.stringify(file, null, 2), function(err) {
      if (err) return console.log(err);
      console.log(`writing ${players[i]} to ${fileName}`);
    });
  }
};

const getChallenger = () => {
  gatherChallenger(kayn);
}

module.exports = getChallenger;
