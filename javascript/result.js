const params = new URLSearchParams(window.location.search);
const from = params.get("from")?.match(/\((.*?)\)/)?.[1] || "NYCA";  // Default to NYCA (New York City)

const url = `https://flights-sky.p.rapidapi.com/flights/search-everywhere?fromEntityId=${from}&type=oneway`;

const options = {
  method: 'GET',
  headers: {
    'x-rapidapi-host': 'flights-sky.p.rapidapi.com',
    'x-rapidapi-key': '10a147a340msh35fb5580a99a1cdp145dc6jsn230915ba920e'
  }
};

async function fetchEverywhereFlights() {
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    console.log("API Data:", data);

    const results = document.getElementById("results");
    results.innerHTML = "";

    const quotes = data?.quotes;

if (!quotes || quotes.length === 0) {
  results.innerHTML = "<p>No flights found.</p>";
  return;
}

quotes.slice(0, 5).forEach(quote => {
  const div = document.createElement("div");
  div.className = "result";
  div.innerHTML = `
    <strong>Destination:</strong> ${quote.destination?.name || "Unknown"}<br/>
    <strong>City Code:</strong> ${quote.destination?.id || "N/A"}<br/>
    <strong>Price:</strong> ${quote.price?.formatted || "N/A"}<br/>
    <strong>Departure Date:</strong> ${quote.outboundLeg?.departureDate || "N/A"}<br/>
  `;
  results.appendChild(div);
});


  } catch (error) {
    console.error("Flights API error:", error);
    document.getElementById("results").innerHTML = "<p>Error fetching flights.</p>";
  }
}

fetchEverywhereFlights();

