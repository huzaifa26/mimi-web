import React, { useState, Fragment } from "react";
import { makeStyles, } from "@material-ui/core/styles";
import {

  Typography,
  Box,
  Input,
} from "@material-ui/core";
import PasswordStrengthBar from "react-password-strength-bar";
import md5 from "md5";
import { FormattedMessage } from "react-intl"; //Used for dual language text
import { db, auth } from "../../../utils/firebase";
import { useStore, useUi } from "../../../store";
import { Button, Field, Form } from "../../../components";
import clsx from "clsx";
import { getTypographyStyles } from "../../../utils/helpers";
import { Responses } from "../../../utils/responses";
import CryptoJS from "crypto-js";


let key = process.env.REACT_APP_ENCRYPT_KEY;
key = CryptoJS.enc.Utf8.parse(key);

let iv = process.env.REACT_APP_ENCRYPT_IV;
iv = CryptoJS.enc.Utf8.parse(iv);

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
  const [oldPassword, setOldPassword] = useState(()=>{
    let password = localStorage.getItem("web_session_key");
    password=password.toString()
    let decrypted = CryptoJS.AES.decrypt(password, key, { iv: iv });
    decrypted = decrypted.toString(CryptoJS.enc.Utf8);
    return decrypted;
  }
  );
  const [state, setState] = useState(defaultSchema);
  // const [value, setValue] = useState(1)
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
   
    if (state.currentPaswsword !== oldPassword) {
      actions.alert("Current password is not correct", "error");
      return;
    }

    if (loading) return;
    try {
      await auth.currentUser.updatePassword(state.password);
      setLoading(true);
      await db
        .collection("Institution")
        .doc(user?._code)
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
