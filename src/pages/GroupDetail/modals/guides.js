import { Avatar, Box, makeStyles, TableCell, Typography } from '@material-ui/core';
import React, { Fragment } from 'react';
import { DataTable } from '../../../components';
import { useStore } from '../../../store';
import { getModalStyles, getTypographyStyles } from '../../../utils/helpers';

const headers = [
    {
        id: `staff_name`,
    },
    {
        id: `email`,
    },
];

const useStyles = makeStyles(theme => {
    return {
        ...getModalStyles(theme),
        ...getTypographyStyles(theme),
    };
});

export const DisplayGuidesBody = props => {
    const { guides } = props;
    const classes = useStyles();

    const { state: storeState } = useStore();
    const { defaultAvatars } = storeState;

    const renderItem = staff => {
        return (
            <Fragment>
                <TableCell>
                    <Box display={'flex'} alignItems={'center'}>
                        <Box marginRight={2}>
                            <Avatar src={staff?.image || defaultAvatars?.staff} />
                        </Box>
                        <Typography className={classes.default_typography_capitalize}>{staff.name}</Typography>
                    </Box>
                </TableCell>
                <TableCell>{staff.email}</TableCell>
            </Fragment>
        );
    };

    const guidesTableProps = {
        data: guides,
        renderItem,
        headers,
        loadMore: null,
    };

    return (
        <Fragment>
            <DataTable {...guidesTableProps} />
        </Fragment>
    );
};
