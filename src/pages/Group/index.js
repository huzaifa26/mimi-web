import firebase from 'firebase/app';
import React, { Fragment, useEffect, useMemo, useState } from 'react';
import { Avatar, TableCell, Typography, makeStyles, Box } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import clsx from 'clsx';

import { useStore, useUi } from '../../store';
import { usePagination } from '../../hooks/usePaginaton';
import { AddIcon, SearchBar, Button, Loader, SimpleModal, Links, DataTable } from '../../components';
import { getSectionHeaderStyles, getPageStyles, stopEventBubble, sortByFavorite, searchBy, FirebaseHelpers } from '../../utils/helpers';
import { db } from '../../utils/firebase';

import { CreateGroupBody } from './modals/createGroup';

import Star from '../../assets/icons/starIcon.png';
import StarOut from '../../assets/icons/starOutlinned.png';
import { ROLES } from '../../utils/constants';
import { useRef } from 'react';
import { nanoid } from 'nanoid';

const headers = [
    {
        id: `group_name`,
    },
    {
        id: `kids_number`,
    },
    {
        id: `total_score:`,
    },
];

export const Group = React.memo(() => {
    const history = useHistory();
    const classes = useStyles();

    const { state: storeState } = useStore();
    const { actions } = useUi();
    const { user, orientation, defaultAvatars } = storeState;
    // const [groupLog,setGroupLog]=useState({});

    const modifier = useMemo(
        () => async list => {
            const temp = [];
            for (const group of list) {
                const _group = { ...group };

                const groupScore = (await db.collection('Institution').doc(user._code).collection('kid').where('groupId', '==', _group.id).get()).docs
                    .map(el => el.data())
                    .reduce((acc, el) => (acc += el.score), 0);

                _group._score = groupScore;

                temp.push(_group);
            }

            return temp;
        },
        [],
    );

    const query = useMemo(() => FirebaseHelpers.fetchGroups.query({ user }).orderBy('id'), []);

    const { data, loading, loadMore } = usePagination(query, modifier, list => sortByFavorite(list, user.id));
    const [groups, setGroups] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [createGroupModalShow, setCreateGroupModalShow] = useState(false);

    const groupLog = useRef(null);

    // Log
    useEffect(() => {
        return async () => {
            if (groupLog.current !== null) {
                const subject_id = nanoid(6);
                const payload = {
                    id: subject_id,
                    activity: "group",
                    subActivity: groupLog.current.name,
                    uid: user.id
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

    // console.log(groups);
    // --------- the bug seemes like here ----------
    useEffect(() => {
        if (searchText) {
            setGroups(searchBy(data, ['name'], searchText));
        } else {
            setGroups(data);
        }
    }, [searchText, data]);

    const links = [
        {
            ref: '/groups',
            title: <FormattedMessage id="groups" />,
        },
    ];

    const handleFavorite = async group => {
        if ((group.favoriteBy || []).includes(user.id)) {
            await db
                .collection('Institution')
                .doc(user._code)
                .collection('groups')
                .doc(group.id)
                .update({
                    favoriteBy: firebase.firestore.FieldValue.arrayRemove(user.id),
                });
        } else {
            await db
                .collection('Institution')
                .doc(user._code)
                .collection('groups')
                .doc(group.id)
                .update({
                    favoriteBy: firebase.firestore.FieldValue.arrayUnion(user.id),
                });
        }
    };

    const actionBar = (
        <div className={classes.default_headerSection_container}>
            <div className={classes.default_headerSection_pageTitle}>
                <Links links={links} />
            </div>
            <SearchBar placeholder={`Search by names`} size={'small'} handleSearch={value => setSearchText(value)} />
            {
                [ROLES.admin, ROLES.mngr, ROLES.crdntr].includes(user.type) &&
                <div className={classes.default_headerSection_actionsContainer}>
                    <Button
                        startIcon={<AddIcon />}
                        onClick={() => {
                            if ([ROLES.admin, ROLES.mngr, ROLES.crdntr].includes(user.type)) {
                                setCreateGroupModalShow(true);
                            } else {
                                actions.alert('Restricted Access', 'info');
                            }
                        }}
                    >
                        <FormattedMessage id="create_new_group"></FormattedMessage>
                    </Button>
                </div>
            }
        </div>
    );

    const renderItem = group => {
        return (
            <Fragment>
                <TableCell>
                    <Box display={'flex'} alignItems="center">
                        <Box onClick={stopEventBubble(() => handleFavorite(group))}>
                            <img
                                style={{
                                    height: 20,
                                }}
                                src={(group.favoriteBy || []).includes(user.id) ? Star : StarOut}
                                alt=''
                            />
                        </Box>
                        <Box marginX={1}>
                            <Avatar src={group?.image || defaultAvatars?.group} />
                        </Box>

                        <Typography>{group.name}</Typography>
                    </Box>
                </TableCell>
                <TableCell>{group.kids_ids.length}</TableCell>
                <TableCell>{group._score}</TableCell>
            </Fragment>
        );
    };

    const closeModal = () => {
        setCreateGroupModalShow(false);
    };

    const tableProps = {
        data: groups,
        renderItem,
        headers,
        loadMore,
        handleRowClick: group => {
            groupLog.current = group;
            history.push(`/groups/${group.id}`,{group});
        },
    };

    return loading ? (
        <Loader />
    ) : (
        <section className={clsx([classes.default_page_root, classes.default_page_Bg1])}>
            <SimpleModal title={<FormattedMessage id="create_new_group" />} open={createGroupModalShow} handleClose={closeModal}>
                <CreateGroupBody handleClose={closeModal} />
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
