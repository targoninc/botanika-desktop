export function getGreeting(username: string) {
    const now = new Date();
    const hour = now.getHours();
    if (hour > 6 && hour < 12) {
        return `Good morning ${username}! 🌄`;
    } else if (hour < 18) {
        return `Good afternoon ${username}! 🌇`;
    } else if (hour < 24) {
        return `Good evening ${username}! 🌆`;
    } else {
        return `Good night ${username}! 🌃`;
    }
}