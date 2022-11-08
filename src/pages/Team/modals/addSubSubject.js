import { Grid, Input, makeStyles, TextField, Typography, CircularProgress, Divider } from '@material-ui/core';
import React, { Fragment, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Button, Field } from '../../../components';
import { useStore, useUi } from '../../../store';
import { db, app } from '../../../utils/firebase';
import firebase from 'firebase/app';
import { nanoid } from 'nanoid';
import { getModalStyles } from '../../../utils/helpers';

const useStyles = makeStyles(theme => {
    return {
        ...getModalStyles(theme),
    };
});

export const AddSubSubjectBody = props => {
    const { handleClose, subject, staff } = props;
    const classes = useStyles();
    const { state: storeState } = useStore();
    const { actions } = useUi();
    const { user } = storeState;

    const [score, setScore] = useState(0);
    const [subjectName, setSubjectName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleTotalPoints = () => {
        if (subject.subSubject.length > 0) {
            const updatedTotalPoints = Number(subject.totalPoints) + Number(score);
            return updatedTotalPoints;
        } else {
            return score;
        }
    };

    const handleSubmit = async () => {
        setLoading(true);

        // ------------------------
        const id = nanoid();
        const pointsSum = handleTotalPoints();

        const payload = {
            id: id,
            name: subjectName,
            totalPoints: parseInt(score),
            obtainedPoints: 0,
        };

        await db
            .collection('Institution')
            .doc(user?._code)
            .collection('staff')
            .doc(staff.id)
            .collection('report_templates')
            .doc(subject.id)
            .update({
                subSubject: firebase.firestore.FieldValue.arrayUnion(payload),
                hasSubSubject: true,
                totalPoints: Number(pointsSum),
            });

        setLoading(false);
        handleClose();
    };

    return (
        <Fragment>
            <Field label={<FormattedMessage id="subject_name" />}>
                <Input className={classes.input} value={subjectName} onChange={e => setSubjectName(e.target.value)} />
            </Field>

            <Field label={<FormattedMessage id="max_score" />}>
                <Input inputProps={{ min: 0 }} className={classes.input} type="number" value={score} onChange={e => setScore(e.target.value)} />
            </Field>

            <Grid container spacing={2}>
                <Grid item xs={6} justifyContent="center">
                    <Button fullWidth disable={loading} className={classes.default_modal_buttonSecondary} onClick={handleClose}>
                        <FormattedMessage id="cancel" />
                    </Button>
                </Grid>
                <Grid item xs={6} justifyContent="center">
                    <Button loading={loading} fullWidth disable={loading} onClick={handleSubmit}>
                        <FormattedMessage id="add" />
                    </Button>
                </Grid>
            </Grid>
        </Fragment>
    );
};
