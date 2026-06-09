import {createServerFn} from "@tanstack/react-start";
import {createServerClientInstance} from "#/supabase/server.ts";
import {getRequest} from "@tanstack/react-start/server";

export const checkAuth = createServerFn({method: 'GET'})
    .handler(async () => {
        const request = getRequest();

        try {

            const {supabase} = createServerClientInstance(request.headers);

            const {data: {user}, error} = await supabase.auth.getUser();

            if (error || !user) {
                return {isAuthenticated: false, user: null};
            }

            return {isAuthenticated: true, user};

        } catch (error) {
            console.error("Error verifying authentication:", error);
            return {isAuthenticated: false, user: null};
        }
    })


export const getUserSession = createServerFn({method: 'GET'})
    .handler(async () => {
        const request = getRequest();
        const {supabase} = createServerClientInstance(request.headers);

        const {data: {user}, error} = await supabase.auth.getUser();
        if (error || !user) {
            return null;
        }
        return user;
    })