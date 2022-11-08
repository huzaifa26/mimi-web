import React, { useLayoutEffect } from 'react';
import { Route, useLocation } from 'react-router-dom';
import { useHistory } from 'react-router-dom';
import { auth } from '../utils/firebase';

export function PrivateRoute(props) {
    const location=useLocation();
    console.log(location.pathname);
    const { path, exact, children } = props;

    const history = useHistory();

    console.log(auth.currentUser);
    useLayoutEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
        console.log(user);
        console.log(auth.currentUser);
        if (!auth.currentUser?.uid) {
            return history.push('/404');
        }
    })

    return ()=>{
        unsubscribe();
    }
    }, []);

    return (
        <Route path={path} exact={exact}>
            {children}
        </Route>
    );
}
