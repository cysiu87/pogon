import React, { useEffect, useState } from "react";
import axios from "../axiosConfig";
import auth from "../env";

const Results = () => {
  const [matchData, setMatchData] = useState([]);
  const [newMatch, setNewMatch] = useState({ team1: "", team2: "", result1: "", result2: "", status: "N" });
  const [editingMatch, setEditingMatch] = useState(null);
  const [teamData, setTeamData] = useState([]); // State for storing teams
  const [newTeamName, setNewTeamName] = useState(""); // State for new team name
  const [tournament, setTournament] = useState({ gameName: "", gameDate: "", gameId: null  });
  const [tournamentsData, setTournamentsData] = useState([]);
  const [matchesSchedule, setMatchesSchedule] = useState([]);
  const [newTournament, setNewTournament] = useState({ gameName: "", gameDate: "" });
  const [editingTournament, setEditingTournament] = useState(null);

  const getHost = () => (auth.DEV ? auth.DEV_URL : auth.PROD_URL);
  const host = getHost();

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };


// Fetch DATA SECTION
const fetchTournaments = async () => {
  try {
    const response = await axios.get('/api/tournaments');
    setTournamentsData(response.data.data);
  } catch (error) {
    console.error("Error fetching tournaments data:", error);
  }
};

const fetchTeams = async () => {
  if (!tournament.gameId) return;
  
  try {
    const response = await axios.get(`/api/result/teams/tournament/${tournament.gameId}`);
    if (response.data.data) setTeamData(response.data.data);
  } catch (error) {
    console.error("Error fetching teams:", error);
  }
};

const fetchResults = async () => {
  if (!tournament.gameId) return;
  
  try {
    const response = await axios.get(`/api/result/tournament/${tournament.gameId}`);
    setMatchData(response.data.data);
  } catch (error) {
    console.error("Error fetching match results:", error);
  }
};

useEffect(() => {
  fetchTournaments();  
}, []);

useEffect(() => {
  if (!tournament.gameId) return;

  fetchTeams();
  fetchResults();
}, [tournament.gameId]);

// handle DATA CHANGE SECTION
const handleTournamentChange = (e) => {
  const gameId = e.target.value;
  const selectedTournament = tournamentsData.find(game => game.Id == gameId);
  if (selectedTournament) {
    setTournament({ 
      gameName: selectedTournament.Name, 
      gameDate: selectedTournament.StartDate, 
      gameId: gameId 
    });
  }
};

// TOURNAMENT CRUD OPERATIONS
const handleAddTournament = async () => {
  if (!newTournament.gameName || !newTournament.gameDate) return;
  
  try {
    await axios.post('/api/tournaments', {
      name: newTournament.gameName,
      startDate: newTournament.gameDate,
      status: 'active'
    });
    setNewTournament({ gameName: "", gameDate: "" });
    fetchTournaments();
  } catch (error) {
    console.error("Error adding tournament:", error);
  }
};

const handleEditTournament = async () => {
  if (!editingTournament) return;
  
  try {
    await axios.put(`/api/tournaments/${editingTournament.id}`, {
      name: editingTournament.gameName,
      startDate: editingTournament.gameDate,
      status: 'active'
    });
    setEditingTournament(null);
    fetchTournaments();
  } catch (error) {
    console.error("Error updating tournament:", error);
  }
};

const handleDeleteTournament = async (id) => {
  if (!window.confirm("Czy na pewno chcesz usunąć ten turniej? Usunięte zostaną również wszystkie mecze i drużyny!")) return;
  
  try {
    await axios.delete(`/api/tournaments/${id}`);
    if (tournament.gameId == id) {
      setTournament({ gameName: "", gameDate: "", gameId: null });
    }
    fetchTournaments();
  } catch (error) {
    console.error("Error deleting tournament:", error);
  }
};

const handleTournamentInputChange = (e) => {
  const { name, value } = e.target;
  if (editingTournament) {
    setEditingTournament({ ...editingTournament, [name]: value });
  } else {
    setNewTournament({ ...newTournament, [name]: value });
  }
};




// handle EDIT DATA SECTION

// const handleAddMatch = async () => {
//   if (!tournament.gameId || matchesSchedule.length === 0) return;

//   try {
//     await Promise.all(
//       matchesSchedule.map(async (match) => {
//         const newMatchData = {
//           team1: match.team1.Name,
//           team2: match.team2.Name,
//           order: match.order,
//           gameId: tournament.gameId,
//         };
//         await axios.post(`${host}/api/result/result`, newMatchData);
//       })
//     );

