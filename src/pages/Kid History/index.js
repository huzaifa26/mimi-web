import React, { useMemo } from 'react';
import makeStyles from '@material-ui/styles/makeStyles';
import { useParams } from 'react-router-dom';
import clsx from 'clsx';

import { useStore } from '../../store';
import { HistoryTable } from '../../components';
import { db } from '../../utils/firebase';
import { getPageStyles } from '../../utils/helpers';

const useStyles = makeStyles(theme => {
    return {
        ...getPageStyles(theme),
    };
});

export const KidHistory = () => {
    const classes = useStyles();
    const params = useParams();

    const { state: storeState } = useStore();
    const { user } = storeState;

    const rootQuery = useMemo(() => db.collection('Institution').doc(user?._code).collection('History').where('_kids', 'array-contains', params.id), []);

    return (
        <section className={clsx([classes.default_page_root, classes.default_page_Bg1])}>
            <HistoryTable rootQuery={rootQuery} />
        </section>
    );
};
