import { Avatar, Box, makeStyles, TableCell, Typography } from '@material-ui/core';
import React, { Fragment } from 'react';
import { DataTable } from '../../../components';
import { useStore } from '../../../store';
import { getModalStyles, getTypographyStyles } from '../../../utils/helpers';

const headers = [
    {
        id: `kid_name`,
    },
    {
        id: `score`,
    },
];

const useStyles = makeStyles(theme => {
    return {
        ...getModalStyles(theme),
        ...getTypographyStyles(theme),
    };
});

export const DisplayKidsBody = props => {
    const { kids } = props;
    const classes = useStyles();
    const { state: storeState } = useStore();
    const { defaultAvatars } = storeState;

    const renderItem = kid => {
        return (
            <Fragment>
                <TableCell>
                    <Box display={'flex'} alignItems={'center'}>
                        <Box marginRight={2}>
                            <Avatar src={kid.image || defaultAvatars?.kid} />
                        </Box>
                        <Typography className={classes.default_typography_capitalize}>{kid.name}</Typography>
                    </Box>
                </TableCell>
                <TableCell>{kid.score}</TableCell>
            </Fragment>
        );
    };

    const kidTableProps = {
        data: kids,
        renderItem,
        headers,
        loadMore: null,
    };

    return (
        <Fragment>
            <DataTable {...kidTableProps} />
        </Fragment>
    );
};
