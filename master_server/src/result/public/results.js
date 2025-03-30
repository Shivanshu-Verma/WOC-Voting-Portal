async function fetchResults() {
  try {
    const response = await fetch("/results");
    const data = await response.json();

    console.log("Results data:", data); // Debugging line

    if (!data.success) {
      document.body.innerHTML = "<h2>Error fetching results.</h2>";
      return;
    }

    const resultsTable = document.getElementById("results-table");
    resultsTable.innerHTML = "";

    data.results.forEach((result) => {
      const position = result.position;
      const candidates = [result]; // Wrap each result in an array // Assuming this contains detailed candidate info

      candidates.forEach((candidate) => {
        const row = document.createElement("tr");
        row.innerHTML = `
                    <td>${position}</td>
                    <td>${candidate.candidateName}</td>
                    <td>${candidate.votes}</td>
                `;
        resultsTable.appendChild(row);
      });
    });
  } catch (error) {
    console.error("Error fetching results:", error);
  }
}

window.onload = fetchResults;
