// const square = function (x) {
//     return x * x
// }


// standard arrow function
// const square = (x) => {
//     return x * x
// }


// shorthand arrow function
// const square = (x) => x * x
// console.log(square(2))

const event = {
    name: "Birthday party",
    guestList: ['Andrew', 'Jen', 'Mike'],
    printGuestList() {
        console.log('Guest list for ' + this.name)
        this.guestList.forEach((guest) => {
            console.log(guest + ' is attending ' + this.name)
        })
    }
}

// if you make this an arrow function, it doesn't bind a this. property
event.printGuestList()