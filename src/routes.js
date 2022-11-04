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

    const checkAndDisableRoutes = async() => {
       await firebase.functions().httpsCallable('disableRoutePlan')({doc:user._code})
        .then(()=>{
         console.log("Auto Disable run success)")
        })
        .catch((error)=>{
          console.log(error)
        })
    }
    useEffect(()=>{
        checkAndDisableRoutes();
    })

    const renderRoutes = () => {
    
        return routesConfig.map(el => {
            const { component, ...otherProps } = el;
            const Component = component;

            if(el.path.includes("/dashboard") && (user?.permissions?.showDashboard === false && user?.type !== ROLES.admin)){
                return
            }
            if (el?.private) {
                if (user?.type !== ROLES.admin && el.roles.length && !el.roles.includes(user?.type)) return;

                return (
                    <PrivateRoute key={el.path} {...otherProps}>
                        <Component />
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

    return (
        <IntlProvider messages={LanugageFiles[state.language] || english} locale={state.language} defaultLocale={LANGUAGE_MAPPING.ENGLISH}>
            <ThemeProvider theme={theme}>
                    <UiProvidor>
                        <Sidebar>
                            <Switch>{renderRoutes()}</Switch>
                        </Sidebar>
                    </UiProvidor>
            </ThemeProvider>
        </IntlProvider>
    );
});
