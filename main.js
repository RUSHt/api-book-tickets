import { getContent, getEvents, getSessionTickets, completeTicketsPurchase } from "./fetch-api.js"

const products  = [ { _id: 'a', title: "Curly Fries", price: 3.75 }, { _id: 'b', title: "Meat Platter", price: 9.75 }, { _id: 'c', title: "Salted Popcorn", price: 3.95 }, { _id: 'd', title: "Chocolate Buttons", price: 3.5 } ]
const accountId = '02sxk0vxanh'
const startDate = '2023/06/01'

const displayTickets = tickets => {
    
    document.body.appendChild(tickets.reduce((p,ticket) => { p.innerHTML += `<div style="border:1px solid #c0c0c0"><img src="${ticket.url}" style="width:300px;margin:5px"/><p class="add-items" style="background-color:#32a89b;color:white;margin:5px;line-height:2;font-size:20px;text-align:center;font-family:sans-serif">add to ticket</p></div>`; return p },Object.assign(document.createElement('div'),{ style: 'width:100vw;height:100vh;position:fixed;display:flex;justify-content:space-around;left:0px;top:0px;align-items:center', id: 'final-tickets' })));
            
    document.querySelectorAll('.add-items').forEach((btn,i) => {
        btn.addEventListener('click',() => location.href = 'http://'+location.host+`/add-items.html?account=${accountId}&ticket=${tickets[i].ticketId}`)
    })

    document.body.querySelector('#final-tickets').addEventListener('click',e => document.body.removeChild(document.querySelector('#final-tickets')));

}

const state = {
    content: [],
    events: [],
    event: null,
    name: '',
    email: ''
}

setTimeout(async () => {
    //state.setSession({ id: 'eh4xrt8iszpowjdzlxzhf0vf', _id: '6548bea6bab05635adbf9492' });
    //state.setSession({}); // clear session
    const { update, success, tickets } = await getSessionTickets({ session: { _id: '6548bea6bab05635adbf9492', id: 'eh4xrt8iszpowjdzlxzhf0vf' }, accountId })
    console.log('setSession',{ tickets, update, success })
},5000)

try {
    state.name = localStorage.getItem('name') || ''
    state.email = localStorage.getItem('email') || ''
} catch(e) {};

const addX = (cB) => app.appendChild(Object.assign(document.createElement('div'),{ className: 'x' })).addEventListener('click',cB);

const showContent = () => {
    
    state.currentContent = false;
    state.currentEvent = false;

    if ( state.mobile ) {
        state.mobileX.style.opacity = 0
        document.querySelector('.mobile-header .title').innerHTML = `<p class="title">What's on</p>`
    }
    
    app.innerHTML = `<div class="contents ${state.mobile ? 'mobile' : ''}">${state.content.map(content => `<div class="content" id="${content.id}"><img src="${content.oneSheet}" /><div><p>${content.title}</p></div></div>`).join('')}</div>`;
    
    app.querySelectorAll('.content').forEach((item,i) => item.addEventListener('click',e => showEvents(state.content[i])))
}

const showEvents = content => {
    
    state.currentEvent = false;
    state.currentContent = content;
    state.mobileX && ( state.mobileX.style.opacity = 1 );

    const oneSheet = `<div class="one-sheet"><img src="${state.mobile ? content.bannerImage : content.oneSheet}" /></div>`
    const days = state.events.filter(event => event.content_id == content._id).reduce((p,event) => {
        if ( !p[event.date] ) { p.push(p[event.date] = { day: event.day, events: [] }) }
        p[event.date].events.push(event);
        return p;
        },[])
        .map(day => `<p>${day.day}<p>${day.events.map(event => `<p class="event" id="${event.id}">${event.time}</p>`).join('')}`).join('')

    if ( !state.mobile ) {
        app.innerHTML = `<p class="title">${content.title}</p><div class="events">${oneSheet}<div class="days">${days}</div></div>`
    } else {
        document.querySelector('.mobile-header .title').innerHTML = `<p class="title">${content.title}</p>`
        app.innerHTML = `<div class="events" content="${content.id}">${oneSheet}<div class="days">${days}</div></div>`
    }

    app.querySelectorAll('.event').forEach(btn => {
        btn.addEventListener('click',e => { 
            showEvent(state.events.find(event => event.id == e.target.id),content)
        })
    });
    !state.mobile && addX(showContent)     
}

const showEvent = (event, content) => {
    state.currentEvent = event;
    state.currentContent = content;
    if ( state.mobile ) {
        document.querySelector('.mobile-header .title').innerHTML = `<div class="title-date-time"><p class="title">${event.title}</p><p class="title">${event.dateTime}</p></div>`
        app.innerHTML = `<div id="cart-book-seats-state" event="${event.id}"></div><div class="change-area-seats"><p class="btn change-area">change area</p><p class="btn change-seats">change seats</p></div><book-event id="event-${event.id}" event-id="${event.id}"></book-event>`

    } else {
        app.innerHTML = `<p class="title">${event.title}</span><span>${event.dateTime}</span></p><p id="cart-book-seats-state"><div class="change-area-seats"><p class="btn change-area">change area</p><p class="btn change-seats">change seats</p></div></p><book-event id="event-${event.id}" event-id="${event.id}"></book-event>`
        addX(() => { 
            app.innerHTML = `<div class="contents"></div>`
            showEvents(content) 
        })
    }
    app.querySelector('.change-area').addEventListener('click',state.changeArea)
    app.querySelector('.change-seats').addEventListener('click',state.changeSeats)
} 

