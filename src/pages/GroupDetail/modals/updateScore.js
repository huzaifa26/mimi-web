import { Box, Grid, Input, makeStyles, Typography } from '@material-ui/core';
import React, { Fragment, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Button, ErrorIcon, Field } from '../../../components';
import { useStore, useUi } from '../../../store';
import { db } from '../../../utils/firebase';
import { nanoid } from 'nanoid';

import { getModalStyles } from '../../../utils/helpers';

const useStyles = makeStyles(theme => {
    return {
        ...getModalStyles(theme),
    };
});

export const UpdateScoreBody = props => {
    const { handleClose, group } = props;
    const classes = useStyles();
    const { state: storeState } = useStore();
    const { actions } = useUi();
    const { user } = storeState;

    const [score, setScore] = useState(0);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);

        // ------------------------
        const id = nanoid(6);
        let newScore = 0;

        let kidData = await db.collection('Institution').doc(user._code).collection('kid').get();
        let filter = kidData.docs.filter(e => e.data().groupId == group.id);
        await filter.map(
            async e =>
                await db
                    .collection('Institution')
                    .doc(user._code)
                    .collection('kid')
                    .doc(e.data().id)
                    .update({
                        score: Number(score),
                    }),
        );
        kidData = await db.collection('Institution').doc(user._code).collection('kid').get();
        filter = kidData.docs.filter(e => e.data().groupId == group.id);
        filter.map(e => (newScore = Number(newScore) + Number(e.data().score)));
        await db
            .collection('Institution')
            .doc(user._code)
            .collection('groups')
            .doc(group.id)
            .update({
                score: parseInt(newScore),
            });

        await db
            .collection('Institution')
            .doc(user._code)
            .collection('History')
            .doc(id)
            .set({
                type: 'Update Group Score',
                executer: user.name,
                executedBy: group.name,
                time: new Date(),
                payload: {
                    group,
                    score,
                },
                id: id,
                _staff: [user.id],
                _kids: [...group.kids_ids],
                _groups: [group.id],
            });

        // ------------------------

        setLoading(false);
        handleClose();
    };

    return (
        <Fragment>
            <Field label={<FormattedMessage id="group_name" />}>
                <Typography className={classes.input}>{group.name}</Typography>
            </Field>
            <Field label={<FormattedMessage id="enter_score" />}>
                <Input inputProps={{ min: 0 }} type="number" value={score} onChange={e => setScore(e.target.value)} />
            </Field>

            <div className={classes.default_modal_infoContainer}>
                <Box mx={1}>
                    <ErrorIcon style={{ color: '#808191' }} />
                </Box>
                <Typography variant="caption">
                    <FormattedMessage id="change_score_warning" />
                </Typography>
            </div>

            <div className={classes.default_modal_footer}>
                <Grid container spacing={2}>
                    <Grid item xs={6} justifyContent="center">
                        <Button fullWidth disable={loading} className={classes.default_modal_buttonSecondary} onClick={handleClose}>
                            <FormattedMessage id="cancel" />
                        </Button>
                    </Grid>
                    <Grid item xs={6} justifyContent="center">
                        <Button loading={loading} fullWidth disable={loading} onClick={handleSubmit}>
                            <FormattedMessage id="change" />
                        </Button>
                    </Grid>
                </Grid>
            </div>
        </Fragment>
    );
};
