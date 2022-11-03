import { Grid, Input, makeStyles, Typography } from '@material-ui/core';
import React, { Fragment, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Button, Field } from '../../../components';
import { useStore, useUi } from '../../../store';
import { db } from '../../../utils/firebase';
import { getModalStyles } from '../../../utils/helpers';
import { nanoid } from 'nanoid';
import * as yup from 'yup';

const useStyles = makeStyles(theme => {
    return {
        ...getModalStyles(theme),
    };
});

export const CreatePrizeBody = props => {
    const { handleClose, routePlan, prizes } = props;
    const classes = useStyles();
    const { state: storeState } = useStore();
    const { actions } = useUi();
    const { user } = storeState;

    const [name, setName] = useState('');
    const [level, setLevel] = useState(1);

    const [loading, setLoading] = useState(false);

    const Schema = useMemo(() => {
        return yup.object().shape({
            name: yup.string().required().min(2).max(20),
            requiredLevel: yup
                .number()
                .transform(value => (isNaN(value) ? 0 : value))
                .required()
                .min(1)
                .max(99),
        });
    }, []);

    const handleSubmit = async () => {
        console.log("handleSubmit")
        // try {
        //     setLoading(true);

        //     const payload = {
        //         name,
        //         requiredLevel: level,
        //     };

        //     Schema.validateSync(payload);

        //     const existsForLevel = prizes.find(el => el.requiredLevel === level);

        //     if (existsForLevel) throw new Error('a prize exists for the desired level');

        //     const prizeId = nanoid(6);
        //     await db
        //         .collection('Institution')
        //         .doc(user._code)
        //         .collection('routePlan')
        //         .doc(routePlan.id)
        //         .collection('prizes')
        //         .doc(prizeId)
        //         .set({
        //             ...payload,
        //             id: prizeId,
        //             routeId: routePlan.id,
        //         });

        //     setLoading(false);
        //     handleClose();
        // } catch (error) {
        //     actions.alert(error.message, 'error');
        // } finally {
        //     setLoading(false);
        // }
    };

    return (
        <Fragment>
            <Field label={<FormattedMessage id="prize_name" />}>
                <Input value={name} className={classes.input} fullWidth size="small" onChange={e => setName(e.target.value)} />
            </Field>
            <Field label={<FormattedMessage id="required_level" />}>
                <Input
                    inputProps={{
                        min: 1,
                    }}
                    value={level}
                    className={classes.input}
                    type="number"
                    fullWidth
                    size="small"
                    onChange={e => setLevel(parseInt(e.target.value))}
                />
            </Field>

            <div className={classes.default_modal_footer}>
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
            </div>
        </Fragment>
    );
};
