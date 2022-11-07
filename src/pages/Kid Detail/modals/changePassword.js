import React, { Fragment, useEffect, useMemo, useState } from 'react';
import { Divider, Typography, TextField, makeStyles, Grid, CircularProgress, Input } from '@material-ui/core';
import PasswordStrengthBar from 'react-password-strength-bar';
import md5 from 'md5';

import { FormattedMessage } from 'react-intl';
import { Button, Field } from '../../../components';
import { useStore, useUi } from '../../../store';
import { db } from '../../../utils/firebase';
import { getModalStyles, getTypographyStyles } from '../../../utils/helpers';
import * as yup from 'yup';
import clsx from 'clsx';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import {
    Box,
  } from "@material-ui/core";


const useStyles = makeStyles(theme => {
    return {
        ...getModalStyles(theme),
        ...getTypographyStyles(theme),
    };
});

export const ChangePasswordBody = props => {
    const classes = useStyles();
    const { handleClose, kid } = props;
    const { state: storeState } = useStore();
    const { actions } = useUi();
    const { user } = storeState;

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState();

    const Schema = useMemo(() => {
        return yup.object().shape({
            confirmPassword: yup.string().test('passwords-match', 'Passwords must match', function (value) {
                return this.parent.password === value;
            }),
            password: yup.string().min(4).required(),
        });
    }, []);

    useEffect(() => {
        setFeedback(password != confirmPassword ? <FormattedMessage id="passwords_does_not_match" /> : '');
    }, [password, confirmPassword]);

    const handleSubmit = async () => {
        try {
            setLoading(true);

            const payload = {
                password,
                confirmPassword,
            };

            Schema.validateSync(payload);

            const encryptPass = md5(password);
            console.log(encryptPass);
            await db.collection('Institution').doc(user?._code).collection('kid').doc(kid.id).update({ password: encryptPass });

            handleClose();
        } catch (error) {
            actions.alert(error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    return (
        <Fragment>
            <Field label={<FormattedMessage id="new_password" />}>
                <Box sx={{ display: "flex" }}>
                    <Input type={showPassword === false ? "password" : "text"} fullWidth value={password} onChange={e => setPassword(e.target.value)} />
                    {showPassword === false ?
                        <VisibilityIcon onClick={() => { setShowPassword(true) }} style={{ position: "absolute", left: "90%", color: "#8f92a1", cursor: "pointer" }} />
                        : <VisibilityOffIcon onClick={() => { setShowPassword(false) }} style={{ position: "absolute", left: "90%", color: "#8f92a1", cursor: "pointer" }} />
                    }
                </Box>
            </Field>
            <Field label={<FormattedMessage id="confirm_new_password" />}>
                <Box sx={{ display: "flex" }}>
                    <Input type={showConfirmPassword === false ? "password" : "text"} fullWidth value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                    {showConfirmPassword === false ?
                        <VisibilityIcon onClick={() => { setShowConfirmPassword(true) }} style={{ position: "absolute", left: "90%", color: "#8f92a1", cursor: "pointer" }} />
                        : <VisibilityOffIcon onClick={() => { setShowConfirmPassword(false) }} style={{ position: "absolute", left: "90%", color: "#8f92a1", cursor: "pointer" }} />
                    }
                </Box>
            </Field>
            <Field label={<FormattedMessage id="password_strength" />}>
                <PasswordStrengthBar password={password} className={classes.passBar} />
            </Field>

            {feedback && (
                <Typography className={clsx([classes.default_typography_label, classes.default_typography_colorFailure])} align="center">
                    {feedback}
                </Typography>
            )}

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
