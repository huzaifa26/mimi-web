import { Box, Checkbox, FormControlLabel, Grid, Input, makeStyles, Typography } from "@material-ui/core";
import React, { Fragment, useState } from "react";
import { FormattedMessage } from "react-intl";
import { Button } from "../../../components/";
import { useStore } from "../../../store";
import { getModalStyles } from "../../../utils/helpers";

const useStyles = makeStyles((theme) => {
    return {
        ...getModalStyles(theme),
    };
});

export const TermAndPolicy = (props) => {
    const { handleClose } = props;
    const classes = useStyles();
    const { state: storeState } = useStore();
    const { user } = storeState;
    const [loading, setLoading] = useState(false);
    const [acceptTerm, setAcceptTerm] = useState(false);

    const _handleSubmit = (acceptTerm) => {
        props.acceptTermAndPolciyHandler().then(() => {
            props.setShowChangePassword(true);
            handleClose();
        }).catch((err) => {
            handleClose();
        })
    };

    return (
        <Fragment>
            <div className={classes.default_modal_footer}>
                <Typography variant="h6">
                    <FormattedMessage
                        id={props.localUserRef.current.language !== "english"?"english_term":"hebrew_term"}
                    />
                </Typography>
                <Box>
                    <FormControlLabel
                        control={
                            <Checkbox
                                style={{
                                    color: "#685BE7",
                                }}
                                className={classes.checkbox}
                                disableRipple
                                // checked={rememberMe}
                                onChange={() => { setAcceptTerm((prev) => { return !prev }) }}
                            />
                        }
                        label={<FormattedMessage id="accept_term" />}
                    />
                </Box>
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
                        {acceptTerm === false ?
                            <Box sx={{ pointerEvents: "none", opacity: "0.5" }}>
                                <Button
                                    fullWidth
                                    disable={true}
                                // className={classes.default_modal_buttonSecondary}
                                // onClick={handleClose}
                                >
                                    <FormattedMessage id="submit" />
                                </Button>
                            </Box> :
                            <Button
                                loading={loading}
                                fullWidth
                                disable={loading}
                                onClick={_handleSubmit}
                            >
                                <FormattedMessage id="submit" />
                            </Button>
                        }
                    </Grid>
                </Grid>
            </div>
        </Fragment>
    );
};
