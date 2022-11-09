import { Checkbox, Grid, makeStyles, TableCell } from '@material-ui/core';
import React, { Fragment, useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Button, DataTable, MenuMultiple, SearchBar } from '../../../components';
import { useStore, useUi } from '../../../store';
import firebase from 'firebase/app';
import { db } from '../../../utils/firebase';
import { nanoid } from 'nanoid';

import { getModalStyles, getSectionHeaderStyles, searchBy } from '../../../utils/helpers';

const useStyles = makeStyles(theme => {
    return {
        ...getModalStyles(theme),
        ...getSectionHeaderStyles(theme),
    };
});

export const GrantCouponBody = props => {
    const { handleClose, group } = props;
    const classes = useStyles();
    const { state: storeState } = useStore();
    const { actions } = useUi();
    const { user } = storeState;

    const [state, setState] = useState({
        stores: [],
        products: [],
        searchedProducts: [],
        filteredProducts: [],
        selectedProducts: [],
        options: [],
    });

    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(false);
    const selectedProductIds = state.selectedProducts.map(el => el.id);

    const handleSubmit = async () => {
        setLoading(true);

        const historyId = nanoid(6);
        const batch = db.batch();

        group.kids_ids.forEach(kidId => {
            const ref = db.collection('Institution').doc(user?._code).collection('kid').doc(kidId);

            state.selectedProducts.forEach(product => {
                const payload = {
                    buy_date: new Date().toLocaleDateString(),
                    id: nanoid(6),
                    price: product.price,
                    name: product.name,
                    image: product.image,
                    product_id: product.id,
                    store_id: product.storeId,
                    buy_date_time: new Date(),
                };

                batch.update(ref, {
                    products_owned: firebase.firestore.FieldValue.arrayUnion(payload),
                });
            });
        });

        const historyRef = db.collection('Institution').doc(user?._code).collection('History').doc(historyId);

        batch.set(historyRef, {
            type: 'Grant Group Coupon',
            executer: user.name,
            executedBy: group.name,
            time: new Date(),
            payload: {
                coupons: state.selectedProducts,
                group,
            },
            id: historyId,
            _staff: [user.id],
            _kids: [...group.kids_ids],
            _groups: [group.id],
        });

        await batch.commit();

        setLoading(false);
        handleClose();
    };

    const headers = useMemo(
        () => [
            {
                id: ` `,
            },
            {
                id: `voucher_name`,
            },
        ],
        [],
    );

    useEffect(() => {
        (async () => {
            const _stores = (await db.collection('Institution').doc(user?._code).collection('store').get()).docs.map(el => el.data());
            const _products = (
                await Promise.all(
                    _stores.map(async el => {
                        return (await db.collection('Institution').doc(user?._code).collection('store').doc(el.id).collection('products').get()).docs.map(el => el.data());
                    }),
                )
            ).flat();

            setState(prev => ({
                ...prev,
                stores: _stores,
                products: _products,
                filteredProducts: _products,
                options: _stores.map(el => ({
                    id: el.id,
                    name: el.store_name,
                    label: el.store_name,
                    storeId: el.id,
                })),
            }));
        })();
    }, []);

    useEffect(() => {
        if (searchText) {
            setState(prev => ({ ...prev, searchedProducts: searchBy(prev.filteredProducts, ['name'], searchText) }));
        } else {
            setState(prev => ({ ...prev, searchedProducts: prev.filteredProducts }));
        }
    }, [searchText, state.filteredProducts]);

    const handleChange = product => {
        const exists = state.selectedProducts.find(el => el.id === product.id);

        if (exists) {
            setState(prev => ({ ...prev, selectedProducts: prev.selectedProducts.filter(el => el.id !== product.id) }));
        } else {
            setState(prev => ({ ...prev, selectedProducts: [...prev.selectedProducts, product] }));
        }
    };

    const renderItem = product => {
        return (
            <Fragment>
                <TableCell>
                    <Checkbox
                        style={{
                            color: '#685BE7',
                        }}
                        disableRipple
                        onChange={() => handleChange(product)}
                        checked={selectedProductIds.includes(product.id)}
                    />
                </TableCell>
                <TableCell>{product.name}</TableCell>
            </Fragment>
        );
    };

    const actionBar = (
        <div className={classes.default_headerSection_container}>
            <div
                style={{
                    flex: 1,
                }}
            >
                <SearchBar placeholder={"search_by_names"} size={'small'} handleSearch={value => setSearchText(value)} />
            </div>
            <div className={classes.default_headerSection_actionsContainer}>
                <MenuMultiple
                    list={state.options}
                    entity={'Stores'}
                    handleChange={options => {
                        const storeIds = options.map(el => el.id);
                        setState(prev => ({
                            ...prev,
                            filteredProducts: state.products.filter(el => storeIds.includes(el.storeId)),
                        }));
                    }}
                />
            </div>
        </div>
    );

    const tableProps = {
        data: state.searchedProducts,
        renderItem,
        headers,
        loadMore: null,
    };

    return (
        <Fragment>
            {actionBar}
            <DataTable {...tableProps} />

            <div className={classes.default_modal_footer}>
                <Grid container spacing={2}>
                    <Grid item xs={6} justifyContent="center">
                        <Button fullWidth disable={loading} className={classes.default_modal_buttonSecondary} onClick={handleClose}>
                            <FormattedMessage id="cancel" />
                        </Button>
                    </Grid>
                    <Grid item xs={6} justifyContent="center">
                        <Button loading={loading} fullWidth disable={loading} onClick={handleSubmit}>
                            <FormattedMessage id="grant" />
                        </Button>
                    </Grid>
                </Grid>
            </div>
        </Fragment>
    );
};
