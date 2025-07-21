
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("requestsContainer");

  async function fetchRequests() {
    const res = await fetch("/api/requests");
    const requests = await res.json();

    container.innerHTML = "";

    if (requests.length === 0) {
      container.innerHTML = "<p>No pending requests.</p>";
      return;
    }

    requests.forEach((req, index) => {
      const div = document.createElement("div");
      div.classList.add("card");
      div.innerHTML = `
        <p><strong>From:</strong> ${req.from}</p>
        <p><strong>To:</strong> ${req.to}</p>
        <p><strong>Date:</strong> ${req.date}</p>
        <p><strong>Passengers:</strong> ${req.passengers}</p>
        <p><strong>Email:</strong> ${req.email}</p>
        <button class="approve">Booked</button>
        <button class="dismiss">Not Booked</button>
      `;

      div.querySelector(".approve").addEventListener("click", () => {
        handleAction(index, "approve");
      });

      div.querySelector(".dismiss").addEventListener("click", () => {
        handleAction(index, "dismiss");
      });

      container.appendChild(div);
    });
  }

  async function handleAction(index, action) {
    const res = await fetch("/api/approved-requests/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ index, action })
    });

    const result = await res.json();
    alert(result.message);
    fetchRequests(); // Refresh list
  }

  fetch("/api/past-requests")
  .then(res => res.json())
  .then(data => {
    const table = document.getElementById("pastRequestsTable").querySelector("tbody");
    table.innerHTML = "";

    data.forEach(req => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${req.from}</td>
        <td>${req.to}</td>
        <td>${req.date}</td>
        <td>${req.passengers}</td>
        <td>${req.email}</td>
        <td>${req.status}</td>
      `;
      table.appendChild(row);
    });
  })
  .catch(err => {
    console.error("Failed to load past requests:", err);
  });


  fetchRequests();
});
