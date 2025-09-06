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
    return role ? role : ""
}

export const getUserId = () => {
    const userId = Cookies.get("userId")
    return userId
}

export const removeAuthToken = () => {
    Cookies.remove("authToken")
}

export const removeUserRole = () => {
    Cookies.remove("Role")
}