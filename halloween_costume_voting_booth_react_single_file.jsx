<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Voting Booth</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      text-align: center;
      background: #f5f7fa;
      padding: 40px;
    }
    h1 {
      color: #333;
    }
    .candidate {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.1);
      margin: 15px auto;
      padding: 20px;
      width: 280px;
      transition: transform 0.1s ease-in-out;
    }
    .candidate:hover {
      transform: scale(1.02);
    }
    button {
      margin-top: 10px;
      padding: 10px 18px;
      border: none;
      background-color: #007bff;
      color: white;
      border-radius: 8px;
      cursor: pointer;
      font-size: 16px;
    }
    button:hover {
      background-color: #0056b3;
    }
    .results {
      margin-top: 40px;
      background: #fff;
      padding: 20px;
      border-radius: 10px;
      width: 300px;
      margin-left: auto;
      margin-right: auto;
      box-shadow: 0 2px 6px rgba(0,0,0,0.1);
    }
  </style>
</head>
<body>
  <h1>Vote for Your Favorite!</h1>

  <div id="candidates"></div>

  <div class="results">
    <h2>Current Results</h2>
    <ul id="resultsList"></ul>
  </div>

  <script>
    const candidates = ["Serena", "Isa", "Kira", "Ellie", "Jessa"];

    // Initialize votes
    let votes = JSON.parse(localStorage.getItem("votes")) || {};
    candidates.forEach(name => {
      if (!(name in votes)) votes[name] = 0;
    });

    const container = document.getElementById("candidates");
    const resultsList = document.getElementById("resultsList");

    function updateResults() {
      resultsList.innerHTML = "";
      candidates.forEach(name => {
        const li = document.createElement("li");
        li.textContent = `${name}: ${votes[name]} vote${votes[name] !== 1 ? "s" : ""}`;
        resultsList.appendChild(li);
      });
    }

    function voteFor(name) {
      votes[name]++;
      localStorage.setItem("votes", JSON.stringify(votes));
      updateResults();
      alert(`Thanks for voting for ${name}!`);
    }

    candidates.forEach(name => {
      const div = document.createElement("div");
      div.className = "candidate";
      div.innerHTML = `
        <h2>${name}</h2>
        <button onclick="voteFor('${name}')">Vote</button>
      `;
      container.appendChild(div);
    });

    updateResults();
  </script>
</body>
</html>
