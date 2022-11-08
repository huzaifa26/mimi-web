import { Grid, makeStyles, Typography, TableCell, Checkbox, FormControlLabel } from '@material-ui/core';
import React, { Fragment, useEffect, useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Button, SearchBar, MenuMultiple, DataTable } from '../../../components';
import { useStore, useUi } from '../../../store';
import { getModalStyles, FirebaseHelpers, getPageStyles, getTypographyStyles, getSectionHeaderStyles, searchBy } from '../../../utils/helpers';
import IconOne from '../../../assets/logo/routeIcon.png';
import clsx from 'clsx';
import intersectionWith from 'lodash/intersectionWith';
import differenceWith from 'lodash/differenceWith';
import { db } from '../../../utils/firebase';

const groupHeaders = [
    {
        id: `GROUP_NAME`,
    },
    {
        id: `KID_NUMBER`,
    },
    {
        id: `ACCESS`,
    },
];

const kidHeaders = [
    {
        id: `KID_NAME`,
    },
    {
        id: `GROUP`,
    },
    {
        id: `ACCESS`,
    },
];

export const ManageAccessBody = props => {
    const { handleClose, routePlan } = props;
    const classes = useStyles();
    const { state: storeState } = useStore();
    const { user } = storeState;
    const { actions } = useUi();
    const [loading, setLoading] = useState(false);

    const [state, setState] = useState({
        kids: [],
        selectedKids: [],
        filteredKids: [],
        searchedKids: [],
        groups: [],
        groupOptions: [],
        selectedGroups: [],
        filteredGroups: [],
        searchText: '',
        selectAll: false,
        disableSelectAll: false,
    });

    const kidsContainerScroll = useRef();

    const selectedGroupIds = state.selectedGroups.map(el => el.id);
    const selectedKidIds = state.selectedKids.map(el => el.id);

    useEffect(() => {
        (async () => {
            const groups = await FirebaseHelpers.fetchGroups.execute({ user });
            setState(prev => ({ ...prev, groups }));
            const kids = await FirebaseHelpers.fetchKids.execute({ user, groupIds: state.groups.map(el => el.id) });
            setState(prev => ({ ...prev, kids }));
        })();
    }, []);

    useEffect(() => {
        const { groups, kids } = state;
        if (!groups.length || !kids.length) return;
        const selectedKidIds = routePlan.kids;
        const selectedGroups = groups.filter(el => el.kids_ids.some(id => selectedKidIds.includes(id)));
        const selectedKids = selectedKidIds.map(id => kids.find(el => el.id == id)).filter(el => el);
        setState(prev => ({ ...prev, selectedGroups, selectedKids }));
    }, [state.kids, state.groups]);

    useEffect(() => {
        setState(prev => {
            const _options = prev.selectedGroups.map(el => {
                return {
                    id: el.id,
                    name: el.name,
                    label: el.name,
                };
            });
            const groupIds = _options.map(el => el.id);
            const kidsToShow = prev.kids.filter(el => groupIds.includes(el.groupId));
            return {
                ...prev,
                filteredKids: kidsToShow,
                groupOptions: _options,
            };
        });
    }, [state.selectedGroups]);

    useEffect(() => {
        setState(prev => {
            const groupIds = prev.filteredGroups.map(el => el.id);
            const kidsToShow = prev.kids.filter(el => groupIds.includes(el.groupId));
            return {
                ...prev,
                filteredKids: kidsToShow,
            };
        });
    }, [state.filteredGroups]);

    useEffect(() => {
        const { searchText } = state;
        if (searchText.length) {
            setState(prev => ({ ...prev, searchedKids: searchBy(prev.filteredKids, ['name'], searchText) }));
        } else {
            setState(prev => ({ ...prev, searchedKids: prev.filteredKids }));
        }
    }, [state.searchText, state.filteredKids]);

    useEffect(() => {
        const intersection = intersectionWith(state.searchedKids, state.selectedKids, (a, b) => a.id === b.id);

        if (intersection.length === state.searchedKids.length && state.searchedKids.length) {
            setState(prev => ({ ...prev, selectAll: true }));
        } else {
            setState(prev => ({ ...prev, selectAll: false }));
        }
    }, [state.selectedKids, state.searchedKids]);

    useEffect(() => {
        setState(prev => ({ ...prev, disableSelectAll: !state.searchedKids.length }));
    }, [state.searchedKids]);

    const handleMenuChange = options => {
        kidsContainerScroll.current?.scrollArea?.scrollTop();
        const groupIds = options.map(el => el.id);
        setState(prev => ({ ...prev, filteredGroups: prev.groups.filter(el => groupIds.includes(el.id)) }));
    };

    const handleGroupChange = group => {
        kidsContainerScroll.current?.scrollArea?.scrollTop();
        const { selectedGroups, selectedKids, kids } = state;
        const exists = selectedGroups.find(el => el.id === group.id);
        if (exists) {
            const _selectedGroups = selectedGroups.filter(el => el.id != group.id);
            const _selectedKids = selectedKids.filter(el => el.groupId != group.id);
            setState(prev => ({ ...prev, selectedKids: _selectedKids, selectedGroups: _selectedGroups }));
        } else {
            const kidsToBeSelected = kids.filter(el => el.groupId === group.id);
            setState(prev => {
                return {
                    ...prev,
                    selectedGroups: [...prev.selectedGroups, group],
                    selectedKids: [...prev.selectedKids.filter(el => el.groupId !== group.id), ...kidsToBeSelected],
                };
            });
        }
    };

    const handleKidChange = kid => {
        const { selectedKids } = state;
        const exists = selectedKids.find(el => el.id === kid.id);
        if (exists) {
            setState(prev => ({ ...prev, selectedKids: prev.selectedKids.filter(el => el.id !== kid.id) }));
        } else {
            setState(prev => ({ ...prev, selectedKids: [...prev.selectedKids, kid] }));
        }
    };

    const handleSelectAll = () => {
        const { selectAll, selectedKids, searchedKids } = state;
        const _selectAll = !selectAll;

        const difference = differenceWith(selectedKids, searchedKids, (a, b) => a.id === b.id);
        if (_selectAll) {
            setState(prev => ({ ...prev, selectedKids: [...difference, ...searchedKids], selectAll: _selectAll }));
        } else {
            setState(prev => ({ ...prev, selectedKids: difference, selectAll: _selectAll }));
        }
    };

    const handleSubmit = async () => {
        try {
            const _selectedKids = state.selectedKids.map(el => el.id);
            const _selectedGroups = state.selectedGroups.map(el => el.id);

            const _removeKids = differenceWith(routePlan.kids, _selectedKids, (a, b) => a === b);

            const batch = db.batch();

            _removeKids.forEach(kidId => {
                const ref = db.collection('Institution').doc(user?._code).collection('kid').doc(kidId);
                batch.update(ref, {
                    route_id: '',
                });
            });

            _selectedKids.forEach(kidId => {
                const ref = db.collection('Institution').doc(user?._code).collection('kid').doc(kidId);
                batch.update(ref, {
                    route_id: routePlan.id,
                });
            });
            const ref = db.collection('Institution').doc(user?._code).collection('routePlan').doc(routePlan.id);
            batch.update(ref, {
                kids: _selectedKids,
                groups: _selectedGroups,
            });
            // ----------------------------------------
            await batch.commit();

            setLoading(true);
            setLoading(false);
            handleClose();
        } catch (error) {
           actions.alert(error,"error");
        }
    };

    const renderGroup = group => {
        return (
            <Fragment>
                <TableCell className={classes.cell}>{group.name}</TableCell>
                <TableCell className={classes.cell}>{group.kids_ids.length}</TableCell>
                <TableCell className={classes.cell}>
                    <Checkbox
                        style={{
                            color: '#685BE7',
                        }}
                        onChange={() => handleGroupChange(group)}
                        checked={selectedGroupIds.includes(group.id)}
                    />
                </TableCell>
            </Fragment>
        );
    };

    const renderKid = kid => {
        return (
            <Fragment>
                <TableCell className={classes.cell}>{kid.name}</TableCell>
                <TableCell className={classes.cell}>{kid.groupName}</TableCell>
                <TableCell className={classes.cell}>
                    <Checkbox
                        style={{
                            color: '#685BE7',
                        }}
                        onChange={() => handleKidChange(kid)}
                        checked={selectedKidIds.includes(kid.id)}
                    />
                </TableCell>
            </Fragment>
        );
    };

    const groupTableProps = {
        data: state.groups,
        renderItem: renderGroup,
        headers: groupHeaders,
        loadMore: null,
    };
    const kidTableProps = {
        data: state.searchedKids,
        renderItem: renderKid,
        headers: kidHeaders,
        loadMore: null,
        ref: kidsContainerScroll,
    };

    return (
        <Fragment>
            <Grid container spacing={2}>
                <Grid item lg={6} md={6} sm={6} xs={12}>
                    <div className={classes.pillContainer}>
                        <img src={IconOne} alt="icon"/>
                        <div>
                            <Typography className={classes.pillLabel}>
                                <FormattedMessage id="selected_groups"></FormattedMessage>
                            </Typography>
                            <Typography className={classes.pillHeading}>{state.selectedGroups.length}</Typography>
                        </div>
                    </div>
                </Grid>
                <Grid item lg={6} md={6} sm={6} xs={12}>
                    <div className={classes.pillContainer}>
                        <img src={IconOne} alt="icon"/>
                        <div>
                            <Typography className={classes.pillLabel}>
                                <FormattedMessage id="selected_kids"></FormattedMessage>
                            </Typography>
                            <Typography className={classes.pillHeading}>{state.selectedKids.length}</Typography>
                        </div>
                    </div>
                </Grid>
                {/* <Grid item lg={4} md={4} sm={4} xs={12}>
                    <div className={classes.pillContainer}>
                        <img src={IconThree} />
                        <div>
                            <Typography className={classes.pillLabel}>
                                <FormattedMessage id="total_kids"></FormattedMessage>
                            </Typography>
                            <Typography className={classes.pillHeading}>{state.kids.length}</Typography>
                        </div>
                    </div>
                </Grid> */}
            </Grid>

            <div className={classes.default_headerSection_container}>
                <div
                    style={{
                        flex: 1,
                    }}
                >
                    <SearchBar placeholder={`Search by names`} size={'small'} handleSearch={value => setState(prev => ({ ...prev, searchText: value }))} />
                </div>
                <div className={classes.default_headerSection_actionsContainer}>
                    <MenuMultiple list={state.groupOptions} entity={'Groups'} handleChange={handleMenuChange} />
                    <FormControlLabel
                        disabled={state.disableSelectAll}
                        control={
                            <Checkbox
                                style={{
                                    color: '#685BE7',
                                }}
                                onChange={() => handleSelectAll()}
                                disableRipple
                                checked={state.selectAll}
                            />
                        }
                        label={<FormattedMessage id="select_all_kids" />}
                    />
                </div>
            </div>

            <section className={clsx([classes.default_page_root, classes.default_page_removePadding])}>
                <div className={classes.gridContainer}>
                    <div className={classes.default_page_scrollContainer}>
                        <section className={clsx([classes.default_page_root, classes.default_page_removePadding, classes.default_page_removeCurves])}>
                            <DataTable {...groupTableProps} />
                        </section>
                    </div>
                    <div className={classes.default_page_scrollContainer}>
                        <section className={clsx([classes.default_page_root, classes.default_page_removePadding, classes.default_page_removeCurves])}>
                            <DataTable {...kidTableProps} />
                        </section>
                    </div>
                </div>
            </section>

            <div className={classes.default_modal_footer}>
                <Grid container justifyContent="flex-end">
                    <Grid item xs={12} sm={4} justifyContent="center">
                        <Button loading={loading} fullWidth disable={loading} onClick={handleSubmit}>
                            <FormattedMessage id="update" />
                        </Button>
                    </Grid>
                </Grid>
            </div>
        </Fragment>
    );
};

const useStyles = makeStyles(theme => {
    return {
        ...getTypographyStyles(theme),
        ...getSectionHeaderStyles(theme),
        ...getModalStyles(theme),
        ...getPageStyles(theme),
        pillContainer: {
            borderRadius: 17,
            border: `1px solid #E1E1E1`,
            padding: 10,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            '& img': {
                height: '80%',
                width: 'auto',
                marginRight: 12,
            },
        },
        pillLabel: {
            fontSize: 12,
            color: '#8F92A1',
            fontWeight: 400,
        },
        pillHeading: {
            lineHeight: 1,
            fontSize: 32,
            fontWeight: 600,
        },
        cell: {
            padding: 5,
        },
        gridContainer: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gridGap: 20,
            height: '100%',
            overflow: 'hidden',
            [theme.breakpoints.down('sm')]: {
                gridTemplateColumns: '1fr',

                '& $default_page_root': {
                    maxHeight: '60vmin',
                },
            },
        },
    };
});
