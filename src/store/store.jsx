import React, { useContext, useEffect, useState } from "react";
import { useRef } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { LANGUAGE_MAPPING } from "../utils/constants";
import { db, auth } from "../utils/firebase";

const ctx = React.createContext();

export const useStore = () => useContext(ctx);

export const StoreProvidor = ({ children }) => {
  const location=useLocation()
  const history = useHistory();

  const listener = useRef();

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
    auth.onAuthStateChanged((user) => {
      if (user) {
        const code = localStorage.getItem("code");
        console.info(code);
        if(code !== null){
          listener.current = db
            .collection("Institution")
            .doc(code)
            .collection("staff")
            .doc(user.uid)
            .onSnapshot((snapshot) => {
              // console.log({ user: snapshot.data() });
              setState((prev) => ({
                ...prev,
                authenticated: true,
                user: { ...snapshot.data(), _code: code },
              }));
            });
        }
      } 
      else {
        setState((prev) => ({ ...prev, user: null, authenticated: true }));
        listener.current && listener.current();
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
        {(state?.user === null && !location.pathname === "/")? null:children}
      </ctx.Provider>
    
  );
};
