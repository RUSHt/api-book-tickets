# api-book-tickets

Add this Script tag to a page to use the  `<book-event>`  WebComponent.
```
<script src="https://app.ticketus.net/book-events.js"></script>
```

To start booking an event add the following element:-

```
<book-event id="event-${event.id}" event-id="${event.id}"></book-event>
```

When `book-event.js` is loaded `window.onBookReady()` will pass a `bookEvent` Object.

```
window.onBookReady = async ( bookTickets ) => {

    state.changeArea = () => {
        bookTickets.requestAreaChange(state.currentEvent.id)
    }
    state.changeSeats = () => {
        bookTickets.requestSeatChange(state.currentEvent.id)
    }

    state.setSession = (session) => {
        bookTickets.setSession(session)
    }
    
    bookTickets.addEventListener('handle-seat-area-change',({ eventId, area, areas }) => {
        console.log('handle-seat-area-change',{ eventId, area, areas })
    });

    bookTickets.addEventListener('tickets',tickets => {
        console.log('bookTickets ontickets',{ tickets });
        // emitted each time there is an update to the tickets.
        // this is used to present the tickets in the users / operators cart.
    });

    bookTickets.addEventListener('release-warning',({ promptTime, eventId, release, event }) => {
        console.log('main.js release-warning',{ promptTime, eventId, release, event });
        // there are two timers configured in Cinema CMS.  First is the releaseTime, ie the interval
        // at which we look for seats that have been reserved but had no action. Second in the prompTime
        // which is the milliseconds after the release-warning when the seats will be released.
        // The seats are kept by calling BookTickets.ticketAction().
    });

    bookTickets.addEventListener('released',ticket => {
        console.log('main.js released',{ ticket })
        // This event is fired when there has been no call to bookTickets.ticketAction() 
        // It follows the release-waring within promptTime ms.
    });

    bookTickets.addEventListener('seat-selection',update => {
        const { seats, requiredQty, currentQty, eventId } = update;
        // This event is generated each time there is a change in a booking.
    })

    state.removeTicket = bookTickets.removeTicket;
    // to remove a ticket ( and release the seats ) - before it is sold.
    
    setTimeout(() => {
        bookTickets.ticketAction(); // reset release timer;
    },1500);

} 
```

The below are aslo available from the `bookEvent` Object.

To Obtain events:-

```
const apiHost = "https://api.ticketus.net" 

export const getEvents = async (options = {}) => {
    const response = await fetch(apiHost+'/get-events?accountId='+accountId+(options.startDate ? ('&startDate='+options.startDate) : ''))
    if ( !response.ok ) return { error: 'getEvents', response }
    return await response.json();
}
```

To get Content ( ie, what films are showing at the moment ):-

```
export const getContent = async (options = {}) => {
    const response = await fetch(apiHost+'/get-content?accountId='+accountId+(options.startDate ? ('&startDate='+options.startDate) : ''))
    if ( !response.ok ) return { error: 'getContent', response }
    return await response.json();
}
```

To Complete a sale:- ( this will send an email with ticket(s) )

```
export const completeTicketsPurchase = async tickets => {
    
    const body = {
        contact: {
            email: state.email,
            name: state.name,
        },
        paymentId: '<payment-reference>',
        accountId,
        timeZone: Intl?.DateTimeFormat()?.resolvedOptions()?.timeZone,
        tickets: tickets.map(ticket => ({
            sessionId: ticket.sessionId,
            event: ticket.event,
            content: ticket.content,
            seats: ticket.seats.map(seat => ({ id: seat.id, areaTitle: seat.areaTitle, qty: seat.qty, title: seat.title, price: seat.price, linePrice: seat.linePrice })),
            items: ticket.items.map(item => ({ _id: item._id, title: item.title, qty: item.qty, price: item.price, linePrice: item.linePrice })),
            itemRevenue: ticket.itemRevenue,
            seatRevenue: ticket.seatRevenue,
            price: ticket.price
        })) 
    }

    const result = await fetch(apiHost+'/create-ticket',{
        method: 'POST',
        body: JSON.stringify(body)
    });
    if ( !result.ok ) return { error: result }
    return await result.json();

}
```
To Add items to an existing ticket:-

```
export const addItemsToTicket = async ( ticket ) => {

    const body = {
        paymentId: '<payment-reference>',
        accountId: ticket.accountId,
        ticketId: ticket.ticketId,
        items: ticket.items.map(item => ({ _id: item._id, title: item.title, qty: item.qty, price: item.price, linePrice: item.linePrice })),
        price: ticket.price
    }

    const result = await fetch(apiHost+'/add-to-ticket',{
        method: 'POST',
        body: JSON.stringify(body)
       });
       if ( !result.ok ) return { error: result }
       return await result.json();

}
```

To get a ticket ( so it can be display in a cart with the items already added ):-

```
export const getTicket = async ({ accountId, ticketId }) => {

    const body = { 
        accountId,
        ticketId
    }

    const result = await fetch(apiHost+'/get-ticket',{
        method: 'POST',
        body: JSON.stringify(body)
       });
       if ( !result.ok ) return { error: result }
       return await result.json()
}```