//     setNewMatch([]);
    
//   } catch (error) {
//     console.error("Error adding match:", error);
//   }
// };

// static CALCULATION SECTION


  // Helper function to calculate standings based on match results
  const calculateStandings = (matches) => {
    const teams = {};

    matches.forEach(({ Team1, Team2, Result1, Result2 }) => {
      if (!teams[Team1])
        teams[Team1] = { name: Team1, points: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0 };
      if (!teams[Team2])
        teams[Team2] = { name: Team2, points: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0 };

      teams[Team1].goalsFor += Result1;
      teams[Team1].goalsAgainst += Result2;
      teams[Team2].goalsFor += Result2;
      teams[Team2].goalsAgainst += Result1;

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
    });
    
    return Object.values(teams).sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference);
  };

  // Add match
  const handleAddMatch = async () => {
    if (!tournament.gameId) {
      alert("Proszę najpierw wybrać turniej!");
      return;
    }
    
    const newMatchData = {
      team1: newMatch.team1,
      team2: newMatch.team2,
      result1: newMatch.result1 == '' ? 0 : parseInt(newMatch.result1),
      result2: newMatch.result2 == '' ? 0 : parseInt(newMatch.result2),
      status: newMatch.status,
      tournamentId: tournament.gameId
    };
    try {
      await axios.post('/api/result', newMatchData);

      setNewMatch({ team1: "", team2: "", result1: "", result2: "", status:"N" }); // Clear form
      fetchResults(); // Refresh results
    } catch (error) {
      console.error("Error adding match:", error);
    }
  };

  // Edit match
  const handleEditMatch = async () => {
    const updatedMatchData = {
      id: editingMatch.id,
      team1: editingMatch.team1,
      team2: editingMatch.team2,
      result1: parseInt(editingMatch.result1),
      result2: parseInt(editingMatch.result2),
      status: editingMatch.status,
      tournamentId: tournament.gameId
    };
    try {
      await axios.put('/api/result', updatedMatchData);
      setEditingMatch(null); // Clear editing state
      fetchResults(); // Refresh results
    } catch (error) {
      console.error("Error updating match:", error);
    }
  };

  // Delete match
  const handleDeleteMatch = async (id) => {
    try {
      await axios.delete(`/api/result/${id}`);
      fetchResults(); // Refresh results
    } catch (error) {
      console.error("Error deleting match:", error);
    }
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editingMatch) {
      setEditingMatch({ ...editingMatch, [name]: value });
    } else {
      setNewMatch({ ...newMatch, [name]: value });
    }
  };  

  // Delete team
  const handleDeleteTeam = async (teamId) => {
    try {
      await axios.delete(`/api/result/teams/${teamId}`);
      fetchTeams(); // Refresh teams
    } catch (error) {
      console.error("Error deleting team:", error);
    }
  };

  // Add new team
  const handleAddTeam = async () => {
    if (!newTeamName || !tournament.gameId) {
      alert("Proszę najpierw wybrać turniej!");
      return;
    }
    
    const newTeamData = {
      teamName: newTeamName,
      tournamentId: tournament.gameId 
    };

    try {
      await axios.post('/api/result/teams', newTeamData);
      setNewTeamName(""); // Clear the input field
      fetchTeams(); // Refresh teams after adding
    } catch (error) {
      console.error("Error adding team:", error);
    }
  };



  const getTeamMatchesCount = (matches, teamName) => {
    return matches.filter(({ Team1, Team2, Result1, Result2, Status }) => 
        (Team1 === teamName || Team2 === teamName) && Result1 != null && Result2 != null && Status ==="Z"
    ).length;
};

  // Generate all matches for tournament (Round-robin with optimized scheduling)
  const handleGenerateMatches = async () => {
    if (!tournament.gameId || teamData.length < 2) {
      alert("Potrzebujesz minimum 2 drużyny aby wygenerować mecze!");
      return;
    }

    if (!window.confirm(`Czy na pewno chcesz wygenerować mecze dla ${teamData.length} drużyn? To utworzy ${teamData.length * (teamData.length - 1) / 2} meczy.`)) {
      return;
    }

    try {
      // Round-robin algorithm with optimized scheduling
      const teams = teamData.filter(team => team.Name !== "undefined");
      const matches = [];
      const n = teams.length;
      
      // If odd number of teams, add a "bye" (null)
      const teamList = [...teams];
      if (n % 2 === 1) {
        teamList.push(null);
      }
      
      const totalTeams = teamList.length;
      const totalRounds = totalTeams - 1;
      const matchesPerRound = totalTeams / 2;
      
      // Generate rounds using circle method
      for (let round = 0; round < totalRounds; round++) {
        for (let match = 0; match < matchesPerRound; match++) {
          const home = (round + match) % (totalTeams - 1);
          const away = (totalTeams - 1 - match + round) % (totalTeams - 1);
          
          // Last team stays in place
          const team1Index = match === 0 ? totalTeams - 1 : home;
          const team2Index = away;
          
          const team1 = teamList[team1Index];
          const team2 = teamList[team2Index];
          
          // Skip if either team is null (bye)
          if (team1 && team2) {
            matches.push({
              team1: team1.Name,
              team2: team2.Name,
              tournamentId: tournament.gameId
            });
          }
        }
      }

      // Send all matches to backend
      await Promise.all(
        matches.map(match => 
          axios.post('/api/result', {
            ...match,
            result1: 0,
            result2: 0,
            status: 'N'
          })
        )
      );

      alert(`Pomyślnie wygenerowano ${matches.length} meczy!`);
      fetchResults();
    } catch (error) {
      console.error("Error generating matches:", error);
      alert("Wystąpił błąd podczas generowania meczy.");
    }
  };

  return (
    <div className="p-2 sm:p-4 resF resF2 max-w-6xl mx-auto">
      {/* Tournament Management */}
      <div className="mb-4 sm:mb-6 p-3 sm:p-4 border-2 border-blue-500 rounded">
        <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Zarządzanie Turniejami</h2>
        
        {/* Add/Edit Tournament Form */}
        <div className="flex flex-col space-y-3 mb-4 max-w-2xl mx-auto">
          <input
            type="text"
            name="gameName"
            placeholder="Nazwa Turnieju"
            value={editingTournament ? editingTournament.gameName : newTournament.gameName}
            onChange={handleTournamentInputChange}
            className="border p-3 rounded w-full text-base"
          />
          <input
            type="date"
            name="gameDate"
            placeholder="Data Turnieju"
            value={editingTournament ? editingTournament.gameDate : newTournament.gameDate}
            onChange={handleTournamentInputChange}
            className="border p-3 rounded w-full text-base"
          />
          <button
            onClick={editingTournament ? handleEditTournament : handleAddTournament}
            className="border p-3 rounded btn-primary text-base font-semibold"
          >
            {editingTournament ? "Zapisz Turniej" : "Dodaj Turniej"}
          </button>
          {editingTournament && (
            <button
              onClick={() => setEditingTournament(null)}
              className="border p-3 rounded btn-secondary text-base"
            >
              Anuluj
            </button>
          )}
        </div>

        {/* Tournament List */}
        <div className="overflow-x-auto">
          <h3 className="text-base sm:text-lg font-bold mb-2 text-center">Lista Turniejów</h3>
          <table className="min-w-full max-w-4xl mx-auto table-auto border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">#</th>
                <th className="border p-2">Nazwa</th>
                <th className="border p-2">Data</th>
                <th className="border p-2">Akcje</th>
              </tr>
            </thead>
            <tbody>
              {tournamentsData
                .filter((game) => game.Name !== "undefined")
                .map((game, index) => (
                  <tr key={game.Id}>
                    <td className="border p-2 text-center">{index + 1}</td>
                    <td className="border p-2">{game.Name}</td>
                    <td className="border p-2 text-center">{formatDate(game.StartDate)}</td>
                    <td className="border p-2 text-center whitespace-nowrap">
                      
                      <button
                        className="btn btn-warning text-xs sm:text-sm px-2 py-1 mr-1"
                        onClick={() => setEditingTournament({ 
                          id: game.Id, 
                          gameName: game.Name, 
                          gameDate: game.StartDate 
                        })}
                      >
                        Edytuj
                      </button>
                      <button
                        className="btn btn-danger text-xs sm:text-sm px-2 py-1"
                        onClick={() => handleDeleteTournament(game.Id)}
                      >
                        Usuń
                      </button>
                      <a
                        href={`#/results?id=${game.Id}`}
                        className="btn btn-info text-xs sm:text-sm px-2 py-1 mr-1"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Zobacz
                      </a>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tournament Selector */}
      <div className="mb-6 max-w-2xl mx-auto">
        <h2 className="text-lg sm:text-xl font-bold mb-4 text-center">Wybierz Turniej do Zarządzania</h2>
        <select
          name="tournament"
          value={tournament.gameId || ""}
          onChange={handleTournamentChange}
          className="border p-3 rounded w-full text-base"
        >
          <option value="">Wybierz Turniej</option>
          {tournamentsData
            .filter((game) => game.Name !== "undefined")
            .map((game) => (
              <option key={game.Id} value={game.Id}>
                {formatDate(game.StartDate)} : {game.Name}
              </option>
            ))}
        </select>
      </div>

      {tournament.gameId && (
        <>
      {/* Matches Table */}
      <div className="overflow-x-auto">
      <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-center">Tabela Ligowa</h2>
      <table className="min-w-full max-w-4xl mx-auto table-auto border-collapse text-xs sm:text-sm">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-1 sm:p-2">#</th>
            <th className="border p-1 sm:p-2">Drużyna</th>
            <th className="border p-1 sm:p-2">Pkt</th>
            <th className="border p-1 sm:p-2">M</th>
            <th className="border p-1 sm:p-2 hidden sm:table-cell">Bramki +</th>
            <th className="border p-1 sm:p-2 hidden sm:table-cell">Bramki -</th>
            <th className="border p-1 sm:p-2">Bilans</th>
          </tr>
        </thead>
        <tbody>
          {calculateStandings(matchData).map((team, index) => (
            <tr key={team.name}>
              <td className="border p-1 sm:p-2 text-center">{index + 1}</td>
              <td className="border p-1 sm:p-2">{team.name}</td>
              <td className="border p-1 sm:p-2 text-center font-bold">{team.points}</td>
              <td className="border p-1 sm:p-2 text-center">{getTeamMatchesCount(matchData, team.name)}</td>
              <td className="border p-1 sm:p-2 text-center hidden sm:table-cell">{team.goalsFor}</td>
              <td className="border p-1 sm:p-2 text-center hidden sm:table-cell">{team.goalsAgainst}</td>
              <td className="border p-1 sm:p-2 text-center">{team.goalDifference > 0 ? '+' : ''}{team.goalDifference}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      <div className="overflow-x-auto mt-4 sm:mt-6">
      <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-center">Wyniki Meczów</h2>
      <table className="min-w-full max-w-4xl mx-auto table-auto border-collapse text-xs sm:text-sm">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-1 sm:p-2">Mecz</th>
            <th className="border p-1 sm:p-2">Wynik</th>
            <th className="border p-1 sm:p-2">Status</th>
            <th className="border p-1 sm:p-2">Akcje</th>
          </tr>
        </thead>
        <tbody>
          {matchData
            .sort((a, b) => b.Id - a.Id)
            .map(({ Id, Team1, Team2, Result1, Result2,Status }) => (
              <tr key={Id}>
                <td className="border p-1 sm:p-2 text-xs sm:text-sm">{`${Team1} - ${Team2}`}</td>
                <td className="border p-1 sm:p-2 text-center font-bold">{`${Result1} : ${Result2}`}</td>
                <td className="border p-1 sm:p-2 text-center text-xs">{Status == "N" ? "Plan" : Status == "Z" ? "Koniec" : "Gra"}</td>
                <td className="border p-1 sm:p-2 text-center">
                  <button
                    onClick={() => {
                      setEditingMatch({ id: Id, team1: Team1, team2: Team2, result1: Result1, result2: Result2, status: Status });
                    }}
                    className="btn-warning text-xs px-1 sm:px-2 py-1 mr-1"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteMatch(Id)}
                    className="btn-danger text-xs px-1 sm:px-2 py-1"
                  >
                    X
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
      </div>

      <div className="mt-6 max-w-2xl mx-auto">
      <h2 className="text-lg sm:text-xl font-bold mb-4 text-center">Dodaj lub Edytuj Mecz</h2>
      <div className="flex flex-col space-y-3">
        {/* Select Teams */}
        <div className="grid grid-cols-2 gap-3 ">
          <select
            name="team1"
            value={editingMatch ? editingMatch.team1 : newMatch.team1}
            onChange={handleInputChange}
            className="border p-3 rounded text-base hh"
          >
            <option value="">Drużyna 1</option>
            {teamData
              .filter((team) => team.Name !== "undefined")
              .map((team) => (
                <option key={team.Id} value={team.Name}>
                  {team.Name}
                </option>
              ))}
          </select>
          <select
            name="team2"
            value={editingMatch ? editingMatch.team2 : newMatch.team2}
            onChange={handleInputChange}
            className="border p-3 rounded text-base hh"
          >
            <option value="">Drużyna 2</option>
            {teamData
              .filter((team) => team.Name !== "undefined")
              .map((team) => (
                <option key={team.Id} value={team.Name}>
                  {team.Name}
                </option>
              ))}
          </select>
        </div>
        
        {/* Input for Results */}
        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            name="result1"
            placeholder="Wynik 1"
            value={editingMatch ? editingMatch.result1 : newMatch.result1}
            onChange={handleInputChange}
            className="border p-3 rounded text-base hh"
          />
          <input
            type="number"
            name="result2"
            placeholder="Wynik 2"
            value={editingMatch ? editingMatch.result2 : newMatch.result2}
            onChange={handleInputChange}
            className="border p-3 rounded text-base hh"
          />
        </div>
        
        <select
          name="status"
          value={editingMatch ? editingMatch.status : newMatch.status}
          onChange={handleInputChange}
          className="border p-3 rounded w-full text-base"
        >
          <option value={editingMatch? editingMatch.status : "N"}>{editingMatch? (editingMatch.status == "N" ? "Zaplanowany" : editingMatch.status == "Z" ? "Zakończony" :"W trakcie"): "Nowy"}</option>          
          <option value="N" hidden={editingMatch?.status === "N"}>Zaplanowany</option>
          <option value="T" hidden={editingMatch?.status === "T"}>W trakcie</option>
          <option value="Z" hidden={editingMatch?.status === "Z"}>Zakończony</option>
        </select>

        {/* Add or Edit Match Button */}
        <button
          onClick={editingMatch ? handleEditMatch : handleAddMatch}
          className="border p-3 rounded btn-success text-base font-semibold"
        >
          {editingMatch ? "Zapisz Edycję" : "Dodaj Mecz"}
        </button>
        {editingMatch && (
          <button
            onClick={() => setEditingMatch(null)}
            className="border p-3 rounded btn-secondary text-base"
          >
            Anuluj
          </button>
        )}
      </div>
      </div>
            
      {/* Add Team */}
      <h2 className="text-lg sm:text-xl font-bold mt-6 mb-4 text-center">Dodaj Drużynę</h2>
      <div className="flex flex-col space-y-3 max-w-2xl mx-auto">
        <input
          type="text"
          value={newTeamName}
          onChange={(e) => setNewTeamName(e.target.value)}
          placeholder="Nazwa Drużyny"
          className="border p-3 rounded w-full text-base"
        />
        <button
          onClick={handleAddTeam}
          className="border p-3 rounded btn-primary text-base font-semibold"
        >
          Dodaj Drużynę
        </button>
      </div>

      {/* Team List and Delete Team */}
      <div className="overflow-x-auto mt-4">
        <h2 className="text-base sm:text-lg font-bold mb-2 sm:mb-3 text-center">Drużyny</h2>
        <table className="min-w-full max-w-3xl mx-auto table-auto border-collapse text-xs sm:text-sm mb-3">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-1 sm:p-2">#</th>
              <th className="border p-1 sm:p-2">Nazwa Drużyny</th>
              <th className="border p-1 sm:p-2">Akcje</th>
            </tr>
          </thead>
          <tbody>
            {teamData
              .filter((team) => team.Name !== "undefined")
              .map((team, index) => (
                <tr key={team.Id}>
                  <td className="border p-1 sm:p-2 text-center">{index + 1}</td>
                  <td className="border p-1 sm:p-2">{team.Name}</td>
                  <td className="border p-1 sm:p-2 text-center">
                    <button 
                      className="btn btn-danger text-xs sm:text-sm px-2 py-1" 
                      onClick={() => handleDeleteTeam(team.Id)}
                    >
                      Usuń
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        
        {/* Generate Matches Button */}
        {teamData.length >= 2 && (
          <button
            onClick={handleGenerateMatches}
            className="w-full border p-3 rounded btn-success text-sm sm:text-base font-bold"
          >
            🎯 Generuj Wszystkie Mecze ({teamData.length * (teamData.length - 1) / 2} meczy)
          </button>
        )}
      </div>
        </>
      )}

    </div>


  );
};

export default Results;
