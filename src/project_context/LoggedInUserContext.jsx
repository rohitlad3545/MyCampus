/* eslint-disable react-refresh/only-export-components */

import { createContext, useState } from "react";

export const LoggedInUserContext = createContext();

export default function LoggedInUserProvider({ children }) {

    // Get user data from localStorage
    let storedUserData = localStorage.getItem("userData");

    let loggedInUserData = null;

    try {

        if (storedUserData) {
            loggedInUserData = JSON.parse(storedUserData);
        }

    } catch (error) {

        console.error(
            "Error reading userData from localStorage:",
            error
        );

        localStorage.removeItem("userData");

    }


    const [userData, setUserData] = useState(loggedInUserData);


    return (

        <LoggedInUserContext.Provider
            value={{
                userData,
                setUserData
            }}
        >

            {children}

        </LoggedInUserContext.Provider>

    );
}