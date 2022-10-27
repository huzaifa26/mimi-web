import React, { useLayoutEffect } from 'react';
import { Route } from 'react-router-dom';
import { useHistory } from 'react-router-dom';
import { auth } from '../utils/firebase';

export function PrivateRoute(props) {
    const { path, exact, children } = props;

    const history = useHistory();

    useLayoutEffect(() => {
        if (!auth.currentUser?.uid) history.push('/404');
    }, []);

    return (
        <Route path={path} exact={exact}>
            {children}
        </Route>
    );
}
