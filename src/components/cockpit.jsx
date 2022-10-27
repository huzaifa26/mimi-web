import { makeStyles } from '@material-ui/styles';
import React from 'react';
import { DataTable } from './';

const useStyles = makeStyles(theme => {
    return {
        root: {
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            maxHeight: '100%',
        },
        actionBar: {
            marginBottom: 20,
            [theme.breakpoints.only('xs')]: {
                marginBottom: 10,
            },
        },
    };
});

export const Cockpit = props => {
    const { tableProps, actionBar } = props;

    const { data, headers, renderItem, loadMore } = tableProps;

    const classes = useStyles();

    return (
        <div className={classes.root}>
            {actionBar && <div className={classes.actionBar}>{actionBar}</div>}
            <DataTable headers={headers} data={data} renderItem={renderItem} loadMore={loadMore} />
        </div>
    );
};
