import { Grid, Input, makeStyles, TextField, Typography, CircularProgress, Divider } from '@material-ui/core';
import React, { Fragment, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Button, ErrorIcon, Field } from '../../../components';
import { useStore, useUi } from '../../../store';
import { db } from '../../../utils/firebase';
import { nanoid } from 'nanoid';
import { getModalStyles } from '../../../utils/helpers';
import * as yup from 'yup';

export const GrantScoreBody = props => {
    const { handleClose, kid } = props;
    const classes = useStyles();
    const { state: storeState } = useStore();
    const { actions } = useUi();
    const { user } = storeState;

    const [score, setScore] = useState(0);
    const [topicName, setTopicName] = useState('');
    const [loading, setLoading] = useState(false);

    const Schema = useMemo(() => {
        return yup.object().shape({
            score: yup
                .number()
                .transform(value => (isNaN(value) ? 0 : value))
                .positive()
                .min(1)
                .required(),
            topicName: yup.string().min(2).required(),
        });
    }, []);

    const handleSubmit = async () => {
        try {
            Schema.validateSync({
                topicName,
                score,
            });

            setLoading(true);

            const finalScore = Number(kid.score) + Number(score);
            const id = nanoid(6);

            await db
                .collection('Institution')
                .doc(user._code)
                .collection('kid')
                .doc(kid.id)
                .update({
                    score: parseInt(finalScore),
                });
            const group = await db.collection('Institution').doc(user._code).collection('groups').doc(kid.groupId).get();
            await db
                .collection('Institution')
                .doc(user._code)
                .collection('groups')
                .doc(kid.groupId)
                .update({
                    score: Number(group.data().score) + Number(score),
                });
            await db
                .collection('Institution')
                .doc(user._code)
                .collection('History')
                .doc(id)
                .set({
                    type: 'Grant Kid Score',
                    executer: user.name,
                    executedBy: kid.name,
                    time: new Date(),
                    payload: {
                        kid,
                        score,
                        reason: topicName,
                    },
                    id: id,
                    _staff: [user.id],
                    _kids: [kid.id],
                    _groups: [kid.groupId],
                });

            handleClose();
        } catch (error) {
            actions.alert(error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Fragment>
            <Field label={<FormattedMessage id="topic_name" />}>
                <Input className={classes.input} fullWidth value={topicName} onChange={e => setTopicName(e.target.value)} />
            </Field>
            <Field label={<FormattedMessage id="enter_score" />}>
                <Input className={classes.input} fullWidth type="number" inputProps={{ min: 0 }} value={score} onChange={e => setScore(parseInt(e.target.value))} />
            </Field>

            <div className={classes.default_modal_footer}>
                <Grid container spacing={2}>
                    <Grid item xs={6} justifyContent="center">
                        <Button fullWidth disable={loading} className={classes.default_modal_buttonSecondary} onClick={handleClose}>
                            <FormattedMessage id="cancel" />
                        </Button>
                    </Grid>
                    <Grid item xs={6} justifyContent="center">
                        <Button fullWidth disable={loading} loading={loading} onClick={handleSubmit}>
                            <FormattedMessage id="grant" />
                        </Button>
                    </Grid>
                </Grid>
            </div>
        </Fragment>
    );
};

const useStyles = makeStyles(theme => {
    return {
        ...getModalStyles(theme),
    };
});
