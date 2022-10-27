import React, { Fragment, useEffect, useLayoutEffect, useMemo } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { useHistory } from 'react-router-dom';
import { useUi, useStore } from '../../store';

import clsx from 'clsx';

import BgImage from '../../assets/logo/bg-404.jpg';
import ScoutLeftImage from '../../assets/logo/scout-right.png';
import ScoutRightImage from '../../assets/logo/scout-left.png';
import { getPageStyles, getTypographyStyles } from '../../utils/helpers';
import { Box, Button, Typography } from '@material-ui/core';
import { FormattedMessage } from 'react-intl';

export const Page404 = React.memo(() => {
    const history = useHistory();

    const { actions } = useUi();
    const classes = useStyles();

    useLayoutEffect(() => {
        actions.toggleSidebar(false);

        return () => {
            actions.toggleSidebar(true);
        };
    }, []);

    return (
        <div className={classes.bg}>
            <img src={ScoutLeftImage} className={classes.imageLeft} />
            <img src={ScoutRightImage} className={classes.imageRight} />
            <Box className={classes.container}>
                <Typography className={classes.heading}>404</Typography>
                <Typography>
                    <FormattedMessage id="hey_explorer" />
                </Typography>
                <Typography>
                    <FormattedMessage id="message_404" />
                </Typography>
                <div className={classes.buttonContainer}>
                    <Box margin={1}>
                        <Button
                            className={clsx([classes.button, classes.buttonPurple])}
                            fullWidth
                            onClick={() => {
                                history.push('/');
                            }}
                        >
                            <FormattedMessage id="go_to_homepage" />
                        </Button>
                    </Box>
                    <Box margin={1}>
                        <Button
                            className={clsx([classes.button, classes.buttonGreen])}
                            fullWidth
                            onClick={() => {
                                history.goBack();
                            }}
                        >
                            <FormattedMessage id="previous_page" />
                        </Button>
                    </Box>
                </div>
            </Box>
        </div>
    );
});

const useStyles = makeStyles(theme => ({
    ...getPageStyles(theme),
    ...getTypographyStyles(theme),

    buttonContainer: {
        display: 'flex',
        justifyContent: 'space-between',
    },

    button: {
        textTransform: 'uppercase',
        boxShadow: `0px 15px 30px rgba(0, 0, 0, 0.0784314)`,
        fontSize: 14,
        padding: '14px 20px',
        color: '#ffffff',
        fontWeight: 'bold',
    },

    buttonPurple: {
        backgroundColor: '#6F42B3',
        '&:hover': {
            backgroundColor: '#6F42B3',
        },
    },
    buttonGreen: {
        backgroundColor: '#008C2F',
        '&:hover': {
            backgroundColor: '#008C2F',
        },
    },

    bg: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        width: '100%',
        backgroundImage: `url(${BgImage})`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        overflow: 'hidden',
        position: 'relative',
    },
    container: {
        display: 'flex',
        flexDirection: 'column',
        width: 'max-content',
        alignItems: 'center',
    },

    heading: {
        fontFamily: ['Galada', 'DM Sans', 'sans-serif'].join(','),
        fontSize: `max(10vw, 150px)`,
        color: '#25273F',
        lineHeight: 0.7,
    },

    imageLeft: {
        width: '30vw',
        zIndex: 11,
        position: 'absolute',
        right: 0,
        bottom: '6vh',
        [theme.breakpoints.down('md')]: {
            display: 'none',
        },
    },

    imageRight: {
        width: '30vw',
        zIndex: 11,
        position: 'absolute',
        left: 0,
        bottom: '6vh',
        [theme.breakpoints.down('md')]: {
            display: 'none',
        },
    },
}));
