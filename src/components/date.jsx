import { Box, makeStyles, Typography } from '@material-ui/core';
import clsx from 'clsx';
import React from 'react';
import DateLogo from '../assets/logo/history.png';
import { getTypographyStyles } from '../utils/helpers';
import moment from 'moment';

const useStyles = makeStyles(theme => {
    return {
        ...getTypographyStyles(theme),
        image: {
            height: 60,
            width: 60,
            borderRadius: '50%',
            objectFit: 'cover',
            marginRight: 10,
        },
    };
});

export const Date = ({ date }) => {
    const classes = useStyles();

    return (
        <Box display={'flex'}>
            <img src={DateLogo} alt="date-logo" className={classes.image} />

            <Box display={'flex'} flexDirection="column" justifyContent={'center'}>
                <Typography className={clsx([classes.default_typography_paragraph])}>{moment(date.toDate()).format('dddd')}</Typography>
                <Typography className={clsx([classes.default_typography_paragraph, classes.default_typography_colorSuccess])}>
                    {moment(date.toDate()).format('DD-MM-YYYY')}
                </Typography>
            </Box>
        </Box>
    );
};
