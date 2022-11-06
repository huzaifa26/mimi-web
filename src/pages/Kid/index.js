import firebase from 'firebase/app';
import React, { Fragment, useEffect, useMemo, useState } from 'react';
import { Avatar, TableCell, Typography, makeStyles, Grid, Box } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { AddIcon, Cockpit, SearchBar, Button, Loader, MenuMultiple, Links, DataTable } from '../../components';
import { db } from '../../utils/firebase';
import { getSectionHeaderStyles, getPageStyles, sortByFavorite, stopEventBubble, searchBy, FirebaseHelpers } from '../../utils/helpers';
import { useStore } from '../../store';
import { usePagination } from '../../hooks/usePaginaton';

import Star from '../../assets/icons/starIcon.png';
import StarOut from '../../assets/icons/starOutlinned.png';
import clsx from 'clsx';
import { nanoid } from 'nanoid';
import { useRef } from 'react';

const headers = [
    {
        id: `kid_name`,
    },
    {
        id: `group_name`,
    },
    {
        id: `score`,
    },
];

const useStyles = makeStyles(theme => {
    return { ...getSectionHeaderStyles(theme), ...getPageStyles(theme) };
});

export const Kid = React.memo(() => {
    const history = useHistory();
    const classes = useStyles();

    const { state: storeState } = useStore();
    const { user, orientation, defaultAvatars } = storeState;

    const query = useMemo(() => FirebaseHelpers.fetchKids.query({ user }).orderBy('id'), []);

    const { data, loading, loadMore } = usePagination(query, null, list => sortByFavorite(list, user.id));
    const [kids, setKids] = useState([]);
    const [filteredKids, setFilteredKids] = useState([]);
    const [searchText, setSearchText] = useState('');

    const [groups, setGroups] = useState([]);

    //Log
    useEffect(() => {
        return async () => {
            if(kidLog.current !== null){
                const subject_id = nanoid(6);
                const payload={
                    id:subject_id,
                    activity:"kid profile",
                    subActivity:kidLog?.current?.name,
                    uid:user.id
                }
                console.log(payload);
                await db
                    .collection('Institution')
                    .doc(user._code)
                    .collection('log')
                    .doc(payload.id)
                    .set(payload)
            }
        }
    }, [])

    const kidLog = useRef(null);

    //Log
    useEffect(() => {
        return async () => {
            if (kidLog.current !== null) {
                const subject_id = nanoid(6);
                const payload = {
                    id: subject_id,
                    activity: "kid profile",
                    subActivity: kidLog?.current?.name,
                    uid: user.id
                }
                console.log("kid " + kidLog?.current?.name + " opened, uid:" + user.id);

                // await db
                //     .collection('Institution')
                //     .doc(user._code)
                //     .collection('log')
                //     .doc(payload.id)
                //     .set(payload)
            }
        }
    }, [])

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
        setFilteredKids(data);
    }, [data]);

    useEffect(() => {
        if (searchText) {
            setKids(searchBy(filteredKids, ['name', 'groupName', 'level'], searchText));
        } else {
            setKids(filteredKids);
        }
    }, [searchText, filteredKids]);

    const links = [
        {
            ref: '/kids',
            title: <FormattedMessage id="kids" />,
        },
    ];

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
                        history.push(`/kids/register`);
                    }}
                >
                    <FormattedMessage id="add_new_kid" />
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

    const handleFavorite = async kid => {
        if ((kid.favoriteBy || []).includes(user.id)) {
            await db
                .collection('Institution')
                .doc(user._code)
                .collection('kid')
                .doc(kid.id)
                .update({
                    favoriteBy: firebase.firestore.FieldValue.arrayRemove(user.id),
                });
        } else {
            await db
                .collection('Institution')
                .doc(user._code)
                .collection('kid')
                .doc(kid.id)
                .update({
                    favoriteBy: firebase.firestore.FieldValue.arrayUnion(user.id),
                });
        }
    };

    const renderItem = kid => (
        <Fragment>
            <TableCell>
                <Box display={'flex'} alignItems="center">
                    <img src={kid?.favoriteBy?.includes(user?.id) ? Star : StarOut} alt="pin" onClick={stopEventBubble(() => handleFavorite(kid))} />
                    <Box mx={1}>
                        <Avatar src={kid?.image || defaultAvatars?.kid} />
                    </Box>
                    <Typography>{kid?.name}</Typography>
                </Box>
            </TableCell>
            <TableCell>{kid?.groupName}</TableCell>
            <TableCell>{kid?.score}</TableCell>
        </Fragment>
    );


    const tableProps = {
        data: kids,
        renderItem,
        headers,
        loadMore,
        handleRowClick: kid => {
            kidLog.current = kid;
            history.push(`/kids/${kid.id}`);
        },
    };

    return loading ? (
        <Loader />
    ) : (
        <section className={clsx([classes.default_page_root, classes.default_page_Bg1])}>
            {actionBar}

            <DataTable {...tableProps} />
        </section>
    );
});
