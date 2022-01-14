export default function isLoggedInLocally() {
    let username = localStorage.getItem("username");

    return username != null;
}

export function logOut() {
    localStorage.clear();
}
