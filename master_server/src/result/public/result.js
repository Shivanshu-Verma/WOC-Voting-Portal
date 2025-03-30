async function fetchResults() {
    try {
        const response = await fetch("/results");
        const data = await response.json();

        if (!data.success) {
            document.body.innerHTML = "<h2>Error fetching results.</h2>";
            return;
        }

        const resultsTable = document.getElementById("results-table");
        resultsTable.innerHTML = "";

        data.results.forEach(result => {
            const position = result.position;
            const votes = result.result_vector.split(",");

            votes.forEach((voteCount, index) => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${position}</td>
                    <td>Candidate ${index + 1}</td>
                    <td>${voteCount}</td>
                `;
                resultsTable.appendChild(row);
            });
        });

    } catch (error) {
        console.error("Error fetching results:", error);
    }
}

window.onload = fetchResults;
