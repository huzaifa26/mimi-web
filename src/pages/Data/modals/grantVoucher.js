import { Input, makeStyles, Typography, TableCell, Checkbox, FormControlLabel, Box, Avatar } from '@material-ui/core';
import { nanoid } from 'nanoid';
import React, { Fragment, useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Steps, SearchBar, MenuMultiple, Summary, Field, DataTable } from '../../../components';
import { useStore, useUi } from '../../../store';
import { db } from '../../../utils/firebase';
import firebase from 'firebase/app';
import { getModalStyles, FirebaseHelpers, getSectionHeaderStyles, getPageStyles, searchBy } from '../../../utils/helpers';
import clsx from 'clsx';

const useStyles = makeStyles(theme => {
    return {
        ...getModalStyles(theme),
        ...getSectionHeaderStyles(theme),
        ...getPageStyles(theme),
        summaryRoot: {
            margin: `0 auto`,
            borderRadius: 20,
            width: 'fit-content',
            background: `#F9FAFA`,
            padding: 10,
        },
        selectAllDiv:{
            display:"flex",justifyContent:"center",alignItems:"center"
        },
        selectAllTypo:{
            fontWeight:"bold"
        }
    };
});

const steps = [
    {
        title: `vouchers`,
        validator: state => {
            if (state.selectedProducts.length == 0) return 'please select a voucher';
        },
        Component: props => {
            const {
                payload: { selectedProducts = [] },
                setPayload,
            } = props;

            const classes = useStyles();

            const [state, setState] = useState({
                stores: [],
                products: [],
                searchedProducts: [],
                filteredProducts: [],
                selectedProducts: [],
                options: [],
            });

            const [searchText, setSearchText] = useState('');

            const selectedProductIds = state.selectedProducts.map(el => el.id);

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

            const { state: storeState } = useStore();
            const { user, defaultAvatars } = storeState;

            useEffect(() => {
                setPayload(prev => ({ ...prev, selectedProducts: state.selectedProducts }));
            }, [state.selectedProducts]);

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
                        selectedProducts,
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
                        <SearchBar placeholder={`Search by names`} size={'small'} handleSearch={value => setSearchText(value)} />
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
                    <section className={clsx([classes.default_page_root, classes.default_page_Bg2])}>
                        <DataTable {...tableProps} />
                    </section>
                </Fragment>
            );
        },
    },
    {
        title: `groups`,
        validator: state => {
            if (state.selectedGroups.length == 0) return 'please select a group';
        },
        Component: props => {
            const { payload, setPayload } = props;
            const classes = useStyles();
            const [searchText, setSearchText] = useState('');

            const [state, setState] = useState({
                groups: [],
                selectedGroups: [],
                searchedGroups: [],
            });

            const selectedGroupIds = state.selectedGroups.map(el => el.id);

            const headers = useMemo(
                () => [
                    {
                        id: ` `,
                    },
                    {
                        id: `GROUP_NAME`,
                    },
                    {
                        id: `KID_NUMBER`,
                    },
                    ,
                ],
                [],
            );

            const { state: storeState } = useStore();
            const { user } = storeState;

            useEffect(() => {
                setPayload(prev => ({ ...prev, selectedGroups: state.selectedGroups }));
            }, [state.selectedGroups]);

            useEffect(() => {
                (async () => {
                    const _groups = await FirebaseHelpers.fetchGroups.execute({ user });
                    setState(prev => ({ ...prev, groups: _groups, selectedGroups: payload.selectedGroups }));
                })();
            }, []);

            useEffect(() => {
                if (searchText) {
                    setState(prev => ({ ...prev, searchedGroups: searchBy(prev.groups, ['name'], searchText) }));
                } else {
                    setState(prev => ({ ...prev, searchedGroups: prev.groups }));
                }
            }, [searchText, state.groups]);

            const handleChange = group => {
                const exists = state.selectedGroups.find(el => el.id === group.id);

                if (exists) {
                    setState(prev => ({ ...prev, selectedGroups: prev.selectedGroups.filter(el => el.id !== group.id) }));
                } else {
                    setState(prev => ({ ...prev, selectedGroups: [...prev.selectedGroups, group] }));
                }
            };
            const handleSelectAll = checked => {
                const groups = state.groups
                if(checked){
                    setState(prev => ({ ...prev, selectedGroups: groups }));
                }else{
                    setState(prev => ({ ...prev, selectedGroups: [] }));
                }
               
            };
            const renderItem = group => {
                return (
                    <Fragment>
                        <TableCell className={classes.cell}>
                            <Checkbox
                                style={{
                                    color: '#685BE7',
                                }}
                                checked={selectedGroupIds.includes(group.id)}
                                disableRipple
                                onChange={() => handleChange(group)}
                            />
                        </TableCell>
                        <TableCell className={classes.cell}>{group.name}</TableCell>
                        <TableCell className={classes.cell}>{group.kids_ids.length}</TableCell>
                    </Fragment>
                );
            };

            const actionBar = (
                <Box display={"flex"} padding="16px" justifyContent={"space-between"}>
                    <SearchBar placeholder={`Search by names`} size={'small'} handleSearch={value => setSearchText(value)} />
                   
                        <Checkbox 
                          style={{
                            color: "#685BE7",
                          }}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        checked={selectedGroupIds.length == state.groups.length}
                        />
                         <Typography className={classes.selectAllTypo}>
                        Select All
                        </Typography>
                </Box>
            );

            const tableProps = {
                data: state.searchedGroups,
                renderItem,
                headers,
                loadMore: null,
            };

            return (
                <Fragment>
                    {actionBar}
                    <section className={clsx([classes.default_page_root, classes.default_page_Bg2])}>
                        <DataTable {...tableProps} />
                    </section>
                </Fragment>
            );
        },
    },
    {
        title: `kids`,
        validator: state => {
            if (state.selectedKids.length == 0) return 'please select a kid';
        },
        Component: props => {
            const {
                payload: { selectedGroups = [], selectedKids = [] },
                setPayload,
            } = props;

            const classes = useStyles();

            const [state, setState] = useState({
                kids: [],
                searchedKids: [],
                filteredKids: [],
                selectedKids: [],
                options: [],
            });

            const [searchText, setSearchText] = useState('');

            const selectedKidsIds = state.selectedKids.map(el => el.id);

            const headers = useMemo(
                () => [
                    {
                        id: ` `,
                    },
                    {
                        id: `KID_NAME`,
                    },
                    {
                        id: `GROUP`,
                    },
                    ,
                ],
                [],
            );

            const { state: storeState } = useStore();
            const { user, defaultAvatars } = storeState;

            useEffect(() => {
                setPayload(prev => ({ ...prev, selectedKids: state.selectedKids }));
            }, [state.selectedKids]);

            useEffect(() => {
                (async () => {
                    const _kids = (
                        await db
                            .collection('Institution')
                            .doc(user?._code)
                            .collection('kid')
                            .where(
                                'groupId',
                                'in',
                                selectedGroups.map(el => el.id),
                            )
                            .get()
                    ).docs.map(el => el.data());
                    setState(prev => ({ ...prev, kids: _kids, filteredKids: _kids, selectedKids }));
                })();
            }, []);

            useEffect(() => {
                if (!selectedGroups.length) return;
                const _groups = selectedGroups.map(el => {
                    return {
                        id: el.id,
                        name: el.name,
                        label: el.name,
                        groupId: el.id,
                    };
                });
                setState(prev => ({ ...prev, options: _groups }));
            }, [selectedGroups]);

            useEffect(() => {
                if (searchText) {
                    setState(prev => ({ ...prev, searchedKids: searchBy(prev.filteredKids, ['name'], searchText) }));
                } else {
                    setState(prev => ({ ...prev, searchedKids: prev.filteredKids }));
                }
            }, [searchText, state.filteredKids]);

            const handleChange = kid => {
                const exists = state.selectedKids.find(el => el.id === kid.id);

                if (exists) {
                    setState(prev => ({ ...prev, selectedKids: prev.selectedKids.filter(el => el.id !== kid.id) }));
                } else {
                    setState(prev => ({ ...prev, selectedKids: [...prev.selectedKids, kid] }));
                }
            };
            const handleSelectAll = checked => {
                const kids = state.kids
                if(checked){
                    setState(prev => ({ ...prev, selectedKids: kids }));
                }else{
                    setState(prev => ({ ...prev, selectedKids: [] }));
                }
               
            };

            const renderItem = kid => {
                return (
                    <Fragment>
                        <TableCell>
                            <Checkbox
                                style={{
                                    color: '#685BE7',
                                }}
                                disableRipple
                                onChange={() => handleChange(kid)}
                                checked={selectedKidsIds.includes(kid.id)}
                            />
                        </TableCell>
                        <TableCell className={classes.cell}>
                            <div>
                                <Avatar
                                    style={{
                                        marginRight: 12,
                                    }}
                                    src={kid.image || defaultAvatars?.kid}
                                />
                                <Typography>{kid.name}</Typography>
                            </div>
                        </TableCell>
                        <TableCell>{kid.groupName}</TableCell>
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
                        <SearchBar placeholder={`Search by names`} size={'small'} handleSearch={value => setSearchText(value)} />
                    </div>
                    <div className={classes.default_headerSection_actionsContainer}>
                        <MenuMultiple
                            list={state.options}
                            entity={'Groups'}
                            handleChange={options => {
                                const groupIds = options.map(el => el.id);
                                setState(prev => ({
                                    ...prev,
                                    filteredKids: state.kids.filter(el => groupIds.includes(el.groupId)),
                                }));
                            }}
                        />
                    </div>
                    <div className={classes.selectAllDiv}>
                        <Typography className={classes.selectAllTypo}>
                            Select All
                        </Typography>
                        <Checkbox 
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        checked={selectedKidsIds.length == state.kids.length}
                        />
                    </div>
                </div>
            );

            const tableProps = {
                data: state.searchedKids,
                renderItem,
                headers,
                loadMore: null,
            };

            return (
                <Fragment>
                    {actionBar}
                    <section className={clsx([classes.default_page_root, classes.default_page_Bg2])}>
                        <DataTable {...tableProps} />
                    </section>
                </Fragment>
            );
        },
    },
    {
        title: `summary`,
        Component: props => {
            const classes = useStyles();
            const {
                payload: { selectedGroups, selectedKids, selectedProducts },
            } = props;

            const summaries = [
                {
                    title: <FormattedMessage id="vouchers" />,
                    summary: selectedProducts.map(el => el.name).join(', '),
                    figure: selectedProducts.length,
                },
                {
                    title: <FormattedMessage id="groups" />,
                    summary: selectedGroups.map(el => el.name).join(', '),
                    figure: selectedGroups.length,
                },
                {
                    title: <FormattedMessage id="kids" />,
                    summary: selectedKids.map(el => el.name).join(', '),
                    figure: selectedKids.length,
                },
            ];

            return (
                <section className={clsx([classes.default_page_root, classes.default_page_Bg2, classes.summaryRoot])}>
                    {summaries.map((el, idx) => (
                        <Summary {...{ ...el, id: idx + 1 }} />
                    ))}
                </section>
            );
        },
    },
];

export const GrantVoucherBody = props => {
    const { handleClose } = props;
    const classes = useStyles();
    const { state: storeState } = useStore();
    const { actions } = useUi();
    const { user, institute } = storeState;

    const [state, setState] = useState({
        selectedProducts: [],
        selectedGroups: [],
        selectedKids: [],
    });

    const handleSubmit = async () => {
        const historyId = nanoid(6);
        const batch = db.batch();

        state.selectedKids.forEach(kid => {
            const ref = db.collection('Institution').doc(user?._code).collection('kid').doc(kid.id);

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
            type: 'Coupon Data',
            executer: user.name,
            executedBy: state.selectedKids.length > 1 ? `${state.selectedKids.length} Kids` : `${state.selectedKids[0].name}`,
            time: new Date(),
            payload: {
                groups: state.selectedGroups,
                kids: state.selectedKids,
                coupons: state.selectedProducts,
            },
            id: historyId,
            _staff: [user.id],
            _groups: state.selectedGroups.map(el => el.id),
            _kids: state.selectedKids.map(el => el.id),
        });

        await batch.commit();

        handleClose();
    };

    return <Steps steps={steps} stepsState={state} setStepsState={setState} handleClose={handleClose} handleSubmit={handleSubmit} />;
};
