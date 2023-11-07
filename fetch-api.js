
const apiHost = "https://api.ticketus.net" 
const accountId = '02sxk0vxanh'

export const getContent = async (options = {}) => {
    const response = await fetch(apiHost+'/get-content?accountId='+accountId+(options.startDate ? ('&startDate='+options.startDate) : ''))
    if ( !response.ok ) return { error: 'getContent', response }
    return await response.json();
}

export const getEvents = async (options = {}) => {
    const response = await fetch(apiHost+'/get-events?accountId='+accountId+(options.startDate ? ('&startDate='+options.startDate) : ''))
    if ( !response.ok ) return { error: 'getEvents', response }
    return await response.json();
}

export const completeTicketsPurchase = async tickets => {
    const body = {
        contact: {
            email: state.email,
            name: state.name,
        },
        paymentId: '<payment-reference>',
        accountId,
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

export const getSessionTickets = async ({ session: { _id, id }, accountId }) => {
    const apiHost = location.protocol == 'http:' ? 'http://localhost:9494' : "https://api.ticketus.net"
    const body = {
        session: { _id, id },
        accountId
    }
    
    const result = await fetch(apiHost+'/get-session-tickets',{
        method: 'POST',
        body: JSON.stringify(body),
    });

    if ( !result.ok ) return { error: result }
    return await result.json();
}

