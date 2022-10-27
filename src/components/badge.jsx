import { makeStyles, Typography } from '@material-ui/core';
import React from 'react';
import Level from '../assets/logo/level.png';

const useStyles = makeStyles(theme => {
    return {
        badgeContainer: {
            position: 'relative',
        },
        badge: {
            width: 'auto',
            height: 40,
        },
        figure: {
            fontSize: 12,
            fontWeight: 'bold',
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%,-50%)',
        },
    };
});

export const Badge = ({ value }) => {
    const classes = useStyles();

    return (
        <div className={classes.badgeContainer}>
            <img className={classes.badge} src={Level} alt={'level'} />

            <Typography className={classes.figure}>{value}</Typography>
        </div>
    );
};
