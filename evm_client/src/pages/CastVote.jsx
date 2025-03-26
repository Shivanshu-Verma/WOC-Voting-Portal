import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

function CastVote() {
  const location = useLocation();
  const data = location.state?.data || {}; // Extract data
  const [voter, setVoter] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [votes, setVotes] = useState({}); // Stores selected candidates for each position

  useEffect(() => {
    if (data) {
      setVoter(data.voter);
      setCandidates(data.candidateInformation || []);
    }
  }, []);

  // Handle vote selection
  const handleVote = (position, candidateId) => {
    setVotes((prevVotes) => ({
      ...prevVotes,
      [position]: candidateId, // Store selected candidate per position
    }));
  };

  const handleSubmit = () => {
    console.log("Votes Submitted:", votes);
    alert("Vote submitted successfully!");
  };

  // Group candidates by position
  const groupedCandidates = candidates.reduce((acc, candidate) => {
    acc[candidate.position] = acc[candidate.position] || [];
    acc[candidate.position].push(candidate);
    return acc;
  }, {});

  return (
    <div className="p-4 max-w-lg mx-auto bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">Cast Your Vote</h2>

      {Object.entries(groupedCandidates).map(([position, candidates]) => (
        <div key={position} className="mb-6 p-4 border rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">{position.replace(/_/g, " ")}</h3>
          {candidates.map((candidate) => (
            <div key={candidate.id} className="flex items-center space-x-4 mb-2">
              <img
                src={candidate.imageUrl || "https://via.placeholder.com/50"}
                alt={candidate.name}
                className="w-12 h-12 rounded-full border"
              />
              <span className="text-md font-medium">{candidate.name}</span>
              <input
                type="radio"
                name={position}
                value={candidate.id}
                checked={votes[position] === candidate.id}
                onChange={() => handleVote(position, candidate.id)}
              />
            </div>
          ))}
        </div>
      ))}

      <button
        onClick={handleSubmit}
        className="w-full bg-blue-500 text-white px-4 py-2 rounded mt-4 hover:bg-blue-700"
      >
        Submit Vote
      </button>
    </div>
  );
}

export default CastVote;
