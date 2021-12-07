interface Person {
    firstName: string;
    lastName: string;
}

function greeter(person: Person) {
    console.log( "Hello, " + person.firstName + " " + person.lastName)
}

let user = { firstName: "Jane", lastName: "User" };

greeter(user);