import { products } from "./products-accountId-startDate.js"
import { getTicket, addItemsToTicket } from "./fetch-api.js";
import { state } from "./state.js";

const request = location.search.split('?').pop().split('&').reduce((p,search) => { const kv = search.split('='); p[kv[0]] = kv[1]; return p },{})

state.ticket = {
    url: `https://tkt.ticketus.net/new-ticket/${request.account}/${request.ticket}`,
    accountId: request.account,
    ticketId: request.ticket
}

const showCartTickets = () => {
    if ( state.mobile ) {
        state.mobileX.style.opacity = 1;
        app.innerHTML = `<div id="tickets"></div>`
    }
    makeTicketsHTML(state.tickets)
}

const addItems = ticket => {
    
    products.forEach(item => item.qty = 0);

    const updateItems = () => {
        

        app.innerHTML =  `<div><p class="title"><span><span><strong>Adding to ticket:- </strong>${ticket.event.title}</span><span>${ticket.event.dateTime}</span></p><div class="products">${products.map(p => `<p class="product" id="${p._id}">${p.title}${p.qty > 0 ? `<span class="product-sticker">${p.qty}<span>` : ''}</p>`).join('')}</div></div>`;
        
        if ( !state.mobile ) {
            app.innerHTML += '<p class="btn">complete add items</p>'
            addBack(showContent)
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
    const ticket = state.tickets[0];
    const current = ticket.addingItems.find(i => i._id == item._id);
    if ( current ) {
        current.qty += 1
        item.qty = current.qty;
    } else {
        item.qty = 1;
        ticket.addingItems.push({ ...item });
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
        
        ticket.price = ticket.seatRevenue + ticket.itemRevenue - ticket.initalPrice;

        return `
        <div class="ticket" style="border:1px solid #c0c0c0;padding:10px;margin:10px 0px;font-size:14px;position:relative">
            <div style="text-align:center;position:relative">
                <p>${ticket.event.title}</p>
                <p>${ticket.event.dateTime}</p>
            </div>
            <div style="opacity:0.5">
                <p style="text-align:center;font-weight:bold;margin-bottom:0px;text-decoration:underline">Your Seats</p>
                ${ticket.seats.map(seat => `<div style="display:grid;grid-template-columns:20px 50px 1fr 1fr 60px"><span>${seat.qty}</span><span>${seat.id}</span><span>${seat.areaTitle}</span><span>${seat.title}</span><span style="text-align:right">$${seat.linePrice.toFixed(2)}</span></div>`).join('')}
            </div>
            ${
            ticket.items.length > 0 ? `<div style="margin-top:10px;border-top:1px solid #c0c0c0;padding-top:10px;opacity:0.5"><p style="text-align:center;font-weight:bold;margin-bottom:0px;text-decoration:underline">Current Items</p>${
                ticket.items.map(item => `<div style="display:grid;grid-template-columns:20px 1fr 50px 60px"><span>${item.qty}</span><span>${item.title}</span><span>$${item.price.toFixed(2)}</span><span style="text-align:right">$${item.linePrice.toFixed(2)}</span></div>`).join('')
            }</div>` : ''
            }
            ${
                ticket.addingItems.length > 0 ? `<div style="margin-top:10px;border-top:1px solid #c0c0c0;padding-top:10px"><p style="text-align:center;font-weight:bold;margin-bottom:0px;text-decoration:underline">Adding Items</p>${
                    ticket.addingItems.map(item => `<div style="display:grid;grid-template-columns:20px 1fr 50px 60px"><span>${item.qty}</span><span>${item.title}</span><span>$${item.price.toFixed(2)}</span><span style="text-align:right">$${item.linePrice.toFixed(2)}</span></div>`).join('')
                }</div>` : ''
            }
            <div style="margin-top:10px">
                <div style="display:grid;grid-template-columns:1fr 90px 60px"><div></div><div>To Pay</div><div style="text-align:right">$${ticket.price.toFixed(2)}</div></div>
            </div>
            <div style="text-align:center;line-height:2;margin-top:20px;">
                ${['add items'].map(field => `<p class="${field.split(' ')[0]}"" style="background-color:#32a89b;color:white;margin:0px;width:calc(100% - 10px)">${field}</p>`).join('')}
            </div>
        </div>`
    }).join('')

    if ( state.ticket.addingItems.length > 0 ) {
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
            const { success, error } = await addItemsToTicket(state.tickets[0]);
            success ? displayTickets([ state.ticket ]) : console.log({ success, error })
        })
    }

    document.querySelectorAll('.add').forEach((btn,i) => btn.addEventListener('click',() => addItems(tickets[i])));
    
}

const displayTickets = tickets => {
    
    document.body.appendChild(tickets.reduce((p,ticket) => { p.innerHTML += `<div style="border:1px solid #c0c0c0;background-color:white"><img src="${ticket.url}" style="width:300px;margin:5px"/><p class="add-items btn">add to ticket</p></div>`; return p },Object.assign(document.createElement('div'),{ style: 'width:100vw;height:100vh;position:fixed;display:flex;justify-content:space-around;left:0px;top:0px;align-items:center', id: 'final-tickets' })));
            
    document.querySelectorAll('.add-items').forEach((btn,i) => {
        btn.addEventListener('click',() => location.href = 'http://'+location.host+`/add-items.html?account=${accountId}&ticket=${tickets[i].ticketId}&date=${Date.now()}`)
    })

    document.body.querySelector('#final-tickets').addEventListener('click',e => document.body.removeChild(document.querySelector('#final-tickets')));

}

document.addEventListener('DOMContentLoaded',async () => {

    const app = document.querySelector('#app')

    state.app = app;
    state.mobile = app.getBoundingClientRect().width < 650;

    if ( state.mobile ) {
        app.className = 'container mobile';
        state.cartSticker = document.querySelector('.mobile-header #sticker')
        state.cartSVG = document.querySelector('.mobile-header .cart')
        state.mobileX = document.querySelector('.mobile-header .x')
        app.innerHTML = '<div id="tickets"></div>'

        state.mobileX?.addEventListener('click',() => {
            console.log('state.mobileX click');
            if ( app.querySelector('.products') ) return showCartTickets();
        });

        state.cartSVG?.addEventListener('click',e => {
            app.lastApp = app.firstChild.cloneNode();
            showCartTickets();
        });
    }

    app.classList.add('add-items')

    const { success, ticket, error } = await getTicket({ accountId: state.ticket.accountId, ticketId: state.ticket.ticketId })
    console.log({ success, ticket, error });
    ticket.url = state.ticket.url;
    ticket.initalPrice = ticket.itemRevenue + ticket.seatRevenue;
    ticket.addingItems = [];
    state.ticket = ticket;
    state.tickets = [ ticket ];
    showCartTickets();
})
