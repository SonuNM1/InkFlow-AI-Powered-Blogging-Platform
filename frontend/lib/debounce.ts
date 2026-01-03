import debounce from "lodash/debounce" ; 

export const aiDebounce = <T extends (...args: any[]) => void>(
    fn: T, 
    delay = 1500
) => debounce (fn, delay, {
    leading: true, 
    trailing: false 
})

/*
Debounce 

Prevents a function from being executed repeatedly, within a given time window.

Useful for: AI buttons, API calls, preventing accidental double clicks 
*/

