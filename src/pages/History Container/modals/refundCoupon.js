import clsx from 'clsx';
import React, { Fragment } from 'react';
import { Typography, makeStyles, Grid, Box, Divider } from '@material-ui/core';
import { FormattedMessage } from 'react-intl';
import { Date, KidInfo } from '../../../components';
import { getHistoryStyles, getTypographyStyles } from '../../../utils/helpers';
import moment from 'moment';

export const RefundCouponBody = props => {
    const { data } = props;

    const { time, payload, executer } = data;
    const { kid, coupon } = payload;

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
                    <Grid item xs={12} md={3}>
                        <Typography
                            className={clsx(
                                classes.default_typography_label,
                                classes.default_typography_colorLight,
                                classes.default_typography_bold,
                                classes.default_typography_uppercase,
                            )}
                        >
                            <FormattedMessage id="REDEEMED_BY" />
                        </Typography>
                        <Typography className={clsx(classes.default_typography_subHeading, classes.default_typography_bold, classes.default_typography_capitalize)}>
                            {executer}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Typography
                            className={clsx(
                                classes.default_typography_label,
                                classes.default_typography_colorLight,
                                classes.default_typography_bold,
                                classes.default_typography_uppercase,
                            )}
                        >
                            <FormattedMessage id="VOUCHER_NAME" />
                        </Typography>
                        <Typography className={clsx(classes.default_typography_subHeading, classes.default_typography_bold, classes.default_typography_capitalize)}>
                            {coupon.name}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Typography
                            className={clsx(
                                classes.default_typography_label,
                                classes.default_typography_colorLight,
                                classes.default_typography_bold,
                                classes.default_typography_uppercase,
                            )}
                        >
                            <FormattedMessage id="price" />
                        </Typography>
                        <Typography className={clsx(classes.default_typography_subHeading, classes.default_typography_bold, classes.default_typography_capitalize)}>
                            {coupon.price}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Typography
                            className={clsx(
                                classes.default_typography_label,
                                classes.default_typography_colorLight,
                                classes.default_typography_bold,
                                classes.default_typography_uppercase,
                            )}
                        >
                            <FormattedMessage id="time" />
                        </Typography>
                        <Typography className={clsx(classes.default_typography_subHeading, classes.default_typography_bold, classes.default_typography_capitalize)}>
                            {moment(time.toDate()).format('HH:mm')}
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
