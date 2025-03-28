import React, { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import { updateCommitmentSum } from "../context/idb";

function generateRandomCommitmentArray(size) {
  const randomArray = [];
  for (let i = 0; i < size; i++) {
    randomArray.push(Math.floor(Math.random() * 9999));
  }
  return randomArray;
}

function CastVote() {
  const location = useLocation();
  const data = location.state?.data || {}; // Extract data
  const [voter, setVoter] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [votes, setVotes] = useState({}); // Stores selected candidates for each position
  const { CastVote } = useContext(AuthContext)

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

  const handleSubmit = async () => {
    console.log("Votes Submitted:", votes);
    // alert("Vote submitted successfully!");
  
    const randomCommitmentResult = [];
    const voteCommitmentResult = [];
    const summedCommitmentResult = [];
  
    // Process each position group
    for (const position in groupedCandidates) {
      // Create positionData object for random commitments
      const randomPositionData = {
        position: position,
        commitment: []
      };
      
      // Create positionData object for vote commitments (chosen candidates)
      const votePositionData = {
        position: position,
        commitment: []
      };
      
      // Check if there are candidates for this position
      if (groupedCandidates[position].length > 0) {
        // Get the chosen candidate ID for this position
        const chosenCandidateId = votes[position];
        
        // Generate random commitment for all candidates in this position
        const basisArraySize = groupedCandidates[position][0].basisArray.length;
        const randomCommitment = generateRandomCommitmentArray(basisArraySize);
        randomPositionData.commitment.push(randomCommitment);
        
        // Find the chosen candidate in the group
        const chosenCandidate = groupedCandidates[position].find(
          candidate => candidate.id === chosenCandidateId
        );
        
        // If a candidate was chosen for this position, add their commitment (basis + random)
        if (chosenCandidate) {
          // Add the random commitment and basis array values together
          const combinedCommitment = chosenCandidate.basisArray.map((basisValue, index) => {
            // Make sure we don't go out of bounds of the random commitment array
            const randomValue = index < randomCommitment.length ? randomCommitment[index] : 0;
            return basisValue + randomValue; // Add the values at corresponding indices
          });
          
          votePositionData.commitment.push(combinedCommitment);
          try {
            await updateCommitmentSum(position, randomCommitment);
            console.log(`Sum updated in IndexedDB for position: ${position}`);
          } catch (error) {
            console.error(`Error updating sum in IndexedDB for position: ${position}`, error);
          }
        }
      }
      
      // Add the position data to both result arrays
      randomCommitmentResult.push(randomPositionData);
      voteCommitmentResult.push(votePositionData);
    }
    
    console.log("Random Commitment Result:", randomCommitmentResult);
    console.log("Vote Commitment Result:", voteCommitmentResult);
    
    // Create the final object to send to CastVote
    const finalVoteData = {
      voterId: voter?.id,
      commitments: voteCommitmentResult // Only send the vote commitment result
    };
    
    console.log("Final Vote Data to Send:", finalVoteData);
    
    // Uncomment when ready to submit
    await CastVote(finalVoteData);
    
    return;
  };

  const groupedCandidates = candidates.reduce((acc, candidate) => {
    acc[candidate.position] = acc[candidate.position] || [];
    acc[candidate.position].push(candidate);

    return acc;
  }, {});
  console.log(groupedCandidates);

  return (
    <div className="p-4 max-w-lg mx-auto bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">Cast Your Vote</h2>

      {Object.entries(groupedCandidates).map(([position, candidates]) => (
        <div key={position} className="mb-6 p-4 border rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">{position.replace(/_/g, " ")}</h3>
          {candidates.map((candidate) => (
            <div key={candidate.id} className="flex items-center space-x-4 mb-2">
              <img
                src={"https://images.wallpapersden.com/image/ws-daredevil-born-again-4k-backdrop_93147.jpg"}
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
