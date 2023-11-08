import { products } from "./products-accountId-startDate.js"
import { getTicket } from "./fetch-api.js";
import { state } from "./state.js";

const request = location.search.split('?').pop().split('&').reduce((p,search) => { const kv = search.split('='); p[kv[0]] = kv[1]; return p },{})

state.ticket = {
    url: `https://tkt.ticketus.net/new-ticket/${request.account}/${request.ticket}`,
    accountId: request.account,
    ticketId: request.ticket
}

console.log({ state })

getTicket({ accountId: state.ticket.accountId, ticketId: state.ticket.ticketId }).then(({ success, ticket }) => {
    console.log({ ticket });
    state.tickets = [ ticket ];
})

const showCartTickets = () => {
    
    state.mobileX.style.opacity = 1;
    
    if ( state.tickets.length == 0 ) {
        app.innerHTML = `<div><p style="text-align:center;margin:10px">Your basket is empty</p><p class="btn" style="margin:10px;width:calc(100% - 20px)">show me What's on</p></div>`
        return app.querySelector('.btn').addEventListener('click',showContent)
    }

    app.innerHTML = `<div id="tickets"></div>`
    makeTicketsHTML([ state.ticket ])
}

document.addEventListener('DOMContentLoaded',() => {

    const app = document.querySelector('#app')

    state.app = app;
    state.mobile = app.getBoundingClientRect().width < 650;

    if ( state.mobile ) {
        app.className = 'mobile';
        state.cartSticker = document.querySelector('.mobile-header #sticker')
        state.cartSVG = document.querySelector('.mobile-header .cart')
        state.mobileX = document.querySelector('.mobile-header .x')
        document.querySelector('.container').removeChild(document.querySelector('#tickets'));

        state.mobileX?.addEventListener('click',() => {
            if ( app.querySelector('.products') ) return showCartTickets();
            if ( app.lastApp?.classList.contains('contents') ) { app.lastApp = document.createElement('div'); return showContent() }
            if ( app.lastApp?.hasAttribute('content') ) { app.lastApp = document.createElement('div'); return showEvents(state.currentContent); };
            if ( app.lastApp?.hasAttribute('event') ) { const eventId = app.lastApp.getAttribute('event'); app.lastApp = document.createElement('div'); return showEvent(state.events.find(event => event.id == eventId)); } 
            if ( document.querySelector('.events') ) return showContent()
            if ( document.querySelector('book-event') ) return showEvents(state.currentContent);
        });

        state.cartSVG?.addEventListener('click',e => {
            app.lastApp = app.firstChild.cloneNode();
            showCartTickets();
        });
    }
})
