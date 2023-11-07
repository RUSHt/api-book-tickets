
const apiHost = "https://api.ticketus.net" 
const accountId = '02sxk0vxanh'

export const getContent = async (options = {}) => {
    const response = await fetch(apiHost+'/get-content?accountId='+accountId+(options.startDate ? ('&startDate='+options.startDate) : ''))
    if ( !response.ok ) return { error: 'getContent', response }
    return await response.json();
}

export const getEvents = async (options = {}) => {
    const response = await fetch(apiHost+'/get-content?accountId='+accountId+(options.startDate ? ('&startDate='+options.startDate) : ''))
    if ( !response.ok ) return { error: 'getEvents', response }
    return await response.json();
}

