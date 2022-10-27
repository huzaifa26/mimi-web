import { Box, makeStyles, TableCell } from '@material-ui/core';
import React, { Fragment, useEffect, useMemo, useState } from 'react';

import { FormattedMessage } from 'react-intl';
import { AddIcon, Button, DataTable, Links, Loader, MenuSingle, SearchBar, SimpleModal, Status } from '../../components';
import { usePagination } from '../../hooks/usePaginaton';
import { useStore } from '../../store';
import { db } from '../../utils/firebase';

import { ROLES } from '../../utils/constants';
import { getPageStyles, getSectionHeaderStyles, searchBy } from '../../utils/helpers';

import clsx from 'clsx';
import { CreateRoutePlanBody } from './modals/createRoutePlan';
import { RouteDetailsBody } from './modals/routeDetails';

const headers = [
    {
        id: `ROUTE_NAME`,
    },
    {
        id: `STATUS`,
    },
    {
        id: `KID_NUMBER`,
    },
];

const options = [
    {
        id: null,
        label: <FormattedMessage id={'all'} />,
    },
    {
        id: true,
        label: <FormattedMessage id={'active'} />,
    },
    {
        id: false,
        label: <FormattedMessage id={'disabled'} />,
    },
];

export const RoutePlan = React.memo(() => {
    const classes = useStyles();

    const { state: storeState } = useStore();
    const { user, orientation } = storeState;

    const [routePlans, setRoutePlans] = useState([]);
    const [selectedRoutePlan, setSelectedRoutePlan] = useState();
    const [searchText, setSearchText] = useState('');
    const [modalStates, setModalStates] = useState({
        newRoutePlan: false,
        routePlanDetail: false,
    });
    const [status, setStatus] = useState({
        id: null,
        label: <FormattedMessage id={'all'} />,
    });

    const query = useMemo(() => {
        const baseQuery = db.collection('Institution').doc(user._code).collection('routePlan').orderBy('id');
        if (typeof status?.id != 'boolean' && !status.id) return baseQuery;
        return baseQuery.where('status', '==', status.id);
    }, [status]);


    const { data, loading, loadMore, init } = usePagination(query, list => {
        if (user.type === ROLES.admin) {
            return list;
        } else {
            return list.filter(el => {
                if (el.kids.length === 0) return true;
                if (el.groups.some(id => user.group_ids.includes(id))) return true;
                return false;
            });
        }
    });

    const closeNewRoutePlan = () => {
        setModalStates(prev => ({ ...prev, newRoutePlan: false }));
    };

    const closeRoutePlanDetail = () => {
        setModalStates(prev => ({ ...prev, routePlanDetail: false }));
        setSelectedRoutePlan(null);
    };
   console.log(data)
   
    useEffect(() => {
        if (searchText) {
            setRoutePlans(searchBy(data, ['name'], searchText));
        } else {
            setRoutePlans(data);
        }
    }, [searchText, data]);

    const updateOnAdding = async() =>{
        var updateData = [];
        console.log("runooooo")
       await db.collection('Institution').doc(user._code).collection('routePlan').orderBy('id').get()
        .then((querySnapshot)=>{
            querySnapshot.forEach((doc)=>{
                updateData.push(doc.data())
                })
        })
    setRoutePlans(updateData)
       
      
    }

    const links = [
        {
            ref: '/routePlan',
            title: <FormattedMessage id="route_plan" />,
        },
    ];

    const renderLabel = status => {
        return (
            <Box display={'flex'} alignItems="center">
                <FormattedMessage id="show" />
                <Box marginRight={0.5}>:</Box>
                {status.label}
            </Box>
        );
    };

    const renderItem = routePlan => {
        return (
            <Fragment>
                <TableCell>{routePlan.name}</TableCell>
                <TableCell>
                    <Status value={routePlan.status} />
                </TableCell>
                <TableCell>{(routePlan.kids || []).length}</TableCell>
            </Fragment>
        );
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
                        setModalStates(prev => ({ ...prev, newRoutePlan: true }));
                    }}
                >
                    <FormattedMessage id="add_new_route"></FormattedMessage>
                </Button>

                <MenuSingle list={options} label={renderLabel(status)} handleChange={value => setStatus(value)} defaultValue={status} />
            </div>
        </div>
    );

    const tableProps = {
        data: routePlans,
        renderItem,
        headers,
        loadMore,
        handleRowClick: routePlan => {
            setSelectedRoutePlan(routePlan);
            setModalStates(prev => ({ ...prev, routePlanDetail: true }));
        },
    };

    if (loading) return <Loader />;

    return (
        <Fragment>
            <section className={clsx([classes.default_page_root, classes.default_page_Bg1])}>
                <SimpleModal title={<FormattedMessage id="add_new_route" />} open={modalStates.newRoutePlan} handleClose={closeNewRoutePlan}>
                    <CreateRoutePlanBody handleClose={closeNewRoutePlan} update={updateOnAdding} />
                </SimpleModal>
                <SimpleModal extended title={<FormattedMessage id="route_details" />} open={modalStates.routePlanDetail} handleClose={closeRoutePlanDetail}>
                    <RouteDetailsBody routePlanId={selectedRoutePlan?.id} handleClose={closeRoutePlanDetail} />
                </SimpleModal>
                {actionBar}

                <DataTable {...tableProps} />
            </section>
        </Fragment>
    );
});

const useStyles = makeStyles(theme => {
    return {
        ...getSectionHeaderStyles(theme),
        ...getPageStyles(theme),
    };
});