const addItems = ticket => {
    
    products.forEach(item => item.qty = 0);

    state.ticket = ticket;

    const updateItems = () => {
        

        app.innerHTML =  `<div><p class="title"><span><span><strong>Adding to ticket:- </strong>${ticket.event.title}</span><span>${ticket.event.dateTime}</span></p><div class="products">${products.map(p => `<p class="product" id="${p._id}">${p.title}${p.qty > 0 ? `<span class="product-sticker">${p.qty}<span>` : ''}</p>`).join('')}</div></div>`;
        
        if ( !state.mobile ) {
            app.innerHTML += '<p class="btn">complete add items</p>'
            addX(showContent)
        } else {
            app.innerHTML += '<p class="btn">add to ticket</p>'
        }

        app.querySelectorAll('.product').forEach((btn,i) => {
            btn.addEventListener('click',() => {
                addItem(products[i]);
                updateItems();
            })
        })

        app.querySelector('.btn').addEventListener('click',() => {
            state.mobile ? showCartTickets() : showContent();
        })
    }

    updateItems();

}

const addItem = item => {
    if ( !item ) return;
    const ticket = state.ticket;
    const current = ticket.items.find(i => i._id == item._id);
    if ( current ) {
        current.qty += 1
        item.qty = current.qty;
    } else {
        item.qty = 1;
        ticket.items.push({ ...item });
    }
    ticket.itemRevenue = ticket.items.reduce((p,item) => { 
        item.linePrice = item.qty * item.price 
        return p += item.linePrice
    },0);
    makeTicketsHTML(state.tickets)
}

