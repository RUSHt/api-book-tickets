export const state = {
    mobile: null,
    app: null,
    mobileX: null,
    content: [],
    events: [],
    event: null,
    name: '',
    email: '',
    currentContent: null,
    currentEvent: null,
    cartMessage: null,
    cartSticker: null,
    cartSVG: null
}

try {
    state.name = localStorage.getItem('name') || ''
    state.email = localStorage.getItem('email') || ''
} catch(e) {};