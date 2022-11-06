import {Box ,Grid, Input, makeStyles, Typography } from "@material-ui/core";
import React, { Fragment, useState } from "react";
import { FormattedMessage } from "react-intl";
import { Button } from "../../../components/button";
import { useStore, useUi } from "../../../store";
import { auth, db } from "../../../utils/firebase";
import { nanoid } from "nanoid";
import { getModalStyles,FirebaseHelpers } from "../../../utils/helpers";
import { Field } from "../../../components";

const useStyles = makeStyles((theme) => {
  return {
    ...getModalStyles(theme),
  };
});

export const DeleteKid = (props) => {
  const { handleClose, kid, userData,history } = props;
  const classes = useStyles();
  const { state: storeState } = useStore();
  const { actions } = useUi();
  const { user } = storeState;
  const [loading, setLoading] = useState(false);
  const [password,setPassword]=useState('');

  const _handleSubmit = async() => {
    setLoading(true);
    try{
    const userCredential = await auth.signInWithEmailAndPassword(user.email,password);
    await FirebaseHelpers.deleteKid.execute({
        kid,
        user,
        history,
      })
    }catch(e){
        if(e.code === "auth/wrong-password"){
            actions.alert("Incorrect password.","error");
        }
        if(e.code === "auth/too-many-requests"){
            actions.alert("Too many attempts. Please try again later.","error");
        }
        setLoading(false);
    }
    setLoading(false);
    handleClose();
  };
  return (
    <Fragment>
      <Box>
        <Typography variant="h6">
                <FormattedMessage id="delete_kid_password"/>
        </Typography>
      </Box>


      <Box className={classes.default_modal_footer}>
        <Field label={<FormattedMessage id="password" />}>
            <Input
              value={password}
              fullWidth
              size="small"
              type="password"
              onChange={(e) => setPassword(e.target.value)}
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
              <FormattedMessage id="delete" />
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Fragment>
  );
};
