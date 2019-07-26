import React, { useState, useEffect } from "react";
import Table from "./styles/Table";
import PropTypes from "prop-types";
import Link from "next/link";

function ViewChallenger() {
  const [challengerData, setChallengerData] = useState({});
  const [summonerNames, setSummonerNames] = useState([]);
  const [loading, setLoading] = useState(false);

  const callBackendAPI = async () => {
    const response = await fetch("http://localhost:4444/express_backend");
    const body = await response.json();

    delete body["file"].TotalThisSeason;
    delete body["file"].TotalThisWeek;

    setChallengerData(body["file"]);
    setSummonerNames(Object.keys(body["file"]));

    setLoading(true);

    if (response.status !== 200) {
      throw Error(body.message);
    }
  };

  useEffect(() => {
    callBackendAPI();
  }, []);

  return (
    <Table>
      <thead>
        <tr>
          <th>Summoner Name</th>
          <th>Most Played</th>
          <th />
          <th />
          <th>This week</th>
          <th />
          <th />
        </tr>
      </thead>
      <tbody>
        {loading &&
          summonerNames.map((summoner, index) => (
            <DisplayMembers key={index} summoner={challengerData[summoner]} />
          ))}
      </tbody>
    </Table>
  );
}

function DisplayMembers(props) {
  const summoner = props.summoner;
  const url = "https://ddragon.leagueoflegends.com/cdn/9.13.1/img/champion/";
  function formatChampion(str) {
    if (str) {
      return str
        .replace(/(\B)[^ ]*/g, match => match.toLowerCase())
        .replace(/^[^ ]/g, match => match.toUpperCase())
        .replace("Rek'sai", "RekSai")
        .replace("Nunu & Willump", "Nunu")
        .replace("'", "")
        .replace(" ", "")
        .replace("JarvanIv", "JarvanIV")
        .replace("Dr.Mundo", "DrMundo");
    } else {
      return "";
    }
  }
  return (
    <tr>
      <td>{summoner.SummonerName}</td>
      <td>
        <img
          src={`${url}${formatChampion(
            summoner.TopThreeTotal[0].champion
          )}.png`}
          alt={`${formatChampion(summoner.TopThreeTotal[0].champion)}`}
          height="100"
          width="100"
        />
        {summoner.TopThreeTotal[0].GamesPlayed} Games
      </td>
      <td>
        <img
          src={`${url}${formatChampion(
            summoner.TopThreeTotal[1].champion
          )}.png`}
          alt={`${formatChampion(summoner.TopThreeTotal[1].champion)}`}
          height="100"
          width="100"
        />
        {summoner.TopThreeTotal[1].GamesPlayed} Games
      </td>
      <td>
        <img
          src={`${url}${formatChampion(
            summoner.TopThreeTotal[2].champion
          )}.png`}
          alt={`${formatChampion(summoner.TopThreeTotal[2].champion)}`}
          height="100"
          width="100"
        />
        {summoner.TopThreeTotal[2].GamesPlayed} Games
      </td>
      <td>
        <img
          src={`${url}${formatChampion(summoner.TopThreeWeek[0].champion)}.png`}
          height="100"
          width="100"
          alt={`${formatChampion(summoner.TopThreeWeek[0].champion)}`}
        />
        {summoner.TopThreeWeek[0].GamesPlayed} Games
      </td>
      <td>
        <img
          src={`${url}${formatChampion(summoner.TopThreeWeek[1].champion)}.png`}
          height="100"
          width="100"
          alt={`${formatChampion(summoner.TopThreeWeek[1].champion)}`}
        />
        {summoner.TopThreeWeek[1].GamesPlayed} Games
      </td>
      <td>
        <img
          src={`${url}${formatChampion(summoner.TopThreeWeek[2].champion)}.png`}
          height="100"
          width="100"
          alt={`${formatChampion(summoner.TopThreeWeek[2].champion)}`}
        />
        {summoner.TopThreeWeek[2].GamesPlayed} Games
      </td>
    </tr>
  );
}

export default ViewChallenger;
