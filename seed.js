/*

This seed file is only a placeholder. It should be expanded and altered
to fit the development of your application.

It uses the same file the server uses to establish
the database connection:
--- server/db/index.js

The name of the database used is set in your environment files:
--- server/env/*

This seed file has a safety check to see if you already have users
in the database. If you are developing multiple applications with the
fsg scaffolding, keep in mind that fsg always uses the same database
name in the environment files.

Refer to the q documentation for why and how q.invoke is used.

*/

var mongoose = require('mongoose');
var connectToDb = require('./server/db');
var User = mongoose.model('User');
var Animal = mongoose.model('Animal');



var q = require('q');
var chalk = require('chalk');

var getCurrentUserData = function () {
    return q.ninvoke(User, 'find', {});
};
var getCurrentAnimalData = function () {
    return q.ninvoke(Animal, 'find', {});
};

var seedUsers = function () {

    var users = [
        {
            email: 'testing@fsa.com',
            password: 'password'
        },
        {
            email: 'obama@gmail.com',
            password: 'potus'
        }
    ];

    return q.invoke(User, 'create', users);

};
var seedAnimals = function () {

    var animals = [
        {
            name: "Madagascar Hissing Cockroach",
            specie: 'String',
            rarity: 'Abundant',
            height: 2,
            weight: 0.01,
            price: 3,
            imgUrl: "http://www.hoglezoo.org/wp-content/themes/hoglezoo/images/animal_finder/HissingCockroach11.jpg"

        },
         {
            name: "Tarantula",
            specie: "Anthropod",
            rarity: 'Abundant',
            height: 2,
            weight: 0.1,
            price: 15,
            imgUrl: "http://static0.therichestimages.com/cdn/1077/718/90/cw/wp-content/uploads/2014/05/Pet-Tarantulas-51.jpg"

        },
         {
            name: "Emperor Scorpions",
            specie: "Anthropod",
            rarity: 'Abundant',
            height: 2,
            weight: 2,
            price: 20,
            imgUrl: "http://static4.therichestimages.com/cdn/1024/768/90/cw/wp-content/uploads/2014/05/11b3d5t1.jpg"

        },
         {
            name: "Bearded Dragon",
            specie: "Reptile",
            rarity: 'Abundant',
            height: 4,
            weight: 3,
            price: 100,
            imgUrl: "http://a-z-animals.com/media/animals/images/original/bearded_dragon1.jpg"

        },
         {
            name: "Sugar Glider",
            specie: "Marsupial",
            rarity: 'Abundant',
            height: 15,
            weight: 1.5,
            price: 22.50,
            imgUrl: "http://www.drsfostersmith.com/images/Articles/a-2175-glider.jpg"

        },
        {
            name: "Skunk",
            specie: 'Mammal',
            rarity: 'Abundant',
            height: 10,
            weight: 8,
            price: 500,
            imgUrl: "http://fusion.ddmcdn.com/kids/uploads/skunk-smell-300.jpg"

        },
        {
            name: "Capybaras",
            specie: 'Rodent',
            rarity: 'Abundant',
            height: 40,
            weight: 40,
            price: 600,
            imgUrl: "http://a-z-animals.com/media/animals/images/original/capybara5.jpg"

        },
         {
            name: "Toucan",
            specie: 'Bird',
            rarity: 'Rare',
            height: 22,
            weight: 7.6,
            price: 8000,
            imgUrl: "http://www.toucansworld.com/uploads/3/0/1/3/3013606/3703068_orig.jpg?374"

        },
        {
            name: "Kinkajou",
            specie: 'Mammal',
            rarity: 'Rare',
            height: 33,
            weight: 50,
            price: 2000,
            imgUrl: "http://static3.therichestimages.com/cdn/920/702/90/cw/wp-content/uploads/2014/05/kinkajou.jpg"

        },
        {
            name: "Chimpanzee",
            specie: "Primate",
            rarity: 'Rare',
            height: 80 ,
            weight: 80,
            price: 60000,
            imgUrl: "http://pin.primate.wisc.edu/fs/sheets/images/96lg.jpg"

        },
        {
            name: "Hedgehog",
            specie: "Rodent",
            rarity: 'Abundant',
            height: 10,
            weight: 2.5,
            price: 300,
            imgUrl: "http://static2.therichestimages.com/cdn/1077/718/90/cw/wp-content/uploads/2014/05/bigstock-Hedgehog-27722525.jpg"

        },
        {
            name: "Serval",
            specie: "Cat",
            rarity: 'Rare',
            height: 50,
            weight: 25,
            price: 2500,
            imgUrl: "http://static5.therichestimages.com/cdn/1077/695/90/cw/wp-content/uploads/2014/05/savannah_cat-serval-cat1.jpg"

        },
        {
            name: "Wallaby",
            specie: 'Marsupial',
            rarity: 'Abundant',
            height: 80,
            weight: 60,
            price: 3000,
            imgUrl: "http://static0.therichestimages.com/cdn/1077/718/90/cw/wp-content/uploads/2014/05/bigstock-Female-Agile-Wallaby-Macropus-70557547.jpg"

        },
        {
            name: "Squirrel Monkey",
            specie: "Primate",
            rarity: 'Abundant',
            height: 35,
            weight: 12,
            price: 8000,
            imgUrl: "http://static9.therichestimages.com/cdn/792/993/90/cw/wp-content/uploads/2014/05/squirrel-monkey-png1.jpg"

        },
         {
            name: "Hyacinth Macaw",
            specie: 'Parrot',
            rarity: 'Scarce',
            height: 40,
            weight: 7,
            price: 12000,
            imgUrl: "http://static6.therichestimages.com/cdn/1077/868/90/cw/wp-content/uploads/2014/05/bigstock-HYACINTH-MACAW-777524.jpg"

        },
    ];

    return q.invoke(Animal, 'create', books);

};

connectToDb.then(function () {
    getCurrentAnimalData().then(function (animals) {
        if (animals.length === 0) {
            return seedAnimals();
        } else {
            console.log(chalk.magenta('Seems to already be Animal data, exiting!'));
            process.kill(0);
        }
    }).then(function () {
        console.log(chalk.green('Seed successful!'));
        process.kill(0);
    }).catch(function (err) {
        console.error(err);
        process.kill(1);
    });
    // getCurrentUserData().then(function (users) {
    //     if (users.length === 0) {
    //         return seedUsers();
    //     } else {
    //         console.log(chalk.magenta('Seems to already be user data, exiting!'));
    //         process.kill(0);
    //     }
    // }).then(function (users) {
    //     console.log(chalk.green('Seed successful!'));
    //     console.log(users);
    //     process.kill(0);
    // }).catch(function (err) {
    //     console.error(err);
    //     process.kill(1);
    // });
    
});