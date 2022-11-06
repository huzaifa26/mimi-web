/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useState } from "react";
import { useRef } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { date } from "yup";
import { LANGUAGE_MAPPING, ROLES } from "../utils/constants";
import { db, auth } from "../utils/firebase";

const ctx = React.createContext();

export const useStore = () => useContext(ctx);

export const StoreProvidor = ({ children }) => {
  const location = useLocation()
  const history = useHistory();

  // ref variable to store user snapshot unsubscribe function.
  const listener = useRef();
  // ref variable to store institute snapshot unsubscribe function.
  const instituteListener = useRef();

  const [state, setState] = useState(() => {
    return {
      user: null,
      orientation: localStorage.getItem("orientation"),
      language: localStorage.getItem("language"),
      defaultAvatars: null,
      institute: null,
      authenticated: false,
    };
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        let last_login = localStorage.getItem("last_login");
        if (last_login !== null) {
          let minus4Hours = new Date();
          last_login = new Date(new Date(last_login).setHours(new Date().getHours())).getTime();
          minus4Hours = new Date().setHours(new Date().getHours() - 4);

          if (last_login < minus4Hours) {
            handleSignOut();
            setState((prev) => ({ ...prev, user: null, authenticated: true }));
            unsubscribe();
            return
          }
        }

        const code = localStorage.getItem("code");
        if (code !== null) {
          let _user_Data = await db
            .collection("Institution")
            .doc(code)
            .collection("staff")
            .doc(user?.uid)
            .get();

          let userData = _user_Data.data();
          if (userData.permissions.webPanelAccess === true) {
            if(!(userData.type !== ROLES.admin && userData.firstPasswordChanged === false)){
              let last_login=new Date();
              await db
                .collection("Institution")
                .doc(code?.toUpperCase())
                .collection("staff")
                .doc(userData?.id)
                .update({
                  web_last_login: last_login,
                });
              if (userData.type === ROLES.admin) {
                await db
                  .collection("admins")
                  .doc(userData?.id)
                  .update({
                    web_last_login: last_login,
                  });
              }
  
              // Listening to user webPanelAccess field
              listener.current = db
                .collection("Institution")
                .doc(code)
                .collection("staff")
                .doc(userData?.id)
                .onSnapshot((snapshot) => {
                  if (snapshot.data().permissions.webPanelAccess === false) {
                    setState((prev) => ({ ...prev, user: null, authenticated: true }));
                    listener.current && listener.current();
                    instituteListener.current && instituteListener.current();
                    unsubscribe()
                    handleSignOut();
                  }
                  localStorage.setItem("last_login", new Date());
                  setState((prev) => ({
                    ...prev,
                    authenticated: true,
                    user: { ...snapshot.data(), _code: code },
                  }));
                });
  
              // Listening to institute enabled field
              instituteListener.current = db
                .collection("Institution")
                .doc(code)
                .onSnapshot((snapshot) => {
                  let institute = snapshot.data();
                  const subEndDate = new Date(new Date(institute.subscription_end_date).setHours(0, 0, 0, 0)).getTime();
                  const todayDate = new Date(new Date().setHours(0, 0, 0, 0)).getTime();
                  if (institute.enabled === false && userData.type !== ROLES.admin) {
                    setState((prev) => ({ ...prev, user: null, authenticated: true }));
                    listener.current && listener.current();
                    instituteListener.current && instituteListener.current();
                    unsubscribe()
                    handleSignOut();
                  }
  
                  if (todayDate > subEndDate && userData.type !== ROLES.admin) {
                    setState((prev) => ({ ...prev, user: null, authenticated: true }));
                    listener.current && listener.current();
                    instituteListener.current && instituteListener.current();
                    unsubscribe();
                    handleSignOut();
                  }
                })
            }
          } else if (userData.permissions.webPanelAccess === false) {
            setState((prev) => ({ ...prev, user: null, authenticated: true }));
          }
        }
      }
      else {
        setState((prev) => ({ ...prev, user: null, authenticated: true }));
        listener.current && listener.current();
        instituteListener.current && instituteListener.current();
      }
    });
  }, []);

  useEffect(() => {
    state?.user?.permissions?.webPanelAccess &&
      (async () => {
        const institutionDocs = await db
          .collection("Institution")
          .where("code", "==", state.user._code)
          .get();

        if (!institutionDocs.empty) {
          const {
            defaultGroupAvatar,
            defaultKidAvatar,
            defaultStaffAvatar,
            image,
          } = institutionDocs.docs[0].data();
          setState((prev) => ({
            ...prev,
            institute: institutionDocs.docs[0].data(),
            defaultAvatars: {
              kid: defaultKidAvatar,
              group: defaultGroupAvatar,
              staff: defaultStaffAvatar,
            },
          }));
        }
      })();
  }, [state.user]);

  const handleSignOut = () => {
    auth.signOut().then(
      () => {
        history.push("/");
        localStorage.clear();
        setState((prev) => ({ ...prev, user: null }));
      },
      (error) => {
        console.error("Sign Out Error", error);
      }
    );
  };

  return (
    <ctx.Provider
      value={{
        state,
        setState,
        actions: {
          handleSignOut,
        },
      }}
    >
      {(state?.user === null && !location.pathname === "/") ? null : children}
    </ctx.Provider>

  );
};
