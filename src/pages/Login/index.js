import React, {
  Fragment,
  useEffect,
  useRef,
  useState,
} from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Box,
  Checkbox,
  FormControlLabel,
  Input,
  Typography,
} from "@material-ui/core";
import { Button, Field, Form, SimpleModal } from "../../components";

import { FormattedMessage } from "react-intl"; //Used for dual language text
import rtlDetect from "rtl-detect";
import { useHistory } from "react-router-dom";
import { useUi, useStore } from "../../store";
import { LANGUAGE_MAPPING, ROLES, PERMISSIONS } from "../../utils/constants";
import { db, app, auth } from "../../utils/firebase";
import clsx from "clsx";

import Image from "../../assets/logo/background.jpg";
import KidPic1 from "../../assets/logo/loginPic.png";
import KidPic2 from "../../assets/logo/loginPic2.png";
import {
  FirebaseHelpers,
  getPageStyles,
  getTypographyStyles,
} from "../../utils/helpers";
import md5 from "md5";
import { ChangePasswordBody } from "./modals/changePassword";

export function Login() {
  const history = useHistory();

  const { state: storeState, setState: setStoreState } = useStore();
  const { user } = storeState;
  const { actions } = useUi();
  const classes = useStyles();

  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("admintesting@gmial.com");
  const [password, setPassword] = useState("123123");
  const [institutionCode, setInstitutionCode] = useState("TEST");
  const [rememberMe, setRememberMe] = useState(false);

  const [showChangePassword, setShowChangePassword] = useState(false);

  useEffect(() => {
    if(user?.permissions?.webPanelAccess){
      if (auth.currentUser) {
        console.log("2222222222")
        return history.push("/dashboard");
      }
    }
    
    const lang = navigator.language;
    const defaultDir = rtlDetect.getLangDir(lang);
    setStoreState((prev) => ({
      ...prev,
      orientation: defaultDir,
      language:
        defaultDir == "ltr"
          ? LANGUAGE_MAPPING.ENGLISH
          : LANGUAGE_MAPPING.HEBREW,
    }));
  }, []);

  const setLocalStorage = (institutionCode, password, language, direction) => {
    return new Promise((resolve, reject) => {
      localStorage.setItem("code", institutionCode.toUpperCase());
      localStorage.setItem("password", password);
      const bodyEl = document.getElementsByTagName("html")[0];
      bodyEl.setAttribute("lang", language);
      bodyEl.setAttribute("dir", direction);
      localStorage.setItem("language", language);
      localStorage.setItem("orientation", direction);
      resolve(true);
    })
  }

  useEffect(() => {
    auth.onAuthStateChanged(async (user) => {
      db
        .collection("Institution")
        .doc(institutionCode.toUpperCase())
        .collection("staff")
        .doc(user.uid)
        .onSnapshot((snapshot) => {
          let user=snapshot.data();
          if(user.permissions.webPanelAccess === true){
            setStoreState((prev) => ({
              ...prev,
              authenticated: true,
              user: { ...user, _code: institutionCode.toUpperCase() },
            }));
          }
        });
    });
  }, [])

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const institutionDocs = await db
        .collection("Institution")
        .where("code", "==", institutionCode.toUpperCase())
        .get();

      if (institutionDocs.empty)
        return actions.alert("No Institution code found", "error");

      const institution = institutionDocs.docs[0].data();

      const subEndDate = new Date(
        new Date(institution.subscription_end_date).setHours(0, 0, 0, 0)
      ).getTime();

      const todayDate = new Date(new Date().setHours(0, 0, 0, 0)).getTime();

      if (todayDate > subEndDate)
        return actions.alert("Subscription Expired", "error");

      if (!institution.enabled)
        return actions.alert("Institution Disabled", "error");

      const language = "en";
      const direction = "ltr";


      const userCredential = await auth.signInWithEmailAndPassword(
        email,
        password
      );

      const userDocRef = await db
        .collection("Institution")
        .doc(institutionCode.toUpperCase())
        .collection("staff")
        .doc(userCredential.user.uid)
        .get();

      const user = {
        ...userDocRef.data(),
        _code: institutionCode.toUpperCase(),
      };

      const access = user.permissions[PERMISSIONS.webPanelAccess];

      if (access === false) {
        localStorage.clear();
        await auth.signOut().then(
          () => {
            localStorage.clear();
          },
          (error) => {
            console.error("Sign Out Error", error);
          }
        );
        return actions.alert("You are restricted from using panel", "error");
      } else if (access === true) {
        if (typeof access === "boolean" && !access)
          return actions.alert("You account has been disabled. Please contact admin for queries", "error");

        if (!user.firstPasswordChanged && user.type != ROLES.admin) {
          return setShowChangePassword(true);
        }
        await setLocalStorage(institutionCode, password, language, direction)
          .then(() => {
            history.push("/dashboard");
          })
      }
    } catch (error) {
      console.log(error);
      return actions.alert(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    setLoading(true);
    try {
      await FirebaseHelpers.createInstitution.execute({
        user,
        institute: {
          id: "DEV",
          image:
            "https://firebasestorage.googleapis.com/v0/b/mimi-plan.appspot.com/o/images%2FdefaultAvatar.png?alt=media&token=d8133d4a-1874-4462-9b3b-3e24baefa6b9",
          name: "newBoardingDev",
          expireDate: "2023-07-27",
          language: "English",
          referenceCode: "1535",
        },
      });
    } catch (error) {
      actions.alert(error, "error");
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (newPassword) => {
    const encryptPass = md5(newPassword);
    await auth.currentUser.updatenewPassword(newPassword);
    await db
      .collection("Institution")
      .doc(institutionCode)
      .collection("staff")
      .doc(auth.currentUser.uid)
      .update({ password: encryptPass, firstPasswordChanged: true });
  };

  const closeChangePasswordModal = () => {
    setShowChangePassword(false);
  };

  return (
    <Fragment>
      <SimpleModal
        title={<FormattedMessage id="change_password" />}
        open={showChangePassword}
      >
        <ChangePasswordBody
          handleClose={closeChangePasswordModal}
          changePasswordHandler={handleUpdatePassword}
        />
      </SimpleModal>
      <div className={classes.backgroundconatiner}>
        <Form>
          <img src={KidPic1} className={classes.kidImage1} />
          <img src={KidPic2} className={classes.kidImage2} />

          <Box>
            <Typography
              align="center"
              className={clsx([
                classes.default_typography_capitalize,
                classes.default_typography_bold,
                classes.default_typography_heading,
              ])}
            >
              <FormattedMessage id={"let's_sign_you_in"} />
            </Typography>
            <Typography
              align="center"
              className={clsx([
                classes.default_typography_capitalize,
                classes.default_typography_paragraph,
                classes.default_typography_colorLight,
              ])}
            >
              <FormattedMessage id={"welcome_back_you_have_been_missed"} />
            </Typography>
          </Box>

          <Field label={<FormattedMessage id="email_address" />}>
            <Input
              value={email}
              fullWidth
              size="small"
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Field label={<FormattedMessage id="password" />}>
            <Input
              value={password}
              fullWidth
              type="password"
              size="small"
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
          <Field label={<FormattedMessage id="institution_code" />}>
            <Input
              value={institutionCode}
              fullWidth
              size="small"
              onChange={(e) => setInstitutionCode(e.target.value)}
            />
          </Field>

          <Field label={null}>
            <Box display={"flex"} justifyContent="flex-end">
              <FormControlLabel
                control={
                  <Checkbox
                    style={{
                      color: "#685BE7",
                    }}
                    className={classes.checkbox}
                    disableRipple
                    checked={rememberMe}
                    onChange={() => setRememberMe((prev) => !prev)}
                  />
                }
                label={<FormattedMessage id="remember_me" />}
              />
            </Box>
          </Field>

          <Button loading={loading} disabled={loading} onClick={handleSubmit}>
            <FormattedMessage id="log_in" />
          </Button>
          {/* <Button loading={loading} disabled={loading} onClick={handleCreate}>
            <FormattedMessage id="create" />
          </Button> */}
        </Form>
      </div>
    </Fragment>
  );
}

const useStyles = makeStyles((theme) => ({
  ...getPageStyles(theme),
  ...getTypographyStyles(theme),
  backgroundconatiner: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    width: "100%",
    backgroundImage: `url(${Image})`,
    backgroundPosition: "center",
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    overflow: "hidden",
  },
  //  top right image
  kidImage1: {
    width: "32vw",
    zIndex: 11,
    position: "absolute",
    right: 0,
    top: 0,
    transform: "translate(90%, -40%)",
    [theme.breakpoints.down("md")]: {
      display: "none",
    },
  },

  //  bottom left image
  kidImage2: {
    width: "32vw",
    zIndex: 11,
    position: "absolute",
    left: 0,
    bottom: 0,
    transform: "translate(-94%, 40%)",
    [theme.breakpoints.down("md")]: {
      display: "none",
    },
  },
}));
