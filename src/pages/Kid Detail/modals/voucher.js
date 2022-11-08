import { makeStyles,  TableCell, Box } from '@material-ui/core';
import React, { Fragment, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import {  DataTable, SearchBar, SimpleModal, TabList } from '../../../components';
import { useStore } from '../../../store';
import { db } from '../../../utils/firebase';
import { getModalStyles, getSectionHeaderStyles, searchBy } from '../../../utils/helpers';

import { BuyVoucherBody } from './buyVoucher';
import { RedeemVoucherBody } from './redeemVoucher';

const headers = [
    {
        id: `voucher_name`,
    },
    {
        id: `price`,
    },
    {
        id: `date`,
    },
];

const list = [
    {
        id: 'available',
        label: <FormattedMessage id={'available'} />,
    },
    {
        id: 'redeemed',
        label: <FormattedMessage id={'redeemed'} />,
    },
];

export const VoucherBody = props => {
    const { kidId } = props;
    const classes = useStyles();
    const { state: storeState } = useStore();
    const { user } = storeState;

    const [data, setData] = useState([]);
    const [kid, setKid] = useState();

    const [tab, setTab] = useState();
    const [searchText, setSearchText] = useState('');
    const [selectedVoucher, setSelectedVoucher] = useState();

    const [modalStates, setModalStates] = useState({
        buyVoucher: false,
        redeemVoucher: false,
    });

    const closeBuyVoucherModal = () => {
        setModalStates(prev => ({ ...prev, buyVoucher: false }));
        setSelectedVoucher(null);
    };
    const closeRedeemVoucherModal = () => {
        setModalStates(prev => ({ ...prev, redeemVoucher: false }));
        setSelectedVoucher(null);
    };

    useEffect(() => {
        if (!kidId) return;

        (async () => {
            db.collection('Institution')
                .doc(user?._code)
                .collection('kid')
                .doc(kidId)
                .onSnapshot(async querySnapshot => {
                    setKid(querySnapshot.data());
                });
        })();
    }, [kidId, user._code]);

    useEffect(() => {
        if (!kid) return;

        if (searchText) {
            setData(searchBy(data, ['name'], searchText));
        } else {
            if (tab === 'available') {
                setData(kid.products_owned || []);
            }
            if (tab === 'redeemed') {
                setData(kid.products_used || []);
            }
        }
    }, [kid, searchText, tab]);

    useEffect(() => {
        if (!kid) return;

        if (tab === 'available') {
            setData(kid.products_owned || []);
        }
        if (tab === 'redeemed') {
            setData(kid.products_used || []);
        }
    }, [tab, kid]);

    const actionBar = (
        <div className={classes.default_headerSection_container}>
            <Box marginRight={2}>
                <TabList
                    list={list}
                    onChange={value => {
                        setTab(value.id);
                    }}
                />
            </Box>
            <div
                style={{
                    flex: 1,
                }}
            >
                <SearchBar placeholder={`Search by names`} size={'small'} handleSearch={value => setSearchText(value)} />
            </div>
        </div>
    );

    const renderItem = product => {
        return (
            <Fragment>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.price}</TableCell>
                <TableCell>{product.buy_date || product.bought_date}</TableCell>
            </Fragment>
        );
    };

    const tableProps = {
        data,
        renderItem,
        headers,
        loadMore: null,
        handleRowClick: product => {
            setSelectedVoucher(product);
            if (tab === 'available') {
                setModalStates(prev => ({ ...prev, buyVoucher: true }));
            }
            if (tab === 'redeemed') {
                setModalStates(prev => ({ ...prev, redeemVoucher: true }));
            }
        },
    };

    return (
        <Fragment>
            <SimpleModal title={<FormattedMessage id="view_available_voucher" />} open={modalStates.buyVoucher} handleClose={closeBuyVoucherModal}>
                <BuyVoucherBody voucher={selectedVoucher} kid={kid} handleClose={closeBuyVoucherModal} />
            </SimpleModal>
            <SimpleModal title={<FormattedMessage id="view_redeemed_voucher" />} open={modalStates.redeemVoucher} handleClose={closeRedeemVoucherModal}>
                <RedeemVoucherBody voucher={selectedVoucher} kid={kid} handleClose={closeRedeemVoucherModal} />
            </SimpleModal>

            {actionBar}

            <DataTable {...tableProps} />
        </Fragment>
    );
};

const useStyles = makeStyles(theme => {
    return {
        ...getModalStyles(theme),
        ...getSectionHeaderStyles(theme),
    };
});
