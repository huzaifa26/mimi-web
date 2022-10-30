import React, { useEffect, useState, Fragment } from "react";
import { makeStyles, useTheme, withStyles } from "@material-ui/core/styles";
import {
  MenuItem,
  Typography,
  Menu,
  Checkbox,
  Box,
  Input,
} from "@material-ui/core";
import TextField from "@material-ui/core/TextField";
import PasswordStrengthBar from "react-password-strength-bar";
import md5 from "md5";
import { FormattedMessage } from "react-intl"; //Used for dual language text

import { db, auth } from "../../../utils/firebase";
import { useStore, useUi } from "../../../store";
import { useHistory } from "react-router-dom";
import { Button, Field, Form } from "../../../components";
import clsx from "clsx";
import { getTypographyStyles } from "../../../utils/helpers";
import { Responses } from "../../../utils/responses";

const defaultSchema = {
  password: "",
  confirmPassword: "",
  currentPaswsword: "",
};

export const ChangePassword = (props) => {
  const {handleChange} = props;
  const classes = useStyles();

  const { actions } = useUi();
  const { state: storeState, actions: storeActions } = useStore();
  const { user } = storeState;
  const [oldPassword, setOldPassword] = useState(
    localStorage.getItem("password")
  );
  const [state, setState] = useState(defaultSchema);
  // const [value, setValue] = useState(1)
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (state.currentPaswsword != oldPassword) {
      actions.alert("Current password is not correct", "error");
      return;
    }
    if (loading) return;
    try {
      await auth.currentUser.updatePassword(state.password);
      setLoading(true);
      await db
        .collection("Institution")
        .doc(user._code)
        .collection("staff")
        .doc(user.id)
        .update({ password: md5(state.password) });

      actions.alert(Responses.passwordChangeSuccess, "success");
      setState(defaultSchema);

      handleChange(0);

    } catch (error) {
      actions.alert(Responses.passwordChangeRelogin, "info");
      storeActions.handleSignOut();
    } finally{
      setLoading(false);
    }
  };

  return (
    <Fragment>
      <div className={classes.container}>
        <Form>
          <Typography
            align="center"
            className={clsx([
              classes.default_typography_capitalize,
              classes.default_typography_bold,
              classes.default_typography_subHeading,
            ])}
          >
            <FormattedMessage id={"change_password"} />
          </Typography>
          <Field label={<FormattedMessage id="current_password" />}>
            <Input
              fullWidth
              type="password"
              onChange={(e) => {
                setState((prev) => ({
                  ...prev,
                  currentPaswsword: e.target.value,
                }));
              }}
            />
          </Field>
          <Field label={<FormattedMessage id="new_password" />}>
            <Input
              fullWidth
              type="password"
              onChange={(e) => {
                setState((prev) => ({ ...prev, password: e.target.value }));
              }}
            />
          </Field>

          <Field label={<FormattedMessage id="confirm_new_password" />}>
            <Input
              fullWidth
              type="password"
              onChange={(e) => {
                setState((prev) => ({
                  ...prev,
                  confirmPassword: e.target.value,
                }));
              }}
            />
          </Field>

          <Box paddingY={2}>
            <PasswordStrengthBar password={state.password} />
          </Box>

          <Button loading={loading} disabled={loading} onClick={handleSubmit}>
            <FormattedMessage id="change_password" />
          </Button>
        </Form>
      </div>
    </Fragment>
  );
};

const useStyles = makeStyles((theme) => ({
  ...getTypographyStyles(theme),
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    width: "100%",
  },
}));
