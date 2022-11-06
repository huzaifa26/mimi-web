import { Grid, Input, makeStyles, Typography,  } from '@material-ui/core';
import React, { Fragment, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Button, ErrorIcon, Field } from '../../../components';
import { useStore, useUi } from '../../../store';
import { db } from '../../../utils/firebase';
import { nanoid } from 'nanoid';
import { getModalStyles, getTypographyStyles } from '../../../utils/helpers';
import * as yup from 'yup';

const useStyles = makeStyles(theme => {
    return {
        ...getModalStyles(theme),
        ...getTypographyStyles(theme),
    };
});

export const ChangeScoreBody = props => {
    const { handleClose, kid } = props;
    const classes = useStyles();
    const { state: storeState } = useStore();
    const { actions } = useUi();
    const { user } = storeState;

    const [score, setScore] = useState(0);
    const [loading, setLoading] = useState(false);

    const Schema = useMemo(() => {
        return yup.object().shape({
            score: yup
                .number()
                .transform(value => (isNaN(value) ? 0 : value))
                .positive()
                .min(0)
                .max(999999)
                .required(),
        });
    }, []);

    const handleSubmit = async () => {
        try {
            setLoading(true);

            Schema.validateSync({
                score,
            });

            const id = nanoid(6);
            await db
                .collection('Institution')
                .doc(user._code)
                .collection('kid')
                .doc(kid.id)
                .update({
                    score: parseInt(score),
                });
            await db
                .collection('Institution')
                .doc(user._code)
                .collection('History')
                .doc(id)
                .set({
                    type: 'Update Kid Score',
                    executer: user.name,
                    executedBy: kid.name,
                    time: new Date(),
                    payload: {
                        kid,
                        score,
                    },
                    id: id,
                    _staff: [user.id],
                    _kids: [kid.id],
                    _groups: [kid.groupId],
                });

            setLoading(false);
            handleClose();
        } catch (error) {
            actions.alert(error.message, 'error');
        } finally {
        }
    };

    return (
        <Fragment>
            <Field label={<FormattedMessage id="kid_name" />}>
                <Typography className={classes.default_typography_subHeading}>{kid.name}</Typography>
            </Field>
            <Field label={<FormattedMessage id="enter_score" />}>
                <Input inputProps={{ min: 0 }} type="number" value={score} onChange={e => setScore(parseInt(e.target.value))} />
            </Field>

            <div className={classes.default_modal_infoContainer}>
                <ErrorIcon style={{ color: '#808191', marginRight: 10 }} />
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
                        <Button fullWidth disable={loading} loading={loading} onClick={handleSubmit}>
                            <FormattedMessage id="change" />
                        </Button>
                    </Grid>
                </Grid>
            </div>
        </Fragment>
    );
};
