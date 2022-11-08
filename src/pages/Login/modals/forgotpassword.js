import { Box, Grid, Input, makeStyles, Typography } from "@material-ui/core";
import React, { Fragment, useState } from "react";
import { FormattedMessage } from "react-intl";
import { Button, Field } from "../../../components/";
import { useStore, useUi } from "../../../store";
import { db, auth } from "../../../utils/firebase";
import { nanoid } from "nanoid";
import { getModalStyles } from "../../../utils/helpers";

const useStyles = makeStyles((theme) => {
    return {
        ...getModalStyles(theme),
    };
});

export const ForgotPassword = (props) => {
    const { handleClose } = props;
    const classes = useStyles();
    const { state: storeState } = useStore();
    const { actions } = useUi();
    const { user } = storeState;
    const [email, setEmail] = useState(0);
    const [loading, setLoading] = useState(false);

    const _handleSubmit = () => {
        setLoading(true);
        auth.sendPasswordResetEmail(email)
            .then(() => {
                actions.alert("Password reset email sent.", "success");
                setLoading(false);
                handleClose();
            })
            .catch((error) => {
                actions.alert(error?.message, "error");
                handleClose();
            })
    };
    return (
        <Fragment>
            <div className={classes.default_modal_footer}>
                <Field label={<FormattedMessage id="email" />}>
                    <Input
                        inputProps={{ min: 0 }}
                        className={classes.input}
                        type="email"
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </Field>
                <Grid container spacing={2}>
                    <Grid item xs={6} justifyContent="center">
                        <Button
                            fullWidth
                            disable={loading}
                            className={classes.default_modal_buttonSecondary}
                            onClick={handleClose}
                        >
                            <FormattedMessage id="cancel" />
                        </Button>
                    </Grid>
                    <Grid item xs={6} justifyContent="center">
                        <Button
                            loading={loading}
                            fullWidth
                            disable={loading}
                            onClick={_handleSubmit}
                        >
                            <FormattedMessage id="submit" />
                        </Button>
                    </Grid>
                </Grid>
            </div>
        </Fragment>
    );
};
