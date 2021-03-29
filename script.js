let lat;
let lon;
let uvLevels = ['green', 'green', 'green', 'gold', 'gold', 'gold', 'orange', 'orange', 'red', 'red', 'red']
let storedCities = [];
let isHistory = false;

let renderHistory = () => {
    $('#past-searches').empty();
    $('#clear').empty();
    storedCities.forEach((value) => {
        let nameBtn = $(`<button class="history button expanded" type="button" data-name="${value}">`).text(value);
        $('#past-searches').append(nameBtn);
    })
    if (storedCities.length) {$('#clear').append($(`<button class="button hollow expanded history-clear" type="button">`).text(`Clear search history`))}
}
let storeSearches = (newCity) => {
    if (isHistory && storedCities.includes(newCity)) {
        storedCities =  storedCities.filter((value) => { return value !== newCity})
    }
    if (isHistory) {
        storedCities.unshift(newCity)
    } else { 
        storedCities = [newCity]
        isHistory = true;
    }
    renderHistory();
    localStorage.setItem('cityHistory', JSON.stringify(storedCities))
}

let getUv = () => {
    let urlKey = `https://api.openweathermap.org/data/2.5/uvi?appid=40d52f9a261f5b382486671fc4c96cea&lat=${lat}&lon=${lon}`
    $.ajax({
        url: urlKey,
        method: 'GET'
    }).then(function (response) {
        $('#current-weather').append($('<div class="cell shrink" id="index-div">').text(`UV Index:`));
        let uvValueDiv = $(`<div class="cell shrink" id="index">`).text(response.value)
        $('#current-weather').append(uvValueDiv);
        if (Math.floor(response.value) < 11) {
            uvValueDiv.css('background-color', uvLevels[Math.floor(response.value)])
        } else { uvValueDiv.css('background-color', 'purple') }
        uvValueDiv.css('color', 'white')
    })
}

let getForecast = () => {
    let urlKey = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=40d52f9a261f5b382486671fc4c96cea&units=imperial`
    $.ajax({
        url: urlKey,
        method: 'GET'
    }).then(function (response) {
            $('#forecast-title').append($('<br>'))
            $('#forecast-title').append($('<h3>').text(`5-Day Forecast:`))
        for (i = 0; i < 5; i++) {
            let cardDiv = $('<div class="cell large-auto">')
            let card = $('<div class="card forecast">');
            cardDiv.append(card)
            card.append($('<h4 class="h5 card-divider">').text(moment.unix(response.daily[i].dt).format("MM/DD/YYYY")));
            let cardSection = $('<div class="card-section">')
            card.append(cardSection)
            cardSection.append($(`<img src="http://openweathermap.org/img/w/${response.daily[i].weather[0].icon}.png">`));
            cardSection.append($('<p>').text(`Temp: ${response.daily[i].temp.day}\xB0F`));
            cardSection.append($('<p>').text(`Humidity: ${response.daily[i].humidity}%`));
            $('#forecast').append(cardDiv);
        }
    })
}

let getCurrent = (cityName) => {
    let urlKey = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=40d52f9a261f5b382486671fc4c96cea&units=imperial`
    $.ajax({
        url: urlKey,
        method: 'GET'
    }).then(function (response) {

        lat = response.coord.lat;
        lon = response.coord.lon;
        $('#current-weather').empty();
        let cityTitle = $('<div class="cell shrink">')
        let cityH2 = $('<h2>').text(`${cityName} (${moment().format('MM')}/${moment().format('DD')}/${moment().format('YYYY')})`);
        cityTitle.append(cityH2)
        $('#current-weather').append(cityTitle);
        let icon = $(`<img src="http://openweathermap.org/img/w/${response.weather[0].icon}.png">`);
        $('#current-weather').append(icon);
        $('#current-weather').append($('<div class="cell">').text(`Temperature: ${response.main.temp} \xB0F`));
        $('#current-weather').append($('<div class="cell">').text(`Humidity: ${response.main.humidity}%`));
        $('#current-weather').append($('<div class="cell">').text(`Wind speed: ${response.wind.speed} MPH`));
        getUv();
        getForecast();    
    })

}

storedCities = JSON.parse(localStorage.getItem('cityHistory'))
if (storedCities) {
    isHistory = true;
    storedCities = JSON.parse(localStorage.getItem('cityHistory'))
    renderHistory();
    getCurrent(storedCities[0]);
} 

$('#search').click((event) => {
    event.preventDefault();
    let inputCity = $('#city-search').val();
    $('#city-search').val('');
    if (inputCity) {
        $('#current-weather').empty();
        $('#forecast-title').empty();
        $('#forecast').empty();
        getCurrent(inputCity);
        storeSearches(inputCity);
    }
})

$(document).on("click", ".history", function () {
    let chosenCity = $(this).attr('data-name')
    $('#current-weather').empty();
    $('#forecast-title').empty();
    $('#forecast').empty();
    getCurrent(chosenCity);
})

$(document).on("click", ".history-clear", function () {
    $('#past-searches').empty();
    storedCities = [];
    localStorage.setItem('cityHistory', JSON.stringify(storedCities));
})
