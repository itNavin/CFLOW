import Cookies from "js-cookie"

export const setAuthToken = (token: string) => {
    Cookies.set("authToken", token)
}

export const getAuthToken = () => {
    const token = Cookies.get("authToken")
    return token
}

export const setUserRole = (role: string) => {
    Cookies.set("Role", role)
}

export const getUserRole = () => {
    const role = Cookies.get("Role")
    return role
}