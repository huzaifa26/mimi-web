import React, { useEffect, useLayoutEffect, useMemo } from 'react';
import { Loader, PrivateRoute } from './components';
import { Route, Switch } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@material-ui/core/styles';

import { Routes as routesConfig } from './utils/config';
import english from './Languages/eng.json';
import hebrew from './Languages/heb.json';
import { IntlProvider } from 'react-intl';
import { LANGUAGE_MAPPING, ROLES } from './utils/constants';
import { useStore } from './store';
import { Sidebar } from './components';
import firebase from "firebase/app";
import { UiProvidor } from './store';


const LanugageFiles = {
    [LANGUAGE_MAPPING.ENGLISH]: english,
    [LANGUAGE_MAPPING.HEBREW]: hebrew,
};

export const Routes = React.memo(() => {
    const { state, setState: setStoreState } = useStore();

    const { user } = state;


    const theme = useMemo(() => {
        return createTheme({
            typography: {
                fontFamily: ['DM Sans', 'sans-serif'].join(','),
            },
            direction: state.orientation,
        });

    }, [state.orientation]);

    useEffect(() => {
        const bodyEl = document.getElementsByTagName('html')[0];
        bodyEl.setAttribute('lang', state.language);
        bodyEl.setAttribute('dir', state.orientation);
    }, [state.orientation]);

    const renderRoutes = () => {

        return routesConfig.map(el => {
            const { component, ...otherProps } = el;
            const Component = component;

            if (el.path === "/") return
            // if(el.path === "*") return

            if (el.path.includes("/dashboard") && (user?.permissions?.showDashboard === false && user?.type !== ROLES.admin)) {
                return
            }
            if (el?.private) {
                if (user?.type !== ROLES.admin && el.roles.length && !el.roles.includes(user?.type)) return;

                return (
                    <PrivateRoute key={el.path} {...otherProps}>
                        <Sidebar>
                            <Component />
                        </Sidebar>
                    </PrivateRoute>
                );
            } else {
                return (
                    <Route key={el.path} {...otherProps}>
                        <Component />
                    </Route>
                );
            }
        });
    };

    if (!state.authenticated) return <Loader />;

    const route404 = routesConfig[routesConfig.length - 1];
    const { component404, ...otherProps404 } = route404;
    const Component404 = component404


    return (
        <IntlProvider messages={LanugageFiles[state.language] || english} locale={state.language} defaultLocale={LANGUAGE_MAPPING.ENGLISH}>
            <ThemeProvider theme={theme}>
                <UiProvidor>
                    <Switch>
                        <Route key={routesConfig.path} {...routesConfig[0]} ></Route>
                        {renderRoutes()}

                        {/* <PrivateRoute key={route404.path} {...otherProps404} > */}
                        {/* <Component404 /> */}
                        {/* </PrivateRoute> */}
                    </Switch>
                </UiProvidor>
            </ThemeProvider>
        </IntlProvider>
    );
});
