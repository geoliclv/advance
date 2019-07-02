interface Person {
    firstname: string;
    lastname: string;
}
function greeter(person: Person) {
    return "Hello, " + person;
}

let user = { firstname: 'name', lastname: 'true' };

document.body.innerHTML = greeter(user);