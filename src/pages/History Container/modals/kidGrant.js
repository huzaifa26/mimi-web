import clsx from 'clsx';
import React, { Fragment } from 'react';
import { Typography, makeStyles, Grid, Box, Divider } from '@material-ui/core';
import { FormattedMessage } from 'react-intl';
import { Date, KidInfo } from '../../../components';
import { getHistoryStyles, getTypographyStyles } from '../../../utils/helpers';

export const KidGrantBody = props => {
    const { data } = props;

    const { time, payload, executer } = data;
    const { kid, score, reason } = payload;

    const classes = useStyles();

    return (
        <Fragment>
            <Box padding={2} className={classes.default_history_headerContainer}>
                <KidInfo kid={kid} />
                <Date date={time} />
            </Box>

            <Divider />

            <Box paddingX={2} paddingY={4}>
                <Grid container>
                    <Grid item xs={12} md={4}>
                        <Typography
                            className={clsx(
                                classes.default_typography_label,
                                classes.default_typography_colorLight,
                                classes.default_typography_bold,
                                classes.default_typography_uppercase,
                            )}
                        >
                            <FormattedMessage id="REASON" />
                        </Typography>
                        <Typography className={clsx(classes.default_typography_subHeading, classes.default_typography_bold, classes.default_typography_capitalize)}>
                            {reason}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Typography
                            className={clsx(
                                classes.default_typography_label,
                                classes.default_typography_colorLight,
                                classes.default_typography_bold,
                                classes.default_typography_uppercase,
                            )}
                        >
                            <FormattedMessage id="AMOUNT" />
                        </Typography>
                        <Typography className={clsx(classes.default_typography_subHeading, classes.default_typography_bold, classes.default_typography_capitalize)}>
                            {score}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Typography
                            className={clsx(
                                classes.default_typography_label,
                                classes.default_typography_colorLight,
                                classes.default_typography_bold,
                                classes.default_typography_uppercase,
                            )}
                        >
                            <FormattedMessage id="executed_by" />
                        </Typography>
                        <Typography className={clsx(classes.default_typography_subHeading, classes.default_typography_bold, classes.default_typography_capitalize)}>
                            {executer}
                        </Typography>
                    </Grid>
                </Grid>
            </Box>
        </Fragment>
    );
};

const useStyles = makeStyles(theme => ({
    ...getTypographyStyles(theme),
    ...getHistoryStyles(theme),
}));
