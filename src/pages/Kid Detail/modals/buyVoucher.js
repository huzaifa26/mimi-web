import { Grid,  makeStyles, Typography,Divider, Box, Avatar } from '@material-ui/core';
import React, { Fragment, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Button, } from '../../../components';
import { useStore, useUi } from '../../../store';
import { db } from '../../../utils/firebase';
import { nanoid } from 'nanoid';
import firebase from 'firebase/app';
import DateLogo from '../../../assets/logo/history.png';
import moment from 'moment';
import { getModalStyles, getSectionHeaderStyles, getTypographyStyles } from '../../../utils/helpers';
import clsx from 'clsx';

export const BuyVoucherBody = props => {
    const { handleClose, kid, voucher } = props;
    const classes = useStyles();
    const { state: storeState } = useStore();
    
    const { user, defaultAvatars } = storeState;

    const [redeemloading, setRedeemLoading] = useState(false);
    const [refundloading, setRefundLoading] = useState(false);

    const handleRedeem = async () => {
        setRedeemLoading(true);

        // ------------------------

        await db
            .collection('Institution')
            .doc(user._code)
            .collection('kid')
            .doc(kid.id)
            .update({
                products_owned: firebase.firestore.FieldValue.arrayRemove(voucher),
            });

        const addToStaffList = {
            id: nanoid(),
            bought_date: new Date().toLocaleDateString(),
            product_id: voucher.id,
            price: voucher.price,
            store_id: voucher.store_id,
            use_date: new Date().toLocaleDateString(),
            kid_id: kid.id,
            name: voucher.name,
            image: voucher.image,
        };

        await db
            .collection('Institution')
            .doc(user._code)
            .collection('staff')
            .doc(user.id)
            .update({
                products_redeemed: firebase.firestore.FieldValue.arrayUnion(addToStaffList),
            });
        const addToKidList = {
            id: nanoid(),
            bought_date: new Date().toLocaleDateString(),
            name: voucher.name,
            image: voucher.image,
            product_id: voucher.id,
            price: voucher.price,
            store_id: voucher.store_id,
            use_date: new Date().toLocaleDateString(),
            staff_id: user.id,
            buy_date_time: new Date(),
        };
        await db
            .collection('Institution')
            .doc(user._code)
            .collection('kid')
            .doc(kid.id)
            .update({
                products_used: firebase.firestore.FieldValue.arrayUnion(addToKidList),
            });

        const historyId = nanoid(6);
        await db
            .collection('Institution')
            .doc(user._code)
            .collection('History')
            .doc(historyId)
            .set({
                id: historyId,
                type: 'Redeem Coupon',
                executer: user.name,
                executedBy: kid.name,
                time: new Date(),
                payload: {
                    kid,
                    coupon: voucher,
                },
                _staff: [user.id],
                _kids: [kid.id],
                _groups: [kid.groupId],
            });

        // ------------------------

        setRedeemLoading(false);
        handleClose();
    };
    const handleRefund = async () => {
        setRefundLoading(true);

        const final_score = Number(kid.score) + Number(voucher.price);
        await db.collection('Institution').doc(user._code).collection('kid').doc(kid.id).update({
            score: final_score,
        });
        await db
            .collection('Institution')
            .doc(user._code)
            .collection('kid')
            .doc(kid.id)
            .update({
                products_owned: firebase.firestore.FieldValue.arrayRemove(voucher),
            });

        // ------------------------

        const historyId = nanoid(6);
        await db
            .collection('Institution')
            .doc(user._code)
            .collection('History')
            .doc(historyId)
            .set({
                id: historyId,
                type: 'Refund Coupon',
                executer: user.name,
                executedBy: kid.name,
                time: new Date(),
                payload: {
                    kid,
                    coupon: voucher,
                },
                _staff: [user.id],
                _kids: [kid.id],
                _groups: [kid.groupId],
            });

        setRefundLoading(false);
        handleClose();
    };

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
                            {moment(new Date(voucher?.buy_date)).format('dddd')}
                        </Typography>
                        <Typography className={clsx([classes.default_typography_colorSuccess, classes.default_typography_label])}>
                            {moment(new Date(voucher?.buy_date)).format('Do MMMM YYYY')}
                        </Typography>
                    </Box>
                </Box>
            </div>

            <Divider />

            <Box marginY={4}>
                <Grid container justifyContent="center">
                    <Grid item xs={12} lg={8}>
                        <Box className={classes.infoSection}>
                            <Box>
                                <Typography
                                    className={clsx([classes.default_typography_colorLight, classes.default_typography_label, classes.default_typography_bold])}
                                    align="center"
                                >
                                    <FormattedMessage id="VOUCHER_NAME" />
                                </Typography>
                                <Typography
                                    className={clsx([classes.default_typography_dark, classes.default_typography_subHeading, classes.default_typography_bold])}
                                    align="center"
                                >
                                    {voucher.name}
                                </Typography>
                            </Box>

                            <Box>
                                <Typography
                                    className={clsx([classes.default_typography_colorLight, classes.default_typography_label, classes.default_typography_bold])}
                                    align="center"
                                >
                                    <FormattedMessage id="PRICE" />
                                </Typography>
                                <Typography
                                    className={clsx([classes.default_typography_dark, classes.default_typography_subHeading, classes.default_typography_bold])}
                                    align="center"
                                >
                                    {voucher.price}
                                </Typography>
                            </Box>

                            <Box>
                                <Typography
                                    className={clsx([classes.default_typography_colorLight, classes.default_typography_label, classes.default_typography_bold])}
                                    align="center"
                                >
                                    <FormattedMessage id="TIME" />
                                </Typography>
                                <Typography
                                    className={clsx([classes.default_typography_dark, classes.default_typography_subHeading, classes.default_typography_bold])}
                                    align="center"
                                >
                                    {moment(new Date()).format('HH:mm')}
                                </Typography>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </Box>

            <Box>
                <div className={classes.default_modal_footer}>
                    <Grid container spacing={2} justifyContent="center">
                        <Grid item xs={12} lg={5} justifyContent="center">
                            <Button
                                fullWidth
                                loading={refundloading}
                                disabled={refundloading || redeemloading}
                                className={classes.default_modal_buttonSecondary}
                                onClick={handleRefund}
                            >
                                <FormattedMessage id="refund_coupon" />
                            </Button>
                        </Grid>
                        <Grid item xs={12} lg={5} justifyContent="center">
                            <Button fullWidth loading={redeemloading} disabled={refundloading || redeemloading} onClick={handleRedeem}>
                                <FormattedMessage id="redeem_coupon" />
                            </Button>
                        </Grid>
                    </Grid>
                </div>
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
