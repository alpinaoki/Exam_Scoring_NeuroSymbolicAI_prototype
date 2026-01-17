export function getUserColors(seed: string) {

let hash = 0

for (let i = 0; i < seed.length; i++) {

hash = seed.charCodeAt(i) + ((hash << 5) - hash)

}



const hue = Math.abs(hash) % 360



return {

bg: `hsl(${hue}, 70%, 90%)`,

fg: `hsl(${hue}, 60%, 35%)`,

}

}