import firebase from 'firebase/app';
import React, { Fragment, useEffect, useMemo, useState } from 'react';
import { Avatar, TableCell, Typography, makeStyles, Box, Grid } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { AddIcon, Cockpit, SearchBar, Button, Loader, SimpleModal, Links, DataTable, MenuMultiple } from '../../components';
import { db } from '../../utils/firebase';
import { useStore, useUi } from '../../store';
import { usePagination } from '../../hooks/usePaginaton';

import Star from '../../assets/icons/starIcon.png';
import StarOut from '../../assets/icons/starOutlinned.png';
import { getSectionHeaderStyles, getPageStyles, FirebaseHelpers, sortBySpecialFavorite, stopEventBubble, searchBy } from '../../utils/helpers';
import clsx from 'clsx';
import { AddKidBody } from './modals/addKid';
import { PERMISSIONS } from '../../utils/constants';

const headers = [
    {
        id: `name`,
    },
    {
        id: `group_name`,
    },
    {
        id: `level`,
    },
];

export const SpecialProgram = React.memo(() => {
    const history = useHistory();
    const classes = useStyles();

    const { state: storeState } = useStore();
    const { actions } = useUi();
    const { user, orientation, defaultAvatars } = storeState;

    const query = useMemo(() => FirebaseHelpers.fetchSpecialKids.query({ user }).orderBy('id'), []);

    const { data, loading, loadMore } = usePagination(query, null, list => sortBySpecialFavorite(list, user.id));
    const [searchedKids, setSearchedKids] = useState([]);
    const [filteredKids, setFilteredKids] = useState([]);
    const [groups, setGroups] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [addKidToSpeicalProgram, setAddKidToSpeicalProgram] = useState(false);

    useEffect(() => {
        if (!data.length) return;

        const validGroups = Object.entries(
            data.reduce((acc, el) => {
                const { groupId, groupName } = el;

                if (!acc[groupId]) acc[groupId] = groupName;

                return acc;
            }, {}),
        ).map(el => {
            const [id, name] = el;
            return {
                id,
                name,
                label: name,
                groupId: id,
            };
        });

        setGroups(validGroups);
        setFilteredKids(validGroups);
    }, [data]);

    useEffect(() => {
        if (searchText) {
            setSearchedKids(searchBy(filteredKids, ['name'], searchText));
        } else {
            setSearchedKids(filteredKids);
        }
    }, [searchText, filteredKids]);

    const links = [
        {
            ref: '/specialProgram',
            title: <FormattedMessage id="special_program" />,
        },
    ];

    const handleFavorite = async kid => {
        if ((kid._favoriteBy || []).includes(user.id)) {
            await db
                .collection('Institution')
                .doc(user._code)
                .collection('kid')
                .doc(kid.id)
                .update({
                    _favoriteBy: firebase.firestore.FieldValue.arrayRemove(user.id),
                });
        } else {
            await db
                .collection('Institution')
                .doc(user._code)
                .collection('kid')
                .doc(kid.id)
                .update({
                    _favoriteBy: firebase.firestore.FieldValue.arrayUnion(user.id),
                });
        }
    };

    const actionBar = (
        <div className={classes.default_headerSection_container}>
            <div className={classes.default_headerSection_pageTitle}>
                <Links links={links} />
            </div>
            <SearchBar placeholder={`Search by names`} size={'small'} handleSearch={value => setSearchText(value)} />
            <div className={classes.default_headerSection_actionsContainer}>
                <Button
                    startIcon={<AddIcon />}
                    onClick={() => {
                        if (!user.permissions[PERMISSIONS.kidSpecialReport]) {
                            return actions.alert("You don't have permission for this action", 'info');
                        }

                        setAddKidToSpeicalProgram(true);
                    }}
                >
                    <FormattedMessage id="add_kids_to_special_program"></FormattedMessage>
                </Button>

                <MenuMultiple
                    list={groups}
                    entity={'Groups'}
                    handleChange={options => {
                        const groupIds = options.map(el => el.id);
                        setFilteredKids(data.filter(el => groupIds.includes(el.groupId)));
                    }}
                />
            </div>
        </div>
    );

    const renderItem = kid => {
        return (
            <Fragment>
                <TableCell>
                    <Box display={'flex'} alignItems="center">
                        <img
                            style={{
                                marginRight: 12,
                            }}
                            src={(kid._favoriteBy || []).includes(user.id) ? Star : StarOut}
                            alt=''
                            onClick={stopEventBubble(() => handleFavorite(kid))}
                        />
                        <Avatar
                            style={{
                                marginRight: 12,
                            }}
                            src={kid.image || defaultAvatars?.kid}
                        />
                        <Typography>{kid.name}</Typography>
                    </Box>
                </TableCell>
                <TableCell>{kid.groupName}</TableCell>
                <TableCell>{kid.level}</TableCell>
            </Fragment>
        );
    };

    const closeModal = () => {
        setAddKidToSpeicalProgram(false);
    };

    const tableProps = {
        data: searchedKids,
        renderItem,
        headers,
        loadMore,
        handleRowClick: kid => {
            history.push(`/specialProgram/${kid.id}`);
        },
    };

    return loading ? (
        <Loader />
    ) : (
        <section className={clsx([classes.default_page_root, classes.default_page_Bg1])}>
            <SimpleModal title={<FormattedMessage id="add_kids_to_special_program" />} open={addKidToSpeicalProgram} handleClose={closeModal}>
                <AddKidBody handleClose={closeModal} />
            </SimpleModal>

            {actionBar}

            <DataTable {...tableProps} />
        </section>
    );
});

const useStyles = makeStyles(theme => {
    return {
        ...getSectionHeaderStyles(theme),
        ...getPageStyles(theme),
    };
});
