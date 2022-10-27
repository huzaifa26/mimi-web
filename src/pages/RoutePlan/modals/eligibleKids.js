import { TableCell, makeStyles, Grid, Avatar, Typography } from '@material-ui/core';
import React, { Fragment } from 'react';
import { useStore } from '../../../store';
import { useHistory } from 'react-router-dom';
import { getModalStyles } from '../../../utils/helpers';
import { DataTable } from '../../../components';

const headers = [
    {
        id: `kid_name`,
    },
    {
        id: `group_name`,
    },
];

export const EligibleKidsBody = props => {
    const history = useHistory();
    const { kids } = props;
    const { state: storeState } = useStore();
    const { defaultAvatars } = storeState;

    const renderItem = kid => {
        return (
            <Fragment>
                <TableCell>
                    <Grid container alignItems="center">
                        <Avatar
                            onClick={() => {
                                history.push(`/kids/${kid.id}`);
                            }}
                            style={{
                                marginRight: 12,
                            }}
                            src={kid.image || defaultAvatars?.kid}
                        />
                        <Typography>{kid.name}</Typography>
                    </Grid>
                </TableCell>
                <TableCell>{kid.groupName}</TableCell>
            </Fragment>
        );
    };

    const tableProps = {
        data: kids,
        renderItem,
        headers,
        loadMore: null,
    };

    return <DataTable {...tableProps} />;
};
