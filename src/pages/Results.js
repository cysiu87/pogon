import React, { useEffect, useState } from "react";
import axios from "axios";
import auth from "../env";

const Results = () => {
  const [matchData, setMatchData] = useState([]);
  const [gameDate, setGameDate] = useState("");
  const [gameName, setGameName] = useState("");
  const [gameId, setGameId] = useState(null);
  const [tournamentsData, setTournamentsData] = useState([]);

  // Helper method to determine the host
  const getHost = () => (auth.DEV ? auth.DEV_URL : auth.PROD_URL);
  const host = getHost();

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  useEffect(() => {
    // Fetch all tournaments
    const fetchTournaments = async () => {
      try {
        const response = await axios.get(`${host}/api/tournaments`);
        setTournamentsData(response.data.data);
      } catch (error) {
        console.error("Error fetching tournaments:", error);
      }
    };

    fetchTournaments();
  }, []);

  useEffect(() => {
    // Get ID from URL
    const getIdFromUrl = () => {
      const hashParams = new URLSearchParams(window.location.hash.split("?")[1]);
      return hashParams.get("id");
    };

    const id = getIdFromUrl();
    
    if (!id && tournamentsData.length > 0) {
      // If no ID in URL, use the first tournament
      const firstTournament = tournamentsData[0];
      setGameId(firstTournament.Id);
      setGameName(firstTournament.Name);
      setGameDate(firstTournament.StartDate);
      return;
    }
    
    if (id) {
      setGameId(id);
      
      const fetchResults = async () => {
        try {
          const response = await axios.get(`${host}/api/result/tournament/${id}`);
          if (response.data.data) setMatchData(response.data.data);
        } catch (error) {
          console.error("Error fetching results:", error);
        }
      };

      const fetchTournament = async () => {
        try {
          const tournament = tournamentsData.find(t => t.Id == id);
          if (tournament) {
            setGameName(tournament.Name);
            setGameDate(tournament.StartDate);
          }
        } catch (error) {
          console.error("Error fetching tournament:", error);
        }
      };

      fetchResults();
      fetchTournament();
    }
  }, [tournamentsData, host]);

  const handleTournamentChange = (e) => {
    const selectedId = e.target.value;
    if (selectedId) {
      window.location.hash = `#/results?id=${selectedId}`;
      window.location.reload();
    }
  };

  const calculateStandings = (matches) => {
    const teams = {};

    matches.forEach(({ Team1, Team2, Result1, Result2, Status }) => {
     
      if((Result1 != null && Result2!=null) && Status == "Z"){

        console.log(Team1+"  "+Result1)
      if (!teams[Team1])
        teams[Team1] = { name: Team1, points: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0 };
      if (!teams[Team2])
        teams[Team2] = { name: Team2, points: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0 };

      teams[Team1].goalsFor += Result1;
      teams[Team1].goalsAgainst += Result2;
      teams[Team2].goalsFor += Result2;
      teams[Team2].goalsAgainst += Result1;

      teams[Team1].matchesPlayed=teams[Team1].matchesPlayed+1; 
      teams[Team2].matchesPlayed=teams[Team2].matchesPlayed+1;

      if (Result1 > Result2) {
        teams[Team1].points += 3;
      } else if (Result1 < Result2) {
        teams[Team2].points += 3;
      } else {
        teams[Team1].points += 1;
        teams[Team2].points += 1;
      }

      teams[Team1].goalDifference = teams[Team1].goalsFor - teams[Team1].goalsAgainst;
      teams[Team2].goalDifference = teams[Team2].goalsFor - teams[Team2].goalsAgainst;
    }
    });

    return Object.values(teams).sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference);
  };
  const getTeamMatchesCount = (matches, teamName) => {
    return matches.filter(({ Team1, Team2, Result1, Result2, Status }) => 
        (Team1 === teamName || Team2 === teamName) && Result1 != null && Result2 != null && Status ==="Z"
    ).length;
};
  return (
    <div className="p-2 sm:p-4 result resF max-w-6xl mx-auto ">
      
      {/* Tournament Selector */}
      <div className="mb-6 text-center">
        <label className="block text-lg font-bold mb-3">Wybierz Turniej:</label>
        <select
          value={gameId || ""}
          onChange={handleTournamentChange}
          className="border p-3 rounded w-full text-base"
        >
          <option value="">Wybierz turniej...</option>
          {tournamentsData
            .filter((game) => game.Name !== "undefined")
            .map((game) => (
              <option key={game.Id} value={game.Id}>
                {formatDate(game.StartDate)} - {game.Name}
              </option>
            ))}
        </select>
      </div>

      {gameId && (
        <>
          <h1 className="text-xl sm:text-2xl font-bold mb-4 text-center">{gameName}<img src="pogon.png" width="50" alt="Pogon" className="inline-block ml-2" /></h1>
          <h3 className="text-center text-base sm:text-lg mb-6">{formatDate(gameDate)}</h3>
          <h2 className="text-xl font-bold mb-4 text-center">Tabela</h2>
          
          {/* Tabela Ligowa - Standings */}
          <div className="overflow-x-auto mb-6">
            <table className="min-w-full table-auto border-collapse text-xs sm:text-sm mx-auto bg-white">
              <thead style={{backgroundColor: '#dc2626', color: 'white'}}>
                <tr>
                  <th className="border border-gray-300 p-2" style={{backgroundColor: '#dc2626', color: 'white'}}>#</th>
                  <th className="border border-gray-300 p-2" style={{backgroundColor: '#dc2626', color: 'white'}}>Drużyna</th>
                  <th className="border border-gray-300 p-2" style={{backgroundColor: '#dc2626', color: 'white'}}>Pkt</th>
                  <th className="border border-gray-300 p-2" style={{backgroundColor: '#dc2626', color: 'white'}}>M</th>
                  <th className="border border-gray-300 p-2 hidden sm:table-cell" style={{backgroundColor: '#dc2626', color: 'white'}}>Bramki +</th>
                  <th className="border border-gray-300 p-2 hidden sm:table-cell" style={{backgroundColor: '#dc2626', color: 'white'}}>Bramki -</th>
                  <th className="border border-gray-300 p-2" style={{backgroundColor: '#dc2626', color: 'white'}}>Bilans</th>
                </tr>
              </thead>
              <tbody className="bg-white text-black">
                {calculateStandings(matchData).map((team, index) => (
                  <tr key={team.name} className="hover:bg-gray-100">
                    <td className="border border-gray-300 p-2 text-center font-bold">{index + 1}</td>
                    <td className="border border-gray-300 p-2">{team.name}</td>
                    <td className="border border-gray-300 p-2 text-center font-bold">{team.points}</td>
                    <td className="border border-gray-300 p-2 text-center">{getTeamMatchesCount(matchData, team.name)}</td>
                    <td className="border border-gray-300 p-2 text-center hidden sm:table-cell">{team.goalsFor}</td>
                    <td className="border border-gray-300 p-2 text-center hidden sm:table-cell">{team.goalsAgainst}</td>
                    <td className="border border-gray-300 p-2 text-center">{team.goalDifference > 0 ? '+' : ''}{team.goalDifference}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tabela wyników meczów */}
          <br></br>
          <h2 className="text-xl font-bold mt-6 mb-4 text-center">Mecze</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse text-xs sm:text-sm mx-auto bg-white">
              <thead style={{backgroundColor: '#dc2626', color: 'white'}}>
                <tr>
                  <th className="border border-gray-300 p-2" style={{backgroundColor: '#dc2626', color: 'white'}}>#</th>
                  <th className="border border-gray-300 p-2" style={{backgroundColor: '#dc2626', color: 'white'}}>Mecz</th>
                  <th className="border border-gray-300 p-2" style={{backgroundColor: '#dc2626', color: 'white'}}>Wynik</th>
                  <th className="border border-gray-300 p-2" style={{backgroundColor: '#dc2626', color: 'white'}}>Status</th>
                </tr>
              </thead>
              <tbody className="bg-white text-black">
                {matchData
                  .sort((a, b) => a.Id - b.Id)
                  .map(({ Id, Team1, Team2, Result1, Result2, Status }, index) => (                
                    <tr key={Id} className="hover:bg-gray-100">
                      <td className="border border-gray-300 p-2 text-center">{index + 1}</td>
                      <td className="border border-gray-300 p-2 text-xs sm:text-sm">{`${Team1} - ${Team2}`}</td>
                      <td className="border border-gray-300 p-2 text-center font-bold">{`${Result1 == null ? "-": Result1} - ${Result2 == null ? "-" : Result2}`}</td>
                      <td className="border border-gray-300 p-2 text-center text-xs">
                        <span className={`px-2 py-1 rounded ${Status === "N" ? "bg-yellow-200 text-black" : Status === "Z" ? "bg-green-200 text-black" : "bg-blue-200 text-black"}`}>
                          {Status === "N" ? "Zaplanowany" : Status === "Z" ? "Zakończony" : "W trakcie"}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default Results;
