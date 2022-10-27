import { Box, makeStyles, Typography } from '@material-ui/core';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import Icons from './Icons';

const useStyles = makeStyles(theme => {
    return {
        icon: {
            fontSize: 16,
        },
        text: {
            fontWeight: 'bold',
        },
    };
});

export const Status = ({ value }) => {
    const classes = useStyles();

    return (
        <Box display={'flex'}>
            <Box marginRight={1}>
                <Typography className={classes.icon}>
                    {value && Icons.greenDot}
                    {!value && Icons.redDot}
                </Typography>
            </Box>
            <Typography className={classes.text}>
                <FormattedMessage id={value ? 'active' : 'disabled'} />
            </Typography>
        </Box>
    );
};
