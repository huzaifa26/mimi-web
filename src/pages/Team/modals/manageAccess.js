import { Grid, makeStyles, TableCell, Checkbox, FormControlLabel } from '@material-ui/core';
import React, { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Button, SearchBar, MenuMultiple, DataTable } from '../../../components';
import { useStore, useUi } from '../../../store';
import { getModalStyles, FirebaseHelpers, getPageStyles, getSectionHeaderStyles, searchBy } from '../../../utils/helpers';

import clsx from 'clsx';
import intersectionWith from 'lodash/intersectionWith';
import differenceWith from 'lodash/differenceWith';
import { db } from '../../../utils/firebase';
import firebase from 'firebase/app';
import Reset from '../../../assets/icons/reset.png';
import { ROLES,  } from '../../../utils/constants';

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
    const { handleClose, staff } = props;
    const classes = useStyles();
    const { state: storeState } = useStore();
    const { actions } = useUi();
    const { user } = storeState;

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
    });

    const kidsContainerScroll = useRef();

    const selectedGroupIds = state.selectedGroups.map(el => el.id);
    const selectedKidIds = state.selectedKids.map(el => el.id);
    const canSelectKids = useMemo(() => [ROLES.gStaff].includes(staff.type), [staff]);
    const canSelectSingleGroup = useMemo(() => [ROLES.guide].includes(staff.type), [staff]);

    useEffect(() => {
        (async () => {
            const currentStaff = { ...staff, _code: user?._code, type: ROLES.admin };
            const groups = await FirebaseHelpers.fetchGroups.execute({ user: currentStaff });
            setState(prev => ({ ...prev, groups }));
            const kids = await FirebaseHelpers.fetchKids.execute({ user: currentStaff });
            setState(prev => ({ ...prev, kids }));
        })();
    }, []);

    useEffect(() => {
        const { groups, kids } = state;
        if (!groups.length || !kids.length) return;
        const selectedKidIds = staff.kids_access;
        const selectedGroupIds = staff.group_ids;

        // const selectedGroups = groups.filter(el => el.kids_ids.some(id => selectedKidIds.includes(id)));
        const selectedGroups = selectedGroupIds.map(id => groups.find(el => el.id == id)).filter(el => el);
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

        if (intersection.length === state.searchedKids.length) {
            setState(prev => ({ ...prev, selectAll: true }));
        } else {
            setState(prev => ({ ...prev, selectAll: false }));
        }
    }, [state.selectedKids, state.searchedKids]);

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

            if (canSelectSingleGroup) {
                setState(prev => {
                    return {
                        ...prev,
                        selectedGroups: [group],
                        selectedKids: kidsToBeSelected,
                    };
                });
            } else {
                setState(prev => {
                    return {
                        ...prev,
                        selectedGroups: [...prev.selectedGroups, group],
                        selectedKids: [...prev.selectedKids.filter(el => el.groupId !== group.id), ...kidsToBeSelected],
                    };
                });
            }
        }
    };

    const handleKidChange = kid => {
        const { selectedKids } = state;
        const exists = selectedKids.find(el => el.id == kid.id);
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

    const handleReset = () => {
        // const { groups, kids } = state;
        // const selectedKidIds = staff.kids_access;
        // const selectedGroups = groups.filter(el => el.kids_ids.some(id => selectedKidIds.includes(id)));
        // const selectedKids = selectedKidIds.map(id => kids.find(el => el.id == id)).filter(el => el);
        // setState(prev => ({ ...prev, selectedGroups, selectedKids }));
        setState(prev => ({ ...prev, selectedGroups: [], selectedKids: [] }));
    };

    const handleSubmit = async () => {
        try {
            if (staff.type === ROLES.guide && state.selectedGroups.length > 1) {
                return actions.alert('Only one group can be assigned to Guide');
            }

            const batch = db.batch();

            const _selectedKids = state.selectedKids.map(el => el.id);
            const _selectedGroups = state.selectedGroups.map(el => el.id);
            const _removeKids = differenceWith(staff.kids_access, _selectedKids, (a, b) => a === b);
            const _removeGroups = differenceWith(staff.group_ids, _selectedGroups, (a, b) => a === b);

            _selectedKids.map(id => {
                const ref = db.collection('Institution').doc(user?._code).collection('kid').doc(id);
                batch.update(ref, {
                    staffId: firebase.firestore.FieldValue.arrayUnion(staff.id),
                });
            });
            _removeKids.map(id => {
                const ref = db.collection('Institution').doc(user?._code).collection('kid').doc(id);
                batch.update(ref, {
                    staffId: firebase.firestore.FieldValue.arrayRemove(staff.id),
                });
            });
            _selectedGroups.map(id => {
                const ref = db.collection('Institution').doc(user?._code).collection('groups').doc(id);
                batch.update(ref, {
                    staffId: firebase.firestore.FieldValue.arrayUnion(staff.id),
                });
            });

            _removeGroups.map(id => {
                const ref = db.collection('Institution').doc(user?._code).collection('groups').doc(id);
                batch.update(ref, {
                    staffId: firebase.firestore.FieldValue.arrayRemove(staff.id),
                });
            });

            _selectedKids.map(id => {
                const ref = db.collection('Institution').doc(user?._code).collection('staff').doc(staff.id);
                batch.update(ref, {
                    kids_access: firebase.firestore.FieldValue.arrayUnion(id),
                });
            });
            _removeKids.map(id => {
                const ref = db.collection('Institution').doc(user?._code).collection('staff').doc(staff.id);
                batch.update(ref, {
                    kids_access: firebase.firestore.FieldValue.arrayRemove(id),
                });
            });

            _selectedGroups.map(id => {
                const ref = db.collection('Institution').doc(user?._code).collection('staff').doc(staff.id);
                batch.update(ref, {
                    group_ids: firebase.firestore.FieldValue.arrayUnion(id),
                });
            });

            _removeGroups.map(id => {
                const ref = db.collection('Institution').doc(user?._code).collection('staff').doc(staff.id);
                batch.update(ref, {
                    group_ids: firebase.firestore.FieldValue.arrayRemove(id),
                });
            });
            await batch.commit();
            setLoading(true);
            setLoading(false);
            handleClose();
        } catch (error) {
             // error
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
            <div className={classes.default_headerSection_container}>
                <div
                    style={{
                        flex: 1,
                    }}
                >
                    <SearchBar placeholder={`Search by names`} size={'small'} handleSearch={value => setState(prev => ({ ...prev, searchText: value }))} />
                </div>
                <div className={classes.default_headerSection_actionsContainer}>
                    <Button startIcon={<img src={Reset} />} onClick={handleReset}>
                        <FormattedMessage id="reset_access" />
                    </Button>

                    {canSelectKids && (
                        <Fragment>
                            <MenuMultiple list={state.groupOptions} entity={'Groups'} handleChange={handleMenuChange} />
                            <FormControlLabel
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
                        </Fragment>
                    )}
                </div>
            </div>

            <section className={clsx([classes.default_page_root, classes.default_page_removePadding])}>
                <div className={classes.gridContainer}>
                    <div className={classes.default_page_scrollContainer}>
                        <section className={clsx([classes.default_page_root, classes.default_page_removePadding, classes.default_page_removeCurves])}>
                            <DataTable {...groupTableProps} />
                        </section>
                    </div>
                    {canSelectKids && (
                        <div className={classes.default_page_scrollContainer}>
                            <section className={clsx([classes.default_page_root, classes.default_page_removePadding, classes.default_page_removeCurves])}>
                                <DataTable {...kidTableProps} />
                            </section>
                        </div>
                    )}
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
        ...getPageStyles(theme),
        ...getSectionHeaderStyles(theme),
        ...getModalStyles(theme),
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