const makeTicketsHTML = tickets => {
    if ( !document.querySelector('#tickets') ) return;    
    document.querySelector('#tickets').innerHTML = tickets.map(ticket => {
        
        ticket.price = ticket.seatRevenue + ticket.itemRevenue;

        return `
        <div class="ticket" style="border:1px solid #c0c0c0;padding:10px;margin:10px 0px;font-size:14px;position:relative">
            <div style="text-align:center;position:relative">
                <p>${ticket.event.title}</p>
                <p>${ticket.event.dateTime}</p>
            </div>
            <p class="remove" style="position:absolute;top:-8px;right:5px;background-color:red;color:white;line-height:1.4;padding:2px 5px;">remove</p>
            <div>
                ${ticket.seats.map(seat => `<div style="display:grid;grid-template-columns:20px 50px 1fr 1fr 60px"><span>${seat.qty}</span><span>${seat.id}</span><span>${seat.areaTitle}</span><span>${seat.title}</span><span style="text-align:right">$${seat.linePrice.toFixed(2)}</span></div>`).join('')}
            </div>
            ${
            ticket.items.length > 0 ? `<div style="margin-top:10px;border-top:1px solid #c0c0c0;padding-top:10px">${
                ticket.items.map(item => `<div style="display:grid;grid-template-columns:20px 1fr 50px 60px"><span>${item.qty}</span><span>${item.title}</span><span>$${item.price.toFixed(2)}</span><span style="text-align:right">$${item.linePrice.toFixed(2)}</span></div>`).join('')
            }</div>` : ''
            }
            <div style="margin-top:10px">
            <div style="display:grid;grid-template-columns:1fr 90px 60px"><div></div><div>Total</div><div style="text-align:right">$${ticket.price.toFixed(2)}</div></div>
            </div>
            <div style="display:flex;justify-content:space-between;text-align:center;line-height:2;margin-top:20px;">
            ${['add items','change seats'].map(field => `<p class="${field.split(' ')[0]}"" style="background-color:#32a89b;color:white;margin:0px;width:45%">${field}</p>`).join('')}
            </div>
        </div>`
    }).join('')

    if ( tickets.length > 0 ) {
        document.querySelector('#tickets').innerHTML += `
        <div style="border:1px solid #c0c0c0;margin-top:20px;font-size:14px">
        <div style="margin:10px 0px 5px 40px">
            <p style="margin:0px;font-size:12px">Name</p>
            <input id="name" style="width:calc(100% - 40px);padding:2px" value="${state.name}"/>
        </div>  
        <div style="margin:10px 0px 5px 40px">
            <p style="margin:0px;font-size:12px">Email</p>
            <input id="email" style="width:calc(100% - 40px);padding:2px" value="${state.email}" />
        </div> 
        <p id="payment-complete" style="background-color:#32a89b;color:white;margin:20px;line-height:2;text-align:center">payment complete</p>
        </div>`;

        document.querySelector('#name').addEventListener('change',e => localStorage.setItem('name',state.name = e.target.value))
        document.querySelector('#email').addEventListener('change',e => localStorage.setItem('email',state.email = e.target.value))
        
        document.querySelector('#payment-complete').addEventListener('click',async () => {
            const { success, error, contact, tickets } = await completeTicketsPurchase(state.tickets);
            console.log({ success, error, contact, tickets });
            showContent();
            displayTickets(tickets)
        })
    }

    document.querySelectorAll('.remove').forEach((btn,i) => btn.addEventListener('click',() => removeTicket(tickets[i])));
    document.querySelectorAll('.change').forEach((btn,i) => btn.addEventListener('click',() => changeSeats(tickets[i])));
    document.querySelectorAll('.add').forEach((btn,i) => btn.addEventListener('click',() => addItems(tickets[i])));
    
}

const removeTicket = ticket => state.removeTicket(ticket.event.id)

const changeSeats = ticket =>  showEvent(state.events.find(event => event.id == ticket.event.id),state.content.find(content => content._id == ticket.content._id))

const showCartTickets = () => {
    
    state.mobileX.style.opacity = 1;
    
    if ( state.tickets.length == 0 ) {
        app.innerHTML = `<div><p style="text-align:center;margin:10px">Your basket is empty</p><p class="btn" style="margin:10px;width:calc(100% - 20px)">show me What's on</p></div>`
        return app.querySelector('.btn').addEventListener('click',showContent)
    }

    app.innerHTML = `<div id="tickets"></div>`
    makeTicketsHTML(state.tickets)
}

document.addEventListener('DOMContentLoaded',() => {

    const app = document.querySelector('#app')


    getContent({ startDate }).then(({ content }) => {
        console.log('getContent',{ content })
        state.content = content;
        showContent();
    });
    
    getEvents({ startDate }).then(({ events }) => {
        console.log('getEvents',{ events });
        state.events = events;
    });

    state.mobile = app.getBoundingClientRect().width < 650;

    if ( state.mobile ) {
        app.className = 'mobile';
        state.cartSticker = document.querySelector('.mobile-header #sticker')
        state.cartSVG = document.querySelector('.mobile-header .cart')
        document.querySelector('.container').removeChild(document.querySelector('#tickets'))
    }
    
    window.onBookReady = async ( bookTickets ) => {
        console.log('onBookReady');
        state.changeArea = () => {
            bookTickets.requestAreaChange(state.currentEvent.id)
        }
        state.changeSeats = () => {
            bookTickets.requestSeatChange(state.currentEvent.id)
        }

        state.setSession = (session) => {
            bookTickets.setSession(session)
        }

        state.mobileX = document.querySelector('.mobile-header .x') 
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

        bookTickets.addEventListener('handle-seat-area-change',({ eventId, area, areas }) => {
            console.log('handle-seat-area-change',{ eventId, area, areas })
        });

        bookTickets.addEventListener('tickets',tickets => {
            state.tickets = tickets;
            if ( state.cartSticker ) {
                state.cartSticker.style.display = tickets.length > 0 ? 'block' : 'none';
                state.cartSticker.querySelector('text').textContent = tickets.length;
            }
            makeTicketsHTML(tickets);

            // emitted each time there is an update to the tickets.
        });

        bookTickets.addEventListener('release-warning',({ promptTime, eventId, release, event }) => {
            console.log('index.js release-warning',{ promptTime, eventId, release, event });
            // there are two timers configured in Cinema CMS.  First is the releaseTime, ie the interval
            // at which we look for seats that have been reserved but had no action. Second in the prompTime
            // which is the milliseconds after the release-warning when the seats will be released.
            // The seats are kept by calling BookTickets.ticketAction().
        });

        bookTickets.addEventListener('released',ticket => {
            console.log('index.js released',{ ticket })
            // This event is fired when there has been no call to bookTickets.ticketAction() following
            // the release-waring within promptTime ms.
        });

        bookTickets.addEventListener('seat-selection',update => {
            
            const { seats, requiredQty, currentQty, eventId } = update;
            const bookEvent = document.querySelector(`#event-${eventId}`)
            const cartMessage = document.querySelector('#cart-book-seats-state')
            if ( !cartMessage || !bookEvent ) return;

            if ( currentQty == requiredQty ) { 
                cartMessage.innerHTML = '<p class="btn" id="buy-now">BUY NOW</p>' 
                return cartMessage.querySelector('#buy-now').addEventListener('click',() => {
                    state.mobile ? showCartTickets() : showContent(); // if not mobile then cart is on screen.
                })
            }

            if ( currentQty == 0 ) return cartMessage.innerHTML = `Select your seats`
            cartMessage.innerHTML = 'Add '+(requiredQty - currentQty)+' more, '+seats.join(' ');

        })

        state.removeTicket = bookTickets.removeTicket;
        
        setTimeout(() => {
            bookTickets.ticketAction(); // reset release timer;
        },1500);

    } 
})


