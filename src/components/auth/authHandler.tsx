"use client";

import { VerifyAPI } from "@/api/auth/verify";
import { getAuthToken } from "@/util/cookies";
import { usePathname, useRouter } from "next/navigation";
import { FC, ReactNode, useEffect, useState } from "react";

const AuthHandler: FC<{ children: ReactNode }> = ({ children }) => {
    const navigator = useRouter();
    const [userToken, setUserToken] = useState<string | undefined>(undefined);
    const [verifying, setVerifying] = useState(true);
    const path = usePathname();

    const verifyResponse = async () => {
        const verifyResponse = await VerifyAPI();
        if (verifyResponse.status !== 200) {
            navigator.replace("/auth/login");
        }
        setVerifying(false);
    }

    useEffect(() => {
        if (path === "/auth/login" || path === "/auth/register") {
            return;
        }
        const token = getAuthToken();
        if (!token) {
            navigator.replace("/auth/login");
        }
        setUserToken(token);

        verifyResponse();
    }, [path]);

    if (!userToken && path !== "/auth/login" && path !== "/auth/register") {
        return <></>;
    }

    if (verifying && path !== "/auth/login" && path !== "/auth/register") {
        return <></>;
    }
    
    return children
}

export { AuthHandler };