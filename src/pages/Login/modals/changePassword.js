import React, { Fragment, useState } from 'react';
import { makeStyles, Grid, Input } from '@material-ui/core';
import PasswordStrengthBar from 'react-password-strength-bar';

import { FormattedMessage } from 'react-intl';
import { Button, Field } from '../../../components';
import { useUi } from '../../../store';
import { getModalStyles } from '../../../utils/helpers';

const useStyles = makeStyles(theme => {
    return {
        ...getModalStyles(theme),
    };
});

export const ChangePasswordBody = props => {
    const classes = useStyles();
    const { handleClose, changePasswordHandler } = props;
    const { actions } = useUi();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        try {
            setLoading(true);
            await changePasswordHandler(password);
            handleClose();
        } catch (error) {
            actions.alert('error updaing password', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Fragment>
            <Field label={<FormattedMessage id="new_password" />}>
                <Input type="password" fullWidth value={password} onChange={e => setPassword(e.target.value)} />
            </Field>
            <Field label={<FormattedMessage id="confirm_new_password" />}>
                <Input type="password" fullWidth value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
            </Field>
            <Field label={<FormattedMessage id="password_strength" />}>
                <PasswordStrengthBar password={password} className={classes.passBar} />
            </Field>

            <div className={classes.default_modal_footer}>
                <Grid container spacing={2}>
                    <Grid item xs={6} justifyContent="center">
                        <Button disable={loading} fullWidth className={classes.default_modal_buttonSecondary} onClick={handleClose}>
                            <FormattedMessage id="cancel" />
                        </Button>
                    </Grid>
                    <Grid item xs={6} justifyContent="center">
                        <Button disable={loading} loading={loading} fullWidth onClick={handleSubmit}>
                            <FormattedMessage id="change_password" />
                        </Button>
                    </Grid>
                </Grid>
            </div>
        </Fragment>
    );
};
