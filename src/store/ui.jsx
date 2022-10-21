import { makeStyles, Snackbar, Grid, Typography } from '@material-ui/core';
import { Button, SimpleModal } from '../components';
import Alert from '@material-ui/lab/Alert';
import React, { useContext, useState, useEffect } from 'react';
import { getModalStyles } from '../utils/helpers';

const uiContext = React.createContext();

export const useUi = () => useContext(uiContext);

const useStyles = makeStyles(theme => {
    return {
        ...getModalStyles(theme),
        alert: {
            padding: '1rem',
            minWidth: '8rem',
        },
    };
});

export const UiProvidor = ({ children }) => {
    const classes = useStyles();

    const [loading, setLoading] = useState(false);

    const [state, setState] = useState({
        snackbar: {
            message: '',
            type: '',
            opened: false,
        },
        dialog: {
            body: '',
            title: '',
            action: null,
        },
        sidebar: true,
    });


    useEffect(() => {
        if (!state.snackbar.opened) {
            setState(prev => ({
                ...prev,
                snackbar: {
                    message: '',
                    type: '',
                },
            }));
        }
    }, [state.snackbar.opened]);

    useEffect(() => {
        if (!state.dialog.action) {
            setState(prev => ({
                ...prev,
                dialog: {
                    body: '',
                    title: '',
                },
            }));
        }
    }, [state.dialog.action]);

    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setState(prev => ({
            ...prev,
            snackbar: {
                opened: false,
            },
        }));
    };
    const handleCloseDialog = () => {
        setState(prev => ({
            ...prev,
            dialog: {
                action: null,
            },
        }));
    };

    const alert = (message, type) => {
        setState(prev => ({
            ...prev,
            snackbar: {
                opened: true,
                message,
                type,
            },
        }));
    };

    const showDialog = ({ action, title, body }) => {
        setState(prev => ({
            ...prev,
            dialog: {
                action,
                title,
                body,
            },
        }));
    };

    const toggleSidebar = flag => {
        setState(prev => ({
            ...prev,
            sidebar: typeof flag === 'boolean' ? flag : !prev.sidebar,
        }));
    };

    return (
        <uiContext.Provider
            value={{
                state: {
                    sidebar: state.sidebar,
                },
                actions: {
                    alert,
                    showDialog,
                    toggleSidebar,
                },
            }}
        >
            <SimpleModal title={state.dialog.title} open={!!state.dialog.action} handleClose={handleCloseDialog}>
                <Typography>{state.dialog.body}</Typography>

                <div className={classes.default_modal_footer}>
                    <Grid container spacing={2}>
                        <Grid item xs={6} justifyContent="center">
                            <Button fullWidth className={classes.default_modal_buttonSecondary} onClick={handleCloseDialog}>
                                Disagree
                            </Button>
                        </Grid>
                        <Grid item xs={6} justifyContent="center">
                            <Button
                                loading={loading}
                                fullWidth
                                onClick={async () => {
                                    setLoading(true);
                                    try {
                                        state.dialog.action && (await state.dialog.action());
                                        handleCloseDialog();
                                    } catch (error) {
                                        console.log(error);
                                        alert('Error Performing Action', 'error');
                                    } finally {
                                        setLoading(false);
                                    }
                                }}
                            >
                                Agree
                            </Button>
                        </Grid>
                    </Grid>
                </div>
            </SimpleModal>

            <Snackbar
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
                open={state.snackbar.opened}
                autoHideDuration={2000}
                onClose={handleCloseSnackbar}
            >
                <Alert className={classes.alert} variant="filled" onClose={handleCloseSnackbar} severity={state.snackbar.type}>
                    {state.snackbar.message}
                </Alert>
            </Snackbar>

            {children}
        </uiContext.Provider>
    );
};
