var searchInputEl = document.querySelector("#city-search-form");
var searchBtnEl = document.querySelector("#search-btn");
var searchFormEl = document.querySelector("#search-form")
var recentSearchContainerEl = document.querySelector(".list-group");

var cityNameDateEl = document.querySelector("#current-city-name");
var weatherIconEl = document.querySelector("#weather-icon")
var currentTempEl = document.querySelector("#current-temp");
var currentHumidEl = document.querySelector("#current-humidity");
var currentWindEl = document.querySelector("#current-wind");
var currentUVEl = document.querySelector("#current-uv"); 

var forcastContainerEl = document.querySelector(".card-container");

var recentSearches = [];

function requestLocationData(city,mode) {
    var apiURL = 'https://api.openweathermap.org/data/2.5/weather?q='+city+'&units=imperial&appid=73bbe9fce522b99dedb80981378d1b0b';
    fetch(apiURL).then(function(response) {
        //if fetch is successful add the city name to the recent serches array and save to local storage
        if (response.ok) {
            //if function is run from click event in recent searches, dont add city to list and local stroage
            if (!mode) {
                recentSearches.push(city);
                saveSearch(recentSearches);
                //Update the recent searches sidebar and empty form value
                createRecentSearches();
                searchInputEl.value = "";
            }
            else {
                searchInputEl.value = "";
            }
            response.json().then(function(locationData) {
              console.log(locationData);
              requestWeatherData(locationData);
            });
          } 
          else {
            alert("Error: " + response.statusText);
            searchInputEl.value = "";
          }
        })
        .catch(function(error) {
          alert("Unable to connect");
          searchInputEl.value = "";
        });
      };

var requestWeatherData = function(data) {
    var lat = data.coord.lat;
    var lon = data.coord.lon;
    cityNameDateEl.textContent = data.name + " - " + moment().format('MMMM Do YYYY');

    fetch('https://api.openweathermap.org/data/2.5/onecall?lat='+lat+'&lon='+lon+'&exclude=minutely,hourly,alerts&units=imperial&appid=73bbe9fce522b99dedb80981378d1b0b')
    .then(function(response) {
        if (response.ok) {
            response.json().then(function(weatherData) {
                displayCurrentWeatherData(weatherData);
                displayForcastWeatherData(weatherData);
            });
          } 
          else {
            alert("Error: " + response.statusText);
          }
        })
        .catch(function(error) {
          // Notice this `.catch()` getting chained onto the end of the `.then()` method
          alert("Unable to connect");
        });
};

var displayCurrentWeatherData = function(weatherData) {
    weatherIconEl.setAttribute("src", "http://openweathermap.org/img/wn/" + weatherData.current.weather[0].icon + "@2x.png");
    weatherIconEl.classList.remove("weather-icon-hidden");
    weatherIconEl.classList.add("weather-icon");
    console.log(weatherData);
    currentTempEl.textContent = Math.round(weatherData.current.temp);
    currentHumidEl.textContent = weatherData.current.humidity;
    currentWindEl.textContent = weatherData.current.wind_speed;
    
    currentUVEl.textContent = weatherData.current.uvi
    var uv = weatherData.current.uvi;
    if (uv >0 && uv <=3){
        currentUVEl.className = "badge bg-success text-white";
    }
    else if (uv>3 && uv<=8) {
        currentUVEl.className = "badge bg-warning text-white";
    }
    else if (uv>8) {
        currentUVEl.className = "badge bg-danger text-white";
    }
};

var displayForcastWeatherData = function(weatherData) {
    console.dir(forcastContainerEl);
    
    for (var i=0; i<forcastContainerEl.children.length; i++) {
        var forecastDateEl = document.querySelector("#title-day-"+(i+1));
        forecastDateEl.textContent = moment.unix(weatherData.daily[i].dt).format('L');

        var weatherIconEl = document.querySelector("#weather-icon-"+(i+1));
        weatherIconEl.setAttribute("src", "http://openweathermap.org/img/wn/" + weatherData.daily[i].weather[0].icon + "@2x.png");
        weatherIconEl.classList.remove("weather-icon-hidden");
        weatherIconEl.classList.add("weather-icon");

        var forecastTempEl = document.querySelector("#temp-day-"+(i+1));
        forecastTempEl.textContent = Math.round(weatherData.daily[i].temp.day);
        var forecastHumidityEL = document.querySelector("#humidity-day-"+(i+1));
        forecastHumidityEL.textContent = weatherData.daily[i].humidity;
    };
};

var loadSearches = function() {
    recentSearches = JSON.parse(localStorage.getItem("recentSearches"));
    if (!recentSearches){
        recentSearches = [];
    }
    else {
        createRecentSearches();
    }
};

var saveSearch = function(recentSearches) {
    localStorage.setItem("recentSearches", JSON.stringify(recentSearches));
};

var createRecentSearches = function() {
    //clear existing list
    var child = recentSearchContainerEl.lastChild;
    while (child){
        recentSearchContainerEl.removeChild(child);
        child = recentSearchContainerEl.lastChild;
    }

    //create new list starting with most recent search first
    if (recentSearches.length < 8){
        for (var i=recentSearches.length-1; i>-1; i--) {
            var recentSearchEl = document.createElement("li");
            recentSearchEl.classList = "list-group-item";
            recentSearchEl.textContent = recentSearches[i];
            recentSearchContainerEl.appendChild(recentSearchEl);
        };
    }
    else {
        for (var i=recentSearches.length-1; i>recentSearches.length-9; i--) {
            var recentSearchEl = document.createElement("li");
            recentSearchEl.classList = "list-group-item";
            recentSearchEl.textContent = recentSearches[i];
            recentSearchContainerEl.appendChild(recentSearchEl);
        };
    }
};
var formSubmitHandler = function(event){
    event.preventDefault();
    var city = searchInputEl.value.trim();

    if (city) {
        var fromClick = false;
        requestLocationData(city,fromClick);
    }
    else {
        alert("Please enter a city name only");
    }
};

var recentSearchClickHandler = function(event) {
    event.preventDefault();
    var city = event.target.innerText;
    var fromClick = true;
    requestLocationData(city,fromClick);
};

searchFormEl.addEventListener("submit", formSubmitHandler);
recentSearchContainerEl.addEventListener("click", recentSearchClickHandler);

loadSearches();
