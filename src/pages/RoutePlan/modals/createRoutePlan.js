import React, { Fragment, useMemo, useState } from 'react';
import { Grid, Input, makeStyles } from '@material-ui/core';
import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { FormattedMessage } from 'react-intl';
import { Button, Field, MenuSingle, Status } from '../../../components';
import { useStore, useUi } from '../../../store';
import { db } from '../../../utils/firebase';
import { getModalStyles } from '../../../utils/helpers';
import moment from 'moment';
import { nanoid } from 'nanoid';
import * as yup from 'yup';

const useStyles = makeStyles(theme => {
    return { ...getModalStyles(theme) };
});

const options = [
    {
        id: true,
        label: 'Active',
    },
    {
        id: false,
        label: 'Disabled',
    },
];

export const CreateRoutePlanBody = props => {
    const { handleClose, update } = props;
    const classes = useStyles();
    const { state: storeState } = useStore();
    const { actions } = useUi();
    const { user } = storeState;

    const [routeName, setRouteName] = useState('');
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [status, setStatus] = useState({
        id: true,
        label: 'Active',
    });
    const [loading, setLoading] = useState(false);

    const Schema = useMemo(() => {
        return yup.object().shape({
            name: yup.string().required().min(2).max(20),
            status: yup.boolean().required(),
            startingDate: yup
                .date()
                .required()
                .test('isLower', 'starting date must be lower than ending date', function (val) {
                    return val < this.parent.endingDate;
                }),
            endingDate: yup.date().required(),
        });
    }, []);

    const handleSubmit = async () => {
        try {
            setLoading(true);

            const payload = {
                name: routeName,
                status: status.id,
                startingDate: startDate,
                endingDate: endDate,
            };

            Schema.validateSync(payload);

            const routePlanId = nanoid(6);

            const route_names = (await db.collection('Institution').doc(user._code).collection('routePlan').get()).docs.map(el => el.data());

            const exists = route_names.some(el => el.name.toLowerCase() == routeName.toLowerCase());

            if (exists) throw new Error('Route Name with same name already exists,kindly choose a different Name', 'error');

            await db
                .collection('Institution')
                .doc(user._code)
                .collection('routePlan')
                .doc(routePlanId)
                .set({
                    ...payload,
                    id: routePlanId,
                    kids: [],
                    groups: [],
                    date_created: new Date(),
                });
            setLoading(false);
            handleClose();
            update()
        } catch (error) {
            actions.alert(error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Fragment>
            <Field label={<FormattedMessage id="route_name" />}>
                <Input value={routeName} className={classes.input} fullWidth size="small" onChange={e => setRouteName(e.target.value)} />{' '}
            </Field>

            <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <KeyboardDatePicker
                            disableToolbar
                            variant="inline"
                            mask={'__/__/____'}
                            labelFunc={date => moment(date).format('DD/MM/YYYY')}
                            margin="normal"
                            id="date-picker-inline"
                            value={startDate}
                            label={<FormattedMessage id="start_date"></FormattedMessage>}
                            onChange={date => setStartDate(date)}
                            KeyboardButtonProps={{
                                'aria-label': 'change date',
                            }}
                        />
                    </MuiPickersUtilsProvider>
                </Grid>
                <Grid item xs={12} md={6}>
                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <KeyboardDatePicker
                            disableToolbar
                            variant="inline"
                            mask={'__/__/____'}
                            margin="normal"
                            labelFunc={date => moment(date).format('DD/MM/YYYY')}
                            value={endDate}
                            id="date-picker-inline"
                            label={<FormattedMessage id="end_date"></FormattedMessage>}
                            onChange={date => setEndDate(date)}
                            KeyboardButtonProps={{
                                'aria-label': 'change date',
                            }}
                        />
                    </MuiPickersUtilsProvider>
                </Grid>
            </Grid>

            <Field label={<FormattedMessage id="current_status" />}>
                <MenuSingle list={options} label={<Status value={status.id} />} handleChange={value => setStatus(value)} defaultValue={status} />{' '}
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
                            <FormattedMessage id="create" />
                        </Button>
                    </Grid>
                </Grid>
            </div>
        </Fragment>
    );
};
