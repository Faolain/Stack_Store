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
// var getCurrentBookData = function () {
//     return q.ninvoke(Animal, 'find', {});
// };

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
// var seedBooks = function () {

//     var books = [
//         {
//             title: 'Harry Potter and Prisoner of Azkaban',
//             author: 'Rowling, J.K',
//             ISBN: 9780747545927,
//             yearPublished: 2002,
//             Publisher: 'Bloomsbury Publishing PLC',
//             Language: 'English',
//             genre: 'Young Adult',
//             //seller: 'Ben',
//             price: 3.99
//         },
//         {
//             title: 'Beyond Good and Evil',
//             author: 'Nietzsche, Friedrich',
//             ISBN: 9780394703374,
//             yearPublished: 1966,
//             Publisher: 'Vintage',
//             Language: 'English',
//             genre: 'Classics',
//            // seller: "Philosopher's Books",
//             price: 7.99
//         },
//         {
//             title: 'Crime and Punishment',
//             author: 'Dostoyevsky, Fyodor',
//             ISBN: 9780486454115,
//             yearPublished: 2000,
//             Publisher: 'Wordsworth',
//             Language: 'English',
//             genre: 'Classics',
//             //seller: "Philosopher's Books",
//             price: 7.99
//         },
//         {
//             title: 'Infinite Jest',
//             author: 'Wallace, David Foster',
//             ISBN: 0316920045,
//             yearPublished: 1991,
//             Publisher: 'Little, Brown and Company',
//             Language: 'English',
//             genre: 'Contemporary Classics',
//             //seller: "Philosopher's Books",
//             price: 12
//         },
//         {
//             title: 'Einstein: His Life and Universe',
//             author: 'Isaacson, Walter',
//             ISBN: 124943290045,
//             yearPublished: 2003,
//             Publisher: 'Penguin',
//             Language: 'English',
//             genre: 'Autobiography',
//             //seller: "Scientist Paperbacks",
//             price: 11
//         }
//     ];

//     return q.invoke(Book, 'create', books);

// };

connectToDb.then(function () {
    // getCurrentBookData().then(function (books) {
    //     if (books.length === 0) {
    //         return seedBooks();
    //     } else {
    //         console.log(chalk.magenta('Seems to already be book data, exiting!'));
    //         process.kill(0);
    //     }
    // }).then(function () {
    //     console.log(chalk.green('Seed successful!'));
    //     process.kill(0);
    // }).catch(function (err) {
    //     console.error(err);
    //     process.kill(1);
    // });
    getCurrentUserData().then(function (users) {
        if (users.length === 0) {
            return seedUsers();
        } else {
            console.log(chalk.magenta('Seems to already be user data, exiting!'));
            process.kill(0);
        }
    }).then(function (users) {
        console.log(chalk.green('Seed successful!'));
        console.log(users);
        process.kill(0);
    }).catch(function (err) {
        console.error(err);
        process.kill(1);
    });

});