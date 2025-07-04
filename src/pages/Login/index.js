import React, {
  Fragment,
  useEffect,
  useState,
  useRef
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
import CryptoJS from "crypto-js";
import { ForgotPassword } from "./modals/forgotpassword";
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import { TermAndPolicy } from "./modals/termAndPolicy";

let key = process.env.REACT_APP_ENCRYPT_KEY;
key = CryptoJS.enc.Utf8.parse(key);

let iv = process.env.REACT_APP_ENCRYPT_IV;
iv = CryptoJS.enc.Utf8.parse(iv);

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
  const [userDataForTermAndPolicy, setUserDataForTermAndPolicy] = useState();
  const [codeDataForTermAndPolicy, setCodeDataForTermAndPolicy] = useState();
  const localUserRef=useRef(null);

  const [modalStates, setModalStates] = useState({
    forgotPassword: false,
    termAndPolicy: false
  });

  useEffect(() => {
    if (user?.permissions?.webPanelAccess) {
      if (auth.currentUser) {
        if ((user?.permissions?.showDashboard === false && user?.type !== ROLES.admin)) {
          return history.push("/history");
        }
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
      let encrypted = CryptoJS.AES.encrypt(password, key, { iv: iv });
      localStorage.setItem("web_session_key", encrypted);
      const bodyEl = document.getElementsByTagName("html")[0];
      bodyEl.setAttribute("lang", language);
      bodyEl.setAttribute("dir", direction);
      localStorage.setItem("language", language);
      localStorage.setItem("orientation", direction);
      resolve(true);
    })
  }

  const handleSignout = async () => {
    await auth.signOut().then(() => {
      localStorage.clear();
    },
      (error) => {
        console.error("Sign Out Error", error);
      })
  }

  const acceptTermAndPolciyHandler = (acceptTerm) => {
    return new Promise(async (resolve, reject) => {
      try {
        await db
          .collection("Institution")
          .doc(codeDataForTermAndPolicy)
          .collection("staff")
          .doc(userDataForTermAndPolicy.id)
          .update({
            hasAcceptedTerms: true
          })
        resolve(true);
      } catch (e) {
        reject(e)
      }
    })
  }

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const institutionDocs = await db
        .collection("Institution")
        .where("code", "==", institutionCode.toUpperCase())
        .get();

      if (institutionDocs.empty)
        return actions.alert(<FormattedMessage id="no_code"/>, "error");

      const language = "en";
      const direction = "ltr";

      localStorage.setItem("code", institutionCode.toUpperCase());
      const bodyEl = document.getElementsByTagName("html")[0];
      bodyEl.setAttribute("lang", language);
      bodyEl.setAttribute("dir", direction);
      localStorage.setItem("language", language);
      localStorage.setItem("orientation", direction);

      const institution = institutionDocs.docs[0].data();

      const subEndDate = new Date(new Date(institution.subscription_end_date).setHours(0, 0, 0, 0)).getTime();
      const todayDate = new Date(new Date().setHours(0, 0, 0, 0)).getTime();

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
      localUserRef.current=user;

      setUserDataForTermAndPolicy(user);
      setCodeDataForTermAndPolicy(institutionCode.toUpperCase());

      const access = user?.permissions[PERMISSIONS.webPanelAccess];

      if (!user.hasAcceptedTerms && user.type !== ROLES.admin) {
        return setModalStates((prev) => ({ ...prev, termAndPolicy: true }));
      }

      if (!user.firstPasswordChanged && user.type !== ROLES.admin) {
        localStorage.clear();
        setShowChangePassword(true);
        return
      }


      if (access === false || !user?.permissions.hasOwnProperty(PERMISSIONS.webPanelAccess)) {
        handleSignout();
        return actions.alert(<FormattedMessage id="no_access"/>, "error");
      } else if (access === true) {
        // If institute subscription end. Only admin can login.
        if (todayDate > subEndDate && user.type !== ROLES.admin) {
          handleSignout()
          return actions.alert(<FormattedMessage id="no_subscription"/>, "error");
        }

        // If institute is disabled. Only admin can login.
        if (institution.enabled === false && user.type !== ROLES.admin) {
          handleSignout();
          return actions.alert(<FormattedMessage id="institute_disable"/>, "error");
        }

        await db
          .collection("Institution")
          .doc(institutionCode.toUpperCase())
          .collection("staff")
          .doc(user.id)
          .update({
            web_last_login: new Date(),
          });

        await setLocalStorage(institutionCode, password, language, direction)
          .then(() => {
            if ((user?.permissions?.showDashboard === false && user?.type !== ROLES.admin)) {
              setStoreState((prev) => ({
                ...prev,
                user,
              }));
              history.push("/history");
              return
            }
            history.push("/dashboard");
          }).then(() => localStorage.setItem("last_login", new Date()))
      }
    } catch (error) {
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
          image: "https://firebasestorage.googleapis.com/v0/b/mimi-plan.appspot.com/o/images%2FdefaultAvatar.png?alt=media&token=d8133d4a-1874-4462-9b3b-3e24baefa6b9",
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
    await auth.currentUser.updatePassword(newPassword);
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

  const closeForgotPassword = () => setModalStates((prev) => ({ ...prev, forgotPassword: false }));
  const closeTermAndPolicy = () => setModalStates((prev) => ({ ...prev, termAndPolicy: false }));
  const [showPassword, setShowPassword] = useState(false);

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

      <SimpleModal
        title={<FormattedMessage id="forgot_password" />}
        open={modalStates.forgotPassword}
        handleClose={closeForgotPassword}
      >
        <ForgotPassword
          handleClose={closeForgotPassword}
        />
      </SimpleModal>

      <SimpleModal
        title={<FormattedMessage id="term_and_policy" />}
        open={modalStates.termAndPolicy}
        handleClose={closeTermAndPolicy}
      >
        <TermAndPolicy
          handleClose={closeTermAndPolicy}
          acceptTermAndPolciyHandler={acceptTermAndPolciyHandler}
          setShowChangePassword={setShowChangePassword}
          localUserRef={localUserRef}
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
            <Box sx={{ display: "flex" }}>
              <Input
                value={password}
                fullWidth
                type={showPassword === false ? "password" : "text"}
                size="small"
                onChange={(e) => setPassword(e.target.value)}
              />
              {showPassword === false ?
                <VisibilityIcon onClick={() => { setShowPassword(true) }} style={{ position: "absolute", left: "84%", color: "#8f92a1", cursor: "pointer" }} />
                : <VisibilityOffIcon onClick={() => { setShowPassword(false) }} style={{ position: "absolute", left: "84%", color: "#8f92a1", cursor: "pointer" }} />
              }
            </Box>
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
            <Box sx={{ justifyContent: "space-between" }} display={"flex"} justifyContent="flex-end">
              <Typography
                align="center"
                className={classes.forgotPassword}
                onClick={() => {
                  setModalStates((prev) => ({ ...prev, forgotPassword: true }))
                }}
              >
                <FormattedMessage id={"forgot_password"} />?
              </Typography>
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
  forgotPassword: {
    fontSize: "16px",
    alignSelf: "center",
    cursor: "pointer",
    color: "#8f92a1",
  }
}));