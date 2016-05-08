app.factory('RandomGreetings', function () {

    var getRandomFromArray = function (arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    };

    var greetings = [
        'Because everyone loves waiting in line',
        "What's Shutterstock?",
        'No screaming babies here',
        "I'm new here. Can you introduce me to all your friends?"
    ];

    return {
        greetings: greetings,
        getRandomGreeting: function () {
            return getRandomFromArray(greetings);
        }
    };

});
