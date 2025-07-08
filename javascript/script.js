// Set the minimum selectable date to today
(function enforceMinDate() {
    const dateInput = document.getElementById("date");
    const today = new Date().toISOString().split("T")[0];
    dateInput.min = today;
  })();
  
  // Simple handler to “process” the booking
  document.getElementById("bookingForm").addEventListener("submit", (e) => {
    e.preventDefault();
  
    const from = e.target.from.value.trim();
    const to = e.target.to.value.trim();
    const date = e.target.date.value;
    const pax = e.target.passengers.value;
  
    // Basic validation
    if (from == to) {
      return showMessage("Departure and arrival airports must be different.");
    }
  
    const options = { year: "numeric", month: "long", day: "numeric" };
    const niceDate = new Date(date).toLocaleDateString(undefined, options);
  
    showMessage(
      `🛫 Searching flights from <strong>${from}</strong> to <strong>${to}</strong>
       on <strong>${niceDate}</strong> for <strong>${pax}</strong> passenger(s)…`
    );
  
    // This is where you'd call an API, etc.

    

  });
  function showMessage(msg) {
    const out = document.getElementById("output");
    out.innerHTML = msg;
  }


const fromInput = document.getElementById("from");
const toInput = document.getElementById("to");
const fromSuggestions = document.getElementById("fromSuggestions");
const toSuggestions = document.getElementById("toSuggestions");


//replace this with API later
async function fetchAirportSuggestions(query) {
  const sampleAirports = [
    "DEL – Indira Gandhi Intl (DEL)",
    "BOM – Chhatrapati Shivaji Intl (BOM)",
    "BLR – Kempegowda Intl (BLR)",
    "HYD – Rajiv Gandhi Intl (HYD)",
    "MAA – Chennai Intl (MAA)",
    "LHR – London Heathrow (LHR)",
    "DXB – Dubai Intl (DXB)",
    "JFK – New York JFK (JFK)"
  ];
  return sampleAirports.filter(name => name.toLowerCase().includes(query.toLowerCase())
);
  
}

(function showSuggestions(inputElement, suggestionsElement, query){
  fetchAirportSuggestions(query).then(suggestions  => {
    suggestionsElement.innerHTML = "";
    suggestions.forEach(suggestion => {
      const li = document.createElement("li");
      li.textContent = suggestion;
      li.addEventListener("click", () => {
        inputElement.value = suggestion;
        suggestionsElement.innerHTML = "";
      });
      suggestionsElement.appendChild(li);
    });
  });
})();

fromInput.addEventListener("input", ()=>{
  showSuggestions(fromInput, fromSuggestions, fromInput.value);
});

toInput.addEventListener("input", ()=>{
  showSuggestions(toInput, toSuggestions, toInput.value);
});

document.getElementById("bookingForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const from = fromInput.value.trim();
  const to = toInput.value.trim();
  const date = document.getElementById("date").value;
  const passengers = document.getElementById("passengers").value;
  
  if (from && to && date && passengers){
    const searchParams = new searchParams;
    from, 
    to,
    date,
    passengers
  }
});
window.location.href = 'result.js?${searchParams.toString()}';
