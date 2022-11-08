import React, { useEffect, useState, Fragment, useMemo } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Typography, InputAdornment, Input, Grid, Box } from "@material-ui/core";
import PasswordStrengthBar from "react-password-strength-bar";
import ScrollArea from "react-scrollbar";

import {
  Field,
  Form,
  Links,
  MenuMultiple,
  MenuSingle,
  Button,
  SimpleModal,
} from "../../components";
import { FormattedMessage } from "react-intl"; //Used for dual language text
import { useHistory } from "react-router";
import { ROLES } from "../../utils/constants";
import { useStore, useUi } from "../../store";

import {
  FirebaseHelpers,
  getPageStyles,
  getSectionHeaderStyles,
  getTypographyStyles,
} from "../../utils/helpers";
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import Person from "../../assets/icons/personIcon.png";
import Mail from "../../assets/icons/mailIcon.png";
import clsx from "clsx";
import { FileUploadBody } from "./modals/fileUpload";
import * as yup from "yup";

const roleOptions = [
  {
    id: ROLES.admin,
    name: <FormattedMessage id="admin" />,
    label: <FormattedMessage id="admin" />,
    requiredRoles: [],
  },
  {
    id: ROLES.mngr,
    name: <FormattedMessage id="manager" />,
    label: <FormattedMessage id="manager" />,
    requiredRoles: [ROLES.admin],
  },
  {
    id: ROLES.crdntr,
    name: <FormattedMessage id="coordinator" />,
    label: <FormattedMessage id="coordinator" />,
    requiredRoles: [ROLES.admin, ROLES.mngr],
  },
  {
    id: ROLES.guide,
    name: <FormattedMessage id="guide" />,
    label: <FormattedMessage id="guide" />,
    requiredRoles: [ROLES.crdntr, ROLES.admin, ROLES.mngr],
  },
  {
    id: ROLES.gStaff,
    name: <FormattedMessage id="general_staff" />,
    label: <FormattedMessage id="general_staff" />,
    requiredRoles: [ROLES.crdntr, ROLES.admin, ROLES.mngr],
  },
];

