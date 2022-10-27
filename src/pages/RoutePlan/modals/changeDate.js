import { Grid, makeStyles } from '@material-ui/core';
import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import React, { Fragment, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Button, Field } from '../../../components';
import { getModalStyles } from '../../../utils/helpers';
import DateFnsUtils from '@date-io/date-fns';
import moment from 'moment';

const useStyles = makeStyles(theme => {
    return {
        ...getModalStyles(theme),
    };
});

export const ChangeDateBody = props => {
    const { handleClose, setter, condition, defaultDate } = props;
    const classes = useStyles();

    const [date, setDate] = useState(defaultDate);

    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        setter && (await setter(date));
        setLoading(false);
        handleClose();
    };

    return (
        <Fragment>
            <Field label={<FormattedMessage id="start_date" />}>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <KeyboardDatePicker
                        fullWidth
                        disableToolbar
                        variant="inline"
                        {...(condition && { minDate: condition })}
                        margin="normal"
                        id="date-picker-inline"
                        labelFunc={date => moment(date).format('DD/MM/YYYY')}
                        value={date}
                        onChange={date => setDate(date)}
                        KeyboardButtonProps={{
                            'aria-label': 'change date',
                        }}
                    />
                </MuiPickersUtilsProvider>
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
                            <FormattedMessage id="change_date" />
                        </Button>
                    </Grid>
                </Grid>
            </div>
        </Fragment>
    );
};
