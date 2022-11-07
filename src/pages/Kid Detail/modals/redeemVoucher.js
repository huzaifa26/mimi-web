import { Grid, Input, makeStyles, Typography, Divider, Box, Avatar } from '@material-ui/core';
import React, { Fragment, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useStore, useUi } from '../../../store';
import { db } from '../../../utils/firebase';
import DateLogo from '../../../assets/logo/history.png';
import moment from 'moment';
import { getModalStyles, getSectionHeaderStyles, getTypographyStyles } from '../../../utils/helpers';
import clsx from 'clsx';
export const RedeemVoucherBody = props => {
    const { handleClose, kid, voucher } = props;
    const classes = useStyles();
    const { state: storeState } = useStore();
    const { actions } = useUi();
    const { user, defaultAvatars } = storeState;

    const [staff, setStaff] = useState(null);

    useEffect(() => {
        if (!voucher) return;

        (async () => {
            setStaff((await db.collection('Institution').doc(user?._code).collection('staff').doc(voucher.staff_id).get()).data());
        })();
    }, [voucher]);

    console.log(voucher);

    return (
        <Fragment>
            <div className={classes.headerSection}>
                <Box display="flex" alignItems={'center'} marginY={4}>
                    <Box marginRight={2}>
                        <Avatar
                            style={{
                                width: 60,
                                height: 60,
                            }}
                            src={kid.image || defaultAvatars.kid}
                        />
                    </Box>

                    <Box>
                        <Typography
                            className={clsx([
                                classes.default_typography_bold,
                                classes.default_typography_colorDark,
                                classes.default_typography_capitalize,
                                classes.default_typography_paragraph,
                            ])}
                        >
                            {kid.name}
                        </Typography>
                        <Typography className={clsx([classes.default_typography_colorLight, classes.default_typography_label])}>
                            <FormattedMessage id="group" />:
                            <Box
                                component={'span'}
                                marginX={1}
                                className={clsx([classes.default_typography_bold, classes.default_typography_colorDark, classes.default_typography_capitalize])}
                            >
                                {kid.groupName}
                            </Box>
                        </Typography>
                    </Box>
                </Box>

                {/* ------------------------- */}

                <Box display={'flex'}>
                    <Box marginRight={1}>
                        <Avatar
                            style={{
                                width: 50,
                                height: 50,
                            }}
                            src={DateLogo}
                        />
                    </Box>

                    <Box>
                        <Typography className={clsx([classes.default_typography_colorDark, classes.default_typography_capitalize, classes.default_typography_paragraph])}>
                            {moment(new Date(voucher?.bought_date)).format('dddd')}
                        </Typography>
                        <Typography className={clsx([classes.default_typography_colorSuccess, classes.default_typography_label])}>
                            {moment(new Date(voucher?.bought_date)).format('Do MMMM YYYY')}
                        </Typography>
                    </Box>
                </Box>
            </div>

            <Divider />

            <Box marginY={4} className={classes.infoSection}>
                <Box marginX={'auto'}>
                    <Typography className={clsx([classes.default_typography_colorLight, classes.default_typography_label, classes.default_typography_bold])} align="center">
                        <FormattedMessage id="VOUCHER_NAME" />
                    </Typography>
                    <Typography
                        className={clsx([
                            classes.default_typography_dark,
                            classes.default_typography_subHeading,
                            classes.default_typography_bold,
                            classes.default_typography_capitalize,
                        ])}
                        align="center"
                    >
                        {voucher.name}
                    </Typography>
                </Box>

                <Box marginX={'auto'}>
                    <Typography className={clsx([classes.default_typography_colorLight, classes.default_typography_label, classes.default_typography_bold])} align="center">
                        <FormattedMessage id="PRICE" />
                    </Typography>
                    <Typography className={clsx([classes.default_typography_dark, classes.default_typography_subHeading, classes.default_typography_bold])} align="center">
                        {voucher.price}
                    </Typography>
                </Box>

                <Box marginX={'auto'}>
                    <Typography className={clsx([classes.default_typography_colorLight, classes.default_typography_label, classes.default_typography_bold])} align="center">
                        <FormattedMessage id="TIME" />
                    </Typography>
                    <Typography className={clsx([classes.default_typography_dark, classes.default_typography_subHeading, classes.default_typography_bold])} align="center">
                        {moment(voucher.buy_date_time.toDate()).format('HH:mm')}
                    </Typography>
                </Box>

                <Box marginX={'auto'}>
                    <Typography className={clsx([classes.default_typography_colorLight, classes.default_typography_label, classes.default_typography_bold])} align="center">
                        <FormattedMessage id="REDEEMED_BY" />
                    </Typography>
                    <Typography
                        className={clsx([
                            classes.default_typography_dark,
                            classes.default_typography_subHeading,
                            classes.default_typography_bold,
                            classes.default_typography_capitalize,
                        ])}
                        align="center"
                    >
                        {staff?.name}
                    </Typography>
                </Box>
            </Box>
        </Fragment>
    );
};

const useStyles = makeStyles(theme => {
    return {
        ...getModalStyles(theme),
        ...getSectionHeaderStyles(theme),
        ...getTypographyStyles(theme),
        headerSection: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
        },
        infoSection: {
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
        },
    };
});