export const RegisterTeam = (props) => {
  const classes = useStyles();
  const { actions } = useUi();
  const { state: storeState } = useStore();
  const { user, institute } = storeState;
  const [loading, setLoading] = useState(false);
  const history = useHistory();
  const [groups, setGroups] = useState([]);
  const [options, _] = useState(
    roleOptions.filter((el) => el.requiredRoles.includes(user.type))
  );

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [role, setRole] = useState();
  const [fileUpload, setFileUpload] = useState(false);

  const handleFileModalClose = () => {
    setFileUpload(false);
  };

  const Schema = useMemo(() => {
    return yup.object().shape({
      confirmPassword: yup.string().test("passwords-match", "Passwords must match", function (value) {
          return this.parent.password === value;
        }),
      password: yup.string().min(4).max(16).required(),
      selectedGroups: yup.array(),
      role: yup.object().nullable(false).required(),
      email: yup.string().email().max(30).required(),
      name: yup.string().min(2).max(20).required(),
    });
  }, []);

  useEffect(() => {
    (async () => {
      const data = await FirebaseHelpers.fetchGroups.execute({
        user,
      });
      setGroups(
        data.map((el) => {
          return {
            id: el.id,
            label: el.name,
            name: el.name,
            ...el,
          };
        })
      );
    })();
  }, []);

  const defaultGroups = useMemo(() => {
    if (role && [ROLES.crdntr, ROLES.guide, ROLES.gStaff].includes(role?.id)) {
      return [];
    } else {
      return groups;
    }
  }, [groups, role]);

  const handleSubmit = async () => {
    if (loading) return;
    setLoading(true);
    try {
      if ([ROLES.guide].some((el) => el === role.id)) {
        if (selectedGroups.length > 1) {
          return actions.alert("Only one group can be assigned to Guide", "error");
        }
      }

      const payload = {
        name,
        email,
        password,
        confirmPassword,
        selectedGroups,
        role,
      };

      Schema.validateSync(payload);

      await FirebaseHelpers.createStaff.execute({
        user,
        institute,
        staff: {
          name,
          type: role.id,
          email,
          selectedGroups,
          password,
        },
      });

      history.push("/teams");
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };


  const handleModalOpen = () => {
    setFileUpload(true);
  };
  const links = [
    {
      ref: "/teams",
      title: <FormattedMessage id="teams" />,
    },
    {
      ref: "/teams/register",
      title: <FormattedMessage id="registration" />,
    },
  ];

  const actionBar = (
    <div className={classes.default_headerSection_container}>
      <div className={classes.default_headerSection_pageTitle}>
        <Links links={links} />
      </div>
    </div>
  );

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  return (
    <Fragment>
      <section
        className={clsx([classes.default_page_root, classes.default_page_Bg1])}
      >
        <SimpleModal
          extended
          title={<FormattedMessage id="upload_file" />}
          open={fileUpload}
          handleClose={handleFileModalClose}
        >
          <FileUploadBody handleClose={handleFileModalClose} groups={groups} />
        </SimpleModal>
        {actionBar}
        <ScrollArea smoothScrolling>
          <Form>
            <Typography
              align="center"
              className={clsx([
                classes.default_typography_capitalize,
                classes.default_typography_bold,
                classes.default_typography_subHeading,
              ])}
            >
              <FormattedMessage id={"team_registration"} />
            </Typography>

            <Field label={<FormattedMessage id="name" />}>
              <Input
                autoComplete="new-password"
                startAdornment={
                  <InputAdornment position="start">
                    <img src={Person} alt="Person" />
                  </InputAdornment>
                }
                fullWidth
                onChange={(e) => setName(e.target.value)}
              />
            </Field>
            <Field label={<FormattedMessage id="email" />}>
              <Input
                autoComplete="new-password"
                startAdornment={
                  <InputAdornment position="start">
                    <img src={Mail} alt="Mail"/>
                  </InputAdornment>
                }
                fullWidth
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
            <Field label={<FormattedMessage id="password" />}>
              <Box sx={{ display: "flex" }}>
                <Input
                  autoComplete="new-password"
                  type={showPassword===false?"password":"text"}
                  fullWidth
                  onChange={(e) => setPassword(e.target.value)}
                />
                {showPassword === false ?
                  <VisibilityIcon onClick={() => { setShowPassword(true) }} style={{ position: "absolute", left: "84%", color: "#8f92a1", cursor: "pointer" }} />
                  : <VisibilityOffIcon onClick={() => { setShowPassword(false) }} style={{ position: "absolute", left: "84%", color: "#8f92a1", cursor: "pointer" }} />
                }
              </Box>
            </Field>
            <Field label={<FormattedMessage id="confirm_new_password" />}>
              <Box sx={{ display: "flex" }}>
                <Input
                  autoComplete="new-password"
                  type={showConfirmPassword===false?"password":"text"}
                  fullWidth
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {showConfirmPassword === false ?
                  <VisibilityIcon onClick={() => { setShowConfirmPassword(true) }} style={{ position: "absolute", left: "84%", color: "#8f92a1", cursor: "pointer" }} />
                  : <VisibilityOffIcon onClick={() => { setShowConfirmPassword(false) }} style={{ position: "absolute", left: "84%", color: "#8f92a1", cursor: "pointer" }} />
                }
              </Box>
            </Field>
            <Field label={<FormattedMessage id="password_strength" />}>
              <PasswordStrengthBar password={password} />
            </Field>

            <Grid container>
              <Grid item xs={6}>
                <Field label={<FormattedMessage id="role" />}>
                  <MenuSingle
                    list={options}
                    label={role?.label || "Select Role"}
                    handleChange={(value) => setRole(value)}
                  />
                </Field>
              </Grid>

              {role?.id !== ROLES.gStaff && (
                <Grid item xs={6}>
                  <Field label={<FormattedMessage id="group" />}>
                    {role?.id === ROLES.guide ? (
                      <MenuSingle
                        list={groups}
                        label={selectedGroups[0]?.label || "Select Group"}
                        handleChange={(option) => {
                          setSelectedGroups([option]);
                        }}
                      />
                    ) : (
                      <MenuMultiple
                        list={groups}
                        entity={"Groups"}
                        handleChange={(options) => {
                          setSelectedGroups(options);
                        }}
                        defaultSelected={defaultGroups}
                      />
                    )}
                  </Field>
                </Grid>
              )}
            </Grid>

            <Button loading={loading} disabled={loading} onClick={handleSubmit}>
              <FormattedMessage id="register" />
            </Button>
          </Form>
        </ScrollArea>
      </section>
    </Fragment>
  );
};

const useStyles = makeStyles((theme) => ({
  ...getSectionHeaderStyles(theme),
  ...getPageStyles(theme),
  ...getTypographyStyles(theme),
}));
