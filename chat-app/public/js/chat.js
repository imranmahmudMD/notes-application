const socket = io()

// variables for elements we are using. $ indicates its from DOM
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = document.querySelector('input')
const $messageFormButton = document.querySelector('button')
const $locationShareButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#url-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

// Autoscrolling
const autoscroll = () => {
    // Get new message element
    const $newMessage = $messages.lastElementChild

    // Height of new message, plus margins
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // visible height
    const visibleHeight = $messages.offsetHeight

    // get total height of messages container
    const containerHeight = $messages.scrollHeight

    // how far down have we actually scrolled? measure from top of scroll (distance between 
    // top of content and top of scroll bar) and add on scrolle bar height (visible height of container).
    // this tells us how far from the bottom we are!
    const scrollOffset = $messages.scrollTop + visibleHeight
    
    // check if we were at the bottom before the new message was added
    if (containerHeight - newMessageHeight <= scrollOffset) {
        // how far down are we? = all the way down
        $messages.scrollTop = $messages.scrollHeight
    }
}

// Client listening in for 'message'
socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

// Client listening in for 'locationMessage'
socket.on('locationMessage', (message) => {
    const html = Mustache.render(locationMessageTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

// Listen for changes in room members
socket.on('roomData', ({ room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})


// when you listen to form, choose "submit" to capture the form submission, and "e" becomes the event arguemtn
document.querySelector('#message-form').addEventListener('submit', (e) => {
        e.preventDefault()
        
        // this line of code disables the form when submitted
        $messageFormButton.setAttribute('disabled', 'disabled')
        
        // look for e, then the target which is the form, and then the element named "message"
        const message = e.target.elements.message.value
        
        // emit the message
        socket.emit('sendMessage', message, (error) => {
        
        // enable the button again
        $messageFormButton.removeAttribute('disabled')
        
        // clear the string
        $messageFormInput.value = ''
        
        // move curser inside
        $messageFormInput.focus()
            
            if (error){
                return console.log(error)
            }        
            console.log("Message delivered")
        })
})

$locationShareButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.')
    }

    //disable button once determined user has position capability in browser
    $locationShareButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, (error) => {
            console.log("Location shared")
             //enable button
            $locationShareButton.removeAttribute('disabled', 'disabled')
        })
    })
})

// if there is an error, infor user and redirect them to the root of the site. 
socket.emit('join', { username, room }, (error) => {
    if(error) {
        alert(error)
        location.href = '/'
    }
})