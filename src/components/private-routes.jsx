import React, { useLayoutEffect } from 'react';
import { Route, useLocation } from 'react-router-dom';
import { useHistory } from 'react-router-dom';
import { auth } from '../utils/firebase';

export function PrivateRoute(props) {
    const location=useLocation();
    const { path, exact, children } = props;

    const history = useHistory();

    useLayoutEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
        if (!auth.currentUser?.uid) {
            return history.push('/');
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
