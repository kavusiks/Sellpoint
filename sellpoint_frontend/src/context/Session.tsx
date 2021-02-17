import Session from "../models/session";
import User from "../models/user";
import React, { FunctionComponent, createContext, useContext, useState, useEffect } from "react";
import AuthenticationService from "../core/auth";
import UserAPI from "../core/api/user";

export const useProviderValue = (): Session => {
  const [user, setUser] = useState<User | undefined>(undefined);
  const [redirectPath, setRedirectPathState] = useState<string | undefined>(undefined);

  const updateSelfUser = () =>
    new Promise<void>((resolve, reject) => {
      if (!AuthenticationService.isLoggedIn()) {
        setUser(undefined);
        resolve();
        return;
      }

      UserAPI.getSelfUser()
        .then((user) => {
          setUser(user);
          resolve();
        })
        .catch((error) => {
          setUser(undefined);
          reject(error);
        });
    });

  const setRedirectPath = (redirectPath: string | undefined) => {
    // This ensures that we can never want to redirect someone to
    // an authentication endpoint when authenticating
    if (redirectPath === "/login" || redirectPath === "/signup") {
      return;
    }

    setRedirectPathState(redirectPath);
  };

  useEffect(() => {
    if (!AuthenticationService.isLoggedIn()) {
      return;
    }

    updateSelfUser();
  }, []); // By setting dependencies to none this is ran only once

  const isAuthenticated = AuthenticationService.isLoggedIn();
  return {
    isAuthenticated,
    user,
    redirectPath,
    updateSelfUser,
    setRedirectPath,
  };
};

const SessionContext = createContext<Session | undefined>(undefined);
SessionContext.displayName = "SessionContext";

export const SessionContextProvider: FunctionComponent = (props: any) => {
  const value = useProviderValue();
  return <SessionContext.Provider value={value} {...props} />;
};

export const useSessionContext = (): Session => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSessionContext must be called within a provider!");
  }

  return context;
};
