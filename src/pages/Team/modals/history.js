import { makeStyles } from '@material-ui/core';
import React, { useMemo } from 'react';
import { HistoryTable } from '../../../components';
import { useStore, } from '../../../store';
import { db } from '../../../utils/firebase';
import { getModalStyles, } from '../../../utils/helpers';

export const HistoryBody = props => {
    const {staff } = props;
    const classes = useStyles();
    const { state: storeState } = useStore();

    const { user } = storeState;

    const rootQuery = useMemo(() => db.collection('Institution').doc(user?._code).collection('History').where('_staff', '==', staff.id), []);

    return <HistoryTable rootQuery={rootQuery} hideTitle />;
};

const useStyles = makeStyles(theme => {
    return {
        ...getModalStyles(theme),
    };
});
